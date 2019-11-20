import {
  QueryServiceImplementation,
  MutationServiceImplementation,
  SubscriptionServiceImplementation,
  ServiceErrorsImplementation,
  ErrorTypeImplementation,
  RequestTypeImplementation
} from './implementation';
import {
  SubscriptionServiceDeclaration,
  MutationServiceDeclaration,
  QueryServiceDeclaration,
  ServiceErrorsDeclaration,
  ErrorTypeDeclaration,
  RequestTypeDeclaration
} from './declaration';
import {
  AbstractTreeElement,
  AbstractCollectionTree,
  AbstractElement,
  AbstractTypeElement,
  AbstractServiceElement,
  AbstractScopeTree,
  AbstractTreeTypes,
  AbstractTreeServices,
  AbstractHashServices,
  AbstractCrudServices,
  AbstractTreeScopes,
  AbstractResponseTypeChildren,
  AbstractResponseType
} from './abstract';
import { ErrorLabel } from '../types';

// Groups
export type Element = AbstractElement<
  QueryService,
  MutationService,
  SubscriptionService
>;

export type TreeElement = AbstractTreeElement<
  QueryService,
  MutationService,
  SubscriptionService
>;

export type TypeElement = AbstractTypeElement<
  QueryService,
  SubscriptionService
>;

export type ServiceElement = AbstractServiceElement<
  QueryService,
  MutationService,
  SubscriptionService
>;

export type CollectionTree = AbstractCollectionTree<
  QueryService,
  MutationService,
  SubscriptionService
>;

export type ScopeTree = AbstractScopeTree<
  QueryService,
  MutationService,
  SubscriptionService
>;

export type TreeTypes = AbstractTreeTypes<QueryService, SubscriptionService>;

export type TreeServices = AbstractTreeServices<
  QueryService,
  MutationService,
  SubscriptionService
>;

export type HashServices = AbstractHashServices<
  QueryService,
  MutationService,
  SubscriptionService
>;

export type CrudServices = AbstractCrudServices<
  QueryService,
  MutationService,
  SubscriptionService
>;

export type TreeScopes = AbstractTreeScopes<
  QueryService,
  MutationService,
  SubscriptionService
>;

// Services
export type QueryService = QueryServiceDeclaration | QueryServiceImplementation;

export type MutationService =
  | MutationServiceDeclaration
  | MutationServiceImplementation;

export type SubscriptionService =
  | SubscriptionServiceDeclaration
  | SubscriptionServiceImplementation;

export type ServiceErrors =
  | ServiceErrorsDeclaration
  | ServiceErrorsImplementation;

// Types
export type ErrorType<L extends ErrorLabel = ErrorLabel> =
  | ErrorTypeDeclaration<L>
  | ErrorTypeImplementation<L>;

export type RequestType = RequestTypeDeclaration | RequestTypeImplementation;

export type ResponseType = AbstractResponseType<
  QueryService,
  SubscriptionService
>;

export type ResponseTypeChildren = AbstractResponseTypeChildren<
  QueryService,
  SubscriptionService
>;
