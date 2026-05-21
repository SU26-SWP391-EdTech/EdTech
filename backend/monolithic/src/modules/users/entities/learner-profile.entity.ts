import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './users.entity';

@Entity('learner_profiles')
export class LearnerProfile {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, user => user.learnerProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'learning_goal', nullable: true })
  learningGoal: string;

  @Column({ name: 'level', nullable: true })
  level: string;

  @Column({ name: 'bio', nullable: true, type: 'text' })
  bio: string;
}