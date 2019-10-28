import { ApplicationServices, PublicError, safeTrigger } from '@karmic/core';
import { RPCServerConnection } from '../types';
import { DataInput, DataParser } from '~/types';
import { ChannelManager } from './ChannelManager';
import { resolve } from './resolve';
import { lazy } from 'promist';

export class ServerManager {
  private id: number;
  private routes: ApplicationServices;
  private parser: DataParser;
  private ensure: (error: Error) => PublicError;
  private disconnects: { [key: string]: () => void };
  public constructor(
    routes: ApplicationServices,
    parser: DataParser,
    ensure: (error: Error) => PublicError
  ) {
    this.id = 0;
    this.routes = routes;
    this.parser = parser;
    this.ensure = ensure;
    this.disconnects = {};
  }
  public connect(connection: RPCServerConnection): () => void {
    const disconnects = this.disconnects;
    const channels = new ChannelManager(this.ensure);
    const context = lazy.fn(connection.context || (() => ({})));

    let open = true;
    const id = this.nextId();
    const subscription = connection.data$.subscribe({
      next: (data: DataInput) => {
        resolve(
          data,
          context,
          channels,
          this.routes,
          async (data) => this.parser.deserialize(data),
          (error: Error) => {
            if (open) connection.actions.report(error);
          },
          (data) => {
            if (!open) return;
            const serialize = async (): Promise<void> => {
              const buffer = await this.parser.serialize(data);
              if (open) await connection.actions.send(buffer);
            };
            serialize().catch((err) => connection.actions.report(err));
          }
        );
      },
      error: complete,
      complete: complete
    });

    function complete(): void {
      open = false;
      channels.destroy();
      safeTrigger(
        () => Boolean(subscription),
        () => subscription.unsubscribe()
      );
      if (Object.hasOwnProperty.call(disconnects, id)) {
        delete disconnects[id];
      }
    }

    function disconnect(): void {
      if (!open) return;
      connection.actions.close();
      complete();
    }

    this.disconnects[id] = disconnect;

    return disconnect;
  }
  public terminate(): void {
    for (const disconnect of Object.values(this.disconnects)) {
      disconnect();
    }
  }
  private nextId(): number {
    return this.id++;
  }
}