import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAuditTrail,
  generateApiKey,
  getApiKeys,
  revokeApiKey,
  updateApiKeyPermissions,
  getAllActiveSessions,
  revokeAnySession,
  exportAuditLog
} from '../controllers/securityController.js';
// import TwoFactor from '../models/TwoFactor.js';
import Session from '../models/Session.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.use(authLimiter); // Apply rate limiting to all security routes

// All security routes require authentication
router.use(protect);

// ==================== SESSION MANAGEMENT ====================

/**
 * GET /api/v1/security/sessions
 * Get all active sessions for current user
 */
router.get('/sessions', asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    userId: req.user._id,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ lastActivity: -1 });

  return res.json({
    total: sessions.length,
    data: sessions,
  });
}));

/**
 * DELETE /api/v1/security/sessions/:id
 * Revoke a specific session
 */
router.delete('/sessions/:id', asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.isActive = false;
  session.revokedAt = new Date();
  await session.save();

  return res.json({ message: 'Session revoked successfully' });
}));

/**
 * DELETE /api/v1/security/sessions
 * Revoke all sessions except current
 */
router.delete('/sessions', asyncHandler(async (req, res) => {
  const currentSessionId = req.headers['x-session-id']; // Would come from auth middleware

  await Session.updateMany(
    {
      userId: req.user._id,
      _id: { $ne: currentSessionId },
      isActive: true,
    },
    {
      $set: {
        isActive: false,
        revokedAt: new Date(),
      },
    }
  );

  return res.json({ message: 'All other sessions revoked successfully' });
}));

// ==================== AUDIT TRAIL ====================

/**
 * GET /api/v1/security/audit
 * Get audit trail with IP and location data
 * Query params: limit, type, startDate, endDate
 */

router.get('/audit', authorize('Admin', 'Auditor'), getAuditTrail);

/**
 * GET /api/v1/security/audit/export
 * Export audit logs as CSV
 */
router.get('/audit/export', authorize('Admin'), exportAuditLog);

/**
 * GET /api/v1/security/admin/sessions
 * Admin: Get all active sessions
 */
router.get('/admin/sessions', authorize('Admin'), getAllActiveSessions);

/**
 * DELETE /api/v1/security/admin/sessions/:sessionId
 * Admin: Revoke any session
 */
router.delete('/admin/sessions/:sessionId', authorize('Admin'), revokeAnySession);

// ==================== API KEY MANAGEMENT ====================

/**
 * GET /api/v1/security/api-keys
 * Get all API keys for current user
 */
router.get('/api-keys', getApiKeys);

/**
 * POST /api/v1/security/api-keys
 * Generate new API key
 * Body: { name, permissions }
 */
router.post('/api-keys', generateApiKey);

/**
 * POST /api/v1/security/api-keys/:keyId/revoke
 * Revoke specific API key
 */
router.post('/api-keys/:keyId/revoke', revokeApiKey);

/**
 * PATCH /api/v1/security/api-keys/:keyId/permissions
 * Update API key permissions
 * Body: { permissions }
 */
router.patch('/api-keys/:keyId/permissions', updateApiKeyPermissions);

// ==================== TWO-FACTOR AUTHENTICATION ====================

/**
 * GET /api/v1/security/2fa/status
 * Get 2FA status for current user
 */
// router.get('/2fa/status', get2FAStatus);

/**
 * POST /api/v1/security/2fa/setup
 * Setup 2FA for current user
 * Body: { method: 'totp' | 'sms' | 'email' }
 */
// router.post('/2fa/setup', setup2FA);

/**
 * POST /api/v1/security/2fa/verify
 * Verify 2FA setup with token
 * Body: { token, method }
 */
// router.post('/2fa/verify', verify2FA);

/**
 * POST /api/v1/security/2fa/backup-codes
 * Generate new backup codes
 */
// router.post('/2fa/backup-codes', generateBackupCodes);

/**
 * POST /api/v1/security/2fa/disable
 * Disable 2FA for current user
 * Body: { token }
 */
// router.post('/2fa/disable', disable2FA);

export default router;
