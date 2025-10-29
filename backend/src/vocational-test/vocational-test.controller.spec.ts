import { Test, TestingModule } from '@nestjs/testing';
import { VocationalTestController } from './vocational-test.controller';

describe('VocationalTestController', () => {
  let controller: VocationalTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VocationalTestController],
    }).compile();

    controller = module.get<VocationalTestController>(VocationalTestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
