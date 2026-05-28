import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesRepository } from './roles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesService, RolesRepository],
  controllers: [RolesController]
})
export class RolesModule { }

