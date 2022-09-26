import { DynamicModule, Global, Module } from '@nestjs/common';
import { KafkaOptions } from './interfaces';
import KafkaClient from './kafka.client';

@Global()
@Module({})
export class KafkaModule {
  static register(options: KafkaOptions[]): DynamicModule {
    const clients = options.map((clientOptions) => ({
      provide: clientOptions.client.clientId || KafkaClient.name,
      useValue: new KafkaClient(clientOptions),
    }));

    return {
      module: KafkaModule,
      providers: clients,
      exports: clients,
    };
  }
}
