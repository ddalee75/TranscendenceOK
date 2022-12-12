import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { ApiService } from '../services/api.service';
import { User } from '../models/user';
import { SGame } from '../models/savedGame';
import { Channel } from '../models/channel'
import { environment } from 'src/environments/environment';
import { IGameStates } from '../pong/game/interfaces/game-states.interface';
import { IInput } from '../pong/game/interfaces/input.interface';
import { GameMode, PlayerMode, IGame } from '../pong/game/interfaces/game.interface';


interface ITest {
  name: string;
  playerLeft: User;
  playerRight: User;
  game: any;
  activatePowerUp: boolean | undefined;
  tickSubscription: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = 'https://' + environment.IP_HOST;
  private socket;
  API_SERVER = 'https://' + environment.IP_HOST + '/api';
  target !: User;
  sock :string | undefined = "";

  games: SGame[] = [];

  constructor(private apiService: ApiService) {
    this.socket = io(this.url);
  }

  socketInTotoRoom(){
    this.socket.emit('userInTotoRoom');
  }

  unsubsribeChannelEvent() {
	this.socket.off("channelIsUpdated");
	this.socket.off("someoneJoinedTheChannel");
	this.socket.off("newAdminInChannel");
	this.socket.off("msginchannel");
	this.socket.off("youAreBanned");
  }

  unsubscribeSocket(event: string) {
	this.socket.off(event);
  }
  //MUTE

  muteUserByTime(userToMute: number, channelConcerned: number, timeToMute: number)
  {
    this.socket.emit('muteUserByTime', userToMute, channelConcerned, timeToMute);
  }

  muteUser(userToMute: number, channelConcerned: number)
  {
    this.socket.emit('muteUser', userToMute, channelConcerned);
  }

  unmuteUser(userToMute: number, channelConcerned: number)
  {
    this.socket.emit('unmuteUser', userToMute, channelConcerned);
  }


  //Be Admin
  BeAdminSalon(guestToBeAdmin: number, channelConcerned: number){
      this.socket.emit('beAdminSalon', guestToBeAdmin, channelConcerned)
  }

  delAdminSalon(guestToDelAdmin: number, channelConcerned: number){
    this.socket.emit('delAdminSalon', guestToDelAdmin, channelConcerned)
}
  

//BAN

banUserByTime(userToBan: number, channelConcerned: number, timeToMute: number)
{
  this.socket.emit('banUserByTime', userToBan, channelConcerned, timeToMute);
}

banUser(userToBan: number, channelConcerned: number)
{
  this.socket.emit('banUser', userToBan, channelConcerned);
}

unbanUser(userToBan: number, channelConcerned: number)
{
  this.socket.emit('unbanUser', userToBan, channelConcerned);
}

amIBanned()
{
  return new Observable<any>((obs) => {
    this.socket.on('youAreBanned', (res: number, res2: User[]) => {
      let data = {res, res2}
      obs.next(data)
    })
  })
}

//CONNECTION

  imDisconnected(login: string)
  {
    this.socket.emit('isOffline', login);
    this.socket.emit('imDisconnected');
    this.socket.disconnect();
  }

  imConnected(login: string)
  {
    this.socket.emit('isOnline', login);
    this.socket.emit('imConnected');
  }

  getId(): String{
    return this.socket.id;
  }

  sendLogin(login: string): void {
    this.socket.emit('sendLogin', login);
  }

  //CHANNEL

  async createChannel(channel_name: string, creator_id: number)
  {
    this.socket.emit('createChannel', channel_name, creator_id, () => { 
      this.socket.emit('joinChannel', channel_name, creator_id);
      // this.socket.emit('userInChannelListPlz', channel_name);
    });
  }

  getConnectionSignal(current_id: number)
  {
    return new Observable((obs) => {
      this.socket.on('userListUpdated', () => {
      this.socket.emit('userListPlz', current_id);
      this.socket.emit('getFriendList', current_id);
      obs.next();
      })
    })
  }

  verifyPassword(password: string, channel_name: string)
  {
    this.socket.emit('verifyPassword', password, channel_name);
  }

  getPassVerifResponse()
  {
    return new Observable<boolean>((obs) => {
      this.socket.on('goodPassword', (res: boolean) => {
        obs.next(res);
      })
      this.socket.on('wrongPassword', (res: boolean) => {
        obs.next(res);
      })
    })
  }

  stopListeningPassVerifResponse()
  {
    this.socket.off('goodPassword');
    this.socket.off('wrongPassword');
  }

//UPDATE CHANNEL

  async updateChannel()
  {
    this.socket.emit('channelToUpdate');
  }

  async updateChannels()
  {
    this.socket.emit('channelsToUpdate');
  }

