import { Module } from '@nestjs/common'
import { OrderAppController } from './order-app.controller'
import { OrderAppService } from './order-app.service'
import { EventsModule } from '../events/events.module'
import { WebPushModule } from '../web-push/web-push.module'

@Module({
  imports: [EventsModule, WebPushModule],
  providers: [OrderAppService],
  controllers: [OrderAppController],
  exports: [OrderAppService],
})
export class OrderAppModule {}
