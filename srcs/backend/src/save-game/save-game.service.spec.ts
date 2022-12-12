import { Test, TestingModule } from '@nestjs/testing';
import { SaveGameService } from './save-game.service';

describe('SaveGameService', () => {
  let service: SaveGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaveGameService],
    }).compile();

    service = module.get<SaveGameService>(SaveGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
