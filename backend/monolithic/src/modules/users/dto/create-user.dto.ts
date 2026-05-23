import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsOptional()
    avatar_url?: string;

    @IsString()
    @IsNotEmpty()
    roleName!: string;

}