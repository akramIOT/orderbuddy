import { Module } from '@nestjs/common';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [StationsController],
  providers: [StationsService, UsersService],
})
export class StationsModule {}
