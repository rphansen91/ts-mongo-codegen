import {
  ArgumentNode,
  buildSchema,
  DirectiveNode,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLSchema,
  StringValueNode,
  FieldDefinitionNode,
} from 'graphql'
import capitalize from 'lodash/capitalize'
import get from 'lodash/fp/get'
import last from 'lodash/last'
import mapValues from 'lodash/mapValues'
import { mongoTypeDefs } from './mongo-types'

export type AugmentConfig = {
  name?: string
}

function hasCollectionComment(str: string) {
  const match = str.match(/@collection\(name: ?"(\w+)"\) (@crud)/)
  if (!match) return null
  return {
    name: match[1],
    crud: Boolean(match[2]),
  }
}

export function findDirective(name: string, type: GraphQLNamedType) {
  return type?.astNode?.directives?.find?.((d) => d.name.value === name)
}

export function findDirectiveOption(name: string, directive: DirectiveNode | undefined) {
  return directive?.arguments?.find?.((d) => d.name.value === name)
}
export function findArgumentValue(argument: ArgumentNode | undefined) {
  return (argument?.value as StringValueNode)?.value
}

export type CollectionMap = ReturnType<typeof directiveTypeMap>
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

export function pluralize(str: string) {
  if (last(str) === 's') return str
  return `${str}s`
}

export type MongoTypeMap = ReturnType<typeof buildMongoTypeMap>
export function buildMongoTypeMap(schema: GraphQLSchema, config?: AugmentConfig) {
  const collectionMap = directiveTypeMap(schema, 'collection')
  const [pageSchemaMap, pageTypeMap] = buildPageMap({ collectionMap })
  const [filterSchemaMap, filterTypeMap] = buildFieldMap(
    'filter',
    { collectionMap },
    geFieldFilterValue
  )
  const [insertSchemaMap, insertTypeMap] = buildFieldMap('insert', { collectionMap })
  const [unsetSchemaMap, unsetTypeMap] = buildFieldMap('unset', { collectionMap })
  const [setSchemaMap, setTypeMap] = buildFieldMap('set', { collectionMap })
  const [incSchemaMap, incTypeMap] = buildFieldMap('inc', { collectionMap })
  const [decSchemaMap, decTypeMap] = buildFieldMap('dec', { collectionMap })
  return {
    collectionMap,
    pageSchemaMap,
    filterSchemaMap,
    insertSchemaMap,
    unsetSchemaMap,
    setSchemaMap,
    incSchemaMap,
    decSchemaMap,
    pageTypeMap,
    filterTypeMap,
    insertTypeMap,
    unsetTypeMap,
    setTypeMap,
    incTypeMap,
    decTypeMap,
  }
}

export type CollectionMongoTypes = ReturnType<typeof getCollectionMongoTypes>
export function getCollectionMongoTypes(mongoTypeMap: MongoTypeMap, type: string) {
  return {
    collection: mongoTypeMap.collectionMap[type],
    pageSchema: mongoTypeMap.pageSchemaMap[type],
    filterSchema: mongoTypeMap.filterSchemaMap[type],
    insertSchema: mongoTypeMap.insertSchemaMap[type],
    unsetSchema: mongoTypeMap.unsetSchemaMap[type],
    setSchema: mongoTypeMap.setSchemaMap[type],
    incSchema: mongoTypeMap.incSchemaMap[type],
    decSchema: mongoTypeMap.decSchemaMap[type],
    pageType: mongoTypeMap.pageTypeMap[type],
    filterType: mongoTypeMap.filterTypeMap[type],
    insertType: mongoTypeMap.insertTypeMap[type],
    unsetType: mongoTypeMap.unsetTypeMap[type],
    setType: mongoTypeMap.setTypeMap[type],
    incType: mongoTypeMap.incTypeMap[type],
    decType: mongoTypeMap.decTypeMap[type],
  }
}

