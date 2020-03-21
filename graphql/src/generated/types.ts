export type Maybe<T> = T | null;

export interface QuestionInput {
  text: string;

  answers: string[];

  tags?: Maybe<(Maybe<string>)[]>;

  difficulty: number;

  authorId: string;
}

export interface UserInput {
  email: string;

  name: string;
}

// ====================================================
// Types
// ====================================================

export interface Query {
  _empty?: Maybe<string>;

  questions: (Maybe<Question>)[];

  users: User[];
}

export interface Question {
  id: string;

  text: string;

  answers: string[];

  tags?: Maybe<(Maybe<string>)[]>;

  difficulty: number;

  authorId: string;

  avgCorrect: number;

  lastUpdated: string;
}

export interface User {
  id: string;

  email: string;

  name: string;
}

export interface Mutation {
  _empty?: Maybe<string>;

  addQuestion: Question;

  addUser: User[];
}

// ====================================================
// Arguments
// ====================================================

export interface QuestionsQueryArgs {
  ignored?: Maybe<string>;
}
export interface UsersQueryArgs {
  ignored?: Maybe<string>;
}
export interface AddQuestionMutationArgs {
  questionInput?: Maybe<QuestionInput>;
}
export interface AddUserMutationArgs {
  userInput?: Maybe<UserInput>;
}

import { GraphQLResolveInfo } from "graphql";

import { IContext } from "../context";

export type Resolver<Result, Parent = {}, TContext = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, TContext, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<
  Result,
  Parent = {},
  TContext = {},
  Args = {}
> =
  | ((
      ...args: any[]
    ) => ISubscriptionResolverObject<Result, Parent, TContext, Args>)
  | ISubscriptionResolverObject<Result, Parent, TContext, Args>;

export type TypeResolveFn<Types, Parent = {}, TContext = {}> = (
  parent: Parent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export namespace QueryResolvers {
  export interface Resolvers<TContext = IContext, TypeParent = {}> {
    _empty?: _EmptyResolver<Maybe<string>, TypeParent, TContext>;

    questions?: QuestionsResolver<(Maybe<Question>)[], TypeParent, TContext>;

    users?: UsersResolver<User[], TypeParent, TContext>;
  }

  export type _EmptyResolver<
    R = Maybe<string>,
    Parent = {},
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type QuestionsResolver<
    R = (Maybe<Question>)[],
    Parent = {},
    TContext = IContext
  > = Resolver<R, Parent, TContext, QuestionsArgs>;
  export interface QuestionsArgs {
    ignored?: Maybe<string>;
  }

  export type UsersResolver<
    R = User[],
    Parent = {},
    TContext = IContext
  > = Resolver<R, Parent, TContext, UsersArgs>;
  export interface UsersArgs {
    ignored?: Maybe<string>;
  }
}

export namespace QuestionResolvers {
  export interface Resolvers<TContext = IContext, TypeParent = Question> {
    id?: IdResolver<string, TypeParent, TContext>;

    text?: TextResolver<string, TypeParent, TContext>;

    answers?: AnswersResolver<string[], TypeParent, TContext>;

    tags?: TagsResolver<Maybe<(Maybe<string>)[]>, TypeParent, TContext>;

    difficulty?: DifficultyResolver<number, TypeParent, TContext>;

    authorId?: AuthorIdResolver<string, TypeParent, TContext>;

    avgCorrect?: AvgCorrectResolver<number, TypeParent, TContext>;

    lastUpdated?: LastUpdatedResolver<string, TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = Question,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type TextResolver<
    R = string,
    Parent = Question,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type AnswersResolver<
    R = string[],
    Parent = Question,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type TagsResolver<
    R = Maybe<(Maybe<string>)[]>,
    Parent = Question,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type DifficultyResolver<
    R = number,
    Parent = Question,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type AuthorIdResolver<
    R = string,
    Parent = Question,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type AvgCorrectResolver<
    R = number,
    Parent = Question,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type LastUpdatedResolver<
    R = string,
    Parent = Question,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
}

export namespace UserResolvers {
  export interface Resolvers<TContext = IContext, TypeParent = User> {
    id?: IdResolver<string, TypeParent, TContext>;

    email?: EmailResolver<string, TypeParent, TContext>;

    name?: NameResolver<string, TypeParent, TContext>;
  }

  export type IdResolver<
    R = string,
    Parent = User,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type EmailResolver<
    R = string,
    Parent = User,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type NameResolver<
    R = string,
    Parent = User,
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
}

export namespace MutationResolvers {
  export interface Resolvers<TContext = IContext, TypeParent = {}> {
    _empty?: _EmptyResolver<Maybe<string>, TypeParent, TContext>;

    addQuestion?: AddQuestionResolver<Question, TypeParent, TContext>;

    addUser?: AddUserResolver<User[], TypeParent, TContext>;
  }

  export type _EmptyResolver<
    R = Maybe<string>,
    Parent = {},
    TContext = IContext
  > = Resolver<R, Parent, TContext>;
  export type AddQuestionResolver<
    R = Question,
    Parent = {},
    TContext = IContext
  > = Resolver<R, Parent, TContext, AddQuestionArgs>;
  export interface AddQuestionArgs {
    questionInput?: Maybe<QuestionInput>;
  }

  export type AddUserResolver<
    R = User[],
    Parent = {},
    TContext = IContext
  > = Resolver<R, Parent, TContext, AddUserArgs>;
  export interface AddUserArgs {
    userInput?: Maybe<UserInput>;
  }
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  SkipDirectiveArgs,
  IContext
>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  IContext
>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  IContext
>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string;
}

export type IResolvers<TContext = IContext> = {
  Query?: QueryResolvers.Resolvers<TContext>;
  Question?: QuestionResolvers.Resolvers<TContext>;
  User?: UserResolvers.Resolvers<TContext>;
  Mutation?: MutationResolvers.Resolvers<TContext>;
} & { [typeName: string]: never };

export type IDirectiveResolvers<Result> = {
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
} & { [directiveName: string]: never };
