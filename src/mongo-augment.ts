import { mergeSchemas } from '@graphql-tools/schema'
import { MapperKind, mapSchema, ObjectTypeMapper } from '@graphql-tools/utils'
import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  isSchema,
} from 'graphql'
import { camelCase } from 'lodash'
import values from 'lodash/values'
import { AugmentConfig, CollectionMap, buildMongoTypeMap, pluralize } from './gql-utils'
import { graphqlTypeObjectId } from './mongo-scalars'

export const augmentResolvers = ({
  resolvers,
  config,
}: {
  resolvers: any
  config: AugmentConfig
}) => {
  return resolvers
}

export const makeAugmentedSchema = (
  options:
    | GraphQLSchema
    | {
        schema: GraphQLSchema
        resolvers?: any
      },
  config?: AugmentConfig
) => {
  const schema = isSchema(options) ? options : options.schema
  const resolvers = isSchema(options) ? {} : options.resolvers
  const {
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
  } = buildMongoTypeMap(schema, config)
  const schemas = [
    ...values(pageSchemaMap).filter(isSchema),
    ...values(filterSchemaMap).filter(isSchema),
    ...values(insertSchemaMap).filter(isSchema),
    ...values(unsetSchemaMap).filter(isSchema),
    ...values(setSchemaMap).filter(isSchema),
    ...values(incSchemaMap).filter(isSchema),
    ...values(decSchemaMap).filter(isSchema),
    schema,
  ]
  const appendCrudQueryMapper = makeAppendCrudQueryMapper({
    resolvers: resolvers?.Query,
    collectionMap,
    textsearchTypeMap,
    filterTypeMap,
    pageTypeMap,
  })
  const appendCrudMutationMapper = makeAppendCrudMutationMapper({
    resolvers: resolvers?.Mutation,
    collectionMap,
    insertTypeMap,
    unsetTypeMap,
    setTypeMap,
    incTypeMap,
    decTypeMap,
  })
  return mapSchema(
    mergeSchemas({
      typeDefs: [],
      schemas,
    }),
    {
      [MapperKind.QUERY]: appendCrudQueryMapper,
      [MapperKind.MUTATION]: appendCrudMutationMapper,
    }
  )
}

