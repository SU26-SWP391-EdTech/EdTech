import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UpdateLearnerProfileDto } from './dto/update-learner-profile.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
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

  async editLearnerProfile(id: number, dto: UpdateLearnerProfileDto, file?: Express.Multer.File){
      const learnerProfile = await this.userRepository.findOne({
        where: {
          userId: id,
        }
      });

      if(!learnerProfile){
        throw new NotFoundException('User not found');
      }
      
      if (file) {
        const uploaded =
          await this.cloudinaryService.uploadFile(file);
  
        dto.avatarUrl = uploaded.secure_url;
      }

      Object.assign(learnerProfile, dto);
  
      return await this.userRepository.save(
        learnerProfile,
      );
  }

  async viewLearnerProfile(id: number): Promise<GetLearnerProfileDto> {
    const learner = await this.learnerRepository.findOne({
      where: { userId: id },
      relations: ['user'],
    });
  
    if (!learner || !learner.user) {
      throw new NotFoundException('Learner not exist');
    }
  
    return {
      fullName: learner.user.fullName,
      email: learner.user.email,
      avatarUrl: learner.user.avatar,
      learningGoal: learner.learningGoal,
      level: learner.level,
      bio: learner.bio,
      createdAt: learner.user.createdAt,
    };
  }
}
