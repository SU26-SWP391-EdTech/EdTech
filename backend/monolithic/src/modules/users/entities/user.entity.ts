import { Course } from 'src/modules/courses/entities/course.entity';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { Learner } from 'src/modules/learners/entities/learner.entity';
import { LearningPathCourse } from 'src/modules/learning-paths/entities/learning-path-course.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { LearningPath } from 'src/modules/learning-paths/entities/learning-path.entity';
import { LearningPathFollow } from 'src/modules/learning-paths/entities/learning-path-follow.entity';
import { LearnerLessonProgress } from 'src/modules/progress/entities/learner-lesson-progress.entity';
import { AssessmentSession } from 'src/modules/assessment/entities/assessment-session.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId!: number;

  @OneToMany(() => LearningPathCourse, (lpc) => lpc.edittedBy, { nullable: false })
  learningPathCourses!: LearningPathCourse[];

  // ==== course ====
  @OneToMany(() => Course, (course) => course.user, { nullable: false })
  courses!: Course[];

  // khoa hoc da review
  @OneToMany(() => Course, (course) => course.reviewedBy, { nullable: false })
  reviewedCourses!: Course[];


  // user 1-1 learner
  @OneToOne(() => Learner, (learner) => learner.user, { nullable: false })
  learner!: Learner;

  @Column({
    name: 'full_name',
    nullable: true,
  })
  fullName!: string;

  @Column({
    name: 'email',
    unique: true,
  })
  email!: string;

  @Column({
    name: 'password',
    select: false,
  })
  password!: string;

  @Column({
    name: 'avatar_url',
    nullable: true,
  })
  avatar!: string;

  @ManyToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn({
    name: 'role_id',
  })
  role!: Role;

  // user 1-n enrollment  
  @OneToMany(() => Enrollment, (enrollment) => enrollment.user, {
    nullable: false,
  })
  enrollments!: Enrollment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({
    name: 'is_email_verified',
    default: false,
  })
  isEmailVerified!: boolean;

  @Column({
    name: 'email_verification_token',
    nullable: true,
  })
  emailVerificationToken!: string;

  @Column({
    name: 'email_verification_expires_at',
    nullable: true,
  })
  emailVerificationExpiresAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date;

  // user 1-1 userProfile
  @OneToOne(() => UserProfile, (userProfile) => userProfile.user, { nullable: false })
  userProfile!: UserProfile;

  @OneToMany(() => LearningPath, (learningPath) => learningPath.edittedBy, { nullable: false })
  learningPaths!: LearningPath[];

  // users 1 - n learnign_path_follows
  @OneToMany(() => LearningPathFollow, (follow) => follow.user)
  learningPathFollows!: LearningPathFollow[];

  @OneToMany(
    () => LearnerLessonProgress,
    (progress) => progress.user,
  )
  lessonProgresses!: LearnerLessonProgress[];

  @OneToMany(
    () => AssessmentSession,
    (session) => session.user,
  )
  assessmentSessions!: AssessmentSession[];
}
