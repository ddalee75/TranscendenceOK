import { IGameStates } from "./game-states.interface";

export interface IEffect {
  effectName: string;
  effect(gameStates: IGameStates): void;
}
