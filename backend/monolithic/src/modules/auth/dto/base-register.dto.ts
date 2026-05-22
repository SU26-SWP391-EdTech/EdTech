import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}
