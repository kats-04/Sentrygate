import { ZodError } from 'zod';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

// const NODE_ENV = process.env.NODE_ENV || 'development';

export async function protect(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) return res.status(401).json({ error: 'Invalid token' });

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ZodError) return next(err);
    return next(err);
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}

export default { protect, authorize };