  async getUpdateChannel()
  {
    return new Observable<Channel>((obs)=>{
    this.socket.on('channelIsUpdated', (data: Channel) => {
      obs.next(data);
    })
  })
  }

  async getUpdateChannels()
  {
    return new Observable<Channel[]>((obs)=>{
      this.socket.on('channelsAreUpdated', (data: Channel[]) => {
        obs.next(data);
      })
    }) 
  }

  getAllUser()
  {
    return new Observable<User[]>((obs) => {
      this.socket.on('hereIsTheUserList', (res: User[]) => {
        obs.next(res);
      })
  })
  }

  createPrivChannel(channel_name: string, creator_id: number, password?: string)
  {
    this.socket.emit('createPrivChannel', channel_name, creator_id, password, () => { 
      this.socket.emit('joinChannel', channel_name, creator_id);
    });
  }

  updateChannelList() : Observable<Channel[]>
  {
    return new Observable<Channel[]>((observer) => {
      this.socket.on('aChannelHasBeenCreated', (data) => {
        observer.next(data);
      })
    })
  }

  resetChannelPassword(channel:Channel, new_pwd:string){

    this.socket.emit('resetChannelPassword', channel, new_pwd); 
  }

  joinChannel(channel_name: string, id: number)
  {
    this.socket.emit('joinChannel', channel_name, id);
  }

  leaveChannel(channel_name: string, id: number)
  {
    this.socket.emit('leaveChannel', channel_name, id);
  }

  sendMsgToChannel(channel_name: string, message: string, from: string) : void
  {
    this.socket.emit('MsgInChannel', channel_name, from, message);
  }

  getMsgFromChannel() : Observable<string>
  {
    return new Observable<string>((observer) => {
      this.socket.on('msginchannel', (msg) => {
        observer.next(msg)
      });
    });
  }

  updateUserInSalonList(current_channel_name: string)
  {
    this.socket.emit('userInChannelListPlz', current_channel_name);
  }

  //USER

  getInfos(id: number)
  {
    this.socket.emit('infosPlz', id);
  }

  receiveInfos()
  {
    return new Observable<User> ((obs) => {
      this.socket.on('hereIsInfos', (res) => {
        obs.next(res);
      })
    })
  }

  askForUserList(current_id: number)
  {
    this.socket.emit('userListPlz', current_id);
  }

  updateUserList() : Observable<User[]>
  {
    return new Observable<User[]>((observer) => {
        this.socket.on('someoneJoinedTheChannel', (data) => {
          observer.next(data.joined);
        });
  
      });
  };

  updateAdminList() : Observable<User[]>
  {
    return new Observable<User[]>((obs) => {
      this.socket.on('newAdminInChannel', (res) => {
        obs.next(res);
      })
    })
  }
        
  searchForAUser(login:string)
  {
    this.socket.emit('SearchForThisUser', login);
  }

  waitForAUser()
  {
    return new Observable<User>((obs) => {
      this.socket.on('hereIsTheUserYouAskedFor', (res) => {
        obs.next(res);
      })
    })
  }

  updateUser(current: User)
  {
    this.socket.emit('updateUser', current);
  }

  getUserUpdated()
  {
    return new Observable<User> ((obs) => {
      this.socket.on("userUpdated", (res) => {
        obs.next(res);
      })
    })
  }

  askMatchHistory(current: User)
  {
    this.socket.emit('matchHistoryPlz', current);
  }

  getMatchHistory()
  {
    return new Observable<SGame[]> ((obs) => {
      this.socket.on("hereIsTheMatchHistory", (res) => {
        obs.next(res);
      })
    })
  }

//START COMPONENT

  iAmReady()
  {
    return new Observable(obs => {
      this.socket.on('youAreReady', () => {
        obs.next();
      })
    })
  }

  //PRIV MESSAGE

  sendMessage(message: string): void {
    this.socket.emit('msgToServer', message);
  }

  sendMessageTo(message: string, login1: string, login2: string, nickname: string): void
  {
    this.socket.emit('sendMsgTo', message, "", login1, login2, nickname)
  };

