import { Injectable } from '@nestjs/common';
import { PvpRepository } from '../repositories/pvp.repository';
@Injectable()
export class BattleService {
    constructor(private readonly pvpRepository: PvpRepository) {}
}
