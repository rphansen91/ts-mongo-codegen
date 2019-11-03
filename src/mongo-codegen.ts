import camelCase from 'lodash/camelCase'
import { mongoTypeDefs } from './mongo-types'

export const addToSchema = mongoTypeDefs

export const plugin = (schema: any, documents: any, config: any, info: any) => {
  console.log('Running Mongo Codegen')
  const typesMap = schema.getTypeMap()
  const collections = Object.keys(typesMap)
    .map((typeName: string) => {
      const type = typesMap[typeName]
      const astNode = type.astNode
      const collection =
        astNode &&
        astNode.directives &&
        astNode.directives.find((d: any) => d.name.value === 'collection')
      if (collection) {
        const nameArgument = collection.arguments.find((d: any) => d.name.value === 'name')
        const collectionName = nameArgument.value.value
        const name = camelCase(collectionName)
        const resources = [`const ${name} = db.collection<${typeName}>('${collectionName}')`]
        const resourceNames = [name]
        return {
          name,
          typeName,
          resources,
          resourceNames
        }
      }
    })
    .filter(v => v)

  return `
import { Db } from 'mongodb';

export function mongoCollectionFactory (db: Db) {
  ${collections.map(({ resources }: any) => resources.join('\n')).join('\n')}

  return {
    ${collections.map(({ resourceNames }: any) => resourceNames.join(',\n')).join(',\n')}
  }
}
`
}
