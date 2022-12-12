import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GameMode, PlayerMode, IGame } from 'src/app/pong/game/interfaces/game.interface';
import { User } from '../models/user';

@Component({
  selector: 'app-bloc-chat',
  templateUrl: './bloc-chat.component.html',
  styleUrls: ['./bloc-chat.component.css']
})
export class BlocChatComponent implements OnInit {

  
  @Output() global4Event = new EventEmitter<any>();
  constructor() { }


  ngOnInit(): void {
  }

  buttonTitle:string = "Show";
  visible:boolean = false;
  visible2:boolean = true;
  color:string= "rgb(50, 53, 60)";
  lien: string = "../../assets/icons/chatroom-f.jpg"
  global4!: {player1: User, player2:  User, gameConfig: IGame, bonus: boolean};
  
  showhide(){
    this.visible = this.visible?false:true;
    this.buttonTitle = this.visible?"Quit":"Show";
    this.color = this.visible?"rgb(48,156,120)":"rgb(50, 53, 60)";
    this.lien = this.visible?"":"../../assets/icons/chatroom-f.jpg";
    this.visible2 = this.visible2?false:true;
  }

  receiveGlobal3Event($event:any){
    this.global4=$event;
    this.global4Event.emit(this.global4);
  }
  // ouvre_popup() {
  //   window.open("index.html", "", "width=400, height=600");
  //  }

}
