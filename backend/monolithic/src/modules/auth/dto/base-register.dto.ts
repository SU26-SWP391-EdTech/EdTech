import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';
import { UserRole } from 'src/common/enums/role.enum';

export class BaseRegisterDto{
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsNotEmpty()
    @IsIn([UserRole.LEARNER, UserRole.COURSE_PROVIDER], {
        message: `Invalid role. You can only choose between '${UserRole.LEARNER}' and '${UserRole.COURSE_PROVIDER}'`,
    })
    roleName: UserRole; 
}