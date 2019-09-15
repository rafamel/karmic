import {
  ServiceItem,
  InputHook,
  AppCollectionTree,
  AppTree,
  AppService
} from '~/types';
import { query, mutation, subscription } from '../service';
import { services as createServices } from '../services';
import { mergeCollectionArray } from './merge';
import { emptyCollection } from './empty';

export function setCollectionHooks(
  collection: AppCollectionTree,
  hooks: InputHook | InputHook[]
): AppCollectionTree {
  const empty = emptyCollection();

  return mergeCollectionArray([
    { ...empty, ...collection, services: empty.services },
    setServicesHooks('query', collection.services.query, hooks),
    setServicesHooks('mutation', collection.services.mutation, hooks),
    setServicesHooks('subscription', collection.services.subscription, hooks),
    ...Object.entries(collection.scopes).map(([name, scope]) => {
      const { types, ...other } = setCollectionHooks(
        { ...empty, ...scope },
        hooks
      );
      return { ...empty, types, scopes: { [name]: other } };
    })
  ]);
}

export function setServicesHooks<T extends AppService>(
  kind: keyof AppTree['services'],
  services: { [key: string]: T },
  hooks: InputHook | InputHook[]
): AppCollectionTree {
  const entries = Object.entries(services);
  return createServices(
    entries.reduce(
      (acc: { [key: string]: ServiceItem }, [name, service]) =>
        Object.assign(acc, { [name]: setServiceHooks(kind, service, hooks) }),
      {}
    )
  );
}

export function setServiceHooks<T extends AppService>(
  kind: keyof AppTree['services'],
  service: T,
  hooks: InputHook | InputHook[]
): ServiceItem<T> {
  switch (kind) {
    case 'query':
      return query(service, hooks) as ServiceItem<T>;
    case 'mutation':
      return mutation(service, hooks) as ServiceItem<T>;
    case 'subscription':
      return subscription(service, hooks) as ServiceItem<T>;
    default:
      throw Error(`Invalid service kind`);
  }
}
