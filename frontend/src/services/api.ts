import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

const apiClient = axios.create({
  baseURL: API_URL,
});

export const fetchOverview = async () => {
  const { data } = await apiClient.get('/analytics/overview');
  return data;
};

export const fetchTopPages = async (limit = 5) => {
  const { data } = await apiClient.get('/analytics/top-pages', { params: { limit } });
  return data;
};

export const fetchRecentActivity = async (limit = 20) => {
  const { data } = await apiClient.get('/analytics/recent', { params: { limit } });
  return data;
};

export const fetchFunnels = async () => {
  const { data } = await apiClient.get('/analytics/funnels');
  return data;
};

export const fetchInsights = async () => {
  const { data } = await apiClient.get('/analytics/insights');
  return data;
};

export const fetchSessions = async (params?: { page?: number; limit?: number; sort?: string; order?: string; search?: string }) => {
  const { data } = await apiClient.get('/sessions', { params });
  return data;
};

export const fetchSessionDetails = async (id: string) => {
  const { data } = await apiClient.get(`/sessions/${id}`);
  return data;
};

export const fetchHeatmap = async (url?: string) => {
  const { data } = await apiClient.get('/heatmap', { params: { url } });
  return data;
};
