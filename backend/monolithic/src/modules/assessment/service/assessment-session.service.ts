import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LearnersService } from 'src/modules/learners/services/learners.service';
import { AssessmentService } from './assessment.service';
import { AssessmentSessionRepository } from '../repository/assessment-session.repository';
import { AssessmentSession } from '../entities/assessment-session.entity';
import { ProgressService } from 'src/modules/progress/progress.service';
import { SubmitAssessmentDto } from '../dto/submit-answer.dto';
import { QuestionType } from 'src/common/enums/question-type.enum';
import { LearnerStreakService } from 'src/modules/learners/services/learner-streak.service';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';

const STREAK_ELIGIBLE_TYPES: AssessmentType[] = [
  AssessmentType.PRACTICE,
  AssessmentType.LESSON_QUIZ,
];

@Injectable()
export class AssessmentSessionService {
  constructor(
    private readonly learnersService: LearnersService,
    private readonly assessmentService: AssessmentService,
    private readonly assessmentSessionRepository: AssessmentSessionRepository,
    private readonly progressService: ProgressService,
    private readonly learnerStreakService: LearnerStreakService,
  ) { }


  public async createAssessmentSessionService(userId: number, assessmentId: number) {
    await this.learnersService.getLearnerProfileById(userId);
    await this.assessmentService.findOneService(assessmentId);
    const timeStart = new Date();
    return this.assessmentSessionRepository.createAssessmentSession({
      userId,
      assessmentId,
    }, timeStart)
  }

