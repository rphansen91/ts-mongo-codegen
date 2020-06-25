const { ApolloServer, addResolveFunctionsToSchema } = require('apollo-server')
const { buildSchema } = require('graphql')
const { mergeSchemas } = require('@graphql-tools/merge')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { mongoConnect } = require('../src/mongo')
const { mongoTypeDefs } = require('../src/mongo-types')
const { graphqlTypeObjectId, graphqlTypeDate } = require('../src/mongo-scalars')
const { makeAugmentedSchema } = require('../src/mongo-augment')
const { authorResolvers, bookResolvers, authorQueryResolvers, bookQueryResolvers, authorMutationResolvers, bookMutationResolvers, mongoCollectionFactory } = require('./example-types')

const gql = require('graphql-tag')

const bookType = gql`
  type Author @collection(name: "authors", crud: true) {
    id: ObjectId
    name: String @insert @set @unset @filter
  }

  type Book @collection(name: "books", crud: true) {
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
`
const schema = makeAugmentedSchema(
  makeExecutableSchema({
    typeDefs: [mongoTypeDefs, bookType],
  })
)
addResolveFunctionsToSchema({
  schema,
  resolvers: {
    ObjectId: graphqlTypeObjectId,
    Date: graphqlTypeDate,
    Book: bookResolvers,
    Author: authorResolvers,
    Query: {
      ...bookQueryResolvers,
      ...authorQueryResolvers
    },
    Mutation: {
      ...bookMutationResolvers,
      ...authorMutationResolvers
    },
  },
})
const context = async () => {
  const db = (await mongoConnect('mongodb://localhost:27017')).db('test')
  return mongoCollectionFactory(db)
}
const port = 6060

new ApolloServer({
  schema,
  context,
  playground: true,
})
  .listen(port)
  .then(({ url }: any) => {
    console.log('Listening at', url)
  })
  .catch((e: any) => {
    console.log('Error', e)
  })
