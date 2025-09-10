import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {

	constructor(private readonly prisma: PrismaService) {}

	async getRoom(roomId: number): Promise<Room | null> {
		return this.prisma.room.findUnique({
		  where: {
			id: roomId,
		  },
		  include: {
			users: true,
		  },
		});
	  }
}
