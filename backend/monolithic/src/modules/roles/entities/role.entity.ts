import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ name: 'role_id' })
  roleId: number;

  @Column({
    name: 'role_name',
    unique: true
  })
  roleName: string

  @OneToMany(() => User, (user) => user.role)
  users: User[]
}
