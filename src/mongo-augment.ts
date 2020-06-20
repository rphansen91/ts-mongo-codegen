import {
  GraphQLSchema,
  Kind,
  print,
  DefinitionNode,
  GraphQLObjectType,
  DirectiveNode,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
  buildSchema,
  buildASTSchema,
  GraphQLNamedType,
  printSchema,
  GraphQLInt,
  isSchema,
} from 'graphql'
import { makeExecutableSchema, IExecutableSchemaDefinition } from '@graphql-tools/schema'
import { mapSchema, MapperKind, ObjectTypeMapper } from '@graphql-tools/utils'
import { mergeType, mergeGraphQLTypes, mergeSchemas } from '@graphql-tools/merge'
import { directiveTypeMap } from './gql-utils'
import values from 'lodash/values'
import capitalize from 'lodash/capitalize'
import merge from 'lodash/merge'
import last from 'lodash/last'
import mapValues from 'lodash/mapValues'
import first from 'lodash/first'
import get from 'lodash/fp/get'
import { graphqlTypeObjectId } from './mongo-scalars'
import { camelCase, isNull, negate } from 'lodash'
import gql from 'graphql-tag'

type AugmentConfig = {
  name?: string
}

export const augmentResolvers = ({
  resolvers,
  config,
}: {
  resolvers: any
  config: AugmentConfig
}) => {
  return resolvers
}

export const makeAugmentedSchema = (schema: GraphQLSchema, config?: AugmentConfig) => {
  const collectionMap = directiveTypeMap(schema, 'collection')
  const [pageMapSchemas, pageMapTypes] = buildPageMap({ collectionMap })
  const [filterMapSchemas, filterMapTypes] = buildFieldMap('filter', { collectionMap })
  const [insertMapSchemas, insertMapTypes] = buildFieldMap('insert', { collectionMap })
  const [updateMapSchemas, updateMapTypes] = buildFieldMap('update', { collectionMap })
  const [unsetMapSchemas, unsetMapTypes] = buildFieldMap('unset', { collectionMap })
  const [setMapSchemas, setMapTypes] = buildFieldMap('set', { collectionMap })
  const [incMapSchemas, incMapTypes] = buildFieldMap('inc', { collectionMap })
  const [decMapSchemas, decMapTypes] = buildFieldMap('dec', { collectionMap })
  // const resolvers = extractResolversFromSchema(schema)
  // const augmentedResolvers = augmentResolvers({
  //   resolvers,
  //   config
  // })
  return mapSchema(
    mergeSchemas({
      typeDefs: [],
      schemas: [
        schema,
        ...values(pageMapSchemas).filter(isSchema),
        ...values(filterMapSchemas).filter(isSchema),
        ...values(insertMapSchemas).filter(isSchema),
        ...values(updateMapSchemas).filter(isSchema),
        ...values(unsetMapSchemas).filter(isSchema),
        ...values(setMapSchemas).filter(isSchema),
        ...values(incMapSchemas).filter(isSchema),
        ...values(decMapSchemas).filter(isSchema),
      ],
    }),
    {
      [MapperKind.QUERY]: appendCrudQueryMapper({ collectionMap, filterMapTypes, pageMapTypes }),
      [MapperKind.MUTATION]: appendCrudMutationMapper({
        collectionMap,
        insertMapTypes,
        updateMapTypes,
        unsetMapTypes,
        setMapTypes,
        incMapTypes,
        decMapTypes,
      }),
    }
  )
  // return makeExecutableSchema({
  //   typeDefs: augmentedTypeDefs,
  //   resolvers: augmentedResolvers,
  //   // schemaDirectives: augmentedDirectives,
  //   resolverValidationOptions: {
  //     requireResolversForResolveType: false
  //   }
  // })
}

type CollectionMap = ReturnType<typeof directiveTypeMap>
function tuple<A, B>(a: A, b: B) {
  return [a, b] as [A, B]
}

