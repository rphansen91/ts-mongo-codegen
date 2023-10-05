import { ObjectId, MongoClient, MongoClientOptions, FindCursor } from 'mongodb'

export interface IPagination {
  perPage?: number | null
  page?: number | null
}

export interface ISort {
  field?: string | null
  order?: number | null
}

export interface ITextSearch {
  search?: string | null
  language?: string | null
  caseSensitive?: boolean | null
  diacriticSensitive?: boolean | null
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
  NIN: '$nin',
  TEXT: '$text',
  SEARCH: '$search',
  REGEX: '$regex',
  OPTIONS: '$options',
  OR: '$or',
}

const graphqlToMongoUpdateMap = {
  UNSET: '$unset',
  SET: '$set',
  INC: '$inc',
  DEC: '$dec',
}

const graphqlToMongoTextSearchMap = {
  search: '$search',
  language: '$language',
  caseSensitive: '$caseSensitive',
  diacriticSensitive: '$diacriticSensitive',
}

let mongo: MongoClient
let promise: Promise<MongoClient>

export async function mongoConnect(uri: string, options?: MongoClientOptions) {
  if (mongo) return mongo
  promise = new MongoClient(uri, options).connect()
  mongo = await promise
  return mongo
}

export const mapTextSearchToMongo = deepFieldTransform((key: string) => {
  return (graphqlToMongoTextSearchMap as any)[key] || key
})

export const mapFilterToMongo = deepFieldTransform((key: string) => {
  return (graphqlToMongoFilterMap as any)[key] || key
})

export const mapUpdateToMongo = deepFieldTransform((key: string) => {
  return (graphqlToMongoUpdateMap as any)[key] || key
})

export function paginateCursor(
  cursor: FindCursor,
  { pagination, sort }: { pagination?: IPagination | null; sort?: ISort | null }
) {
  if (sort && sort.field) {
    cursor = cursor.sort(sort.field, sort.order === -1 ? 'desc' : 'asc')
  }
  if (pagination && pagination.perPage && pagination.page) {
    cursor = cursor.skip(Math.max(pagination.page - 1, 0) * pagination.perPage)
  }
  if (pagination && pagination.perPage) {
    cursor = cursor.limit(pagination.perPage)
  }
  return cursor
}

function deepFieldTransform(fn: (key: string) => string) {
  return function t(value: any): any {
    if (!value) return value
    if (Array.isArray(value)) return value.map((v) => t(v))
    if (typeof value !== 'object') return value
    if (value instanceof Date) return value
    if (value instanceof ObjectId) return value
    return Object.keys(value || {}).reduce((acc: any, key) => {
      acc[fn(key)] = t(value[key])
      return acc
    }, {})
  }
}
