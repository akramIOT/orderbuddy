import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { JobService } from './job.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, JobService],
  exports: [AiService, JobService],
})
export class AiModule {}
