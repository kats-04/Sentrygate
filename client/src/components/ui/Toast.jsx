import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const Toast = () => {
    const { activeToasts: notifications, removeToast: removeNotification } = useNotification();

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: Info,
        warning: AlertTriangle,
    };

    const colors = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            <AnimatePresence>
                {notifications.map((notification) => {
                    const Icon = icons[notification.type] || Info;
                    const colorClass = colors[notification.type] || colors.info;

                    return (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${colorClass}`}
                        >
                            <Icon size={20} className="flex-shrink-0 mt-0.5" />
                            <p className="flex-1 text-sm font-medium">{notification.message}</p>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                                aria-label="Close notification"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
