import { GraphQLNamedType, GraphQLSchema, DirectiveNode, GraphQLObjectType } from 'graphql'

export function findDirective(name: string, type: GraphQLNamedType) {
  return type?.astNode?.directives?.find?.(d => d.name.value === name)
}

export function directiveTypeMap(schema: GraphQLSchema, name: string) {
  const typesMap = schema.getTypeMap()
  return Object.keys(typesMap).reduce((acc, typeName: string) => {
    const type = typesMap[typeName]
    const collection = findDirective(name, type)
    if (!collection) return acc
    acc[typeName] = type as GraphQLObjectType
    return acc
  }, {} as { [key: string]: GraphQLObjectType })
}

export function isDirectiveNode(v: any): v is DirectiveNode {
  return Boolean(v)
}
