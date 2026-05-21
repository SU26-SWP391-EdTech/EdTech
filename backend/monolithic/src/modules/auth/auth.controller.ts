// auth/auth.controller.ts
import { Controller, Get, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LearnerRegisterDto } from './dto/learner-register.dto';
import { CourseProviderRegisterDto } from './dto/course-provider-register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayloadUser) {
    return this.authService.getMe(user.userId);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto, res);
    return res.json(result);
  }

  @Public()
  @Post('register/learner')
  @HttpCode(HttpStatus.CREATED)
  async registerLearner(@Body() learnerDto: LearnerRegisterDto, @Res() res: Response) {
    const result = await this.authService.registerLearner(learnerDto, res);
    return res.json(result);
  }

  @Public()
  @Post('register/course-provider')
  @HttpCode(HttpStatus.CREATED)
  async registerProvider(@Body() providerDto: CourseProviderRegisterDto, @Res() res: Response) {
    const result = await this.authService.registerCourseProvider(providerDto, res);
    return res.json(result);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res: Response) {
    const result = await this.authService.logout(res);
    return res.json(result);
  }
}