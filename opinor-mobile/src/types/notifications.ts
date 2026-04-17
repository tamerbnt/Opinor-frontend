export type NotificationType = 'reminder' | 'urgent' | 'connected' | 'update' | 'feedback' | 'report';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isUnread: boolean;
  dateGroup: string; // 'Today', 'Yesterday', etc.
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'feedback',
    title: 'New Negative Feedback',
    description: 'A customer just left a 2-star rating for "Service Quality". Take action now.',
    timestamp: '14m ago',
    isUnread: true,
    dateGroup: 'Today',
  },
  {
    id: '2',
    type: 'report',
    title: 'Weekly Report Ready',
    description: 'Your analytics report for the last 7 days is now available for review.',
    timestamp: '1 hour ago',
    isUnread: true,
    dateGroup: 'Today',
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Subscription Reminder',
    description: 'Your pro plan expires in 3 days. Renew now to avoid service interruption.',
    timestamp: '5 hour ago',
    isUnread: false,
    dateGroup: 'Today',
  },
  {
    id: '4',
    type: 'feedback',
    title: 'New Positive Feedback',
    description: 'Great job! You received a 5-star rating with a comment: "Best coffee in town!"',
    timestamp: 'Yesterday',
    isUnread: false,
    dateGroup: 'Yesterday',
  },
  {
    id: '5',
    type: 'connected',
    title: 'Google Business Connected',
    description: 'Opinor is now successfully synced with your Google Business profile.',
    timestamp: 'Yesterday',
    isUnread: false,
    dateGroup: 'Yesterday',
  },
];
