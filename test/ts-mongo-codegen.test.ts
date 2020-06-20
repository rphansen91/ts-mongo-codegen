import {
  plugin,
  addToSchema,
  mapFilterToMongo,
  mapUpdateToMongo,
  graphqlTypeObjectId,
  graphqlTypeDate
} from '../src/ts-mongo-codegen'
import { print, buildSchema, astFromValue, ValueNode, printSchema } from 'graphql'
import { ObjectID } from 'mongodb'
import { makeAugmentedSchema } from '../src/mongo-augment'

const schema = buildSchema(`
  ${addToSchema.loc?.source?.body}

  type Token {
    expiration: Int
    value: String
  }

  type User @collection(name: "user") {
    id: ObjectId
    # token: Token @insert @set @unset
    email: String @insert @set @unset @filter
  }

  type Query {
    root: String
  }

  type Mutation {
    root: String
  }
`)

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

  it('Should build crud operations', () => {
    const augmented = makeAugmentedSchema(schema, {})
    const printed = printSchema(augmented)
    expect(printed).toBe(`directive @collection(name: String!) on OBJECT

directive @filter on FIELD_DEFINITION

directive @insert on FIELD_DEFINITION

directive @update on FIELD_DEFINITION

directive @unset on FIELD_DEFINITION

directive @set on FIELD_DEFINITION

directive @inc on FIELD_DEFINITION

directive @dec on FIELD_DEFINITION

scalar Date

input DateFilter {
  EQ: Date
  GT: Date
  GTE: Date
  IN: [Date]
  ALL: [Date]
  LT: Date
  LTE: Date
  NE: Date
  NIN: [Date]
}

input FloatFilter {
  EQ: Float
  GT: Float
  GTE: Float
  IN: [Float]
  ALL: [Float]
  LT: Float
  LTE: Float
  NE: Float
  NIN: [Float]
}

input IntFilter {
  EQ: Int
  GT: Int
  GTE: Int
  IN: [Int]
  ALL: [Int]
  LT: Int
  LTE: Int
  NE: Int
  NIN: [Int]
}

type Mutation {
  root: String
  insertUser(user: UserInsert!): User
  insertManyUsers(users: [UserInsert!]!): [User]
  updateUser(id: ObjectId!, userUnset: UserUnset, userSet: UserSet): User
  updateManyUsers(ids: [ObjectId!]!, userUnset: UserUnset, userSet: UserSet): [User]
  removeUser(id: ObjectId!): User
  removeManyUsers(ids: [ObjectId!]!): [User]
}

scalar ObjectId

input ObjectIdFilter {
  EQ: ObjectId
  GT: ObjectId
  GTE: ObjectId
  IN: [ObjectId]
  ALL: [ObjectId]
  LT: ObjectId
  LTE: ObjectId
  NE: ObjectId
  NIN: [ObjectId]
}

input Pagination {
  perPage: Int
  page: Int
}

type Query {
  root: String
  findUsers(pagination: Pagination, sort: Sort, filter: UserFilter): UserPage!
  findUserById(id: ObjectId!): User
  findUsersByIds(ids: [ObjectId!]!): [User]
}

input Sort {
  field: String
  order: Int
}

input StringFilter {
  EQ: String
  GT: String
  GTE: String
  IN: [String]
  ALL: [String]
  LT: String
  LTE: String
  NE: String
  NIN: [String]
}

type Token {
  expiration: Int
  value: String
}

type User {
  id: ObjectId
  email: String
}

input UserFilter {
  email: String
}

input UserInsert {
  email: String
}

type UserPage {
  total: Int
  data: [User]
}

input UserSet {
  email: String
}

input UserUnset {
  email: String
}
`)
  })

  it('Should build collection types', () => {
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
