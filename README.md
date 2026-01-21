# 🛡️ SentryGate - User Profile Manager

**A production-ready MERN stack application with enterprise-level RBAC, real-time monitoring, and comprehensive security features.**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/user_profile_manager)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Deployment](#-deployment-to-render)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Multi-Factor Authentication (MFA) with TOTP
- Role-Based Access Control (RBAC): User, TeamLead, Admin, Auditor
- Session management with automatic invalidation
- Password reset with email verification

### 👥 User Management
- Complete CRUD operations for users
- Dynamic role assignment with real-time updates
- User suspension with immediate session termination
- Profile management with avatar upload
- Team-based user organization

### 📊 Analytics & Monitoring
- Real-time dashboard with KPIs
- User activity tracking and audit logs
- Security event monitoring
- Brute force detection and alerts
- Export functionality (CSV, PDF)

### 🔔 Real-Time Features
- WebSocket integration (Socket.io)
- Live notifications for role changes
- Instant suspension alerts
- Admin activity feed
- Real-time user status updates

### 🎨 Modern UI/UX
- Glassmorphism design system
- Dark/Light theme with system preference
- Fully responsive (mobile-first)
- Smooth animations (Framer Motion)
- Accessibility compliant (WCAG AA)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (Atlas or local)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user_profile_manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   **Server** (`server/.env`):
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key_change_this
   JWT_EXPIRES_IN=15m
   CLIENT_ORIGIN=http://localhost:5173
   NODE_ENV=development
   PORT=5001
   ```

   **Client** (`client/.env`):
   ```env
   VITE_API_URL=http://localhost:5001
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   The app will open at:
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:5001
   - **API**: http://localhost:5001/api/v1

### Demo Credentials
```
Admin Account:
Email: admin@example.com
Password: admin12345

Regular User:
Email: user@example.com
Password: user12345
```

---

## 📁 Project Structure

```
user_profile_manager/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express backend
│   ├── controllers/          # Route controllers
│   ├── models/               # Mongoose models
│   ├── middleware/           # Custom middleware
│   ├── routes/               # API routes
│   ├── utils/                # Helper functions
│   ├── package.json
│   └── index.js
│
└── package.json              # Root workspace config
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 5** - Build tool
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **React Router 7** - Routing
- **Socket.io Client** - Real-time communication
- **React Query** - Data fetching
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Helmet** - Security headers
- **Morgan** - HTTP logging

---

## 🚀 Deployment to Render

### Step 1: Prepare Your Code

1. **Fix hardcoded URLs** ✅ (Already done!)
2. **Test build locally**
   ```bash
   cd client
   npm run build
   ```

### Step 2: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `sentrygate-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

5. **Add Environment Variables**:
   ```
   MONGO_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-strong-secret>
   JWT_EXPIRES_IN=15m
   CLIENT_ORIGIN=https://your-frontend-url.onrender.com
   NODE_ENV=production
   PORT=5001
   ```

6. Click **"Create Web Service"**
7. **Copy the backend URL** (e.g., `https://sentrygate-api.onrender.com`)

### Step 3: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your repository
3. Configure:
   - **Name**: `sentrygate-app`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://sentrygate-api.onrender.com
   ```

5. Click **"Create Static Site"**

### Step 4: Update Backend CORS

1. Go back to your backend service
2. Update `CLIENT_ORIGIN` environment variable with your frontend URL
3. Redeploy if necessary

### Step 5: Test Your Deployment

Visit your frontend URL and test:
- ✅ Login functionality
- ✅ User management
- ✅ Real-time notifications
- ✅ Role changes
- ✅ Suspension feature

---

## 🔐 Environment Variables

### Server Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-256-bit-secret` |
| `JWT_EXPIRES_IN` | JWT token expiration | `15m` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `https://yourapp.com` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5001` |
| `SENTRY_DSN` | Sentry error tracking (optional) | `https://...` |

### Client Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.yourapp.com` |
| `VITE_SENTRY_DSN` | Sentry DSN (optional) | `https://...` |

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/register      # Register new user
POST   /api/v1/auth/login          # Login user
POST   /api/v1/auth/logout         # Logout user
GET    /api/v1/auth/me             # Get current user
POST   /api/v1/auth/refresh        # Refresh access token
```

### User Management

```
GET    /api/v1/users               # Get all users (Admin)
GET    /api/v1/users/:id           # Get user by ID
PATCH  /api/v1/users/:id           # Update user
DELETE /api/v1/users/:id           # Delete user (Admin)
PATCH  /api/v1/users/:id/role      # Change user role (Admin)
PATCH  /api/v1/users/:id/status    # Suspend/Activate user (Admin)
```

### Analytics

```
GET    /api/v1/stats/dashboard     # Get dashboard stats
GET    /api/v1/stats/trends        # Get activity trends
GET    /api/v1/activities          # Get audit logs
```

---

## 🔒 Security Features

### Implemented Security Measures

1. **Authentication**
   - JWT with short-lived access tokens
   - Secure HTTP-only cookies
   - Password hashing with bcrypt (10 rounds)

2. **Authorization**
   - Role-based access control (RBAC)
   - Route-level permission checks
   - Resource-level authorization

3. **Protection**
   - Helmet.js security headers
   - CORS configuration
   - Rate limiting on sensitive endpoints
   - Input validation with Zod
   - XSS protection
   - CSRF protection

4. **Monitoring**
   - Audit logging for all actions
   - Brute force detection
   - Suspicious activity alerts
   - Real-time security events

5. **Session Management**
   - Automatic session invalidation on suspension
   - Force logout capability
   - Session timeout configuration

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Slate (50-900)

### Components
- Glassmorphism cards with backdrop blur
- Smooth animations (300ms transitions)
- Responsive breakpoints (sm, md, lg, xl)
- Dark/Light theme support

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

---

## 📝 Scripts

```bash
# Development
npm run dev              # Run both client and server
npm run client           # Run client only
npm run server           # Run server only

# Building
npm run build            # Build client for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Lint all files
npm run format           # Format all files
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Senior Full-Stack Developer**
- 5+ years of experience in MERN stack
- Expertise in scalable, production-ready applications
- Focus on security and performance

---

## 🙏 Acknowledgments

- React team for React 19
- Tailwind Labs for Tailwind CSS 4
- Vercel for Vite
- MongoDB team for Mongoose
- All open-source contributors

---

**Version**: 2.0.0  
**Last Updated**: January 2026

For detailed API documentation, see the `/api/v1/docs` endpoint when running the server.
