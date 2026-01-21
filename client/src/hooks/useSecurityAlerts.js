import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './useApi';

let socket = null;

/**
 * Custom hook for managing security alerts via Socket.IO
 * Connects Admin users to real-time security event stream
 */
export const useSecurityAlerts = () => {
    const [alertCount, setAlertCount] = useState(0);
    const [alerts, setAlerts] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // Only connect if user is Admin
        if (!user || user.role !== 'Admin') return;

        // Initialize Socket.IO connection
        if (!socket) {
            socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                withCredentials: true,
            });

            socket.on('connect', () => {
                console.log('🔌 Connected to security alerts');
                socket.emit('join-admin-room');
            });

            socket.on('disconnect', () => {
                console.log('🔌 Disconnected from security alerts');
            });
        }

        // Listen for security alerts
        const handleAlert = (alert) => {
            console.log('🚨 Security Alert:', alert);

            setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50
            setAlertCount(prev => prev + 1);

            // Show toast notification based on severity
            const icon = alert.severity === 'critical' ? '🚨' : '⚠️';
            const toastFn = alert.severity === 'critical' ? toast.error : toast.warning;

            toastFn(`${icon} ${alert.message}`, {
                duration: alert.severity === 'critical' ? 10000 : 5000,
                position: 'top-right',
            });
        };

        socket.on('security:alert', handleAlert);

        return () => {
            if (socket) {
                socket.off('security:alert', handleAlert);
            }
        };
    }, [user]);

    const clearAlerts = () => {
        setAlertCount(0);
        setAlerts([]);
    };

    return { alertCount, alerts, clearAlerts };
};

export default useSecurityAlerts;
