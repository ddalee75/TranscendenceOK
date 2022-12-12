import { R3TargetBinder } from '@angular/compiler';
import { Component, Input } from '@angular/core';
import { SGame } from 'src/app/models/savedGame';
import { User } from 'src/app/models/user';
import { SocketService } from 'src/app/services/socket.service';
@Component({
  selector: 'app-match-history',
  templateUrl: './match-history.component.html',
  styleUrls: ['./match-history.component.css']
})

export class MatchHistoryComponent {
  @Input() match!: SGame;
  winner!:User;
  opacity_player1!:number;
  opacity_player2!:number;
  winner_player1:string="";
  winner_player2:string="";

  player1_avatar = "";
  player2_avatar = "";
  player1_login = "";
  player2_login = "";
  player1_level = 0;
  player2_level = 0;
 
  
  constructor(private socketService: SocketService){
  }

  ngOnInit(): void {
    this.socketService.receiveGamePlayers(this.match).subscribe((res) => {
      this.match = res;
      if (this.match.player1_id == this.match.players[0].id) {
        this.player1_avatar = this.match.players[0].avatar;
        this.player1_login = this.match.players[0].login;
        this.player1_level = this.match.players[0].level;
        this.player2_avatar = this.match.players[1].avatar;
        this.player2_login = this.match.players[1].login;  
        this.player2_level = this.match.players[1].level;  
      }
      else {
        this.player1_avatar = this.match.players[1].avatar;
        this.player1_login = this.match.players[1].login;
        this.player1_level = this.match.players[1].level;
        this.player2_avatar = this.match.players[0].avatar;
        this.player2_login = this.match.players[0].login;   
        this.player2_level = this.match.players[0].level;   
      }
  })
    this.socketService.getGamePlayers(this.match);
   
    if(this.match.player1_score>this.match.player2_score)
    {
      this.opacity_player1=0;
      this.winner_player1="../../../assets/imgs/Winner.png";
    } else{
      this.opacity_player2 =0;
      this.winner_player2="../../../assets/imgs/Winner.png";

    }

  
    
  }
  ngOnDestroy() {
		this.socketService.unsubscribeSocket('hereAreTheGame' + this.match.id + 'Infos');

  }
}



