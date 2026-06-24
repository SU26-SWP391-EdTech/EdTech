import { QuestionType } from 'src/common/enums/question-type.enum';
import { Assessment } from 'src/modules/assessment/entities/assessment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { QuestionOption } from './question-option.entity';


@Entity('questions')

export class Question {
  @PrimaryGeneratedColumn({
    name: 'question_id',
  })
  questionId: number;

  @Column({
    name: 'assessment_id',
    type: 'int',
    nullable: false,
  })
  assessmentId: number;

  @Column({
    name: 'content',
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: QuestionType,
    nullable: false,
  })
  type: QuestionType;

  @Column({
    name: 'points',
    type: 'decimal',
    nullable: false,
    default: 0,
  })
  points: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;

  @Column({
    name: 'position',
    type: 'int',
    nullable: false,
  })
  position: number;

  @ManyToOne(
    () => Assessment,
    (assessment) => assessment.questions,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'assessment_id',
  })
  assessment!: Assessment;

  @OneToMany(
    () => QuestionOption,
    (option) => option.question,
    {
      cascade: true,
    }
  )
  options!: QuestionOption[];
}
