import { mongoTypeDefs } from './mongo-types'
import { PluginFunction } from '@graphql-codegen/plugin-helpers'
import {
  findDirective,
  findDirectiveOption,
  findArgumentValue,
  pluralize,
  buildMongoTypeMap,
  getCollectionMongoTypes,
  CollectionMongoTypes,
  gqlTypeToTypescript,
  gqlTypeToTypescriptUnset,
} from './gql-utils'
import capitalize from 'lodash/capitalize'
import camelCase from 'lodash/camelCase'

export const addToSchema = mongoTypeDefs

export type Config = {
  name: 'string'
}

export const plugin: PluginFunction<Partial<Config>> = (schema, documents, config, info) => {
  const mongoTypeMap = buildMongoTypeMap(schema, config)
  const collections = Object.keys(mongoTypeMap.collectionMap)
    .map((typeName) => {
      const directive = findDirective('collection', mongoTypeMap.collectionMap[typeName])
      const includeCrud = Boolean(findDirectiveOption('crud', directive))
      const nameArgument = findDirectiveOption('name', directive)
      const collectionString = findArgumentValue(nameArgument)
      if (!collectionString) return null
      const camelTypeName = camelCase(typeName)
      const collectionName = camelCase(collectionString)
      const capitalName = capitalize(collectionName)
      const mongoTypes = getCollectionMongoTypes(mongoTypeMap, typeName)
      return buildMongoCollection(
        { typeName, camelTypeName, collectionName, collectionString, capitalName, mongoTypes },
        { includeCrud }
      )
    })
    .filter(isGeneratedCollection)

  const content = `import { Db, Collection, ObjectID } from 'mongodb'
import { mapFilterToMongo, mapUpdateToMongo, paginateCursor } from '@elevatejs/ts-mongo-codegen'
import values from 'lodash/values'
import keyBy from 'lodash/keyBy'

export const fromMongoId = (obj: any) => {
  if (obj && obj._id) return obj._id.toHexString()
  if (obj && obj.id) return obj.id.toHexString()
  return ''
}

${collections.map(({ exports }) => exports.map(generateExport).join('\n\n')).join('\n\n')}

export function mongoCollectionFactory (db: Db) {
  ${collections.map(({ factories }) => factories.map(generateExecute)).join('\n')}

  return {
    ${collections.map(({ factories }) => factories.map(({ name }) => name).join(',\n')).join(',\n')}
  }
}`

  return content
}

type GenerateCollectionArgs = {
  typeName: string
  camelTypeName: string
  collectionName: string
  collectionString: string
  capitalName: string
  mongoTypes: CollectionMongoTypes
}
type GeneratedCollection = ReturnType<typeof buildMongoCollection>
function buildMongoCollection(
  {
    typeName,
    collectionName,
    collectionString,
    mongoTypes,
    capitalName,
    camelTypeName,
  }: GenerateCollectionArgs,
  { includeCrud } = { includeCrud: false }
) {
  const collectionType = generate(`I${capitalName}Collection`, `Collection<${typeName}>`, 'type')
  const contextType = generate(
    `I${typeName}Context`,
    `{ ${collectionName}: I${capitalName}Collection }`,
    'type'
  )
  const getCollectionExport = generate(
    `get${capitalName}Collection`,
    `(db: Db) => db.collection<${typeName}>('${collectionString}')`,
    'const'
  )
  const exports = [collectionType, contextType, getCollectionExport]

  // TODO: USE FIELD THAT USER SETS AS ObjectID
  if (includeCrud) {
    const resolversExport = generate(
      `${camelTypeName}Resolvers: ${typeName}Resolvers<${contextType.name}>`,
      '{ id: fromMongoId }',
      'const'
    )
    exports.push(resolversExport)
    exports.push(
      ...generateQueryResolvers(
        {
          typeName,
          collectionName,
          collectionString,
          mongoTypes,
          capitalName,
          camelTypeName,
        },
        contextType.name
      )
    )
    exports.push(
      ...generateMutationResolvers(
        {
          typeName,
          collectionName,
          collectionString,
          mongoTypes,
          capitalName,
          camelTypeName,
        },
        contextType.name
      )
    )
  }
  return {
    typeName,
    capitalName,
    collectionName,
    exports,
    factories: [
      {
        name: collectionName,
        value: getCollectionExport.name,
        args: ['db'],
      },
    ],
  }
}

function isGeneratedCollection(v: any): v is GeneratedCollection {
  return v?.collectionName
}

type Generated = ReturnType<typeof generate>
function generate(name: string, value: string, type = 'const') {
  return { name, value, type }
}

