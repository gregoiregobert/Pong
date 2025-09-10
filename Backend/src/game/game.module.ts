import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HttpModule, HttpService } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { ConnectedUserService } from 'src/chat/service/connectedUser.service';

@Module({
  controllers: [GameController],
  providers: [GameService, GameGateway, PrismaService, AuthService, MailService, UserService, ConnectedUserService],
  imports: [JwtModule, HttpModule, UserModule, AuthModule]
})
export class GameModule {}

