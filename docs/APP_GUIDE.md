# BSocial - Complete Application Guide

This document provides a comprehensive overview of the BSocial application architecture, authentication flows, features, and codebase structure for both the Web App and Mobile App.

---

## 📁 Project Structure Overview

```
BSocial/
├── apps/
│   ├── api/              # Backend Node.js + Express server
│   ├── web/              # React + Vite web application
│   └── mobile/           # React Native + Expo mobile app
├── packages/
│   ├── shared-types/     # Shared TypeScript interfaces
│   └── validators/       # Shared Zod validation schemas
├── docs/                 # Documentation
├── package.json          # Root monorepo config
├── pnpm-workspace.yaml   # PNPM workspace config
└── turbo.json            # Turborepo config
```

---

## 🔐 AUTHENTICATION SYSTEM

### Overview
BSocial uses a secure authentication system that:
1. **Email-based registration** with OTP verification
2. **Password-based login** with bcrypt hashing
3. **JWT tokens** for session management (Access + Refresh tokens)
4. **OTP verification** for new registrations

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User enters email                                              │
│           │                                                      │
│           ▼                                                      │
│  POST /api/auth/register/initiate                               │
│           │                                                      │
│           ▼                                                      │
│  Server validates email format ──► If invalid: Error            │
│           │                                                      │
│           ▼                                                      │
│  Generate 6-digit OTP                                           │
│           │                                                      │
│           ▼                                                      │
│  Store OTP in database (expires in 10 min)                      │
│           │                                                      │
│           ▼                                                      │
│  Send OTP to user's email                                       │
│           │                                                      │
│           ▼                                                      │
│  User enters OTP + password + username                          │
│           │                                                      │
│           ▼                                                      │
│  POST /api/auth/register/complete                               │
│           │                                                      │
│           ▼                                                      │
│  Verify OTP + Hash password + Create user                       │
│           │                                                      │
│           ▼                                                      │
│  Generate JWT tokens (access + refresh)                         │
│           │                                                      │
│           ▼                                                      │
│  User is logged in! ✅                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User enters email + password                                   │
│           │                                                      │
│           ▼                                                      │
│  POST /api/auth/login                                           │
│           │                                                      │
│           ▼                                                      │
│  Server validates email domain                                  │
│           │                                                      │
│           ▼                                                      │
│  Find user in database                                          │
│           │                                                      │
│           ▼                                                      │
│  Compare password with bcrypt                                   │
│           │                                                      │
│           ▼                                                      │
│  If valid: Generate JWT tokens                                  │
│           │                                                      │
│           ▼                                                      │
│  Return: { user, accessToken }                                  │
│  Set: refreshToken as httpOnly cookie (web)                     │
│       or SecureStore (mobile)                                   │
│           │                                                      │
│           ▼                                                      │
│  User is logged in! ✅                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### JWT Token System

| Token | Purpose | Expiry | Storage |
|-------|---------|--------|---------|
| **Access Token** | API authentication | 15 minutes | Memory (web), SecureStore (mobile) |
| **Refresh Token** | Get new access token | 7 days | httpOnly Cookie (web), SecureStore (mobile) |

### Token Refresh Flow
```
Access token expires
       │
       ▼
API returns 401 Unauthorized
       │
       ▼
Axios interceptor catches error
       │
       ▼
POST /api/auth/refresh (with refresh token)
       │
       ▼
Server validates refresh token
       │
       ▼
Issues new access + refresh tokens
       │
       ▼
Retry original request with new token
```

---

## 🖥️ BACKEND API (apps/api/)