function generateDeclaration({ name, value, type }: Generated) {
  return `${type} ${name} = ${value}`
}

function generateExport({ name, value, type }: Generated) {
  return `export ${type} ${name} = ${value}`
}

function generateExecute(factory: GeneratedCollection['factories'][0]) {
  return generateDeclaration({
    type: 'const',
    name: factory.name,
    value: `${factory.value}(${(factory.args ?? []).join(', ')})`,
  })
}

function generateQueryResolvers(
  { typeName, collectionName, capitalName, camelTypeName, mongoTypes }: GenerateCollectionArgs,
  contextType: string
) {
  const filterFields = gqlTypeToTypescript(mongoTypes.filterType)
  const filterArgsType = generate(`I${typeName}FilterArgs`, filterFields, 'type')
  const findArgsType = generate(
    `I${typeName}FindArgs`,
    `{ filter: ${filterArgsType.name}, pagination: Pagination, sort: Sort }`,
    'type'
  )
  const findByIdArgsType = generate(`I${typeName}FindByIdArgs`, '{ id: ObjectID }', 'type')
  const findByIdsArgsType = generate(
    `I${pluralize(typeName)}FindByIdsArgs`,
    '{ ids: ObjectID[] }',
    'type'
  )
  const queryResolvers = `{
  async find${pluralize(typeName)}(_: any, { filter, pagination, sort }: ${
    findArgsType.name
  }, context: ${contextType}) {
    const query = mapFilterToMongo(filter || {})
    const total = () => context.${collectionName}.find(query).count()
    const data = () => paginateCursor(
      context.${collectionName}.find(query),
      { pagination, sort }
    ).toArray()
    return {
      total, 
      data
    }
  },
  async find${typeName}ById(_: any, { id }: ${findByIdArgsType.name}, context: ${contextType}) {
    return context.${collectionName}.findOne({ _id: id })
  },
  async find${pluralize(typeName)}ByIds(_: any, { ids }: ${
    findByIdsArgsType.name
  }, context: ${contextType}) {
    const ${pluralize(
      collectionName
    )} = await context.${collectionName}.find({ _id: { $in: ids } }).toArray()
    const ${collectionName}ById = keyBy(${pluralize(collectionName)}, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => ${collectionName}ById[id])
  },
}`
  const queryResolversExport = generate(`${camelTypeName}QueryResolvers`, queryResolvers, 'const')
  return [filterArgsType, findArgsType, findByIdArgsType, findByIdsArgsType, queryResolversExport]
}

