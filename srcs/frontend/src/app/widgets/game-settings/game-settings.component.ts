import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { filter, fromEvent, interval, Subscription } from "rxjs";
import { User } from 'src/app/models/user';
import { IBallConfig } from '../../pong/game/interfaces/ball-config.interface'
import { IRacket } from '../../pong/game/interfaces/racket.interface'
import { IRacketConfig } from '../../pong/game/interfaces/racket-config.interface'
import { IPosition } from '../../pong/game/interfaces/position.interface'
import { IPlayer } from '../../pong/game/interfaces/player.interface'
import { IInput } from '../../pong/game/interfaces/input.interface'
import { IGameStates } from '../../pong/game/interfaces/game-states.interface'
import { IBoard } from '../../pong/game/interfaces/board.interface'
import { IBoardConfig } from '../../pong/game/interfaces/board-config.interface'
import { GameMode, PlayerMode, IGame } from 'src/app/pong/game/interfaces/game.interface';
import { Game } from "../../pong/game/game";
import { Ai } from "../../pong/game/ai";
import { SocketService } from "../../services/socket.service";
import { DefaultGame } from 'src/app/pong/game/config';


@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  styleUrls: ['./game-settings.component.css'],
  providers: [Game, Ai],
})
export class GameSettingsComponent implements OnInit, OnDestroy {

  @Input() player1!:User;
  @Input() player2!:User;
  // @Input() Dest!:User;
  // @Input() Me!:User;
  
  @Output()showGameSettingsEvent= new EventEmitter<boolean>();
  @Output()globalEvent = new EventEmitter<any>();

  gameConfig!: IGame;
  moveLeft!: IInput;
  moveRight!: IInput;
  prevMoveLeft!: IInput;
  prevMoveRight!: IInput;
  game_title = "FT PONG";
  showGameSettings:boolean=false;

  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  moveSubscription!: Subscription;
  startSubscription!: Subscription;
  gameStatesSubscription!: Subscription;
  tickSubscription!: Subscription;
  upSubscription!: Subscription;
  downSubscription!: Subscription;

  global!: {player1: User, player2:  User, gameConfig: IGame, bonus: boolean};

  constructor(
    private socketService: SocketService,
    private game: Game,
    private ai: Ai) 
    {
      this.gameConfig = new DefaultGame();
      this.game = new Game();
      this.ai = new Ai();
      this.game.updateAll(this.gameConfig);
      this.ai.setAll(this.gameConfig);
      this.moveLeft = { userId: 0, up: false, down: false };
      this.moveRight = { userId: 1, up: false, down: false };
      this.prevMoveLeft = { userId: 0, up: false, down: false };
      this.prevMoveRight = { userId: 1, up: false, down: false };
    }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    
  }

  sendInvitation(bonus: boolean): void {
    this.showGameSettingsEvent.emit(this.showGameSettings);
    this.game.updateStates(new DefaultGame().states);
    this.socketService.displayInvitation(this.player2, this.player1, this.gameConfig);
    this.global = {player1: this.player1,player2: this.player2, gameConfig: this.gameConfig, bonus};
    this.globalEvent.emit(this.global);
    
  }

  resetAll(): void {
    this.game.updateAll(new DefaultGame());
  }

  goBack()
  {

    this.showGameSettingsEvent.emit(this.showGameSettings);

    
  }

}