export function buildPageMap({ collectionMap }: { collectionMap: CollectionMap }) {
  const types = mapValues(collectionMap, (collection, name) => {
    return new GraphQLObjectType({
      name: `${name}Page`,
      fields: {
        total: {
          type: GraphQLInt,
        },
        data: {
          type: new GraphQLList(collection),
        },
      },
    })
  })
  const schemas = mapValues(types, (type, name) => {
    return new GraphQLSchema({
      types: [type],
      query: new GraphQLObjectType({ name: 'Query', fields: {} }),
    })
  })
  return tuple(schemas, types)
}

const getFieldValueDefault = get('type.name.value') as (v: FieldDefinitionNode) => string
export function buildFieldMap(
  type: string,
  { collectionMap }: { collectionMap: CollectionMap },
  getFieldValue = getFieldValueDefault
) {
  const schemas = mapValues(collectionMap, (collection, name) => {
    const fields = collection.astNode?.fields?.filter((field) => {
      return field.directives?.find((d) => d.name.value === type)
    })
    const types = fields?.map((field) => `${field.name.value}: ${getFieldValue(field)}`).join('\n')
    if (!types?.length) return null
    return buildSchema(`
    ${mongoTypeDefs.loc?.source?.body}
    input ${name}${capitalize(type)} {
      ${types}
    }`)
  })
  const types = mapValues(schemas, (schema, name) => {
    if (!schema) return null
    return schema.getType(`${name}${capitalize(type)}`) as GraphQLInputObjectType
  })
  return tuple(schemas, types)
}

function geFieldFilterValue(field: FieldDefinitionNode) {
  const value = getFieldValueDefault(field)
  switch (value) {
    case 'String':
      return 'StringFilter'
    case 'Int':
      return 'IntFilter'
    case 'Float':
      return 'FloatFilter'
    case 'Date':
      return 'DateFilter'
    case 'ObjectId':
      return 'ObjectIdFilter'
    default:
      return value
  }
}

export function tuple<A, B>(a: A, b: B) {
  return [a, b] as [A, B]
}

export function gqlTypeToTypescript(type: GraphQLInputObjectType | null) {
  const fields = type?.getFields?.() ?? {}
  return `{ ${Object.keys(fields)
    .map((k) => `${k}?: ${gqlScalarToTypescript(fields[k].type.toString())}`)
    .join(', ')} }`
}

export function gqlTypeToTypescriptUnset(type: GraphQLInputObjectType | null) {
  const fields = type?.getFields?.() ?? {}
  return `{ ${Object.keys(fields)
    .map((k) => `${k}?: 1`)
    .join(', ')} }`
}

function gqlScalarToTypescript(type: string) {
  switch (type) {
    case 'String':
      return 'string'
    case 'StringFilter':
      return '{ EQ?: string; GT?: string; GTE?: string; IN?: string[]; ALL?: string[]; LT?: string; LTE?: string; NE?: string; NIN?: string[]; }'
    case 'Float':
    case 'Int':
      return 'number'
    case 'FloatFilter':
    case 'IntFilter':
      return '{ EQ?: number; GT?: number; GTE?: number; IN?: number[]; ALL?: number[]; LT?: number; LTE?: number; NE?: number; NIN?: number[]; }'
    case 'DateFilter':
      return '{ EQ?: Date; GT?: Date; GTE?: Date; IN?: Date[]; ALL?: Date[]; LT?: Date; LTE?: Date; NE?: Date; NIN?: Date[]; }'
    case 'Boolean':
      return 'boolean'
    case 'ObjectId':
      return 'ObjectID'
    case 'ObjectIdFilter':
      return '{ EQ: ObjectID; GT: ObjectID; GTE: ObjectID; IN: ObjectID[]; ALL: ObjectID[]; LT: ObjectID; LTE: ObjectID; NE: ObjectID; NIN: ObjectID[]; }'
    default:
      return type
  }
}
