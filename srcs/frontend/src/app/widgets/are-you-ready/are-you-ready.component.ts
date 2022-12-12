import { Component, Input, OnInit } from '@angular/core';
import { SocketService } from "../../services/socket.service";
import { StorageService } from 'src/app/services/storage.service';
import { User } from 'src/app/models/oauth';
import { IGame } from 'src/app/pong/game/interfaces/game.interface';


@Component({
  selector: 'app-are-you-ready',
  templateUrl: './are-you-ready.component.html',
  styleUrls: ['./are-you-ready.component.css']
})
export class AreYouReadyComponent {

  @Input() player1 !: User;
  @Input() player2 !: User;
  @Input() gameConfig !: IGame;
  ready:string= "../../../assets/imgs/game_ready.png";

  constructor(private socketService: SocketService, private storageService: StorageService){}

  ngOnInit() {
  }

  imReady()
  {
    this.socketService.readySignal(this.player1, this.player2, this.gameConfig);
    this.ready="../../../assets/imgs/gameStart.png";
  }

}
