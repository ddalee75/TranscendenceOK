import { Module } from '@nestjs/common';
import { Ai } from './game/ai';
import { Game } from './game/game';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { SaveGameModule } from 'src/save-game/save-game.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [SaveGameModule, UserModule],
  providers: [Game, Ai, PongService, PongGateway],
  exports: [PongService],
})
export class PongModule {}
