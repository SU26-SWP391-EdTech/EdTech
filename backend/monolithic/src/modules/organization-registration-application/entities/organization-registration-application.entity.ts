import { OrganizationRegistrationApplicationStatus } from 'src/common/enums/organization-registration-application.enum';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('organization_registration_applications')
export class OrganizationRegistrationApplication {
  @PrimaryGeneratedColumn({ name: 'application_id' })
  applicationId!: number;

  // requesterUser
  // Người gửi đơn
  @ManyToOne(() => User, (user) => user.organizationRegistrationApplications, {nullable: false})
  @JoinColumn({ name: 'requester_user_id' })
  requesterUser!: User;

  @Column({ name: 'org_name' })
  orgName!: string;

  @Column({
    name: 'org_email',
    unique: true,
  })
  orgEmail!: string;

  @Column({
    name: 'website',
    nullable: true,
  })
  website!: string;

  @Column({ name: 'phone'})
  phone!: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description!: string;

   // Logo
  @Column({
    name: 'logo_url',
    nullable: true,
  })
  logoUrl!: string;

  // Giấy phép
  @Column({
    name: 'license_document_url',
  })
  licenseDocumentUrl!: string;

  // Mã số thuế
  @Column({
    name: 'tax_code',
    unique: true,
  })
  taxCode!: string;

   @Column({ name: 'address' })
  address!: string;

  // Trạng thái duyệt
  @Column({
    name: 'status',
    type: 'enum',
    enum: OrganizationRegistrationApplicationStatus,
    default: OrganizationRegistrationApplicationStatus.PENDING,
  })
  status!: OrganizationRegistrationApplicationStatus;

  // nguoi duyet
  @ManyToOne(() => User, (user) => user.reviewedOrganizationRegistrationApplications, {
    nullable: true,
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy!: User;

  // Lý do reject
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
