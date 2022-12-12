import { IBallConfig } from "./ball-config.interface";
import { IPowerUp } from "./power-up.interface";
import { IRacketConfig } from "./racket-config.interface";

export interface IGameStates {
  gameId: number;
  scoreLeft: number;
  scoreRight: number;
  start: boolean;
  activatePowerUp: boolean;
  powerUps: IPowerUp[];
  racketLeft: IRacketConfig;
  racketRight: IRacketConfig;
  ball: IBallConfig;
}
