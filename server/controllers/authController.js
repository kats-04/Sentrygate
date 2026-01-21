import { z } from 'zod';
import User from '../models/User.js';
// import SecurityMonitor from '../utils/SecurityMonitor.js';
import Activity from '../models/Activity.js';
import LoginHistory from '../models/LoginHistory.js';
import { signToken } from '../utils/jwt.js';
import { sendEmail, emailTemplates } from '../utils/email.js';

const NODE_ENV = process.env.NODE_ENV || 'development';
const COOKIE_SECURE = NODE_ENV === 'production' || process.env.FORCE_SECURE === 'true';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['Admin', 'TeamLead', 'User', 'Auditor']).optional(), // Allowed for demo
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    console.log('Creating user...');
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'User', // Default to User if not provided
    });
    console.log('User created:', user._id);

    const token = signToken({ id: user._id, role: user.role });
    res.cookie('token', token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SECURE ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    console.log('Creating activity...');
    await Activity.create({
      actorId: user._id,
      actor: { name: user.name, email: user.email, role: user.role },
      actionType: 'REGISTER',
      message: 'User registered',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    // Also create a LoginHistory entry since registration signs them in
    await LoginHistory.create({
      userId: user._id,
      email: user.email,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      device: 'unknown',
      success: true,
      message: 'Registration successful'
    });

    // Send welcome email (don't block registration if email fails)
    const welcomeTemplate = emailTemplates.welcome(user.name);
    sendEmail(user.email, welcomeTemplate.subject, welcomeTemplate.html).catch(err => {
      console.warn('Welcome email failed (non-critical):', err.message);
    });

    return res.status(201).json({ data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('REGISTER ERROR TRACE:', err);
    throw err;
  }
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (user.isSuspended()) {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
  }

  const match = await user.comparePassword(data.password);
  // const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Analyze login attempt for security threats
  // const securityAnalysis = await SecurityMonitor.analyzeLoginAttempt(ipAddress, match, user._id);

  if (!match) {
    // Log failed attempt with security analysis
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = signToken({ id: user._id, role: user.role });
  res.cookie('token', token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SECURE ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  await Activity.create({
    actorId: user._id,
    actor: { name: user.name, email: user.email, role: user.role },
    actionType: 'LOGIN',
    message: 'User logged in',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  // Create Login History for Security/Audit logs
  await LoginHistory.create({
    userId: user._id,
    email: user.email,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    device: 'unknown', // Could be parsed from user-agent if a library was available
    success: true,
  });

  // Send login notification email (don't block login if email fails)
  const loginTemplate = emailTemplates.securityAlert('Successful Login', `Your account was accessed from ${req.ip || 'unknown location'}`);
  sendEmail(user.email, loginTemplate.subject, loginTemplate.html).catch(err => {
    console.warn('Login notification email failed (non-critical):', err.message);
  });

  return res.json({ data: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function logout(req, res) {
  res.clearCookie('token', { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SECURE ? 'none' : 'lax', path: '/' });
  if (req.user && req.user._id) {
    await Activity.create({
      actorId: req.user._id,
      actor: { name: req.user.name, email: req.user.email, role: req.user.role },
      actionType: 'LOGOUT',
      message: 'User logged out',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  }
  return res.json({ message: 'Logged out' });
}

export async function me(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  return res.json({ data: req.user });
}