const makeAppendCrudQueryMapper = ({
  resolvers,
  collectionMap,
  filterTypeMap,
  pageTypeMap,
  textsearchTypeMap,
}: {
  resolvers: any
  collectionMap: CollectionMap
  pageTypeMap: { [x: string]: GraphQLObjectType }
  filterTypeMap: { [x: string]: GraphQLInputObjectType | null }
  textsearchTypeMap: { [x: string]: GraphQLInputObjectType | null }
}): ObjectTypeMapper => (type: GraphQLObjectType, schema: GraphQLSchema) => {
  const config = type.toConfig()
  const textsearch = schema.getType('TextSearch') as GraphQLInputObjectType
  const pagination = schema.getType('Pagination') as GraphQLInputObjectType
  const sort = schema.getType('Sort') as GraphQLInputObjectType
  const existingQueryFields = schema.getQueryType()?.getFields()
  const appendFields = Object.keys(collectionMap)
    .map((typeName) => {
      const collection = collectionMap[typeName]
      const find = {
        type: new GraphQLNonNull(pageTypeMap[typeName]),
        args: {
          pagination: {
            type: pagination,
          },
          sort: {
            type: sort,
          },
        } as any,
      }
      if (filterTypeMap[typeName]) {
        find.args.filter = {
          type: filterTypeMap[typeName],
        }
      }
      if (textsearchTypeMap[typeName]) {
        find.args.textsearch = {
          type: textsearch,
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
      const queryFields: any = {}
      const findName = `find${pluralize(typeName)}`
      if (!existingQueryFields?.[findName]) {
        queryFields[findName] = find
        if (resolvers?.[findName]) {
          queryFields[findName].resolve = resolvers[findName]
        }
      }
      const findIdName = `find${typeName}ById`
      if (!existingQueryFields?.[findIdName]) {
        queryFields[findIdName] = findById
        if (resolvers?.[findIdName]) {
          queryFields[findIdName].resolve = resolvers[findIdName]
        }
      }
      const findIdsName = `find${pluralize(typeName)}ByIds`
      if (!existingQueryFields?.[findIdsName]) {
        queryFields[findIdsName] = findByIds
        if (resolvers?.[findIdsName]) {
          queryFields[findIdsName].resolve = resolvers[findIdsName]
        }
      }
      return queryFields
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

const makeAppendCrudMutationMapper = ({
  resolvers,
  collectionMap,
  insertTypeMap,
  unsetTypeMap,
  setTypeMap,
  incTypeMap,
  decTypeMap,
}: {
  resolvers: any
  collectionMap: CollectionMap
  insertTypeMap: { [x: string]: GraphQLInputObjectType | null }
  unsetTypeMap: { [x: string]: GraphQLInputObjectType | null }
  setTypeMap: { [x: string]: GraphQLInputObjectType | null }
  incTypeMap: { [x: string]: GraphQLInputObjectType | null }
  decTypeMap: { [x: string]: GraphQLInputObjectType | null }
}): ObjectTypeMapper => (type: GraphQLObjectType, schema: GraphQLSchema) => {
  const config = type.toConfig()
  const existingMutationFields = schema.getMutationType()?.getFields()
  const appendFields = Object.keys(collectionMap)
    .map((typeName) => {
      const collection = collectionMap[typeName]
      const mutations: { [x: string]: any } = {}
      const insertType = insertTypeMap[typeName]
      const unsetType = unsetTypeMap[typeName]
      const setType = setTypeMap[typeName]
      const incType = incTypeMap[typeName]
      const decType = decTypeMap[typeName]
      const insertName = `insert${typeName}`
      const insertManyName = `insertMany${pluralize(typeName)}`
      if (insertType) {
        mutations[insertName] = {
          type: collection,
          args: {
            [camelCase(typeName)]: {
              type: new GraphQLNonNull(insertType),
            },
          },
        }
        if (resolvers?.[insertName]) {
          mutations[insertName].resolve = resolvers?.[insertName]
        }
        mutations[insertManyName] = {
          type: new GraphQLList(collection),
          args: {
            [pluralize(camelCase(typeName))]: {
              type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(insertType))),
            },
          },
        }
        if (resolvers?.[insertManyName]) {
          mutations[insertManyName].resolve = resolvers?.[insertManyName]
        }
      }
      if (unsetType || setType || incType || decType) {
        const updateName = `update${typeName}`
        const updateManyName = `updateMany${pluralize(typeName)}`

        const updateArgs: { [x: string]: any } = {}
        if (unsetType) updateArgs[`${camelCase(typeName)}Unset`] = { type: unsetType }
        if (setType) updateArgs[`${camelCase(typeName)}Set`] = { type: setType }
        if (incType) updateArgs[`${camelCase(typeName)}Inc`] = { type: incType }
        if (decType) updateArgs[`${camelCase(typeName)}Dec`] = { type: decType }

        if (!existingMutationFields?.[updateName]) {
          mutations[updateName] = {
            type: collection,
            args: {
              id: {
                type: new GraphQLNonNull(graphqlTypeObjectId),
              },
              ...updateArgs,
            },
          }
          if (resolvers?.[updateName]) {
            mutations[updateName].resolve = resolvers?.[updateName]
          }
        }
        if (!existingMutationFields?.[updateManyName]) {
          mutations[updateManyName] = {
            type: new GraphQLList(collection),
            args: {
              ids: {
                type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(graphqlTypeObjectId))),
              },
              ...updateArgs,
            },
          }
          if (resolvers?.[updateManyName]) {
            mutations[updateManyName].resolve = resolvers?.[updateManyName]
          }
        }
      }
      const removeName = `remove${typeName}`
      if (!existingMutationFields?.[removeName]) {
        mutations[removeName] = {
          type: collection,
          args: {
            id: {
              type: new GraphQLNonNull(graphqlTypeObjectId),
            },
          },
        }
        if (resolvers?.[removeName]) {
          mutations[removeName].resolve = resolvers?.[removeName]
        }
      }
      const removeManyName = `removeMany${pluralize(typeName)}`
      if (!existingMutationFields?.[removeManyName]) {
        mutations[removeManyName] = {
          type: new GraphQLList(collection),
          args: {
            ids: {
              type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(graphqlTypeObjectId))),
            },
          },
        }
        if (resolvers?.[removeManyName]) {
          mutations[removeManyName].resolve = resolvers?.[removeManyName]
        }
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
