import { Injectable } from '@nestjs/common';
import { JoinedRoom, Room, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JoinedRoomI } from '../model/joinedRoom.interface';
import { RoomI } from '../model/room.interface';


@Injectable()
export class JoinedRoomService {

	constructor(private readonly prisma: PrismaService) {}
	
	async create(joinedRoomData: JoinedRoomI): Promise<JoinedRoom> {
		const { socketId, user, room } = joinedRoomData;
		return this.prisma.joinedRoom.create({
		  data: {
			socketId,
			user: {
			  connect: {
				id: user.id,
			  },
			},
			room: {
			  connect: {
				id: room.id,
			  },
			},
		  },
		});
	  }
	  
	  
	  async findByUser(user: User): Promise<JoinedRoom[]> {
		return this.prisma.joinedRoom.findMany({
		  where: {
			userId: user.id,
		  },
		});
	  }
	  
	  async findByRoom(room: RoomI): Promise<JoinedRoom[]> {
		return this.prisma.joinedRoom.findMany({
		  where: {
			roomId: room.id,
		  },
		});
	  }
	  
	  async deleteBySocketId(socketId: string) {
		return this.prisma.joinedRoom.deleteMany({
		  where: {
			socketId: socketId,
		  },
		});
	  }
	  
	  async deleteAll() {
		return this.prisma.joinedRoom.deleteMany();
	  }
}
