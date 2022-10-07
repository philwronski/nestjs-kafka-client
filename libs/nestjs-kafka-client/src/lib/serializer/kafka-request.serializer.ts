import { Serializer } from '@nestjs/microservices';
import { KafkaMessage, KafkaRequest } from '../interfaces';

class KafkaRequestSerializer implements Serializer<KafkaMessage, KafkaRequest> {
  serialize(
    message: KafkaMessage,
    options?: Record<string, any>
  ): KafkaRequest {
    const { key, value } = message;
    return {
      key: key || null,
      value,
      headers: options?.['headers'] || {},
    };
  }
}

export default KafkaRequestSerializer;
