import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
import { HttpModule, HttpService } from "@nestjs/axios";
import { MailService } from "src/mail/mail.service";
import { MailModule } from "src/mail/mail.module";

@Module({
    imports: [PrismaModule, JwtModule, HttpModule, MailModule],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, MailService],
})
export class AuthModule {}
