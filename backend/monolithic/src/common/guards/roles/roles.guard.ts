import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      'roles',
      [
        context.getHandler(),
        context.getClass(),
      ],
    );


    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user: JwtPayloadUser = request.user;
    
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const hasRole = requiredRoles.includes(
      user.roleName,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have access',
      );
    }
    return true;
  }
}