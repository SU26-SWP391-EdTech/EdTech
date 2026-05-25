import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendVerificationEmail(email:String, token: String ){
    
  }
}
