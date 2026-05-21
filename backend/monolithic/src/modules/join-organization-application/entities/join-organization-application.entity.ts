import { JoinOrganizationApplicationStatus } from 'src/common/enums/join-organization-application.enum';
import { Organization } from 'src/modules/organizations/entities/organization.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('join_organization_applications')
@Unique('UQ_PENDING_JOIN_REQUEST', ['userId', 'organizationId', 'status'])
export class JoinOrganizationApplication {
  @PrimaryGeneratedColumn({ name: 'cp_application_id' })
  cpApplicationId!: number;

  // FK -> users.user_id
  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.requestJoinOrganizationApplications, {nullable: false})
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // FK -> organizations.organization_id
  @Column({
    name: 'organization_id',
  })
  organizationId!: number;

  @ManyToOne(
    () => Organization,
    (organization) => organization.joinOrganizationApplications,
    {nullable: false}
  )
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;


  // PENDING / APPROVED / REJECTED
  @Column({
    name: 'status',
    type: 'enum',
    enum: JoinOrganizationApplicationStatus,
    default: JoinOrganizationApplicationStatus.PENDING,
  })
  status!: JoinOrganizationApplicationStatus;

  // Lời nhắn xin tham gia
  @Column({
    name: 'message',
    type: 'text',
    nullable: true,
  })
  message!: string;

  // Người review
  @ManyToOne(
    () => User,
    (user) => user.reviewedJoinOrganizationApplications,
    {nullable: true}
  )
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy!: User;

  @Column({
    name: 'reviewed_at',
    type: 'timestamp',
    nullable: true,
  })
  reviewedAt!: Date;

  @Column({
    name: 'review_reason',
    type: 'text',
    nullable: true,
  })
  reviewReason!: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}

