import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, User, Admin } from '../../database/entities';
import { NotificationType } from '../../database/entities/enums';

interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
}

// Critical keywords that trigger alerts (French)
const CRITICAL_KEYWORDS: string[] = [
  // Hygiene & Health
  'intoxication',
  'intoxiqué',
  'malade',
  'maladie',
  'vomi',
  'vomir',
  'diarrhée',
  'allergie',
  'allergique',
  'empoisonnement',
  'empoisonné',
  'infecté',
  'infection',
  'bactérie',
  'salmonelle',
  'hygiène',
  'insalubre',
  'moisi',
  'périmé',
  'pourri',
  'cheveux',
  'poil',
  'insecte',
  'cafard',
  'mouche',
  'rat',
  'souris',
  'vermine',

  // Cleanliness
  'sale',
  'saleté',
  'dégueulasse',
  'dégoûtant',
  'répugnant',
  'immonde',
  'crade',
  'crasseux',
  'puant',
  'odeur',
  'nauséabond',
  'toilettes sales',
  'wc sale',

  // Fraud & Theft
  'arnaque',
  'arnaqué',
  'escroquerie',
  'escroc',
  'voleur',
  'vol',
  'volé',
  'fraude',
  'frauduleux',
  'malhonnête',
  'tromperie',
  'trompé',
  'surfacturation',

  // Violence & Behavior
  'violence',
  'violent',
  'agression',
  'agressif',
  'insulte',
  'insulté',
  'menace',
  'menacé',
  'harcèlement',
  'harcelé',
  'racisme',
  'raciste',
  'discrimination',
  'discriminé',
  'sexisme',
  'sexiste',
  'irrespect',

  // Extreme dissatisfaction
  'scandaleux',
  'honteux',
  'inadmissible',
  'inacceptable',
  'catastrophe',
  'catastrophique',
  'horrible',
  'atroce',
  'pire',
  'cauchemar',
  'enfer',
  'jamais plus',
  'plus jamais',
  'à éviter',
  'fuyez',
  'danger',
  'dangereux',

  // Legal threats
  'avocat',
  'justice',
  'tribunal',
  'plainte',
  'porter plainte',
  'procès',
  'poursuite',
  'poursuivre',
  'juridique',
  'légal',
  'illégal',

  // Safety
  'brûlé',
  'brûlure',
  'blessé',
  'blessure',
  'accident',
  'chute',
  'glissade',
  'urgence',
  'hôpital',
  'médecin',
  'pompier',
  'ambulance',

  // Quality issues
  'froid',
  'pas cuit',
  'cru',
  'brûlé',
  'immangeable',
  'imbuvable',
  'avarié',
  'contaminé',
  'toxique',

  // Strong negative words
  'nul',
  'nullité',
  'zéro',
  'minable',
  'lamentable',
  'pitoyable',
  'incompétent',
  'incompétence',
  'honte',
  'ridicule',
  'pathétique',
  'médiocre',
  'exécrable',
  'infect',
  'ignoble',
  'abominable',

  // Refund & Complaints
  'remboursement',
  'rembourser',
  'remboursé',
  'réclamation',
  'litige',
  'dédomagement',
  'compensation',
];

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getNotifications(
    userId: string, 
    page = 1, 
    limit = 20, 
    sortDir: 'ASC' | 'DESC' = 'DESC', 
    isRead?: boolean
  ) {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where,
        order: { createdAt: sortDir },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          relatedId: n.relatedId,
          icon: this.getIconForType(n.type),
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);

    return {
      success: true,
      data: {
        id: notification.id,
        isRead: true,
        readAt: notification.readAt.toISOString(),
      },
      message: 'Notification marked as read',
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  async createNotification(userId: string, dto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      relatedId: dto.relatedId,
      icon: this.getIconForType(dto.type),
    });

    return this.notificationRepository.save(notification);
  }

  // Create multiple notifications at once
  async createBulkNotifications(
    notifications: Array<{ userId: string } & CreateNotificationDto>,
  ) {
    const entities = notifications.map((n) =>
      this.notificationRepository.create({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        relatedId: n.relatedId,
        icon: this.getIconForType(n.type),
      }),
    );

    return this.notificationRepository.save(entities);
  }

  // Helper methods for specific notification types
  async notifyCriticalFeedback(
    userId: string,
    feedbackId: string,
    rating: number,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.CRITICAL_NEGATIVE_FEEDBACK,
      title: '🔴 Alerte critique',
      message: `Vous avez reçu un avis ${rating}★. Une action rapide peut améliorer la situation.`,
      relatedId: feedbackId,
    });
  }

  async notifyPositiveFeedback(
    userId: string,
    feedbackId: string,
    rating: number,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.POSITIVE_FEEDBACK,
      title: '🟢 Nouvel avis positif',
      message: `Félicitations ! Vous avez reçu un avis ${rating}★.`,
      relatedId: feedbackId,
    });
  }

  async notifyNewFeedback(
    userId: string,
    feedbackId: string,
    rating: number,
    sentiment: string,
  ) {
    // Route to appropriate notification type based on rating
    if (rating <= 2) {
      return this.notifyCriticalFeedback(userId, feedbackId, rating);
    } else if (rating >= 4) {
      return this.notifyPositiveFeedback(userId, feedbackId, rating);
    } else {
      // Neutral feedback (3 stars)
      return this.createNotification(userId, {
        type: NotificationType.NEW_FEEDBACK,
        title: 'Nouveau feedback',
        message: `Vous avez reçu un avis ${rating}★.`,
        relatedId: feedbackId,
      });
    }
  }

  async notifySubscriptionExpiring(userId: string, daysLeft: number) {
    return this.createNotification(userId, {
      type: NotificationType.SUBSCRIPTION_EXPIRING,
      title: '🟡 Abonnement',
      message: `Votre abonnement Opinor expire dans ${daysLeft} jours.`,
    });
  }

  async notifyPaymentConfirmed(userId: string, planName: string) {
    return this.createNotification(userId, {
      type: NotificationType.PAYMENT_CONFIRMED,
      title: '🟡 Paiement confirmé',
      message: `Paiement confirmé – ${planName} activé.`,
    });
  }

  async notifyPerformanceDrop(
    userId: string,
    percentage: number,
    period: string,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.PERFORMANCE_DROP,
      title: '🟠 Performance en baisse',
      message: `Performance en baisse de ${percentage}% par rapport à ${period}.`,
    });
  }

  async notifyPerformanceImprovement(
    userId: string,
    percentage: number,
    reason?: string,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.PERFORMANCE_IMPROVEMENT,
      title: '🟠 Amélioration détectée',
      message: `Amélioration de +${percentage}%${reason ? ` après ${reason}` : ''}.`,
    });
  }

  async notifyQrFirstScan(userId: string) {
    return this.createNotification(userId, {
      type: NotificationType.QR_FIRST_SCAN,
      title: '⚪ Premier scan',
      message: 'Votre QR code Opinor a été scanné pour la première fois !',
    });
  }

  async notifyQrScanMilestone(userId: string, scanCount: number) {
    return this.createNotification(userId, {
      type: NotificationType.QR_SCAN_MILESTONE,
      title: '⚪ QR Code populaire',
      message: `Votre QR Opinor a été scanné ${scanCount} fois aujourd'hui !`,
    });
  }

  // Critical keywords detection and notification
  async notifyCriticalKeywords(
    userId: string,
    feedbackId: string,
    detectedKeywords: string[],
  ) {
    const keywordsList = detectedKeywords.slice(0, 3).join(', ');
    return this.createNotification(userId, {
      type: NotificationType.CRITICAL_KEYWORDS,
      title: '🔴 Mots-clés critiques détectés',
      message: `Un avis contient des termes sensibles: ${keywordsList}. Vérifiez rapidement.`,
      relatedId: feedbackId,
    });
  }

  // Check text for critical keywords and return matches
  detectCriticalKeywords(text: string): string[] {
    if (!text) return [];

    const normalizedText = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove accents for matching

    const detected: string[] = [];

    for (const keyword of CRITICAL_KEYWORDS) {
      const normalizedKeyword = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      // Use word boundary matching to avoid partial matches
      const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
      if (regex.test(normalizedText)) {
        detected.push(keyword);
      }
    }

    return detected;
  }

  // Check feedback and send appropriate notifications
  async checkAndNotifyFeedback(
    userId: string,
    feedbackId: string,
    rating: number,
    comment?: string,
  ) {
    const notifications: Promise<Notification>[] = [];

    // Check for critical keywords in comment
    if (comment) {
      const detectedKeywords = this.detectCriticalKeywords(comment);
      if (detectedKeywords.length > 0) {
        notifications.push(
          this.notifyCriticalKeywords(userId, feedbackId, detectedKeywords),
        );
      }
    }

    // Also send rating-based notification
    if (rating <= 2) {
      notifications.push(
        this.notifyCriticalFeedback(userId, feedbackId, rating),
      );
    } else if (rating >= 4) {
      notifications.push(
        this.notifyPositiveFeedback(userId, feedbackId, rating),
      );
    } else {
      notifications.push(
        this.createNotification(userId, {
          type: NotificationType.NEW_FEEDBACK,
          title: 'Nouveau feedback',
          message: `Vous avez reçu un avis ${rating}★.`,
          relatedId: feedbackId,
        }),
      );
    }

    return Promise.all(notifications);
  }

  // Notify about low satisfaction score
  async notifyLowSatisfactionScore(userId: string, score: number) {
    return this.createNotification(userId, {
      type: NotificationType.LOW_SATISFACTION_SCORE,
      title: '🔴 Score de satisfaction bas',
      message: `Votre score de satisfaction est tombé à ${score}%. Action recommandée.`,
    });
  }

  // Notify about compliment
  async notifyCompliment(
    userId: string,
    feedbackId: string,
    complimentType: string,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.COMPLIMENT,
      title: '🟢 Compliment reçu',
      message: `Un client a complimenté votre ${complimentType} !`,
      relatedId: feedbackId,
    });
  }

  // Notify about trial ending
  async notifyTrialEnding(userId: string, daysLeft: number) {
    return this.createNotification(userId, {
      type: NotificationType.TRIAL_ENDING,
      title: "🟡 Période d'essai",
      message: `Votre période d'essai se termine dans ${daysLeft} jours.`,
    });
  }

  // Notify account blocked
  async notifyAccountBlocked(userId: string, reason?: string) {
    return this.createNotification(userId, {
      type: NotificationType.ACCOUNT_BLOCKED,
      title: '🟡 Compte suspendu',
      message: reason
        ? `Votre compte a été suspendu: ${reason}`
        : 'Votre compte a été suspendu. Contactez le support.',
    });
  }

  // Notify account unblocked
  async notifyAccountUnblocked(userId: string) {
    return this.createNotification(userId, {
      type: NotificationType.ACCOUNT_UNBLOCKED,
      title: '🟡 Compte réactivé',
      message: 'Votre compte a été réactivé. Bienvenue à nouveau !',
    });
  }

  // Notify password changed (keep for user notification if needed)
  async notifyPasswordChanged(userId: string) {
    return this.createNotification(userId, {
      type: NotificationType.PASSWORD_CHANGED,
      title: '🟡 Mot de passe modifié',
      message:
        "Votre mot de passe a été modifié avec succès. Si ce n'était pas vous, contactez le support.",
    });
  }

  // Notify admins when a business owner changes password
  async notifyAdminPasswordChanged(userEmail: string, businessName: string) {
    // Log for admin dashboard/audit trail
    // Since admins don't have notifications in the same table,
    // we log this event. In production, you could:
    // 1. Send email to admins
    // 2. Store in separate admin_notifications table
    // 3. Use a webhook/external service
    console.log(
      `[ADMIN ALERT] Password changed for business: ${businessName} (${userEmail})`,
    );

    // For now, we return success - in production implement proper admin notification
    return { success: true, message: 'Admin notified' };
  }

  // Notify admin reply on feedback
  async notifyAdminReply(userId: string, feedbackId: string) {
    return this.createNotification(userId, {
      type: NotificationType.ADMIN_REPLY,
      title: "🟡 Réponse de l'admin",
      message: "L'administrateur a répondu à un de vos feedbacks.",
      relatedId: feedbackId,
    });
  }

  // Notify weekly summary ready
  async notifyWeeklySummary(
    userId: string,
    feedbackCount: number,
    avgRating: number,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.WEEKLY_SUMMARY,
      title: '🔵 Résumé hebdomadaire',
      message: `Cette semaine: ${feedbackCount} avis, moyenne ${avgRating.toFixed(1)}★.`,
    });
  }

  // Notify report ready
  async notifyReportReady(userId: string, reportType: string) {
    return this.createNotification(userId, {
      type: NotificationType.REPORT_READY,
      title: '🔵 Rapport disponible',
      message: `Votre ${reportType} est prêt à être consulté.`,
    });
  }

  // Notify insight alert
  async notifyInsight(userId: string, insightMessage: string) {
    return this.createNotification(userId, {
      type: NotificationType.INSIGHT_ALERT,
      title: '🔵 Nouvelle insight',
      message: insightMessage,
    });
  }

  // Notify app update
  async notifyAppUpdate(userId: string, version: string) {
    return this.createNotification(userId, {
      type: NotificationType.APP_UPDATE,
      title: '⚪ Mise à jour disponible',
      message: `La version ${version} d'Opinor est disponible.`,
    });
  }

  // Send notification to all active users
  async sendToAllUsers(
    dto: Omit<CreateNotificationDto, 'relatedId'>,
  ): Promise<number> {
    // Get all active, non-blocked users
    const users = await this.userRepository.find({
      where: { isActive: true, isBlocked: false },
      select: ['id'],
    });

    if (users.length === 0) {
      return 0;
    }

    // Create notifications for all users
    const notifications = users.map((user) =>
      this.notificationRepository.create({
        userId: user.id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        icon: this.getIconForType(dto.type),
      }),
    );

    await this.notificationRepository.save(notifications);
    return users.length;
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return {
      success: true,
      data: { unreadCount: count },
    };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);

    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  private getIconForType(type: NotificationType): string {
    const iconMap: Record<string, string> = {
      // Critical alerts
      [NotificationType.CRITICAL_NEGATIVE_FEEDBACK]: 'alert-circle',
      [NotificationType.CRITICAL_KEYWORDS]: 'warning',
      [NotificationType.LOW_SATISFACTION_SCORE]: 'trending-down',

      // Positive feedback
      [NotificationType.POSITIVE_FEEDBACK]: 'happy',
      [NotificationType.COMPLIMENT]: 'heart',

      // Admin & subscription
      [NotificationType.SUBSCRIPTION_EXPIRING]: 'time',
      [NotificationType.PAYMENT_CONFIRMED]: 'checkmark-circle',
      [NotificationType.TRIAL_ENDING]: 'hourglass',
      [NotificationType.ACCOUNT_BLOCKED]: 'lock-closed',
      [NotificationType.ACCOUNT_UNBLOCKED]: 'lock-open',
      [NotificationType.PASSWORD_CHANGED]: 'key',
      [NotificationType.ADMIN_REPLY]: 'chatbubble-ellipses',

      // Performance
      [NotificationType.PERFORMANCE_DROP]: 'trending-down',
      [NotificationType.PERFORMANCE_IMPROVEMENT]: 'trending-up',
      [NotificationType.SHIFT_PERFORMANCE]: 'analytics',

      // Insights & reports
      [NotificationType.REPORT_READY]: 'document-text',
      [NotificationType.WEEKLY_SUMMARY]: 'calendar',
      [NotificationType.INSIGHT_ALERT]: 'bulb',

      // System
      [NotificationType.QR_FIRST_SCAN]: 'qr-code',
      [NotificationType.QR_SCAN_MILESTONE]: 'qr-code',
      [NotificationType.APP_UPDATE]: 'download',
      [NotificationType.SYSTEM]: 'settings',

      // Legacy
      [NotificationType.NEW_FEEDBACK]: 'chatbubble',
      [NotificationType.ACHIEVEMENT_UNLOCKED]: 'trophy',
      [NotificationType.RATING_ALERT]: 'star',
    };
    return iconMap[type] || 'notifications';
  }
}