### Folder Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma      # Database schema (all models)
│   ├── seed.ts            # Seed data (test user)
│   └── migrations/        # Database migrations
├── src/
│   ├── index.ts           # Entry point, Express server setup
│   ├── config/
│   │   └── index.ts       # Environment variables config
│   ├── lib/
│   │   └── prisma.ts      # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts        # JWT verification middleware
│   │   ├── errorHandler.ts # Global error handling
│   │   └── rateLimiter.ts # Rate limiting for auth routes
│   ├── routes/
│   │   ├── auth.routes.ts  # /api/auth/* endpoints
│   │   ├── user.routes.ts  # /api/users/* endpoints
│   │   ├── post.routes.ts  # /api/posts/* endpoints
│   │   ├── page.routes.ts  # /api/pages/* endpoints
│   │   └── message.routes.ts # /api/messages/* endpoints
│   └── services/
│       ├── auth.service.ts  # Authentication business logic
│       └── email.service.ts # Email sending (OTP, welcome)
└── package.json
```

### Key Files Explained

#### `src/index.ts` - Server Entry Point
```typescript
// What it does:
// 1. Creates Express app
// 2. Sets up CORS, cookie-parser, helmet (security)
// 3. Creates HTTP server with Socket.io for real-time
// 4. Mounts all API routes under /api
// 5. Starts server on PORT (default 5000)
```

#### `src/middleware/auth.ts` - Authentication Middleware
```typescript
// What it does:
// 1. Extracts JWT from Authorization header
// 2. Verifies token signature
// 3. Attaches user info to request (req.user)
// 4. Protects routes that require authentication
```

#### `src/services/auth.service.ts` - Auth Business Logic
```typescript
// Key functions:
// - initiateRegistration(email) - Send OTP
// - completeRegistration(...) - Verify OTP, create user
// - login(email, password) - Authenticate user
// - refreshToken(token) - Issue new tokens
// - logout(userId, refreshToken) - Invalidate token
```

#### `prisma/schema.prisma` - Database Models

| Model | Purpose |
|-------|---------|
| `User` | User accounts with profile info |
| `Post` | User/page posts with content |
| `Comment` | Comments on posts |
| `Like` | Likes on posts |
| `Follow` | User-to-user follows |
| `Page` | Club/organization pages |
| `PageFollow` | Users following pages |
| `PageMember` | Page members with roles |
| `Conversation` | Chat conversations |
| `Message` | Individual messages |
| `Notification` | User notifications |
| `RefreshToken` | Stored refresh tokens |
| `OtpCode` | OTP codes for verification |

### API Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register/initiate` | Send OTP to email |
| POST | `/register/complete` | Complete registration |
| POST | `/login` | Login with email/password |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout user |
| GET | `/me` | Get current user |

#### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:id` | Get user profile |
| PUT | `/profile` | Update own profile |
| POST | `/:id/follow` | Follow user |
| DELETE | `/:id/follow` | Unfollow user |
| GET | `/:id/followers` | Get user's followers |
| GET | `/:id/following` | Get user's following |

#### Posts (`/api/posts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/feed` | Get personalized feed |
| POST | `/` | Create new post |
| GET | `/:id` | Get single post |
| DELETE | `/:id` | Delete post |
| POST | `/:id/like` | Like post |
| DELETE | `/:id/like` | Unlike post |
| GET | `/:id/comments` | Get comments |
| POST | `/:id/comments` | Add comment |

#### Pages (`/api/pages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all pages |
| POST | `/` | Create new page |
| GET | `/:slug` | Get page by slug |
| PUT | `/:id` | Update page |
| POST | `/:id/follow` | Follow page |
| POST | `/:id/members` | Add member |

#### Messages (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | Get all conversations |
| POST | `/conversations` | Create conversation |
| GET | `/conversations/:id` | Get messages |
| POST | `/send` | Send message |

---

## 🌐 WEB APP (apps/web/)

### Folder Structure

```
apps/web/
├── public/                # Static assets
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Main app with routing
│   ├── index.css          # Global styles + Tailwind
│   ├── store/
│   │   └── authStore.ts   # Zustand auth state management
│   ├── lib/
│   │   ├── api.ts         # Axios instance + interceptors
│   │   └── socket.ts      # Socket.io client
│   ├── layouts/
│   │   ├── AuthLayout.tsx  # Layout for auth pages
│   │   └── MainLayout.tsx  # Layout for authenticated pages
│   ├── pages/
│   │   ├── Landing.tsx     # Home/landing page
│   │   ├── Feed.tsx        # Main feed
│   │   ├── Profile.tsx     # User profile
│   │   ├── Messages.tsx    # Messaging
│   │   ├── Pages.tsx       # Club pages list
│   │   ├── Settings.tsx    # User settings
│   │   └── auth/
│   │       ├── Login.tsx    # Login form
│   │       ├── Register.tsx # Registration form
│   │       └── VerifyOtp.tsx # OTP verification
│   └── components/         # Reusable components
├── tailwind.config.js     # Tailwind CSS config
├── vite.config.ts         # Vite bundler config
└── package.json
```

### Key Files Explained

#### `src/store/authStore.ts` - Auth State Management
```typescript
// Uses Zustand for state management
// Persists to localStorage

interface AuthState {
  user: User | null;           // Current user data
  accessToken: string | null;  // JWT access token
  isAuthenticated: boolean;    // Auth status
  
  // Actions
  login(user, token): void;    // Set auth state
  logout(): void;              // Clear auth state
  setUser(user): void;         // Update user data
}
```

#### `src/lib/api.ts` - API Client
```typescript
// Axios instance with:
// 1. Base URL configuration
// 2. Request interceptor - adds Authorization header
// 3. Response interceptor - handles 401, refreshes token

// Auth API functions:
authApi.login(email, password)
authApi.register(...)
authApi.verifyOtp(email, otp)
authApi.logout()
```

