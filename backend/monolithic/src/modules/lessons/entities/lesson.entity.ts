import { Course } from 'src/modules/courses/entities/course.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

@Entity('lessons')
export class Lesson {
    @PrimaryGeneratedColumn({name: 'lesson_id'})
    lessonId!: string;

    // course 1-n lesson
    @ManyToOne(() => Course, (course) => course.lessons, {nullable: false})
    @JoinColumn({ name: 'course_id' })
    course!: Course;

    @Column({ name: 'title', nullable: false })
    title!: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description!: string;

    @Column({ name: 'video_url', nullable: true })
    videoUrl!: string;

    @Column({ name: 'video_duration', nullable: true })
    videoDuration!: number;

    @Column({ name: 'content', type: 'text', nullable: true })
    content!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt!: Date;

}