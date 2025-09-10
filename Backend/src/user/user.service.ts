import { PrismaService } from "src/prisma/prisma.service";
import { BadRequestException, Body, Injectable, ConflictException, ConsoleLogger, ForbiddenException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { stat } from "fs";
import { Prisma, Room, User } from '@prisma/client';
import { UserI } from "src/chat/model/user.interface";
import * as argon from 'argon2'
import { MailService } from "src/mail/mail.service";
import { UUID } from "typeorm/driver/mongodb/bson.typings";
import { ConnectedUserService } from "src/chat/service/connectedUser.service";

var path = require('path');
const fs = require("fs");


@Injectable()
export class UserService
{
	constructor(private prisma: PrismaService, private mail: MailService, private connectedservice: ConnectedUserService) {}

	async getUserFromId(id: number) {
        const user = await this.prisma.user.findUnique(
			{
				where: {
					id: id
				},
			},
		)
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user;
    }

	async getUserIdFromLogin(login: string) {
        const user = await this.prisma.user.findUnique(
			{
				where: {
					login: login
				},
			},
		)
		if (!user) {
			throw new NotFoundException("User not found")
    	}
		return user.id
	}

	async ChangeNick(uid:number, name:string)
	{
		const user = await this.prisma.user.findUnique({
			where: {
				id: uid,
			}
		})
		if (!user) {
            throw new NotFoundException('User not found')
        }
		const checkname = await this.prisma.user.findUnique({
			where: {
				login: name,
			}
		})
		if (checkname) {
            throw new ConflictException( name + ' is already taken')
        }
		await this.prisma.user.update({
			data: {
				login: name
			},
			where: {
				id: uid,
			}
		})
		await this.prisma.user.update({
			where: {
				 id: user.id
			},
      		data: {
			name_changed	: {
					increment: 1
				}
			}
		})
	}


	
	async GetUserStatus(id: number)
	{
		const userconnected = await this.connectedservice.findByUser({id: id})
		if (userconnected.length === 0)
			return ({status: "OFFLINE"});
		const user = await this.prisma.user.findUnique(
			{
				where: {
					id: id
				},
			})
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		if (user.is_ingame)
			return ({status: "IN GAME"});
		return ({status: "ONLINE"});
	}

	async GetUserFriendlist(uid: number)
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
		return user.friendList
	}

	async GetUserFriendRequestsReceived(uid: number)
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
		return user.FriendRequestsReceived
	}

	async GetUserFriendRequestsSent(uid: number)
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
		return user.FriendRequestsEmitted
	}

	async CancelRequest(uid:number, name:string)
	{
		const friend = await this.prisma.user.findUnique({
			where: {
				login: name
			},
		})
		if (!friend)
		{
			throw new NotFoundException('User not found')
		}
		const user = await this.prisma.user.findUnique({
			where: {
				id: uid
            },
		})
		if (!user)
		{
            throw new NotFoundException('User not found')
        }
		const friendrequestsemitted = user.FriendRequestsEmitted
		const friendrequestsreceived = friend.FriendRequestsReceived
		const newfriendrequestsreceived = []
		for (const i of friendrequestsreceived) {
			if (i != uid)
				newfriendrequestsreceived.push(i)
		}
		const newfriendrequestsemitted = []
		for (const j of friendrequestsemitted) {
			if (j != friend.id)
				newfriendrequestsemitted.push(j)
	}
	await this.prisma.user.update({
		where: {
			id: uid,
		},
		data: {
			FriendRequestsEmitted : newfriendrequestsemitted
		}
	})

	// await this.prisma.user.update({
	// 	where: {
	// 		login: login,
	// 	},
	// 	data: {
	// 		is_ingame : true
	// 	}
	// })
	await this.prisma.user.update({
		where: {
			login: name,
		},
		data: {
			FriendRequestsReceived : newfriendrequestsreceived
		}
	})
	await this.prisma.user.update({
		where: {
			 id: uid
		},
		  data: {
		cancelled_count	: {
				increment: 1
			}
		}
	})
	}
	
	async RefuseRequest(uid:number, id:number)
	{
		const friend = await this.prisma.user.findUnique({
			where: {
				id:	id,
			},
		})
		if (!friend)
		{
			throw new NotFoundException('User not found')
		}
		const user = await this.prisma.user.findUnique({
			where: {
				id: uid
            },
		})
		const friendemitted = friend.FriendRequestsEmitted
		const newfriendemitted = []
		for (const i of friendemitted) {
			if (i != uid)
				newfriendemitted.push(i)
		}
		await this.prisma.user.update({
			where: {
				id: id,
			},
			data: {
				FriendRequestsEmitted : newfriendemitted
			}
		})
		const userreceived = user.FriendRequestsReceived
		const newuserreceived = []
		for (const i of userreceived) {
			if (i != id)
				newuserreceived.push(i)
		}
		await this.prisma.user.update({
			where: {
				id: uid,
			},
			data: {
				FriendRequestsReceived : newuserreceived
			}
		})
		await this.prisma.user.update({
			where: {
				 id: uid
			},
			  data: {
			refused_count	: {
					increment: 1
				}
			}
		})

	}
	
	async AcceptRequest(uid:number, id:number)
	{
		const friend = await this.prisma.user.findUnique({
			where: {
				id:	id,
			},
		})
		if (!friend)
		{
			throw new NotFoundException('User not found')
		}
		const user = await this.prisma.user.findUnique({
			where: {
				id: uid
            },
		})
		await this.prisma.user.update({
			data: {
				friendList :{
					push: uid
						}	
					},
			where: {
				id: id,
			}
		})
		await this.prisma.user.update({
			data: {
				friendList :{
					push: id
						}	
					},
			where: {
				id: uid,
			}
		})
		const friendemitted = friend.FriendRequestsEmitted
		const newfriendemitted = []
		for (const i of friendemitted) {
			if (i != uid)
				newfriendemitted.push(i)
		}
		await this.prisma.user.update({
			where: {
				id: id,
			},
			data: {
				FriendRequestsEmitted : newfriendemitted
			}
		})
		const friendreceived = friend.FriendRequestsReceived
		const newfriendreceived = []
		for (const i of friendreceived) {
			if (i != uid)
				newfriendreceived.push(i)
		}
		await this.prisma.user.update({
			where: {
				id: id,
			},
			data: {
				FriendRequestsReceived : newfriendreceived
			}
		})
		const useremitted = user.FriendRequestsEmitted
		const newuseremitted = []
		for (const i of useremitted) {
			if (i != id)
				newuseremitted.push(i)
		}
		await this.prisma.user.update({
			where: {
				id: uid,
			},
			data: {
				FriendRequestsEmitted : newuseremitted
			}
		})
		const userreceived = user.FriendRequestsReceived
		const newuserreceived = []
		for (const i of userreceived) {
			if (i != id)
				newuserreceived.push(i)
		}
		await this.prisma.user.update({
			where: {
				id: uid,
			},
			data: {
				FriendRequestsReceived : newuserreceived
			}
		})

	}


	async AddFriend(uid:number, userName: string)
	{
		const friend = await this.prisma.user.findUnique({
			where: {
				login: userName
			},
		})
		if (!friend)
		{
			throw new NotFoundException('User not found')
		}
		const user = await this.prisma.user.findUnique({
			where: {
				id: uid
            },
		})
		if (!user)
		{
            throw new NotFoundException('User not found')
        }
		else if (user.login === friend.login)
		{
			throw new NotFoundException('You cannot add yourself to your friend list')
		}
		const friendlist = user.friendList
		for (const i of friendlist)
		{
			{
				if ( i == friend.id)
					throw new ConflictException(friend.login + " is already a friend")
			}
		}
		const friendrequests = user.FriendRequestsEmitted
		for (const i of friendrequests)
		{
			{
				if ( i == friend.id)
					throw new ConflictException(friend.login + " has already been added")
			}
		}
		await this.prisma.user.update({
			data: {
				FriendRequestsEmitted :{
					push: friend.id
						}	
					},
			where: {
				id: uid,
			}
		})
		await this.prisma.user.update({
			data: {
				FriendRequestsReceived :{
					push: user.id
						}	
					},
			where: {
				id: friend.id,
			}
		})
		await this.prisma.user.update({
			where: {
				 id: user.id
			},
      		data: {
			friends_added	: {
					increment: 1
				}
			}
		})
		

	}

	async RemoveFriend(uid:number, userId: number)
	{
		const newfriendlist = []
		const newfriendlist2 = []
		const friend = await this.prisma.user.findUnique({
			where: {
				id: userId
			},
		})
		if (!friend)
		{
			throw new NotFoundException('User not found')
		}
		const user = await this.prisma.user.findUnique({
			where: {
                id: uid
            },
		})
		if (!user)
		{
            throw new NotFoundException('User not found')
        }
		const friendlist = user.friendList
		for (const i of friendlist) {
			if (i != userId)
				newfriendlist.push(i)
		}
		const friendlist2 = friend.friendList
		for (const i of friendlist2) {
			if (i != uid)
				newfriendlist2.push(i)
		}
		await this.prisma.user.update({
			where: {
				id: uid,
			},
			data: {
				friendList : newfriendlist
			}
		})
		await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				friendList : newfriendlist2
			}
		})
		await this.prisma.user.update({
			where: {
				 id: user.id
			},
      		data: {
			friends_removed	: {
					increment: 1
				}
			}
		})
		

	}

	async uploadFile(uid:number, file: Express.Multer.File)
	{
		if (!file)
		{
			console.log("unrecognized file")
			return
		}
        const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
            throw new NotFoundException('User not found')
        }
		await this.prisma.user.update({
			where: {
				id: uid,
            },
			data: {
                avatar: file['filename']
            }
		});
		await this.prisma.user.update({
			where: {
				 id: user.id
			},
      		data: {
			picture_changed	: {
					increment: 1
				}
			}
		})
	}

	validate_extension(ext: string)
	{
		if (ext != '.png' && ext != '.jpeg' && ext != '.jpg' && ext != '.gif')
			return false
		return true
	}

	async	getelo(uid:number)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
            throw new NotFoundException('User not found')
        }
		return user.elo
	}

	async updateUserElo(uid:number, elo: number)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		await this.prisma.user.update({
			where: {
				id: uid,
            },
            data: {
				elo: elo
			}
		})
	}

	async getlogin(uid:number)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		return user.login
	}

	async	get2faenabled(uid:number)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		return user.is2faenabled
	}

	async	get2favalidated(uid:number)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		return user.is2favalidated
	}

	async validate2FA(uid:number)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		await this.prisma.user.update({
			where: {
				id: uid,
			},
			data: {
				is2favalidated: true
			}
		})
	}

	async switch2fa(uid, activate)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		await this.prisma.user.update({
			where: {
				id: uid,
            },
            data: {
				is2faenabled: activate['activated']
			}
		})
	}

	async verify2facode(uid, code)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		const CodeMatches = await argon.verify(user.twofacode, code);
        if (!CodeMatches)
            throw new ForbiddenException("Wrong code");
		await this.prisma.user.update({
			where: {
				id: uid,
            },
            data: {
				is2favalidated:true
			}
		})
		await this.prisma.user.update({
			where: {
				id: uid,
            },
            data: {
				twofa_used:1
			}
		})
		return true
		
	}

	async get2facode(uid)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		if (user.twofacode)
		{
			return user.twofacode
		}
	}

	generateRandom6digitCode()
    {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

	async logout(uid)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		if (user.is2faenabled)
		{
			await this.prisma.user.update({
				where: {
					id: uid,
				},
				data: {
					is2favalidated:false
				}
			})
		}
		await this.prisma.user.update({
			where: {
				 id: uid
			},
      		data: {
			quit_count	: {
					increment: 1
				}
			}
		})

	}

	async updateSearches(uid: number)
	{
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid            
			},
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		await this.prisma.user.update({
			where: {
				 id: uid
			},
      		data: {
			profiles_searched	: {
					increment: 1
				}
			}
		})
		console.log(user.profiles_searched	)

	}
	
	async achievements(uid:number)
	{
		const res = [];
		const user = await this.prisma.user.findUnique({
            where: {
                id: uid
            },
        })
		if (!user)
		{
			throw new NotFoundException('User not found')
		}
		const messages = await this.prisma.message.findMany({
			where: {
				userId: user.id,
			},
		});
		res.push(user.api_used);
		res.push(user.twofa_used);
		res.push(user.quit_count);
		res.push(messages.length);
		res.push(user.friends_added);
		res.push(user.friendList.length);
		res.push(user.friends_removed);
		res.push(user.name_changed);
		res.push(user.picture_changed);
		res.push(user.profiles_searched);
		res.push(user.gameHistory.length);
		res.push(user.gamesWon);
		res.push(user.gameHistory.length - user.gamesWon);
		res.push(user.cancelled_count);
		res.push(user.refused_count);

		let counter = 0;
		let master = [1,1,5,100,5,5,5,4,4,10,20,10,10,5,5];
		for (let i=0; i <= 14; i++)
		{
			if (res[i] >= master[i])
			{
				counter++;
			}
		}
		res.push(counter)
		return res
	}

	async findAllByLogin(login: string): Promise<UserI[]> {
		  const users = await this.prisma.user.findMany({
			where: {
			  login: {
				contains: login.toLowerCase()
			  },
			},
		  });
		  return users;
	  }

	async allUser(): Promise<UserI[]> {
		return await this.prisma.user.findMany();
	}
	
	getRandomFilename()
	{
		const filenames = ["Wtf.gif","awkward_2.gif", "homer_gif.gif", "minion.png", "snoop.gif", "awkward.gif", "homer.png", "mindblown.gif", "pikachu.png", "stitch.png"]
		let index = Math.round(Math.random() * 10);
		return filenames[index];
	}

}

