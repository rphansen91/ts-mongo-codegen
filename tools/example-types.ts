import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  ObjectId: any;
};









export type Author = {
  __typename?: 'Author';
  id?: Maybe<Scalars['ObjectId']>;
  name?: Maybe<Scalars['String']>;
};

export type Book = {
  __typename?: 'Book';
  id?: Maybe<Scalars['ObjectId']>;
  title?: Maybe<Scalars['String']>;
  author?: Maybe<Scalars['String']>;
};


export type DateFilter = {
  EQ?: Maybe<Scalars['Date']>;
  GT?: Maybe<Scalars['Date']>;
  GTE?: Maybe<Scalars['Date']>;
  IN?: Maybe<Array<Maybe<Scalars['Date']>>>;
  ALL?: Maybe<Array<Maybe<Scalars['Date']>>>;
  LT?: Maybe<Scalars['Date']>;
  LTE?: Maybe<Scalars['Date']>;
  NE?: Maybe<Scalars['Date']>;
  NIN?: Maybe<Array<Maybe<Scalars['Date']>>>;
};

export type FloatFilter = {
  EQ?: Maybe<Scalars['Float']>;
  GT?: Maybe<Scalars['Float']>;
  GTE?: Maybe<Scalars['Float']>;
  IN?: Maybe<Array<Maybe<Scalars['Float']>>>;
  ALL?: Maybe<Array<Maybe<Scalars['Float']>>>;
  LT?: Maybe<Scalars['Float']>;
  LTE?: Maybe<Scalars['Float']>;
  NE?: Maybe<Scalars['Float']>;
  NIN?: Maybe<Array<Maybe<Scalars['Float']>>>;
};

export type IntFilter = {
  EQ?: Maybe<Scalars['Int']>;
  GT?: Maybe<Scalars['Int']>;
  GTE?: Maybe<Scalars['Int']>;
  IN?: Maybe<Array<Maybe<Scalars['Int']>>>;
  ALL?: Maybe<Array<Maybe<Scalars['Int']>>>;
  LT?: Maybe<Scalars['Int']>;
  LTE?: Maybe<Scalars['Int']>;
  NE?: Maybe<Scalars['Int']>;
  NIN?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  root?: Maybe<Scalars['String']>;
};


export type ObjectIdFilter = {
  EQ?: Maybe<Scalars['ObjectId']>;
  GT?: Maybe<Scalars['ObjectId']>;
  GTE?: Maybe<Scalars['ObjectId']>;
  IN?: Maybe<Array<Maybe<Scalars['ObjectId']>>>;
  ALL?: Maybe<Array<Maybe<Scalars['ObjectId']>>>;
  LT?: Maybe<Scalars['ObjectId']>;
  LTE?: Maybe<Scalars['ObjectId']>;
  NE?: Maybe<Scalars['ObjectId']>;
  NIN?: Maybe<Array<Maybe<Scalars['ObjectId']>>>;
};

export type Pagination = {
  perPage?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  root?: Maybe<Scalars['String']>;
};

export type Sort = {
  field?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
};

export type StringFilter = {
  EQ?: Maybe<Scalars['String']>;
  GT?: Maybe<Scalars['String']>;
  GTE?: Maybe<Scalars['String']>;
  IN?: Maybe<Array<Maybe<Scalars['String']>>>;
  ALL?: Maybe<Array<Maybe<Scalars['String']>>>;
  LT?: Maybe<Scalars['String']>;
  LTE?: Maybe<Scalars['String']>;
  NE?: Maybe<Scalars['String']>;
  NIN?: Maybe<Array<Maybe<Scalars['String']>>>;
};




