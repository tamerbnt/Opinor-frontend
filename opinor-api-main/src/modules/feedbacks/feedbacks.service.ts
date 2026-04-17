import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import {
  Feedback,
  User,
  FeedbackSentiment,
  FeedbackStatus,
} from '../../database/entities';
import { CreateFeedbackDto, FeedbackQueryDto } from './dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    businessCode: string,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    // Find business by unique code
    const business = await this.usersService.findByUniqueCode(businessCode);
    if (!business || !business.isActive) {
      throw new NotFoundException('Business not found or inactive');
    }

    // Check rate limiting
    // TODO: Implement alternative rate limiting (e.g. device fingerprint or cookie-based) if needed for anonymous feedback

    // Determine sentiment based on rating
    const rating = createFeedbackDto.rating;
    let sentiment: FeedbackSentiment;
    if (rating >= 4) {
      sentiment = FeedbackSentiment.POSITIVE;
    } else if (rating <= 2) {
      sentiment = FeedbackSentiment.NEGATIVE;
    } else {
      sentiment = FeedbackSentiment.NEUTRAL;
    }

    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      businessId: business.id,
      sentiment,
      status: FeedbackStatus.NEW,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Create notification for the business owner (includes critical keywords detection)
    await this.notificationsService.checkAndNotifyFeedback(
      business.id,
      savedFeedback.id,
      rating,
      createFeedbackDto.comment,
    );

    return savedFeedback;
  }

  async findAllForBusiness(businessId: string, queryDto: FeedbackQueryDto) {
    const {
      page = 1,
      limit = 20,
      rating,
      sentiment,
      status,
      category,
      sortDir = 'DESC',
    } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { businessId, isHidden: false, deletedAt: IsNull() };
    if (rating) where.rating = rating;
    if (sentiment) where.sentiment = sentiment;
    if (status) where.status = status;
    if (category) where.category = category;

    const [feedbacks, total] = await this.feedbackRepository.findAndCount({
      where,
      order: { createdAt: sortDir },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: {
        feedbacks: feedbacks.map((f) => this.formatFeedback(f)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findById(id: string, businessId: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id, businessId, deletedAt: IsNull() },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async findByIdFormatted(id: string, businessId: string) {
    const feedback = await this.findById(id, businessId);

    // Mark as viewed if new
    if (feedback.status === FeedbackStatus.NEW) {
      feedback.status = FeedbackStatus.VIEWED;
      await this.feedbackRepository.save(feedback);
    }

    return {
      success: true,
      data: {
        ...this.formatFeedback(feedback),
        helpful: feedback.helpful,
        unhelpful: feedback.unhelpful,
      },
    };
  }

  async respondToFeedback(
    id: string,
    businessId: string,
    responseText: string,
  ) {
    const feedback = await this.findById(id, businessId);

    feedback.responseText = responseText;
    feedback.respondedAt = new Date();
    feedback.respondedBy = businessId;
    feedback.status = FeedbackStatus.RESPONDED;

    await this.feedbackRepository.save(feedback);

    return {
      success: true,
      data: {
        id: `response_${feedback.id}`,
        feedbackId: feedback.id,
        text: responseText,
        respondedAt: feedback.respondedAt.toISOString(),
        respondedBy: businessId,
      },
      message: 'Response submitted successfully',
    };
  }

  async updateStatus(id: string, businessId: string, status: string) {
    const feedback = await this.findById(id, businessId);
    feedback.status = status as FeedbackStatus;
    await this.feedbackRepository.save(feedback);

    return {
      success: true,
      data: { id: feedback.id, status: feedback.status },
      message: 'Status updated successfully',
    };
  }

  private formatFeedback(feedback: Feedback) {
    return {
      id: feedback.id,
      rating: feedback.rating,
      text: feedback.comment,
      date: feedback.createdAt.toISOString(),
      sentiment: feedback.sentiment,
      category: feedback.category,
      visitReason: feedback.visitReason,
      isFirstVisit: feedback.isFirstVisit,
      willReturn: feedback.willReturn,
      tags: feedback.tags || [],
      images: feedback.images || [],
      status: feedback.status,
      location: feedback.location,
      hasResponse: !!feedback.responseText,
      ...(feedback.responseText && {
        response: {
          text: feedback.responseText,
          respondedAt: feedback.respondedAt?.toISOString(),
        },
      }),
      // Admin reply (read-only for business owner)
      ...(feedback.adminReply && {
        adminReply: {
          text: feedback.adminReply,
          repliedAt: feedback.adminReplyAt?.toISOString(),
        },
      }),
    };
  }

  async getPublicStats(businessCode: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    const business = await this.usersService.findByUniqueCode(businessCode);
    if (!business || !business.isActive) {
      throw new NotFoundException('Business not found or inactive');
    }

    const stats = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'averageRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .where('feedback.business_id = :businessId', { businessId: business.id })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .getRawOne();

    // Get rating distribution
    const distribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('ROUND(feedback.rating)', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.business_id = :businessId', { businessId: business.id })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .groupBy('ROUND(feedback.rating)')
      .getRawMany();

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    distribution.forEach((item) => {
      const ratingKey = Math.round(parseFloat(item.rating));
      if (ratingKey >= 1 && ratingKey <= 5) {
        ratingDistribution[ratingKey] = parseInt(item.count, 10);
      }
    });

    return {
      averageRating: parseFloat(stats.averageRating) || 0,
      totalReviews: parseInt(stats.totalReviews, 10) || 0,
      ratingDistribution,
    };
  }

  async getStatsForBusiness(businessId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    recentTrend: { date: string; count: number; avgRating: number }[];
  }> {
    const stats = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'averageRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .where('feedback.business_id = :businessId', { businessId })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .getRawOne();

    // Get rating distribution
    const distribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('ROUND(feedback.rating)', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.business_id = :businessId', { businessId })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .groupBy('ROUND(feedback.rating)')
      .getRawMany();

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    distribution.forEach((item) => {
      const ratingKey = Math.round(parseFloat(item.rating));
      if (ratingKey >= 1 && ratingKey <= 5) {
        ratingDistribution[ratingKey] = parseInt(item.count, 10);
      }
    });

    // Get recent trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trend = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('DATE(feedback.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(feedback.rating)', 'avgRating')
      .where('feedback.business_id = :businessId', { businessId })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .andWhere('feedback.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(feedback.created_at)')
      .orderBy('DATE(feedback.created_at)', 'ASC')
      .getRawMany();

    const recentTrend = trend.map((item) => ({
      date: item.date,
      count: parseInt(item.count, 10),
      avgRating: parseFloat(item.avgRating),
    }));

    return {
      averageRating: parseFloat(stats.averageRating) || 0,
      totalReviews: parseInt(stats.totalReviews, 10) || 0,
      ratingDistribution,
      recentTrend,
    };
  }

  async hideFeedback(id: string, businessId: string): Promise<Feedback> {
    const feedback = await this.findById(id, businessId);
    feedback.isHidden = true;
    return this.feedbackRepository.save(feedback);
  }

  async unhideFeedback(id: string, businessId: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id, businessId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.isHidden = false;
    return this.feedbackRepository.save(feedback);
  }
}
