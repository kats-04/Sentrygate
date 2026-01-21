// import mongoose from 'mongoose';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

// Returns 7-day growth, role distribution, and active sessions
export async function getStats(req, res, next) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6); // include today -> 7 days
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 7-day registrations by day
    const growthPipeline = [
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const growth = await User.aggregate(growthPipeline);

    // role distribution
    const rolePipeline = [
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ];
    const roleDist = await User.aggregate(rolePipeline);

    // active sessions (lastLogin within 30 days)
    const activeWindow = new Date();
    activeWindow.setDate(activeWindow.getDate() - 30);
    const activeCount = await User.countDocuments({ lastLogin: { $gte: activeWindow } });

    // total users
    const totalUsers = await User.estimatedDocumentCount();

    return res.json({
      totalUsers,
      activeSessions: activeCount,
      roleDistribution: roleDist.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      growth,
    });
  } catch (err) {
    return next(err);
  }
}

// Get user activity trends
export async function getActivityTrends(req, res, next) {
  try {
    const { days = 30 } = req.query;
    const daysNum = Math.min(Math.max(1, parseInt(days, 10)), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    const trends = await Activity.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          types: {
            $push: '$actionType',
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Process activity types
    const processedTrends = trends.map((trend) => ({
      date: trend._id,
      totalActivities: trend.count,
      byType: trend.types.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
    }));

    return res.json({ data: processedTrends });
  } catch (err) {
    return next(err);
  }
}

// Get user engagement metrics
export async function getEngagement(req, res, next) {
  try {
    const now = new Date();

    // 7-day active users
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const activeLastWeek = await User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });

    // 30-day active users
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const activeLastMonth = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });

    // Total activities
    const totalActivities = await Activity.countDocuments();

    // Average activities per user
    const totalUsers = await User.countDocuments();
    const avgActivities = totalUsers > 0 ? (totalActivities / totalUsers).toFixed(2) : 0;

    // Most active day of week
    const weekdayStats = await Activity.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return res.json({
      engagement: {
        activeLastWeek,
        activeLastMonth,
        totalActivities,
        totalUsers,
        avgActivitiesPerUser: parseFloat(avgActivities),
        mostActiveDayOfWeek: weekdayStats[0]
          ? { day: dayNames[weekdayStats[0]._id - 1], count: weekdayStats[0].count }
          : null,
      },
    });
  } catch (err) {
    return next(err);
  }
}

// Get admin dashboard summary
export async function getDashboardSummary(req, res, next) {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Today's registrations
    const todayRegistrations = await User.countDocuments({ createdAt: { $gte: startOfDay } });

    // Today's logins
    const todayLogins = await Activity.countDocuments({
      createdAt: { $gte: startOfDay },
      actionType: 'LOGIN',
    });

    // Role-based activity filtering
    let activityQuery = {};
    if (req.user.role === 'User') {
      activityQuery = { actorId: req.user.id };
    } else if (req.user.role === 'TeamLead') {
      // TeamLeads see their own activity + their team members' activity
      const Team = (await import('../models/Team.js')).default;
      const teams = await Team.find({
        $or: [
          { owner: req.user.id },
          { 'members.userId': req.user.id, 'members.role': 'lead' }
        ]
      });

      // Get all team member IDs
      const teamMemberIds = teams.flatMap(team =>
        team.members.map(m => m.userId.toString())
      );

      activityQuery = { actorId: { $in: [...teamMemberIds, req.user.id] } };
    }
    // Admin and Auditor see all activity

    const recentActivity = await Activity.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(10);

    // User growth (30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const growthLast30 = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    return res.json({
      summary: {
        todayRegistrations,
        todayLogins,
        growthLast30Days: growthLast30,
        recentActivity,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export default { getStats, getActivityTrends, getEngagement, getDashboardSummary };
