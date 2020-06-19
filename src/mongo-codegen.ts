import { mongoTypeDefs } from './mongo-types'
import { PluginFunction } from '@graphql-codegen/plugin-helpers'
import { StringValueNode, DirectiveNode, GraphQLNamedType } from 'graphql'
import capitalize from 'lodash/capitalize'
import camelCase from 'lodash/camelCase'

export const addToSchema = mongoTypeDefs

export type Config = {
  name: 'string'
}

export const plugin: PluginFunction<Partial<Config>> = (schema, documents, config, info) => {
  const typesMap = schema.getTypeMap()
  const collections = Object.keys(typesMap)
    .map((typeName: string) => {
      const type = typesMap[typeName]
      const collection = findDirective('collection', type)
      if (!collection) return null
      return buildMongoCollection(typeName, collection)
    })
    .filter(isGeneratedCollection)

  const content = `import { Db, Collection } from 'mongodb'

${collections.map(({ exports }) => exports.map(generateExport).join('\n')).join('\n\n')}

export function mongoCollectionFactory (db: Db) {
  ${collections.map(({ factories }) => factories.map(generateExecute)).join('\n')}

  return {
    ${collections.map(({ factories }) => factories.map(({ name }) => name).join(',\n')).join(',\n')}
  }
}`

  return content
}

function findDirective(name: string, type: GraphQLNamedType) {
  return type?.astNode?.directives?.find?.(d => d.name.value === name)
}

type GeneratedCollection = ReturnType<typeof buildMongoCollection>
function buildMongoCollection(typeName: string, node: DirectiveNode) {
  const nameArgument = node?.arguments?.find?.(d => d.name.value === 'name')
  const collectionName = (nameArgument?.value as StringValueNode)?.value
  const name = camelCase(collectionName)
  const capitalName = capitalize(name)
  const collectionType = generate(`I${capitalName}Collection`, `Collection<${typeName}>`, 'type')
  const getCollectionType = generate(
    `get${capitalName}Collection`,
    `(db: Db) => db.collection<${typeName}>('${collectionName}')`,
    'const'
  )
  return {
    name,
    typeName,
    capitalName,
    collectionName,
    getCollectionType,
    exports: [collectionType, getCollectionType],
    factories: [
      {
        name,
        value: getCollectionType.name,
        args: ['db']
      }
    ]
  }
}

function isGeneratedCollection(v: any): v is GeneratedCollection {
  return v?.name
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
    value: `${factory.value}(${(factory.args ?? []).join(', ')})`
  })
}
