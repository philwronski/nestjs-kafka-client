import { Serializer } from '@nestjs/microservices';
import { KafkaMessage, KafkaRequest } from '../interfaces';
import { JSONValue } from '../json/json.type';

class JsonRequestSerializer
  implements Serializer<KafkaMessage<JSONValue, JSONValue>, KafkaRequest>
{
  serialize(
    message: KafkaMessage<JSONValue, JSONValue>,
    options?: Record<string, any>
  ): KafkaRequest {
    const { key, value } = message;
    return {
      key: key ? new Buffer(JSON.stringify(key)) : null,
      value: new Buffer(JSON.stringify(value)),
      headers: options?.['headers'] || {},
    };
  }
}

export default JsonRequestSerializer;
