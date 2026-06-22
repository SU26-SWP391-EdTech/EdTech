import { User } from "src/modules/users/entities/user.entity";
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { LearningPath } from "./learning-path.entity";

@Entity('learning_path_follows')
export class LearningPathFollow {
  @PrimaryColumn({
    name: 'learning_path_id',
    type: 'int',
    nullable: false
  })
  learningPathId: number;

  // learning_path_follows 1 - n learning_paths
  @ManyToOne(() => LearningPath,
    (learningPath) => learningPath.learningPathFollows,
    {
      nullable: false
    },

  )
  @JoinColumn({
    name: 'learning_path_id',
  })
  learningPath!: LearningPath;

  @PrimaryColumn({
    name: 'user_id',
    type: 'int',
    nullable: false
  })
  userId: number;

  // learning_path_follows 1 - n users 
  @ManyToOne(() => User,
    (user) => user.learningPathFollows,
    {
      nullable: false
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  @CreateDateColumn({ name: 'followed_at', type: 'timestamp', nullable: false })
  followedAt: Date;
}
