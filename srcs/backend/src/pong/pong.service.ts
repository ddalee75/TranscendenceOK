import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { interval, Subscription } from 'rxjs';
import { SaveGameService } from 'src/save-game/save-game.service';
import { UserService } from 'src/user/user.service';
import { Game } from './game/game';
import { IInput } from './game/interfaces/input.interface';
import { SGame } from './game/interfaces/save-game.interface';
import { PongGateway } from './pong.gateway';

const interval_tick = 8;

interface ITest {
  name: string;
  playerLeft: User;
  playerRight: User;
  game: Game;
  activatePowerUp: boolean | undefined;
  tickSubscription: Subscription;
}

@Injectable()
export class PongService {
  games: ITest[] = [];

  constructor(
    private pongGateway: PongGateway,
    private saveGame: SaveGameService,
    private userService: UserService,
  ) {}

  public returnGames() {
    return this.games;
  }

  public start(name: string): void {
    this.games.find((game) => game.name === name)?.game.start();
  }

  public addGame(name: string): void;
  public addGame(name: string, powerUp?: boolean): void;
  public addGame(
    name: string,
    activatePowerUp?: boolean,
    playerLeft?: User,
    playerRight?: User,
  ): void;
  public addGame(
    name: string,
    activatePowerUp?: boolean,
    playerLeft?: User,
    playerRight?: User,
  ): void {
    if (this.games.find((game) => game.name === name) == undefined) {
      const newGame: ITest = {
        name: name,
        game: new Game(),
        activatePowerUp: activatePowerUp,
        playerLeft: playerLeft,
        playerRight: playerRight,
        tickSubscription: interval(interval_tick).subscribe(() => {
          this.tick(name);
        }),
      };
      if (activatePowerUp === true) {
        newGame.game.updatePowerUp(true);
      }
      this.games.push(newGame);
      //TODO: sleep 1 seconde le temps que la partie soit charger pour tout les clients
      this.start(name);
    }
  }

  public deleteGame(name: string): void {
    this.end(name);
    // this.socketService.closeGameRoom(this.name);
  }

  public getGames(): SGame[] {
    const games: SGame[] = [];
    for (let index = 0; index < this.games.length; index++) {
      const element = this.games[index];
      games.push({
        roomName: element.name,
        players: [element.playerLeft, element.playerRight],
        player1_score: element.game.getGameStates().scoreLeft,
        player2_score: element.game.getGameStates().scoreRight,
        winner: null,
      });
    }
    return games;
  }

  public updateMove(move: IInput, name: string): void {
    this.games.find((game) => game.name === name)?.game.updateInput(move);
  }

  public reset(name: string): void {
    const game = this.games.find((game) => game.name === name);
    if (game != undefined) {
      this.deleteGame(name);
      this.addGame(
        name,
        game.activatePowerUp,
        game.playerLeft,
        game.playerRight,
      );
    } else {
      this.addGame(name);
    }
    // this.games
    //   .find((game) => game.name === name)
    //   ?.game.updateStates(structuredClone(defaultGameConfig.states));
  }

  end(name: string): void {
    this.save(name);
    this.games
      .find((game) => game.name === name)
      ?.tickSubscription.unsubscribe();
    this.games.splice(
      this.games.findIndex((game) => game.name === name),
      1,
    );
  }

  save(name: string): void {
    const game = this.games.find((game) => game.name === name);
    if (game != undefined) {
      const sgame: SGame = {
        roomName: game.name,
        players: [game.playerLeft, game.playerRight],
        player1_score: game.game.getGameStates().scoreLeft,
        player2_score: game.game.getGameStates().scoreRight,
        winner: null,
      };
      this.pongGateway.gameIsFinished(sgame);
      // this.saveGame.createGame(sgame);

      //addXp for winner
      if (sgame.player1_score > sgame.player2_score) {
        this.userService.addXp({ id: sgame.players[0].id, addXp: 1 });
      } else {
        this.userService.addXp({ id: sgame.players[1].id, addXp: 1 });
      }
    }
  }

  tick(name: string): void {
    const game = this.games.find((game) => game.name === name);
    game?.game.tick();
    this.pongGateway.sendGameStates(game?.game.getGameStates(), name);
    if (game?.game.getWinner() != null) {
      //TODO: fin de partie
      this.end(name);
    }
  }
}
