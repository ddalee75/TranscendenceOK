import { User } from './user';

export interface SGame {
  id:             number;
  roomName:       string;
  players:        User[];
  player1_score:  number;
  player2_score:  number;
  player1_id:     number;
  player2_id:     number;
}