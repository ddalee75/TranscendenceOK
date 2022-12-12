
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SocketService } from '../services/socket.service';
import { User } from '../models/user';
import { share } from 'rxjs';
import { StorageService } from '../services/storage.service'
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vip2-room',
  templateUrl: './vip2-room.component.html',
  styleUrls: ['./vip2-room.component.css']
})

export class Vip2RoomComponent implements OnInit {
	visible:boolean = false;
	visible_avatar:boolean = false;
	visible_nickname:boolean = false;
	nickname:string =  "";
	login:string = "";
	avatar:string = "";
	level:number = 0;
	searchName:string = "";
	games!:any;
	user!: User;
	succes:number = 0;
	
	constructor(private storage: StorageService,
				private socketService: SocketService,
				private router: Router,
				private route: ActivatedRoute
				 ) {

		this.route.queryParams.subscribe(async (params) => {
			if (params['login']) {
				this.socketService.searchForAUser(params['login']);
			} else
				this.router.navigateByUrl("vip-room");
		});
}

	ngOnInit(): void {
		this.socketService.receiveGameHistory().subscribe((res) => {
		this.games = res;
	});
		this.socketService.waitForAUser().subscribe((res) => {
			if (res) {
				this.nickname = res.nickname;
				this.login = res.login;
				this.avatar = res.avatar;
				this.level = res.level;
				this.user = res;
				this.setUpachievement();
				this.socketService.askForGameHistory(this.user);
			} else if (!res && !this.login)
				this.router.navigateByUrl("vip-room");
			this.searchName = "";
		})
	}
	setUpachievement()
	{
		if (this.level > 0)
			this.succes = 1;
		if (this.level >= 2)
			this.succes = 2;
		if (this.level >= 4)
			this.succes = 3;
	}

	ngOnDestroy() {
		this.socketService.unsubscribeSocket("hereIsTheUserYouAskedFor");
		this.socketService.unsubscribeSocket("hereIsGameHistory");

	}

	showhide() {
		this.visible = this.visible ? false : true;
		this.visible_nickname = false;
		this.visible_avatar = false;
	}

	searchProfile(){
		this.socketService.searchForAUser(this.searchName);
	}

	backtoMyself(){
		this.router.navigateByUrl("vip-room");
	}
}

