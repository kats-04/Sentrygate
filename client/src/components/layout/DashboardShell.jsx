import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useAuth } from '../../hooks';

/**
 * Dashboard Shell Layout Component
 * @component
 * @example
 * <DashboardShell><Dashboard /></DashboardShell>
 */
const DashboardShell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Connect to socket for real-time events
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    // Join user-specific room
    socket.on('connect', () => {
      socket.emit('join-user-room', user._id);
    });

    // Listen for force-logout event (when admin suspends account)
    socket.on('force-logout', async (data) => {
      console.log('🚫 Force logout received:', data);

      // Show notification to user
      toast.error(data.reason || 'Your account has been suspended by an administrator.', {
        duration: 5000,
        position: 'top-center',
      });

      // Wait a moment for user to see the message
      setTimeout(async () => {
        await logout();
        navigate('/login', { replace: true });
      }, 2000);
    });

    // Listen for notifications
    socket.on('notification', (notification) => {
      if (notification.type === 'info') {
        toast(notification.message, { icon: 'ℹ️' });
      } else if (notification.type === 'warning') {
        toast(notification.message, { icon: '⚠️' });
      } else if (notification.type === 'success') {
        toast.success(notification.message);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, logout, navigate]);

  return (
    <div className="flex h-screen overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - min-w-0 is CRITICAL for split-screen */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navigation */}
        <TopNav />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="container-content py-6 sm:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
