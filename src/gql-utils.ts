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
  printSchema,
} from 'graphql'
import capitalize from 'lodash/capitalize'
import last from 'lodash/last'
import mapValues from 'lodash/mapValues'

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
    { collectionMap, schema },
    geFieldFilterValue
  )
  const [textsearchSchemaMap, textsearchTypeMap] = buildFieldMap(
    'textsearch',
    { collectionMap, schema },
    geFieldFilterValue
  )
  const [insertSchemaMap, insertTypeMap] = buildFieldMap('insert', { collectionMap, schema })
  const [unsetSchemaMap, unsetTypeMap] = buildFieldMap('unset', { collectionMap, schema })
  const [setSchemaMap, setTypeMap] = buildFieldMap('set', { collectionMap, schema })
  const [incSchemaMap, incTypeMap] = buildFieldMap('inc', { collectionMap, schema })
  const [decSchemaMap, decTypeMap] = buildFieldMap('dec', { collectionMap, schema })
  return {
    collectionMap,
    pageSchemaMap,
    filterSchemaMap,
    textsearchSchemaMap,
    insertSchemaMap,
    unsetSchemaMap,
    setSchemaMap,
    incSchemaMap,
    decSchemaMap,
    pageTypeMap,
    filterTypeMap,
    textsearchTypeMap,
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
    textsearchSchema: mongoTypeMap.textsearchSchemaMap[type],
    insertSchema: mongoTypeMap.insertSchemaMap[type],
    unsetSchema: mongoTypeMap.unsetSchemaMap[type],
    setSchema: mongoTypeMap.setSchemaMap[type],
    incSchema: mongoTypeMap.incSchemaMap[type],
    decSchema: mongoTypeMap.decSchemaMap[type],
    pageType: mongoTypeMap.pageTypeMap[type],
    filterType: mongoTypeMap.filterTypeMap[type],
    textsearchType: mongoTypeMap.textsearchTypeMap[type],
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

const getFieldValueDefault = (field: FieldDefinitionNode): string => {
  if (field?.type?.kind === 'ListType') return `[${getFieldValueDefault(field.type as any)}]`
  return (field?.type as any)?.name?.value
}
export function buildFieldMap(
  type: string,
  { collectionMap, schema }: { collectionMap: CollectionMap; schema: GraphQLSchema },
  getFieldValue = getFieldValueDefault
) {
  const schemas = mapValues(collectionMap, (collection, name) => {
    const fields = collection.astNode?.fields?.filter((field) => {
      return field.directives?.find((d) => d.name.value === type)
    })
    const types = fields?.map((field) => `${field.name.value}: ${getFieldValue(field)}`).join('\n')
    if (!types?.length) return null
    return buildSchema(`
    ${printSchema(schema)}
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

function geFieldFilterValue(field: FieldDefinitionNode): string {
  if (field?.type?.kind === 'ListType') return geFieldFilterValue(field.type as any)
  const value = getFieldValueDefault(field)
  return `${value}Filter`
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

function gqlScalarToTypescript(type: string): string {
  const listType = type.match(/\[([a-zA-Z!]+)\]/)
  const filterType = type.match(/([a-zA-Z]+)Filter!?$/)
  if (listType) return `${gqlScalarToTypescript(listType[1])}[]`
  if (filterType) return gqlScalarToFilter(gqlScalarToTypescript(filterType[1]))
  switch (type.replace(/!$/, '')) {
    case 'String':
      return 'string'
    case 'Float':
    case 'Int':
      return 'number'
    case 'Boolean':
      return 'boolean'
    case 'ObjectId':
      return 'ObjectID'
    default:
      return type.replace(/!$/, '')
  }
}

function gqlScalarToFilter(type: string) {
  return `{ EQ?: ${type}; GT?: ${type}; GTE?: ${type}; IN?: ${type}[]; ALL?: ${type}[]; LT?: ${type}; LTE?: ${type}; NE?: ${type}; NIN?: ${type}[]; }`
}
