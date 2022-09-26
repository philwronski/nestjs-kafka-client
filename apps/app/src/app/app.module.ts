import { Module } from '@nestjs/common';
import JsonResponseDeserializer from '../../../../libs/nestjs-kafka-client/src/lib/deserializer/json-response.deserializer';
import { KafkaModule } from '../../../../libs/nestjs-kafka-client/src/lib/kafka.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    KafkaModule.register([
      {
        client: {
          clientId: 'HERO_CLIENT',
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'HERO_CONSUMER',
        },
        subscribe: {
          topics: ['hero'],
        },
        deserializer: new JsonResponseDeserializer(),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
