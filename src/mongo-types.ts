import gql from 'graphql-tag'

export const mongoTypeDefs = gql`
  scalar Date
  scalar ObjectId

  directive @collection(name: String!) on OBJECT

  input Pagination {
    perPage: Int
    page: Int
  }

  input Sort {
    field: String
    order: Int
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
