import express from 'express';
// import { z } from 'zod';
import { pipeline } from 'stream';
import { stringify } from 'csv-stringify';
import multer from 'multer';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import activityLogger from '../middleware/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  updateProfile,
  changeRole,
  deleteUser,
  getAllUsers,
  getUserById,
  getUserActivity,
  uploadAvatar,
  updateUserStatus,
  resetUserMFA
} from '../controllers/usersController.js';
import { processAvatar } from '../middleware/imageProcessing.js'; // 2MB limit

import { authLimiter } from '../middleware/rateLimiter.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const router = express.Router();

// const searchSchema = z.object({
//   q: z.string().min(1).transform((s) => s.trim()),
//   limit: z.string().optional().transform((s) => (s ? Number(s) : 20)),
//   skip: z.string().optional().transform((s) => (s ? Number(s) : 0)),
// });

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get all users (admin or auditor)
router.use(authLimiter); // Apply rate limiting to all user routes
router.get('/', protect, authorize('Admin', 'Auditor'), asyncHandler(getAllUsers));

// Invite new user (admin only)
router.post('/invite', protect, authorize('Admin'), asyncHandler(async (req, res) => {
  const { name, email, role = 'User' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  // Create user with temporary password
  const tempPassword = `${Math.random().toString(36).slice(-10)}A1!`;
  const user = await User.create({
    name,
    email,
    password: tempPassword,
    role,
    status: 'active',
  });

  // TODO: Send email with credentials (requires email service)
  // await sendWelcomeEmail(email, name, tempPassword);

  return res.status(201).json({
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tempPassword, // Remove in production, send via email only
    },
    message: 'User invited successfully',
  });
}));


// Get current user's profile
router.get('/profile/me', protect, asyncHandler(async (req, res) => res.json({ data: req.user })));

// Get single user by ID (admin, auditor or self)
router.get('/:id', protect, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (id !== 'search' && id !== 'export' && id !== 'profile' && req.user._id.toString() !== id && req.user.role !== 'Admin' && req.user.role !== 'Auditor') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return getUserById(req, res, next);
}));

// Get user activity (admin, auditor or self)
router.get('/:id/activity', protect, asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.user._id.toString() !== id && req.user.role !== 'Admin' && req.user.role !== 'Auditor') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return getUserActivity(req, res, next);
}));

// Enhanced search with advanced filtering
router.get('/search', protect, authorize('Admin', 'Auditor'), asyncHandler(async (req, res) => {
  const {
    q, // search query
    role, // filter by role
    status, // filter by status
    dateFrom, // created after date
    dateTo, // created before date
    sortBy = 'createdAt', // sort field
    sortOrder = 'desc', // sort order
    limit = 20,
    skip = 0
  } = req.query;

  const filter = {};

  // Text search
  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  // Role filter
  if (role && ['Admin', 'TeamLead', 'User', 'Auditor'].includes(role)) {
    filter.role = role;
  }

  // Status filter
  if (status && ['active', 'inactive', 'archived'].includes(status)) {
    filter.status = status;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  // Sorting
  const sortOptions = {};
  const validSortFields = ['name', 'email', 'role', 'createdAt', 'lastLogin'];
  if (validSortFields.includes(sortBy)) {
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // default sort
  }

  const total = await User.countDocuments(filter);
  const data = await User.find(filter)
    .select('-password')
    .sort(sortOptions)
    .skip(parseInt(skip, 10))
    .limit(parseInt(limit, 10));

  return res.json({
    total,
    count: data.length,
    data,
    filters: { q, role, status, dateFrom, dateTo, sortBy, sortOrder }
  });
}));

// CSV export (admin or auditor) - streams results
router.get('/export', protect, authorize('Admin', 'Auditor'), asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');

  const cursor = User.find().select('name email role createdAt lastLogin').cursor();
  const stringifier = stringify({ header: true, columns: ['name', 'email', 'role', 'createdAt', 'lastLogin'] });

  pipeline(cursor.stream(), stringifier, res, (err) => {
    if (err) console.error('CSV stream failed', err);
  });
}));

// Delete user (admin)
router.delete('/:id', protect, authorize('Admin'), activityLogger, asyncHandler(deleteUser));

// Update own profile
router.patch('/profile', protect, activityLogger, asyncHandler(updateProfile));

// Upload avatar (self)
router.post('/profile/avatar', protect, upload.single('avatar'), processAvatar, asyncHandler(uploadAvatar));

// Change role (admin)
router.patch('/:id/role', protect, authorize('Admin'), activityLogger, asyncHandler(changeRole));

// Update user status
router.patch('/:id/status', authorize('Admin'), updateUserStatus);

// Reset MFA
router.post('/:id/reset-mfa', authorize('Admin'), resetUserMFA);

export default router;
