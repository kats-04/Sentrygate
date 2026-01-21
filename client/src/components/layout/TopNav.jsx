import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, ThemeToggle } from '../ui';
import { useAuth } from '../../hooks';
import { useNotification } from '../../context/NotificationContext';

/**
 * Top Navigation Component
 * @component
 */
const TopNav = () => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const { notifications, unreadCount, deleteNotification, markAsRead } = useNotification();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = user?.name || 'User';
  const userRole = user?.role || 'User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-16 glass-effect border-b border-slate-200 dark:border-slate-700 flex-between px-6 gap-4">
      {/* Spacer for desktop */}
      <div className="hidden sm:block flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-lg glass-effect hover:bg-slate-100 dark:hover:bg-slate-700 transition-smooth focus-ring"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 glass-effect border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-4 z-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold">Notifications</h3>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification._id || notification.id}
                        className={`flex items-start gap-2 p-3 rounded-lg ${notification.read
                            ? 'bg-slate-50 dark:bg-slate-800 opacity-75'
                            : 'bg-white dark:bg-slate-700 border-l-2 border-primary-500 shadow-sm'
                          }`}
                        onClick={() => !notification.read && markAsRead(notification._id)}
                      >
                        <div className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium">{notification.title || 'Notification'}</p>
                          <p className="text-xs opacity-90">{notification.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(notification.createdAt || Date.now()).toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="flex-shrink-0 hover:opacity-70"
                          aria-label="Dismiss notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No notifications</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userRole}</p>
          </div>
          <Avatar initials={userInitials} size="sm" />
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="p-2 rounded-lg glass-effect hover:bg-error-50 dark:hover:bg-error-950/20 transition-smooth focus-ring text-error-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default TopNav;
