import { Controller, Get, Req, Res, UseGuards, Request, Body, Post, Param, ParseIntPipe, NotFoundException, Patch, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { getMetadataStorage } from 'class-validator';
import { get } from 'http';
import { Express, Response } from 'express';
import { diskStorage } from 'multer'
import { userInfo } from 'os';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MailService } from 'src/mail/mail.service';
import { multerOptions } from './multer.config';
import { PrismaService } from 'src/prisma/prisma.service';

const fs = require("fs");
const path = require("path");

// @UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	constructor(private prisma: PrismaService, private userService: UserService) {}

		@Get(':login/id')
	getUserIdFromLogin(@Param('login') login)
	{
		return this.userService.getUserIdFromLogin(login)
	}

	@Get(':uid')
	getUserFromId(@Param('uid', ParseIntPipe) uid: number)
	{
		const user = this.userService.getUserFromId(uid)
		if (!user)
		{
            throw new NotFoundException('User not found');
        }
		return user;
	}


	//get user status with its ID
	@Get(':uid/getstatus')
    GetUserStatus(@Param('uid', ParseIntPipe) uid: number)
	{
		return this.userService.GetUserStatus(uid);
	}

	@Get(':uid/friendlist')
    GetUserFriendlist(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.GetUserFriendlist(uid);
	}

	@Get(':uid/friendrequestsreceived')
    GetUserFriendRequestsReceived(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.GetUserFriendRequestsReceived(uid);
	}

	@Get(':uid/friendrequestssent')
    GetUserFriendRequestsSent(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.GetUserFriendRequestsSent(uid);
	}

	@Get(":uid/login")
	getUserLogin(@Param('uid', ParseIntPipe) uid: number)
	{
		return this.userService.getlogin(uid) 
	}
	
	@Get(":uid/elo")
	getUserElo(@Param('uid', ParseIntPipe) uid: number)
	{
		return this.userService.getelo(uid) 
	}

	@Patch(':uid/editName')
	editName(@Param('uid', ParseIntPipe) uid: number, @Body() name)
	{
		return this.userService.ChangeNick(uid, name['userName']);
	}

	@Patch(':uid/elo')
	updateUserElo(@Param('uid', ParseIntPipe) uid: number, @Body() elo: number)
	{
		return this.userService.updateUserElo(uid, elo);
	
	}

	@Get(':uid/search')
	updateSearches(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.updateSearches(uid);
	}

	@Patch(':uid/AddFriend')
    AddFriend(@Param('uid', ParseIntPipe) uid:number, @Body() userName)
	{
		return this.userService.AddFriend(uid, userName['userName']);
	}

	@Patch(':uid/ChangeNick')
    ChangeNick(@Param('uid', ParseIntPipe) uid:number, @Body() userName)
	{
		return this.userService.ChangeNick(uid, userName['name']);
	}

	@Patch(':uid/CancelRequest')
    CancelRequest(@Param('uid', ParseIntPipe) uid:number, @Body() username)
	{
		return this.userService.CancelRequest(uid, username['username']);
	}

	@Patch(':uid/AcceptRequest')
    AcceptRequest(@Param('uid', ParseIntPipe) uid:number, @Body() id)
	{
		return this.userService.AcceptRequest(uid, id['id']);
	}

	@Patch(':uid/RefuseRequest')
    RefuseRequest(@Param('uid', ParseIntPipe) uid:number, @Body() id)
	{
		return this.userService.RefuseRequest(uid, id['id']);
	}

	@Patch(':uid/RemoveFriend')
    RemoveFriend(@Param('uid', ParseIntPipe) uid:number, @Body() userId)
	{
		return this.userService.RemoveFriend(uid, userId['userId']);
	}

	@Post(':uid/upload')
	@UseInterceptors(FileInterceptor('file', multerOptions))
	uploadFile(@Param('uid', ParseIntPipe) uid: number, @UploadedFile() file: Express.Multer.File)
	{
		return this.userService.uploadFile(uid, file);
	}

	@Get('/:uid/avatar')
	async getAvatar(@Param('uid', ParseIntPipe) uid: number, @Res() res: Response) {
		try {
			const user = await this.userService.getUserFromId(uid);
			if (user.avatar) {
				const fileName = user.avatar
				const result = res.sendFile(fileName, { root: "./assets" });
				return result
			} 
			let file = "";
			if (user.default_avatar === "")
			{
				file = this.userService.getRandomFilename()
				
				await this.prisma.user.update({
					data: {
						default_avatar: file ,
					},
					where: {
						id: uid,
					}
				})
				const result = res.sendFile(file, { root: "./public" });
				return result
			}
			const result = res.sendFile(user.default_avatar, { root: "./public" });
			return result
		} catch {
			throw new NotFoundException('Image not Found');
		}
	}

	@Post('/:uid/switch2fa')
	switch2fa(@Param('uid', ParseIntPipe) uid:number, @Body() activate)
	{
		return this.userService.switch2fa(uid, activate);
	}

	@Post('/:uid/verify2facode')
	verify2facode(@Param('uid', ParseIntPipe) uid:number, @Body() code)
	{
		return this.userService.verify2facode(uid, code['code']);
	}

	@Get('/:uid/2faenabled')
	get2faenabled(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.get2faenabled(uid)
	}

	@Get('/find-by-login/:login')
	async findAllByLogin(@Param('login') login: string) {
		return this.userService.findAllByLogin(login);
	}
	

	@Get('/all-users')
	async getAllUsers() {
		return this.userService.allUser();
	}
	@Get('/:uid/2facode')
	get2facode(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.get2facode(uid)
	}

	@Get('/:uid/getelo')
	getelo(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.getelo(uid)
	}

	@Get('/:uid/logout')
	logout(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.logout(uid)
	}

	@Get('/:uid/achievements')
	achievements(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.userService.achievements(uid)
	}


	
}