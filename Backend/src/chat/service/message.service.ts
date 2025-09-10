import { Injectable } from '@nestjs/common';
import { Message, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomI } from '../model/room.interface';
import { MessageI } from '../model/message.interface';

@Injectable()
export class MessageService {

	constructor(private readonly prisma: PrismaService) {}


	async create(message: MessageI, user_to_connect: User): Promise<Message> {
		const { id, ...messageWithoutId } = message;
		return this.prisma.message.create({
			data: {
				...messageWithoutId,
				user: {
					connect: { id: messageWithoutId.user.id},
				},
				room: {
					connect: { id: messageWithoutId.room.id }, 
				},
			},
			include: {
				room: true,
			}
		});
	}
	  
	async findMessagesForRoom(room: RoomI): Promise<Message[]> {
		const messages = await this.prisma.message.findMany({
			where: {
				roomId: room.id,
			},
			include: {
				user: true,
				room: true,
			},
			orderBy: {
				created_at: 'asc',
			},
		});
		
		return messages
	}
	  
	  
}
