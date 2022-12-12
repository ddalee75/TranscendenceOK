import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { filter, fromEvent, interval, Subscription } from "rxjs";
import { User } from "../models/user";
import { SocketService } from "../services/socket.service";
import { StorageService } from "../services/storage.service";
import { Ai } from "./game/ai";
import { DefaultGame } from "./game/config";
import { Game } from "./game/game";
import { IGameStates } from "./game/interfaces/game-states.interface";
import { IGame, PlayerMode } from "./game/interfaces/game.interface";
import { IInput } from "./game/interfaces/input.interface";

const interval_tick = 8;
const keyStart = " ";

//partie en 3 acte:
// gestion des param (config de la partie)
// partie en cours
// affichage du scors final

// ajoue d'un mod bonus:
// taille ball/rackette
// vitess ball/racquett

//ajout d'un bouton start

//si pause ne fonctionne pas : le desactiver

//ajout des fonctions secrete:
//1: passage du joueur left en mode local
//2: passage du joueur left en mode ai easy
//3: passage du joueur left en mode ai hard

@Component({
  selector: "app-pong",
  templateUrl: "./pong.component.html",
  styleUrls: ["./pong.component.css"],
  providers: [Game, Ai],
})
export class PongComponent implements OnInit, OnDestroy {
  //une config doit etre envoyer pour configurer une partie
  @Input()
  customs: IGame = new DefaultGame();

  gameConfig: IGame = new DefaultGame();
  Me: User = {
		id: this.storageService.getId(),
		login: this.storageService.getLogin(),
		email: this.storageService.getEmail(),
		first_name: this.storageService.getFirstName(),
		last_name: this.storageService.getLastName(),
		url: this.storageService.getUrl(),
		displayname: this.storageService.getDisplayName(),
		nickname: this.storageService.getNickName(),
		image: this.storageService.getImage(),
		avatar: this.storageService.getAvatar(),
		online: this.storageService.getOnline(),
		level: this.storageService.getLvl()
	};
  // initGameConfig(): IGame{
  //   let data = new DefaultGame();
  //   data.left = this.customs.left;
  //   data.right = this.customs.right;
  //   return data;
  // }

  //nom de la room pong (en cours de dev)
  @Input()
  gameName = "bidule";

  // showscore:boolean=false;

  moveLeft: IInput;
  moveRight: IInput;
  prevMoveLeft: IInput;
  prevMoveRight: IInput;
  game_title = "FT PONG";

  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  moveSubscription!: Subscription;
  //startSubscription!: Subscription;
  gameStatesSubscription!: Subscription;
  tickSubscription!: Subscription;

  //event clavier
  upSubscription!: Subscription;
  downSubscription!: Subscription;

  testGameStatesSubscription!: Subscription;
  
  //event souri
  canvasMouseUpSubscription!: Subscription;
  canvasMouseDownSubscription!: Subscription;
  canvasMouseLeaveSubscription!: Subscription;

  //event tactil
  //https://developer.mozilla.org/fr/docs/Web/API/Touch_events
  canvasTouchStartSubscription!: Subscription;
  canvasTouchEndSubscription!: Subscription;
  canvasTouchCancelSubscription!: Subscription;

  constructor(
    private socketService: SocketService,
    private game: Game,
    private ai: Ai,
    private storageService: StorageService
  ) {
    this.gameConfig.states.ball.collor = this.customs.states.ball.collor;
    this.gameConfig.board.board.color = this.customs.board.board.color;
    this.gameConfig.left.mode = this.customs.left.mode;
    this.gameConfig.states.racketLeft.color =
      this.customs.states.racketLeft.color;
    this.gameConfig.right.mode = this.customs.right.mode;
    this.gameConfig.states.racketRight.color =
      this.customs.states.racketRight.color;

    this.game = new Game();
    this.ai = new Ai();
    this.game.updateAll(this.gameConfig);
    this.ai.setAll(this.gameConfig);
    this.moveLeft = { userId: 0, up: false, down: false };
    this.moveRight = { userId: 1, up: false, down: false };
    this.prevMoveLeft = { userId: 0, up: false, down: false };
    this.prevMoveRight = { userId: 1, up: false, down: false };
  }

