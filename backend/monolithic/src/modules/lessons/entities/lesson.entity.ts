import { Course } from 'src/modules/courses/entities/course.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { LessonPrerequisite } from './lesson-prerequisite.entity';
import { Assessment } from 'src/modules/assessment/entities/assessment.entity';
import { LearnerLessonProgress } from 'src/modules/progress/entities/learner-lesson-progress.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn({ name: 'lesson_id' })
  lessonId!: number;

  // course 1-n lesson
  @ManyToOne(() => Course, (course) => course.lessons, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ name: 'title', nullable: false })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl!: string;

  @Column({ name: 'video_duration', nullable: true })
  videoDuration!: number;

  @Column({ name: 'content', type: 'text', nullable: true })
  content!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date;

  @Column({ name: 'position', nullable: false })
  position!: number;

  @OneToMany(
    () => LessonPrerequisite,
    (item) => item.prerequisiteLesson,
    { nullable: false }
  )
  nextLessons!: LessonPrerequisite[];

  @OneToMany(
    () => LessonPrerequisite,
    (item) => item.targetLesson,
    { nullable: false }
  )
  prerequisites!: LessonPrerequisite[];

  @OneToMany(
    () => Assessment,
    (assessment) => assessment.lesson,
  )
  assessments!: Assessment[];

  @OneToMany(
    () => LearnerLessonProgress,
    (progress) => progress.lesson,
  )
  learnerLessonProgresses!: LearnerLessonProgress[];
}
