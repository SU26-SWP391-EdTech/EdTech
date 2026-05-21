import { Role } from 'src/modules/roles/entities/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'avatar_url' })
  avatar: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({
    name: 'role_id'
  })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;


}
