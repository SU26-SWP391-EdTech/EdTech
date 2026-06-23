import { ChallengeStatus } from 'src/common/enums/challenge-status.enum';
import { Assessment } from 'src/modules/assessment/entities/assessment.entity';
import { Learner } from 'src/modules/learners/entities/learner.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('challenge_requests')

export class ChallengeRequest {
  @PrimaryGeneratedColumn({ name: 'challenge_id' })
  challengeId!: number;

  @Column({ name: 'assessment_id' })
  assessmentId!: number;

  @Column({ name: 'challenger_id' })
  challengerId!: number;

  @Column({ name: 'receiver_id' })
  receiverId!: number;

  @ManyToOne(
    () => Assessment,
    assessment => assessment.challengeRequests,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'assessment_id' })
  assessment!: Assessment;

  @ManyToOne(
    () => Learner,
    learner => learner.sentChallenges,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'challenger_id' })
  challenger!: Learner;

  @ManyToOne(
    () => Learner,
    learner => learner.receivedChallenges,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'receiver_id' })
  receiver!: Learner;

  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.PENDING,
  })
  status!: ChallengeStatus;


  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({
    name: 'responded_at',
    type: 'timestamp',
    nullable: true,
  })
  respondedAt!: Date | null;

}
