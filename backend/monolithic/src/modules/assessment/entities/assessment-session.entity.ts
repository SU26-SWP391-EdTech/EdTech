import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Assessment } from './assessment.entity';
import { User } from 'src/modules/users/entities/user.entity';


@Entity('assessment_sessions')

export class AssessmentSession {
  @PrimaryGeneratedColumn({
    name: 'session_id',
  })
  sessionId: number;

  @Column({
    name: 'assessment_id',
    type: 'int',
    nullable: false,
  })
  assessmentId: number;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
  })
  userId: number;

  @Column({
    name: 'score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    default: 0,
  })
  score: number;

  @CreateDateColumn({
    name: 'started_at',
    type: 'timestamp',
  })
  startedAt!: Date;

  @Column({
    name: 'completed_at',
    type: 'timestamp',
    nullable: true,
  })
  completedAt?: Date;

  @Column({
    name: 'attempt_no',
    type: 'int',
    nullable: false,
    default: 1,
  })

  attemptNo: number;

  @ManyToOne(
    () => Assessment,
    (assessment) => assessment.sessions,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'assessment_id',
  })
  assessment!: Assessment;

  @ManyToOne(
    () => User,
    (user) => user.assessmentSessions,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;
}
