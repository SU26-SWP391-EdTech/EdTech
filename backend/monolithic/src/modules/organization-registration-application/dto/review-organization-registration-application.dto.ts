import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrganizationRegistrationApplicationStatus } from 'src/common/enums/organization-registration-application.enum';

export class ReviewOrganizationRegistrationApplicationDto {
  @IsEnum(OrganizationRegistrationApplicationStatus)
  status!: OrganizationRegistrationApplicationStatus;

  @IsOptional()
  @IsString()
  reviewReason?: string;
}