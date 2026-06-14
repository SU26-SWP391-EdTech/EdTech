import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { LearningPath } from './learning-path.entity';
import { Course } from 'src/modules/courses/entities/course.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('learning_path_courses')
@Unique(['learningPathId', 'position'])
@Unique(['learningPathId', 'courseId'])
export class LearningPathCourse {
  @PrimaryColumn({ name: 'learning_path_id' })
  learningPathId!: number;

  @ManyToOne(
    () => LearningPath,
    (learningPath) => learningPath.learningPathCourses,
    { nullable: false },
  )
  @JoinColumn({ name: 'learning_path_id' })
  learningPath!: LearningPath;

  @PrimaryColumn({ name: 'course_id' })
  courseId!: number;

  @ManyToOne(() => Course, (course) => course.learningPathCourses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ name: 'position', nullable: false })
  position!: number;

  @ManyToOne(() => User, (user) => user.learningPathCourses, {
    nullable: false,
  })
  @JoinColumn({ name: 'editted_by' })
  edittedBy!: User;
}
