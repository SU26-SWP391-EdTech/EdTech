import { CourseStatus } from 'src/common/enums/course.enum';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { LearningPathCourse } from 'src/modules/learning-paths/entities/learning-path-course.entity';
import { Lesson } from 'src/modules/lessons/entities/lesson.entity';
import { Organization } from 'src/modules/organizations/entities/organization.entity';
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

  // userId FK -> id of course provider (nguoi tao khoa hoc)
  @ManyToOne(() => User, (user) => user.courses, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'title' })
  title!: string;

  // organizationId FK
  @ManyToOne(() => Organization, (org) => org.courses, {
    nullable: false,
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

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

  // ví dụ: "javascript", "typescript", "python"
  @Column({ name: 'language', nullable: true })
  language!: string;

  // tổng thời lượng (phút hoặc giờ tùy bạn define)
  @Column({ name: 'duration', nullable: true })
  duration!: number;

  @Column({ name: 'total_lessons', default: 0 })
  totalLessons!: number;

  // Enrollment
  @OneToMany(() => Enrollment, (enrollment) => enrollment.course, {
    nullable: false,
  })
  enrollments!: Enrollment[];

  // Lesson
  @OneToMany(() => Lesson, (lesson) => lesson.course, {
    nullable: false,
  })
  lessons!: Lesson[];

  // learning-path-course
  @OneToMany(
    () => LearningPathCourse,
    (learningPathCourse) => learningPathCourse.course,
    {
      nullable: false,
    },
  )
  learningPathCourses!: LearningPathCourse[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // người duyệt khóa học
  @ManyToOne(() => User, (user) => user.reviewedCourses, {
    nullable: true,
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy!: User;

  @Column({name: 'errollment_count', default: 0})
  enrollmentCount!: number;
}
