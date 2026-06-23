
import { PvpMatchStatus } from 'src/common/enums/pvp-match-status.enum';
import { Assessment } from 'src/modules/assessment/entities/assessment.entity';
import { Learner } from 'src/modules/learners/entities/learner.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('pvp_matches')
export class PvpMatch {


  @PrimaryGeneratedColumn({
    name: 'match_id',
  })
  matchId: number;

  @Column({
    name: 'assessment_id',
    type: 'int',
    nullable: false,
  })
  assessmentId: number;

  @Column({
    name: 'player1_id',
    type: 'int',
    nullable: false,
  })
  player1Id: number;

  @Column({
    name: 'player2_id',
    type: 'int',
    nullable: false,
  })
  player2Id: number;

  @Column({
    name: 'winner_id',
    type: 'int',
    nullable: true,
  })
  winnerId?: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PvpMatchStatus,
    nullable: false,
    default: PvpMatchStatus.STARTED,
  })
  status: PvpMatchStatus;

  @Column({
    name: 'player1_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    default: 0,
  })
  player1Score: number;

  @Column({
    name: 'player2_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    default: 0,
  })
  player2Score: number;

  @ManyToOne(
    () => Assessment,
    (assessment) => assessment.pvpMatches,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'assessment_id',
  })
  assessment!: Assessment;

  @ManyToOne(
    () => Learner,
    (learner) => learner.pvpMatchesAsPlayer1,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'player1_id',
  })
  player1!: Learner;


  @ManyToOne(
    () => Learner,
    (learner) => learner.pvpMatchesAsPlayer2,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'player2_id',
  })
  player2!: Learner;


  @ManyToOne(
    () => Learner,
    (learner) => learner.pvpWins,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'winner_id',
  })
  winner?: Learner;
}
