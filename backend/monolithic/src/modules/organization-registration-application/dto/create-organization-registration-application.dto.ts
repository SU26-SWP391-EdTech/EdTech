import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateOrganizationRegistrationApplicationDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  orgName!: string;

  @IsEmail()
  orgEmail!: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsString()
  @IsNotEmpty()
  licenseDocumentUrl!: string;

  @IsString()
  @IsNotEmpty()
  taxCode!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;
}