function generateMutationResolvers(
  { typeName, collectionName, capitalName, camelTypeName, mongoTypes }: GenerateCollectionArgs,
  contextType: string
) {
  const insertFields = gqlTypeToTypescript(mongoTypes.insertType)
  const insertType = generate(`I${typeName}Insert`, insertFields, 'type')
  const insertArgsType = generate(
    `I${typeName}InsertArgs`,
    `{ ${camelTypeName}: ${insertType.name} }`,
    'type'
  )
  const insertManyArgsType = generate(
    `I${pluralize(typeName)}InsertManyArgs`,
    `{ ${pluralize(camelTypeName)}: ${insertType.name}[] }`,
    'type'
  )
  const insert = mongoTypes.insertType
    ? `  async insert${typeName}(_: any, { ${camelTypeName} }: ${insertArgsType.name}, context: ${contextType}) {
    const response = await context.${collectionName}.insertOne(${camelTypeName})
    return response.ops[0]
  },`
    : ''
  const insertMany = mongoTypes.insertType
    ? `  async insertMany${pluralize(typeName)}(_: any, { ${pluralize(camelTypeName)} }: ${
        insertManyArgsType.name
      }, context: ${contextType}) {
    const response = await context.${collectionName}.insertMany(${pluralize(camelTypeName)})
    const cursor = await context.${collectionName}.find({
      _id: {
        $in: values(response.insertedIds)
      }
    })
    return cursor.toArray()
  },`
    : ''

  const setArgsType = generate(
    `I${typeName}SetArgs`,
    gqlTypeToTypescript(mongoTypes.setType),
    'type'
  )
  const unsetArgsType = generate(
    `I${typeName}UnsetArgs`,
    gqlTypeToTypescriptUnset(mongoTypes.unsetType),
    'type'
  )
  const decArgsType = generate(
    `I${typeName}DecArgs`,
    gqlTypeToTypescript(mongoTypes.decType),
    'type'
  )
  const incArgsType = generate(
    `I${typeName}IncArgs`,
    gqlTypeToTypescript(mongoTypes.incType),
    'type'
  )
  const updateTypes = [
    mongoTypes.setType?.name ? `${camelTypeName}Set: ${setArgsType.name}` : '',
    // mongoTypes.unsetType?.name ? `${camelTypeName}Unset: ${unsetArgsType.name}` : '',
    mongoTypes.incType?.name ? `${camelTypeName}Inc: ${decArgsType.name}` : '',
    mongoTypes.decType?.name ? `${camelTypeName}Dec: ${incArgsType.name}` : '',
  ]
    .filter((v) => v)
    .join(', ')
  const updateArgsType = generate(
    `I${typeName}UpdateArgs`,
    `{ id: ObjectID, filter: any, ${updateTypes} }`,
    'type'
  )
  const updateManyArgsType = generate(
    `I${pluralize(typeName)}UpdateManyArgs`,
    `{ ids: ObjectID[], filter: any, ${updateTypes} }`,
    'type'
  )
  const updateGraphqlArgs = [
    mongoTypes.setType?.name ? `${camelTypeName}Set` : '',
    // mongoTypes.unsetType?.name ? `${camelTypeName}Unset` : '',
    mongoTypes.incType?.name ? `${camelTypeName}Inc` : '',
    mongoTypes.decType?.name ? `${camelTypeName}Dec` : '',
  ].filter((v) => v)
  const updateMongoArgs = [
    mongoTypes.setType?.name ? `$set: ${camelTypeName}Set` : '',
    // mongoTypes.unsetType?.name ? `$unset: ${camelTypeName}Unset` : '',
    mongoTypes.incType?.name ? `$inc: ${camelTypeName}Inc` : '',
    mongoTypes.decType?.name ? `$dec: ${camelTypeName}Dec` : '',
  ].filter((v) => v)
  const update = updateGraphqlArgs.length
    ? `  async update${typeName}(_: any, { id, filter, ${updateGraphqlArgs.join(', ')} }: ${
        updateArgsType.name
      }, context: ${contextType}) {
      const { value } = await context.${collectionName}.findOneAndUpdate({ 
        _id: id, ...filter
      }, {
        ${updateMongoArgs.join(', ')}
      }, {
        returnOriginal: false
      })
      return value || null
  },`
    : ''
  const updateMany = updateGraphqlArgs.length
    ? `  async updateMany${pluralize(typeName)}(_: any, { 
      ids, 
      filter, 
      ${updateGraphqlArgs.join(', ')} 
    }: ${updateManyArgsType.name}, context: ${contextType}) {
    await context.${collectionName}.updateMany(
      { _id: { $in: ids }, ...filter },
      {
        ${updateMongoArgs.join(', ')}
      }
    )
    const ${pluralize(
      collectionName
    )} = await context.${collectionName}.find({ _id: { $in: ids, ...filter } }).toArray()
    const ${collectionName}ById = keyBy(${pluralize(collectionName)}, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => ${collectionName}ById[id])
  },`
    : ''

  const removeByIdArgsType = generate(
    `I${typeName}RemoveArgs`,
    '{ id: ObjectID, filter: any }',
    'type'
  )
  const removeByIdsArgsType = generate(
    `I${pluralize(typeName)}RemoveManyArgs`,
    '{ ids: ObjectID[], filter: any }',
    'type'
  )
  const remove = `  async remove${typeName}(_: any, { id, filter }: ${removeByIdArgsType.name}, context: ${contextType}) {
    const { value } = await context.${collectionName}.findOneAndDelete({ _id: id, ...filter })
    return value || null
  },`
  const removeMany = `  async removeMany${pluralize(typeName)}(_: any, { ids, filter }: ${
    removeByIdsArgsType.name
  }, context: ${contextType}) {
    const ${pluralize(
      collectionName
    )} = await context.${collectionName}.find({ _id: { $in: ids }, ...filter }).toArray()
    const ${collectionName}ById = keyBy(${pluralize(collectionName)}, fromMongoId)
    await context.${collectionName}.deleteMany({ _id: { $in: ids }, ...filter })
    return ids.map(id => id.toHexString()).map(id => ${collectionName}ById[id])
  },`
  const mutationResolvers = `{
${[insert, insertMany, update, updateMany, remove, removeMany].filter((v) => v).join('\n')}
}`
  const mutationResolversExport = generate(
    `${camelTypeName}MutationResolvers`,
    mutationResolvers,
    'const'
  )
  return [
    insertType,
    insertArgsType,
    insertManyArgsType,
    setArgsType,
    unsetArgsType,
    decArgsType,
    incArgsType,
    updateArgsType,
    updateManyArgsType,
    removeByIdArgsType,
    removeByIdsArgsType,
    mutationResolversExport,
  ]
}
