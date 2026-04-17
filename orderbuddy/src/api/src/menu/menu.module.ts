import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { EventsModule } from '../events/events.module';
import { WebPushModule } from '../web-push/web-push.module';
import { MessageModule } from '../message/message.module';
import { OrderAppModule } from '../order-app/order-app.module';

@Module({

  imports: [EventsModule, WebPushModule, MessageModule,OrderAppModule],
  providers: [MenuService],
  controllers: [MenuController],
  exports: [MenuService],
})
export class MenuModule {}
