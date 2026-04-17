import { Module } from '@nestjs/common';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [PosController],
  providers: [PosService, ConfigService, UsersService],
})
export class PosModule {}
