import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';


@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn({
    name: 'option_id',
  })
  optionId: number;


  @Column({
    name: 'question_id',
    type: 'int',
    nullable: false,
  })
  questionId: number;

  @Column({
    name: 'content',
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    name: 'is_correct',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isCorrect: boolean;

  @Column({
    name: 'position',
    type: 'int',
    nullable: false,
  })
  position: number;

  @ManyToOne(
    () => Question,
    (question) => question.options,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'question_id',
  })
  question!: Question;
}
