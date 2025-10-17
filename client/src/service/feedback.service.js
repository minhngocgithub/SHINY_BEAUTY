import axiosApiInstance from "../../utils/api";
const BASE_FEEDBACK_API = '/feedback';

export const createFeedbackApi = async (feedbackData) => {
  return await axiosApiInstance.post(`${BASE_FEEDBACK_API}`, feedbackData);
};

export const getMyFeedbacksApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_FEEDBACK_API}/me`, { params });
};

export const getAllFeedbacksApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_FEEDBACK_API}`, { params });
};

export const getFeedbackByIdApi = async (feedbackId) => {
  return await axiosApiInstance.get(`${BASE_FEEDBACK_API}/${feedbackId}`);
};

export const replyToFeedbackApi = async (feedbackId, message) => {
  return await axiosApiInstance.post(`${BASE_FEEDBACK_API}/${feedbackId}/replies`, { message });
};

export const updateFeedbackStatusApi = async (feedbackId, status) => {
  return await axiosApiInstance.patch(`${BASE_FEEDBACK_API}/${feedbackId}/status`, { status });
};

export const deleteFeedbackApi = async (feedbackId) => {
  return await axiosApiInstance.delete(`${BASE_FEEDBACK_API}/${feedbackId}`);
};

// ===== UTILITY FUNCTIONS =====

export const getFeedbackTypeLabel = (type) => {
  const labels = {
    suggestion: 'Suggestion',
    bug: 'Bug Report',
    question: 'Question',
    other: 'Other'
  };
  return labels[type] || type;
};

export const getFeedbackStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    resolved: 'Resolved'
  };
  return labels[status] || status;
};

export const getFeedbackTypeColor = (type) => {
  const colors = {
    suggestion: 'blue',
    bug: 'red',
    question: 'yellow',
    other: 'gray'
  };
  return colors[type] || 'gray';
};

export const getFeedbackStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    resolved: 'green'
  };
  return colors[status] || 'gray';
};

export const getFeedbackTypeIcon = (type) => {
  const icons = {
    suggestion: 'lightbulb',
    bug: 'bug',
    question: 'question-circle',
    other: 'info-circle'
  };
  return icons[type] || 'info-circle';
};

export const filterFeedbacksByType = (feedbacks, type) => {
  if (!feedbacks || !type || type === 'all') return feedbacks;
  return feedbacks.filter(feedback => feedback.type === type);
};

export const filterFeedbacksByStatus = (feedbacks, status) => {
  if (!feedbacks || !status || status === 'all') return feedbacks;
  return feedbacks.filter(feedback => feedback.status === status);
};

export const getFeedbackStatistics = (feedbacks) => {
  if (!feedbacks || feedbacks.length === 0) {
    return {
      total: 0,
      byType: { suggestion: 0, bug: 0, question: 0, other: 0 },
      byStatus: { pending: 0, resolved: 0 },
      resolvedPercentage: 0
    };
  }

  const stats = {
    total: feedbacks.length,
    byType: { suggestion: 0, bug: 0, question: 0, other: 0 },
    byStatus: { pending: 0, resolved: 0 }
  };

  feedbacks.forEach(feedback => {
    if (stats.byType[feedback.type] !== undefined) {
      stats.byType[feedback.type]++;
    }
    if (stats.byStatus[feedback.status] !== undefined) {
      stats.byStatus[feedback.status]++;
    }
  });

  stats.resolvedPercentage = stats.total > 0
    ? ((stats.byStatus.resolved / stats.total) * 100).toFixed(1)
    : 0;

  return stats;
};

export const formatFeedbackData = (feedback) => {
  if (!feedback) return null;
  return {
    ...feedback,
    typeLabel: getFeedbackTypeLabel(feedback.type),
    statusLabel: getFeedbackStatusLabel(feedback.status),
    typeColor: getFeedbackTypeColor(feedback.type),
    statusColor: getFeedbackStatusColor(feedback.status),
    typeIcon: getFeedbackTypeIcon(feedback.type),
    hasReply: feedback.reply && feedback.reply.length > 0,
    replyCount: feedback.reply?.length || 0,
    isResolved: feedback.status === 'resolved',
    isPending: feedback.status === 'pending',
    hasUser: !!feedback.user,
    userName: feedback.user?.name || 'Anonymous',
    userAvatar: feedback.user?.avatar || null
  };
};

export const sortFeedbacksByDate = (feedbacks, order = 'desc') => {
  if (!feedbacks) return [];
  return [...feedbacks].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export const getRecentFeedbacks = (feedbacks, limit = 5) => {
  if (!feedbacks) return [];
  return sortFeedbacksByDate(feedbacks, 'desc').slice(0, limit);
};

export const getPendingFeedbacks = (feedbacks) => {
  if (!feedbacks) return [];
  return feedbacks.filter(feedback => feedback.status === 'pending');
};

export const getResolvedFeedbacks = (feedbacks) => {
  if (!feedbacks) return [];
  return feedbacks.filter(feedback => feedback.status === 'resolved');
};

export const validateFeedbackData = (feedbackData) => {
  const errors = [];
  if (!feedbackData.message || feedbackData.message.trim().length < 10) errors.push('Message must be at least 10 characters');
  if (feedbackData.message && feedbackData.message.length > 2000) errors.push('Message must not exceed 2000 characters');
  if (feedbackData.type && !['suggestion','bug','question','other'].includes(feedbackData.type)) errors.push('Invalid feedback type');
  return {
    isValid: errors.length === 0,
    errors
  };
};