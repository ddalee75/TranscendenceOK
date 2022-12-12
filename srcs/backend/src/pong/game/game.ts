import { IGameStates } from './interfaces/game-states.interface';
import { IGame } from './interfaces/game.interface';
import { IInput } from './interfaces/input.interface';
import { checkIntersection, IntersectionCheckResult } from 'line-intersect';
import { lineAngle, Point, pointTranslate } from 'geometric';
import {
  ballDiameter,
  ballSpeed,
  DefaultGame,
  DefaultPowerUps,
  gameWidth,
  sidePowerUp,
} from './config';
import { Injectable } from '@nestjs/common';
import { ICircle } from './interfaces/circle.interface';
import { IRectangle } from './interfaces/rectangle.interface';

@Injectable()
export class Game {
  private game: IGame = new DefaultGame();

  public constructor() {}

  public tick(): void {
    if (this.game.states.start && this.getWinner() == null) {
      this.moveRacketLeft();
      this.moveRacketRight();
      this.moveBall();
    }
  }

  public updateInput(input: IInput): void {
    if (this.game.left.id === input.userId) {
      this.game.left.input = input;
    } else if (this.game.right.id === input.userId) {
      this.game.right.input = input;
    }
  }

  public start(): void {
    this.game.states.start = !this.game.states.start;
  }

  public updateAll(game: IGame): void {
    this.game = game;
  }

  public updateStates(states: IGameStates): void {
    this.game.states = states;
  }

  public updatePowerUp(activate: boolean): void {
    this.game.states.activatePowerUp = activate;
  }

  public getGameStates(): IGameStates {
    return this.game.states;
  }

  public getAll(): IGame {
    return this.game;
  }

  public getWinner(): number | null {
    if (this.game.states.scoreLeft >= this.game.board.scoreToWin) {
      return this.game.left.id;
    } else if (this.game.states.scoreRight >= this.game.board.scoreToWin) {
      return this.game.right.id;
    } else {
      return null;
    }
  }

  private moveRacketLeft(): void {
    if (this.game.left.input.down && !this.game.left.input.up) {
      this.game.states.racketLeft.position.top +=
        this.game.states.racketLeft.speed;
      if (
        this.game.states.racketLeft.position.top >
        this.game.board.board.height -
          this.game.board.board.margin -
          this.game.states.racketLeft.height
      ) {
        this.game.states.racketLeft.position.top =
          this.game.board.board.height -
          this.game.board.board.margin -
          this.game.states.racketLeft.height;
      }
    } else if (!this.game.left.input.down && this.game.left.input.up) {
      this.game.states.racketLeft.position.top -=
        this.game.states.racketLeft.speed;
      if (
        this.game.states.racketLeft.position.top < this.game.board.board.margin
      ) {
        this.game.states.racketLeft.position.top = this.game.board.board.margin;
      }
    }
  }

  private moveRacketRight(): void {
    if (this.game.right.input.down && !this.game.right.input.up) {
      this.game.states.racketRight.position.top +=
        this.game.states.racketRight.speed;
      if (
        this.game.states.racketRight.position.top >
        this.game.board.board.height -
          this.game.board.board.margin -
          this.game.states.racketRight.height
      ) {
        this.game.states.racketRight.position.top =
          this.game.board.board.height -
          this.game.board.board.margin -
          this.game.states.racketRight.height;
      }
    } else if (!this.game.right.input.down && this.game.right.input.up) {
      this.game.states.racketRight.position.top -=
        this.game.states.racketRight.speed;
      if (
        this.game.states.racketRight.position.top < this.game.board.board.margin
      ) {
        this.game.states.racketRight.position.top =
          this.game.board.board.margin;
      }
    }
  }

