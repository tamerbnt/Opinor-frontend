import { apiClient } from './client';

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;        // Backend sends 'body', NOT 'message'
  isRead: boolean;
  data?: {             // Backend embeds related IDs here, e.g. { feedbackId: 'uuid' }
    feedbackId?: string;
  };
  createdAt: string;
  // Note: 'icon' is NOT in the backend response.
  // Icon is resolved client-side in NotificationItem.tsx based on 'type'.
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  sortDir?: 'ASC' | 'DESC';
  isRead?: boolean;
}

export interface NotificationsResponse {
  notifications: NotificationData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getNotifications = async (
  params: GetNotificationsParams = {}
): Promise<NotificationsResponse> => {
  const { data } = await apiClient.get('/notifications', { params });
  return data.data; // NestJS usually wraps with success, data
};

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await apiClient.get('/notifications/unread-count');
  return data.data.unreadCount;
};

export const markAsRead = async (id: string): Promise<{ id: string; isRead: boolean }> => {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data.data;
};

export const markAllAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};
