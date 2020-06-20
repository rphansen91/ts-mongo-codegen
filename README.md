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

## Credits

Made with :heart: by [@alexjoverm](https://twitter.com/alexjoverm) and all these wonderful contributors ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->

| [<img src="https://avatars.githubusercontent.com/u/6052309?v=3" width="100px;"/><br /><sub><b>Ciro</b></sub>](https://www.linkedin.com/in/ciro-ivan-agulló-guarinos-42109376)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=k1r0s "Code") [🔧](#tool-k1r0s "Tools") | [<img src="https://avatars.githubusercontent.com/u/947523?v=3" width="100px;"/><br /><sub><b>Marius Schulz</b></sub>](https://blog.mariusschulz.com)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=mariusschulz "Documentation") | [<img src="https://avatars.githubusercontent.com/u/4152819?v=3" width="100px;"/><br /><sub><b>Alexander Odell</b></sub>](https://github.com/alextrastero)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=alextrastero "Documentation") |      [<img src="https://avatars1.githubusercontent.com/u/8728882?v=3" width="100px;"/><br /><sub><b>Ryan Ham</b></sub>](https://github.com/superamadeus)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=superamadeus "Code")      | [<img src="https://avatars1.githubusercontent.com/u/8458838?v=3" width="100px;"/><br /><sub><b>Chi</b></sub>](https://consiiii.me)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=ChinW "Code") [🔧](#tool-ChinW "Tools") [📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=ChinW "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/2856501?v=3" width="100px;"/><br /><sub><b>Matt Mazzola</b></sub>](https://github.com/mattmazzola)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=mattmazzola "Code") [🔧](#tool-mattmazzola "Tools") |       [<img src="https://avatars0.githubusercontent.com/u/2664047?v=3" width="100px;"/><br /><sub><b>Sergii Lischuk</b></sub>](http://leefrost.github.io)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=Leefrost "Code")      |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                             [<img src="https://avatars1.githubusercontent.com/u/618922?v=3" width="100px;"/><br /><sub><b>Steve Lee</b></sub>](http;//opendirective.com)<br />[🔧](#tool-SteveALee "Tools")                                                             |            [<img src="https://avatars0.githubusercontent.com/u/5127501?v=3" width="100px;"/><br /><sub><b>Flavio Corpa</b></sub>](http://flaviocorpa.com)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=kutyel "Code")           |                                                [<img src="https://avatars2.githubusercontent.com/u/22561997?v=3" width="100px;"/><br /><sub><b>Dom</b></sub>](https://github.com/foreggs)<br />[🔧](#tool-foreggs "Tools")                                                |           [<img src="https://avatars1.githubusercontent.com/u/755?v=4" width="100px;"/><br /><sub><b>Alex Coles</b></sub>](http://alexbcoles.com)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=myabc "Documentation")           |                                                                                  [<img src="https://avatars2.githubusercontent.com/u/1093738?v=4" width="100px;"/><br /><sub><b>David Khourshid</b></sub>](https://github.com/davidkpiano)<br />[🔧](#tool-davidkpiano "Tools")                                                                                  |            [<img src="https://avatars0.githubusercontent.com/u/7225802?v=4" width="100px;"/><br /><sub><b>Aarón García Hervás</b></sub>](https://aarongarciah.com)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=aarongarciah "Documentation")           |      [<img src="https://avatars2.githubusercontent.com/u/13683986?v=4" width="100px;"/><br /><sub><b>Jonathan Hart</b></sub>](https://www.stuajnht.co.uk)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=stuajnht "Code")      |
|                        [<img src="https://avatars0.githubusercontent.com/u/13509204?v=4" width="100px;"/><br /><sub><b>Sanjiv Lobo</b></sub>](https://github.com/Xndr7)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=Xndr7 "Documentation")                        |   [<img src="https://avatars3.githubusercontent.com/u/7473800?v=4" width="100px;"/><br /><sub><b>Stefan Aleksovski</b></sub>](https://github.com/sAleksovski)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=sAleksovski "Code")  |      [<img src="https://avatars2.githubusercontent.com/u/8853426?v=4" width="100px;"/><br /><sub><b>dev.peerapong</b></sub>](https://github.com/devpeerapong)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=devpeerapong "Code")      | [<img src="https://avatars0.githubusercontent.com/u/22260722?v=4" width="100px;"/><br /><sub><b>Aaron Groome</b></sub>](http://twitter.com/Racing5372)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=Racing5372 "Documentation") |                                                 [<img src="https://avatars3.githubusercontent.com/u/180963?v=4" width="100px;"/><br /><sub><b>Aaron Reisman</b></sub>](https://github.com/lifeiscontent)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=lifeiscontent "Code")                                                 |                    [<img src="https://avatars1.githubusercontent.com/u/32557482?v=4" width="100px;"/><br /><sub><b>kid-sk</b></sub>](https://github.com/kid-sk)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=kid-sk "Documentation")                    | [<img src="https://avatars0.githubusercontent.com/u/1503089?v=4" width="100px;"/><br /><sub><b>Andrea Gottardi</b></sub>](http://about.me/andreagot)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=AndreaGot "Documentation") |
|                   [<img src="https://avatars3.githubusercontent.com/u/1375860?v=4" width="100px;"/><br /><sub><b>Yogendra Sharma</b></sub>](http://TechiesEyes.com)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=Yogendra0Sharma "Documentation")                  |  [<img src="https://avatars3.githubusercontent.com/u/7407177?v=4" width="100px;"/><br /><sub><b>Rayan Salhab</b></sub>](http://linkedin.com/in/rayan-salhab/)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=cyphercodes "Code")  |                                                                                                                                                                                                                                                                           |                                                                                                                                                                                                                                                                      |                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                                                                                                                                                                                              |                                                                                                                                                                                                                                                                   |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind are welcome!
