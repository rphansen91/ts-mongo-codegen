import { mergeSchemas } from '@graphql-tools/merge'
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

export const makeAugmentedSchema = (schema: GraphQLSchema, config?: AugmentConfig) => {
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
    collectionMap,
    textsearchTypeMap,
    filterTypeMap,
    pageTypeMap,
  })
  const appendCrudMutationMapper = makeAppendCrudMutationMapper({
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
  collectionMap,
  filterTypeMap,
  pageTypeMap,
  textsearchTypeMap
}: {
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
      if (!existingQueryFields?.[`find${pluralize(typeName)}`]) {
        queryFields[`find${pluralize(typeName)}`] = find
      }
      if (!existingQueryFields?.[`find${typeName}ById`]) {
        queryFields[`find${typeName}ById`] = findById
      }
      if (!existingQueryFields?.[`find${pluralize(typeName)}ByIds`]) {
        queryFields[`find${pluralize(typeName)}ByIds`] = findByIds
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
  collectionMap,
  insertTypeMap,
  unsetTypeMap,
  setTypeMap,
  incTypeMap,
  decTypeMap,
}: {
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
      if (insertType) {
        mutations[`insert${typeName}`] = {
          type: collection,
          args: {
            [camelCase(typeName)]: {
              type: new GraphQLNonNull(insertType),
            },
          },
        }
        mutations[`insertMany${pluralize(typeName)}`] = {
          type: new GraphQLList(collection),
          args: {
            [pluralize(camelCase(typeName))]: {
              type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(insertType))),
            },
          },
        }
      }
      if (unsetType || setType || incType || decType) {
        const updateArgs: { [x: string]: any } = {}
        if (unsetType) updateArgs[`${camelCase(typeName)}Unset`] = { type: unsetType }
        if (setType) updateArgs[`${camelCase(typeName)}Set`] = { type: setType }
        if (incType) updateArgs[`${camelCase(typeName)}Inc`] = { type: incType }
        if (decType) updateArgs[`${camelCase(typeName)}Dec`] = { type: decType }
        if (!existingMutationFields?.[`update${typeName}`]) {
          mutations[`update${typeName}`] = {
            type: collection,
            args: {
              id: {
                type: new GraphQLNonNull(graphqlTypeObjectId),
              },
              ...updateArgs,
            },
          }
        }
        if (!existingMutationFields?.[`updateMany${pluralize(typeName)}`]) {
          mutations[`updateMany${pluralize(typeName)}`] = {
            type: new GraphQLList(collection),
            args: {
              ids: {
                type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(graphqlTypeObjectId))),
              },
              ...updateArgs,
            },
          }
        }
      }
      if (!existingMutationFields?.[`remove${typeName}`]) {
        mutations[`remove${typeName}`] = {
          type: collection,
          args: {
            id: {
              type: new GraphQLNonNull(graphqlTypeObjectId),
            },
          },
        }
      }
      if (!existingMutationFields?.[`removeMany${pluralize(typeName)}`]) {
        mutations[`removeMany${pluralize(typeName)}`] = {
          type: new GraphQLList(collection),
          args: {
            ids: {
              type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(graphqlTypeObjectId))),
            },
          },
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
