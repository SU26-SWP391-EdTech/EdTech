import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOrganizationRegistrationApplicationDto {
  @IsString()
  @IsNotEmpty()
  reviewReason!: string;
}