  getMessage(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socket.on('PrivMsg', (message) => {
        observer.next(message);
      });
    });
  }

  initDestActualisation(dest: User){
    this.socket.emit('ActualisationDest', dest);
  }

  destActualisation(): Observable<User> {
    return new Observable<User>((obs) => {
      this.socket.on('DestActualisation', (res) => {
        obs.next(res);
      });
    });
  }

  //INVITATION GAME

  initSessionToPlay(player1: User, player2: User){
    this.socket.emit('CreateRoomToPlay', player1, player2);
  }

  // isGameReady(){
  //   return new Observable<boolean>((obs) => {
  //     this.socket.on('GameIsReady', () => {
  //       obs.next(true);
  //     })
  //   })
  // }

  displayInvitation(player2: User, player1:User, gameConfig: IGame){
    this.socket.emit('initDisplayInvitation', player2, player1, gameConfig);
  }

  refuseInvitation(target: User, target2:string){
    this.socket.emit('refuseInvitation', target, target2);
  }

  doIHaveToDisplay(){
    return new Observable<any>((obs) => {
      this.socket.on('DisplayInvitation', (res:boolean, res2: User, res3: User, res4: IGame) => {
        let data = {res, res2, res3, res4}
        obs.next(data);
      })
    })
  }

  showrefuseInvitation(){
    return new Observable<any>((obs) => {
      this.socket.on('refuseInvitation', (res:boolean, res2: User) => {
        let data = {res, res2}
        obs.next(data);
      })
    })
  }

  readySignal(player1: User, player2: User, gameConfig: IGame)
  {
    this.socket.emit('ready', player1, player2, gameConfig);
  }

  acceptInvitation(player2: User, player1: User){
    this.socket.emit('invitationIsAccepted', player2, player1);
  }

  isGameAccepted()
  {
    return new Observable<any>((obs) => {
      this.socket.on('invitationAccepted', (res:boolean, res2:User, res3: User) => {
        let data = {res, res2, res3}
        obs.next(data);
      })
    })
  }

  areYouReady()
  {
    return new Observable<boolean>((obs) => {
      this.socket.on('areYouReady', (res: boolean) => {
        obs.next(res);
      })
    })
  }

  isGameReady()
  {
    return new Observable<any>((obs) => {
      this.socket.on('bothPlayerAreReady', (res:User, res2:User, bonus: boolean) => {
        let data = {res, res2, bonus}
        obs.next(data);
      })
    })
  }

  createGame(roomName: string, gameConfig: IGame, player1: User, player2: User, bonus: boolean)
  {
    this.socket.emit('createGamePlz', roomName, gameConfig, player1, player2, bonus);
  }

  stopMatchmaking(bonus: boolean)
  {
    this.socket.emit('stopMatchmaking', bonus);
  }

  matchmaking(player: User, bonus: boolean)
  {
    this.socket.emit('matchmaking', player, bonus);
  }

  listenForMatchmaking()
  {
    return new Observable<any> ((obs) => {
      this.socket.on('matchmakingDone', (res, res2, res3) => {
        let data = {res, res2, res3}
        obs.next(data);
      })
    })
  }

  //PONG GAME

  sendMove(move: IInput, name: string): void {
    this.socket.emit('moveToServer', move, name);
  }

  getMove(): Observable<IInput> {
    return new Observable<IInput>((observer) => {
      this.socket.on('moveToClient', (message) => {
        observer.next(message);
      });
    });
  }

  sendGameStates(gameStates: IGameStates): void {
    this.socket.emit('gameStatesToServer', gameStates);
  }

  getGameStates(name: string): Observable<IGameStates> {
    return new Observable<IGameStates>((observer) => {
      this.socket.on(name + '_gameStatesToClient', (message) => {
        observer.next(message);
      });
    });
  }

  isGameFinished()
  {
    return new Observable<any> ((res) => {
      this.socket.on('gameIsFinished', (obs: any) =>
      {
        res.next(obs);
      })
    })
  }

  closeGameRoom(gameName: string)
  {
    this.socket.emit('closeThisRoom', gameName);
  }

  includedInRoom(gameName: string)
  {
    this.socket.emit('amIInTheRoom', gameName);
  }

  receiveIncludedInRoom()
  {
    return new Observable<boolean> ((obs) => {
      this.socket.on('responseAreYouInTheRoom', (res) => {
        obs.next(res);
      })
    })
  }

  updatePlayerStatus(current: User)
  {
    this.socket.emit('thisPlayerIsPlaying', current);
  }

  updatePlayerStatus2(current: User)
  {
    this.socket.emit('thisPlayerStoppedPlaying', current);
  }

  addMeToRoom(gameName: string)
  {
    this.socket.emit('addMeToRoom', gameName);
  }

  leaveTheRoom(name: string)
  {
    this.socket.emit('emptyTheRoom', name);
  }

//SHOW ROOM

  getMatches()
  {
    this.socket.emit("gamesPlz");
  }

  receiveMatches()
  {
    return new Observable<SGame> ((obs) => {
      this.socket.on('hereIsMatchesList', (res) => {
        obs.next(res);
      })
    })
  }

