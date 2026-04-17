import { Module } from '@nestjs/common'
import { WebPushService } from './web-push.service'
import { WebPushController } from './web-push.controller'

@Module({
  // imports: [MenuModule],
  controllers: [WebPushController],
  providers: [WebPushService],
  exports: [WebPushService],
})
export class WebPushModule {}
