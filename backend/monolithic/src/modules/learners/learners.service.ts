import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { EditLearnerProfileDto } from './dto/edit-learner-profile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Learner } from './entities/learner.entity';
import { GetLearnerProfileDto } from './dto/get-learner-profile.dto';
import { UpdateLearnerInfoDto } from './dto/update-learner-info.dto';

@Injectable()
export class LearnersService {
  constructor(
    @InjectRepository(User)
    private userRepository:Repository<User>,
    @InjectRepository(Learner)
    private learnerRepository:Repository<Learner>,
    private cloudinaryService:CloudinaryService,
  ){}

  async updateProfile(id: number, dto: UpdateLearnerInfoDto) {
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

  async editLearnerProfile(id: number, dto: EditLearnerProfileDto, file?: Express.Multer.File){
      const user = await this.userRepository.findOne({
        where: {
          userId: id,
        }
      });

      if(!user){
        throw new NotFoundException('User not found');
      }
      
      if (file) {
        const uploaded =
          await this.cloudinaryService.uploadImage(file);
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
  
    if (learner && learner.user) {
      return {
        fullName: learner.user.fullName,
        email: learner.user.email,
        avatarUrl: learner.user.avatar,
        learningGoal: learner.learningGoal || '',
        level: learner.level || '',
        bio: learner.bio || '',
        createdAt: learner.user.createdAt,
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
    };
  }
}
