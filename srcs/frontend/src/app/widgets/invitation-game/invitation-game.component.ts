import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { User } from '../../models/user'
import { SocketService } from '../../services/socket.service';
import { StorageService } from 'src/app/services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IGame } from 'src/app/pong/game/interfaces/game.interface';

@Component({
  selector: 'app-invitation-game',
  templateUrl: './invitation-game.component.html',
  styleUrls: ['./invitation-game.component.css']
})
export class InvitationGameComponent implements OnInit {

  @Input() fromWho!: User;
  @Input() to!: User;
  @Input() gameConfig!:IGame;
  @Output() showInvitationEvent = new EventEmitter<boolean>();

  toDisplay: boolean = false;
  gameAccepted: boolean = false;
  gameIsReady: boolean = false;

  constructor(private socketService: SocketService, private storageService: StorageService, public router: Router) {}

  ngOnInit(): void {
    this.socketService.doIHaveToDisplay().subscribe((res) => {
      this.toDisplay = res;
    })
    
    this.socketService.isGameAccepted().subscribe((res) => {
      this.gameAccepted = res;
    })

    this.socketService.isGameReady().subscribe((res) => {
      this.gameIsReady = res;
    })
  }

	ngOnDestroy() {
		this.socketService.unsubscribeSocket("invitationAccepted");
		this.socketService.unsubscribeSocket("GameIsReady");
	}

  Nothanks(){

    this.socketService.refuseInvitation(this.fromWho, String(this.storageService.getLogin()));
    this.showInvitationEvent.emit(false);
    
  }

  Yesplease(){
    this.showInvitationEvent.emit(false);
    this.socketService.acceptInvitation(this.to, this.fromWho);
  }

}
