import axios from 'axios';

// export const baseURL = process.env.REACT_NATIVE_API_URL || 'http://hajp.app/api';
export const baseURL = process.env.REACT_NATIVE_API_URL || 'http://192.168.0.26:8000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = global.__HAJP_TOKEN__;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = async (payload) => {
  const { data } = await api.post('/register', payload);
  if (data?.token) {
    global.__HAJP_TOKEN__ = data.token;
  }
  return data;
};
export const login = async (payload) => {
  const { data } = await api.post('/login', payload);
  global.__HAJP_TOKEN__ = data.token;
  return data;
};
export const fetchRooms = () => api.get('/rooms');
export const createRoom = (payload) =>
  payload instanceof FormData
    ? api.post('/rooms', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    : api.post('/rooms', payload);
export const joinRoom = (roomId) => api.post(`/rooms/${roomId}/join`);
export const joinRoomByCode = (code) => api.post('/rooms/join-code', { code });
export const fetchActiveQuestion = (roomId) => api.get(`/rooms/${roomId}/polling`);
export const fetchRoomsStatus = () => api.get('/rooms/status');
export const fetchRoomCashoutStatus = (roomId) => api.get(`/rooms/${roomId}/cashout/status`);
export const postRoomCashout = (roomId) => api.post(`/rooms/${roomId}/cashout`);
export const fetchQuestionDetail = (id) => api.get(`/questions/${id}`);
export const voteQuestion = (id, selected_option) => api.post(`/questions/${id}/vote`, { selected_option });
export const refreshQuestionOptions = (id) => api.post(`/questions/${id}/refresh`);
export const skipQuestion = (id) => api.post(`/questions/${id}/skip`);
export const fetchMyVotes = (selectedUserId) =>
  api.get('/user/votes', {
    params: selectedUserId ? { selected_user_id: selectedUserId } : undefined,
  });
export const fetchFriendActivities = (page = 1, limit = 10) =>
  api.get('/user/activities', { params: { page, limit } });
export const subscriptionStatus = () => api.get('/subscription/status');
export const subscribe = () => api.post('/subscription/subscribe');
export const getInbox = (userId) => api.get(`/anonymous/inbox/${userId}`);
export const sendAnonMessage = (inbox_id, message, metadata) => api.post('/anonymous/message', { inbox_id, message, metadata });
export const fetchShareStyles = () => api.get('/share/styles');
export const fetchShareMessages = (userId) => api.get(`/share/${userId}/messages`);
export const fetchUserRooms = () => api.get('/user/rooms');
export const getCurrentUser = async () => {
  const { data } = await api.get('/user');
  return data;
};
export const updateCurrentUser = (payload) => api.put('/user', payload);
export const uploadProfilePhoto = (formData) =>
  api.post('/user/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const removeProfilePhoto = () => api.delete('/user/photo');
export const logout = () => api.post('/logout');
export const fetchCoinBalance = () => api.get('/user/coins');
export const fetchFriendSuggestions = () => api.get('/friends/suggestions');
export const fetchFriends = () => api.get('/friends');
export const fetchFriendRequests = () => api.get('/friends/requests');
export const addFriend = (userId) => api.post(`/friends/${userId}/add`);
export const removeFriend = (userId) => api.delete(`/friends/${userId}/remove`);
export const approveFriendRequest = (userId) => api.post(`/friends/${userId}/approve`);
export const fetchUserProfile = (userId) => api.get(`/user/${userId}`);
export const fetchUserRoomsFor = (userId) => api.get(`/user/${userId}/rooms`);
export const fetchUserFriendsCount = (userId) => api.get(`/user/${userId}/friends/count`);
export const fetchFriendshipStatus = (userId) => api.get(`/user/${userId}/friendship/status`);
export const fetchProfileViews = (userId) => api.get(`/user/${userId}/views`);
export const recordProfileView = (userId) => api.post(`/user/${userId}/views`);
export const fetchRoomRanking = (roomId, period = 'day') => api.get(`/rooms/${roomId}/rank/${period}`);

export default api;