export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Pagination: Pagination;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Sort: Sort;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']>;
  IntFilter: IntFilter;
  FloatFilter: FloatFilter;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  StringFilter: StringFilter;
  DateFilter: DateFilter;
  ObjectIdFilter: ObjectIdFilter;
  Author: ResolverTypeWrapper<Author>;
  Book: ResolverTypeWrapper<Book>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  String: Scalars['String'];
  Mutation: {};
  Boolean: Scalars['Boolean'];
  Pagination: Pagination;
  Int: Scalars['Int'];
  Sort: Sort;
  Date: Scalars['Date'];
  ObjectId: Scalars['ObjectId'];
  IntFilter: IntFilter;
  FloatFilter: FloatFilter;
  Float: Scalars['Float'];
  StringFilter: StringFilter;
  DateFilter: DateFilter;
  ObjectIdFilter: ObjectIdFilter;
  Author: Author;
  Book: Book;
};

export type CollectionDirectiveArgs = {   name: Scalars['String'];
  crud?: Maybe<Scalars['Boolean']>; };

export type CollectionDirectiveResolver<Result, Parent, ContextType = any, Args = CollectionDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type FilterDirectiveArgs = {  };

export type FilterDirectiveResolver<Result, Parent, ContextType = any, Args = FilterDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type InsertDirectiveArgs = {  };

export type InsertDirectiveResolver<Result, Parent, ContextType = any, Args = InsertDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type UpdateDirectiveArgs = {  };

export type UpdateDirectiveResolver<Result, Parent, ContextType = any, Args = UpdateDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type UnsetDirectiveArgs = {  };

export type UnsetDirectiveResolver<Result, Parent, ContextType = any, Args = UnsetDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type SetDirectiveArgs = {  };

export type SetDirectiveResolver<Result, Parent, ContextType = any, Args = SetDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type IncDirectiveArgs = {  };

export type IncDirectiveResolver<Result, Parent, ContextType = any, Args = IncDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type DecDirectiveArgs = {  };

export type DecDirectiveResolver<Result, Parent, ContextType = any, Args = DecDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AuthorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Author'] = ResolversParentTypes['Author']> = {
  id?: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type BookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Book'] = ResolversParentTypes['Book']> = {
  id?: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  root?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export interface ObjectIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ObjectId'], any> {
  name: 'ObjectId';
}

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  root?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Author?: AuthorResolvers<ContextType>;
  Book?: BookResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  ObjectId?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = {
  collection?: CollectionDirectiveResolver<any, any, ContextType>;
  filter?: FilterDirectiveResolver<any, any, ContextType>;
  insert?: InsertDirectiveResolver<any, any, ContextType>;
  update?: UpdateDirectiveResolver<any, any, ContextType>;
  unset?: UnsetDirectiveResolver<any, any, ContextType>;
  set?: SetDirectiveResolver<any, any, ContextType>;
  inc?: IncDirectiveResolver<any, any, ContextType>;
  dec?: DecDirectiveResolver<any, any, ContextType>;
};


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<ContextType>;
import { Db, Collection, ObjectID } from 'mongodb'
import { mapFilterToMongo, mapUpdateToMongo, paginateCursor } from '../src/ts-mongo-codegen'
import values from 'lodash/values'
import keyBy from 'lodash/keyBy'

export const fromMongoId = (obj: any) => {
  if (obj && obj._id) return obj._id.toHexString()
  if (obj && obj.id) return obj.id.toHexString()
  return ''
}

export type IAuthorsCollection = Collection<Author>

export type IAuthorContext = { authors: IAuthorsCollection }

export const getAuthorsCollection = (db: Db) => db.collection<Author>('authors')

export const authorResolvers: AuthorResolvers<IAuthorContext> = { id: fromMongoId }

export type IAuthorFilterArgs = { name?: { EQ?: string; GT?: string; GTE?: string; IN?: string[]; ALL?: string[]; LT?: string; LTE?: string; NE?: string; NIN?: string[]; } }

export type IAuthorFindArgs = { filter: IAuthorFilterArgs, pagination: Pagination, sort: Sort }

export type IAuthorFindByIdArgs = { id: ObjectID }

