import { ApolloServer } from 'apollo-server'
import { buildSchema, defaultFieldResolver, GraphQLSchema } from 'graphql'
import { mergeSchemas, makeExecutableSchema } from '@graphql-tools/schema'
import { mongoConnect } from '../src/mongo'
import { mongoTypeDefs } from '../src/mongo-types'
import { graphqlTypeObjectId, graphqlTypeDate } from '../src/mongo-scalars'
import { makeAugmentedSchema } from '../src/mongo-augment'
import {
  authorResolvers,
  bookResolvers,
  authorQueryResolvers,
  bookQueryResolvers,
  authorMutationResolvers,
  bookMutationResolvers,
  mongoCollectionFactory,
} from './example-types'
import { mapSchema, MapperKind, getDirectives } from '@graphql-tools/utils'

import gql from 'graphql-tag'

export const authDirectiveTransformer = (schema: GraphQLSchema) =>
  mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (config) => {
      const directives = getDirectives(schema, config)
      const authDirective = directives.find(v => v.name === 'auth')
      if (authDirective) {
        const { resolve = defaultFieldResolver } = config
        config.description = [config.description]
          .concat('Must be authenticated')
          .filter((v) => v)
          .join('\n')
        config.resolve = async function (p: any, a: any, c: any, i: any) {
          if (!c.userId) throw new Error('Must be authenticated')
          return resolve(p, a, c, i)
        }
        return config
      }
      return config
    },
  })

const bookType = gql`
  directive @auth on FIELD_DEFINITION
  enum Category {
    drama
    comedy
  }

  input CategoryFilter {
    EQ: Category
    GT: Category
    GTE: Category
    IN: [Category]
    ALL: [Category]
    LT: Category
    LTE: Category
    NE: Category
    NIN: [Category]
  }

  type Author @collection(name: "authors", crud: true) {
    id: ObjectId
    name: String @insert @set @unset @filter
  }

  type Book @collection(name: "books", crud: true) {
    id: ObjectId
    title: String @insert @set @unset @filter @textsearch
    author: String @insert @set @unset @filter @textsearch
    tags: [String] @insert @set @unset @filter
    category: Category @insert @set @unset @filter
  }

  type Query {
    root: String @auth
  }

  type Mutation {
    root: String
  }
`

const resolvers = {
  Query: {
    root: () => '',
    ...bookQueryResolvers,
    ...authorQueryResolvers,
  },
  Mutation: {
    root: () => '',
    ...bookMutationResolvers,
    ...authorMutationResolvers,
  },
  Book: bookResolvers,
  Author: authorResolvers
}


const schema = makeExecutableSchema({
  resolverValidationOptions: {
    requireResolversToMatchSchema: 'ignore',
  },
  typeDefs: [mongoTypeDefs, bookType],
  // schemaTransforms: [authDirectiveTransformer],
  resolvers,
})

const augmented = makeAugmentedSchema({
  schema,
  resolvers,
})

const context = async (req: any) => {
  const userId = req?.headers?.['x-auth-token'] ?? ''
  const db = (await mongoConnect('mongodb://localhost:27017')).db('test')
  const collections = await mongoCollectionFactory(db)
  return {
    userId,
    ...collections
  }
}
const port = 6060

new ApolloServer({
  schema: augmented,
  context,
})
  .listen(port)
  .then(({ url }: any) => {
    console.log('Listening at', url)
  })
  .catch((e: any) => {
    console.log('Error', e)
  })
