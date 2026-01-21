#!/usr/bin/env node
/**
 * E2E Smoke Test
 * Starts server with in-memory MongoDB, then tests:
 * 1. Register user
 * 2. Login
 * 3. GET /me
 * 4. GET /stats
 */

import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = 5001;
const JWT_SECRET = 'test-secret';

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// User Schema (inline for this test)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ role: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ lastLogin: 1 });

const User = mongoose.model('User', userSchema);

// Register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    });
    const data = schema.parse(req.body);
    console.log('[Register] Creating user:', data.email);
    // Hash password before creating
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    });
    console.log('[Register] User created:', user._id);
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    return res.status(201).json({ data: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });
    const data = schema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user || !(await user.comparePassword(data.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    return res.json({ data: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[Login Error]', err.message);
    return res.status(400).json({ error: err.message || 'Login failed' });
  }
});

// Middleware: verify token
function protect(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Me
app.get('/api/v1/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ data: user });
  } catch (err) {
    console.error('[Me Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Stats (aggregation)
app.get('/api/v1/dashboard/stats', protect, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const roleDist = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const activeWindow = new Date();
    activeWindow.setDate(activeWindow.getDate() - 30);
    const activeCount = await User.countDocuments({ lastLogin: { $gte: activeWindow } });

    const totalUsers = await User.estimatedDocumentCount();

    return res.json({
      totalUsers,
      activeSessions: activeCount,
      roleDistribution: roleDist.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      growth,
    });
  } catch (err) {
    console.error('[Stats Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Error handler
// (omitted for this E2E test - not needed)

// Start server
async function start() {
  try {
    console.log('[E2E] Starting in-memory MongoDB...');
    const mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    console.log('[E2E] In-memory MongoDB ready');

    console.log('[E2E] Connecting Mongoose...');
    await mongoose.connect(uri);
    console.log('[E2E] MongoDB connected');

    const server = app.listen(PORT, () => {
      console.log(`[E2E] Server running on http://localhost:${PORT}`);
      runTests();
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('[E2E] Shutting down...');
      server.close();
      await mongoose.disconnect();
      await mongoMemoryServer.stop();
      process.exit(0);
    });
  } catch (err) {
    console.error('[E2E] Startup failed:', err.message);
    process.exit(1);
  }
}

// Test helper
async function request(method, path, body = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (cookies) options.headers.Cookie = cookies;
    if (body) options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const setCookie = res.headers['set-cookie']?.[0];
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
          setCookie,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('\n[E2E] Starting smoke tests...\n');
  const tests = [];

  try {
    // Test 1: Register
    console.log('[TEST 1] POST /api/v1/auth/register');
    const regRes = await request('POST', '/api/v1/auth/register', {
      name: 'E2E Tester',
      email: 'e2e@test.com',
      password: 'password123',
    });
    console.log(`  Status: ${regRes.status} (expected 201)`);
    console.log(`  Response:`, JSON.stringify(regRes.body, null, 2));
    tests.push({ name: 'Register', pass: regRes.status === 201 });
    const registerCookie = regRes.setCookie;

    // Test 2: Login
    console.log('\n[TEST 2] POST /api/v1/auth/login');
    const loginRes = await request('POST', '/api/v1/auth/login', {
      email: 'e2e@test.com',
      password: 'password123',
    });
    console.log(`  Status: ${loginRes.status} (expected 200)`);
    console.log(`  Response:`, JSON.stringify(loginRes.body, null, 2));
    tests.push({ name: 'Login', pass: loginRes.status === 200 });
    const loginCookie = loginRes.setCookie;
    const authCookie = loginCookie || registerCookie;

    // Test 3: GET /me
    console.log('\n[TEST 3] GET /api/v1/auth/me');
    const meRes = await request('GET', '/api/v1/auth/me', null, authCookie);
    console.log(`  Status: ${meRes.status} (expected 200)`);
    console.log(`  Response:`, JSON.stringify(meRes.body, null, 2));
    tests.push({ name: 'Get Me', pass: meRes.status === 200 });

    // Test 4: GET /stats
    console.log('\n[TEST 4] GET /api/v1/dashboard/stats');
    const statsRes = await request('GET', '/api/v1/dashboard/stats', null, authCookie);
    console.log(`  Status: ${statsRes.status} (expected 200)`);
    console.log(`  Response:`, JSON.stringify(statsRes.body, null, 2));
    tests.push({ name: 'Get Stats', pass: statsRes.status === 200 });

    // Summary
    console.log('\n[E2E] Test Summary');
    console.log('─'.repeat(50));
    tests.forEach((t) => {
      const icon = t.pass ? '✓' : '✗';
      console.log(`${icon} ${t.name}`);
    });
    const passed = tests.filter((t) => t.pass).length;
    console.log(`\nPassed: ${passed}/${tests.length}`);

    if (passed === tests.length) {
      console.log('\n🎉 All E2E tests passed!\n');
    }

    setTimeout(() => process.exit(passed === tests.length ? 0 : 1), 500);
  } catch (err) {
    console.error('[E2E] Test error:', err);
    process.exit(1);
  }
}

// Start
start();
