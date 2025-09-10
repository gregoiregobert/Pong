import { Injectable, NotFoundException } from '@nestjs/common';
import { GameInfoDto } from './dto/GameInfor.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export const WIDTH = 1000
export const HEIGHT = 640

@Injectable()
export class GameService {


	constructor(private prisma: PrismaService) {}
	
	async newgame(gameinfo: GameInfoDto)
	{
		const game = await this.prisma.gameInfo.create(
			{
				data: {
				userId1: gameinfo.userId1,
                userId2: gameinfo.userId2,
                scoreUser1: gameinfo.scoreUser1,
                scoreUser2: gameinfo.scoreUser2,
                winnerId: gameinfo.winnerId,
				}
			})
		const user1 = await this.prisma.user.findUnique({
			where: {
                id: gameinfo.userId1
            }
		})
		const user2 = await this.prisma.user.findUnique({
            where: {
                id: gameinfo.userId2
            }
        })
		if (!user1 || !user2)
			throw new NotFoundException("user not found")
		await this.prisma.user.update({
			where: {
				id: gameinfo.userId1,
			},
			data: {
				gameHistory : {
					push : game.id
				}
			}
		})
		await this.prisma.user.update({
			where: {
				id: gameinfo.userId2,
			},
			data: {
				gameHistory : {
					push : game.id
				}
			}
		})
		await this.prisma.user.update({
			where: {
				 id: gameinfo.winnerId
			},
      		data: {
				gamesWon: {
					increment: 1
				}
			}
		})
		await this.prisma.user.update({
			where: {
				 id: gameinfo.winnerId
			},
      		data: {
				elo: {
					increment: 100
				}
			}
		})
		await this.prisma.user.update({
			where: {
				 id: user1.id + user2.id - gameinfo.winnerId
			},
      		data: {
				elo: {
					decrement: 100
				}
			}
		})
		
	}

	async getGameHistory(uid: number)
	{
		const user = await this.prisma.user.findUnique(
			{
				where: {
					id: uid
				},
			})
			if (!user)
			{
				throw new NotFoundException('User not found')
			}
			return user.gameHistory
	}

	async getGameInfo(id: number)
	{
		const game = await this.prisma.gameInfo.findUnique(
            {
				where: {
                    id: id
                }
			})
			if (!game)
			{
                throw new NotFoundException('Game not found')
            }
			return game
	}
}
