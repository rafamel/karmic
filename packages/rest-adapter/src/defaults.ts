import { query, error, PublicError } from '@karmic/core';
import { RESTAdapterOptions } from './types';

export default function createDefaults(): Required<RESTAdapterOptions> {
  return {
    crud: true,
    children: true,
    subscriptions: true,
    declaration: '/:declaration',
    context: () => ({}),
    envelope(error, data) {
      return error
        ? {
            status: 'error',
            error: {
              id: error.id,
              code: error.code,
              description: error.message || null
            }
          }
        : {
            status: 'success',
            data: data
          };
    },
    notFound: query({
      types: {
        errors: {
          NotFoundError: error({ code: 'ClientNotFound' })
        }
      },
      async resolve() {
        throw new PublicError('NotFoundError', 'ClientNotFound');
      }
    })
  };
}