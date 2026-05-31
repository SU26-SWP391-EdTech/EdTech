import { CourseStatus } from 'src/common/enums/course.enum';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { LearningPathCourse } from 'src/modules/learning-paths/entities/learning-path-course.entity';
import { Lesson } from 'src/modules/lessons/entities/lesson.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn({ name: 'course_id' })
  courseId!: number;

  // user 1-n course
  @ManyToOne(() => User, (user) => user.courses, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'title' })
  title!: string;

  // status
  @Column({
    name: 'status',
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status!: CourseStatus;

  @Column({
    name: 'description',
    nullable: true,
    type: 'text',
  })
  description!: string;

  @Column({
    name: 'thumbnail_url',
    nullable: true,
  })
  thumbnailUrl!: string;

  @Column({
    name: 'project_url',
    nullable: true,
  })
  projectUrl!: string;

  @Column({ name: 'language', nullable: true })
  language!: string;

  @Column({ name: 'duration', nullable: true })
  duration!: number;

  @Column({ name: 'total_lessons', default: 0 })
  totalLessons!: number;

  // Enrollment
  @OneToMany(() => Enrollment, (enrollment) => enrollment.course, {
    nullable: false,
  })
  enrollments!: Enrollment[];

  // course 1-n lesson
  @OneToMany(() => Lesson, (lesson) => lesson.course, {
    nullable: false,
  })
  lessons!: Lesson[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date;

  // người duyệt khóa học
  @ManyToOne(() => User, (user) => user.reviewedCourses, {
    nullable: true,
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy!: User;

  @Column({ name: 'errollment_count', default: 0 })
  enrollmentCount!: number;

  // course 1-n learning-path-course
  @OneToMany(
    () => LearningPathCourse,
    (learningPathCourse) => learningPathCourse.course,
    {
      nullable: false,
    },
  )
  learningPathCourses!: LearningPathCourse[];
}
