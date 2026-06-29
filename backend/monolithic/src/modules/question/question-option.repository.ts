import { Injectable, NotFoundException } from '@nestjs/common';
import { Question } from './entities/question.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionOption } from './entities/question-option.entity';
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';

@Injectable()
export class QuestionOptionRepository {
  constructor(
    @InjectRepository(QuestionOption)
    private optionRepo: Repository<QuestionOption>,
  ) {}

  public async createQuestionOption(
    question: Question,
    data: CreateQuestionOptionDto,
  ): Promise<QuestionOption> {
    const count = await this.optionRepo.count({
      where: {
        question: {
          questionId: question.questionId,
        },
      },
    });
  
    const questionOption = this.optionRepo.create({
      ...data,
      position: count + 1,
      question,
    });
  
    return await this.optionRepo.save(questionOption);
  }

  public async findByQuestionId(questionId: number): Promise<QuestionOption[]> {
    return await this.optionRepo.find({
      where: {
        question: {
          questionId,
        },
      },
      order: {
        position: 'ASC',
      },
    });
  }

  public async reorder(
    optionIds: number[],
    manager?: EntityManager,
  ): Promise<void> {
  
    if (optionIds.length === 0) return;
  
    let sql = `
      UPDATE question_options
      SET position =
      CASE
    `;
  
    optionIds.forEach((id, index) => {
      sql += `
        WHEN option_id = ${id}
        THEN ${index + 1}
      `;
    });
  
    sql += `
      END
      WHERE option_id IN (${optionIds.join(',')})
    `;
  
    if (manager) {
      await manager.query(sql);
    } else {
      await this.optionRepo.query(sql);
    }
  }

  public async findById(
    optionId: number,
  ): Promise<QuestionOption | null> {
    return await this.optionRepo.findOne({
      where: {
        optionId,
      },
      relations: {
        question: {
          assessment: {
            lesson: {
              course: {
                user: {
                  role: true,
                },
              },
            },
          },
        },
      },
    });
  }

  public async updateQuestionOption(option: QuestionOption):Promise<QuestionOption>{
    return await this.optionRepo.save(option);
  }

  public async deleteQuestionOption(
    optionId: number,
  ): Promise<void> {
    await this.optionRepo.delete(optionId);
  }
}
