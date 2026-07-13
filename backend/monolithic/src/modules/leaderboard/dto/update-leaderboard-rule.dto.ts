import { PartialType } from '@nestjs/swagger';
import { CreateLeaderboardRuleDto } from './create-leaderboard-rule.dto';

export class UpdateLeaderboardRuleDto extends PartialType(
  CreateLeaderboardRuleDto,
) {}