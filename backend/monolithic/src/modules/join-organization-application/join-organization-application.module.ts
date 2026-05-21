import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinOrganizationApplication } from './entities/join-organization-application.entity';


@Module({
    imports: [TypeOrmModule.forFeature([JoinOrganizationApplication])]
})
export class JoinOrganizationApplicationModule {}
