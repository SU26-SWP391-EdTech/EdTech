import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateCourseProviderInfoDto } from "./dto/update-course-provider-info.dto";
import { UpdateCourseProviderProfileDto } from "./dto/update-course-provider-profile.dto";
import { GetCourseProviderProfileDto } from "./dto/get-course-provider-profile.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseProvider } from "./entities/course-provider-profile.entity";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Injectable()
export class CourseProviderService{

    constructor(
        @InjectRepository(CourseProvider)
        private cpRepository:Repository<CourseProvider>,
        @InjectRepository(User)
        private userRepository:Repository<User>,
        private cloudinaryService:CloudinaryService,
    ){}

    async updateProfile(id: number, dto: UpdateCourseProviderInfoDto){
        let courseProvider = await this.cpRepository.findOne({ where: { userId: id } });

    if (!courseProvider) {
        courseProvider = this.cpRepository.create({
            userId: id,
            
        });
    } else {
        Object.assign(courseProvider, {
            expertise: dto.expertise,
            experienceYears: dto.experienceYears,
        });
    }

    return this.cpRepository.save(courseProvider);
    }

    async editCourseProviderProfile(id:number, dto: UpdateCourseProviderProfileDto, file?: Express.Multer.File){
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

    async viewCourseProviderProfile(id:number, dto: GetCourseProviderProfileDto){
        const courseProvider = await this.cpRepository.findOne({
            where: { userId: id },
            relations: ['user'],
          });
        
          if (!courseProvider || !courseProvider.user) {
            throw new NotFoundException('Learner not exist');
          }
        
          return {
            fullName: courseProvider.user.fullName,
            email: courseProvider.user.email,
            avatarUrl: courseProvider.user.avatar,
            expertise: courseProvider.expertise,
            experienceYears: courseProvider.experienceYears,
            createdAt: courseProvider.user.createdAt,
          };
    }
}