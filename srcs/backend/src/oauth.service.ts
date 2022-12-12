
import { Injectable } from '@nestjs/common';
import { Oauth, Prisma } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { take } from 'rxjs';
import { PrismaService } from './prisma/prisma.service';

export interface Tokens {
		access_token: string,
		token_type: string,
		expires_in: number,
		refresh_token: string,
		scope: string,
		created_at: number
}

@Injectable()
export class OauthService {
	constructor(private prisma: PrismaService,
				private httpClient: HttpService) {}

	INTRA_API = "https://api.intra.42.fr";

	async oauth(
		oauthWhereUniqueInput: Prisma.OauthWhereUniqueInput,
	): Promise<Oauth | null> {
			var oauth = this.prisma.oauth.findUniqueOrThrow({
				where: oauthWhereUniqueInput,
			});
			return oauth;
	}

	async oauths(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.OauthWhereUniqueInput;
		where?: Prisma.OauthWhereInput;
		orderBy?: Prisma.OauthOrderByWithRelationInput;
	}): Promise<Oauth[]> {
			const { skip, take, cursor, where, orderBy } = params;
			return this.prisma.oauth.findMany({
				skip,
				take,
				cursor,
				where,
				orderBy,
			});

	}

	async getToken(code: string | null): Promise<Oauth | null> {
		if (code === null || code === undefined)
			return null;
		let result = new Promise<Oauth | null>(resolve => {
				this.httpClient.post<Oauth>('https://api.intra.42.fr/oauth/token', {
				grant_type: "authorization_code",
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				code,
				redirect_uri: process.env.REDIRECT_URI,
				}).pipe(take(1)).subscribe({
					next: async result => {
						resolve(result.data);
					},
					error: err => {
						resolve(null);
					}
				})
			}
			);
		return (await result);
	}


	async updateOauth(params: {
		where: Prisma.OauthWhereUniqueInput;
		data: Prisma.OauthUpdateInput;
		include: Prisma.OauthInclude
	}): Promise<Oauth> {
		const {where, data, include} = params;
		return await this.prisma.oauth.update({
			data,
			where,
			include
		});
	}

}
