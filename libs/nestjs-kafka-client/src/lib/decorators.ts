import { ConsumerSubscribeTopics } from 'kafkajs';
import { TopicsMap } from './interfaces';
import { INSTANCE_BY_TOPIC, SUBSCRIBED_TOPICS } from './store';

const Topics = Symbol('Topics');

export function EventPattern(options: ConsumerSubscribeTopics) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const { topics, ...params } = options;

    options.topics.forEach((topic) => {
      SUBSCRIBED_TOPICS.set(topic, {
        callback: descriptor.value,
        options: params,
      });
    });

    target[Topics] = target[Topics] || new Map();
    target[Topics].set(propertyKey, topics);

    return descriptor;
  };
}

export function Consumer<T extends { new (...args: any[]): any }>(Base: T) {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args);
      const consumerTopics: TopicsMap = Base.prototype[Topics];

      consumerTopics.forEach((topics) => {
        topics.forEach((topic) => INSTANCE_BY_TOPIC.set(topic, this));
      });
    }
  };
}
