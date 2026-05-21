import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './users.entity';

@Entity('course_provider_profiles')
export class CourseProviderProfile {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, user => user.courseProviderProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'expertise', nullable: true })
  expertise: string;

  @Column({ name: 'experience_years', nullable: true, type: 'int' })
  experienceYears: number;

}