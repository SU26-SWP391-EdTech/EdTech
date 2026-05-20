import { Course } from 'src/modules/courses/entities/course.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';

import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn({ name: 'enrollments_id' })
  enrollmentId!: number;

  // ===== USER FK =====
  @ManyToOne(() => User, (user) => user.enrollments, {
    nullable: false
  })
  @JoinColumn({ name: 'user_id'})
  user!: User;

  // ===== COURSE FK =====
  @ManyToOne(() => Course, (course) => course.enrollments,{
    nullable: false
  })
  @JoinColumn({ name: 'course_id' }) // 👈 custom FK column
  course!: Course;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt!: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE
  })
  status!: EnrollmentStatus;

  @Column({ 
    name: 'progress', 
    type: 'float', 
    default: 0 })
  progress!: number;

  // lần truy cập gần nhất
  @Column({ 
    name: 'last_accessed_at', 
    nullable: true 
  })
  lastAccessedAt!: Date;

  @Column({ 
    name: 'completed_at', 
    nullable: true 
  })
  completedAt!: Date;

  @Column({ 
    name: 'expires_at', 
    nullable: true })
  expiresAt!: Date;
}
