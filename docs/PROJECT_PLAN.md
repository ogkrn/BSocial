# BSocial - Social Media Platform

## 🎯 Project Overview

BSocial is a modern social media platform to connect, share, and engage with your community.

---

## 🛠️ Recommended Tech Stack

### Frontend (Web)
| Technology | Purpose |
|------------|---------|
| **React 18+** | UI Framework |
| **Vite** | Build tool & dev server |
| **TypeScript** | Type safety |
| **TailwindCSS** | Styling |
| **React Query (TanStack)** | Server state management |
| **Zustand** | Client state management |
| **React Router v6** | Routing |
| **Socket.io-client** | Real-time messaging |

### Frontend (Mobile App)
| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile |
| **Expo** | Development framework |
| **React Navigation** | Mobile routing |
| **NativeWind** | TailwindCSS for RN |
| **React Query** | Data fetching |
| **Socket.io-client** | Real-time features |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | API Server |
| **TypeScript** | Type safety |
| **PostgreSQL** | Primary database |
| **Redis** | Caching & sessions |
| **Socket.io** | Real-time messaging |
| **Prisma** | ORM |
| **JWT** | Authentication tokens |
| **Nodemailer** | Email verification |
| **Cloudinary/AWS S3** | Media storage |
| **BullMQ** | Job queues |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD |
| **Nginx** | Reverse proxy |
| **Azure/AWS/Vercel** | Hosting |
| **Let's Encrypt** | SSL |

---

## 🔐 Authentication Flow

### Email Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User enters email                                           │
│              ↓                                                   │
│  2. Backend validates email format                              │
│              ↓                                                   │
│  3. Generate 6-digit OTP + JWT temp token                       │
│              ↓                                                   │
│  4. Send OTP to university email                                │
│              ↓                                                   │
│  5. User enters OTP within 10 minutes                           │
│              ↓                                                   │
│  6. Verify OTP → Create account                                 │
│              ↓                                                   │
│  7. User completes profile (name, branch, year, interests)      │
│              ↓                                                   │
│  8. Generate access token + refresh token                       │
│              ↓                                                   │
│  9. Redirect to home feed                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Option A: Email + Password                                      │
│  ─────────────────────────                                       │
│  1. Enter email + password                                       │
│  2. Validate credentials                                         │
│  3. Issue JWT tokens (access + refresh)                         │
│  4. Store refresh token in httpOnly cookie                      │
│                                                                  │
│  Option B: Magic Link (Passwordless)                            │
│  ────────────────────────────────────                            │
│  1. Enter university email                                       │
│  2. Send magic link to email                                    │
│  3. Click link → Auto login                                     │
│                                                                  │
│  Option C: Google OAuth                                         │
│  ──────────────────────────────────────────────────             │
│  1. Click "Login with Google"                                   │
│  2. Select Google account                                       │
│  3. Create/login user                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Token Management

```
Access Token:  Short-lived (15 min), stored in memory
Refresh Token: Long-lived (7 days), httpOnly cookie
               
Mobile App: Secure storage (Expo SecureStore)
Web App:    httpOnly cookies + memory
```

---

## 📱 Application Flow

### Web Application Flow (React + Vite)

```
┌──────────────────────────────────────────────────────────────────┐
│                         WEB APP FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ENTRY POINT                                                      │
│  └── index.html → main.tsx → App.tsx                             │
│                                                                   │
│  ROUTING STRUCTURE                                                │
│  └── /                    → Landing Page (if not logged in)      │
│      /login               → Login Page                           │
│      /register            → Registration Page                    │
│      /verify-email        → OTP Verification                     │
│      /feed                → Home Feed (Protected)                │
│      /profile/:userId     → User Profile                         │
│      /messages            → Direct Messages                      │
│      /messages/:chatId    → Chat Room                            │
│      /pages               → Discover Club Pages                  │
│      /pages/:pageId       → Club Page View                       │
│      /pages/create        → Create New Page (Admin)              │
│      /search              → Search Users/Posts/Pages             │
│      /notifications       → Notifications                        │
│      /settings            → User Settings                        │
│                                                                   │
│  STATE MANAGEMENT                                                 │
│  └── Auth State     → Zustand (user, tokens)                     │
│      Server State   → React Query (posts, messages)              │
│      UI State       → React useState/useReducer                  │
│                                                                   │
│  REAL-TIME UPDATES                                                │
│  └── Socket.io connection on login                               │
│      → New message notifications                                 │
│      → Post likes/comments live updates                          │
│      → Online status                                             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Mobile Application Flow (React Native + Expo)

```
┌──────────────────────────────────────────────────────────────────┐
│                       MOBILE APP FLOW                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ENTRY POINT                                                      │
│  └── App.tsx → Navigation Container → Stack/Tab Navigator        │
│                                                                   │
│  NAVIGATION STRUCTURE                                             │
│  └── Auth Stack (when not logged in)                             │
│      ├── Welcome Screen                                          │
│      ├── Login Screen                                            │
│      ├── Register Screen                                         │
│      └── OTP Verification Screen                                 │
│                                                                   │
│      Main Tab Navigator (when logged in)                         │
│      ├── Home Tab                                                │
│      │   ├── Feed Screen                                         │
│      │   ├── Create Post Screen                                  │
│      │   └── Post Details Screen                                 │
│      │                                                           │
│      ├── Search Tab                                              │
│      │   └── Search Screen (Users/Posts/Pages)                   │
│      │                                                           │
│      ├── Messages Tab                                            │
│      │   ├── Conversations List                                  │
│      │   └── Chat Screen                                         │
│      │                                                           │
│      ├── Pages Tab                                               │
│      │   ├── Discover Pages                                      │
│      │   └── Page Details Screen                                 │
│      │                                                           │
│      └── Profile Tab                                             │
│          ├── My Profile                                          │
│          ├── Edit Profile                                        │
│          └── Settings                                            │
│                                                                   │
│  DEEP LINKING                                                     │
│  └── bsocial://post/:id                                          │
│      bsocial://profile/:userId                                   │
│      bsocial://page/:pageId                                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Core Tables)

