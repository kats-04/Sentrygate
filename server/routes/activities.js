import express from 'express';
import { z } from 'zod';
import Activity from '../models/Activity.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const activityQuerySchema = z.object({
  limit: z.string().optional().transform((s) => (s ? Number(s) : 20)),
  skip: z.string().optional().transform((s) => (s ? Number(s) : 0)),
});

// Get recent activities (admin or auditor)
router.get('/', protect, authorize('Admin', 'Auditor'), async (req, res) => {
  try {
    const parsed = activityQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.format() });
    }
    const { limit, skip } = parsed.data;

    console.log(`Fetching activities: limit=${limit}, skip=${skip}`);

    const total = await Activity.countDocuments();
    const activities = await Activity.find()
      .populate('actorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      total,
      count: activities.length,
      data: activities,
    });
  } catch (err) {
    console.error('Error in GET /activities:', err);
    return res.status(500).json({ message: 'Internal Server Error while fetching activities', details: err.message });
  }
});

export default router;
