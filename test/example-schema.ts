import gql from 'graphql-tag'
import { buildASTSchema } from 'graphql'
import { makeAugmentedSchema } from '../src/mongo-augment'

makeAugmentedSchema(
  buildASTSchema(gql`
    type Book @collection(name: "books") {
      id: ObjectId
      title: String @insert @set @unset @filter
      keywords: [String] @insert @set @unset @filter
      author: String @insert @set @unset @filter
    }
  `)
)