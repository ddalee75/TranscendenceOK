	import { Component, Input, OnInit } from '@angular/core';
	import { ApiService } from '../services/api.service';
	import { HttpClient } from '@angular/common/http';
	import { HttpHeaders } from '@angular/common/http';
	import { SocketService } from '../services/socket.service';
	import { User } from '../models/user';

	import { share } from 'rxjs';
	import { StorageService } from '../services/storage.service'
import { Router } from '@angular/router';
import { SGame } from '../models/savedGame';

	@Component({
		selector: 'app-vip-room',
		templateUrl: './vip-room.component.html',
		styleUrls: ['./vip-room.component.css']
	})

	export class VipRoomComponent implements OnInit {
	visible:boolean = false;
	visible_avatar:boolean = false;
	visible_nickname:boolean = false;
	
	userToShow: User = {
		login: this.storage.getLogin(),
		displayname: this.storage.getDisplayName(),
		image: this.storage.getImage(),
		avatar: this.storage.getAvatar(),
		nickname: this.storage.getNickName(),
		id: this.storage.getId(),
		online: 1,
		email: "",
		first_name: "",
		last_name: "",
		url: this.storage.getAvatar(),
		level: this.storage.getLvl()
	};
	login = this.storage.getLogin();
	displayname = this.storage.getDisplayName();
	image = this.storage.getImage();
	avatar = this.storage.getAvatar();
	nickname = this.storage.getNickName();
	id = this.storage.getId();
	newNickName!:string;
	searchName:string = "";
	games!:any;
	succes:number =0;
	
	constructor(private apiService: ApiService,
		private http: HttpClient,
		private storage: StorageService,
		private socketService: SocketService,
		private router: Router) {
			this.qrCode = this.storage.getQrCode();
	}
		tfa_auth: boolean = false;
		tfa_validation: boolean = false;
		qrCode: string = "";
		tfa_key: string = "";
		tfa_count: number = 3;
		url = this.avatar;
		selectedFile! : File;

	onSelect(event) {
		
		this.selectedFile =event.target.files[0];
		let fileType = event.target.files[0].type;
		if (fileType.match(/image\/*/)) {
		let reader = new FileReader();
		reader.readAsDataURL(event.target.files[0]);
		reader.onload = (event: any) => {
			this.userToShow.avatar = event.target.result;
		};
		} else {
		window.alert('Please select correct image format');
		}
	}

	onUpload(){
		
		if (this.selectedFile.size < 75000){
		this.apiService.updateAvatar(Number(this.id), String(this.userToShow.avatar)).subscribe();
		this.storage.setAvatar(String(this.userToShow.avatar));
		window.alert('***Update done***');
		}
		else{
			window.alert('***image too large only < 75kb ***');
		}
	}

	ngOnInit(): void {
		this.socketService.receiveInfos().subscribe((res) => {
			console.log(res);
			this.userToShow = res;
			this.setUpachievement();

		})
		this.socketService.getInfos(this.storage.getId());
		this.socketService.waitForAUser().subscribe((res) => {
		this.userToShow = res;
		})
		this.tfa_auth = this.storage.getTwoFactorAuth();
		this.qrCode = this.storage.getQrCode();
		this.socketService.receiveGameHistory().subscribe((res) => {
			this.games = res;
		})
		this.socketService.askForGameHistory(this.userToShow);
	}

	ngOnDestroy() {
		this.socketService.unsubscribeSocket("hereIsGameHistory");
		this.socketService.unsubscribeSocket("hereIsTheUserYouAskedFor");
	}

	showhide() {
		this.visible = this.visible ? false : true;
		this.visible_nickname = false;
		this.visible_avatar = false;
	}

	setUpachievement()
	{
		if (this.userToShow.level > 0)
			this.succes = 1;
		if (this.userToShow.level >= 2)
			this.succes = 2;
		if (this.userToShow.level >= 4)
			this.succes = 3;
	}

	changeNickname(){
		if (this.newNickName)
			this.apiService.updateNickName(Number(this.id), this.newNickName).subscribe((result) => {
				if (result) {
					this.storage.setNickName(result.nickname)
					window.alert('*** Nickname changed ***');
					this.userToShow.nickname = result.nickname;
				} else
					window.alert('*** Invalid Nickname ***');
			});
		this.newNickName = "";

	}

	searchProfile(){
		// this.socketService.searchForAUser(this.searchName);
		// this.router.navigate(["vip2-room"], {queryParams: {user: this.searchName}});
		this.router.navigate(["vip2-room"], { queryParams: { login: this.searchName }});
	}

	backtoMyself(){
		this.socketService.searchForAUser(String(this.login));
	}

	showhide_nickname() {
		this.visible_nickname = this.visible_nickname ? false : true;
		this.visible_avatar = false;
		this.tfa_auth = false;
		this.tfa_validation = false;
	}
	
	showhide_avatar() {
		this.visible_avatar = this.visible_avatar ? false : true;
		this.visible_nickname = false;
		this.tfa_auth = false;
		this.tfa_validation = false;
	}
	tfa_signup() {
		this.apiService.signupTfa(this.storage.getCode()).subscribe({
			next: (result) => {
				if (result.tfa_qr) {
					this.storage.setQrCode(result.tfa_qr);
					this.qrCode = result.tfa_qr;
				}
				this.tfa_auth = true;
				this.tfa_validation = true;
				this.visible_avatar =false;
				this.visible_nickname=false;
			}
		});
	}

	tfa_disable() {

		
		this.visible_nickname = false;
		this.visible_avatar = false;
		this.apiService.disableTfa(this.storage.getCode()).subscribe({
			next: (result) => {
				this.storage.setQrCode(undefined);
				this.qrCode = "";
				this.tfa_auth = false
				this.tfa_validation = false;
				
			},
		});
		
	}

	tfa_verify() {
		this.apiService.verifyTfa({code : this.storage.getCode(), tfa_key: this.tfa_key}).subscribe({
			next: (result) => {
				console.log(result);
				if (result) {
					this.tfa_validation = false;
					this.storage.setTfa(true);
				}
				else if (this.tfa_count < 2) {
					this.tfa_auth = false;
					this.tfa_count = 3;
					this.tfa_validation = false;
					this.tfa_disable();
				}
				else
					this.tfa_count--;
				this.tfa_key = "";
			},
		});
	}
}
