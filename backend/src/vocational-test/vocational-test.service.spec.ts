import { Test, TestingModule } from '@nestjs/testing';
import { VocationalTestService } from './vocational-test.service';

describe('VocationalTestService', () => {
  let service: VocationalTestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VocationalTestService],
    }).compile();

    service = module.get<VocationalTestService>(VocationalTestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
