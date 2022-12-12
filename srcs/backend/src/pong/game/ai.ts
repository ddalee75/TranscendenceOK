import { Injectable } from '@nestjs/common';
import { lineAngle, Point, pointTranslate } from 'geometric';
import {
  checkIntersection,
  colinearPointWithinSegment,
  IntersectionCheckResult,
} from 'line-intersect';
import { DefaultGame } from './config';
import { IGameStates } from './interfaces/game-states.interface';
import { IGame } from './interfaces/game.interface';
import { IInput } from './interfaces/input.interface';
import { IRacket } from './interfaces/racket.interface';

export type LevelAi = 'easy' | 'hard';

@Injectable()
export class Ai {
  private game: IGame = new DefaultGame();
  private level: LevelAi = 'easy';
  private userId = 0;

  public constructor() {}

  public setLevel(level: LevelAi) {
    this.level = level;
  }

  public setStates(states: IGameStates) {
    this.game.states = states;
  }

  public setUserId(userId: number) {
    this.userId = userId;
  }

  public setAll(game: IGame) {
    this.game = game;
  }

  public getInput(): IInput {
    const racket: IRacket | null = this.getRacket();
    if (racket == null) {
      return {
        userId: this.userId,
        up: false,
        down: false,
      };
    } else if (this.level === 'easy') {
      return this.aiV0(racket);
    } else {
      return this.aiV1(racket);
    }
  }

  private getRacket(): IRacket | null {
    if (this.userId === this.game.left.id) {
      return {
        left: this.game.states.racketLeft.position.left,
        top: this.game.states.racketLeft.position.top,
        width: this.game.states.racketLeft.width,
        height: this.game.states.racketLeft.height,
      };
    } else if (this.userId === this.game.right.id) {
      return {
        left: this.game.states.racketRight.position.left,
        top: this.game.states.racketRight.position.top,
        width: this.game.states.racketRight.width,
        height: this.game.states.racketRight.height,
      };
    } else {
      return null;
    }
  }

  private aiV0(racket: IRacket): IInput {
    return this.ketToCenter(
      this.game.states.ball.position.top + this.game.states.ball.diammeter / 2,
      racket.top + racket.height / 2,
      racket.height,
    );
  }

  private aiV1(racket: IRacket): IInput {
    if (
      (this.game.states.ball.direction[0] > 0 &&
        this.game.states.ball.position.left > racket.left + racket.width) ||
      (this.game.states.ball.direction[0] < 0 &&
        this.game.states.ball.position.left + this.game.states.ball.diammeter <
          racket.left)
    ) {
      return this.ketToCenter(
        this.game.board.board.height / 2,
        racket.top + racket.height / 2,
        racket.height,
      );
    } else {
      const ball: Point = [
        this.game.states.ball.position.left +
          this.game.states.ball.diammeter / 2,
        this.game.states.ball.position.top +
          this.game.states.ball.diammeter / 2,
      ];
      const angle = lineAngle([
        [0, 0],
        [
          this.game.states.ball.direction[0],
          this.game.states.ball.direction[1],
        ],
      ]);
      const test = pointTranslate([0, 0], angle, 10000);
      return this.ketToCenter(
        this.predictCenter(racket, ball, test),
        racket.top + racket.height / 2,
        racket.height,
      );
    }
  }

  private predictCenter(
    racket: IRacket,
    ball: Point,
    ballDirection: Point,
  ): number {
    const racketCenter: Point = [
      racket.left + racket.width / 2,
      racket.top + racket.height / 2,
    ];
    const racketColision: IntersectionCheckResult = checkIntersection(
      ball[0],
      ball[1],
      ball[0] + ballDirection[0],
      ball[1] + ballDirection[1],
      racketCenter[0],
      0,
      racketCenter[0],
      this.game.board.board.height,
    );
    const wall: Point =
      ballDirection[1] < 0 ? [0, 0] : [0, this.game.board.board.height];
    const wallColision: IntersectionCheckResult = checkIntersection(
      ball[0],
      ball[1],
      ball[0] + ballDirection[0],
      ball[1] + ballDirection[1],
      wall[0],
      wall[1],
      this.game.board.board.width,
      wall[1],
    );
    if (
      racketColision.type === 'intersecting' &&
      colinearPointWithinSegment(
        racketColision.point.x,
        racketColision.point.y,
        racketCenter[0],
        0,
        racketCenter[0],
        this.game.board.board.height,
      )
    ) {
      return racketColision.point.y;
    } else if (wallColision.type === 'intersecting') {
      return this.predictCenter(
        racket,
        [wallColision.point.x, wallColision.point.y],
        [ballDirection[0], ballDirection[1] * -1],
      );
    } else {
      return this.game.board.board.height / 2;
    }
  }

  private ketToCenter(
    centerBall: number,
    centerRacket: number,
    heightRacket: number,
  ): IInput {
    const input: IInput = {
      userId: this.userId,
      up: false,
      down: false,
    };
    if (centerBall > centerRacket + heightRacket / 4) {
      input.down = true;
    } else if (centerBall < centerRacket - heightRacket / 4) {
      input.up = true;
    }
    return input;
  }
}