export type IAuthorsFindByIdsArgs = { ids: ObjectID[] }

export const authorQueryResolvers = {
  async findAuthors(_: any, { filter, pagination, sort }: IAuthorFindArgs, context: IAuthorContext) {
    const query = mapFilterToMongo(filter || {})
    const total = () => context.authors.find(query).count()
    const data = () => paginateCursor(
      context.authors.find(query),
      { pagination, sort }
    ).toArray()
    return {
      total, 
      data
    }
  },
  async findAuthorById(_: any, { id }: IAuthorFindByIdArgs, context: IAuthorContext) {
    return context.authors.findOne({ _id: id })
  },
  async findAuthorsByIds(_: any, { ids }: IAuthorsFindByIdsArgs, context: IAuthorContext) {
    const authors = await context.authors.find({ _id: { $in: ids } }).toArray()
    const authorsById = keyBy(authors, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => authorsById[id])
  },
}

export type IAuthorInsert = { name?: string }

export type IAuthorInsertArgs = { author: IAuthorInsert }

export type IAuthorsInsertManyArgs = { authors: IAuthorInsert[] }

export type IAuthorSetArgs = { name?: string }

export type IAuthorUnsetArgs = { name?: 1 }

export type IAuthorDecArgs = {  }

export type IAuthorIncArgs = {  }

export type IAuthorUpdateArgs = { id: ObjectID, authorSet: IAuthorSetArgs }

export type IAuthorsUpdateManyArgs = { ids: ObjectID[], authorSet: IAuthorSetArgs }

export type IAuthorRemoveArgs = { id: ObjectID }

export type IAuthorsRemoveManyArgs = { ids: ObjectID[] }

export const authorMutationResolvers = {
  async insertAuthor(_: any, { author }: IAuthorInsertArgs, context: IAuthorContext) {
    const response = await context.authors.insertOne(author)
    return response.ops[0]
  },
  async insertManyAuthors(_: any, { authors }: IAuthorsInsertManyArgs, context: IAuthorContext) {
    const response = await context.authors.insertMany(authors)
    const cursor = await context.authors.find({
      _id: {
        $in: values(response.insertedIds)
      }
    })
    return cursor.toArray()
  },
  async updateAuthor(_: any, { id, authorSet }: IAuthorUpdateArgs, context: IAuthorContext) {
      const { value } = await context.authors.findOneAndUpdate({ 
        _id: id 
      }, {
        $set: authorSet
      }, {
        returnOriginal: false
      })
      return value || null
  },
  async updateManyAuthors(_: any, { ids, authorSet }: IAuthorsUpdateManyArgs, context: IAuthorContext) {
    await context.authors.updateMany(
      { _id: { $in: ids } },
      {
        $set: authorSet
      }
    )
    const authors = await context.authors.find({ _id: { $in: ids } }).toArray()
    const authorsById = keyBy(authors, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => authorsById[id])
  },
  async removeAuthor(_: any, { id }: IAuthorRemoveArgs, context: IAuthorContext) {
    const { value } = await context.authors.findOneAndDelete({ _id: id })
    return value || null
  },
  async removeManyAuthors(_: any, { ids }: IAuthorsRemoveManyArgs, context: IAuthorContext) {
    const authors = await context.authors.find({ _id: { $in: ids } }).toArray()
    const authorsById = keyBy(authors, fromMongoId)
    await context.authors.deleteMany({ _id: { $in: ids } })
    return ids.map(id => id.toHexString()).map(id => authorsById[id])
  },
}

export type IBooksCollection = Collection<Book>

export type IBookContext = { books: IBooksCollection }

export const getBooksCollection = (db: Db) => db.collection<Book>('books')

export const bookResolvers: BookResolvers<IBookContext> = { id: fromMongoId }

