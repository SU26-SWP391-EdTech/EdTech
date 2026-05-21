import { CourseProviderProfile } from 'src/modules/course-providers/entities/course-provider-profile.entity';
import { Course } from 'src/modules/courses/entities/course.entity';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { JoinOrganizationApplication } from 'src/modules/join-organization-application/entities/join-organization-application.entity';
import { LearnerProfile } from 'src/modules/learners/entities/learner-profile.entity';
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
} from 'typeorm';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId!: number;

  // khoa hoc da review
  @OneToMany(() => Course, (course) => course.reviewedBy, { nullable: false })
  reviewedCourses!: Course[];

  // Các đơn xin tham gia organization mà user đã gửi
  @OneToMany(
    () => JoinOrganizationApplication,
    (joinOrganizationApplication) => joinOrganizationApplication.user,
    { nullable: false },
  )
  joinOrganizationApplications!: JoinOrganizationApplication[];

  // Các đơn mà user đã review
  @OneToMany(
    () => JoinOrganizationApplication,
    (joinOrganizationApplication) => joinOrganizationApplication.reviewedBy,
    { nullable: false },
  )
  reviewedJoinOrganizationApplications!: JoinOrganizationApplication[];

  // Các đơn user đã gửi
  @OneToMany(
    () => OrganizationRegistrationApplication,
    (organizationRegistrationApplication) =>
      organizationRegistrationApplication.requesterUser,
    { nullable: false },
  )
  organizationRegistrationApplications!: OrganizationRegistrationApplication[];

  // Các đơn user đã review
  @OneToMany(
    () => OrganizationRegistrationApplication,
    (organizationRegistrationApplication) =>
      organizationRegistrationApplication.reviewedBy,
    { nullable: false },
  )
  reviewedOrganizationRegistrationApplications!: OrganizationRegistrationApplication[];

  @OneToOne(() => LearnerProfile, (learnerProfile) => learnerProfile.user)
  learnerProfile?: LearnerProfile;

  @OneToOne(
    () => CourseProviderProfile,
    (courseProviderProfile) => courseProviderProfile.user,
  )
  courseProviderProfile?: CourseProviderProfile;
  // course
  @OneToMany(() => Course, (course) => course.user, { nullable: false })
  courses!: Course[];

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

  @Column({ name: 'password' })
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
}