  private moveBall(): void {
    const posBall: Point = [
      this.game.states.ball.position.left,
      this.game.states.ball.position.top,
    ];
    const posNextBall: Point = [
      posBall[0] + this.game.states.ball.direction[0],
      posBall[1] + this.game.states.ball.direction[1],
    ];
    const wallDown: Point = [0, this.game.board.board.height];
    const wallUp: Point = [0, 0];
    const goalLeft: Point = [-this.game.states.ball.diammeter, 0];
    const goalRight: Point = [
      this.game.board.board.width + this.game.states.ball.diammeter,
      0,
    ];
    const wallColision: IntersectionCheckResult = this.wallColision(
      posBall,
      posNextBall,
      wallDown,
      wallUp,
    );
    const goalColision: IntersectionCheckResult = this.goalColision(
      posBall,
      posNextBall,
      goalLeft,
      goalRight,
    );
    const racketColision: IntersectionCheckResult = this.racketColision(
      posBall,
      posNextBall,
    );
    const collision = this.nearestCollision(posBall, [
      wallColision,
      goalColision,
      racketColision,
    ]);

    this.powerUpColision(posBall);

    if (collision.type === 'intersecting') {
      if (collision == wallColision) {
        this.wallBounce(collision.point.x, collision.point.y);
      } else if (collision == goalColision) {
        this.goal(collision.point.x);
      } else if (collision == racketColision) {
        this.racketBounce(collision.point.x, collision.point.y);
      }
    } else {
      this.game.states.ball.position.left += this.game.states.ball.direction[0];
      this.game.states.ball.position.top += this.game.states.ball.direction[1];
    }
  }

  private wallBounce(pointX: number, pointY: number): void {
    this.game.states.ball.position.left = pointX;
    this.game.states.ball.position.top = pointY;
    this.game.states.ball.direction[1] *= -1;
  }

  private goal(pointX: number): void {
    if (pointX < this.game.board.board.width / 2) {
      this.game.states.scoreRight++;
    } else {
      this.game.states.scoreLeft++;
    }
    this.newBall();
    if (this.game.states.activatePowerUp) {
      this.newPowerUp();
    }
  }

  private newPowerUp(): void {
    const score = this.game.states.scoreRight + this.game.states.scoreLeft;
    const powerUp = structuredClone(
      new DefaultPowerUps().powerUps[
        score % new DefaultPowerUps().powerUps.length
      ],
    );
    if (score % 4 === 0) {
      powerUp.position.left = (1 * gameWidth) / 5 - sidePowerUp / 2;
    } else if (score % 4 === 1) {
      powerUp.position.left = (3 * gameWidth) / 5 - sidePowerUp / 2;
    } else if (score % 4 === 2) {
      powerUp.position.left = (2 * gameWidth) / 5 - sidePowerUp / 2;
    } else {
      powerUp.position.left = (4 * gameWidth) / 5 - sidePowerUp / 2;
    }
    this.game.states.powerUps.push(powerUp);
  }

  private racketBounce(pointX: number, pointY: number): void {
    this.game.states.ball.position.left = pointX;
    this.game.states.ball.position.top = pointY;
    this.game.states.ball.speed *= 1.01;
    this.game.states.ball.direction = this.bounceTrajectory();
  }

  private intersects(circle: ICircle, rect: IRectangle): boolean {
    const circleDistanceX = Math.abs(circle.x - rect.x);
    const circleDistanceY = Math.abs(circle.y - rect.y);

    if (
      circleDistanceX > rect.width / 2 + circle.r ||
      circleDistanceY > rect.height / 2 + circle.r
    ) {
      return false;
    }
    if (
      circleDistanceX <= rect.width / 2 ||
      circleDistanceY <= rect.height / 2
    ) {
      return true;
    }
    const cornerDistance_sq =
      Math.pow(circleDistanceX - rect.width / 2, 2) +
      Math.pow(circleDistanceY - rect.height / 2, 2);
    return cornerDistance_sq <= Math.pow(circle.r, 2);
  }

  //TODO: remplacer toute les ball et les rectangle par des interfaces

  private powerUpColision(posBall: Point): void {
    for (let index = 0; index < this.game.states.powerUps.length; index++) {
      const powerUp = this.game.states.powerUps[index];
      if (
        this.intersects(
          {
            x: posBall[0] + this.game.states.ball.diammeter / 2,
            y: posBall[1] + this.game.states.ball.diammeter / 2,
            r: this.game.states.ball.diammeter / 2,
          },
          {
            x: powerUp.position.left + powerUp.width / 2,
            y: powerUp.position.top + powerUp.height / 2,
            width: powerUp.width,
            height: powerUp.height,
          },
        )
      ) {
        this.game.effects
          .find((effect) => effect.effectName === powerUp.effectName)
          ?.effect(this.game.states);
        this.game.states.powerUps.splice(index, 1);
      }
    }
  }

