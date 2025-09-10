import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { ConnectedUserService } from 'src/chat/service/connectedUser.service';
import { ChatGateway } from 'src/chat/gateway/chat.gateway';
import { AuthService } from 'src/auth/auth.service';
import { RoomService } from 'src/chat/service/room.service';
import { JoinedRoomService } from 'src/chat/service/joined-room.service';
import { MessageService } from 'src/chat/service/message.service';
import { JwtService } from '@nestjs/jwt';
import { HttpModule, HttpService } from '@nestjs/axios';
import { GameGateway } from 'src/game/game.gateway';
import { GameService } from 'src/game/game.service';

@Module({
  imports: [MailModule, HttpModule],
  controllers: [UserController],
  providers: [UserService, MailService, ConnectedUserService, AuthService, RoomService, JoinedRoomService, MessageService, JwtService]
})
export class UserModule {
	
}
