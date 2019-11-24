import {
  ServiceUnion,
  ServiceResolveImplementation,
  InterceptImplementation,
  ServiceExceptionsUnion,
  AbstractSchema,
  ServiceKind,
  ServiceImplementation
} from '~/types';
import { Element } from '../Element';
import {
  ServiceInput,
  ServiceElement,
  ServiceQueryInput,
  ServiceMutationInput,
  ServiceSubscriptionInput,
  ServiceInterceptOptions
} from './definitions';
import { Schema } from '../Schema';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { isServiceImplementation } from '~/inspect';

export class Service<
  T = false,
  K extends ServiceKind = ServiceKind,
  I = any,
  O = any,
  C = any
> extends Element<ServiceUnion> {
  public static ensure<
    T = false,
    K extends ServiceKind = ServiceKind,
    I = any,
    O = any,
    C = any
  >(service: ServiceInput<T, K, I, O, C>): Service<T, K, I, O, C> {
    return service instanceof Service ? service : new Service(service as any);
  }
  public static query<I = any, O = any, C = any>(
    query: ServiceQueryInput<true, I, O, C>
  ): Service<true, 'query', I, O, C> {
    return new Service({ kind: 'query', ...query });
  }
  public static mutation<I = any, O = any, C = any>(
    mutation: ServiceMutationInput<true, I, O, C>
  ): Service<true, 'mutation', I, O, C> {
    return new Service({ kind: 'mutation', ...mutation });
  }
  public static subscription<I = any, O = any, C = any>(
    subscription: ServiceSubscriptionInput<true, I, O, C>
  ): Service<true, 'subscription', I, O, C> {
    return new Service({ kind: 'subscription', ...subscription });
  }
  public readonly kind: K;
  public readonly request: string | AbstractSchema;
  public readonly response: string | AbstractSchema;
  public readonly exceptions: ServiceExceptionsUnion;
  public readonly resolve: ServiceElement<T, K, I, O, C>['resolve'];
  public readonly intercepts: ServiceElement<T, K, I, O, C>['intercepts'];
  public constructor(service: ServiceInput<T, K, I, O, C>) {
    super(service.kind);
    this.request = service.request || new Schema(null, { type: 'object' });
    this.response = service.response || new Schema(null, { type: 'null' });
    this.exceptions = service.exceptions || [];

    if (service.resolve) {
      const fn = service.resolve;
      let resolve: ServiceResolveImplementation;
      const intercepts = (service.intercepts ||
        []) as InterceptImplementation[];

      if (service.kind === 'subscription') {
        resolve = function resolve(this: any, ...args: any) {
          const get = async (): Promise<Observable<any>> => {
            return (fn as any).apply(this, args);
          };
          return from(get()).pipe(switchMap((obs) => obs));
        };
      } else {
        resolve = async function resolve(this: any, ...args: any) {
          return (fn as any).apply(this, args);
        };
      }

      this.resolve = resolve as ServiceElement<T, K, I, O, C>['resolve'];
      this.intercepts = intercepts as ServiceElement<
        T,
        K,
        I,
        O,
        C
      >['intercepts'];
    }
  }
  public intercept(
    this: ServiceImplementation,
    intercepts: InterceptImplementation | InterceptImplementation[],
    options?: ServiceInterceptOptions
  ): Service<T, K, I, O, C> {
    if (!isServiceImplementation(this)) {
      throw Error(`Intercepts can only be applied to service implementations`);
    }
    const opts = Object.assign({ prepend: true }, options);
    const arr =
      intercepts && !Array.isArray(intercepts) ? [intercepts] : intercepts;

    return new Service({
      ...(this as any),
      intercepts: opts.prepend
        ? arr.concat(this.intercepts || [])
        : (this.intercepts || []).concat(arr)
    });
  }
  public element(): ServiceElement<T, K, I, O, C> {
    return (this.resolve
      ? {
          kind: this.kind,
          exceptions: this.exceptions,
          request: this.request,
          response: this.response,
          resolve: this.resolve,
          intercepts: this.intercepts
        }
      : {
          kind: this.kind,
          exceptions: this.exceptions,
          request: this.request,
          response: this.response
        }) as ServiceElement<T, K, I, O, C>;
  }
}
