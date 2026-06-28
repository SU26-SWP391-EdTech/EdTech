import { ArrayMinSize, IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderQuestionOptionsDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsInt({ each: true })
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Ordered list of option IDs',
    type: [Number],
  })
  optionIds: number[];
}