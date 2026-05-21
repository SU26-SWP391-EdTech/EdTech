import { LearningPathLevel } from 'src/common/enums/learning-path.enum';
import { Organization } from 'src/modules/organizations/entities/organization.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LearningPathCourse } from './learning-path-course.entity';

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn({ name: 'learning_path_id' })
  learningPathId!: number;

  @Column({name: 'title'})
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'slug', unique: true})
  slug!: string;

  @Column({name: 'banner_url', nullable: true })
  bannerUrl!: string;

  @Column({
    name: 'level',
    type: 'enum',
    enum: LearningPathLevel,
    default: LearningPathLevel.BEGINNER,
  })
  level!: LearningPathLevel;

  // organization
  @ManyToOne(() => Organization, (org) => org.learningPaths, {nullable: false})
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  // learning path course
  @OneToMany(() => LearningPathCourse, (learningPathCourse) => learningPathCourse.learningPath, {nullable: false})
  learningPathCourses!: LearningPathCourse[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
