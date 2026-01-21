/**
 * Mock user data
 */
export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'Administrator',
  avatar: null,
  initials: 'JD',
  bio: 'Full-stack developer passionate about building scalable applications.',
  location: 'San Francisco, CA',
  joinedDate: '2024-01-15',
  socialLinks: [
    { platform: 'github', url: 'https://github.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
  ],
};

/**
 * Mock analytics data
 */
export const mockAnalytics = [
  {
    id: '1',
    title: 'Total Users',
    value: '12,543',
    change: '+12.5%',
    isPositive: true,
    icon: 'Users',
  },
  {
    id: '2',
    title: 'Active Sessions',
    value: '3,421',
    change: '+5.2%',
    isPositive: true,
    icon: 'Activity',
  },
  {
    id: '3',
    title: 'Revenue',
    value: '$54,230',
    change: '+18.2%',
    isPositive: true,
    icon: 'DollarSign',
  },
  {
    id: '4',
    title: 'Conversion Rate',
    value: '3.24%',
    change: '-2.4%',
    isPositive: false,
    icon: 'TrendingUp',
  },
  {
    id: '5',
    title: 'Bounce Rate',
    value: '42.3%',
    change: '+3.1%',
    isPositive: false,
    icon: 'BarChart2',
  },
  {
    id: '6',
    title: 'Avg. Session',
    value: '4m 32s',
    change: '+0.5m',
    isPositive: true,
    icon: 'Clock',
  },
];

/**
 * Mock activity feed
 */
export const mockActivityFeed = [
  {
    id: '1',
    type: 'user_signup',
    message: 'New user registered',
    details: 'Jane Smith joined the platform',
    timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
    avatar: 'JS',
  },
  {
    id: '2',
    type: 'payment',
    message: 'Payment received',
    details: 'Invoice #2024-001 paid successfully',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    avatar: '$',
  },
  {
    id: '3',
    type: 'system',
    message: 'System maintenance',
    details: 'Database backup completed',
    timestamp: new Date(Date.now() - 1 * 3600000), // 1 hour ago
    avatar: '⚙️',
  },
  {
    id: '4',
    type: 'alert',
    message: 'Security alert',
    details: 'Multiple failed login attempts detected',
    timestamp: new Date(Date.now() - 3 * 3600000), // 3 hours ago
    avatar: '⚠️',
  },
];

/**
 * Mock notifications
 */
export const mockNotifications = [
  {
    id: '1',
    title: 'Welcome to Dashboard',
    message: 'Your profile has been set up successfully',
    type: 'success',
    read: false,
  },
  {
    id: '2',
    title: 'Security Alert',
    message: 'New login from a new device detected',
    type: 'warning',
    read: false,
  },
  {
    id: '3',
    title: 'System Update',
    message: 'System maintenance scheduled for tomorrow',
    type: 'info',
    read: true,
  },
];

/**
 * Mock settings
 */
export const mockSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  privacy: {
    profilePublic: true,
    showEmail: false,
    allowMessages: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: '30',
  },
};
