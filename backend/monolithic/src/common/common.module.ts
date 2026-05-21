// src/common/common.module.ts
import { Module, Global } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthModule } from '../modules/auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [JwtStrategy, LocalStrategy],
  exports: [JwtStrategy, LocalStrategy],
})
export class CommonModule {}