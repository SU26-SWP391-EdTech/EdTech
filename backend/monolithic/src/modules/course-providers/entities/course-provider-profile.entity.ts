import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('course_provider_profiles')
export class CourseProvider {
    @PrimaryColumn({ name: 'user_id' })
    userId!: number;

    // user
    @OneToOne(() => User, (user) => user.courseProvider, {
        nullable: false
    })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({
        type: 'text',
        nullable: true,
    })
    expertise!: string;
    // VD: "NestJS, React, System Design"

    @Column({
        name: 'experience_years',
        nullable: true,
    })
    experienceYears!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}