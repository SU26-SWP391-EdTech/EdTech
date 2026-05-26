import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJoinOrganizationApplicationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  organizationId!: number;

  @ApiProperty({ example: 'I would like to join this organization' })
  @IsString()
  @IsOptional()
  message?: string;
}
