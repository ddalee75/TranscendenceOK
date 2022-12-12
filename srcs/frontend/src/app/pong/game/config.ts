import { IBoard } from "./interfaces/board.interface";
import { IEffect } from "./interfaces/effect.interface";
import { IGameStates } from "./interfaces/game-states.interface";
import { IGame } from "./interfaces/game.interface";
import { IPlayer } from "./interfaces/player.interface";
import { IPowerUp } from "./interfaces/power-up.interface";

export const racketHeight = 160;
export const racketWidth = 30;
export const racketSpeed = 10;

export const gameHeight = 790;
export const gameWidth = 1000;
export const gameMargin = 10;

export const ballDiameter = 22;
export const ballSpeed = 5;

export const sidePowerUp = 42;

export function baballEffect(gameStates: IGameStates): void {
  gameStates.ball.diammeter += ballDiameter;
}

export function racketSpeedUpEffect(gameStates: IGameStates): void {
  if (gameStates.ball.direction[0] > 0) {
    gameStates.racketLeft.speed *= 1.2;
  } else {
    gameStates.racketRight.speed *= 1.2;
  }
}

export function racketSpeedDownEffect(gameStates: IGameStates): void {
  if (gameStates.ball.direction[0] > 0) {
    gameStates.racketRight.speed *= 0.8;
  } else {
    gameStates.racketLeft.speed *= 0.8;
  }
}

export function racketSizeUpEffect(gameStates: IGameStates): void {
  if (gameStates.ball.direction[0] > 0) {
    gameStates.racketLeft.height *= 1.2;
  } else {
    gameStates.racketRight.height *= 1.2;
  }
}

export function racketSizeDownEffect(gameStates: IGameStates): void {
  if (gameStates.ball.direction[0] > 0) {
    gameStates.racketRight.height *= 0.8;
  } else {
    gameStates.racketLeft.height *= 0.8;
  }
}

export const baball: IPowerUp = {
  effectName: "baball",
  color: "yelow",
  position: {
    left: gameWidth / 5 - sidePowerUp / 2,
    top: gameHeight / 10 - sidePowerUp / 2,
  },
  height: sidePowerUp,
  width: sidePowerUp,
};

export const flashingBall: IPowerUp = {
  effectName: "flashingBall",
  color: "pink",
  position: {
    left: (2 * gameWidth) / 5 - sidePowerUp / 2,
    top: gameHeight / 10 - sidePowerUp / 2,
  },
  height: sidePowerUp,
  width: sidePowerUp,
};

export const racketSpeedUp: IPowerUp = {
  effectName: "racketSpeedUp",
  color: "blue",
  position: {
    left: gameWidth / 5 - sidePowerUp / 2,
    top: (4 * gameHeight) / 10 - sidePowerUp / 2,
  },
  height: sidePowerUp,
  width: sidePowerUp,
};

export const racketSpeedDown: IPowerUp = {
  effectName: "racketSpeedDown",
  color: "orange",
  position: {
    left: (2 * gameWidth) / 5 - sidePowerUp / 2,
    top: (6 * gameHeight) / 10 - sidePowerUp / 2,
  },
  height: sidePowerUp,
  width: sidePowerUp,
};

export const racketSizeUp: IPowerUp = {
  effectName: "racketSizeUp",
  color: "green",
  position: {
    left: gameWidth / 5 - sidePowerUp / 2,
    top: (9 * gameHeight) / 10 - sidePowerUp / 2,
  },
  height: sidePowerUp,
  width: sidePowerUp,
};

export const racketSizeDown: IPowerUp = {
  effectName: "racketSizeDown",
  color: "red",
  position: {
    left: (2 * gameWidth) / 5 - sidePowerUp / 2,
    top: (9 * gameHeight) / 10 - sidePowerUp / 2,
  },
  height: sidePowerUp,
  width: sidePowerUp,
};

export class DefaultPowerUps {
  powerUps: IPowerUp[];

  public constructor() {
    this.powerUps = [
      baball,
      flashingBall,
      racketSpeedUp,
      racketSpeedDown,
      racketSizeUp,
      racketSizeDown,
    ];
  }
}

export class DefaultGame implements IGame {
  left: IPlayer;
  right: IPlayer;
  board: IBoard;
  states: IGameStates;
  effects: IEffect[];

  public constructor() {
    this.left = {
      id: 0,
      mode: {
        type: "local",
        upKey: "w",
        downKey: "s",
      },
      input: {
        userId: 0,
        up: false,
        down: false,
      },
    };
    this.right = {
      id: 1,
      mode: {
        type: "local",
        upKey: "ArrowUp",
        downKey: "ArrowDown",
      },
      input: {
        userId: 1,
        up: false,
        down: false,
      },
    };
    this.board = {
      id: 0,
      mode: {
        type: "local",
      },
      board: {
        width: gameWidth,
        height: gameHeight,
        margin: gameMargin,
        color: "#000000",
      },
      scoreToWin: 11,
    };
    this.states = {
      gameId: 0,
      scoreLeft: 0,
      scoreRight: 0,
      start: false,
      activatePowerUp: false,
      powerUps: [],
      racketLeft: {
        width: racketWidth,
        height: racketHeight,
        speed: racketSpeed,
        color: "#04EBB2",
        position: {
          left: gameMargin,
          top: gameMargin,
        },
      },
      racketRight: {
        width: racketWidth,
        height: racketHeight,
        speed: racketSpeed,
        color: "#FFBB33",
        position: {
          left: gameWidth - gameMargin - racketWidth,
          top: gameMargin,
        },
      },
      ball: {
        diammeter: ballDiameter,
        speed: ballSpeed,
        collor: "#e5e83b",
        position: {
          left: (gameWidth - ballDiameter) / 2,
          top: (gameHeight - ballDiameter) / 2,
        },
        direction: [ballSpeed / 2, 0],
      },
    };
    this.effects = [
      {
        effectName: "baball",
        effect: baballEffect,
      },
      {
        effectName: "racketSpeedUp",
        effect: racketSpeedUpEffect,
      },
      {
        effectName: "racketSpeedDown",
        effect: racketSpeedDownEffect,
      },
      {
        effectName: "racketSizeUp",
        effect: racketSizeUpEffect,
      },
      {
        effectName: "racketSizeDown",
        effect: racketSizeDownEffect,
      },
    ];
  }
}
