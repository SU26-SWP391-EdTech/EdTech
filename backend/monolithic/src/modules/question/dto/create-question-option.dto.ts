import { IsString, IsBoolean, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Paris', description: 'Option content', maxLength: 2000 })
  content: string;

  @IsBoolean()
  @ApiProperty({ example: false, description: 'Whether this option is correct' })
  isCorrect: boolean;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1, description: 'Option position/order', minimum: 1 })
  position: number;
}