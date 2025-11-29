import axios from 'axios';

const baseURL = process.env.REACT_NATIVE_API_URL || 'http://192.168.0.30:8000';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = global.__HAJP_TOKEN__;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (payload) => api.post('/api/register', payload);
export const login = async (payload) => {
  const { data } = await api.post('/api/login', payload);
  global.__HAJP_TOKEN__ = data.token;
  return data;
};
export const fetchRooms = () => api.get('/api/rooms');
export const fetchActiveQuestion = (roomId) => api.get(`/api/rooms/${roomId}/questions/active`);
export const fetchQuestionDetail = (id) => api.get(`/api/questions/${id}`);
export const voteQuestion = (id, selected_option) => api.post(`/api/questions/${id}/vote`, { selected_option });
export const refreshQuestionOptions = (id) => api.post(`/api/questions/${id}/refresh`);
export const subscriptionStatus = () => api.get('/api/subscription/status');
export const subscribe = () => api.post('/api/subscription/subscribe');
export const getInbox = (userId) => api.get(`/api/anonymous/inbox/${userId}`);
export const sendAnonMessage = (inbox_id, message, metadata) => api.post('/api/anonymous/message', { inbox_id, message, metadata });
export const getCurrentUser = async () => {
  const { data } = await api.get('/api/user');
  return data;
};
export const logout = () => api.post('/api/logout');

export default api;
