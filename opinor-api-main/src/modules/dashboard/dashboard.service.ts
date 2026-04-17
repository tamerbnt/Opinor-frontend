import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Feedback, Achievement, User } from '../../database/entities';
import { FeedbackStatus, AchievementType } from '../../database/entities/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getSummary(userId: string) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get average rating
    const avgResult = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'averageRating')
      .where('feedback.businessId = :userId', { userId })
      .andWhere('feedback.isHidden = :isHidden', { isHidden: false })
      .getRawOne();

    // Get today's feedbacks
    const todayCount = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        isHidden: false,
        createdAt: MoreThanOrEqual(startOfToday),
      },
    });

    // Get this week's feedbacks
    const weekCount = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        isHidden: false,
        createdAt: MoreThanOrEqual(startOfWeek),
      },
    });

    // Get this month's feedbacks
    const monthCount = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        isHidden: false,
        createdAt: MoreThanOrEqual(startOfMonth),
      },
    });

    // Get response rate
    const totalCount = await this.feedbackRepository.count({
      where: { businessId: userId, isHidden: false },
    });
    const respondedCount = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        isHidden: false,
        status: FeedbackStatus.RESPONDED,
      },
    });
    const responseRate =
      totalCount > 0 ? (respondedCount / totalCount) * 100 : 0;

    return {
      success: true,
      data: {
        averageRating: parseFloat(avgResult.averageRating) || 0,
        totalFeedbacksToday: todayCount,
        totalFeedbacksThisWeek: weekCount,
        totalFeedbacksThisMonth: monthCount,
        responseRate: parseFloat(responseRate.toFixed(1)),
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  async getFeedbackChart(
    userId: string,
    period: 'day' | 'week' | 'month' = 'week',
  ) {
    const feedbackTrend: any[] = [];

    if (period === 'day') {
      // Support for 24 hours
      for (let i = 23; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i, 0, 0, 0);
        const startOfHour = new Date(date);
        const endOfHour = new Date(date);
        endOfHour.setMinutes(59, 59, 999);

        const result = await this.feedbackRepository
          .createQueryBuilder('feedback')
          .select('COUNT(*)', 'count')
          .addSelect('AVG(feedback.rating)', 'averageRating')
          .where('feedback.businessId = :userId', { userId })
          .andWhere('feedback.isHidden = :isHidden', { isHidden: false })
          .andWhere('feedback.createdAt BETWEEN :start AND :end', {
            start: startOfHour,
            end: endOfHour,
          })
          .getRawOne();

        feedbackTrend.push({
          date: startOfHour.toISOString(), // Full ISO for client-side local formatting
          label: `${startOfHour.getHours().toString().padStart(2, '0')}:00`,
          count: parseInt(result.count) || 0,
          averageRating: parseFloat(result.averageRating) || 0,
        });
      }
    } else {
      const days = period === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        );
        const endOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          23,
          59,
          59,
        );

        const result = await this.feedbackRepository
          .createQueryBuilder('feedback')
          .select('COUNT(*)', 'count')
          .addSelect('AVG(feedback.rating)', 'averageRating')
          .where('feedback.businessId = :userId', { userId })
          .andWhere('feedback.isHidden = :isHidden', { isHidden: false })
          .andWhere('feedback.createdAt BETWEEN :start AND :end', {
            start: startOfDay,
            end: endOfDay,
          })
          .getRawOne();

        feedbackTrend.push({
          date: startOfDay.toISOString().split('T')[0],
          count: parseInt(result.count) || 0,
          averageRating: parseFloat(result.averageRating) || 0,
        });
      }
    }

    return {
      success: true,
      data: {
        period,
        feedbackTrend,
      },
    };
  }

  async getAchievements(userId: string) {
    // Get unlocked achievements
    let achievements = await this.achievementRepository.find({
      where: { userId, isUnlocked: true },
      order: { unlockedAt: 'DESC' },
      take: 5,
    });

    // If no achievements, create default ones
    if (achievements.length === 0) {
      await this.initializeAchievements(userId);
      achievements = await this.achievementRepository.find({
        where: { userId, isUnlocked: true },
        order: { unlockedAt: 'DESC' },
        take: 5,
      });
    }

    return {
      success: true,
      data: {
        achievements: achievements.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon,
          badgeColor: a.badgeColor,
          unlockedAt: a.unlockedAt?.toISOString(),
          progress: a.progress,
        })),
      },
    };
  }

  async initializeAchievements(userId: string) {
    const defaultAchievements = [
      {
        userId,
        type: AchievementType.FEEDBACK_COUNT,
        title: 'Rising Star',
        description: 'Received 100 feedbacks this month',
        icon: 'star',
        badgeColor: '#FFD700',
        targetValue: 100,
      },
      {
        userId,
        type: AchievementType.RATING_STREAK,
        title: 'Excellent Rating',
        description: 'Maintained 4.5+ rating for 7 days',
        icon: 'medal',
        badgeColor: '#87CEEB',
        targetValue: 7,
      },
      {
        userId,
        type: AchievementType.RESPONSE_STREAK,
        title: 'Consistency King',
        description: 'Responded to feedbacks 10 days in a row',
        icon: 'fire',
        badgeColor: '#FF6347',
        targetValue: 10,
      },
      {
        userId,
        type: AchievementType.FIRST_FEEDBACK,
        title: 'First Steps',
        description: 'Received your first feedback',
        icon: 'rocket',
        badgeColor: '#9370DB',
        targetValue: 1,
      },
    ];

    for (const achievement of defaultAchievements) {
      const existing = await this.achievementRepository.findOne({
        where: { userId, type: achievement.type },
      });

      if (!existing) {
        await this.achievementRepository.save(achievement);
      }
    }
  }

  async checkAndUpdateAchievements(userId: string) {
    // Get user's feedback count this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyFeedbackCount = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        createdAt: MoreThanOrEqual(startOfMonth),
      },
    });

    // Update Rising Star achievement
    const risingStar = await this.achievementRepository.findOne({
      where: { userId, type: AchievementType.FEEDBACK_COUNT },
    });

    if (risingStar) {
      risingStar.progress = Math.min(
        monthlyFeedbackCount,
        risingStar.targetValue,
      );
      if (
        monthlyFeedbackCount >= risingStar.targetValue &&
        !risingStar.isUnlocked
      ) {
        risingStar.isUnlocked = true;
        risingStar.unlockedAt = new Date();
      }
      await this.achievementRepository.save(risingStar);
    }

    // Check first feedback achievement
    const totalFeedbacks = await this.feedbackRepository.count({
      where: { businessId: userId },
    });

    const firstFeedback = await this.achievementRepository.findOne({
      where: { userId, type: AchievementType.FIRST_FEEDBACK },
    });

    if (firstFeedback && totalFeedbacks >= 1 && !firstFeedback.isUnlocked) {
      firstFeedback.progress = 100;
      firstFeedback.isUnlocked = true;
      firstFeedback.unlockedAt = new Date();
      await this.achievementRepository.save(firstFeedback);
    }
  }

  async getStartupData(userId: string) {
    const defaultPeriod = 'week';
    const [summaryResult, chartResult, achievementsResult] = await Promise.all([
      this.getSummary(userId),
      this.getFeedbackChart(userId, defaultPeriod),
      this.getAchievements(userId)
    ]);

    return {
      success: true,
      data: {
        summary: summaryResult.data,
        chart: chartResult.data,
        achievements: achievementsResult.data
      }
    };
  }
}
