import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { Course } from 'src/modules/courses/entities/course.entity';
import { Lesson } from 'src/modules/lessons/entities/lesson.entity';
import { Question } from 'src/modules/question/entities/question.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AssessmentSession } from './assessment-session.entity';
import { PvpMatch } from 'src/modules/pvp/entities/pvp-match.entity';
import { ChallengeRequest } from 'src/modules/pvp/entities/challenge-request.entity';


@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn({
    name: 'assessment_id',
  })
  assessmentId!: number;

  // nullable:
  // NULL => assessment cho toàn bộ course
  // có giá trị => assessment của lesson
  @Column({
    name: 'lesson_id',
    type: 'int',
    nullable: true,
  })
  lessonId?: number;

  @Column({
    name: 'course_id',
    type: 'int',
    nullable: false,
  })
  courseId: number;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  title: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: AssessmentType,
    nullable: false,
  })
  type: AssessmentType;


  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.assessments,
    {
      nullable: true,
    },
  )
  @JoinColumn({
    name: 'lesson_id',
  })
  lesson?: Lesson;



  @ManyToOne(
    () => Course,
    (course) => course.assessments,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'course_id',
  })
  course!: Course;

  @OneToMany(
    () => Question,
    (question) => question.assessment,
    { cascade: ['insert'] }
  )
  questions!: Question[];

  @OneToMany(
    () => AssessmentSession,
    (session) => session.assessment,
  )
  sessions!: AssessmentSession[];

  @OneToMany(
    () => PvpMatch,
    (match) => match.assessment,
  )
  pvpMatches!: PvpMatch[];

  @OneToMany(
    () => ChallengeRequest,
    challenge => challenge.assessment,
  )
  challengeRequests!: ChallengeRequest[];
}
