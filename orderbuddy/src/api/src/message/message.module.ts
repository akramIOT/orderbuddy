import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
