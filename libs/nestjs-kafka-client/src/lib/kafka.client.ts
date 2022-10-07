import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Deserializer, KafkaLogger, Serializer } from '@nestjs/microservices';
import {
  Admin,
  Consumer,
  ConsumerSubscribeTopics,
  Kafka,
  KafkaJSError,
  Producer,
  ProducerBatch,
  RecordMetadata,
} from 'kafkajs';
import KafkaResponseDeserializer from './deserializer/kafka-response.deserializer';
import {
  KafkaOptions,
  KafkaRecord,
  KafkaResponse,
  TopicsFunctionsMap,
} from './interfaces';
import KafkaRequestSerializer from './serializer/kafka-request.serializer';
import { INSTANCE_BY_TOPIC, SUBSCRIBED_TOPICS } from './store';

@Injectable()
class KafkaClient implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(KafkaClient.name);

  private client: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private admin: Admin;
  private serializer: Serializer;
  private deserializer: Deserializer;
  private options: KafkaOptions;
  private autoConnect: boolean;

  private topics: TopicsFunctionsMap = new Map();

  constructor(options: KafkaOptions) {
    const {
      client,
      consumer: consumerConfig,
      producer: producerConfig,
      logCreator,
    } = options;

    this.client = new Kafka({
      ...client,
      logCreator: logCreator || KafkaLogger.bind(null, this.logger),
    });

    this.autoConnect = options.autoConnect || true;

    this.consumer = this.client.consumer(consumerConfig);
    this.producer = this.client.producer(producerConfig);
    this.admin = this.client.admin();

    this.serializer = options?.serializer || new KafkaRequestSerializer();
    this.deserializer =
      options?.deserializer || new KafkaResponseDeserializer();
    this.options = options;

    this.initializeTopics();
  }

  async connect(): Promise<void> {
    await Promise.all([
      this.consumer.connect(),
      this.producer.connect(),
      this.admin.connect(),
    ]);

    await this.bindTopics();
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.consumer.disconnect(),
      this.producer.disconnect(),
      this.admin.disconnect(),
    ]);
  }

  async subscribe(options: ConsumerSubscribeTopics): Promise<void> {
    await this.consumer.subscribe(options);
  }

  private initializeTopics(): void {
    for (const topic of this.options.subscribe.topics) {
      const params = SUBSCRIBED_TOPICS.get(topic);
      if (!params) {
        this.logger.error(`No options found for this topic : ${topic}`);
        continue;
      }
      this.topics.set(topic, params);
    }
  }

  async bindTopics(): Promise<void> {
    const {
      subscribe: { fromBeginning },
      run,
    } = this.options;

    await Promise.all(
      Array.from(this.topics.entries()).map(([topic, params]) =>
        this.consumer.subscribe({
          topic,
          fromBeginning,
          ...params.options,
        })
      )
    );

    await this.consumer.run({
      ...run,
      eachMessage: async ({ topic, partition, message }) => {
        const options = this.topics.get(topic);
        const consumerInstance = INSTANCE_BY_TOPIC.get(topic);
        try {
          const response: KafkaResponse = await this.deserializer.deserialize(
            message,
            {
              topic,
            }
          );
          const { value, ...context } = response;
          await options?.callback.apply(consumerInstance, [value, context]);
        } catch (e) {
          this.logger.error(`Error for message ${topic}: ${e}`);

          // Log and throw to ensure we don't keep processing the messages when there is an error.
          throw e;
        }
      },
    });
  }

  async send<
    KeyType = Buffer | string | null,
    ValueType = Buffer | string | null
  >(record: KafkaRecord<KeyType, ValueType>): Promise<RecordMetadata[]> {
    if (!this.producer) {
      throw new KafkaJSError('No producer found, unable to sen message');
    }

    const messages = await Promise.all(
      record.messages.map((message) => this.serializer.serialize(message))
    );

    return this.producer.send({
      ...record,
      messages,
    });
  }

  sendBatch(batch: ProducerBatch): Promise<RecordMetadata[]> {
    return this.producer.sendBatch(batch);
  }

  async onModuleInit(): Promise<void> {
    if (this.autoConnect) {
      await this.connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }
}

export default KafkaClient;
