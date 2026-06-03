import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
    //Hien tai chua co frontend nen test vao api cua backend luon sau nay da co frontend roi thi moi doi lai url
    const verifyLink = `http://localhost:${process.env.PORT}/verify-email?token=${token}`; 

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
