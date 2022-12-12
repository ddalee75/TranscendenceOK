import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
	ConsoleLogger,
	Patch,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { ChannelService } from './channel.service';
import { OauthService } from './oauth.service';
import { TfaService } from './tfa.service';
import {
	User as UserModel,
	Oauth as OauthModel,
	Tfa as TfaModel,
	Message as MessageModel,
	Channel as ChannelModel,
	Prisma
} from '@prisma/client';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
	constructor(
		private readonly messageService: MessageService,
		private readonly userService: UserService,
		private readonly oauthService: OauthService,
		private readonly channelService: ChannelService,
		private readonly tfaService: TfaService
	) { }

	@Post('addChannel')
	async addChannel(@Body() ChannelData: { name: string, creator_id: number },): Promise<ChannelModel> {
		try {
			return await this.channelService.addChannel(ChannelData);
		} catch (e) {
			console.log("Error: addChannel :\n\
			\tname: " + ChannelData.name +
				"\n\tcreator_id: " + ChannelData.creator_id);
		}
	}

	@Post('addPrivateChannel')
	async addPrivateChannel(@Body() ChannelData: { name: string, creator_id: number, password: string },): Promise<ChannelModel> {
		try {
			return await this.channelService.addChannel(ChannelData);
		} catch (e) {
			console.log("Error: addChannel :\n\
			\tname: " + ChannelData.name +
				"\n\tcreator_id: " + ChannelData.creator_id);
		}
	}

	@Post('updateNickName')
	async updateNickName(@Body() UserData: { id: number, nickname: string },): Promise<UserModel> {
		try {
			return await this.userService.updateNickName(UserData);
		} catch (e) {
			console.log("Error: updateNickName :\n\
			\tid: " + UserData.id +
				"\n\tnickname: " + UserData.nickname);
		}
	}

	@Post('updateAvatar')
	async updateAvatar(@Body() UserData: { id: number, avatar: string },): Promise<UserModel> {
		try {
			return await this.userService.updateAvatar(UserData);
		} catch (e) {
			console.log("Error: updateAvatar :\n\
			\tid: " + UserData.id +
				"\n\tavatar: " + UserData.avatar);
		}
	}

	@Get('getAllChannels')
	async getAllChannels(): Promise<ChannelModel[]> {
		try {
			return await this.channelService.getAllChannels();
		} catch (e) {
			console.log("Error: getAllChannels");
		}
	}

	@Get('findChannelByName/:name')
	async findChannelByName(@Param('name') name: string): Promise<ChannelModel> {
		try {
			return await this.channelService.findChannelByName(name);
		} catch (e) {
			console.log("Error: findChannelByName :\n\
			\n\tname: " + name);
		}
	}

	@Get('userByLogin/:login')
	async getUserByLogin(@Param('login') login: string) {
		try {
			return await this.userService.findUserByLogin(login);
		} catch (e) {
			console.log("Error: getUserByLogin:\n\
			\n\tlogin: " + login);
		}
	}

	@Post('message')
	async addMessage(
		@Body() messageData: { userId: number, fromUserName: string, fromUserId: number, content: string },
	): Promise<MessageModel> {
		try {
			return await this.messageService.createMessage(messageData);
		} catch (e) {
			console.log("Error: addMessage:\n\
			\n\tuserId: " + messageData.userId +
				"\n\tfromUserName: " + messageData.fromUserName +
				"\n\tfromUserId: " + messageData.fromUserId +
				"\n\tcontent: " + messageData.content);
		}
	}

	@Post('channelMessage')
	async channelMessage(
		@Body() messageData: { channel_name: string, fromUserName: string, fromUserId: number, content: string }): Promise<MessageModel> {
		try {
			return await this.messageService.createChannelMessage(messageData);
		} catch (e) {
			console.log("Error: channelMessage:\n\
			\n\tchannel_name: " + messageData.channel_name +
				"\n\tfromUserName: " + messageData.fromUserName +
				"\n\tfromUserId: " + messageData.fromUserId +
				"\n\tcontent: " + messageData.content);
		}
	}

	@Get('getSocket/:login')
	async getSocket(@Param('login') login: string): Promise<UserModel> {
		try {
			return await this.userService.findUserByLogin(login);
		} catch (e) {
			console.log("Error: getSocket:\n\
				\n\tlogin: " + login);
		}
	}

	@Get('messages/:fromUserId/:userId')
	async getMessages(
		@Param('fromUserId') fromUserId: Number, @Param('userId') userId: Number
	): Promise<MessageModel[]> {
		let data = { fromUserId, userId };
		try {
			return await this.messageService.getMessages(data);
		} catch (e) {
			console.log("Error: getMessage:\n\
				\n\tfromUserId: " + fromUserId +
				"\n\tuserId: " + userId);
		}
	}

	@Get('channelMessages/:channelName')
	async getChannelMessages(
		@Param('channelName') channelName: string
	): Promise<MessageModel[]> {
		let data = { channelName };
		try {
			return await this.messageService.getChannelMessages(data);
		} catch (e) {
			console.log("Error: getChannelMessage:\n\
				\n\tchannelName: " + channelName);
		}
	}

	@Get('users/:code')
	async getUsers(@Param('code') code: string): Promise<UserModel[]> {
		let data = code;
		try {
			return await this.userService.getAllUsers(data);
		} catch (e) {
			console.log("Error: getUsers:/n\
				/n/tcode: " + code);
		}
	}

	@Patch('user/:code')
	async patchUser(@Param('code') code: string,
		@Body() userData: { online?: number, two_factor_auth?: boolean }): Promise<UserModel> {
		try {
			return this.userService.updateUser({
				where: { code },
				data: userData
			});
		} catch (e) {
			console.log("Error: patchUser:\n\
			\n\tcode: " + code +
				"\n\tonline: " + userData.online +
				"\n\ttwo_factor_auth: " + userData.two_factor_auth);
		}
	}

	@Get('user/info/:code')
	async getUserInfo(
		@Param('code') code: string): Promise<boolean> {
		try {
			const tmp = await this.oauthService.oauth({ code });
			const result = await this.userService.userInfo(tmp);
			return result;
		}
		catch {
			console.log("Error: getUserInfo:\n\
			\n\tcode: " + code);
			return false;
		}
	}

	@Post('auth/')
	async signup(
		@Body() auth: { code: string }): Promise<UserModel | boolean> {
		try {
			var oauth = await this.oauthService.getToken(auth.code);
			if (oauth != null)
				return await this.userService.createUser(oauth, auth.code);
			else {
				throw Prisma.PrismaClientKnownRequestError
			}
		} catch (e) {
			console.log("Error: signup:\n\
			\n\tcode: " + auth.code);
		}
	}

	@Patch('tfa/disable')
	async patchTfa(
		@Body() params: { code: string }) {
		try {
			this.tfaService.disableTfa(params.code);
		} catch (e) {
			console.log("Error: patchTfa:\n\
			\n\tcode: " + params.code);
		}
	}

	@Post('tfa/signup')
	async postSignup(
		@Body() params: { code: string }): Promise<TfaModel> {
		try {
			return (this.tfaService.createTfa(params.code));
		} catch (e) {
			console.log("Error: postSignup:\n\
			\n\tcode: " + params.code);
		}
	}

	@Post('tfa/verify')
	async postVerify(
		@Body() param: { code: string, tfa_key: string }) {
		try {
			return (await this.tfaService.verifyTfa(param))
		} catch (e) {
			console.log("Error: postVerify:\n\
			\n\tcode: " + param.code +
				"\n\ttfa_key: " + param.tfa_key);
		}
	}

	@Post('tfa/validate')
	async postValidate(
		@Body() param: { code: string, tfa_key: string }): Promise<UserModel | boolean> {
		try {
			return (await this.tfaService.validateTfa(param));
		} catch (e) {
			console.log("Error: postValidate:\n\
			\n\tcode: " + param.code +
				"\n\ttfa_key: " + param.tfa_key);
		}
	}
}
