import { z } from 'zod';
import { parse as csvParse } from 'csv-parse';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from '../utils/email.js';
import Activity from '../models/Activity.js';

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional().transform((s) => (typeof s === 'string' ? s.trim() : s)),
  avatarUrl: z.string().url().optional(),
});

const roleSchema = z.object({
  role: z.enum(['Admin', 'TeamLead', 'User']),
});

// Get all users (admin only)
export async function getAllUsers(req, res) {
  const { page = 1, limit = 10, role } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  // TeamLead sees only their team's users
  if (req.user.role === 'TeamLead') {
    filter.teams = { $in: req.user.teams || [] };
  } else if (role && ['Admin', 'User', 'TeamLead', 'Auditor'].includes(role)) {
    filter.role = role;
  }

  const total = await User.countDocuments(filter);
  const data = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return res.json({
    data,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
}

// Get single user by ID (admin or self)
export async function getUserById(req, res) {
  const { id } = req.params;
  const user = await User.findById(id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ data: user });
}

// Update profile (self)
export async function updateProfile(req, res) {
  const data = profileUpdateSchema.parse(req.body);
  const userId = req.user._id;
  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ data: user });
}

// Change role (admin only)
export async function changeRole(req, res) {
  const { id } = req.params;
  const data = roleSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(id, { role: data.role }, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Notify user
  try {
    const template = emailTemplates.securityAlert(
      'Role Updated',
      `Your account role has been updated to <strong>${data.role}</strong>. You now have access to ${data.role} features.`
    );
    sendEmail(user.email, 'Account Role Update', template.html).catch(err => {
      console.error('Failed to send role update email:', err.message);
    });
  } catch (err) {
    console.error('Failed to send role update email:', err.message);
  }

  // Real-time updates
  if (global.io) {
    global.io.emit('user-updated', { userId: user._id, role: user.role });
    global.io.to(`user_${user._id}`).emit('notification', {
      type: 'info',
      message: `Your role has been updated to ${user.role}`
    });

    // Admin Audit Log Stream
    global.io.to('admins').emit('admin-action', {
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'ROLE_CHANGE',
      details: `Changed ${user.name}'s role to ${user.role}`,
      timestamp: new Date()
    });
  }

  // Log activity
  await Activity.create({
    actorId: req.user._id,
    actor: { name: req.user.name, email: req.user.email, role: req.user.role },
    targetId: user._id,
    targetModel: 'User',
    actionType: 'ROLE_CHANGE',
    message: `Changed ${user.name}'s role to ${data.role}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  return res.json({ data: user });
}

// Delete user (admin only)
export async function deleteUser(req, res) {
  const { id } = req.params;
  if (id === req.user._id.toString()) {
    return res.status(403).json({ error: 'Admin cannot delete their own account.' });
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ message: 'User deleted successfully', data: { id: user._id } });
}

// Get user activity (admin or self)
export async function getUserActivity(req, res) {
  const { id } = req.params;
  const Activity = (await import('../models/Activity.js')).default;
  const { limit = 20, skip = 0 } = req.query;

  const activities = await Activity.find({ user: id })
    .sort({ createdAt: -1 })
    .skip(parseInt(skip, 10))
    .limit(parseInt(limit, 10));

  const total = await Activity.countDocuments({ user: id });

  return res.json({ data: activities, total });
}

// Deactivate user (admin only)
export async function deactivateUser(req, res) {
  const { id } = req.params;
  if (id === req.user._id.toString()) {
    return res.status(400).json({ error: 'Cannot deactivate your own account' });
  }
  const user = await User.findByIdAndUpdate(
    id,
    { status: 'inactive' },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ data: user, message: 'User deactivated' });
}

// Archive user (admin only)
export async function archiveUser(req, res) {
  const { id } = req.params;
  if (id === req.user._id.toString()) {
    return res.status(400).json({ error: 'Cannot archive your own account' });
  }
  const user = await User.findByIdAndUpdate(
    id,
    { status: 'archived' },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ data: user, message: 'User archived' });
}

// Upload user avatar
export async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  await fs.mkdir(uploadsDir, { recursive: true });

  // Generate unique filename
  const filename = `${userId}-${Date.now()}.webp`;
  const filepath = path.join(uploadsDir, filename);

  // Process image with Sharp (resize and compress)
  await sharp(req.file.buffer)
    .resize(200, 200, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 80 })
    .toFile(filepath);

  // Delete old avatar if exists
  if (user.avatarUrl && user.avatarUrl.includes('/uploads/avatars/')) {
    const oldFilename = path.basename(user.avatarUrl);
    const oldFilepath = path.join(uploadsDir, oldFilename);
    try {
      await fs.unlink(oldFilepath);
    } catch (err) {
      // Ignore if file doesn't exist
    }
  }

  // Update user avatar URL
  const avatarUrl = `/uploads/avatars/${filename}`;
  user.avatarUrl = avatarUrl;
  await user.save();

  return res.json({
    success: true,
    data: {
      avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    }
  });
}

// Bulk import users from CSV
export async function bulkImportUsers(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const users = [];
  const errors = [];

  const parser = csvParse({
    columns: true,
    skip_empty_lines: true,
  });

  parser.on('readable', () => {
    let record = parser.read();
    while (record !== null) {
      try {
        if (!record.email || !record.name) {
          errors.push(`Row ${users.length + 1}: Missing required fields (email, name)`);
          record = parser.read();
        } else {
          // Check if user already exists
          const existingUser = User.findOne({ email: record.email });
          if (existingUser) {
            errors.push(`Row ${users.length + 1}: User with email ${record.email} already exists`);
            record = parser.read();
          } else {

            users.push({
              name: record.name,
              email: record.email,
              password: record.password || 'TemporaryPassword123!',
              role: record.role || 'User',
              status: 'active',
            });
            record = parser.read();
          }
        }
      } catch (err) {
        errors.push(`Row ${users.length + 1}: ${err.message}`);
        record = parser.read();
      }
    }
  });

  parser.on('error', (err) => res.status(400).json({ error: `CSV parsing error: ${err.message}` }));

  parser.on('end', async () => {
    if (users.length === 0) {
      return res.status(400).json({ error: 'No valid users to import', errors });
    }

    try {
      const imported = await User.insertMany(users, { ordered: false });
      res.json({
        success: true,
        imported: imported.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  if (req.file.buffer) {
    parser.write(req.file.buffer.toString());
  }
  parser.end();
}

// Update user status (Admin only)
export async function updateUserStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'suspended', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  if (id === req.user._id.toString()) {
    return res.status(403).json({ error: 'Cannot change your own status' });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).select('-password');

  if (!user) return res.status(404).json({ error: 'User not found' });

  // Real-time handling
  if (global.io) {
    global.io.emit('user-updated', { userId: user._id, status: user.status });

    if (status === 'suspended') {
      // Force logout by telling the specific user's socket room
      global.io.to(`user_${user._id}`).emit('force-logout', {
        reason: 'Your account has been suspended by an administrator.'
      });
    }

    global.io.to('admins').emit('admin-action', {
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'STATUS_CHANGE',
      details: `Changed ${user.name}'s status to ${status}`,
      timestamp: new Date()
    });
  }

  // Log activity
  await Activity.create({
    actorId: req.user._id,
    actor: { name: req.user.name, email: req.user.email, role: req.user.role },
    targetId: user._id,
    targetModel: 'User',
    actionType: 'USER_UPDATE',
    message: `Changed ${user.name}'s status to ${status}`,
    metadata: { newValues: { status } },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  return res.json({ data: user });
}

// Reset MFA for user (Admin only)
export async function resetUserMFA(req, res) {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // In a real app with MFA, we would clear the mfaSecret
  // user.mfaSecret = null;
  // user.mfaEnabled = false;
  // await user.save();

  // For now, we simulate the action
  return res.json({ message: 'MFA reset successfully (Simulation)' });
}
