import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LearnersService } from 'src/modules/learners/learners.service';
import { AssessmentService } from './assessment.service';
import { AssessmentSessionRepository } from '../repository/assessment-session.repository';
import { AssessmentSession } from '../entities/assessment-session.entity';

@Injectable()
export class AssessmentSessionService {
    constructor(
      private readonly learnersService: LearnersService,
      private readonly assessmentService: AssessmentService,
    
      private readonly assessmentSessionRepository: AssessmentSessionRepository
    ){}  

    public async createAssessmentSessionService(userId: number, assessmentId: number) {
      await this.learnersService.getLearnerProfileById(userId);
      await this.assessmentService.findOneService(assessmentId);
      
      return this.assessmentSessionRepository.createAssessmentSession({
        userId,
        assessmentId,
      })
    }

    public async startAssessmentSessionService(userId: number, assessmentId: number) {
      const assessmentSession = await this.assessmentSessionRepository.getAssessmentSessionByUserIdAndAssessmentId(userId, assessmentId);
      // check learner complete or not complete
      if(assessmentSession && !assessmentSession.completedAt) {
        let attemptNo = assessmentSession.attemptNo + 1;
        const newAssessmentSession = await this.assessmentSessionRepository.updateAssessmentSession(assessmentSession.sessionId, {
          attemptNo
        })
        return newAssessmentSession;
      }

      const startAssessSession = await this.createAssessmentSessionService(userId, assessmentId);
      return startAssessSession;
    }

    public async findAssessSessionByUserId(userId: number, assessmentId: number) {
      const assessmentSession = await this.assessmentSessionRepository.getAssessmentSessionByUserIdAndSessionId(userId, assessmentId);
      if(!assessmentSession) {
        throw new NotFoundException(`Can not file assessment lesson by ${userId} and ${assessmentId}`)
      }

      return assessmentSession;
    }

    public async findByCourseAndUser(
      courseId: number,
      userId: number,
    ): Promise<AssessmentSession[]> {
      return await this.assessmentSessionRepository.findByCourseAndUser(courseId, userId);
    }
}