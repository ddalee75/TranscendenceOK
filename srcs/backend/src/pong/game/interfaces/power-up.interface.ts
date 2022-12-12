import { IPosition } from './position.interface';

export interface IPowerUp {
  effectName: string;
  color: string;
  position: IPosition;
  height: number;
  width: number;
}
