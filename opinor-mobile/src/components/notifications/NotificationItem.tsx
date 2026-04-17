import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, LayoutAnimation } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { NotificationData } from '../../api/notifications';
import { Bell, AlertTriangle, User, Laptop, Info, MessageSquare, PieChart, Clock, TrendingDown, CheckCircle, Heart, Star, QrCode } from 'lucide-react-native';
import { AppText } from '../ui/AppText';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAsRead } from '../../api/notifications';

interface NotificationItemProps {
  notification: NotificationData;
  isDark?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, isDark }) => {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Group real backend payload types to our beautiful UI palette
  const getTypeConfig = (type: string) => {
    switch (type) {
      // 🔴 RED: Critical & Urgent
      case 'critical_negative_feedback':
      case 'critical_keywords':
      case 'low_satisfaction_score':
      case 'account_blocked':
        return { 
          bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', 
          iconColor: '#EF4444', 
          icon: AlertTriangle 
        };
      // 🟡 YELLOW: Warnings & Subscriptions
      case 'subscription_expiring':
      case 'trial_ending':
      case 'performance_drop':
        return { 
          bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7', 
          iconColor: '#F59E0B', 
          icon: Clock 
        };
      // 🟣 PURPLE: Analytics & Reports
      case 'report_ready':
      case 'weekly_summary':
      case 'insight_alert':
      case 'shift_performance':
        return { 
          bg: isDark ? 'rgba(124, 58, 237, 0.2)' : '#EDE9FE', 
          iconColor: '#7C3AED', 
          icon: PieChart 
        };
      // 🟢 TEAL/GREEN: Positive & Success
      case 'positive_feedback':
      case 'compliment':
      case 'performance_improvement':
      case 'payment_confirmed':
      case 'account_unblocked':
        return { 
          bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5', 
          iconColor: '#10B981', 
          icon: CheckCircle 
        };
      // 🔵 BLUE: System & Other
      case 'app_update':
      case 'system':
      case 'password_changed':
      case 'admin_reply':
        return { 
          bg: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE', 
          iconColor: '#3B82F6', 
          icon: Info 
        };
      case 'qr_first_scan':
      case 'qr_scan_milestone':
        return {
          bg: isDark ? 'rgba(3, 135, 136, 0.2)' : '#E0F2F1', 
          iconColor: '#038788', 
          icon: QrCode
        };
      default:
        return { 
          bg: isDark ? 'rgba(156, 163, 175, 0.2)' : '#F3F4F6', 
          iconColor: '#6B7280', 
          icon: Bell 
        };
    }
  };

  const { bg, iconColor, icon: Icon } = getTypeConfig(notification.type);

  // Optimistic Read Mutation
  const readMutation = useMutation({
    mutationFn: markAsRead,
    onMutate: async () => {
      // Deduct unread global badge instantly
      await queryClient.cancelQueries({ queryKey: ['unreadCount'] });
      const prevCount = queryClient.getQueryData<number>(['unreadCount']);
      if (prevCount && prevCount > 0) {
        queryClient.setQueryData(['unreadCount'], prevCount - 1);
      }
      return { prevCount };
    },
    onSettled: () => {
      // We don't invalidate the whole feed so we don't disrupt the user's reading position
      // but we invalidate the badge specifically
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);

    if (!notification.isRead) {
      // Fire mutation, manually adjust local object state quietly if we don't invalidate list
      notification.isRead = true; 
      readMutation.mutate(notification.id);
    }
  };

  // Convert raw ISO '2026-04-17T12:00:00.000Z' to '14:30' time for inside the row
  const formatTimeInfo = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.card, 
        { 
          backgroundColor: isDark ? '#2A2D31' : '#FFFFFF',
        }
      ]}
    >
      <View style={styles.contentRow}>
        {/* Left: Pastel Icon Circle */}
        <View style={styles.iconColumn}>
          <View style={[styles.iconCircle, { backgroundColor: bg }]}>
            <Icon color={iconColor} size={22} strokeWidth={2.5} />
          </View>
          {/* Subtle indicator dot if unread */}
          {!notification.isRead && (
            <View style={styles.unreadDot} />
          )}
        </View>

        {/* Center: Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <AppText 
              weight={notification.isRead ? 'semiBold' : 'bold'} 
              style={[styles.title, { color: notification.isRead ? colors.textSecondary : colors.text }]}
              numberOfLines={isExpanded ? undefined : 1}
            >
              {notification.title}
            </AppText>
            <AppText variant="caption" style={styles.timestamp}>
              {formatTimeInfo(notification.createdAt)}
            </AppText>
          </View>
          
          <AppText 
            variant="muted"
            style={[
              styles.description,
              { fontWeight: notification.isRead ? '400' : '500' }
            ]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {notification.body}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16, 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative'
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444', 
    position: 'absolute',
    top: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    flexShrink: 1,
    paddingRight: 10,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
