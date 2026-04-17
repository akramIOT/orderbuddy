import { Test, TestingModule } from '@nestjs/testing';
import { LocationSettingsService } from './location-settings.service';

describe('LocationSettingsService', () => {
  let service: LocationSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationSettingsService],
    }).compile();

    service = module.get<LocationSettingsService>(LocationSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
