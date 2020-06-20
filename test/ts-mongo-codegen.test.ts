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

const bookSchema = buildSchema(`
${addToSchema.loc?.source?.body}

type Book @collection(name: "books") {
  id: ObjectId
  title: String @insert @set @unset @filter
  author: String @insert @set @unset @filter
}

type Query {
  root: String
}

type Mutation {
  root: String
}
`)
const schema = buildSchema(`
  ${addToSchema.loc?.source?.body}

  type User @collection(name: "user") {
    id: ObjectId
    email: String @insert @set @unset @filter
    username: String @insert @set @unset @filter
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

  it('Should build crud operations for book', () => {
    const augmented = makeAugmentedSchema(bookSchema, {})
    const printed = printSchema(augmented)
    expect(printed).toMatchSnapshot('booksAugmentedSchema')
  })

  it('Should build crud operations', () => {
    const augmented = makeAugmentedSchema(schema, {})
    const printed = printSchema(augmented)
    expect(printed).toMatchSnapshot('usersAugmentedSchema')
  })

  it('Should build collection types', () => {
    expect(plugin(schema, [], {})).toMatchSnapshot('collectionTypes')
  })
})
