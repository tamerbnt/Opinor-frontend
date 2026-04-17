import { apiClient } from './client';

export type ReportPeriod = 'today' | 'week' | 'month';

export interface ReportStatistics {
  totalFeedbacks: number;
  negativeCount: number;
  positiveCount: number;
  neutralCount: number;
  averageRating: number;
  ratingOutOf5: string;
  trend: string;
  issue: string;
  issuePercent: number;
  activity?: number[];
  activityLabels?: string[];
}

export interface RatingsDistributionParam {
  ratingScore: number;
  count: number;
  percentage: number;
}

export interface ReportHistoryItem {
  id: string;
  date: string;       // e.g., "August 2024"
  location: string;
  feedbackCount: number;
  averageRating: number;
  generatedAt: string;
  reportUrl: string;
}

export interface ReportHistoryResponse {
  reports: ReportHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getReportStatistics = async (
  period: ReportPeriod
): Promise<ReportStatistics> => {
  const { data } = await apiClient.get('/reports/statistics', {
    params: { period },
  });
  return data.data.statistics;
};

export const getRatingsDistribution = async (
  period: ReportPeriod
): Promise<RatingsDistributionParam[]> => {
  const { data } = await apiClient.get('/reports/ratings-distribution', {
    params: { period },
  });
  return data.data.ratingDistribution;
};

export const getReportsHistory = async (
  page: number = 1,
  limit: number = 10
): Promise<ReportHistoryResponse> => {
  const { data } = await apiClient.get('/reports/history', {
    params: { page, limit },
  });
  return data.data;
};
