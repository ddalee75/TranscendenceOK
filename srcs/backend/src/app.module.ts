import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MessageService } from './message.service';
import { AppGateway } from './app.gateway';
import { HttpModule } from '@nestjs/axios';
import { OauthService } from './oauth.service';
import { ChannelService } from './channel.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BanAndMuteService } from './banAndMute.service';
import { TfaService } from './tfa.service';
import { ConfigModule } from '@nestjs/config'; import { PongModule } from './pong/pong.module';
import { SaveGameModule } from './save-game/save-game.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
	imports:
		[
			HttpModule,
			PongModule,
			ScheduleModule.forRoot(),
			ConfigModule.forRoot({ envFilePath: "../.env", isGlobal: true }),
			SaveGameModule,
			PrismaModule,
			UserModule,
		],
	controllers:
		[
			AppController
		],
	providers:
		[
			MessageService,
			AppGateway,
			OauthService,
			ChannelService,
			BanAndMuteService,
			TfaService
		],
})
export class AppModule { }
