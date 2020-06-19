import {
  plugin,
  addToSchema,
  mapFilterToMongo,
  mapUpdateToMongo,
  graphqlTypeObjectId,
  graphqlTypeDate
} from '../src/ts-mongo-codegen'
import { buildSchema, astFromValue, ValueNode } from 'graphql'
import { ObjectID } from 'mongodb'

describe('TS Mongo Codegen', () => {
  it('Should convert to mongo filter', () => {
    expect(
      mapFilterToMongo({
        EQ: '$eq',
        GT: '$gt',
        GTE: '$gte',
        IN: ['1'],
        ALL: ['1', '2'],
        LT: '$lt',
        LTE: '$lte',
        NE: '$ne',
        NIN: ['1'],
        TEXT: {
          SEARCH: 'hello'
        }
      })
    ).toEqual({
      $eq: '$eq',
      $gt: '$gt',
      $gte: '$gte',
      $in: ['1'],
      $all: ['1', '2'],
      $lt: '$lt',
      $lte: '$lte',
      $ne: '$ne',
      $nin: ['1'],
      $text: {
        $search: 'hello'
      }
    })
  })

  it('Should convert to mongo update', () => {
    expect(
      mapUpdateToMongo({
        UNSET: {
          a: ''
        },
        SET: {
          a: 'b'
        },
        INC: { count: 1 },
        DEC: { count: 1 }
      })
    ).toEqual({
      $unset: {
        a: ''
      },
      $set: {
        a: 'b'
      },
      $inc: { count: 1 },
      $dec: { count: 1 }
    })
  })

  it('Should implement ObjectID Scalar', () => {
    const id = new ObjectID()
    const idSerialized = id.toHexString()
    const astValue = astFromValue(id, graphqlTypeObjectId) as ValueNode
    expect(graphqlTypeObjectId.parseLiteral(astValue, {})).toBeInstanceOf(ObjectID)
    expect(graphqlTypeObjectId.parseValue(idSerialized)).toBeInstanceOf(ObjectID)
    expect(graphqlTypeObjectId.serialize(id)).toBe(idSerialized)
  })

  it('Should implement Date Scalar', () => {
    const date = new Date()
    const dateSerialized = date.toISOString()
    const astValue = astFromValue(date, graphqlTypeDate) as ValueNode
    expect(graphqlTypeDate.parseLiteral(astValue, {})).toBeInstanceOf(Date)
    expect(graphqlTypeDate.parseValue(dateSerialized)).toBeInstanceOf(Date)
    expect(graphqlTypeDate.serialize(date)).toBe(dateSerialized)
  })
  it('Should parse date without ISOString', () => {
    const date = new Date()
    const dateSerialized = date.toString()
    expect(graphqlTypeDate.serialize({ toString: () => dateSerialized })).toBe(dateSerialized)
  })

  it('Should build collection types', () => {
    const schema = buildSchema(`
  ${addToSchema.loc?.source?.body}

  type Token {
    expiration: Int
    value: String
  }

  type User @collection(name: "user") {
    id: ObjectId
    token: Token
  }    
`)
    expect(plugin(schema, [], {})).toBe(`import { Db, Collection } from 'mongodb'

export type IUserCollection = Collection<User>
export const getUserCollection = (db: Db) => db.collection<User>('user')

export function mongoCollectionFactory (db: Db) {
  const user = getUserCollection(db)

  return {
    user
  }
}`)
  })
})
