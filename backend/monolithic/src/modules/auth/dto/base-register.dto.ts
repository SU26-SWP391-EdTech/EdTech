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
        message: `Vai trò không hợp lệ. Bạn chỉ có thể chọn giữa '${UserRole.LEARNER}' hoặc '${UserRole.COURSE_PROVIDER}'`,
    })
    roleName: UserRole; 
}