import { ForbiddenException, Injectable, NotFoundException, Req, Res } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { signinDto, signupDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { Response, Request } from "express";
import { MailService } from "src/mail/mail.service";
import { stringify } from "querystring";


@Injectable()
export class AuthService
{
    constructor(private prisma: PrismaService, private jwt:JwtService, private config: ConfigService, private readonly httpService: HttpService, private mailService: MailService)
    {}
    async signin(dto: signinDto)
    {
        const user = await this.prisma.user.findUnique({
            where: {
                login : dto.login,
            },
        });
        if (!user)
            throw new ForbiddenException("credentials incorrect");
        
        const pwMatches = await argon.verify(user.hash, dto.password);
        if (!pwMatches)
            throw new ForbiddenException("credentials incorrect");
        return this.signToken(user.id, user.login);

    }

    async signup(dto: signupDto)
    {
        const hash = await argon.hash(dto.password);
        try
        {
            const user = await this.prisma.user.create({
                data: {
					email: dto.email,
                    login: this.generateRandomLogin(),
					login42: this.generateRandomLogin(),
                    hash,
                },
                select: {
                    id: true,
                    login: true,
                }
            })
            return this.signToken(user.id, user.login);
        }
        catch(error)
        {
            if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                if (error.code === "P2002")
                	throw new ForbiddenException("Credentials taken")
            }
            throw error 
          }	
    }
    async signToken(userId: number, login: string): Promise<{access_token: string, id: number}>
    {
        const payload = {
            sub: userId,
            login,
        };
        const secret = this.config.get("JWT_SECRET");
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '7d',
            secret: secret
        },);
		const hashed_token  = await argon.hash(token);
		await this.prisma.user.update({
			data: {
				access_token: hashed_token
			},
			where: {
				id: userId,
			}
		})

        return { access_token: token, id: userId };
    }

    async create42user(login: string, email: string) {
    try {
        const pass = this.generateRandomPassword()
        const hash = await argon.hash(pass);
        const alreadyregistered = await this.prisma.user.findUnique({
            where: {
                login42 : login,
            },
        });
        if (alreadyregistered)
            return {token: await this.signToken(alreadyregistered.id, alreadyregistered.login), isalreadyregistered: true}
        const user = await this.prisma.user.create({
            data: {
                email: email,
                login: this.generateRandomLogin(),
				login42: login,
                avatar: "",
                hash,
            },
            select: {
                id: true,
                login: true,
            }
        })
		await this.prisma.user.update({
			where: {
				id: user.id,
            },
            data: {
				api_used: 1
			}
		})
        return {token: await this.signToken(user.id, user.login), isalreadyregistered: false};
    }
    catch(error)
    {
        if (error instanceof Prisma.PrismaClientKnownRequestError)
        {
            if (error.code === "P2002")
                throw new ForbiddenException("Credentials taken")
        }
        throw error 
      }	
    }

	generateRandomPassword ()
	{
		const password = Math.random().toString(36);
		return password;
	}

	generateRandomLogin ()
	{
		const login = Math.random().toString(36);
		return login;
	}

	async check_token(token, id: number): Promise<boolean> {
		if (!token || !id )
			return false;
		const user = await this.prisma.user.findUnique({
			where: {
				id: id
			},
		})
		if (!user)
			return false
		const tokenmatch = await argon.verify(user.access_token, token);
		if (!tokenmatch)
			return false
		try {
		  const payload = this.jwt.verify(token, {secret: process.env.JWT_SECRET});
		  if (!payload)
		  	return false;
		} catch (e) {
			console.log(e)
			return false
		}
		return true;
	  }

	verifyJwt(jwt: string): Promise<any> {
		return this.jwt.verifyAsync(jwt, {secret: process.env.JWT_SECRET});
	}

	
      async SendMail(uid:number)
      {
        const twofacode = this.generateRandom6digitCode()
        const hash = await argon.hash(twofacode);
        const user = await this.prisma.user.findUnique({
			where: {
				id: uid
            },
		})
		if (!user)
		{
            throw new NotFoundException('User not found')
        }
        await this.mailService.sendEmail(
			user.email,
			'transcendance 2FA code',
			twofacode,
		  );
          await this.prisma.user.update({
			where: {
				id: uid,
            },
            data: {
				twofacode: hash
			}
		})
      }

      async check2fa(uid: number)
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
        if (user.is2faenabled && !user.is2favalidated)
            return false
        return true 
      }

    generateRandom6digitCode()
    {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

	geturl()
	{
		return {url: process.env.REDIRECT_URL}
	}
}