// GAME HISTORY

  askForGameHistory(current: User)
  {
    this.socket.emit('matchHistoryPlz', current);
  }

  receiveGameHistory()
  {
    return new Observable<SGame>((obs) => {
      this.socket.on('hereIsGameHistory', (data) => {
        obs.next(data);
      })
    })
  }

  gameIsReadyToSpectate()
  {
    return new Observable<string> ((obs) => {
      this.socket.on('gameIsReadyToSpectate', (data) => {
        obs.next(data);
      })
    })
  }

  spectateGame(roomName: string)
  {
    this.socket.emit('iWantToWatchThis', roomName);
  }

  getGamePlayers(game: SGame)
  {
    this.socket.emit('gameInfosPlz', game);
  }

  receiveGamePlayers(game: SGame)
  {
    let answer = 'hereAreTheGame' + game.id + 'Infos'
    return new Observable<SGame> ((obs) => {
      this.socket.on(answer, (res) => {
        obs.next(res);
      })
    })
  }

  askForGames(id: number)
  {
    let returnValue: any = null;
    return new Observable<any>((obs) => {
      this.socket.on('hereIsGames', (res) => {
        if (res) {
          this.games = res;
          this.games.forEach((data) => {
            if(data.players[0].id == id || data.players[1].id == id)
              returnValue = data;
          })
      }
        obs.next(returnValue);
      })
    })
  }

  getGames()
  {
    this.socket.emit('getGames');
  }

  closeTheRoom(gameName: string)
  {
    this.socket.emit('closeThisRoom', gameName);
  }

//INIT

  sendStart(name: string): void {
    this.socket.emit('startToServer', name);
  }

  sendReset(name: string): void {
    this.socket.emit('resetToServer', name);
  }

  getStart() {
    return new Observable<void>((observer) => {
      this.socket.on('startToClient', (payload) => {
        observer.next(payload);
      });
    });
  }

  //Add Friend

  getAddFriend(id: number, id1: number){
    this.socket.emit('getAddFriend', id, id1);
  }

  getFriend(current_id: number): Observable<User[]> {
    return new Observable<User[]>((observer) => {
      this.socket.on('getFriend', (tab: User[]) => {
        observer.next(tab);
      });
    });
  }

  addFriend(current_id: number): Observable<User[]> {
    return new Observable<User[]>((observer) => {
      this.socket.on('addFriend', (tab: User[]) => {
        this.socket.emit('userListPlz', current_id)
        observer.next(tab);
      });
    });
  }

  //Delete Friend

  getRemoveFriend(id: number, id1: number){
    this.socket.emit('getRemoveFriend', id, id1);
  }

  removeFriend(): Observable<User[]> {
    return new Observable<User[]>((obs) => {
      this.socket.on('removeFriend', (tab: User[]) => {
        obs.next(tab);
      });
    });
  }

  getFriendList(id: number){
    this.socket.emit('getFriendList', id);
  }

  listFriend(): Observable<User[]> {
    return new Observable<User[]>((obs) => {
      this.socket.on('listFriends', (tab: User[]) => {
        obs.next(tab);
      });
    });
  }

  updateListFriend(id: number){
    this.socket.emit('getFriendList', id);
  }

  checkIfFriend(id: number, id1: number){
    this.socket.emit('checkIfFriend', id, id1);
  }

  findFriendsOrNot(): Observable<number> {
    return new Observable<number>((obs) => {
      this.socket.on('findFriendsOrNot', (index: number) => {
        obs.next(index);
      })
    })
  }

//Block User

  getBlockUser(id: number, id1: number){
   this.socket.emit('getBlockUser', id, id1);
  }

  blockedUser(): Observable<User[]> {    
   return new Observable<User[]>((obs) => {
     this.socket.on('blockedUser', (tab: User[]) => {
       obs.next(tab);
     });
   });
  }

  hasBeenBlocked(dest: User, Me: User)
  {
    this.socket.emit('hasBeenBlocked', dest, Me);
  }

  getUserListWhenBlocked()
  {
    return new Observable<User> ((obs) => {
      this.socket.on('youHaveBeenBlocked', (data: User) => {
        obs.next(data);
      })
    })
  }

//Unblock User

  getUnblockUser(id: number, id1: number){
   this.socket.emit('getUnblockUser', id, id1);
  }

  unblockedUser(): Observable<User[]> {
   return new Observable<User[]>((obs) => {
    this.socket.on('unblockedUser', (tab: User[]) => {
        obs.next(tab);
      });
    });
  }

  checkIfBlock(id: number, id1: number){
    this.socket.emit('checkIfBlock', id, id1);
  }

  findBlockOrNot(): Observable<number> {
    return new Observable<number>((obs) => {
      this.socket.on('findBlockOrNot', (index: number) => {
        obs.next(index);
      })
    })
  }

  hasBeenUnblocked(dest: User, Me: User)
  {
    this.socket.emit('hasBeenUnblocked', dest, Me);
  }

  getUserListWhenUnblocked()
  {
    return new Observable<User> ((obs) => {
      this.socket.on('youHaveBeenUnblocked', (data: User) => {
        obs.next(data);
      })
    })
  }

}