#### `src/App.tsx` - Routing
```typescript
// Routes:
// / - Landing page (public)
// /login - Login page
// /register - Registration page  
// /verify-otp - OTP verification
// /feed - Main feed (protected)
// /profile - User profile (protected)
// /messages - Messaging (protected)
// /pages - Club pages (protected)
// /settings - Settings (protected)
```

#### `src/layouts/MainLayout.tsx` - App Layout
```typescript
// Provides:
// - Sidebar navigation (desktop)
// - Bottom navigation (mobile)
// - Header with notifications
// - Main content area
```

### Pages Breakdown

| Page | File | Purpose |
|------|------|---------|
| Landing | `Landing.tsx` | Welcome page with login/signup CTAs |
| Login | `auth/Login.tsx` | Email + password login form |
| Register | `auth/Register.tsx` | Registration with OTP |
| Feed | `Feed.tsx` | Post feed with create post UI |
| Profile | `Profile.tsx` | User profile with stats |
| Messages | `Messages.tsx` | Chat interface |
| Pages | `Pages.tsx` | Browse/create club pages |
| Settings | `Settings.tsx` | User settings |

---

## 📱 MOBILE APP (apps/mobile/)

### Folder Structure

```
apps/mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Entry point (redirect logic)
│   ├── (auth)/             # Auth screens (unauthenticated)
│   │   ├── _layout.tsx     # Auth stack navigator
│   │   ├── welcome.tsx     # Welcome screen
│   │   ├── login.tsx       # Login screen
│   │   ├── register.tsx    # Register screen
│   │   └── verify-otp.tsx  # OTP verification
│   └── (tabs)/             # Main app screens (authenticated)
│       ├── _layout.tsx     # Tab navigator
│       ├── feed.tsx        # Home feed
│       ├── search.tsx      # Search users/posts
│       ├── messages.tsx    # Messages list
│       ├── pages.tsx       # Club pages
│       └── profile.tsx     # User profile
├── src/
│   ├── store/
│   │   └── authStore.ts    # Zustand auth state
│   └── lib/
│       └── api.ts          # Axios instance
├── app.json                # Expo config
├── babel.config.js         # Babel config
├── tailwind.config.js      # NativeWind (Tailwind for RN)
└── package.json
```

### Expo Router Explained

Expo Router uses **file-based routing** similar to Next.js:

```
app/
├── index.tsx           → / (entry point)
├── (auth)/
│   ├── login.tsx       → /login
│   ├── register.tsx    → /register
│   └── verify-otp.tsx  → /verify-otp
└── (tabs)/
    ├── feed.tsx        → /feed
    ├── messages.tsx    → /messages
    ├── pages.tsx       → /pages
    └── profile.tsx     → /profile
```

