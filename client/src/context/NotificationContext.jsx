import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../hooks';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [activeToasts, setActiveToasts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth(); // We need to know if user is logged in to fetch notifications

    // --- Toast Logic ---
    const addToast = useCallback((toast) => {
        const id = toast.id || Date.now();
        setActiveToasts((prev) => [...prev, { ...toast, id }]);

        // Auto-remove after duration
        if (toast.duration) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setActiveToasts((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const success = useCallback((message, duration = 5000) => {
        addToast({ type: 'success', message, duration });
    }, [addToast]);

    const error = useCallback((message, duration = 5000) => {
        addToast({ type: 'error', message, duration });
    }, [addToast]);

    const info = useCallback((message, duration = 5000) => {
        addToast({ type: 'info', message, duration });
    }, [addToast]);

    const warning = useCallback((message, duration = 5000) => {
        addToast({ type: 'warning', message, duration });
    }, [addToast]);

    // --- Persistent Notification Logic ---

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await api.notifications.getAll(50);
            setNotifications(res.data?.notifications || []);
            setUnreadCount(res.data?.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = useCallback(async (id) => {
        try {
            await api.notifications.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            error('Failed to update notification');
        }
    }, [error]);

    const markAllAsRead = useCallback(async () => {
        try {
            await api.notifications.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
            success('All notifications marked as read');
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            error('Failed to update notifications');
        }
    }, [success, error]);

    const deleteNotification = useCallback(async (id) => {
        try {
            await api.notifications.delete(id);
            const notification = notifications.find(n => n._id === id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (notification && !notification.read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
            success('Notification deleted');
        } catch (err) {
            console.error('Failed to delete notification:', err);
            error('Failed to delete notification');
        }
    }, [notifications, success, error]);

    // Initial Fetch
    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, fetchNotifications]);

    // Initialize Socket.io connection
    useEffect(() => {
        if (!user) return;

        // Use the base URL from api utils window location or similar, but for now hardcode logic matching Context original
        // Ideally imported from config. The original context used http://localhost:5001
        const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
            withCredentials: true,
            autoConnect: true,
            query: { userId: user.id } // Pass userId for handshake if needed, though usually cookies handle it
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            // Join user-specific room for targeted notifications
            if (user?.id) {
                socketInstance.emit('join-user-room', user.id);
            }
        });

        socketInstance.on('new-notification', (data) => {
            // data structure: { notification: Object, unreadCount: Number }
            console.log('New notification received:', data);

            // Add to persistent list
            setNotifications((prev) => [data.notification, ...prev]);
            setUnreadCount(data.unreadCount);

            // Also show a toast
            addToast({
                type: data.notification.type || 'info',
                message: data.notification.message,
                duration: 5000,
            });
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user, addToast]); // Re-connect if user changes

    const value = {
        activeToasts,       // For Toast.jsx
        notifications,      // For TopNav/Page (persistent)
        unreadCount,        // For Badges
        loading,
        fetchNotifications, // To manually refresh
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addToast,           // Renamed from addNotification
        removeToast,        // Renamed from removeNotification
        success,
        error,
        info,
        warning,
        socket,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
