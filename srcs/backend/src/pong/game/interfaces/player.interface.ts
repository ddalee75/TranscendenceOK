import { PlayerMode } from './game.interface';
import { IInput } from './input.interface';

export interface IPlayer {
  id: number;
  mode: PlayerMode;
  input: IInput;
}
