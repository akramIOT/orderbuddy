import { Module } from '@nestjs/common';
import { OriginsService } from './origins.service';
import { OriginsController } from './origins.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { StorageModule } from '../storage/storage.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [HttpModule, ConfigModule, StorageModule, EmailModule],
  controllers: [OriginsController],
  providers: [OriginsService, UsersService],
})
export class OriginsModule {}
