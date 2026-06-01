import { IsString, IsOptional } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    avatar_url?: string;
}