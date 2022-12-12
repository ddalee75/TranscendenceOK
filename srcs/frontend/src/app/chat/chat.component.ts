import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { ApiService } from '../services/api.service';
import { User } from '../models/user'
import { Injectable } from '@angular/core';
import { Channel } from '../models/channel';
import { StorageService } from '../services/storage.service';
import { GameMode, PlayerMode, IGame } from 'src/app/pong/game/interfaces/game.interface';


@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css'],
	providers: []
})
@Injectable({
	providedIn: 'root'
})
export class ChatComponent implements OnInit {
	Me: User = {
		id: this.storageService.getId(),
		login: this.storageService.getLogin(),
		email: this.storageService.getEmail(),
		first_name: this.storageService.getFirstName(),
		last_name: this.storageService.getLastName(),
		url: this.storageService.getUrl(),
		displayname: this.storageService.getDisplayName(),
		nickname: this.storageService.getNickName(),
		image: this.storageService.getImage(),
		avatar: this.storageService.getAvatar(),
		online: this.storageService.getOnline(),
		level: this.storageService.getLvl()
	};
	Dest: User = { id: 0, login: "", email: "", first_name: "", last_name: "", url: "", displayname: "", nickname: "", image: "", avatar: "", online: 0, level: 0 };
	User_list!: User[];
	User_filtred_list!: User[];
	User_filtred_list_final!: User[];
	message: string = '';
	messages: String[] = [];
	showchat: boolean = false;
	showFormule: boolean = false;
	privatOrpublic: boolean = false;
	showFormulePassword: boolean = false;
	
	delay: number = 0;
  	Friend_list!: User[];
  	Friend_filtred_list!: User[];

	test: boolean = false

	channel_name!: string;
	privateChannel!: Channel;
	global2!: {player1: User, player2:  User, gameConfig: IGame, bonus: boolean};

	@Output() global3Event = new EventEmitter<any>();

	constructor(private socketService: SocketService,
		private apiService: ApiService,
		private storageService: StorageService) {
	}

	async ngOnInit(): Promise<void> {
		this.socketService.askForUserList(this.Me.id);
		this.socketService.getConnectionSignal(this.Me.id).subscribe();
		this.socketService.getAllUser().subscribe((result) => {
			this.User_list = result;
			this.userFiltred();
			this.userFiltred2();
		});

    this.socketService.getFriend(this.Me.id).subscribe((result) => {
		this.socketService.askForUserList(this.Me.id);
	    this.Friend_list = result;
		this.friendFiltred();
    })

    this.socketService.removeFriend().subscribe((result) => {
		this.socketService.askForUserList(this.Me.id);
      	this.Friend_list = result;
	  	this.friendFiltred();

    })

    this.socketService.getFriendList(this.Me.id);
    this.socketService.listFriend().subscribe((result) => {
    	this.Friend_list = result;
		this.friendFiltred();
    })    
	
	this.socketService.destActualisation().subscribe((res) => {
		this.Dest = res;
	  })

    this.socketService.getUserListWhenBlocked().subscribe((res) => {
		if (res.id === this.Dest.id)
			this.showchat = false;
		this.socketService.askForUserList(this.Me.id);
		this.socketService.getFriendList(this.Me.id);
		
	  })

	  this.socketService.getUserListWhenUnblocked().subscribe((res) => {
		this.socketService.askForUserList(this.Me.id)
		this.socketService.getFriendList(this.Me.id);
	})
	}

	ngOnDestroy() {
		this.socketService.unsubscribeSocket("userListUpdated");
		this.socketService.unsubscribeSocket("hereIsTheUserList");
		this.socketService.unsubscribeSocket("getFriend");
		this.socketService.unsubscribeSocket("removeFriend");
		this.socketService.unsubscribeSocket("listFriends");
		this.socketService.unsubscribeSocket("DestActualisation");
		this.socketService.unsubscribeSocket("youHaveBeenBlocked");
		this.socketService.unsubscribeSocket("youHaveBeenUnblocked");
	}

	userFiltred() {
		this.User_filtred_list = this.User_list.filter((elem, index, arr) => {
			let i = 0;
			if (elem.blocked) {
				while (elem.blocked[i]) {
					if (elem.blocked[i].id == this.Me.id)
					{
						return false;
					}
					i++;
					}
				}
				return true;
		});
	}
	userFiltred2() {
		this.User_filtred_list_final = this.User_filtred_list.filter((elem, index, arr) => {
			let i = 0;
			if (elem.friendsof) {
				while (elem.friendsof[i]) {
					if (elem.friendsof[i].id == this.Me.id)
						return false;
					i++;
					}
				}
				return true;
		});
	}

	friendFiltred() {
		this.Friend_filtred_list = this.Friend_list.filter((elem, index, arr) => {
		let i = 0;
		if (elem.blockedby) {
			while (elem.blockedby[i]) {
				if (elem.blockedby[i].id == this.Me.id)
					return false;
				i++;
				}
			}
			return true;
		})
		this.Friend_filtred_list = this.Friend_list.filter((elem, index, arr) => {
			let i = 0;
			if (elem.blocked) {
				while (elem.blocked[i]) {
					if (elem.blocked[i].id == this.Me.id)
						return false;
					i++;
				}
			}
			return true;
		});
	}

	receiveShowchat($event: boolean) {
		this.showFormulePassword = false;
		this.showchat = $event;
	}


	receivePrivateChannel($event: Channel) {
		this.privateChannel = $event;
	}

	receveShowformule($event: boolean) {
		this.showFormule = $event;
	}

	receiveShowchannelPrivate($event: boolean) {
		this.privatOrpublic = $event;
	}

	receiveShowFormulePassword($event: boolean) {
		this.showFormulePassword = $event;
		
	}

	receiveShowSalon($event: boolean) {
		this.privatOrpublic = $event;
		
	}

	receiveQuitSalon($event: boolean) {
		this.privatOrpublic = $event;
	}

	receiveChannelPublic($event: boolean) {
		this.privatOrpublic = $event;
	}

	receiveJoinChannelName($event: string) {
		this.channel_name = $event;
	}

	formuleCreate() {
		this.showFormule = this.showFormule ? false : true;
		this.showchat = false;
		this.showFormulePassword = false;
	}

	receiveChannelName($event: string) {
		this.channel_name = $event;
	}

	closeCreateSalon() {
		this.showFormule = false;
		this.showFormulePassword = false;
	}

	receiveGlobal2Event($event:any){
		this.global2 =$event;
		this.global3Event.emit(this.global2);
	}

}
