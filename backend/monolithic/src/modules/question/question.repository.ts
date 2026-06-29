import { Injectable, NotFoundException } from '@nestjs/common';
import { Question } from './entities/question.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionOption } from './entities/question-option.entity';

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectRepository(Question)
    private readonly repo: Repository<Question>,
  ) {}

  public async createQuestion(data: Partial<Question>): Promise<Question> {
    const question = this.repo.create(data);
    return await this.repo.save(question);
  }

  public async findQuestion(
    questionId: number,
    assessmentId: number,
  ): Promise<Question> {
    const question = await this.repo.findOne({
      where: {
        questionId,
        assessment: {
          assessmentId,
        },
      },
    });

    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }

    return question;
  }

  public async updateQuestion(
    question: Question,
    data: Partial<Question>,
  ): Promise<Question> {
    Object.assign(question, data);

    return await this.repo.save(question);
  }

  async deleteQuestion(
    questionId: number,
  ): Promise<void> {
  
    const result = await this.repo.delete({
      questionId,
    });
  
    if (result.affected === 0) {
      throw new NotFoundException(
        `Question ${questionId} not found`,
      );
    }
  }

  public async findById(questionId: number): Promise<Question | null> {
    return await this.repo.findOne({
      where: {
        questionId,
      },
      relations: {
        assessment: {
            lesson: {
                course: {
                    user: {
                        role: true,
                    }
                }
            }
        }
      },
    });
  }

  public async findAllByLessonId(
    lessonId: number,
  ): Promise<Question[]> {
  
    return await this.repo.find({
      where: {
        assessment: {
          lesson: {
            lessonId,
          },
        },
      },
      relations: {
        assessment: true,
      },
      order: {
        position: 'ASC',
      },
    });
  }
}
