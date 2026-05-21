import { Organization } from 'src/modules/organizations/entities/organization.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('organization_member_profiles')
export class OrganizationMemberProfile {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'organization_id' })
  organizationId!: number;

  @OneToOne(() => User, (user) => user.organizationProfile, {nullable: false})
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(
    () => Organization,
    (organization) => organization.organizationProfiles,
    {nullable: false}
  )
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
}
