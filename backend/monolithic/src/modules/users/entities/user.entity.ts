import { CourseProvider } from 'src/modules/course-providers/entities/course-provider-profile.entity';
import { Course } from 'src/modules/courses/entities/course.entity';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { JoinOrganizationApplication } from 'src/modules/join-organization-application/entities/join-organization-application.entity';
import { Learner } from 'src/modules/learners/entities/learner.entity';
import { LearningPathCourse } from 'src/modules/learning-paths/entities/learning-path-course.entity';
import { OrganizationMemberProfile } from 'src/modules/organization-member-profiles/entities/organization-member-profile.entity';
import { OrganizationRegistrationApplication } from 'src/modules/organization-registration-application/entities/organization-registration-application.entity';
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
  DeleteDateColumn
} from 'typeorm';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId!: number;

  @OneToMany(() => LearningPathCourse, (lpc) => lpc.editted_by, { nullable: false })
  learningPathCourses!: LearningPathCourse[];

  // ==== course ====
  @OneToMany(() => Course, (course) => course.user, { nullable: false })
  courses!: Course[];

  // khoa hoc da review
  @OneToMany(() => Course, (course) => course.reviewedBy, { nullable: false })
  reviewedCourses!: Course[];
  // ===

  // ==== join_organization_applications ====
  // Các đơn xin tham gia organization mà user đã gửi
  @OneToMany(
    () => JoinOrganizationApplication,
    (joinOrganizationApplication) => joinOrganizationApplication.user,
    { nullable: false },
  )
  requestJoinOrganizationApplications!: JoinOrganizationApplication[];

  // Các đơn xin tham gia organization mà user đã review
  @OneToMany(
    () => JoinOrganizationApplication,
    (joinOrganizationApplication) => joinOrganizationApplication.reviewedBy,
    { nullable: false },
  )
  reviewedJoinOrganizationApplications!: JoinOrganizationApplication[];
  // === 

  // ==== organization_registration_applications ====
  // Các đơn xin đăng ký tổ chức user đã gửi
  @OneToMany(
    () => OrganizationRegistrationApplication,
    (organizationRegistrationApplication) =>
      organizationRegistrationApplication.requesterUser,
    { nullable: false },
  )
  requestOrganizationRegistrationApplications!: OrganizationRegistrationApplication[];

  // Các đơn xin đăng ký tổ chức mà user đã review
  @OneToMany(
    () => OrganizationRegistrationApplication,
    (organizationRegistrationApplication) =>
      organizationRegistrationApplication.reviewedBy,
    { nullable: false },
  )
  reviewedOrganizationRegistrationApplications!: OrganizationRegistrationApplication[];
  // ====

  // learner
  @OneToOne(() => Learner, (learner) => learner.user, { nullable: false })
  learner!: Learner;

  // course provider
  @OneToOne(() => CourseProvider, (courseProvider) => courseProvider.user, {
    nullable: false,
  })
  courseProvider!: CourseProvider;

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

  @Column({ name: 'password', select: false })
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

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user, {
    nullable: false,
  })
  enrollments!: Enrollment[];

  // organization profile
  @OneToOne(
    () => OrganizationMemberProfile,
    (organizationMemberProfile) => organizationMemberProfile.user,
    { nullable: false },
  )
  organizationProfile!: OrganizationMemberProfile;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}