import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
import dotenv from 'dotenv';

import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import activitiesRoutes from './routes/activities.js';
import advancedRoutes from './routes/advanced.js';
import securityRoutes from './routes/security.js';
import webhooksRoutes from './routes/webhooks.js';
import { protect, authorize } from './middleware/auth.js';
import { blockAuditorWrites } from './middleware/auditorReadOnly.js';
import { getStats, getActivityTrends, getEngagement, getDashboardSummary, } from './controllers/statsController.js';
import errorHandler from './middleware/errorHandler.js';
// import { apiLimiter, uploadLimiter } from './middleware/rateLimiter.js';

dotenv.config();

// Initialize Sentry for error tracking (Phase 4)
if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0, // Capture 100% of transactions (adjust in production)
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: true }),
    ],
  });
}

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Socket.io connection handling (Phase 5)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // Join team room for team notifications
  socket.on('join-team-room', (teamId) => {
    socket.join(`team_${teamId}`);
    console.log(`User joined team room team_${teamId}`);
  });

  // Join admins room for security alerts
  socket.on('join-admin-room', () => {
    socket.join('admins');
    console.log('Admin joined security alerts room:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally for controllers
global.io = io;
export { io };

// Middleware
app.set('trust proxy', 1); // Trust Render's proxy
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));

// Sentry request handler (must be first)
if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
  app.use(Sentry.Handlers.requestHandler());
}

// HTTP request logging with Morgan (Phase 4)
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'tiny';
app.use(morgan(morganFormat, {
  skip: (req) => req.path === '/api/health', // Don't log health checks
  stream: process.stdout,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Custom request logging middleware (for additional context)
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (req.path !== '/api/health') {
      console.log(`[${req.method} ${req.path}] completed in ${duration}ms (${res.statusCode})`);
    }
  });
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// User management routes
app.use('/api/v1/users', usersRoutes);

// Activity audit trail routes
app.use('/api/v1/activities', activitiesRoutes);

// Security routes: Sessions, API Keys, Audit Trail (Phase 5)
app.use('/api/v1/security', securityRoutes);

// Global middleware to block Auditor write operations
app.use('/api/v1', blockAuditorWrites);

// Webhook routes
app.use('/api/v1/webhooks', webhooksRoutes);

// Advanced features: Analytics, Notifications, Teams (Phase 5)
app.use('/api/v1', advancedRoutes);

// Analytics & Dashboard routes
app.get('/api/v1/dashboard/stats', protect, getStats);
app.get('/api/v1/analytics/trends', protect, authorize('Admin'), getActivityTrends);
app.get('/api/v1/analytics/engagement', protect, authorize('Admin'), getEngagement);
app.get('/api/v1/dashboard/summary', protect, getDashboardSummary);

// Test routes (development only)
if (NODE_ENV === 'development') {
  const testRoutes = (await import('./routes/test.js')).default;
  app.use('/api/v1/test', testRoutes);
  console.log('🧪 Test routes enabled at /api/v1/test');
}

// Legacy endpoints (keeping for backward compatibility)
app.get('/api/users', (req, res) => {
  res.json({ data: [], message: 'Use /api/v1/users instead' });
});

app.get('/api/analytics', (req, res) => {
  res.json({ data: [], message: 'Use /api/v1/analytics/* instead' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} does not exist`,
    path: req.path,
  });
});

// Sentry error handler (must be after routes but before global error handler)
if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
  app.use(Sentry.Handlers.errorHandler());
}

// Global error handler
app.use(errorHandler);

// Start Server after DB connection
async function start() {
  try {
    await connectDB();

    // Seed demo users for in-memory DB
    const User = (await import('./models/User.js')).default;
    const demoUsers = [
      { name: 'Admin User', email: 'admin@example.com', password: 'admin12345', role: 'Admin', status: 'active' },
      { name: 'Team Lead', email: 'teamlead@example.com', password: 'teamlead123', role: 'TeamLead', status: 'active' },
      { name: 'Regular User', email: 'user@example.com', password: 'user12345', role: 'User', status: 'active' },
    ];

    for (const userData of demoUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
        console.log(`✅ Created demo user: ${userData.email}`);
      }
    }

    server.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════════════╗\n║           🛡️  SentryGate Server 🛡️              ║\n║     Verified access. Visible actions.          ║\n╠════════════════════════════════════════════════╣\n   Server running on http://localhost:${PORT}    \n   Environment: ${NODE_ENV.padEnd(38)}           \n   API: http://localhost:${PORT}/api/health      \n╚════════════════════════════════════════════════╝\n  `);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
