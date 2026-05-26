// auth/auth.controller.ts
import { Controller, Get, Post, Body, Res, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
import { BaseRegisterDto } from './dto/base-register.dto';
import { VerifyEmailDto } from '../mail/dto/verifyEmail.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
  ) { }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() baseDto: BaseRegisterDto, @Res() res: Response) {
    const result = await this.authService.register(baseDto, res);
    return res.json(result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto, res);
    return res.json(result);
  }


  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res: Response) {
    const result = await this.authService.logout(res);
    return res.json(result);
  }

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayloadUser) {
    return this.authService.getMe(user.userId);
  }

  @Post('verify-mail')
  async verifyEmail(@Body() verifyEmailDto:VerifyEmailDto, @Res() res: Response){
    const result = await this.authService.verifyEmail(verifyEmailDto);
    return res.json(result);
  }
}