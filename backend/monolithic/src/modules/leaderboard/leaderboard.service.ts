import { Injectable, NotFoundException } from "@nestjs/common";
import { LeaderboardRepository } from "./leaderboard.repository";
import { CreateLeaderboardRuleDto } from "./dto/create-leaderboard-rule.dto";
import { CoursesService } from "../courses/services/courses.service";
import { AssessmentSessionService } from "../assessment/service/assessment-session.service";
import { LeaderboardRule } from "./entities/leaderboard-rule.entity";
import { UpdateLeaderboardRuleDto } from "./dto/update-leaderboard-rule.dto";
import { EnrollmentsService } from "../enrollments/enrollments.service";
import { LeaderboardResponse } from "./dto/leaderboard-response.dto";
import { UsersService } from "../users/users.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Learner } from "../learners/entities/learner.entity";

@Injectable()
export class LeaderboardService {
    constructor(
        private readonly leaderboardRepo: LeaderboardRepository,
        private readonly coursesService: CoursesService,
        private readonly assessmentSessionService: AssessmentSessionService,
        private readonly enrollmentsService: EnrollmentsService,
        private readonly usersService: UsersService,
        @InjectRepository(Learner)
        private readonly learnerRepo: Repository<Learner>,
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
            score += Number(session.score);

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

    public async calculateCourseStats(
      courseId: number,
      userId: number,
      learnerProfile?: any,
    ): Promise<{
      score: number;
      time: number;
      attempt: number;
      pvp: number;
      total: number;
    }> {
      const rule = await this.leaderboardRepo.findByCourseId(courseId);
      
      const scoreWeight = rule ? Number(rule.scoreWeight) : 0.4;
      const timeWeight = rule ? Number(rule.timeWeight) : 0.2;
      const attemptWeight = rule ? Number(rule.attemptWeight) : 0.1;

      const sessions = await this.assessmentSessionService.findByCourseAndUser(courseId, userId);
      
      let scoreSum = 0;
      let timeSumSeconds = 0;
      let attemptCount = 0;

      for (const session of sessions) {
        scoreSum += Number(session.score);
        if (session.startedAt && session.completedAt) {
          timeSumSeconds += (session.completedAt.getTime() - session.startedAt.getTime()) / 1000;
        }
        attemptCount++;
      }

      const timeMinutes = Math.round(timeSumSeconds / 60);
      const pvpWinsCount = learnerProfile?.pvpWins?.length || 0;
      const pvpPoints = pvpWinsCount * 5;

      const totalPoint = (
        scoreWeight * scoreSum -
        timeWeight * timeSumSeconds -
        attemptWeight * attemptCount +
        pvpPoints
      );

      return {
        score: scoreSum,
        time: timeMinutes,
        attempt: attemptCount,
        pvp: pvpPoints,
        total: Math.max(0, Math.round(totalPoint)),
      };
    }

    public async calculateOverallStats(user: any): Promise<{
      score: number;
      time: number;
      attempt: number;
      pvp: number;
      coursesCompleted: number;
      totalPoint: number;
    }> {
      const enrollments = await this.enrollmentsService.findEnrollmentByUserId(user.userId);
      
      let score = 0;
      let time = 0;
      let attempt = 0;
      let totalPoint = 0;
      let coursesCompleted = 0;

      for (const enrollment of enrollments) {
        try {
          const stats = await this.calculateCourseStats(
            enrollment.course.courseId,
            user.userId,
            user.learner
          );
          score += stats.score;
          time += stats.time;
          attempt += stats.attempt;
          totalPoint += stats.total;
        } catch (err) {
          if (err instanceof NotFoundException) {
            continue;
          }
          throw err;
        }

        if (enrollment.status === 'completed' || enrollment.progress === 100) {
          coursesCompleted++;
        }
      }

      const pvpWinsCount = user.learner?.pvpWins?.length || 0;
      const pvpPoints = pvpWinsCount * 5;

      return {
        score,
        time,
        attempt,
        pvp: pvpPoints,
        coursesCompleted,
        totalPoint,
      };
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
            try {
                totalPoint += await this.calculate(
                    enrollment.course.courseId,
                    userId,
                );
            } catch (err) {
                if (err instanceof NotFoundException) {
                    continue;
                }
                throw err;
            }
        }
    
        return totalPoint;
    }

    public async getLeaderboard(): Promise<LeaderboardResponse[]> {
      const learners = await this.usersService.findAllLearners();
    
      const leaderboard: LeaderboardResponse[] = [];
    
      for (const learner of learners) {
        const stats = await this.calculateOverallStats(learner);
    
        leaderboard.push({
          rank: 0,
          userId: learner.userId,
          fullName: learner.fullName,
          avatar: learner.avatar || null,
          score: stats.score,
          time: stats.time,
          attempt: stats.attempt,
          pvp: stats.pvp,
          coursesCompleted: stats.coursesCompleted,
          totalPoint: stats.totalPoint,
        });
      }
    
      leaderboard.sort((a, b) => b.totalPoint - a.totalPoint);
    
      leaderboard.forEach((item, index) => {
        item.rank = index + 1;
      });
    
      return leaderboard;
    }

    public async getCourseLeaderboard(courseId: number): Promise<LeaderboardResponse[]> {
      const enrollments = await this.enrollmentsService.findEnrollmentsByCourseId(courseId);
      const leaderboard: LeaderboardResponse[] = [];

      for (const enrollment of enrollments) {
        const user = enrollment.user;
        let learnerProfile: Learner | null = null;
        try {
          learnerProfile = await this.learnerRepo.findOne({
            where: { userId: user.userId },
            relations: ['pvpWins'],
          });
        } catch (err) {
          // ignore
        }

        const stats = await this.calculateCourseStats(courseId, user.userId, learnerProfile);

        leaderboard.push({
          rank: 0,
          userId: user.userId,
          fullName: user.fullName,
          avatar: user.avatar || null,
          score: stats.score,
          time: stats.time,
          attempt: stats.attempt,
          pvp: stats.pvp,
          totalPoint: stats.total,
        });
      }

      leaderboard.sort((a, b) => b.totalPoint - a.totalPoint);

      leaderboard.forEach((item, index) => {
        item.rank = index + 1;
      });

      return leaderboard;
    }
}