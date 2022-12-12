import { Injectable } from '@nestjs/common';
import { SGame } from 'src/pong/game/interfaces/save-game.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SaveGameService {
  constructor(private Prisma: PrismaService) {}

  async createGame(game: SGame) {
    if (game.players[0] != undefined && game.players[1] != undefined) {
      try{
        let result = await this.Prisma.game.create({
          data: {
            roomName: game.roomName,
            players: {
              connect:  [{id: game.players[0].id}, {id: game.players[1].id}]
            },
            player1_score: game.player1_score,
            player2_score: game.player2_score,
            player1_id: game.players[0].id,
            player2_id: game.players[1].id
          }, include: {
			players: true
		  }
      });
      if (result !== null && result !== undefined) {
		return result;
      }
      }
      catch(err){
        console.log("erreur dans saveGame :")
        console.log(err)
      }
    }
  }
}
