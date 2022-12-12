import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GameRoomComponent } from './game-room/game-room.component';
import { ShowRoomComponent } from './show-room/show-room.component';
import { VipRoomComponent } from './vip-room/vip-room.component';
import { Vip2RoomComponent } from './vip2-room/vip2-room.component';
import { RestRoomComponent } from './rest-room/rest-room.component';
import { ChatComponent } from './chat/chat.component';
import { SalonComponent } from './salon/salon.component';
import { FriendUserComponent } from './friend-user/friend-user.component';
import { AuthGuard } from './auth/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [

  	{ path: '', component: LoginComponent },
	{ path: 'game-room', component: GameRoomComponent,
		canActivate: [AuthGuard]
	},
	{ path: 'show-room', component: ShowRoomComponent,
		canActivate: [AuthGuard]
	},
	{ path: 'vip-room', component: VipRoomComponent,
		canActivate: [AuthGuard]
	},
	{ path: 'vip2-room', component: Vip2RoomComponent,
		canActivate: [AuthGuard]
	},
	{ path: 'rest-room', component: RestRoomComponent,
		canActivate: [AuthGuard]
	},
	{ path: 'home', component: HomeComponent,
		canActivate: [AuthGuard]
	},
	{ path: 'chat', component: ChatComponent,
		canActivate: [AuthGuard]
	},
	{ path: 'salon', component: SalonComponent,
		canActivate: [AuthGuard]
	},
	{ path: 'friend', component: FriendUserComponent,
		canActivate: [AuthGuard]
	},
	{ path: '404', component: NotFoundComponent,
	},
	{ path: '**', redirectTo: '/404',
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
