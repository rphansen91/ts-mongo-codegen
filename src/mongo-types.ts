import gql from 'graphql-tag'

export const mongoTypeDefs = gql`
  directive @collection(name: String!, crud: Boolean) on OBJECT
  directive @filter on FIELD_DEFINITION
  directive @insert on FIELD_DEFINITION
  directive @update on FIELD_DEFINITION
  directive @unset on FIELD_DEFINITION
  directive @set on FIELD_DEFINITION
  directive @inc on FIELD_DEFINITION
  directive @dec on FIELD_DEFINITION

  input Pagination {
    perPage: Int
    page: Int
  }

  input Sort {
    field: String
    order: Int
  }

  scalar Date
  scalar ObjectId

  input BooleanFilter {
    EQ: Boolean
    GT: Boolean
    GTE: Boolean
    IN: [Boolean]
    ALL: [Boolean]
    LT: Boolean
    LTE: Boolean
    NE: Boolean
    NIN: [Boolean]
  }

  input IntFilter {
    EQ: Int
    GT: Int
    GTE: Int
    IN: [Int]
    ALL: [Int]
    LT: Int
    LTE: Int
    NE: Int
    NIN: [Int]
  }

  input FloatFilter {
    EQ: Float
    GT: Float
    GTE: Float
    IN: [Float]
    ALL: [Float]
    LT: Float
    LTE: Float
    NE: Float
    NIN: [Float]
  }

  input StringFilter {
    EQ: String
    GT: String
    GTE: String
    IN: [String]
    ALL: [String]
    LT: String
    LTE: String
    NE: String
    NIN: [String]
  }

  input DateFilter {
    EQ: Date
    GT: Date
    GTE: Date
    IN: [Date]
    ALL: [Date]
    LT: Date
    LTE: Date
    NE: Date
    NIN: [Date]
  }

  input ObjectIdFilter {
    EQ: ObjectId
    GT: ObjectId
    GTE: ObjectId
    IN: [ObjectId]
    ALL: [ObjectId]
    LT: ObjectId
    LTE: ObjectId
    NE: ObjectId
    NIN: [ObjectId]
  }
`
