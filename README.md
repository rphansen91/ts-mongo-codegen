# TypeScript Mongo Codegen

[![npm](https://img.shields.io/npm/v/ts-mongo-codegen.svg)](https://www.npmjs.com/package/ts-mongo-codegen)
[![downloads](https://img.shields.io/npm/dw/ts-mongo-codegen.svg)](https://www.npmjs.com/package/ts-mongo-codegen)
[![Travis](https://travis-ci.com/rphansen91/ts-mongo-codegen.svg?branch=master)](https://travis-ci.com/rphansen91/ts-mongo-codegen)
[![Coverage Status](https://coveralls.io/repos/github/rphansen91/ts-mongo-codegen/badge.svg?branch=master)](https://coveralls.io/github/rphansen91/ts-mongo-codegen?branch=master)
[![Dev Dependencies](https://david-dm.org/rphansen91/ts-mongo-codegen.svg)](https://david-dm.org/rphansen91/ts-mongo-codegen)
[![Known Vulnerabilities](https://snyk.io/test/github/rphansen91/ts-mongo-codegen/badge.svg?targetFile=package.json)](https://snyk.io/test/github/rphansen91/ts-mongo-codegen?targetFile=package.json)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This project generates types for a seamless integration between GraphQL and mongodb.

### Usage

```bash
yarn add ts-mongo-codegen
```

**./codegen.json** 

```json
{
  "schema": "http://localhost:8082",
  "generates": {
    "./src/gql/types.ts": {
      "plugins": [
        "typescript",
        "typescript-operations",
        "typescript-resolvers",
        "ts-mongo-codegen",
      ]
    }
  }
}

```

**./gql/books.schema**

```graphql
type Book @collection(name: "books") {
  id: ObjectId
  title: String
  author: String
}
```

**./src/stores/mongo.ts** 

```javascript
import { connect } from 'ts-mongo-codegen'
import { mongoFactory } from '../gql/types'

export async function mongoStore(url: string, name: string) {
  const db = (await connect(url)).db(name)
  const datastore = mongoFactory(db)
  // datastore.books is a mongo collection
  return datastore
}

```

### Upcoming Release

-   Augment your schema with CRUD operations for your collections.
-   Generate a changelog to keep a running list of changes to a document
-   Generate subscriptions

Turns This

![Example Schema](/example_schema.png)

Into This

![Into Tis](/example_augmented.png)