const buildPageMap = ({ collectionMap }: { collectionMap: CollectionMap }) => {
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
const buildFieldMap = (type: string, { collectionMap }: { collectionMap: CollectionMap }) => {
  const schemas = mapValues(collectionMap, (collection, name) => {
    const fields = collection.astNode?.fields?.filter((field) => {
      return field.directives?.find((d) => d.name.value === type)
    })
    const types = fields
      ?.map((field) => `${field.name.value}: ${get('type.name.value', field)}`)
      .join('\n')
    if (!types?.length) return null
    return buildSchema(`input ${name}${capitalize(type)} {
      ${types}
    }`)
  })
  const types = mapValues(schemas, (schema, name) => {
    if (!schema) return null
    return schema.getType(`${name}${capitalize(type)}`) as GraphQLInputObjectType
  })
  return tuple(schemas, types)
}

const appendCrudQueryMapper = ({
  collectionMap,
  filterMapTypes,
  pageMapTypes,
}: {
  collectionMap: CollectionMap
  pageMapTypes: { [x: string]: GraphQLObjectType }
  filterMapTypes: { [x: string]: GraphQLInputObjectType | null }
}): ObjectTypeMapper => (type: GraphQLObjectType, schema: GraphQLSchema) => {
  const config = type.toConfig()
  const pagination = schema.getType('Pagination') as GraphQLInputObjectType
  const sort = schema.getType('Sort') as GraphQLInputObjectType
  const appendFields = Object.keys(collectionMap)
    .map((name) => {
      const collection = collectionMap[name]
      const find = {
        type: new GraphQLNonNull(pageMapTypes[name]),
        args: {
          pagination: {
            type: pagination,
          },
          sort: {
            type: sort,
          },
        } as any,
      }
      if (filterMapTypes[name]) {
        find.args.filter = {
          type: filterMapTypes[name],
        }
      }
      const findById = {
        type: collection,
        args: {
          id: {
            type: new GraphQLNonNull(graphqlTypeObjectId),
          },
        },
      }
      const findByIds = {
        type: new GraphQLList(collection),
        args: {
          ids: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(graphqlTypeObjectId))),
          },
        },
      }
      return {
        [`find${pluralize(name)}`]: find,
        [`find${name}ById`]: findById,
        [`find${pluralize(name)}ByIds`]: findByIds,
      }
    })
    .reduce((acc, fields) => ({ ...acc, ...fields }), {})
  return new GraphQLObjectType({
    ...config,
    fields: {
      ...config.fields,
      ...appendFields,
    },
  })
}

const appendCrudMutationMapper = ({
  collectionMap,
  insertMapTypes,
  updateMapTypes,
  unsetMapTypes,
  setMapTypes,
  incMapTypes,
  decMapTypes,
}: {
  collectionMap: CollectionMap
  insertMapTypes: { [x: string]: GraphQLInputObjectType | null }
  updateMapTypes: { [x: string]: GraphQLInputObjectType | null }
  unsetMapTypes: { [x: string]: GraphQLInputObjectType | null }
  setMapTypes: { [x: string]: GraphQLInputObjectType | null }
  incMapTypes: { [x: string]: GraphQLInputObjectType | null }
  decMapTypes: { [x: string]: GraphQLInputObjectType | null }
}): ObjectTypeMapper => (type: GraphQLObjectType, schema: GraphQLSchema) => {
  const config = type.toConfig()
  const appendFields = Object.keys(collectionMap)
    .map((name) => {
      const collection = collectionMap[name]
      const mutations: { [x: string]: any } = {}
      const insertType = insertMapTypes[name]
      const unsetType = unsetMapTypes[name]
      const setType = setMapTypes[name]
      const incType = incMapTypes[name]
      const decType = decMapTypes[name]
      if (insertType) {
        mutations[`insert${name}`] = {
          type: collection,
          args: {
            [camelCase(name)]: {
              type: new GraphQLNonNull(insertType),
            },
          },
        }
        mutations[`insertMany${pluralize(name)}`] = {
          type: new GraphQLList(collection),
          args: {
            [pluralize(camelCase(name))]: {
              type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(insertType))),
            },
          },
        }
      }
      if (unsetType || setType || incType || decType) {
        const updateArgs: { [x: string]: any } = {}
        if (unsetType) updateArgs[`${camelCase(name)}Unset`] = { type: unsetType }
        if (setType) updateArgs[`${camelCase(name)}Set`] = { type: setType }
        if (incType) updateArgs[`${camelCase(name)}Inc`] = { type: incType }
        if (decType) updateArgs[`${camelCase(name)}Dec`] = { type: decType }
        mutations[`update${name}`] = {
          type: collection,
          args: {
            id: {
              type: new GraphQLNonNull(graphqlTypeObjectId),
            },
            ...updateArgs,
          },
        }
        mutations[`updateMany${pluralize(name)}`] = {
          type: new GraphQLList(collection),
          args: {
            ids: {
              type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(graphqlTypeObjectId))),
            },
            ...updateArgs,
          },
        }
      }
      mutations[`remove${name}`] = {
        type: collection,
        args: {
          id: {
            type: new GraphQLNonNull(graphqlTypeObjectId),
          },
        },
      }
      mutations[`removeMany${pluralize(name)}`] = {
        type: new GraphQLList(collection),
        args: {
          ids: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(graphqlTypeObjectId))),
          },
        },
      }
      return mutations
    })
    .reduce((acc, fields) => ({ ...acc, ...fields }), {})
  return new GraphQLObjectType({
    ...config,
    fields: {
      ...config.fields,
      ...appendFields,
    },
  })
}

