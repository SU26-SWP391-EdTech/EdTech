import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewJoinApplicationDto {
  @ApiProperty({ example: 'Application does not meet organization requirements' })
  @IsString()
  @IsNotEmpty()
  reviewReason!: string;
}
