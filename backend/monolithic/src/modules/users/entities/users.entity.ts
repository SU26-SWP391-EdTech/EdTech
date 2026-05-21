import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';
import { LearnerProfile } from './learner-profile.entity';
import { CourseProviderProfile } from './course-provider-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users, { 
    nullable: false,
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => LearnerProfile, profile => profile.user)
  learnerProfile: LearnerProfile;

  @OneToOne(() => CourseProviderProfile, profile => profile.user)
  courseProviderProfile: CourseProviderProfile;
}