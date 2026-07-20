import { PvpStatus } from "src/common/enums/pvp-status.enum";
import { LearnerLessonProgress } from "src/modules/progress/entities/learner-lesson-progress.entity";
import { ChallengeRequest } from "src/modules/pvp/entities/challenge-request.entity";
import { PvpMatch } from "src/modules/pvp/entities/pvp-match.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity('learner_profiles')
export class Learner {
  @PrimaryColumn({
    name: 'user_id',
    type: 'int'
  })
  userId!: number;

  // user 1-1 learner
  @OneToOne(() => User, (user) => user.learner, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'learning_goal', type: 'text', nullable: true })
  learningGoal!: string;

  @Column({ name: 'level', nullable: true })
  level!: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio!: string;

  @OneToMany(
    () => PvpMatch,
    (match) => match.player1,
  )
  pvpMatchesAsPlayer1!: PvpMatch[];


  @OneToMany(
    () => PvpMatch,
    (match) => match.player2,
  )
  pvpMatchesAsPlayer2!: PvpMatch[];


  @OneToMany(
    () => PvpMatch,
    (match) => match.winner,
  )
  pvpWins!: PvpMatch[];

  @Column({
    name: 'current_streak',
    type: 'int',
    nullable: false,
    default: 0,
  })
  currentStreak!: number;


  @Column({
    name: 'longest_streak',
    type: 'int',
    nullable: false,
    default: 0,
  })
  longestStreak!: number;


  @Column({
    name: 'streak_life',
    type: 'int',
    nullable: false,
    default: 2,
  })
  streakLife!: number;


  @Column({
    name: 'pvp_status',
    type: 'enum',
    enum: PvpStatus,
    nullable: false,
    default: PvpStatus.IDLE,
  })
  pvpStatus!: PvpStatus;


  @Column({
    name: 'last_online_at',
    type: 'timestamp',
    nullable: true,
  })
  lastOnlineAt?: Date;

  @OneToMany(
    () => ChallengeRequest,
    challenge => challenge.challenger,
  )
  sentChallenges!: ChallengeRequest[];

  @OneToMany(
    () => ChallengeRequest,
    challenge => challenge.receiver,
  )
  receivedChallenges!: ChallengeRequest[];

  @OneToMany(
    () => LearnerLessonProgress,
    (progress) => progress.learner,
  )
  lessonProgresses: LearnerLessonProgress[];
}
