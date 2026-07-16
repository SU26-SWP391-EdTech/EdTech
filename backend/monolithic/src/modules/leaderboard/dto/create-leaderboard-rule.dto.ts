import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class CreateLeaderboardRuleDto{
    @ApiProperty({
        example: 50,
        default: 0,
      })
      @IsNumber()
      @Min(0)
      scoreWeight: number;
    
      @ApiProperty({
        example: 30,
        default: 0,
      })
      @IsNumber()
      @Min(0)
      timeWeight: number;
    
      @ApiProperty({
        example: 20,
        default: 0,
      })
      @IsNumber()
      @Min(0)
      attemptWeight: number;
}
