import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

@Entity('learner_profiles')
export class Learner {
    @PrimaryColumn({name: 'user_id'})
    userId!: number;

    @OneToOne(() => User, (user) => user.learnerProfile, {nullable: false})
    @JoinColumn({ name: 'user_id' })
    user!: User

    @Column({ name: 'learning_goal', type: 'text', nullable: true })
    learningGoal!: string;

    @Column({ name: 'level', nullable: true })
    level!: string;

    @Column({name: 'bio', type: 'text', nullable: true })
    bio!: string;
}