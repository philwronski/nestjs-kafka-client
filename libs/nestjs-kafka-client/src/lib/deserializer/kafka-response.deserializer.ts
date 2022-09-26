import { Deserializer } from '@nestjs/microservices';
import { KafkaMessage } from 'kafkajs';
import { KafkaResponse } from '../interfaces';

class KafkaResponseDeserializer
  implements Deserializer<KafkaMessage, KafkaResponse>
{
  deserialize(
    message: KafkaMessage,
    options?: Record<string, any>
  ): Promise<KafkaResponse> | KafkaResponse {
    const { headers } = message;
    let key: string | Buffer | undefined = message.key || undefined;
    let value: string | Buffer | null = message.value;

    if (Buffer.isBuffer(key)) {
      key = Buffer.from(key).toString();
    }

    if (Buffer.isBuffer(value)) {
      value = Buffer.from(value).toString();
    }

    if (headers) {
      Object.keys(headers).forEach((key) => {
        if (Buffer.isBuffer(headers[key])) {
          headers[key] = Buffer.from(headers[key] as any).toString();
        }
      });
    }

    return {
      ...message,
      key,
      value,
      headers,
    };
  }
}

export default KafkaResponseDeserializer;
