// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  branch?: string;
  year?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Post types
export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  authorId: string;
  author: User;
  pageId?: string;
  page?: Page;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  postId: string;
  createdAt: string;
}

// Page types
export type PageCategory = 
  | 'dramatics' 
  | 'sports' 
  | 'tech' 
  | 'cultural' 
  | 'academic' 
  | 'music' 
  | 'art' 
  | 'other';

export interface Page {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  category: PageCategory;
  creatorId: string;
  creator: User;
  isVerified: boolean;
  followersCount: number;
  membersCount: number;
  isFollowing: boolean;
  isMember: boolean;
  createdAt: string;
}

export type PageMemberRole = 'admin' | 'moderator' | 'member';

export interface PageMember {
  id: string;
  pageId: string;
  userId: string;
  user: User;
  role: PageMemberRole;
  joinedAt: string;
}

// Message types
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  conversationId: string;
  isRead: boolean;
  createdAt: string;
}

// Notification types
export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'follow' 
  | 'page_follow' 
  | 'page_invite' 
  | 'mention';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  userId: string;
  actorId: string;
  actor: User;
  postId?: string;
  pageId?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth types
export interface LoginRequest {
  email: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  username: string;
  branch?: string;
  year?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
