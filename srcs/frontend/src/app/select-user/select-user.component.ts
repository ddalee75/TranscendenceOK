import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../models/user';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-select-user',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.css']
})
export class SelectUserComponent implements OnInit {
  @Input() Me!: User;
  @Input() user!: User;

  @Output() showchatEvent = new EventEmitter<boolean>();
  
  userList!: User[];
  show_chat: boolean = false;
  you_got_message:boolean=true;
  icon_message!:string;




  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    
    if (this.you_got_message == true){
        this.icon_message="📨";
    }
    else{
      this.icon_message="";
    }
    
  }

  sendBtn(dest : User): void {

    this.show_chat = true;
    this.showchatEvent.emit(this.show_chat);
    this.socketService.initDestActualisation(dest);
    this.socketService.checkIfFriend(this.Me.id, this.user.id);
    this.socketService.checkIfBlock(this.Me.id, this.user.id);
  }
}
