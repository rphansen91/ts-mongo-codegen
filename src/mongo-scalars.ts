import { ObjectId } from 'mongodb'
import { GraphQLScalarType, Kind } from 'graphql'

export const graphqlTypeObjectId = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'Mongo Object Id',
  parseValue(value) {
    return new ObjectId(value as string)
  },
  serialize(value) {
    return (value as string).toString() // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value)
    }
    return null
  },
})

export const graphqlTypeDate = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue(value) {
    if (!value) return null
    return new Date(value as string) // value from the client
  },
  serialize(value) {
    if (value instanceof Date) return value.toISOString()
    if (value && value.toString) return value.toString()
    return null // value sent to the client
  },
  parseLiteral(ast) {
    // if (ast.kind === Kind.INT) {
    //   return new Date(ast.value) // ast value is always in string format
    // }
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value) // ast value is always in string format
    }
    return null
  },
})
