import gql from 'graphql-tag'

gql`
  type Query {
    findBooks(pagination: Pagination, sort: Sort, filter: BookFilter): BookPage!
    findBookById(id: ObjectId!): Book
    findBooksByIds(ids: [ObjectId!]!): [Book]
  }

  type Mutation {
    root: String
    insertBook(book: BookInsert!): Book
    insertManyBooks(books: [BookInsert!]!): [Book]
    updateBook(id: ObjectId!, bookUnset: BookUnset, bookSet: BookSet): Book
    updateManyBooks(ids: [ObjectId!]!, bookUnset: BookUnset, bookSet: BookSet): [Book]
    removeBook(id: ObjectId!): Book
    removeManyBooks(ids: [ObjectId!]!): [Book]
  }

  type Book {
    id: ObjectId
    title: String
    author: String
  }

  input BookFilter {
    title: String
    author: String
  }

  input BookInsert {
    title: String
    author: String
  }

  type BookPage {
    total: Int
    data: [Book]
  }

  input BookSet {
    title: String
    author: String
  }

  input BookUnset {
    title: String
    author: String
  }
`
