import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WebPushService } from './web-push.service';
import { CreateWebPushDto, SendNotificationDto } from './dto/create-web-push.dto';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { Db, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { COLLECTIONS } from '../db/collections';

@Controller('web-push')
export class WebPushController {
  private readonly subscriptionsCollection;

  constructor(
    private readonly pushNotificationService: WebPushService,
    @InjectConnection() private readonly db: Db
  ) {
    this.subscriptionsCollection = this.db.collection(COLLECTIONS.SUBSCRIPTIONS);
  }

  @Post('subscribe')
  subscribe(@Body() subscription: CreateWebPushDto) {
    this.pushNotificationService.addSubscription(subscription);
    // this.subscriptions.push(subscription)

    return { message: 'Subscribed successfully!' };
  }
}
