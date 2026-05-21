import { Course } from 'src/modules/courses/entities/course.entity';
import { JoinOrganizationApplication } from 'src/modules/join-organization-application/entities/join-organization-application.entity';
import { LearningPath } from 'src/modules/learning-paths/entities/learning-path.entity';
import { OrganizationMemberProfile } from 'src/modules/organization-member-profiles/entities/organization-member-profile.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn({ name: 'organization_id' })
  organizationId!: string;

  @Column({ name: 'organization_name' })
  organizationName!: string;

  @Column({ name: 'organization_email', unique: true })
  organizationEmail!: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl!: string;

  @Column({ name: 'banner_url', nullable: true })
  bannerUrl!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string;

  // course
  @OneToMany(() => Course, (course) => course.organization, {nullable: false})
  courses!: Course[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // organization profiles
  @OneToMany(
    () => OrganizationMemberProfile,
    (organizationMemberProfile) => organizationMemberProfile.organization,
    {nullable: false}
  )
  organizationMemberProfiles!: OrganizationMemberProfile[];

   // tổ chức duyệt đơn join
  @OneToMany(
    () => JoinOrganizationApplication,
    (joinOrganizationApplication) => joinOrganizationApplication.organization,
    { nullable: false }
  )
  joinOrganizationApplications!: JoinOrganizationApplication[];

  // learning path
  @OneToMany(() => LearningPath, (lp) => lp.organization, { nullable: false })
  learningPaths!: LearningPath[];
}