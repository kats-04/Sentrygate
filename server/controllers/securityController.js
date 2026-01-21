import LoginHistory from '../models/LoginHistory.js';
import ApiKey from '../models/ApiKey.js';
import User from '../models/User.js';

// Get active sessions for a user
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await LoginHistory.find({
      userId: req.user.id,
      success: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('ipAddress userAgent device location createdAt');

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Revoke a specific session
export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // In a real implementation, you would invalidate the session token
    // For now, we'll mark it as revoked in the login history
    await LoginHistory.findByIdAndUpdate(sessionId, {
      success: false,
      failureReason: 'Session revoked by user',
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Revoke all sessions except current
export const revokeAllSessions = async (req, res) => {
  try {
    // In a real implementation, you would invalidate all session tokens except current
    // For now, we'll update the login history
    await LoginHistory.updateMany(
      {
        userId: req.user.id,
        success: true,
        _id: { $ne: req.sessionId }, // Assuming sessionId is available
      },
      {
        success: false,
        failureReason: 'All sessions revoked by user',
      }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all active sessions (system-wide)
export const getAllActiveSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Assuming sessions created in last 24h are 'active' for this demo
    const yesterday = new Date(new Date() - 24 * 60 * 60 * 1000);

    const query = {
      createdAt: { $gte: yesterday },
      success: true
    };

    const sessions = await LoginHistory.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'name email role');

    const total = await LoginHistory.countDocuments(query);

    res.json({ data: sessions, total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Revoke any session
export const revokeAnySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await LoginHistory.findByIdAndUpdate(sessionId, {
      success: false,
      failureReason: 'Revoked by Admin',
    });
    res.json({ success: true, message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get audit trail with filters (Admin only can see all, regular user sees own)
export const getAuditTrail = async (req, res) => {
  try {
    const { limit = 50, type, userId, dateFrom, dateTo } = req.query;

    const query = {};

    // TeamLead sees only their team's logs
    if (req.user.role === 'TeamLead') {
      const teamUserIds = await User.find({ teams: { $in: req.user.teams || [] } }).select('_id');
      query.userId = { $in: teamUserIds.map(u => u._id) };
    }
    // If not admin, restrict to own data
    else if (req.user.role !== 'Admin' && req.user.role !== 'Auditor') {
      query.userId = req.user.id;
    } else if (userId) {
      // Admin/Auditor can filter by specific user
      query.userId = userId;
    }

    if (type) query.type = type;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const activities = await LoginHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('userId', 'name email')
      .select('ipAddress userAgent device location success failureReason createdAt type');

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export Audit Log (Admin only)
export const exportAuditLog = async (req, res) => {
  try {
    const { type, userId, dateFrom, dateTo } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const activities = await LoginHistory.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    const csvContent = [
      'Date,User Name,User Email,IP,Device,Status,Reason',
      ...activities.map(a =>
        `${a.createdAt.toISOString()},${a.userId?.name || 'N/A'},${a.userId?.email || 'N/A'},${a.ipAddress},${a.device || 'Unknown'},${a.success ? 'Success' : 'Failed'},${a.failureReason || ''}`
      )
    ].join('\n');

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="audit-log-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate API key
export const generateApiKey = async (req, res) => {
  try {
    const { name, permissions, targetUserId } = req.body;

    // Auditor cannot create keys
    if (req.user.role === 'Auditor') {
      return res.status(403).json({ message: 'Auditors cannot create API keys' });
    }

    let ownerId = req.user.id;

    // Handle creating key for another user
    if (targetUserId && targetUserId !== req.user.id) {
      if (req.user.role === 'Admin') {
        ownerId = targetUserId;
      } else if (req.user.role === 'TeamLead') {
        // Verify target user is in TeamLead's team
        const Team = (await import('../models/Team.js')).default;
        const isMember = await Team.exists({
          $or: [
            { owner: req.user.id, 'members.userId': targetUserId },
            { 'members': { $elemMatch: { userId: req.user.id, role: 'lead' } }, 'members.userId': targetUserId }
          ]
        });

        if (!isMember && targetUserId !== req.user.id) { // Allow TeamLead to create for self too
          // Additional check: maybe targetUserId IS the TeamLead (handled by !== above)
          // If not member, deny
          return res.status(403).json({ message: 'Cannot create API key for non-team member' });
        }
        ownerId = targetUserId;
      } else {
        return res.status(403).json({ message: 'Insufficient permissions to create API key for others' });
      }
    }

    const apiKey = await ApiKey.create({
      userId: ownerId,
      name,
      permissions: permissions || ['read'],
    });

    res.status(201).json({
      id: apiKey._id,
      name: apiKey.name,
      key: apiKey.key, // Only returned once
      permissions: apiKey.permissions,
      createdAt: apiKey.createdAt,
      userId: ownerId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's API keys
export const getApiKeys = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = { isActive: true };

    if (req.user.role === 'Admin' || req.user.role === 'Auditor') {
      // Admin/Auditor can see all, or filter by specific user
      if (userId) query.userId = userId;
    } else if (req.user.role === 'TeamLead') {
      // TeamLead sees own + team members
      const Team = (await import('../models/Team.js')).default;
      const teams = await Team.find({
        $or: [
          { owner: req.user.id },
          { 'members.userId': req.user.id, 'members.role': 'lead' }
        ]
      });
      const teamMemberIds = teams.flatMap(t => t.members.map(m => m.userId.toString()));
      const allowedIds = [...new Set([...teamMemberIds, req.user.id])]; // Unique IDs

      if (userId) {
        if (!allowedIds.includes(userId)) {
          return res.status(403).json({ message: 'Access denied to this user keys' });
        }
        query.userId = userId;
      } else {
        query.userId = { $in: allowedIds };
      }
    } else {
      // Regular User sees only own
      if (userId && userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      query.userId = req.user.id;
    }

    const apiKeys = await ApiKey.find(query)
      .select('name permissions lastUsed expiresAt createdAt userId')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(apiKeys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Revoke API key
export const revokeApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    // Auditor cannot revoke
    if (req.user.role === 'Auditor') {
      return res.status(403).json({ message: 'Auditors cannot revoke API keys' });
    }

    const apiKey = await ApiKey.findById(keyId);
    if (!apiKey) return res.status(404).json({ message: 'API key not found' });

    // Check permissions
    if (apiKey.userId.toString() !== req.user.id) {
      if (req.user.role === 'Admin') {
        // Admin can revoke any
      } else if (req.user.role === 'TeamLead') {
        // Check if key owner is in team
        const Team = (await import('../models/Team.js')).default;
        const isMember = await Team.exists({
          $or: [
            { owner: req.user.id, 'members.userId': apiKey.userId },
            { 'members': { $elemMatch: { userId: req.user.id, role: 'lead' } }, 'members.userId': apiKey.userId }
          ]
        });
        if (!isMember) {
          return res.status(403).json({ message: 'Cannot revoke API key of non-team member' });
        }
      } else {
        // User cannot revoke others
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    apiKey.isActive = false;
    apiKey.revokedAt = new Date();
    await apiKey.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update API key permissions
export const updateApiKeyPermissions = async (req, res) => {
  try {
    const { keyId } = req.params;
    const { permissions } = req.body;

    if (req.user.role === 'Auditor') {
      return res.status(403).json({ message: 'Auditors cannot update API keys' });
    }

    const apiKey = await ApiKey.findById(keyId);
    if (!apiKey) return res.status(404).json({ message: 'API key not found' });

    // Permission check (Same as revoke)
    if (apiKey.userId.toString() !== req.user.id) {
      if (req.user.role === 'Admin') {
        // Allowed
      } else if (req.user.role === 'TeamLead') {
        const Team = (await import('../models/Team.js')).default;
        const isMember = await Team.exists({
          $or: [
            { owner: req.user.id, 'members.userId': apiKey.userId },
            { 'members': { $elemMatch: { userId: req.user.id, role: 'lead' } }, 'members.userId': apiKey.userId }
          ]
        });
        if (!isMember) return res.status(403).json({ message: 'Access denied' });
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    apiKey.permissions = permissions;
    await apiKey.save();

    res.json(apiKey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
