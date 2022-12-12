import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveGameService } from './save-game.service';

@Module({
  providers: [SaveGameService, PrismaService],
  exports: [SaveGameService],
})
export class SaveGameModule {}
