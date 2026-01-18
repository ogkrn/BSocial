import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        useAuthStore.getState().setAccessToken(accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  initiateRegister: (email: string) =>
    api.post('/auth/register/initiate', { email }),

  completeRegister: (data: {
    email: string;
    otp: string;
    password: string;
    fullName: string;
    username: string;
    branch?: string;
    year?: string;
  }) => api.post('/auth/register/complete', data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  updateProfile: (data: {
    fullName?: string;
    bio?: string;
    branch?: string;
    year?: string;
    avatarUrl?: string;
  }) => api.put('/users/profile', data),
  follow: (userId: string) => api.post(`/users/${userId}/follow`),
  unfollow: (userId: string) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId: string) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId: string) => api.get(`/users/${userId}/following`),
  search: (q: string) => api.get('/users/search', { params: { q } }),
};

// Posts API
export const postsApi = {
  getFeed: (cursor?: string) =>
    api.get('/posts/feed', { params: { cursor } }),
  
  getPost: (postId: string) => api.get(`/posts/${postId}`),
  
  createPost: (data: {
    content: string;
    mediaUrls?: string[];
    postType?: string;
    visibility?: string;
    pageId?: string;
  }) => api.post('/posts', data),

  deletePost: (postId: string) => api.delete(`/posts/${postId}`),

  likePost: (postId: string) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId: string) => api.delete(`/posts/${postId}/like`),

  getComments: (postId: string) => api.get(`/posts/${postId}/comments`),
  addComment: (postId: string, content: string, parentId?: string) =>
    api.post(`/posts/${postId}/comments`, { content, parentId }),
};

// Pages API
export const pagesApi = {
  getPages: (params?: { category?: string; search?: string }) =>
    api.get('/pages', { params }),

  getPage: (slug: string) => api.get(`/pages/${slug}`),

  createPage: (data: {
    name: string;
    description?: string;
    category: string;
  }) => api.post('/pages', data),

  followPage: (pageId: string) => api.post(`/pages/${pageId}/follow`),
  unfollowPage: (pageId: string) => api.delete(`/pages/${pageId}/follow`),

  getPagePosts: (pageId: string, cursor?: string) =>
    api.get(`/pages/${pageId}/posts`, { params: { cursor } }),

  getCategories: () => api.get('/pages/meta/categories'),
};

// Messages API
export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),

  getOrCreateConversation: (participantId: string) =>
    api.post('/messages/conversations', { participantId }),

  getMessages: (conversationId: string, cursor?: string) =>
    api.get(`/messages/conversations/${conversationId}`, { params: { cursor } }),

  sendMessage: (conversationId: string, content: string) =>
    api.post(`/messages/conversations/${conversationId}`, { content }),

  getUnreadCount: () => api.get('/messages/unread'),
};
