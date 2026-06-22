import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';


@Entity('lesson_prerequisites')
export class LessonPrerequisite {

  @PrimaryColumn({
    name: 'prerequisite_lesson_id',
    type: 'int',
    nullable: false
  })
  prerequisiteLessonId!: number;

  // Lesson cần học trước 
  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.nextLessons,
    {
      onDelete: 'CASCADE',
      nullable: false
    },
  )
  @JoinColumn({
    name: 'prerequisite_lesson_id',
  })
  prerequisiteLesson!: Lesson;

  @PrimaryColumn({
    name: 'target_lesson_id',
    type: 'int',
    nullable: false
  })
  targetLessonId!: number;

  // Lesson bị khóa, cần prerequisite trước
  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.prerequisites,
    {
      onDelete: 'CASCADE',
      nullable: false
    },
  )
  @JoinColumn({
    name: 'target_lesson_id',
  })
  targetLesson!: Lesson;
}
