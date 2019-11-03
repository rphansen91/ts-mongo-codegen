import { MongoClient, Cursor } from 'mongodb'

interface IPagination {
  perPage?: number | null
  page?: number | null
}

interface ISort {
  field?: string | null
  order?: number | null
}

const graphqlToMongoFilterMap = {
  EQ: '$eq',
  GT: '$gt',
  GTE: '$gte',
  IN: '$in',
  ALL: '$all',
  LT: '$lt',
  LTE: '$lte',
  NE: '$ne',
  NIN: '$nin'
}

const graphqlToMongoUpdateMap = {
  SET: '$set',
  INC: '$inc',
  DEC: '$dec'
}

let mongo: MongoClient
let promise: Promise<MongoClient>

export async function mongoConnect(uri: string) {
  if (mongo && mongo.isConnected()) return mongo
  promise = MongoClient.connect(uri)
  mongo = await promise
  return mongo
}

export const mapFilterToMongo = deepFieldTransform((key: string) => {
  return (graphqlToMongoFilterMap as any)[key] || key
})

export const mapUpdateToMongo = deepFieldTransform((key: string) => {
  return (graphqlToMongoUpdateMap as any)[key] || key
})

export async function paginateCursor (cursor: Cursor, { pagination, sort }: { pagination: IPagination, sort: ISort }) {
  if (sort && sort.field) {
      cursor = cursor.sort({
        [sort.field]: sort.order || 1
      })
  }
  if (pagination && pagination.perPage && pagination.page) {
    cursor = cursor.skip(pagination.page * pagination.perPage)
  }
  if (pagination && pagination.perPage) {
    cursor = cursor.limit(pagination.perPage)
  }
  return cursor.toArray()
}

function deepFieldTransform(fn: (key: string) => string) {
  return function t(value: any): any {
    if (!value) return value
    if (Array.isArray(value)) return value.map(v => t(v))
    if (typeof value !== 'object') return value
    if (value instanceof Date) return value
    return Object.keys(value || {}).reduce((acc: any, key) => {
      acc[fn(key)] = t(value[key])
      return acc
    }, {})
  }
}
