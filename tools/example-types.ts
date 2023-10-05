import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  ObjectId: { input: any; output: any; }
};

export type Author = {
  __typename?: 'Author';
  id?: Maybe<Scalars['ObjectId']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Book = {
  __typename?: 'Book';
  author?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Category>;
  id?: Maybe<Scalars['ObjectId']['output']>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title?: Maybe<Scalars['String']['output']>;
};

export type BooleanFilter = {
  ALL?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  EQ?: InputMaybe<Scalars['Boolean']['input']>;
  GT?: InputMaybe<Scalars['Boolean']['input']>;
  GTE?: InputMaybe<Scalars['Boolean']['input']>;
  IN?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  LT?: InputMaybe<Scalars['Boolean']['input']>;
  LTE?: InputMaybe<Scalars['Boolean']['input']>;
  NE?: InputMaybe<Scalars['Boolean']['input']>;
  NIN?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
};

export enum Category {
  Comedy = 'comedy',
  Drama = 'drama'
}

export type CategoryFilter = {
  ALL?: InputMaybe<Array<InputMaybe<Category>>>;
  EQ?: InputMaybe<Category>;
  GT?: InputMaybe<Category>;
  GTE?: InputMaybe<Category>;
  IN?: InputMaybe<Array<InputMaybe<Category>>>;
  LT?: InputMaybe<Category>;
  LTE?: InputMaybe<Category>;
  NE?: InputMaybe<Category>;
  NIN?: InputMaybe<Array<InputMaybe<Category>>>;
};

export type DateFilter = {
  ALL?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  EQ?: InputMaybe<Scalars['Date']['input']>;
  GT?: InputMaybe<Scalars['Date']['input']>;
  GTE?: InputMaybe<Scalars['Date']['input']>;
  IN?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  LT?: InputMaybe<Scalars['Date']['input']>;
  LTE?: InputMaybe<Scalars['Date']['input']>;
  NE?: InputMaybe<Scalars['Date']['input']>;
  NIN?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
};

export type FloatFilter = {
  ALL?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  EQ?: InputMaybe<Scalars['Float']['input']>;
  GT?: InputMaybe<Scalars['Float']['input']>;
  GTE?: InputMaybe<Scalars['Float']['input']>;
  IN?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  LT?: InputMaybe<Scalars['Float']['input']>;
  LTE?: InputMaybe<Scalars['Float']['input']>;
  NE?: InputMaybe<Scalars['Float']['input']>;
  NIN?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export type IntFilter = {
  ALL?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  EQ?: InputMaybe<Scalars['Int']['input']>;
  GT?: InputMaybe<Scalars['Int']['input']>;
  GTE?: InputMaybe<Scalars['Int']['input']>;
  IN?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  LT?: InputMaybe<Scalars['Int']['input']>;
  LTE?: InputMaybe<Scalars['Int']['input']>;
  NE?: InputMaybe<Scalars['Int']['input']>;
  NIN?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  root?: Maybe<Scalars['String']['output']>;
};

export type ObjectIdFilter = {
  ALL?: InputMaybe<Array<InputMaybe<Scalars['ObjectId']['input']>>>;
  EQ?: InputMaybe<Scalars['ObjectId']['input']>;
  GT?: InputMaybe<Scalars['ObjectId']['input']>;
  GTE?: InputMaybe<Scalars['ObjectId']['input']>;
  IN?: InputMaybe<Array<InputMaybe<Scalars['ObjectId']['input']>>>;
  LT?: InputMaybe<Scalars['ObjectId']['input']>;
  LTE?: InputMaybe<Scalars['ObjectId']['input']>;
  NE?: InputMaybe<Scalars['ObjectId']['input']>;
  NIN?: InputMaybe<Array<InputMaybe<Scalars['ObjectId']['input']>>>;
};

export type Pagination = {
  page?: InputMaybe<Scalars['Int']['input']>;
  perPage?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  root?: Maybe<Scalars['String']['output']>;
};

export type Sort = {
  field?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
};

export type StringFilter = {
  ALL?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  EQ?: InputMaybe<Scalars['String']['input']>;
  GT?: InputMaybe<Scalars['String']['input']>;
  GTE?: InputMaybe<Scalars['String']['input']>;
  IN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  LT?: InputMaybe<Scalars['String']['input']>;
  LTE?: InputMaybe<Scalars['String']['input']>;
  NE?: InputMaybe<Scalars['String']['input']>;
  NIN?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  OPTIONS?: InputMaybe<Scalars['String']['input']>;
  REGEX?: InputMaybe<Scalars['String']['input']>;
};

export type TextSearch = {
  caseSensitive?: InputMaybe<Scalars['Boolean']['input']>;
  diacriticSensitive?: InputMaybe<Scalars['Boolean']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

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

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  Author: ResolverTypeWrapper<Author>;
  Book: ResolverTypeWrapper<Book>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BooleanFilter: BooleanFilter;
  Category: Category;
  CategoryFilter: CategoryFilter;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DateFilter: DateFilter;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FloatFilter: FloatFilter;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  IntFilter: IntFilter;
  Mutation: ResolverTypeWrapper<{}>;
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']['output']>;
  ObjectIdFilter: ObjectIdFilter;
  Pagination: Pagination;
  Query: ResolverTypeWrapper<{}>;
  Sort: Sort;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  StringFilter: StringFilter;
  TextSearch: TextSearch;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Author: Author;
  Book: Book;
  Boolean: Scalars['Boolean']['output'];
  BooleanFilter: BooleanFilter;
  CategoryFilter: CategoryFilter;
  Date: Scalars['Date']['output'];
  DateFilter: DateFilter;
  Float: Scalars['Float']['output'];
  FloatFilter: FloatFilter;
  Int: Scalars['Int']['output'];
  IntFilter: IntFilter;
  Mutation: {};
  ObjectId: Scalars['ObjectId']['output'];
  ObjectIdFilter: ObjectIdFilter;
  Pagination: Pagination;
  Query: {};
  Sort: Sort;
  String: Scalars['String']['output'];
  StringFilter: StringFilter;
  TextSearch: TextSearch;
};

export type AuthDirectiveArgs = { };

export type AuthDirectiveResolver<Result, Parent, ContextType = any, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CollectionDirectiveArgs = {
  crud?: Maybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type CollectionDirectiveResolver<Result, Parent, ContextType = any, Args = CollectionDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type DecDirectiveArgs = { };

export type DecDirectiveResolver<Result, Parent, ContextType = any, Args = DecDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type FilterDirectiveArgs = { };

export type FilterDirectiveResolver<Result, Parent, ContextType = any, Args = FilterDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type IncDirectiveArgs = { };

export type IncDirectiveResolver<Result, Parent, ContextType = any, Args = IncDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type InsertDirectiveArgs = { };

export type InsertDirectiveResolver<Result, Parent, ContextType = any, Args = InsertDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type SetDirectiveArgs = { };

export type SetDirectiveResolver<Result, Parent, ContextType = any, Args = SetDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type TextsearchDirectiveArgs = { };

export type TextsearchDirectiveResolver<Result, Parent, ContextType = any, Args = TextsearchDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type UnsetDirectiveArgs = { };

export type UnsetDirectiveResolver<Result, Parent, ContextType = any, Args = UnsetDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type UpdateDirectiveArgs = { };

export type UpdateDirectiveResolver<Result, Parent, ContextType = any, Args = UpdateDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AuthorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Author'] = ResolversParentTypes['Author']> = {
  id?: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Book'] = ResolversParentTypes['Book']> = {
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type DirectiveResolvers<ContextType = any> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  collection?: CollectionDirectiveResolver<any, any, ContextType>;
  dec?: DecDirectiveResolver<any, any, ContextType>;
  filter?: FilterDirectiveResolver<any, any, ContextType>;
  inc?: IncDirectiveResolver<any, any, ContextType>;
  insert?: InsertDirectiveResolver<any, any, ContextType>;
  set?: SetDirectiveResolver<any, any, ContextType>;
  textsearch?: TextsearchDirectiveResolver<any, any, ContextType>;
  unset?: UnsetDirectiveResolver<any, any, ContextType>;
  update?: UpdateDirectiveResolver<any, any, ContextType>;
};

import { Db, Collection, ObjectId } from 'mongodb'
import { mapFilterToMongo, mapUpdateToMongo, mapTextSearchToMongo, paginateCursor, ITextSearch } from '../src/ts-mongo-codegen'
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

export type IAuthorFilterArgs = { name?: { EQ?: string; GT?: string; GTE?: string; IN?: string[]; ALL?: string[]; LT?: string; LTE?: string; NE?: string; NIN?: string[]; }, OR?: { EQ?: Author; GT?: Author; GTE?: Author; IN?: Author[]; ALL?: Author[]; LT?: Author; LTE?: Author; NE?: Author; NIN?: Author[]; }[] }

export type IAuthorFindArgs = { filter: IAuthorFilterArgs, pagination: Pagination, sort: Sort }

export type IAuthorFindByIdArgs = { id: ObjectId; filter?: any; }

export type IAuthorsFindByIdsArgs = { ids: ObjectId[]; filter?: any; }

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
  async findAuthorById(_: any, { id, filter }: IAuthorFindByIdArgs, context: IAuthorContext) {
    return context.authors.findOne({ _id: id, ...filter })
  },
  async findAuthorsByIds(_: any, { ids, filter }: IAuthorsFindByIdsArgs, context: IAuthorContext) {
    const authors = await context.authors.find({ _id: { $in: ids }, ...filter }).toArray()
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

export type IAuthorUpdateArgs = { id: ObjectId, filter: any, authorSet: IAuthorSetArgs }

export type IAuthorsUpdateManyArgs = { ids: ObjectId[], filter: any, authorSet: IAuthorSetArgs }

export type IAuthorRemoveArgs = { id: ObjectId, filter: any }

export type IAuthorsRemoveManyArgs = { ids: ObjectId[], filter: any }

export const authorMutationResolvers = {
  async insertAuthor(_: any, { author }: IAuthorInsertArgs, context: IAuthorContext) {
    const response = await context.authors.insertOne(author)
    return {
      _id: response.insertedId,
      ...author
    }
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
  async updateAuthor(_: any, { id, filter, authorSet }: IAuthorUpdateArgs, context: IAuthorContext) {
      const value = await context.authors.findOneAndUpdate({ 
        _id: id, ...filter
      }, {
        $set: authorSet
      }, {
        returnDocument: 'after'
      })
      return value || null
  },
  async updateManyAuthors(_: any, { 
      ids, 
      filter, 
      authorSet 
    }: IAuthorsUpdateManyArgs, context: IAuthorContext) {
    await context.authors.updateMany(
      { _id: { $in: ids }, ...filter },
      {
        $set: authorSet
      }
    )
    const authors = await context.authors.find({ _id: { $in: ids, ...filter } }).toArray()
    const authorsById = keyBy(authors, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => authorsById[id])
  },
  async removeAuthor(_: any, { id, filter }: IAuthorRemoveArgs, context: IAuthorContext) {
    const value = await context.authors.findOneAndDelete({ _id: id, ...filter })
    return value || null
  },
  async removeManyAuthors(_: any, { ids, filter }: IAuthorsRemoveManyArgs, context: IAuthorContext) {
    const authors = await context.authors.find({ _id: { $in: ids }, ...filter }).toArray()
    const authorsById = keyBy(authors, fromMongoId)
    await context.authors.deleteMany({ _id: { $in: ids }, ...filter })
    return ids.map(id => id.toHexString()).map(id => authorsById[id])
  },
}

export const authorCrudResolvers = { Query: authorQueryResolvers, Mutation: authorMutationResolvers, Author: authorResolvers }

export type IBooksCollection = Collection<Book>

export type IBookContext = { books: IBooksCollection }

export const getBooksCollection = (db: Db) => db.collection<Book>('books')

export const bookResolvers: BookResolvers<IBookContext> = { id: fromMongoId }

export type IBookFilterArgs = { title?: { EQ?: string; GT?: string; GTE?: string; IN?: string[]; ALL?: string[]; LT?: string; LTE?: string; NE?: string; NIN?: string[]; }, author?: { EQ?: string; GT?: string; GTE?: string; IN?: string[]; ALL?: string[]; LT?: string; LTE?: string; NE?: string; NIN?: string[]; }, tags?: { EQ?: string; GT?: string; GTE?: string; IN?: string[]; ALL?: string[]; LT?: string; LTE?: string; NE?: string; NIN?: string[]; }, category?: { EQ?: Category; GT?: Category; GTE?: Category; IN?: Category[]; ALL?: Category[]; LT?: Category; LTE?: Category; NE?: Category; NIN?: Category[]; }, OR?: { EQ?: Book; GT?: Book; GTE?: Book; IN?: Book[]; ALL?: Book[]; LT?: Book; LTE?: Book; NE?: Book; NIN?: Book[]; }[] }

export type IBookFindArgs = { filter: IBookFilterArgs, textsearch: ITextSearch, pagination: Pagination, sort: Sort }

export type IBookFindByIdArgs = { id: ObjectId; filter?: any; }

export type IBooksFindByIdsArgs = { ids: ObjectId[]; filter?: any; }

export const bookQueryResolvers = {
  async findBooks(_: any, { filter, textsearch, pagination, sort }: IBookFindArgs, context: IBookContext) {
    const query = mapFilterToMongo(filter || {})
    if (textsearch) query.$text = mapTextSearchToMongo(textsearch)
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
  async findBookById(_: any, { id, filter }: IBookFindByIdArgs, context: IBookContext) {
    return context.books.findOne({ _id: id, ...filter })
  },
  async findBooksByIds(_: any, { ids, filter }: IBooksFindByIdsArgs, context: IBookContext) {
    const books = await context.books.find({ _id: { $in: ids }, ...filter }).toArray()
    const booksById = keyBy(books, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => booksById[id])
  },
}

export const ensureBooksSearchIndex = async function (context: IBookContext) {
    return context.books.createIndex({
      title: 'text', author: 'text'
    })
  }

export type IBookInsert = { title?: string, author?: string, tags?: string[], category?: Category }

export type IBookInsertArgs = { book: IBookInsert }

export type IBooksInsertManyArgs = { books: IBookInsert[] }

export type IBookSetArgs = { title?: string, author?: string, tags?: string[], category?: Category }

export type IBookUnsetArgs = { title?: 1, author?: 1, tags?: 1, category?: 1 }

export type IBookDecArgs = {  }

export type IBookIncArgs = {  }

export type IBookUpdateArgs = { id: ObjectId, filter: any, bookSet: IBookSetArgs }

export type IBooksUpdateManyArgs = { ids: ObjectId[], filter: any, bookSet: IBookSetArgs }

export type IBookRemoveArgs = { id: ObjectId, filter: any }

export type IBooksRemoveManyArgs = { ids: ObjectId[], filter: any }

export const bookMutationResolvers = {
  async insertBook(_: any, { book }: IBookInsertArgs, context: IBookContext) {
    const response = await context.books.insertOne(book)
    return {
      _id: response.insertedId,
      ...book
    }
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
  async updateBook(_: any, { id, filter, bookSet }: IBookUpdateArgs, context: IBookContext) {
      const value = await context.books.findOneAndUpdate({ 
        _id: id, ...filter
      }, {
        $set: bookSet
      }, {
        returnDocument: 'after'
      })
      return value || null
  },
  async updateManyBooks(_: any, { 
      ids, 
      filter, 
      bookSet 
    }: IBooksUpdateManyArgs, context: IBookContext) {
    await context.books.updateMany(
      { _id: { $in: ids }, ...filter },
      {
        $set: bookSet
      }
    )
    const books = await context.books.find({ _id: { $in: ids, ...filter } }).toArray()
    const booksById = keyBy(books, fromMongoId)
    return ids.map(id => id.toHexString()).map(id => booksById[id])
  },
  async removeBook(_: any, { id, filter }: IBookRemoveArgs, context: IBookContext) {
    const value = await context.books.findOneAndDelete({ _id: id, ...filter })
    return value || null
  },
  async removeManyBooks(_: any, { ids, filter }: IBooksRemoveManyArgs, context: IBookContext) {
    const books = await context.books.find({ _id: { $in: ids }, ...filter }).toArray()
    const booksById = keyBy(books, fromMongoId)
    await context.books.deleteMany({ _id: { $in: ids }, ...filter })
    return ids.map(id => id.toHexString()).map(id => booksById[id])
  },
}

export const bookCrudResolvers = { Query: bookQueryResolvers, Mutation: bookMutationResolvers, Book: bookResolvers }
export const crudResolvers = [authorCrudResolvers, bookCrudResolvers]

export function mongoCollectionFactory (db: Db) {
  const authors = getAuthorsCollection(db)
const books = getBooksCollection(db)

  return {
    authors,
books
  }
}