```sql
-- Users Table
users
├── id (UUID, PK)
├── email (unique)
├── password_hash
├── full_name
├── username (unique)
├── avatar_url
├── bio
├── branch (CSE, ECE, ME, etc.)
├── year (1st, 2nd, 3rd, 4th)
├── is_verified
├── is_active
├── created_at
└── updated_at

-- Posts Table
posts
├── id (UUID, PK)
├── user_id (FK → users)
├── page_id (FK → pages, nullable)
├── content (text)
├── media_urls (array)
├── post_type (text, image, poll, event)
├── visibility (public, followers, page_members)
├── likes_count
├── comments_count
├── created_at
└── updated_at

-- Pages (Clubs/Organizations)
pages
├── id (UUID, PK)
├── name
├── slug (unique)
├── description
├── avatar_url
├── cover_url
├── category (dramatics, sports, tech, cultural, etc.)
├── is_verified
├── created_by (FK → users)
├── followers_count
├── created_at
└── updated_at

-- Page Members (Admins/Moderators)
page_members
├── id (UUID, PK)
├── page_id (FK → pages)
├── user_id (FK → users)
├── role (admin, moderator, member)
├── joined_at
└── is_approved

-- Messages
messages
├── id (UUID, PK)
├── conversation_id (FK → conversations)
├── sender_id (FK → users)
├── content
├── media_url
├── message_type (text, image, file)
├── is_read
├── created_at
└── deleted_at

-- Conversations
conversations
├── id (UUID, PK)
├── type (direct, group)
├── name (for groups)
├── created_at
└── updated_at

-- Conversation Participants
conversation_participants
├── conversation_id (FK)
├── user_id (FK)
├── joined_at
└── last_read_at

-- Comments
comments
├── id (UUID, PK)
├── post_id (FK → posts)
├── user_id (FK → users)
├── parent_id (FK → comments, for replies)
├── content
├── created_at
└── updated_at

-- Likes
likes
├── id (UUID, PK)
├── user_id (FK → users)
├── post_id (FK → posts, nullable)
├── comment_id (FK → comments, nullable)
├── created_at

-- Followers
follows
├── follower_id (FK → users)
├── following_id (FK → users)
├── created_at
└── PRIMARY KEY (follower_id, following_id)

-- Page Followers
page_follows
├── user_id (FK → users)
├── page_id (FK → pages)
├── created_at
└── PRIMARY KEY (user_id, page_id)

-- Notifications
notifications
├── id (UUID, PK)
├── user_id (FK → users)
├── type (like, comment, follow, mention, page_post)
├── actor_id (FK → users)
├── reference_id (post_id, comment_id, etc.)
├── reference_type
├── is_read
├── created_at
└── read_at
```

---

## 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [x] Project setup & architecture
- [ ] Database schema design
- [ ] User authentication (email verification)
- [ ] Basic user profiles
- [ ] Core API endpoints

### Phase 2: Core Features (Weeks 5-8)
- [ ] Post creation (text, images)
- [ ] Feed algorithm (chronological + following)
- [ ] Like & comment system
- [ ] User search & discovery
- [ ] Follow/unfollow system

