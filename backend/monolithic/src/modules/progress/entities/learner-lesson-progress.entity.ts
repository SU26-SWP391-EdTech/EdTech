import { LessonProgressStatus } from 'src/common/enums/lesson-progress-status.enum';
import { Lesson } from 'src/modules/lessons/entities/lesson.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('learner_lesson_progress')
export class LearnerLessonProgress {
  @PrimaryColumn({
    name: 'user_id',
    type: 'int',
    nullable: false
  })
  userId: number;

  @PrimaryColumn({
    name: 'lesson_id',
    type: 'int',
    nullable: false
  })
  lessonId: number;


  @Column({
    name: 'status',
    type: 'enum',
    enum: LessonProgressStatus,
    default: LessonProgressStatus.ACTIVE,
    nullable: false
  })
  status: LessonProgressStatus;

  @Column({
    name: 'completed_at',
    type: 'timestamp',
    nullable: true,
  })
  completedAt?: Date;


  @ManyToOne(
    () => User,
    (user) => user.lessonProgresses,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;


  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.learnerLessonProgresses,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'lesson_id',
  })
  lesson!: Lesson;
}