export type IBookFilterArgs = { title?: { EQ?: string; GT?: string; GTE?: string; IN?: string[]; ALL?: string[]; LT?: string; LTE?: string; NE?: string; NIN?: string[]; }, author?: { EQ?: string; GT?: string; GTE?: string; IN?: string[]; ALL?: string[]; LT?: string; LTE?: string; NE?: string; NIN?: string[]; } }

export type IBookFindArgs = { filter: IBookFilterArgs, pagination: Pagination, sort: Sort }

export type IBookFindByIdArgs = { id: ObjectID }

export type IBooksFindByIdsArgs = { ids: ObjectID[] }

export const bookQueryResolvers = {
  async findBooks(_: any, { filter, pagination, sort }: IBookFindArgs, context: IBookContext) {
    const query = mapFilterToMongo(filter || {})
    const total = () => context.books.find(query).count()
    const data = () => paginateCursor(
      context.books.find(query),
      { pagination, sort }
    ).toArray()
    return {
      total, 
      data
    }
  },
  async findBookById(_: any, { id }: IBookFindByIdArgs, context: IBookContext) {
    return context.books.findOne({ _id: id })
  },
  async findBooksByIds(_: any, { ids }: IBooksFindByIdsArgs, context: IBookContext) {
    const books = await context.books.find({ _id: { $in: ids } }).toArray()
    const booksById = keyBy(books, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => booksById[id])
  },
}

export type IBookInsert = { title?: string, author?: string }

export type IBookInsertArgs = { book: IBookInsert }

export type IBooksInsertManyArgs = { books: IBookInsert[] }

export type IBookSetArgs = { title?: string, author?: string }

export type IBookUnsetArgs = { title?: 1, author?: 1 }

export type IBookDecArgs = {  }

export type IBookIncArgs = {  }

export type IBookUpdateArgs = { id: ObjectID, bookSet: IBookSetArgs }

export type IBooksUpdateManyArgs = { ids: ObjectID[], bookSet: IBookSetArgs }

export type IBookRemoveArgs = { id: ObjectID }

export type IBooksRemoveManyArgs = { ids: ObjectID[] }

export const bookMutationResolvers = {
  async insertBook(_: any, { book }: IBookInsertArgs, context: IBookContext) {
    const response = await context.books.insertOne(book)
    return response.ops[0]
  },
  async insertManyBooks(_: any, { books }: IBooksInsertManyArgs, context: IBookContext) {
    const response = await context.books.insertMany(books)
    const cursor = await context.books.find({
      _id: {
        $in: values(response.insertedIds)
      }
    })
    return cursor.toArray()
  },
  async updateBook(_: any, { id, bookSet }: IBookUpdateArgs, context: IBookContext) {
      const { value } = await context.books.findOneAndUpdate({ 
        _id: id 
      }, {
        $set: bookSet
      }, {
        returnOriginal: false
      })
      return value || null
  },
  async updateManyBooks(_: any, { ids, bookSet }: IBooksUpdateManyArgs, context: IBookContext) {
    await context.books.updateMany(
      { _id: { $in: ids } },
      {
        $set: bookSet
      }
    )
    const books = await context.books.find({ _id: { $in: ids } }).toArray()
    const booksById = keyBy(books, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => booksById[id])
  },
  async removeBook(_: any, { id }: IBookRemoveArgs, context: IBookContext) {
    const { value } = await context.books.findOneAndDelete({ _id: id })
    return value || null
  },
  async removeManyBooks(_: any, { ids }: IBooksRemoveManyArgs, context: IBookContext) {
    const books = await context.books.find({ _id: { $in: ids } }).toArray()
    const booksById = keyBy(books, fromMongoId)
    await context.books.deleteMany({ _id: { $in: ids } })
    return ids.map(id => id.toHexString()).map(id => booksById[id])
  },
}

export function mongoCollectionFactory (db: Db) {
  const authors = getAuthorsCollection(db)
const books = getBooksCollection(db)

  return {
    authors,
books
  }
}
