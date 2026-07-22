import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { PvpMatch } from '../entities/pvp-match.entity';
import { Assessment } from 'src/modules/assessment/entities/assessment.entity';
import { Question } from 'src/modules/question/entities/question.entity';
import { QuestionOption } from 'src/modules/question/entities/question-option.entity';
import { PvpMatchStatus } from 'src/common/enums/pvp-match-status.enum';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { QuestionType } from 'src/common/enums/question-type.enum';

@Injectable()
export class MatchRepository {
  private readonly matchRepo: Repository<PvpMatch>;
  private readonly assessmentRepo: Repository<Assessment>;
  private readonly questionRepo: Repository<Question>;
  private readonly optionRepo: Repository<QuestionOption>;

  constructor(private readonly dataSource: DataSource) {
    this.matchRepo = this.dataSource.getRepository(PvpMatch);
    this.assessmentRepo = this.dataSource.getRepository(Assessment);
    this.questionRepo = this.dataSource.getRepository(Question);
    this.optionRepo = this.dataSource.getRepository(QuestionOption);
  }

  async createMatch(data: Partial<PvpMatch>): Promise<PvpMatch> {
    const match = this.matchRepo.create(data);
    return await this.matchRepo.save(match);
  }

  async findById(matchId: number): Promise<PvpMatch | null> {
    return await this.matchRepo.findOne({
      where: {
        matchId,
      },
      relations: {
        assessment: true,
        player1: true,
        player2: true,
        winner: true,
      },
    });
  }

  async findAssessmentQuestions(assessmentId: number): Promise<Question[]> {
    return await this.questionRepo.find({
      where: {
        assessmentId,
      },
      relations: {
        options: true,
      },
      order: {
        position: 'ASC',
        options: {
          position: 'ASC',
        },
      },
    });
  }

  async findQuestionsByCourseId(courseId: number): Promise<Question[]> {
    const assessments = await this.assessmentRepo.find({
      where: {
        courseId,
        type: In([AssessmentType.LESSON_QUIZ, AssessmentType.PRACTICE, AssessmentType.PVP]),
      },
      select: ['assessmentId'],
    });

    if (assessments.length === 0) {
      return [];
    }

    return await this.questionRepo.find({
      where: {
        assessmentId: In(assessments.map((assessment) => assessment.assessmentId)),
        type: In([QuestionType.MULTIPLE_CHOICE_SINGLE, QuestionType.TRUE_FALSE]),
      },
      relations: {
        options: true,
      },
      order: {
        position: 'ASC',
        options: {
          position: 'ASC',
        },
      },
    });
  }

  async findAssessmentById(assessmentId: number): Promise<Assessment | null> {
    return await this.assessmentRepo.findOne({
      where: {
        assessmentId,
      },
    });
  }

  async findOptionById(optionId: number): Promise<QuestionOption | null> {
    return await this.optionRepo.findOne({
      where: {
        optionId,
      },
      relations: {
        question: true,
      },
    });
  }

  async updateScores(
    matchId: number,
    player1Score: number,
    player2Score: number,
  ): Promise<void> {
    await this.matchRepo.update(
      matchId,
      {
        player1Score,
        player2Score,
      },
    );
  }

  async updateStatus(
    matchId: number,
    status: PvpMatchStatus,
  ): Promise<void> {
    await this.matchRepo.update(
      matchId,
      {
        status,
      },
    );
  }

  async completeMatch(
    matchId: number,
    player1Score: number,
    player2Score: number,
    winnerId: number | null,
  ): Promise<void> {
    const updatePayload: Partial<PvpMatch> = {
      player1Score,
      player2Score,
      status: PvpMatchStatus.COMPLETED,
    };

    if (winnerId !== null) {
      updatePayload.winnerId = winnerId;
    }

    await this.matchRepo.update(
      matchId,
      updatePayload,
    );
  }
}