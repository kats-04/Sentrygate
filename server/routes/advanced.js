import { Router } from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as teamController from '../controllers/teamController.js';
import * as usersController from '../controllers/usersController.js';

import { authLimiter } from '../middleware/rateLimiter.js';
import * as systemSettingsController from '../controllers/systemSettingsController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// System Settings Routes (Admin Only)
router.get('/admin/settings', protect, authorize('Admin'), systemSettingsController.getSettings);
router.patch('/admin/settings', protect, authorize('Admin'), systemSettingsController.updateSettings);
router.use(authLimiter); // Apply rate limiting to all advanced routes

// Analytics routes
router.get('/stats/users', protect, authorize('Admin', 'Auditor'), analyticsController.getUserStats);
router.get('/stats/login', protect, authorize('Admin', 'Auditor'), analyticsController.getLoginStats);
router.get('/stats/login-history', protect, authorize('Admin', 'Auditor'), analyticsController.getLoginHistory);
router.get('/stats/devices', protect, authorize('Admin', 'Auditor'), analyticsController.getDeviceStats);
router.get('/stats/performance', protect, authorize('Admin', 'Auditor'), analyticsController.getPerformanceMetrics);

// Advanced Analytics routes (Phase 5)
router.get('/analytics/dau-mau', protect, authorize('Admin', 'Auditor'), analyticsController.getDAUMAUTracking);
router.get('/analytics/device-browser-heatmap', protect, authorize('Admin', 'Auditor'), analyticsController.getDeviceBrowserHeatmap);
router.get('/analytics/export', protect, authorize('Admin', 'Auditor'), analyticsController.exportAnalyticsData);

// Notification routes
router.get('/notifications', protect, notificationController.getNotifications);
router.put('/notifications/:notificationId/read', protect, notificationController.markAsRead);
router.put('/notifications/read-all', protect, notificationController.markAllAsRead);
router.delete('/notifications/:notificationId', protect, notificationController.deleteNotification);
router.get('/notifications/preferences', protect, notificationController.getPreferences);
router.put('/notifications/preferences', protect, notificationController.updatePreferences);
router.post('/notifications/bulk', protect, notificationController.sendBulkNotifications);
router.post('/notifications/subscribe', protect, notificationController.subscribeToPush);
router.post('/notifications/unsubscribe', protect, notificationController.unsubscribeFromPush);

// Team routes
router.get('/teams', protect, authorize('Admin', 'Auditor'), teamController.getAllTeams);
router.get('/teams/my', protect, teamController.getUserTeams);
router.post('/teams', protect, authorize('Admin', 'TeamLead'), teamController.createTeam);
router.put('/teams/:teamId', protect, authorize('Admin', 'TeamLead'), teamController.updateTeam);
router.delete('/teams/:teamId/archive', protect, authorize('Admin', 'TeamLead'), teamController.archiveTeam);
router.post('/teams/:teamId/members', protect, authorize('Admin', 'TeamLead'), teamController.addMember);
router.delete('/teams/:teamId/members/:userId', protect, authorize('Admin', 'TeamLead'), teamController.removeMember);
router.put('/teams/:teamId/members/:userId/permissions', protect, authorize('Admin', 'TeamLead'), teamController.updateMemberPermissions);
router.post('/teams/:teamId/bulk-import', protect, authorize('Admin', 'TeamLead'), upload.single('file'), teamController.bulkImportMembers);
router.get('/teams/:teamId/export', protect, authorize('Admin', 'TeamLead', 'Auditor'), teamController.exportTeamMembers);

// User management routes (existing ones + new)
router.post('/users/bulk-import', protect, upload.single('file'), usersController.bulkImportUsers);
router.put('/users/:id/deactivate', protect, usersController.deactivateUser);
router.put('/users/:id/archive', protect, usersController.archiveUser);

export default router;
