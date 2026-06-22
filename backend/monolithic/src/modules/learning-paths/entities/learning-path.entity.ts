import { LearningPathLevel } from 'src/common/enums/learning-path.enum';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LearningPathCourse } from './learning-path-course.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { LearningPathFollow } from './learning-path-follow.entity';

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn({ name: 'learning_path_id' })
  learningPathId!: number;

  @Column({ name: 'title' })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'slug', unique: true })
  slug!: string;

  @Column({ name: 'banner_url', nullable: true })
  bannerUrl!: string;

  @Column({
    name: 'level',
    type: 'enum',
    enum: LearningPathLevel,
    default: LearningPathLevel.BEGINNER,
  })
  level!: LearningPathLevel;


  // learning path course
  @OneToMany(() => LearningPathCourse,
    (learningPathCourse) => learningPathCourse.learningPath,
    { nullable: false }
  )
  learningPathCourses!: LearningPathCourse[];

  @ManyToOne(() => User, (user) => user.learningPathCourses, { nullable: false })
  @JoinColumn({ name: 'editted_by' })
  edittedBy!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // learning_paths n - 1 learning_path_follows
  @OneToMany(() => LearningPathFollow,
    (follow) => follow.learningPath,
  )
  learningPathFollows!: LearningPathFollow[];
}
