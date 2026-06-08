import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
    const verifyLink = `http://localhost:5173/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Email',
      html: `
        <h1>Verify your email</h1>
        <a href="${verifyLink}">
          Verify
        </a>
      `,
    });
  }
}
