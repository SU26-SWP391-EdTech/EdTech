import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class BaseRegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  roleName!: string;

  @IsOptional()
  avatar_url?: string;


}