  initGame(){
    this.gameConfig.states.ball.collor = this.customs.states.ball.collor;
    this.gameConfig.board.board.color = this.customs.board.board.color;
    this.gameConfig.left.mode = this.customs.left.mode;
    this.gameConfig.states.racketLeft.color =
      this.customs.states.racketLeft.color;
    this.gameConfig.right.mode = this.customs.right.mode;
    this.gameConfig.states.racketRight.color =
      this.customs.states.racketRight.color;

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
    this.initGame();
    this.socketService.updatePlayerStatus(this.Me);
    this.moveSubscription = this.socketService
      .getMove()
      .subscribe((move: IInput) => {
        this.game.updateInput(move);
      });
    this.gameStatesSubscription = this.socketService
      .getGameStates(this.gameName)
      .subscribe((states: IGameStates) => {
        this.game.updateStates(states);
      });
    this.tickSubscription = interval(interval_tick).subscribe(() => {
      this.tick();
    });
    this.upSubscription = fromEvent<KeyboardEvent>(document, "keyup")
      .pipe(filter((event) => !event.repeat))
      .subscribe((event) => {
        this.toUp(event.key);
      });
    this.downSubscription = fromEvent<KeyboardEvent>(document, "keydown")
      .pipe(filter((event) => !event.repeat))
      .subscribe((event) => {
        this.toDown(event.key);
      });
    this.canvas = <HTMLCanvasElement>document.getElementById("stage");
    this.ctx = <CanvasRenderingContext2D>this.canvas.getContext("2d");

    // set the width and height
    this.canvas.width = this.gameConfig.board.board.width;
    this.canvas.height = this.gameConfig.board.board.height;

    // we'll implement this method to start capturing mouse events
    this.canvasMouseUpSubscription = fromEvent<MouseEvent>(
      this.canvas,
      "mouseup"
    ).subscribe(() => {
      this.unsetMove();
    });
    this.canvasMouseDownSubscription = fromEvent<MouseEvent>(
      this.canvas,
      "mousedown"
    ).subscribe((event) => {
      this.setMouseMove(event);
    });
    this.canvasMouseLeaveSubscription = fromEvent<MouseEvent>(
      this.canvas,
      "mouseleave"
    ).subscribe(() => {
      this.unsetMove();
    });
    this.canvasTouchStartSubscription = fromEvent<TouchEvent>(
      this.canvas,
      "touchstart"
    ).subscribe((event) => {
      this.setTouchMove(event);
    });
    this.canvasTouchEndSubscription = fromEvent<TouchEvent>(
      this.canvas,
      "touchend"
    ).subscribe(() => {
      this.unsetMove();
    });
    this.canvasTouchCancelSubscription = fromEvent<TouchEvent>(
      this.canvas,
      "touchcancel"
    ).subscribe(() => {
      this.unsetMove();
    });
  }

