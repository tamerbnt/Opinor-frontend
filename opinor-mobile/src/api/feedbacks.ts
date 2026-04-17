import { apiClient } from './client';

export interface FeedbackData {
  id: string;
  rating: number;
  text: string;
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category?: string;
  visitReason?: string;
  isFirstVisit?: boolean;
  willReturn?: boolean;
  tags: string[];
  images: string[];
  status: 'new' | 'viewed' | 'responded' | 'archived';
  location?: string;
  hasResponse: boolean;
  response?: {
    text: string;
    respondedAt: string;
  };
  adminReply?: {
    text: string;
    repliedAt: string;
  };
}

export interface GetFeedbacksParams {
  page?: number;
  limit?: number;
  rating?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  status?: 'new' | 'viewed' | 'responded' | 'archived';
  category?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface FeedbacksResponse {
  feedbacks: FeedbackData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Intercepts and formats date like "Oct 11, 14:30"
const formatFeedbackDate = (isoString: string): string => {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(d).replace(',', '');
};

export const getFeedbacks = async (
  params: GetFeedbacksParams = {}
): Promise<FeedbacksResponse> => {
  const { data } = await apiClient.get('/feedbacks', { params });
  
  // Format the dates right after fetch
  if (data?.data?.feedbacks) {
    data.data.feedbacks = data.data.feedbacks.map((f: FeedbackData) => ({
      ...f,
      date: formatFeedbackDate(f.date)
    }));
  }
  
  return data.data;
};

export const updateFeedbackStatus = async (
  id: string,
  status: 'new' | 'viewed' | 'responded' | 'archived'
): Promise<{ id: string; status: string }> => {
  const { data } = await apiClient.patch(`/feedbacks/${id}/status`, { status });
  return data.data;
};
