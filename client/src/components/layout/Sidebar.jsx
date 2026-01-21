import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, User, Settings, LogOut, BarChart3, Bell, Users, Shield, FileText, Key, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks';
import useSecurityAlerts from '../../hooks/useSecurityAlerts';

/**
 * Responsive Sidebar Component
 * @component
 */
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const { alertCount } = useSecurityAlerts();

  // Define navigation items with role restrictions
  const allNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'TeamLead', 'User', 'Auditor'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['Admin', 'TeamLead', 'Auditor'] },
    { path: '/notifications', icon: Bell, label: 'Notifications', roles: ['Admin', 'TeamLead', 'User', 'Auditor'] },
    { path: '/teams', icon: Users, label: 'Teams', roles: ['Admin', 'TeamLead'] },
    { path: '/security', icon: Shield, label: 'Security', roles: ['Admin', 'TeamLead', 'User'] },
    { path: '/audit', icon: FileText, label: 'Audit Trail', roles: ['Admin', 'Auditor'] },
    { path: '/api-keys', icon: Key, label: 'API Keys', roles: ['Admin', 'TeamLead', 'User'] },
    { path: '/profile', icon: User, label: 'Profile', roles: ['Admin', 'TeamLead', 'User', 'Auditor'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['Admin', 'TeamLead', 'User', 'Auditor'] },
    { path: '/admin', icon: ShieldAlert, label: 'Admin Panel', roles: ['Admin'] },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const sidebarVariants = {
    hidden: { x: -320 },
    visible: { x: 0, transition: { duration: 0.3 } },
    exit: { x: -320, transition: { duration: 0.2 } },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden max-sm:flex fixed top-4 left-4 z-40 p-2 rounded-lg glass-effect"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - flex-shrink-0 prevents squashing */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate="visible"
        className="w-64 h-screen flex-shrink-0 flex-col glass-effect border-r border-slate-200 dark:border-slate-700 z-30 p-6 gap-6 max-md:fixed md:flex"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex-center text-white font-bold text-lg">
            SG
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-xl">SentryGate</span>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified access</p>
              {user?.role && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                  user.role === 'TeamLead' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    user.role === 'Auditor' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth
                  ${active
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.path === '/audit' && alertCount > 0 && user?.role === 'Admin' && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-smooth w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={20} />
          <span className="font-medium">{loading ? 'Logging out...' : 'Logout'}</span>
        </button>
      </motion.div>

      {/* Desktop Spacer */}
      <div className="hidden sm:block w-64 h-screen" />
    </>
  );
};

export default Sidebar;