  setMouseMove(event: MouseEvent): void {
    this.setMove(
      event.offsetX,
      event.offsetY,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
  }

  setTouchMove(event: TouchEvent): void {
    const r = this.canvas.getBoundingClientRect();
    this.setMove(
      event.touches[0].clientX - r.left,
      event.touches[0].clientY - r.y,
      r.right - r.left,
      r.bottom - r.y
    );
  }

  setMove(x: number, y: number, width: number, height: number): void {
    if (x < width / 2) {
      if (y < height / 2 && this.gameConfig.left.mode.type === "local") {
        this.moveLeft.up = true;
      } else {
        this.moveLeft.down = true;
      }
    } else if (this.gameConfig.right.mode.type === "local") {
      if (y < height / 2) {
        this.moveRight.up = true;
      } else {
        this.moveRight.down = true;
      }
    }
  }

  unsetMove(): void {
    if (this.gameConfig.left.mode.type === "local") {
      this.moveLeft.up = false;
      this.moveLeft.down = false;
    }
    if (this.gameConfig.right.mode.type === "local") {
      this.moveRight.up = false;
      this.moveRight.down = false;
    }
  }

  ngOnDestroy(): void {
    this.moveSubscription.unsubscribe();
    //this.startSubscription.unsubscribe();
    this.gameStatesSubscription.unsubscribe();
    this.tickSubscription.unsubscribe();
    this.upSubscription.unsubscribe();
    this.downSubscription.unsubscribe();
    this.canvasMouseUpSubscription.unsubscribe();
    this.canvasMouseDownSubscription.unsubscribe();
    this.canvasMouseLeaveSubscription.unsubscribe();
    this.canvasTouchStartSubscription.unsubscribe();
    this.canvasTouchEndSubscription.unsubscribe();
    this.canvasTouchCancelSubscription.unsubscribe();
    this.socketService.updatePlayerStatus2(this.Me)
    this.socketService.leaveTheRoom(this.gameName);
  }

  sendMove(move: IInput) {
    if (
      move.userId === this.gameConfig.left.id &&
      (move.down !== this.prevMoveLeft.down || move.up !== this.prevMoveLeft.up)
    ) {
      this.socketService.sendMove(move, this.gameName);
      this.prevMoveLeft.up = move.up;
      this.prevMoveLeft.down = move.down;
    } else if (
      move.userId === this.gameConfig.right.id &&
      (move.down !== this.prevMoveRight.down ||
        move.up !== this.prevMoveRight.up)
    ) {
      this.socketService.sendMove(move, this.gameName);
      this.prevMoveRight.up = move.up;
      this.prevMoveRight.down = move.down;
    }
  }

  sendStart() {
    this.socketService.sendStart(this.gameName);
  }

  sendGameStates(gameStates: IGameStates) {
    this.socketService.sendGameStates(gameStates);
  }

  toUp(key: string) {
    if (this.gameConfig.left.mode.type === "local") {
      if (key === this.gameConfig.left.mode.upKey) {
        this.moveLeft.up = false;
      } else if (key === this.gameConfig.left.mode.downKey) {
        this.moveLeft.down = false;
      }
    }
    if (this.gameConfig.right.mode.type === "local") {
      if (key === this.gameConfig.right.mode.upKey) {
        this.moveRight.up = false;
      } else if (key === this.gameConfig.right.mode.downKey) {
        this.moveRight.down = false;
      }
    }
  }

  toDown(key: string) {
    if (this.gameConfig.left.mode.type === "local") {
      if (key === this.gameConfig.left.mode.upKey) {
        this.moveLeft.up = true;
      } else if (key === this.gameConfig.left.mode.downKey) {
        this.moveLeft.down = true;
      }
    }
    if (this.gameConfig.right.mode.type === "local") {
      if (key === this.gameConfig.right.mode.upKey) {
        this.moveRight.up = true;
      } else if (key === this.gameConfig.right.mode.downKey) {
        this.moveRight.down = true;
      }
    }
    if (key === keyStart) {
      this.sendStart();
    }
    if (this.gameConfig.left.mode.type !== "remote") {
      if (key === "1") {
        this.gameConfig.left.mode = new DefaultGame().left.mode;
      } else if (key === "2") {
        this.gameConfig.left.mode = {
          type: "ai",
          level: "easy",
        };
      } else if (key == "3") {
        this.gameConfig.left.mode = {
          type: "ai",
          level: "hard",
        };
      }
    }
    if (this.gameConfig.right.mode.type !== "remote") {
      if (key === "4") {
        this.gameConfig.right.mode = new DefaultGame().right.mode;
      } else if (key === "5") {
        this.gameConfig.right.mode = {
          type: "ai",
          level: "easy",
        };
      } else if (key == "6") {
        this.gameConfig.right.mode = {
          type: "ai",
          level: "hard",
        };
      }
    }
  }

  tick(): void {
    this.gameConfig.states.racketRight.position.left =
      this.gameConfig.board.board.width -
      this.gameConfig.board.board.margin -
      this.gameConfig.states.racketRight.width;

    if (this.gameConfig.left.mode.type !== "remote") {
      const move = this.getInput(
        this.gameConfig.left.mode,
        this.gameConfig.left.id,
        this.moveLeft,
        this.moveLeft
      );
      this.game.updateInput(move);
      this.sendMove(move);
    }
    if (this.gameConfig.right.mode.type !== "remote") {
      const move = this.getInput(
        this.gameConfig.right.mode,
        this.gameConfig.right.id,
        this.moveRight,
        this.moveRight
      );
      this.game.updateInput(move);
      this.sendMove(move);
    }
    this.game.tick();
    if (this.gameConfig.board.mode.type === "server") {
      //this.gameConfig.states = this.game.getGameStates();
    } else {
      this.sendGameStates(this.gameConfig.states);
    }
    this.draw();
    if (!this.gameConfig.states.start || this.game.getWinner != null) {
      this.darken();
    }
  }

  getInput(
    racketMode: PlayerMode,
    userId: number,
    localMove: IInput,
    remoteMove: IInput
  ): IInput {
    if (racketMode.type === "local") {
      return localMove;
    } else if (racketMode.type === "ai") {
      this.ai.setStates(this.gameConfig.states);
      this.ai.setLevel(racketMode.level);
      this.ai.setUserId(userId);
      return this.ai.getInput();
    } else if (racketMode.type === "remote") {
      return remoteMove;
    } else {
      return {
        userId: userId,
        up: false,
        down: false,
      };
    }
  }

  win() {
    return this.game.getWinner();
  }

  start(): void {
    this.sendStart();
  }

  reset(): void {
    this.socketService.sendReset(this.gameName);
    //this.game.updateStates(structuredClone(defaultGameConfig).states);
  }

  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | { tl: number; tr: number; br: number; bl: number } = 5,
    fill = false,
    stroke = true
  ) {
    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius.tl, y);
    this.ctx.lineTo(x + width - radius.tr, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    this.ctx.lineTo(x + width, y + height - radius.br);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    this.ctx.lineTo(x + radius.bl, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    this.ctx.lineTo(x, y + radius.tl);
    this.ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    this.ctx.closePath();
    if (fill) {
      this.ctx.fill();
    }
    if (stroke) {
      this.ctx.stroke();
    }
  }

  drawBall() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.gameConfig.states.ball.collor;
    this.ctx.arc(
      this.gameConfig.states.ball.position.left +
        this.gameConfig.states.ball.diammeter / 2,
      this.gameConfig.states.ball.position.top +
        this.gameConfig.states.ball.diammeter / 2,
      this.gameConfig.states.ball.diammeter / 2,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }

  darken() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    // clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw net
    this.ctx.strokeStyle = "white";
    this.ctx.beginPath();
    this.ctx.setLineDash([5, 15]);
    this.ctx.moveTo(this.gameConfig.board.board.width / 2, 0);
    this.ctx.lineTo(
      this.gameConfig.board.board.width / 2,
      this.gameConfig.board.board.height
    );
    this.ctx.stroke();

    // draw left racket

    this.ctx.fillStyle = this.gameConfig.states.racketLeft.color;
    this.roundRect(
      this.gameConfig.states.racketLeft.position.left,
      this.gameConfig.states.racketLeft.position.top,
      this.gameConfig.states.racketLeft.width,
      this.gameConfig.states.racketLeft.height,
      10,
      true,
      false
    );

    // draw left racket
    this.ctx.fillStyle = this.gameConfig.states.racketRight.color;
    this.roundRect(
      this.gameConfig.states.racketRight.position.left,
      this.gameConfig.states.racketRight.position.top,
      this.gameConfig.states.racketRight.width,
      this.gameConfig.states.racketRight.height,
      10,
      true,
      false
    );

    // draw power-ups
    this.ctx.font = "40px Arial";
    this.ctx.textAlign = "center";
    for (const powerUp of this.gameConfig.states.powerUps) {
      this.ctx.fillStyle = powerUp.color;
      this.roundRect(
        powerUp.position.left,
        powerUp.position.top,
        powerUp.width,
        powerUp.height,
        0,
        true,
        false
      );
      this.ctx.fillStyle = "black";
      this.ctx.fillText(
        '?',
        powerUp.position.left + powerUp.width / 2,
        powerUp.position.top + powerUp.height * 0.8
      );
    }

    // draw ball
    this.drawBall();

    // draw score
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      String(this.gameConfig.states.scoreLeft),
      this.gameConfig.board.board.width * 0.4,
      this.gameConfig.board.board.height * 0.05
    );
    this.ctx.fillText(
      String(this.gameConfig.states.scoreRight),
      this.gameConfig.board.board.width * 0.6,
      this.gameConfig.board.board.height * 0.05
    );
  }

  // receiveCloseScoreEvent($event:boolean){
  //   this.showscore= $event;

  // }
}
