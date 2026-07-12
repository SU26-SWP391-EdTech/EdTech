import { Injectable, NotFoundException } from "@nestjs/common";
import { LeaderboardRepository } from "./leaderboard.repository";
import { CreateLeaderboardRuleDto } from "./dto/create-leaderboard-rule.dto";
import { CoursesService } from "../courses/services/courses.service";
import { AssessmentSessionService } from "../assessment/service/assessment-session.service";
import { LeaderboardRule } from "./entities/leaderboard-rule.entity";
import { UpdateLeaderboardRuleDto } from "./dto/update-leaderboard-rule.dto";
import { EnrollmentsService } from "../enrollments/enrollments.service";

@Injectable()
export class LeaderboardService{
    constructor(
        private readonly leaderboardRepo: LeaderboardRepository,
        private readonly coursesService: CoursesService,
        private readonly assessmentSessionService: AssessmentSessionService,
        private readonly enrollmentsService: EnrollmentsService,
    ){}

    async createLeaderboardRule(
        courseId: number,
        dto: CreateLeaderboardRuleDto,
    ) {
        const course = await this.coursesService.findCourseByIdService(courseId);
    
        const rule = this.leaderboardRepo.create({
            course,
            scoreWeight: dto.scoreWeight,
            timeWeight: dto.timeWeight,
            attemptWeight: dto.attemptWeight,
        });
    
        return await this.leaderboardRepo.save(rule);
    }

    async calculate(courseId: number, userId: number): Promise<number> {
        const rule = await this.leaderboardRepo.findByCourseId(courseId);
    
        if (!rule) {
            throw new NotFoundException('Leaderboard rule not found');
        }
    
        const sessions = await this.assessmentSessionService.findByCourseAndUser(courseId, userId);
    
        let score = 0;
        let time = 0;
        let attempt = 0;
    
        for (const session of sessions) {
            score += session.score;
    
            if (session.startedAt && session.completedAt) {
                time +=
                    (session.completedAt.getTime() -
                        session.startedAt.getTime()) / 1000;
            }
    
            attempt++;
        }
    
        return (
            Number(rule.scoreWeight) * score -
            Number(rule.timeWeight) * time -
            Number(rule.attemptWeight) * attempt
        );
    }

    public async getLeaderboardRule(
        courseId: number,
      ): Promise<LeaderboardRule> {
        const rule = await this.leaderboardRepo.findByCourseId(courseId);
      
        if (!rule) {
          throw new NotFoundException(
            `Leaderboard rule not found for course ${courseId}`,
          );
        }
      
        return rule;
      }

      public async updateLeaderboardRule(
        courseId: number,
        dto: UpdateLeaderboardRuleDto,
      ): Promise<LeaderboardRule> {
        const rule = await this.leaderboardRepo.findByCourseId(courseId);
      
        if (!rule) {
          throw new NotFoundException(
            `Leaderboard rule not found for course ${courseId}`,
          );
        }
      
        if (dto.scoreWeight !== undefined) {
          rule.scoreWeight = Number(dto.scoreWeight) / 100;
        }
      
        if (dto.timeWeight !== undefined) {
          rule.timeWeight = Number(dto.timeWeight) / 100;
        }
      
        if (dto.attemptWeight !== undefined) {
          rule.attemptWeight = Number(dto.attemptWeight) / 100;
        }
      
        return await this.leaderboardRepo.updateRule(rule);
      }

      public async calculateOverall(userId: number): Promise<number> {
        const enrollments = await this.enrollmentsService.findEnrollmentByUserId(userId);
    
        let totalPoint = 0;
    
        for (const enrollment of enrollments) {
            totalPoint += await this.calculate(
                enrollment.course.courseId,
                userId,
            );
        }
    
        return totalPoint;
    }
}