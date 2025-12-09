import axios from 'axios';

export const baseURL = process.env.REACT_NATIVE_API_URL || 'http://hajp.app';
// export const baseURL = process.env.REACT_NATIVE_API_URL || 'http://192.168.0.26:8000';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = global.__HAJP_TOKEN__;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = async (payload) => {
  const { data } = await api.post('/api/register', payload);
  if (data?.token) {
    global.__HAJP_TOKEN__ = data.token;
  }
  return data;
};
export const login = async (payload) => {
  const { data } = await api.post('/api/login', payload);
  global.__HAJP_TOKEN__ = data.token;
  return data;
};
export const fetchRooms = () => api.get('/api/rooms');
export const createRoom = (payload) =>
  payload instanceof FormData
    ? api.post('/api/rooms', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    : api.post('/api/rooms', payload);
export const joinRoom = (roomId) => api.post(`/api/rooms/${roomId}/join`);
export const fetchActiveQuestion = (roomId) => api.get(`/api/rooms/${roomId}/polling`);
export const fetchRoomsStatus = () => api.get('/api/rooms/status');
export const fetchRoomCashoutStatus = (roomId) => api.get(`/api/rooms/${roomId}/cashout/status`);
export const postRoomCashout = (roomId) => api.post(`/api/rooms/${roomId}/cashout`);
export const fetchQuestionDetail = (id) => api.get(`/api/questions/${id}`);
export const voteQuestion = (id, selected_option) => api.post(`/api/questions/${id}/vote`, { selected_option });
export const refreshQuestionOptions = (id) => api.post(`/api/questions/${id}/refresh`);
export const skipQuestion = (id) => api.post(`/api/questions/${id}/skip`);
export const fetchMyVotes = (selectedUserId) =>
  api.get('/api/user/votes', {
    params: selectedUserId ? { selected_user_id: selectedUserId } : undefined,
  });
export const fetchFriendActivities = (page = 1, limit = 10) =>
  api.get('/api/user/activities', { params: { page, limit } });
export const subscriptionStatus = () => api.get('/api/subscription/status');
export const subscribe = () => api.post('/api/subscription/subscribe');
export const getInbox = (userId) => api.get(`/api/anonymous/inbox/${userId}`);
export const sendAnonMessage = (inbox_id, message, metadata) => api.post('/api/anonymous/message', { inbox_id, message, metadata });
export const fetchUserRooms = () => api.get('/api/user/rooms');
export const getCurrentUser = async () => {
  const { data } = await api.get('/api/user');
  return data;
};
export const updateCurrentUser = (payload) => api.put('/api/user', payload);
export const uploadProfilePhoto = (formData) =>
  api.post('/api/user/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const removeProfilePhoto = () => api.delete('/api/user/photo');
export const logout = () => api.post('/api/logout');
export const fetchCoinBalance = () => api.get('/api/user/coins');
export const fetchFriendSuggestions = () => api.get('/api/friends/suggestions');
export const fetchFriends = () => api.get('/api/friends');
export const fetchFriendRequests = () => api.get('/api/friends/requests');
export const addFriend = (userId) => api.post(`/api/friends/${userId}/add`);
export const removeFriend = (userId) => api.delete(`/api/friends/${userId}/remove`);
export const approveFriendRequest = (userId) => api.post(`/api/friends/${userId}/approve`);
export const fetchUserProfile = (userId) => api.get(`/api/users/${userId}`);
export const fetchUserRoomsFor = (userId) => api.get(`/api/users/${userId}/rooms`);
export const fetchUserFriendsCount = (userId) => api.get(`/api/users/${userId}/friends/count`);
export const fetchFriendshipStatus = (userId) => api.get(`/api/users/${userId}/friendship/status`);
export const fetchProfileViews = (userId) => api.get(`/api/users/${userId}/views`);
export const recordProfileView = (userId) => api.post(`/api/users/${userId}/views`);
export const fetchRoomRanking = (roomId, period = 'day') => api.get(`/api/rooms/${roomId}/rank/${period}`);

export default api;
