# BSocial 🎓

A university-exclusive social media platform for UTU (Uttarakhand Technical University) students with `@uktech.net.in` email addresses.

![BSocial](https://img.shields.io/badge/BSocial-University%20Social%20Network-667eea?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## 📱 Features

- **🔐 University-Exclusive Access**: Only students with `@uktech.net.in` emails can register
- **📝 Posts & Feed**: Share updates, thoughts, and media with fellow students
- **💬 Real-time Messaging**: Chat with classmates using Socket.io powered messaging
- **🏛️ Club Pages**: Create and follow pages for clubs like Dramatics, Sports, Tech, etc.
- **👤 Profile Management**: Customize your profile with branch, year, and bio
- **🔍 Search**: Find students, posts, and pages across the university
- **📱 Cross-Platform**: Available on Web and Mobile (iOS & Android)

## 🏗️ Tech Stack

### Backend (API)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access + Refresh tokens)
- **Real-time**: Socket.io
- **Security**: bcrypt for password hashing

### Web Application
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM

### Mobile Application
- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Secure Storage**: Expo Secure Store

### Monorepo
- **Tool**: Turborepo
- **Package Manager**: pnpm

## 📁 Project Structure

```
BSocial/
├── apps/
│   ├── api/                 # Backend API server
│   │   ├── src/
│   │   │   ├── routes/      # API route handlers
│   │   │   ├── middleware/  # Auth & error middleware
│   │   │   ├── services/    # Business logic
│   │   │   └── index.ts     # Server entry point
│   │   └── prisma/          # Database schema & migrations
│   │
│   ├── web/                 # React web application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── layouts/     # Layout components
│   │   │   ├── store/       # Zustand stores
│   │   │   └── lib/         # API & utilities
│   │   └── index.html
│   │
│   └── mobile/              # React Native mobile app
│       ├── app/             # Expo Router screens
│       │   ├── (auth)/      # Authentication screens
│       │   └── (tabs)/      # Main tab screens
│       └── src/
│           ├── store/       # Zustand stores
│           └── lib/         # API & utilities
│
├── packages/                # Shared packages (future)
├── docs/                    # Documentation
├── turbo.json              # Turborepo config
└── pnpm-workspace.yaml     # pnpm workspace config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database
- Expo Go app (for mobile testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BSocial.git
   cd BSocial
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env` file in `apps/api/`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/bsocial"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"
   PORT=5000
   ```

4. **Set up the database**
   ```bash
   cd apps/api
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # From root directory
   pnpm run dev
   ```

   Or start individually:
   ```bash
   # API Server (http://localhost:5000)
   cd apps/api && pnpm run dev
   
   # Web App (http://localhost:3000)
   cd apps/web && pnpm run dev
   
   # Mobile App (Expo)
   cd apps/mobile && pnpm run dev
   ```

### Test Credentials

After seeding, use these credentials to test:
- **Email**: `230050101076@uktech.net.in`
- **Password**: `Karan@123`

## 📱 Mobile App Setup

1. Install [Expo Go](https://expo.dev/go) on your phone
2. Start the mobile app: `cd apps/mobile && pnpm run dev`
3. Scan the QR code with Expo Go
4. Make sure your phone and computer are on the same network

**Note**: Update the API URL in `apps/mobile/src/lib/api.ts` with your computer's IP address for physical device testing.

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users/:id/follow` | Follow user |
| DELETE | `/api/users/:id/follow` | Unfollow user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/feed` | Get feed posts |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/:id` | Get post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Like post |
| POST | `/api/posts/:id/comments` | Comment on post |

### Pages (Clubs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages` | Get all pages |
| POST | `/api/pages` | Create page |
| GET | `/api/pages/:id` | Get page |
| POST | `/api/pages/:id/follow` | Follow page |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get conversations |
| GET | `/api/messages/:conversationId` | Get messages |
| POST | `/api/messages` | Send message |

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication (15min access, 7 days refresh)
- Email validation for `@uktech.net.in` domain only
- Protected routes with authentication middleware

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Karan Joshi**
- GitHub: [@karanjoshi](https://github.com/karanjoshi)

---

<p align="center">Made with ❤️ for UTU Students</p>

