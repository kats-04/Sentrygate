import express from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { strictAuthLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Apply strict rate limiter to registration and login to prevent brute force
router.post('/register', strictAuthLimiter, asyncHandler(register));
router.post('/login', strictAuthLimiter, asyncHandler(login));

// Logout should be protected so we know who logged out, but still allow it
router.post('/logout', protect, asyncHandler(logout));

// current user
router.get('/me', protect, asyncHandler(me));

export default router;
