import { apiClient } from './client';

export interface DashboardSummary {
  averageRating: number;
  totalFeedbacksToday: number;
  totalFeedbacksThisWeek: number;
  totalFeedbacksThisMonth: number;
  responseRate: number;
  lastUpdated: string;
}

export interface ChartDataPoint {
  date: string;
  label?: string;
  count: number;
  averageRating: number;
}

export interface FeedbackChart {
  period: 'day' | 'week' | 'month';
  feedbackTrend: ChartDataPoint[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeColor: string;
  unlockedAt: string;
  progress: number;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await apiClient.get('/dashboard/summary');
  return data.data;
};

export const getFeedbackChart = async (period: 'day' | 'week' | 'month'): Promise<FeedbackChart> => {
  const { data } = await apiClient.get('/dashboard/feedback-chart', { params: { period } });
  return data.data;
};

export const getAchievements = async (): Promise<{ achievements: Achievement[] }> => {
  const { data } = await apiClient.get('/dashboard/achievements');
  return data.data;
};

export interface StartupData {
  summary: DashboardSummary;
  chart: FeedbackChart;
  achievements: { achievements: Achievement[] };
}

export const getStartupData = async (): Promise<StartupData> => {
  const { data } = await apiClient.get('/dashboard/startup');
  return data.data;
};
