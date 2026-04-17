import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [CampaignController],
  providers: [CampaignService, UsersService],
})
export class CampaignModule {}
