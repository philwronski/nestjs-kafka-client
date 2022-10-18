import { Deserializer, Serializer } from '@nestjs/microservices';
import {
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  IHeaders,
  KafkaConfig,
  logCreator,
  Message,
  ProducerConfig,
  ProducerRecord,
} from 'kafkajs';

export interface KafkaOptions {
  client: KafkaConfig;
  consumer: ConsumerConfig;
  run?: Omit<ConsumerRunConfig, 'eachBatch' | 'eachMessage'>;
  subscribe: ConsumerSubscribeTopics;
  producer?: ProducerConfig;
  send?: Omit<ProducerRecord, 'topic' | 'messages'>;
  serializer?: Serializer;
  deserializer?: Deserializer;
  logCreator?: logCreator;
  autoConnect?: boolean;
}

export interface KafkaResponse<KeyType = string, ValueType = any> {
  key?: KeyType;
  value: ValueType;
  timestamp: string;
  attributes: number;
  offset: string;
  size?: number;
  headers?: IHeaders;
}

export interface KafkaMessage<
  KeyType = Buffer | string | null,
  ValueType = Buffer | string | null
> extends Omit<Message, 'key' | 'value'> {
  key?: KeyType;
  value: ValueType;
}

export interface KafkaRecord<
  KeyType = Buffer | string | null,
  ValueType = Buffer | string | null
> extends Omit<ProducerRecord, 'messages'> {
  messages: KafkaMessage<KeyType, ValueType>[];
}

export type TopicsFunctionsMap = Map<
  string | RegExp,
  {
    callback: any;
    options: Omit<ConsumerSubscribeTopics, 'topics'>;
  }
>;

export type TopicsMap = Map<string, (string | RegExp)[]>;

export interface KafkaRequest<
  KeyType = Buffer | string | null,
  ValueType = Buffer | string | null
> extends Omit<Message, 'key' | 'value' | 'partition' | 'timestamp'> {
  key: KeyType;
  value: ValueType;
}
