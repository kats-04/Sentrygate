import express from 'express';
import { protect } from '../middleware/auth.js';
import { createNotification } from '../controllers/notificationController.js';

const router = express.Router();

/**
 * Test endpoint to trigger a real-time notification
 * POST /api/v1/test/notification
 */
router.post('/notification', protect, async (req, res) => {
    try {
        const { type = 'info', title = 'Test Notification', message = 'This is a test notification!' } = req.body;

        // Create notification for current user
        await createNotification(
            req.user.id,
            type,
            title,
            message,
            null
        );

        res.json({
            success: true,
            message: 'Test notification sent! Check your bell icon.'
        });
    } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Test endpoint to trigger notifications for all users
 * POST /api/v1/test/broadcast
 */
router.post('/broadcast', protect, async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const users = await User.find({}).limit(10);

        for (const user of users) {
            await createNotification(
                user._id,
                'alert',
                'Broadcast Test',
                `This is a broadcast notification sent at ${new Date().toLocaleTimeString()}`,
                null
            );
        }

        res.json({
            success: true,
            message: `Broadcast sent to ${users.length} users!`
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
