import { Course } from 'src/modules/courses/entities/course.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('leaderbpoard_rules')
export class LeaderboardRule {
  @PrimaryGeneratedColumn({
    name: 'rule_id',
  })
  ruleId!: number;

  @Column({
    name: 'score_weight',
    nullable: false,
    type: 'decimal',
    default: 0
  })
  scoreWeight!: number;

  @Column({
    name: 'time_weight',
    nullable: false,
    type: 'decimal',
    default: 0
  })
  timeWeight!: number;

  @Column({
    name: 'attempt_weight',
    nullable: false,
    type: 'decimal',
    default: 0
  })
  attemptWeight!: number;

  // leaderbpoard_rules 1 - 1 courses
  @OneToOne(() => Course, {
    nullable: false
  })
  @JoinColumn({
    name: 'course_id',
  })
  course!: Course;
}
