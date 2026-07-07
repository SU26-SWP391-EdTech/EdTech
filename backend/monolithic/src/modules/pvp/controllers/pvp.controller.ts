import { Controller } from '@nestjs/common';
import { BattleService } from '../services/battle.service';

@Controller('pvp')
export class PvpController {
    constructor(private readonly battleService: BattleService,
    ) {}
}
