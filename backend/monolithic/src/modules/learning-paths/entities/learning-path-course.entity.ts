import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { LearningPath } from './learning-path.entity';
import { Course } from 'src/modules/courses/entities/course.entity';

@Entity('learning_path_courses')
export class LearningPathCourse {
  @PrimaryColumn({ name: 'learning_path_id' })
  learningPathId!: number;

  @PrimaryColumn({ name: 'course_id' })
  courseId!: number;

  @ManyToOne(
    () => LearningPath,
    (learningPath) => learningPath.learningPathCourses,
    {nullable: false}
  )
  @JoinColumn({ name: 'learning_path_id' })
  learningPath!: LearningPath;

  @ManyToOne(() => Course, (course) => course.learningPathCourses, {nullable: false})
  @JoinColumn({ name: 'course_id' })
  course!: Course;
}
