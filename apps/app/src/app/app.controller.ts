import { Controller, Get, Inject, Logger } from '@nestjs/common';

import {
  Consumer,
  EventPattern,
} from '../../../../libs/nestjs-kafka-client/src/lib/decorators';
import { KafkaResponse } from '../../../../libs/nestjs-kafka-client/src/lib/interfaces';
import KafkaClient from '../../../../libs/nestjs-kafka-client/src/lib/kafka.client';

import { AppService } from './app.service';

type Hero = { name: string; city: string };

@Controller()
@Consumer
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    @Inject('HERO_CLIENT') private client: KafkaClient
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @EventPattern({ topics: ['hero'] })
  getHero(data: Hero, context: KafkaResponse) {
    this.logger.log(data, data.name, context);
  }

  @Get('/hero')
  async publishHero() {
    await this.client.send({
      topic: 'hero',
      messages: [{ value: 'Welcome Batman' }],
    });
  }

  @Get('/heroobject')
  async publishHeroObject() {
    const hero: Hero = {
      name: 'Batman',
      city: 'Gotham City',
    };
    await this.client.send({
      topic: 'hero',
      messages: [{ value: hero }],
    });
  }
}
