import { Test, TestingModule } from '@nestjs/testing';
import { LocationSettingsController } from './location-settings.controller';
import { LocationSettingsService } from './location-settings.service';

describe('LocationSettingsController', () => {
  let controller: LocationSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationSettingsController],
      providers: [LocationSettingsService],
    }).compile();

    controller = module.get<LocationSettingsController>(LocationSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
