import { Component,Output, EventEmitter, Input } from '@angular/core';
import { User } from 'src/app/models/oauth';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-searching-player',
  templateUrl: './searching-player.component.html',
  styleUrls: ['./searching-player.component.css']
})
export class SearchingPlayerComponent {
  
  @Output() showSearchingPlayerEvent = new EventEmitter<boolean>();
  constructor(private socketService: SocketService){}

  @Input() bonus:boolean = false;

  giveUp(){
    this.socketService.stopMatchmaking(this.bonus); //Mettre true si on met les bonus dans le matchmaking
    this.showSearchingPlayerEvent.emit(false);
  }



}
