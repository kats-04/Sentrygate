import Activity from '../models/Activity.js';

async function activityLogger(req, res, next) {
  // Only log write operations
  const writes = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!writes.includes(req.method)) return next();

  try {
    const actorId = req.user?._id || null;
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.get('User-Agent') || '';
    const actionType = `${req.method}:${req.baseUrl || req.path}`;
    const message = `Performed ${actionType}`;

    // capture body for context but keep it small
    const meta = { bodyKeys: Object.keys(req.body || {}).slice(0, 10) };

    await Activity.create({ actorId, user: req.params.id || req.body.user || null, actionType, message, meta, ip, userAgent });
  } catch (err) {
    // Don't block the request if logging fails
    console.error('Activity logger failed', err);
  }
  return next();
}

export default activityLogger;