### Phase 3: Messaging (Weeks 9-11)
- [ ] Direct messaging
- [ ] Real-time chat with Socket.io
- [ ] Group chats
- [ ] Message notifications
- [ ] Online/offline status

### Phase 4: Pages/Clubs (Weeks 12-14)
- [ ] Create club pages
- [ ] Page admin roles
- [ ] Page posts & announcements
- [ ] Page followers
- [ ] Event creation

### Phase 5: Mobile App (Weeks 15-18)
- [ ] React Native setup with Expo
- [ ] Mobile authentication
- [ ] Core features on mobile
- [ ] Push notifications
- [ ] Deep linking

### Phase 6: Advanced Features (Weeks 19-22)
- [ ] Stories/Fleets
- [ ] Polls
- [ ] Event calendar
- [ ] File sharing
- [ ] Dark mode

### Phase 7: Polish & Launch (Weeks 23-26)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing with students
- [ ] Bug fixes
- [ ] Production deployment

---

## 💡 Future Ideas & Enhancements

### Academic Features
- 📚 **Study Groups** - Create study groups by subject/branch
- 📝 **Notes Sharing** - Share lecture notes & resources
- 📅 **Academic Calendar** - University events & exam schedules
- 🏆 **Achievement Badges** - Gamification for engagement

### Social Features
- 📖 **Stories** - 24-hour disappearing content
- 🎥 **Live Streaming** - Live sessions for events
- 🗳️ **Polls & Surveys** - Quick voting
- 🎉 **Events** - Create & RSVP to campus events

### Community Features
- 🛒 **Marketplace** - Buy/sell used books, items
- 🏠 **Housing Board** - Find roommates, PG listings
- 💼 **Job Board** - Internships & placement opportunities
- 🚗 **Ride Share** - Carpool to campus

### Technical Features
- 🔔 **Smart Notifications** - ML-based priority
- 🔍 **Advanced Search** - Full-text search with filters
- 📊 **Analytics Dashboard** - For page admins
- 🌐 **Multi-language** - Hindi/English support
- 🎨 **Themes** - Custom color themes
- ♿ **Accessibility** - Screen reader support

### Safety & Moderation
- 🛡️ **Content Moderation** - AI-powered spam detection
- 🚫 **Report System** - Report inappropriate content
- 👥 **Anonymous Posting** - Optional anonymous confessions page
- ✅ **Verified Profiles** - For official club accounts

---

## 📋 Requirements & Prerequisites

### Development Requirements
- Node.js 18+ 
- npm/yarn/pnpm
- PostgreSQL 14+
- Redis 6+
- Git

### Accounts Needed
- GitHub account
- Cloud provider (Azure/AWS/Vercel)
- Cloudinary account (free tier for media)
- SMTP service (SendGrid/Mailgun for emails)

### Mobile Development
- Expo Go app (for testing)
- Android Studio (for Android builds)
- Xcode (for iOS builds - Mac required)

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bsocial

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@bsocial.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
ALLOWED_EMAIL_DOMAIN=
```

---

## 🔒 Security Considerations

1. **Email Validation** - Proper format validation
2. **Rate Limiting** - Prevent brute force attacks
3. **Input Sanitization** - Prevent XSS/SQL injection
4. **HTTPS Only** - Force SSL in production
5. **CORS Configuration** - Whitelist allowed origins
6. **Password Hashing** - bcrypt with salt rounds
7. **JWT Security** - Short expiry, refresh rotation
8. **File Upload Validation** - Type & size limits
9. **Content Security Policy** - Prevent XSS
10. **Regular Security Audits** - Dependency updates

---

## 📁 Recommended Project Structure

```
BSocial/
├── apps/
│   ├── web/                    # React + Vite web app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   └── package.json
│   │
│   ├── mobile/                 # React Native + Expo
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── api/                    # Node.js + Express backend
│       ├── src/
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── models/
│       │   ├── utils/
│       │   └── config/
│       └── package.json
│
├── packages/                   # Shared packages
│   ├── shared-types/          # TypeScript types
│   ├── validators/            # Zod schemas
│   └── utils/                 # Common utilities
│
├── docs/                      # Documentation
├── docker-compose.yml
├── package.json               # Monorepo root
└── README.md
```

---

## 🎯 MVP Features (Minimum Viable Product)

For initial launch, focus on:

1. ✅ University email authentication
2. ✅ User profiles with branch/year
3. ✅ Create text/image posts
4. ✅ Like and comment on posts
5. ✅ Follow other students
6. ✅ Basic feed (chronological)
7. ✅ Direct messaging
8. ✅ Create/follow club pages
9. ✅ Search users and posts
10. ✅ Notifications

---

*Document Version: 1.0*
*Last Updated: January 2026*
