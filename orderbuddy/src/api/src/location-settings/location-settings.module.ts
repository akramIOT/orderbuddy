import { Module } from '@nestjs/common';
import { LocationSettingsService } from './location-settings.service';
import { LocationSettingsController } from './location-settings.controller';

@Module({
  controllers: [LocationSettingsController],
  providers: [LocationSettingsService],
})
export class LocationSettingsModule {}
