import { IsNumber } from "class-validator"
import { Type } from "class-transformer"
import { Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";

// export class CreatePlayerDto{
// 	user: string;
//     score: number;
// 	socket: Socket;
// 	prismaClient: PrismaClient;

// 	constructor(user: string, score: number, socket: Socket, prismaClient: PrismaClient)
// 	{
// 		this.user = user;
//         this.score = score;
//         this.socket = socket;
//         this.prismaClient = prismaClient;
// 	}
// }

export class GameInfoDto {

	@IsNumber()
	@Type(() => Number)
	userId1: number
	
	@Type(() => Number)
	@IsNumber()
	userId2: number
	
	@Type(() => Number)
	@IsNumber()
	scoreUser1: number
	
	@Type(() => Number)
	@IsNumber()
	scoreUser2: number
	
	@Type(() => Number)
	@IsNumber()
	winnerId: number
}