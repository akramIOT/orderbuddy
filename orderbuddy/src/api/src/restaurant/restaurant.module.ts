import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [MessageModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, ConfigService, UsersService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
