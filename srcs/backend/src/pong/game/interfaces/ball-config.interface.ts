import { IPosition } from './position.interface';

export interface IBallConfig {
  diammeter: number;
  speed: number;
  collor: string;
  position: IPosition;
  direction: [number, number];
}
