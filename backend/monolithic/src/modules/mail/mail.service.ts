import { Body, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
 
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private jwtService:JwtService,
    
  ) {}

  async sendVerificationEmail(email: string, token: string ){
    const verifyLink = `http://localhost:5173/verify-mail?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Email',
      html: `
        <h1>Verify your email</h1>
        <a href="${verifyLink}">
          Verify
        </a>
      `,
    })
  }

}
