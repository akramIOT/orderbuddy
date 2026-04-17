import { Test, TestingModule } from '@nestjs/testing';
import { WebPushController } from './web-push.controller';
import { WebPushService } from './web-push.service';

describe('WebPushController', () => {
  let controller: WebPushController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebPushController],
      providers: [WebPushService],
    }).compile();

    controller = module.get<WebPushController>(WebPushController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
