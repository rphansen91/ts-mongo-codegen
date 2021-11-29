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
import values from 'lodash/values'

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

  const content = `import { Db, Collection, ObjectId } from 'mongodb'
import { mapFilterToMongo, mapUpdateToMongo, mapTextSearchToMongo, paginateCursor, ITextSearch } from '@elevatejs/ts-mongo-codegen'
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
  collectionArgs: GenerateCollectionArgs,
  { includeCrud } = { includeCrud: false }
) {
  const {
    typeName,
    collectionName,
    collectionString,
    mongoTypes,
    capitalName,
    camelTypeName,
  } = collectionArgs
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
    const queryResolvers = generateQueryResolvers(collectionArgs, contextType.name)
    const mutationResolvers = generateMutationResolvers(collectionArgs, contextType.name)
    const crudResolvers = generateCrudResolvers(collectionArgs)
    exports.push(resolversExport)
    exports.push(...queryResolvers)
    exports.push(...mutationResolvers)
    exports.push(...crudResolvers)
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
  const textsearchType = mongoTypes.textsearchType
  const filterFields = gqlTypeToTypescript(mongoTypes.filterType)
  const filterArgsType = generate(`I${typeName}FilterArgs`, filterFields, 'type')
  const findArgsType = generate(
    `I${typeName}FindArgs`,
    `{ filter: ${filterArgsType.name}, ${
      textsearchType ? 'textsearch: ITextSearch, ' : ''
    }pagination: Pagination, sort: Sort }`,
    'type'
  )
  const findByIdArgsType = generate(
    `I${typeName}FindByIdArgs`,
    '{ id: ObjectId; filter?: any; }',
    'type'
  )
  const findByIdsArgsType = generate(
    `I${pluralize(typeName)}FindByIdsArgs`,
    '{ ids: ObjectId[]; filter?: any; }',
    'type'
  )
  const indexFactory = textsearchType
    ? `async function (context: ${contextType}) {
    return context.${collectionName}.createIndex({
      ${values(textsearchType?.getFields())
        .map(({ name }) => `${name}: 'text'`)
        .join(', ')}
    })
  }`
    : ''
  const indexFactoryExport = indexFactory
    ? generate(`ensure${pluralize(typeName)}SearchIndex`, indexFactory, 'const')
    : null
  const queryResolvers = `{
  async find${pluralize(typeName)}(_: any, { filter, ${
    textsearchType ? 'textsearch, ' : ''
  }pagination, sort }: ${findArgsType.name}, context: ${contextType}) {
    const query = mapFilterToMongo(filter || {})
    ${textsearchType ? 'if (textsearch) query.$text = mapTextSearchToMongo(textsearch)' : ''}
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
  async find${typeName}ById(_: any, { id, filter }: ${
    findByIdArgsType.name
  }, context: ${contextType}) {
    return context.${collectionName}.findOne({ _id: id, ...filter })
  },
  async find${pluralize(typeName)}ByIds(_: any, { ids, filter }: ${
    findByIdsArgsType.name
  }, context: ${contextType}) {
    const ${pluralize(
      collectionName
    )} = await context.${collectionName}.find({ _id: { $in: ids }, ...filter }).toArray()
    const ${collectionName}ById = keyBy(${pluralize(collectionName)}, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => ${collectionName}ById[id])
  },
}`
  const queryResolversExport = generate(`${camelTypeName}QueryResolvers`, queryResolvers, 'const')
  const exports = [
    filterArgsType,
    findArgsType,
    findByIdArgsType,
    findByIdsArgsType,
    queryResolversExport,
  ]
  if (indexFactoryExport) {
    exports.push(indexFactoryExport)
  }
  return exports
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
    `{ id: ObjectId, filter: any, ${updateTypes} }`,
    'type'
  )
  const updateManyArgsType = generate(
    `I${pluralize(typeName)}UpdateManyArgs`,
    `{ ids: ObjectId[], filter: any, ${updateTypes} }`,
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
    '{ id: ObjectId, filter: any }',
    'type'
  )
  const removeByIdsArgsType = generate(
    `I${pluralize(typeName)}RemoveManyArgs`,
    '{ ids: ObjectId[], filter: any }',
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

function generateCrudResolvers({ typeName, camelTypeName }: GenerateCollectionArgs) {
  const crudResolversExport = generate(
    `${camelTypeName}CrudResolvers`,
    `{ Query: ${camelTypeName}QueryResolvers, Mutation: ${camelTypeName}MutationResolvers, ${typeName}: ${camelTypeName}Resolvers }`,
    'const'
  )
  return [crudResolversExport]
}
