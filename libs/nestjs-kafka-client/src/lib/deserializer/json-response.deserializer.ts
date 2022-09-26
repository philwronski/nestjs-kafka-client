import { Deserializer } from '@nestjs/microservices';
import { KafkaMessage } from 'kafkajs';
import { KafkaResponse } from '../interfaces';
import { JSONValue } from '../json/json.type';

class JsonResponseDeserializer
  implements Deserializer<KafkaMessage, KafkaResponse<JSONValue, JSONValue>>
{
  deserialize(
    message: KafkaMessage,
    options?: Record<string, any>
  ):
    | Promise<KafkaResponse<JSONValue, JSONValue>>
    | KafkaResponse<JSONValue, JSONValue> {
    const { headers } = message;
    let key: JSONValue = null;
    let value: JSONValue = null;

    if (Buffer.isBuffer(message.key)) {
      key = JSON.parse(Buffer.from(message.key).toString());
    }

    if (Buffer.isBuffer(message.value)) {
      value = JSON.parse(Buffer.from(message.value).toString());
    }

    if (headers) {
      Object.keys(headers).forEach((key) => {
        if (Buffer.isBuffer(headers[key])) {
          headers[key] = JSON.parse(
            Buffer.from(headers[key] as any).toString()
          );
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

export default JsonResponseDeserializer;