- **Parentheses `(group)`**: Layout groups (don't affect URL)
- **`_layout.tsx`**: Layout component for that folder
- **`index.tsx`**: Default route for folder

### Key Files Explained

#### `app/_layout.tsx` - Root Layout
```typescript
// Wraps entire app with:
// 1. QueryClientProvider (React Query)
// 2. SafeAreaProvider
// 3. Loads auth state on app start
```

#### `app/index.tsx` - Entry Point
```typescript
// Checks authentication status:
// - If authenticated → redirect to /(tabs)/feed
// - If not authenticated → redirect to /(auth)/welcome
```

#### `app/(auth)/_layout.tsx` - Auth Layout
```typescript
// Stack navigator for auth screens
// No tab bar shown
// Screens: welcome, login, register, verify-otp
```

#### `app/(tabs)/_layout.tsx` - Tabs Layout
```typescript
// Tab navigator with 5 tabs:
// 1. Feed (home icon)
// 2. Search (search icon)
// 3. Messages (chat icon)
// 4. Pages (people icon)
// 5. Profile (person icon)
```

#### `src/store/authStore.ts` - Mobile Auth Store
```typescript
// Similar to web but uses SecureStore for persistence

import * as SecureStore from 'expo-secure-store';

// Stores tokens securely on device
// Persists across app restarts
```

#### `src/lib/api.ts` - Mobile API Client
```typescript
// Axios with SecureStore token management
// Reads token from SecureStore for each request
// Handles token refresh on 401
```

### Mobile Screens

| Screen | File | Purpose |
|--------|------|---------|
| Welcome | `(auth)/welcome.tsx` | App intro with login/signup buttons |
| Login | `(auth)/login.tsx` | Email + password login |
| Register | `(auth)/register.tsx` | Registration form |
| Verify OTP | `(auth)/verify-otp.tsx` | OTP input screen |
| Feed | `(tabs)/feed.tsx` | Scrollable post feed |
| Search | `(tabs)/search.tsx` | Search users/posts |
| Messages | `(tabs)/messages.tsx` | Conversations list |
| Pages | `(tabs)/pages.tsx` | Club pages grid |
| Profile | `(tabs)/profile.tsx` | User profile + logout |

---

## 💬 MESSAGING SYSTEM

### How It Works

1. **Conversations** - A conversation is between 2+ users
2. **Messages** - Each message belongs to a conversation
3. **Real-time** - Socket.io for instant message delivery

### Database Models

```prisma
model Conversation {
  id           String    @id
  participants ConversationParticipant[]
  messages     Message[]
  lastMessage  String?
  updatedAt    DateTime
}

model Message {
  id             String   @id
  content        String
  senderId       String
  conversationId String
  isRead         Boolean
  createdAt      DateTime
}
```

### Message Flow

```
User A sends message
       │
       ▼
POST /api/messages/send
{ content, conversationId }
       │
       ▼
Server saves message to DB
       │
       ▼
Socket.io emits to conversation room
       │
       ▼
User B receives message instantly
       │
       ▼
UI updates with new message
```

### Socket.io Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join` | Client → Server | Join conversation room |
| `leave` | Client → Server | Leave conversation room |
| `new_message` | Server → Client | New message received |
| `message_read` | Server → Client | Message marked as read |
| `typing` | Bidirectional | User is typing indicator |

---

## 🔄 LOGIN/LOGOUT FLOW

### Login Process (Web)

```typescript
// 1. User submits form
const onSubmit = async (data) => {
  // 2. Call API
  const response = await authApi.login(email, password);
  
  // 3. Store in Zustand (persists to localStorage)
  login(response.user, response.accessToken);
  
  // 4. Redirect to feed
  navigate('/feed');
};
```

### Login Process (Mobile)

```typescript
// 1. User submits form
const handleLogin = async () => {
  // 2. Call API
  const response = await api.post('/auth/login', { email, password });
  
  // 3. Store in Zustand + SecureStore
  await login(response.user, response.accessToken);
  
  // 4. Redirect to feed
  router.replace('/(tabs)/feed');
};
```

### Logout Process

```typescript
// Web
const handleLogout = async () => {
  await authApi.logout();  // Invalidate refresh token
  logout();                // Clear Zustand store
  navigate('/');           // Redirect to home
};

// Mobile
const handleLogout = async () => {
  await logout();                    // Clears SecureStore
  router.replace('/(auth)/welcome'); // Redirect to welcome
};
```

---

## 🧪 TEST CREDENTIALS

The database is seeded with a test user:

| Field | Value |
|-------|-------|
| **Email** | `karan@bsocial.com` |
| **Password** | `Karan@123` |
| **Username** | `karan_joshi` |
| **Name** | Karan Joshi |

---

## 🚀 RUNNING THE APP

### Start All Services

```bash
# Terminal 1 - Backend API
cd apps/api
pnpm dev
# Runs on http://localhost:5000

# Terminal 2 - Web App
cd apps/web
pnpm dev
# Runs on http://localhost:3000

# Terminal 3 - Mobile App
cd apps/mobile
npx expo start
# Scan QR code with Expo Go app
```

### Environment Variables

#### Backend (`apps/api/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

#### Web (`apps/web/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

#### Mobile (`apps/mobile/.env`)
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

---

## 📊 STATE MANAGEMENT

Both apps use **Zustand** for state management:

### Why Zustand?
- Minimal boilerplate
- Built-in persistence
- Works with React Native
- Simple API

### Auth Store Structure
```typescript
{
  // State
  user: User | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  
  // Actions
  login(user, token),
  logout(),
  setUser(user),
  loadStoredAuth(), // Mobile only
}
```

---

## 🔒 SECURITY FEATURES

1. **Email Validation** - Proper format validation
2. **Password Hashing** - bcrypt with 12 rounds
3. **JWT Tokens** - Short-lived access, long-lived refresh
4. **httpOnly Cookies** - Refresh token protected from XSS
5. **Rate Limiting** - Prevents brute force attacks
6. **Helmet** - Security headers
7. **CORS** - Cross-origin protection

---

## 📝 SUMMARY

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Backend | Express + Prisma | 5000 | REST API + WebSocket |
| Web App | React + Vite | 3000 | Browser application |
| Mobile | React Native + Expo | 8081 | iOS/Android app |
| Database | PostgreSQL | 5432 | Data storage |

### Quick Reference

- **Login**: POST `/api/auth/login`
- **Auth Store**: `src/store/authStore.ts`
- **API Client**: `src/lib/api.ts`
- **Protected Routes**: Require `Authorization: Bearer <token>`
- **Token Refresh**: Automatic via Axios interceptor

---

*This guide covers the core functionality. For more details, refer to the source code and inline comments.*
