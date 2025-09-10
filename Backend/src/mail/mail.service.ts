import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor(configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
        host: 'mail.mailo.com',
    port: 465,
    auth: {
        user: process.env.MAIL_ACCOUNT,
        pass: process.env.MAIL_PASSWORD
    }
    });
  }

  async sendEmail(
    destination: string,
    subject: string,
    text: string,
  ): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.MAIL_ACCOUNT,
      to: destination,
      subject: subject,
      text: text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Mail envoyé a ' + destination);
      return;
    } catch (error) {
      console.error("Erreur de l'envoi :", error);
    }
  }
}