  public async startAssessmentSessionService(userId: number, assessmentId: number) {
    const assessmentSession = await this.assessmentSessionRepository.getAssessmentSessionByUserIdAndAssessmentId(userId, assessmentId);
    // check learner complete or not complete
    if (assessmentSession && !assessmentSession.completedAt) {
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
    if (!assessmentSession) {
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

  // chua dung de
  public async updateAssessmentSessionTimeService(assessmentId: number, userId: number) {
    const assessmentSession = await this.assessmentSessionRepository.getAssessmentSessionByUserIdAndSessionId(userId, assessmentId);
    if (!assessmentSession) {
      throw new NotFoundException(`Can not file assessment lesson by ${userId} and ${assessmentId}`)
    }

    return this.assessmentSessionRepository.updateAssessmentSession(assessmentSession.sessionId, {
      completedAt: new Date(),
    })
  }

  public async submitAssessmentSessionService(
    userId: number,
    assessmentId: number,
    submitAnswerDto: SubmitAssessmentDto,
  ) {
    // 2. Find AssessmentSession
    const session = await this.assessmentSessionRepository.getAssessmentSessionByUserIdAndAssessmentId(userId, assessmentId);
    if (!session) {
      throw new NotFoundException(`Assessment session not found for user ${userId} and assessment ${assessmentId}`);
    }
    if (session.completedAt) {
      throw new BadRequestException('Assessment session has already been completed');
    }

    // 3. Find Assessment with Questions and Options
    const assessment = await this.assessmentService.findOneService(assessmentId);
    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${assessmentId} not found`);
    }

    // Map user answers for fast lookup
    const answerMap = new Map<number, number[]>();
    if (submitAnswerDto.answers) {
      for (const answer of submitAnswerDto.answers) {
        answerMap.set(answer.questionId, answer.selectedOptionIds);
      }
    }

    let earnedPoints = 0;
    let totalPoints = 0;
    let correctQuestionsCount = 0;
    const questionsResponse: any[] = [];

    // 4. Grade each question
    for (const question of assessment.questions) {
      const qPoints = Number(question.points) || 0;
      totalPoints += qPoints;

      const selectedOptionIds = answerMap.get(question.questionId) || [];
      const correctOptionIds = (question.options || [])
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.optionId);

      let isCorrect = false;

      if (question.type === QuestionType.MULTIPLE_CHOICE_SINGLE || question.type === QuestionType.TRUE_FALSE) {
        // Correct if learner selected exactly one option and that option is correct
        if (selectedOptionIds.length === 1 && correctOptionIds.includes(selectedOptionIds[0])) {
          isCorrect = true;
        }
      } else if (question.type === QuestionType.MULTIPLE_CHOICE_MULTI) {
        // Correct if learner selected all correct options and no incorrect options
        const isAllCorrectSelected = correctOptionIds.every((id) => selectedOptionIds.includes(id));
        const isNoIncorrectSelected = selectedOptionIds.every((id) => correctOptionIds.includes(id));
        if (selectedOptionIds.length > 0 && isAllCorrectSelected && isNoIncorrectSelected && selectedOptionIds.length === correctOptionIds.length) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        earnedPoints += qPoints;
        correctQuestionsCount++;
      }

      questionsResponse.push({
        questionId: question.questionId,
        isCorrect,
        selectedOptionIds,
        correctOptionIds,
      });
    }

    // Calculate score
    const score =
      totalPoints > 0
        ? Number(((earnedPoints / totalPoints) * 100).toFixed(2))
        : 0;

    // 5. Update AssessmentSession
    await this.assessmentSessionRepository.updateAssessmentSession(session.sessionId, {
      score,
      completedAt: new Date(),
      earnedPoints,
    });

    // 6. Update Progress: call ProgressModule to complete the lesson if assessment.lessonId is present
    if (assessment.lessonId) {
      try {
        const isCompleted = await this.progressService.isLessonCompleted(userId, assessment.lessonId);
        if (!isCompleted) {
          let progressExisted = true;
          try {
            await this.progressService.findByUserAndLessonService(userId, assessment.lessonId);
          } catch {
            progressExisted = false;
          }
          if (!progressExisted) {
            await this.progressService.startLessonService(userId, assessment.lessonId);
          }
          await this.progressService.completeLessonService(userId, assessment.lessonId);
        }
      } catch (error) {
        // Handle any errors gracefully so we don't block the grading response
      }
    }

    // 7. Update Streak: update learner streak for eligible assessment types
    if (STREAK_ELIGIBLE_TYPES.includes(assessment.type)) {
      try {
        if(!session.completedAt){
          throw new NotFoundException("Leaner hasn't complete this assessment")
        }
        await this.learnerStreakService.updateStreak(userId, session?.completedAt, session.sessionId);
      } catch (error) {
        // Handle any errors gracefully so we don't block the grading response
      }
    }

    // 8. Response
    return {
      score,
      earnedPoints,
      totalPoints,
      correctQuestions: correctQuestionsCount,
      totalQuestions: assessment.questions.length,
      questions: questionsResponse,
    };
  }

  public async getAssessmentResultByLessonService(userId: number, lessonId: number) {
    const assessments = await this.assessmentService.findAssessmentsByLessonId(lessonId);
    if (!assessments || assessments.length === 0) {
      throw new NotFoundException(`No assessments found for lesson ID ${lessonId}`);
    }

    const assessment = assessments[0];

    const session = await this.assessmentSessionRepository.getAssessmentSessionByUserIdAndAssessmentId(userId, assessment.assessmentId);
    if (!session) {
      throw new NotFoundException(`No session found for user ${userId} and assessment ${assessment.assessmentId}`);
    }

    const fullAssessment = await this.assessmentService.findOneService(assessment.assessmentId);

    const totalQuestions = fullAssessment.questions?.length || 0;
    const earnedPoints = Number(session.earnedPoints) || 0;
    const score = Number(session.score) || 0;

    const correctQuestions = Math.round((score / 100) * totalQuestions);

    return {
      summary: {
        score,
        totalQuestions,
        correctCount: correctQuestions,
        incorrectCount: totalQuestions - correctQuestions,
        duration: '0 phút',
        assessment: fullAssessment.title || 'Bài kiểm tra',
        submittedAt: session.completedAt ? session.completedAt.toLocaleString('vi-VN') : '',
        pointsEarned: earnedPoints,
      },
      reviews: [],
    };
  }

}