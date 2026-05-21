import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/modules/users/entities/users.entity";
import { UserRole } from "src/common/enums/role.enum";

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn({ name: 'role_id' })
    roleId: number;
    
    @Column({
        name: 'role_name',
        type: 'enum',
        enum: UserRole,
    })
    roleName: UserRole;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}