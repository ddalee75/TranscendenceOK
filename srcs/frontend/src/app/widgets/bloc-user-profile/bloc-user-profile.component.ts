import { Component, OnInit,Input } from '@angular/core';
import { User } from '../../models/user';
import { SGame } from 'src/app/models/savedGame';
import { SocketService } from 'src/app/services/socket.service';
import { IGame } from "../../pong/game/interfaces/game.interface";
import { DefaultGame } from "../../pong/game/config";

@Component({
  selector: 'app-bloc-user-profile',
  templateUrl: './bloc-user-profile.component.html',
  styleUrls: ['./bloc-user-profile.component.css']
})
export class BlocUserProfileComponent implements OnInit {
  @Input() user!: User;
  @Input() match!: any;



  constructor(private socketService: SocketService) { }

  ngOnInit(): void {

  }

  spectate()
  {
    this.socketService.spectateGame(this.match.roomName);
  }
}
