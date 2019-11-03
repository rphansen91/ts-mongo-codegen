import { ObjectID } from 'mongodb'
import { GraphQLScalarType, Kind } from 'graphql'

export const graphqlTypeObjectId = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'Mongo Object Id',
  parseValue(value) {
    return new ObjectID(value)
  },
  serialize(value) {
    return value.toString() // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new ObjectID(ast.value)
    }
    return null
  }
})