  private bounceTrajectory(): Point {
    const centerBall: Point = [
      this.game.states.ball.position.left + this.game.states.ball.diammeter / 2,
      this.game.states.ball.position.top + this.game.states.ball.diammeter / 2,
    ];
    let centerRacket: Point;
    if (centerBall[0] < this.game.board.board.width / 2) {
      centerRacket = [
        this.game.states.racketLeft.position.left +
          this.game.states.racketLeft.width / 2,
        this.game.states.racketLeft.position.top +
          this.game.states.racketLeft.height / 2,
      ];
    } else {
      centerRacket = [
        this.game.states.racketRight.position.left +
          this.game.states.racketRight.width / 2,
        this.game.states.racketRight.position.top +
          this.game.states.racketRight.height / 2,
      ];
    }
    let angle = (lineAngle([centerRacket, centerBall]) + 360) % 360;
    if (80 <= angle && angle <= 90) {
      angle = 80;
    } else if (90 <= angle && angle <= 100) {
      angle = 100;
    } else if (260 <= angle && angle <= 270) {
      angle = 260;
    } else if (270 <= angle && angle <= 280) {
      angle = 280;
    }
    return pointTranslate([0, 0], angle, this.game.states.ball.speed);
  }

  private newBall(): void {
    this.game.states.ball.diammeter = ballDiameter;
    this.game.states.ball.speed = ballSpeed;
    this.game.states.ball.position.left =
      (this.game.board.board.width - this.game.states.ball.diammeter) / 2;
    this.game.states.ball.position.top =
      (this.game.board.board.height - this.game.states.ball.diammeter) / 2;
    if ((this.game.states.scoreLeft + this.game.states.scoreRight) % 2) {
      this.game.states.ball.direction = [-this.game.states.ball.speed / 2, 0];
    } else {
      this.game.states.ball.direction = [this.game.states.ball.speed / 2, 0];
    }
  }

  private wallColision(
    posBall: Point,
    posNextBall: Point,
    wallDown: Point,
    wallUp: Point,
  ): IntersectionCheckResult {
    let colision: IntersectionCheckResult;
    if (posBall[1] < posNextBall[1]) {
      colision = checkIntersection(
        posBall[0],
        posBall[1],
        posNextBall[0],
        posNextBall[1],
        wallDown[0],
        wallDown[1] - this.game.states.ball.diammeter,
        this.game.board.board.width,
        wallDown[1] - this.game.states.ball.diammeter,
      );
    } else {
      colision = checkIntersection(
        posBall[0],
        posBall[1],
        posNextBall[0],
        posNextBall[1],
        wallUp[0],
        wallUp[1],
        this.game.board.board.width,
        wallUp[1],
      );
    }
    if (colision.type !== 'intersecting') {
      if (posNextBall[1] < wallUp[1]) {
        colision = {
          type: 'intersecting',
          point: {
            x: posNextBall[0],
            y: wallUp[1],
          },
        };
      } else if (
        posNextBall[1] >
        wallDown[1] - this.game.states.ball.diammeter
      ) {
        colision = {
          type: 'intersecting',
          point: {
            x: posNextBall[0],
            y: wallDown[1] - this.game.states.ball.diammeter,
          },
        };
      }
    }
    return colision;
  }

  private goalColision(
    posBall: Point,
    posNextBall: Point,
    goalLeft: Point,
    goalRight: Point,
  ): IntersectionCheckResult {
    let colision: IntersectionCheckResult;
    if (posBall[0] > posNextBall[0]) {
      colision = checkIntersection(
        posBall[0],
        posBall[1],
        posNextBall[0],
        posNextBall[1],
        goalLeft[0],
        goalLeft[1],
        goalLeft[0],
        this.game.board.board.height,
      );
    } else {
      colision = checkIntersection(
        posBall[0],
        posBall[1],
        posNextBall[0],
        posNextBall[1],
        goalRight[0],
        goalRight[1],
        goalRight[0],
        this.game.board.board.height,
      );
    }
    if (colision.type !== 'intersecting') {
      if (posBall[0] < -this.game.states.ball.diammeter) {
        colision = {
          type: 'intersecting',
          point: {
            x: -this.game.states.ball.diammeter,
            y: posBall[1],
          },
        };
      } else if (posBall[0] > this.game.board.board.width) {
        colision = {
          type: 'intersecting',
          point: {
            x: this.game.board.board.width,
            y: posBall[1],
          },
        };
      }
    }
    return colision;
  }

