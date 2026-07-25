import { BadRequestException, Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { EditLearnerProfileDto } from '../dto/edit-learner-profile.dto';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Learner } from '../entities/learner.entity';
import { GetLearnerProfileDto } from '../dto/get-learner-profile.dto';
import { UpdateLearnerInfoDto } from '../dto/update-learner-info.dto';
import { LearnerRepository } from '../learners.repository';
import { PvpStatus } from 'src/common/enums/pvp-status.enum';
import { LearnerLessonProgress } from 'src/modules/progress/entities/learner-lesson-progress.entity';
import { LessonProgressStatus } from 'src/common/enums/lesson-progress-status.enum';
import { AssessmentSession } from 'src/modules/assessment/entities/assessment-session.entity';

@Injectable()
export class LearnersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Learner)
    private learnerRepository: Repository<Learner>,
    private cloudinaryService: CloudinaryService,

    private learnerRepo: LearnerRepository
  ) { }

  async updateProfile(id: number, userId: number, dto: UpdateLearnerInfoDto) {

    if (userId !== id) {
      throw new BadRequestException("You can't update another learner profile")
    }

    let learner = await this.learnerRepository.findOne({ where: { userId: id } });

    if (!learner) {
      learner = this.learnerRepository.create({
        userId: id,
        learningGoal: dto.learningGoal,
        level: dto.level,
        bio: dto.bio,
      });
    } else {
      Object.assign(learner, {
        learningGoal: dto.learningGoal,
        level: dto.level,
        bio: dto.bio,
      });
    }

    return this.learnerRepository.save(learner);
  }

  async editLearnerProfile(id: number, dto: EditLearnerProfileDto, userId: number, file?: Express.Multer.File) {
    if (userId !== id) {
      throw new BadRequestException("You can't update another learner profile");
    }

    const user = await this.userRepository.findOne({
      where: {
        userId: id,
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      user.avatar = uploaded.secure_url;
    } else if (dto.avatarUrl) {
      user.avatar = dto.avatarUrl;
    }

    if (dto.fullName) {
      user.fullName = dto.fullName;
    }

    await this.userRepository.save(user);

    // Save learner profile details
    let learner = await this.learnerRepository.findOne({ where: { userId: id } });
    if (!learner) {
      learner = this.learnerRepository.create({
        userId: id,
      });
    }

    if (dto.learningGoal !== undefined) {
      learner.learningGoal = dto.learningGoal;
    }
    if (dto.level !== undefined) {
      learner.level = dto.level;
    }
    if (dto.bio !== undefined) {
      learner.bio = dto.bio;
    }

    const savedLearner = await this.learnerRepository.save(learner);

    return {
      fullName: user.fullName,
      avatarUrl: user.avatar,
      learningGoal: savedLearner.learningGoal,
      level: savedLearner.level,
      bio: savedLearner.bio,
    };
  }

  async viewLearnerProfile(id: number): Promise<GetLearnerProfileDto> {
    const learner = await this.learnerRepository.findOne({
      where: { userId: id },
      relations: ['user'],
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progressList = await this.learnerRepository.manager
      .getRepository(LearnerLessonProgress)
      .find({
        where: {
          userId: id,
          status: LessonProgressStatus.COMPLETED,
          completedAt: MoreThanOrEqual(thirtyDaysAgo),
        },
        select: ['completedAt'],
      });

    const assessmentSessions = await this.learnerRepository.manager
      .getRepository(AssessmentSession)
      .find({
        where: {
          userId: id,
          completedAt: MoreThanOrEqual(thirtyDaysAgo),
        },
        select: ['completedAt'],
      });

    const activeDates = new Set<string>();
    const toLocalYYYYMMDD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    for (const p of progressList) {
      if (p.completedAt) {
        activeDates.add(toLocalYYYYMMDD(p.completedAt));
      }
    }
    for (const s of assessmentSessions) {
      if (s.completedAt) {
        activeDates.add(toLocalYYYYMMDD(s.completedAt));
      }
    }
    const sortedActiveDates = Array.from(activeDates).sort();

    if (learner && learner.user) {
      return {
        fullName: learner.user.fullName,
        email: learner.user.email,
        avatarUrl: learner.user.avatar,
        learningGoal: learner.learningGoal || '',
        level: learner.level || '',
        bio: learner.bio || '',
        createdAt: learner.user.createdAt,
        currentStreak: learner.currentStreak || 0,
        longestStreak: learner.longestStreak || 0,
        streakLife: learner.streakLife !== undefined ? learner.streakLife : 1,
        activeDates: sortedActiveDates,
      };
    }

    // Fallback if learner profile record doesn't exist yet
    const user = await this.userRepository.findOne({ where: { userId: id } });
    if (!user) {
      throw new NotFoundException('User not exist');
    }

    return {
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatar,
      learningGoal: '',
      level: '',
      bio: '',
      createdAt: user.createdAt,
      currentStreak: 0,
      longestStreak: 0,
      streakLife: 1,
      activeDates: sortedActiveDates,
    };
  }

  public async getLearnerProfileById(userId: number): Promise<Learner> {
    let learner = await this.learnerRepo.findLeanerById(userId);
    if (!learner) {
      const user = await this.userRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException("Can not find user by ID " + userId);
      }
      try {
        learner = this.learnerRepository.create({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          streakLife: 1,
          pvpStatus: PvpStatus.IDLE,
        });
        learner = await this.learnerRepository.save(learner);
      } catch (err) {
        // Race condition fallback: retrieve profile created concurrently by another request
        learner = await this.learnerRepo.findLeanerById(userId);
        if (!learner) {
          throw err;
        }
      }
    }
    return learner;
  }
}
