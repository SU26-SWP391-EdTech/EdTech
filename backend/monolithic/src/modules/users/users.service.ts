import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfile } from './entities/user-profile.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetAcademicUserProfileDto } from './dto/get-academic-user-profile.dto';
import { EditAcademicUserProfileDto } from './dto/edit-academic-user-profile.dto';
import { UpdateAcademicUserInfoDto } from './dto/update-academic-user-info.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { CourseStatus } from 'src/common/enums/course.enum';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(LearningPath)
    private learningPathRepo: Repository<LearningPath>,
    private cloudinaryService: CloudinaryService,
  ) { }

  private readonly logger = new Logger(UsersService.name);

  async getAdminDashboardStats() {
    const totalUsers = await this.userRepo.count();
    const activePaths = await this.learningPathRepo.count();
    const completedCourses = await this.enrollmentRepo.count({
      where: { status: EnrollmentStatus.COMPLETED }
    });


    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activityData: any[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

      const usersCount = await this.userRepo.createQueryBuilder('user')
        .where('user.createdAt >= :start AND user.createdAt <= :end', { start: startOfMonth, end: endOfMonth })
        .getCount();

      const enrollmentsCount = await this.enrollmentRepo.createQueryBuilder('enrollment')
        .where('enrollment.enrolledAt >= :start AND enrollment.enrolledAt <= :end', { start: startOfMonth, end: endOfMonth })
        .getCount();

      const completionsCount = await this.enrollmentRepo.createQueryBuilder('enrollment')
        .where('enrollment.completedAt >= :start AND enrollment.completedAt <= :end', { start: startOfMonth, end: endOfMonth })
        .andWhere('enrollment.status = :status', { status: EnrollmentStatus.COMPLETED })
        .getCount();

      activityData.push({
        month: monthNames[month],
        users: usersCount,
        enrollments: enrollmentsCount,
        completions: completionsCount,
      });
    }

    const weeklyEnrollments: any[] = [];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dayEnd = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 23, 59, 59);

      const count = await this.enrollmentRepo.createQueryBuilder('enrollment')
        .where('enrollment.enrolledAt >= :start AND enrollment.enrolledAt <= :end', { start: dayStart, end: dayEnd })
        .getCount();

      weeklyEnrollments.push({
        day: daysOfWeek[i],
        value: count,
      });
    }

    const paths = await this.learningPathRepo.find({
      relations: ['learningPathCourses', 'learningPathCourses.course'],
    });

    const colors = ['#E11D48', '#7C3AED', '#16A34A', '#D97706', '#2563EB'];
    const learningPaths = await Promise.all(paths.map(async (path, index) => {
      const courseIds = path.learningPathCourses?.map(c => c.course?.courseId).filter(Boolean) || [];
      let learnersCount = 0;
      if (courseIds.length > 0) {
        learnersCount = await this.enrollmentRepo.createQueryBuilder('enrollment')
          .where('enrollment.course_id IN (:...courseIds)', { courseIds })
          .getCount();
      }
      return {
        name: path.title,
        progress: 50,
        learners: learnersCount,
        color: colors[index % colors.length],
      };
    }));
    learningPaths.sort((a, b) => b.learners - a.learners);

    const latestEnrollments = await this.enrollmentRepo.find({
      relations: ['user', 'course'],
      order: { enrolledAt: 'DESC' },
      take: 5,
    });

    const colorsBg = ['bg-[#7C3AED]', 'bg-[#16A34A]', 'bg-[#2563EB]', 'bg-[#D97706]', 'bg-[#E11D48]'];
    const recentActivity = latestEnrollments.map((en, i) => {
      const timeDiff = Math.abs(now.getTime() - en.enrolledAt.getTime());
      const minutes = Math.floor(timeDiff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const timeStr = minutes < 60 ? `${minutes}m ago` : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;

      return {
        type: 'enrollment',
        user: en.user?.fullName || 'Anonymous',
        action: 'enrolled in',
        target: en.course?.title || 'Unknown Course',
        time: timeStr,
        avatar: en.user?.fullName ? en.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U',
        color: colorsBg[i % colorsBg.length],
      };
    });

    const dbUsers = await this.userRepo.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const tableUsers = dbUsers.map((u, i) => {
      const initials = u.fullName ? u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
      const formattedCreated = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return {
        name: u.fullName,
        email: u.email,
        role: u.role?.roleName || 'Learner',
        status: 'Active',
        joined: formattedCreated,
        avatar: initials,
        color: colorsBg[i % colorsBg.length],
      };
    });

    const sparkUsers: any[] = [];
    const sparkPaths: any[] = [];
    const sparkCourses: any[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59);

      const uCount = await this.userRepo.createQueryBuilder('user')
        .where('user.createdAt <= :end', { end: dayEnd })
        .getCount();

      const pCount = await this.learningPathRepo.createQueryBuilder('lp')
        .where('lp.createdAt <= :end', { end: dayEnd })
        .getCount();

      const cCount = await this.enrollmentRepo.createQueryBuilder('enrollment')
        .where('enrollment.completedAt <= :end', { end: dayEnd })
        .andWhere('enrollment.status = :status', { status: EnrollmentStatus.COMPLETED })
        .getCount();

      sparkUsers.push({ v: uCount });
      sparkPaths.push({ v: pCount });
      sparkCourses.push({ v: cCount });
    }

    return {
      stats: {
        totalUsers,
        activePaths,
        completedCourses,
        sparkUsers,
        sparkPaths,
        sparkCourses,
      },
      activityData,
      weeklyEnrollments,
      learningPaths,
      recentActivity,
      tableUsers,
    };
  }

  async findOne(id: number) {
    return this.userRepo.findOne({
      where: { userId: id },
      select: {
        userId: true,
        fullName: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async create(dto: CreateUserDto) {
    const isExist = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (isExist) throw new ConflictException('Email is already existed');

    const role = await this.roleRepo.findOne({
      where: { roleName: dto.roleName },
    });
    if (!role) throw new ConflictException('Invalid role');

    const hashPassword = await bcrypt.hash(dto.password, 10);

    let avatar = dto.avatar_url;
    if (dto.avatar_url && dto.avatar_url.startsWith('data:image/')) {
      const uploaded = await this.cloudinaryService.uploadBase64(
        dto.avatar_url,
      );
      avatar = uploaded.secure_url;
    }

    const newUser = this.userRepo.create({
      email: dto.email,
      password: hashPassword,
      fullName: dto.fullName,
      avatar: avatar,
      role: role,
      isEmailVerified:
        dto.isEmailVerified !== undefined ? dto.isEmailVerified : false,
    });
    return await this.userRepo.save(newUser);
  }

  async findAll() {
    const users = await this.userRepo.find({
      relations: ['role'],
      withDeleted: true,
    });
    return users.map((users) => {
      const { password, ...result } = users;
      return result;
    });
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { userId: id } });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }
    await this.userRepo.softDelete(id);
    return {
      message: `User ID ${id} has been deleted`,
    };
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { userId: id } });
    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }
    if (dto.fullName) {
      user.fullName = dto.fullName;
    }
    if (dto.avatar_url) {
      if (dto.avatar_url.startsWith('data:image/')) {
        const uploaded = await this.cloudinaryService.uploadBase64(
          dto.avatar_url,
        );
        user.avatar = uploaded.secure_url;
      } else {
        user.avatar = dto.avatar_url;
      }
    }
    if (dto.isEmailVerified !== undefined) {
      user.isEmailVerified = dto.isEmailVerified;
    }
    const updatedUser = await this.userRepo.save(user);

    const { password, ...result } = updatedUser;
    return result;
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.userId = :id', { id })
      .getOne();

    if (!user) throw new NotFoundException('User not exist');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isMatch) throw new BadRequestException('Current password incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    user.password = hashedPassword;

    await this.userRepo.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  async updateProfile(id: number, dto: UpdateAcademicUserInfoDto) {
    let academicUser = await this.userProfileRepo.findOne({
      where: { userId: id },
    });

    if (!academicUser) {
      academicUser = this.userProfileRepo.create({
        userId: id,
        expertise: dto.expertise,
        experienceYears: dto.experienceYears,
      });
    } else {
      Object.assign(academicUser, {
        expertise: dto.expertise,
        experienceYears: dto.experienceYears,
      });
    }

    return this.userProfileRepo.save(academicUser);
  }

  async editAcademicUserProfile(
    id: number,
    dto: EditAcademicUserProfileDto,
    file?: Express.Multer.File,
  ) {
    const academicUser = await this.userRepo.findOne({
      where: {
        userId: id,
      },
      relations: ['userProfile'],
    });

    if (!academicUser) {
      throw new NotFoundException('Academic User not found');
    }

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      academicUser.avatar = uploaded.secure_url;
    } else if (dto.avatarUrl) {
      academicUser.avatar = dto.avatarUrl;
    }

    if (dto.fullName) {
      academicUser.fullName = dto.fullName;
    }

    if (dto.expertise !== undefined || dto.experienceYears !== undefined) {
      let profile = academicUser.userProfile;
      if (!profile) {
        profile = this.userProfileRepo.create({
          userId: id,
        });
      }
      if (dto.expertise !== undefined) {
        profile.expertise = dto.expertise;
      }
      if (dto.experienceYears !== undefined) {
        profile.experienceYears = dto.experienceYears;
      }
      profile.user = academicUser;
      academicUser.userProfile = await this.userProfileRepo.save(profile);
    }

    return this.userRepo.findOne({
      where: { userId: id },
      relations: ['userProfile'],
    });
  }

  async viewAcademicUserProfile(id: number, dto: GetAcademicUserProfileDto) {
    const academicUser = await this.userRepo.findOne({
      where: { userId: id },
      relations: ['userProfile'],
    });

    if (!academicUser) {
      throw new NotFoundException('Academic User not exist');
    }

    return {
      fullName: academicUser.fullName,
      email: academicUser.email,
      avatarUrl: academicUser.avatar,
      expertise: academicUser.userProfile?.expertise,
      experienceYears: academicUser.userProfile?.experienceYears,
      createdAt: academicUser.createdAt,
    };
  }

  async onApplicationBootstrap() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const userCount = await this.userRepo.count();

    if (userCount > 0) {
      this.logger.log('Users already exist, skip admin seeding');
      return;
    }

    const adminRole = await this.roleRepo.findOne({
      where: { roleName: RoleEnum.ADMIN },
    });

    if (!adminRole) {
      throw new Error('ADMIN role not found');
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = this.userRepo.create({
      fullName: 'Admin',
      email: 'admin@system.com',
      password: hashedPassword,
      role: adminRole,
      isEmailVerified: true,
    });

    await this.userRepo.save(admin);
    this.logger.log('Default admin account created');
  }

  async getAdminAnalyticsStats() {
    const totalUsers = await this.userRepo.count();
    const totalEnrollments = await this.enrollmentRepo.count();
    const approvedCourses = await this.courseRepo.count({
      where: { status: CourseStatus.APPROVED }
    });

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Completions current month
    const completionsCountThisMonth = await this.enrollmentRepo.createQueryBuilder('enrollment')
      .where('enrollment.completedAt >= :start AND enrollment.completedAt <= :end', { start: startOfCurrentMonth, end: endOfCurrentMonth })
      .andWhere('enrollment.status = :status', { status: EnrollmentStatus.COMPLETED })
      .getCount();

    // Stats Change calculations:
    // 1. Users change this month
    const usersCreatedThisMonth = await this.userRepo.createQueryBuilder('user')
      .where('user.createdAt >= :start AND user.createdAt <= :end', { start: startOfCurrentMonth, end: endOfCurrentMonth })
      .getCount();

    // 2. Enrollments change this month
    const enrollmentsThisMonth = await this.enrollmentRepo.createQueryBuilder('enrollment')
      .where('enrollment.enrolledAt >= :start AND enrollment.enrolledAt <= :end', { start: startOfCurrentMonth, end: endOfCurrentMonth })
      .getCount();

    // 3. Approved courses this month
    const approvedThisMonth = await this.courseRepo.createQueryBuilder('course')
      .where('course.createdAt >= :start AND course.createdAt <= :end', { start: startOfCurrentMonth, end: endOfCurrentMonth })
      .andWhere('course.status = :status', { status: CourseStatus.APPROVED })
      .getCount();

    // 4. Completions change
    const completionsCountPrevMonth = await this.enrollmentRepo.createQueryBuilder('enrollment')
      .where('enrollment.completedAt >= :start AND enrollment.completedAt <= :end', { start: startOfPrevMonth, end: endOfPrevMonth })
      .andWhere('enrollment.status = :status', { status: EnrollmentStatus.COMPLETED })
      .getCount();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activityData: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

      const usersCount = await this.userRepo.createQueryBuilder('user')
        .where('user.createdAt >= :start AND user.createdAt <= :end', { start: startOfMonth, end: endOfMonth })
        .getCount();

      const enrollmentsCount = await this.enrollmentRepo.createQueryBuilder('enrollment')
        .where('enrollment.enrolledAt >= :start AND enrollment.enrolledAt <= :end', { start: startOfMonth, end: endOfMonth })
        .getCount();

      const completionsCount = await this.enrollmentRepo.createQueryBuilder('enrollment')
        .where('enrollment.completedAt >= :start AND enrollment.completedAt <= :end', { start: startOfMonth, end: endOfMonth })
        .andWhere('enrollment.status = :status', { status: EnrollmentStatus.COMPLETED })
        .getCount();

      activityData.push({
        month: monthNames[month],
        users: usersCount,
        enrollments: enrollmentsCount,
        completions: completionsCount,
      });
    }

    // Top Courses
    const courses = await this.courseRepo.find({
      relations: ['enrollments'],
    });

    const topCoursesList = courses.map(c => {
      const enrollCount = c.enrollments?.length || 0;
      const completedCount = c.enrollments?.filter(e => e.status === EnrollmentStatus.COMPLETED).length || 0;
      const completionRate = enrollCount > 0 ? (completedCount / enrollCount) : 0;
      return {
        courseId: c.courseId,
        title: c.title,
        enrollmentCount: enrollCount,
        completionRate: completionRate,
      };
    });
    topCoursesList.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    const top5Courses = topCoursesList.slice(0, 5);

    return {
      stats: {
        totalUsers,
        totalUsersChange: `+${usersCreatedThisMonth}`,
        totalEnrollments,
        totalEnrollmentsChange: `+${enrollmentsThisMonth}`,
        approvedCourses,
        approvedCoursesChange: `+${approvedThisMonth}`,
        completionsThisMonth: completionsCountThisMonth,
        completionsChange: `+${completionsCountThisMonth - completionsCountPrevMonth >= 0 ? completionsCountThisMonth - completionsCountPrevMonth : 0}`,
      },
      activityData,
      topCourses: top5Courses,
    };
  }

  public async findAllLearners(): Promise<User[]> {
    return await this.userRepo.find({
      where: {
        role: {
          roleName: RoleEnum.LEARNER,
        },
      },
      relations: ['role', 'learner', 'learner.pvpWins', 'enrollments'],
    });
  }
}
