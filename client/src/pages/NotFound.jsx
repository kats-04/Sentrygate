import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card } from '../components/ui';

/**
 * 404 Not Found Page
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* 404 Animation */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8"
        >
          <div className="text-8xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            404
          </div>
        </motion.div>

        {/* Content */}
        <h1 className="text-headline-2 mb-4">Page Not Found</h1>
        <p className="text-body-small mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Go Back
          </Button>
        </div>

        {/* Suggestion Links */}
        <Card variant="solid-subtle" padding="md" className="mt-8">
          <p className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
            Quick Links
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="block w-full text-left text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              → Dashboard
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="block w-full text-left text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              → Profile
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="block w-full text-left text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              → Settings
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFound;
