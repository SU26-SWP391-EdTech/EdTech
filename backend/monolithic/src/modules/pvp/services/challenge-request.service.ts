import { Injectable } from '@nestjs/common';
import { ChallengeRequestRepository } from '../repositories/challenge-request.repository';
@Injectable()
export class ChallengeRequestService {
    constructor(private readonly challengeReqRepo: ChallengeRequestRepository) {}
}
