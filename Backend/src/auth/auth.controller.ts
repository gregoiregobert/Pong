import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Options, Param, ParseIntPipe, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { signinDto, signupDto } from "./dto";
import { HttpService } from "@nestjs/axios";
import { map } from "rxjs";
import { Response } from "express";

import { MailService } from "src/mail/mail.service";
import fetch from "node-fetch";
import { PrismaService } from '../prisma/prisma.service'; 

var crypto = require("crypto");
import FormData = require('form-data');

@Controller('auth')
export class AuthController
{
    constructor(private authService: AuthService, private http: HttpService, private prismaService: PrismaService, private mailService: MailService) {}

	token: string
    @Post('signup')
    signup(@Body() dto: signupDto) {
        return this.authService.signup(dto);
    }

	@HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: signinDto)
    {
        return this.authService.signin(dto) ;
    }

	@Post('check')
	check_token(@Body() body)
	{
		return this.authService.check_token(body['token'], body['id'])
	}

	@Post('42redirect')
	async get42redirect(@Req() request, @Res() res)  {

		const formData = new FormData();
		formData.append('grant_type', 'authorization_code');
		formData.append('client_id', process.env.FOURTYTWO_CLIENT_ID);
		formData.append('client_secret', process.env.FOURTYTWO_CLIENT_SECRET);
		formData.append('redirect_uri', process.env.FOURTYTWO_CALLBACK_URL);
		formData.append('code', request.body.code );
		const response = await fetch('https://api.intra.42.fr/oauth/token', {
			method: 'POST',
			body: formData
		})

		const tokens = await response.json();
		const headers = {Authorization: 'Bearer ' + tokens['access_token']}

		const resp2 = await fetch('https://api.intra.42.fr/v2/me', {headers})
		if (!resp2.ok)
			throw new Error('user not found')
		const data = await resp2.json();
		const token = this.authService.create42user(data['login'], data['email'])
		res.status(HttpStatus.OK).send((await token))
		return 	
	}

	@Get(':uid/SendMail')
    SendMail(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.authService.SendMail(uid);
	}

	@Get(':uid/check2fa')
    check2fa(@Param('uid', ParseIntPipe) uid:number)
	{
		return this.authService.check2fa(uid);
	}

	@Get('/geturl')
	geturl()
	{
		return this.authService.geturl()
	}

	//--------------------// 
	//  DataBase VIEWER   //
	//--------------------// 

	@Get('rooms')
	async getRooms() {
  		return await this.prismaService.room.findMany({
   			include: {
				BanUsers: true,
   			},
  		});
	}

	@Get('users')
	async getUsers() {
		return await this.prismaService.user.findMany({
			include: {blockedUsers: true}
		});
	}

	@Get('coUsers')
	async getConnectedUsers() {
		return await this.prismaService.connectedUser.findMany({
			// include: {user: true}
		});
	}

	@Get('joinedRoom')
	async getJoinedRoom() {
		return await this.prismaService.joinedRoom.findMany();
	}
}