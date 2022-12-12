import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { User } from '../models/user'
import { StorageService } from '../services/storage.service';
import { TitleStrategy } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { IGame } from '../pong/game/interfaces/game.interface';
import { DefaultGame } from '../pong/game/config';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit {
  visible:boolean =false;
  list_user!: User[];
  show:boolean=false;
  showSearching:boolean=false;
  redirectPong:boolean=false;
  bonus:boolean=false;

  gameName!:string;
  gameConfig: IGame =  new DefaultGame();;
  color:string= "rgb(115, 130, 130);"


  
  user: User = {
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
  }


  constructor(private apiService: ApiService,
	private storageService: StorageService, private socketService: SocketService) { }

  async ngOnInit(): Promise<void> {
  this.apiService.getAllUsers(this.storageService.getCode()).subscribe(
      (result=>{
        this.list_user =result;
      }));
    
  this.socketService.listenForMatchmaking().subscribe((res) => {
    this.showSearching = false;
  })
  }

  showavailable(){
    this.visible= !this.visible;
  }

  setUpGameConfig(player1: User, player2: User) //PLAYER 1 EST A GAUCHE
  {
    let id = Number(this.storageService.getId());
    if (id == player1.id)
    {
      this.gameConfig.left.mode.type = "local";
      this.gameConfig.right.mode.type = "remote";
    }
    else if (id == player2.id)
    {
      this.gameConfig.left.mode.type = "remote";
      this.gameConfig.right.mode.type = "local";
    }
  }

  getId(): number{
    let id = localStorage.getItem("id");
    if (id === null || id === undefined)
      return 0;
    return  Number(id);
  }

  getLogin(): string{
    let login = localStorage.getItem("login");
    if (login === null || login === undefined)
      return "";
    return  login;
  }

  getEmail(): string{
    let email = localStorage.getItem("email");
    if (email === null || email === undefined)
      return "";
    return  email;
  }

  getFirstName(): string{
    let first_name = localStorage.getItem("first_name");
    if (first_name === null || first_name === undefined)
      return "";
    return  first_name;
  }

  getLastName(): string{
    let last_name = localStorage.getItem("last_name");
    if (last_name === null || last_name === undefined)
      return "";
    return  last_name;
  }

  getUrl(): string{
    let url = localStorage.getItem("url");
    if (url === null || url === undefined)
      return "";
    return  url;
  }

  getDisplayName(): string{
    let display_name = localStorage.getItem("display_name");
    if (display_name === null || display_name === undefined)
      return "";
    return  display_name;
  }

  getNickname(): string{
    let nickname = localStorage.getItem("nickname");
    if (nickname === null || nickname === undefined)
      return "";
    return  nickname;
  }

  getImage(): string{
    let image = localStorage.getItem("image");
    if (image === null || image === undefined)
      return "";
    return  image;
  }

  getAvatar(): string{
    let avatar = localStorage.getItem("avatar");
    if (avatar === null || avatar === undefined)
      return "";
    return  avatar;
  }


  getOnline(): number{
    let online = localStorage.getItem("online");
    if (online === "1")
      return 1
    else
      return 0
  }

  justPlay(){
    this.socketService.matchmaking(this.user, this.bonus);
    this.showSearching=true;

  }

  receiveShowSearching($event){
    this.showSearching=$event;
  }

  activateBonus()
  {
    this.bonus = !this.bonus;
    this.color=this.bonus?"rgb(255, 87, 51)":"rgb(115, 130, 130)"; 
  }

}
