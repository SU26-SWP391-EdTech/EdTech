import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationsRepository } from './organizations.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization])
  ],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService, 

    OrganizationsRepository,
  ],
  exports: [
    OrganizationsService
  ],
})
export class OrganizationsModule {}
