import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fetchStocks = async () => {
  try {
    const response = await api.get('/stocks');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stocks');
  }
};

export const fetchStockDetail = async (symbol) => {
  try {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stock details');
  }
};

export const fetchRecommendations = async (params = {}) => {
  try {
    const response = await api.get('/recommendations', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
  }
};

export const fetchTopRecommendations = async (limit = 10, type = 'all') => {
  try {
    const response = await api.get('/recommendations/top', {
      params: { limit, type }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch top recommendations');
  }
};

export default api;
