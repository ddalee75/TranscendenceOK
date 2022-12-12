import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Message } from '../models/message';
import { Channel } from '../models/channel';
import { Tfa } from '../models/tfa'
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	API_SERVER = "https://" + environment.IP_HOST + "/api";

	constructor(private httpClient: HttpClient,) {

	}

	addPrivateChannel(name: string, creator_id: number, password: string) {
		const data = { name, creator_id, password };
		return this.httpClient.post<Channel>(`${this.API_SERVER}/addPrivateChannel`, data);
	}

	addChannel(name: string, creator_id: number) {
		const data = { name, creator_id };
		return this.httpClient.post<Channel>(`${this.API_SERVER}/addChannel`, data);
	}

	findChannelByName(name: string) {
		return this.httpClient.get<Channel>(`${this.API_SERVER}/findChannelByName/${name}`)
	}

	getAllChannels() {
		return this.httpClient.get<Channel[]>(`${this.API_SERVER}/getAllChannels`)
	}

	getSocket(login: string) {
		return this.httpClient.get<User>(`${this.API_SERVER}/getSocket/${login}`)
	}

	getUser(code: string) {
		return this.httpClient.get<User>(`${this.API_SERVER}/user/${code}`);
	}

	findUserByLogin(login: string) {
		return this.httpClient.get<User>(`${this.API_SERVER}/userByLogin/${login}`);
	}

	updateNickName(id: number, nickname: string) {
		let data = { id, nickname };
		return this.httpClient.post<User>(`${this.API_SERVER}/updateNickName`, data);
	}

	updateAvatar(id: number, avatar: string) {
		let data = { id, avatar };
		return this.httpClient.post<User>(`${this.API_SERVER}/updateAvatar`, data);
	}

	getAllUsers(code: string) {
		return this.httpClient.get<User[]>(`${this.API_SERVER}/users/${code}`);
	}

	updateUser(code: string, user: User) {
		return this.httpClient.patch<User>(`${this.API_SERVER}/user/${code}`, user);
	}

	userInfo(code: string | undefined) {
		return this.httpClient.get<boolean>(`${this.API_SERVER}/user/info/${code}`);
	}

	getMessages(fromUserId: Number, userId: Number) {
		const data = { fromUserId, userId };
		return this.httpClient.get<Message[]>(`${this.API_SERVER}/messages/${fromUserId}/${userId}`);
	}

	getChannelMessages(channelName: string) {
		return this.httpClient.get<Message[]>(`${this.API_SERVER}/channelMessages/${channelName}`);
	}

	createChannelMessage(message: Message) {
		return this.httpClient.post<Message>(`${this.API_SERVER}/channelMessage`, message);
	}

	createMessage(message: Message) {
		return this.httpClient.post<Message>(`${this.API_SERVER}/message`, message);
	}

	signup(code: string) {
		return this.httpClient.post<User | boolean>(`${this.API_SERVER}/auth/`, { code });
	}

	signupTfa(code: string) {
		return this.httpClient.post<Tfa>(`${this.API_SERVER}/tfa/signup`, { code });
	}

	disableTfa(code: string) {
		return this.httpClient.patch(`${this.API_SERVER}/tfa/disable`, { code });
	}

	verifyTfa(data: { code: string, tfa_key: string }) {
		return this.httpClient.post(`${this.API_SERVER}/tfa/verify`, data);
	}

	validateTfa(data: { code: string, tfa_key: string }) {
		return this.httpClient.post<User | boolean>(`${this.API_SERVER}/tfa/validate`, data);
	}
}
