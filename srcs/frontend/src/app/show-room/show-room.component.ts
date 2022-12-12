import { Component, OnInit } from '@angular/core';
import { SGame } from '../models/savedGame';
import { DefaultGame } from '../pong/game/config';
import { IGame } from '../pong/game/interfaces/game.interface';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';


@Component({
  selector: 'app-show-room',
  templateUrl: './show-room.component.html',
  styleUrls: ['./show-room.component.css']
})



export class ShowRoomComponent implements OnInit {
	redirectPong: boolean = false;
	gameConfig: IGame = new DefaultGame();
	matches!: SGame[];
	constructor(service: ApiService, private socketService: SocketService) {
		//  this.matches = service.getMatches();

	}
	roomName:string = "";
	ngOnInit(): void {
		this.setUpGameConfig();
		this.socketService.gameIsReadyToSpectate().subscribe((res) => {
			this.roomName = res;
			console.log(this.roomName);
			this.redirectPong = true;
		})
		this.socketService.receiveMatches().subscribe((res: any) => {
			this.matches = res;

		})
		this.socketService.isGameFinished().subscribe((res) => {
			this.socketService.getMatches()
		})
	}

	reload() {
		this.socketService.getMatches()
	}

	setUpGameConfig() {
		this.gameConfig.left.mode.type = "remote";
		this.gameConfig.right.mode.type = "remote";
	}



}
