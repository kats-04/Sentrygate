#!/usr/bin/env node

import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server with in-memory MongoDB
async function startServer() {
  try {
    console.log('[E2E] Starting in-memory MongoDB...');
    const mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    console.log('[E2E] In-memory MongoDB URI:', uri);

    console.log('[E2E] Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('[E2E] MongoDB connected');

    const server = app.listen(PORT, () => {
      console.log(`[E2E] Server running on http://localhost:${PORT}`);
    });

    return { server, mongoMemoryServer, mongoose };
  } catch (err) {
    console.error('[E2E] Failed to start:', err);
    process.exit(1);
  }
}

// Main
const { server, mongoMemoryServer } = await startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[E2E] Shutting down...');
  server.close();
  await mongoose.disconnect();
  await mongoMemoryServer.stop();
  process.exit(0);
});
