import { Module } from '@nestjs/common';
import { OrganizationRegistrationApplication } from './entities/organization-registration-application.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([OrganizationRegistrationApplication])]
})
export class OrganizationRegistrationApplicationModule {}
