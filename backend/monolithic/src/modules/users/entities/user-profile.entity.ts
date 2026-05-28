import { PrimaryColumn, Entity, OneToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'user_profiles' })
export class UserProfile {
    @PrimaryColumn({ name: 'user_id' })
    userId!: number;

    // user 1-1 userProfile
    @OneToOne(() => User, (user) => user.userProfile, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'expertise', nullable: true })
    expertise!: string;

    @Column({ name: 'experience_years', nullable: true })
    experienceYears!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at' , nullable: true })
    updatedAt!: Date
}