function transformMongoDirective(schema: GraphQLSchema, config: AugmentConfig) {
  const directives = schema.getDirectives()
  return directives.reduce((acc, directive) => {
    if (acc) acc[directive.name] = directive as any
    return acc
  }, {} as IExecutableSchemaDefinition['schemaDirectives'])
}

function extractDefinitions(schema: GraphQLSchema): DefinitionNode[] {
  const typeMap = schema.getTypeMap()
  return Object.keys(typeMap).reduce((acc, type) => {
    const ast = typeMap[type].astNode
    if (ast) {
      acc.push(ast)
      const extensionASTNodes = typeMap[type].extensionASTNodes
      if (extensionASTNodes) {
        acc.push(...extensionASTNodes)
      }
    }
    return acc
  }, [] as DefinitionNode[])
}

function pluralize(str: string) {
  if (last(str) === 's') return str
  return `${str}s`
}

export const extractResolversFromSchema = (schema: GraphQLSchema) => {
  const typeMap = schema.getTypeMap()
  const types = Object.keys(typeMap)
  let type = {}
  let schemaTypeResolvers = {} as { [key: string]: any } | undefined
  return types.reduce((acc, t) => {
    // prevent extraction from schema introspection system keys
    if (
      t !== '__Schema' &&
      t !== '__Type' &&
      t !== '__TypeKind' &&
      t !== '__Field' &&
      t !== '__InputValue' &&
      t !== '__EnumValue' &&
      t !== '__Directive'
    ) {
      type = typeMap[t]
      // resolvers are stored on the field level at a .resolve key
      schemaTypeResolvers = extractFieldResolversFromSchemaType(type)
      // do not add unless there exists at least one field resolver for type
      if (schemaTypeResolvers) {
        acc[t] = schemaTypeResolvers
      }
    }
    return acc
  }, {} as { [key: string]: { [key: string]: any } })
}

/**
 * Extracts field resolvers from a given type taken
 * from a schema
 */
const extractFieldResolversFromSchemaType = (type: any) => {
  const fields = type._fields
  const fieldKeys = fields ? Object.keys(fields) : []
  const fieldResolvers =
    fieldKeys.length > 0
      ? fieldKeys.reduce((acc, t) => {
          // do not add entry for this field unless it has resolver
          if (fields[t].resolve !== undefined) {
            acc[t] = fields[t].resolve
          }
          return acc
        }, {} as { [key: string]: any })
      : undefined
  // do not return value unless there exists at least 1 field resolver
  return fieldResolvers && Object.keys(fieldResolvers).length > 0 ? fieldResolvers : undefined
}