  private distance(x1: number, x2: number, y1: number, y2: number) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  private rectangleColision(
    posBall: Point,
    posNextBall: Point,
    recLeft: number,
    recRight: number,
    recTop: number,
    recDown: number,
  ): IntersectionCheckResult {
    const leftColistion: IntersectionCheckResult =
      posBall[0] <= posNextBall[0]
        ? checkIntersection(
            posBall[0],
            posBall[1],
            posNextBall[0],
            posNextBall[1],
            recLeft,
            recTop,
            recLeft,
            recDown,
          )
        : { type: 'none' };
    const rightColistion: IntersectionCheckResult =
      posBall[0] >= posNextBall[0]
        ? checkIntersection(
            posBall[0],
            posBall[1],
            posNextBall[0],
            posNextBall[1],
            recRight,
            recTop,
            recRight,
            recDown,
          )
        : { type: 'none' };
    let topColistion: IntersectionCheckResult =
      posBall[1] <= posNextBall[1]
        ? checkIntersection(
            posBall[0],
            posBall[1],
            posNextBall[0],
            posNextBall[1],
            recLeft,
            recTop,
            recRight,
            recTop,
          )
        : { type: 'none' };
    let downColistion: IntersectionCheckResult =
      posBall[1] >= posNextBall[1]
        ? checkIntersection(
            posBall[0],
            posBall[1],
            posNextBall[0],
            posNextBall[1],
            recLeft,
            recDown,
            recRight,
            recDown,
          )
        : { type: 'none' };
    if (
      topColistion.type === 'colinear' &&
      recLeft <= posBall[0] &&
      posBall[0] <= recRight
    ) {
      topColistion = {
        type: 'intersecting',
        point: {
          x: posBall[0],
          y: posBall[1],
        },
      };
    }
    if (
      downColistion.type === 'colinear' &&
      recLeft <= posBall[0] &&
      posBall[0] <= recRight
    ) {
      downColistion = {
        type: 'intersecting',
        point: {
          x: posBall[0],
          y: posBall[1],
        },
      };
    }
    //test
    if (
      leftColistion.type === 'none' &&
      rightColistion.type === 'none' &&
      recLeft < posNextBall[0] &&
      posNextBall[0] < recRight &&
      recTop < posNextBall[1] &&
      posNextBall[1] < recDown
    ) {
      const collision: IntersectionCheckResult = {
        type: 'intersecting',
        point: {
          x: posNextBall[0],
          y: posNextBall[1],
        },
      };
      if (recTop < collision.point.y && collision.point.y < recDown) {
        if (collision.point.y - recTop < recDown - collision.point.y) {
          collision.point.y = recTop;
        } else {
          collision.point.y = recDown;
        }
      }
      return collision;
    }
    return this.nearestCollision(posBall, [
      leftColistion,
      rightColistion,
      topColistion,
      downColistion,
    ]);
  }

  // colision la plus proche
  private nearestCollision(
    posBall: Point,
    collisions: IntersectionCheckResult[],
  ): IntersectionCheckResult {
    let collisionMin: IntersectionCheckResult = { type: 'none' };
    let distanceMin = Number.MAX_VALUE;
    for (let index = 0; index < collisions.length; index++) {
      const collision = collisions[index];
      if (collision.type === 'intersecting') {
        const distance = this.distance(
          posBall[0],
          collision.point.x,
          posBall[1],
          collision.point.y,
        );
        if (distance < distanceMin) {
          distanceMin = distance;
          collisionMin = collision;
        }
      }
    }
    return collisionMin;
  }

  private racketColision(
    posBall: Point,
    posNextBall: Point,
  ): IntersectionCheckResult {
    if (posNextBall[0] < this.game.board.board.width / 2) {
      return this.rectangleColision(
        posBall,
        posNextBall,
        this.game.states.racketLeft.position.left -
          this.game.states.ball.diammeter,
        this.game.states.racketLeft.position.left +
          this.game.states.racketLeft.width,
        this.game.states.racketLeft.position.top -
          this.game.states.ball.diammeter,
        this.game.states.racketLeft.position.top +
          this.game.states.racketLeft.height,
      );
    } else {
      return this.rectangleColision(
        posBall,
        posNextBall,
        this.game.states.racketRight.position.left -
          this.game.states.ball.diammeter,
        this.game.states.racketRight.position.left +
          this.game.states.racketRight.width,
        this.game.states.racketRight.position.top -
          this.game.states.ball.diammeter,
        this.game.states.racketRight.position.top +
          this.game.states.racketRight.height,
      );
    }
  }
}
