import React, { useState } from 'react';
import { Bell, Lock, Eye, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card } from '../components/ui';
import { DashboardShell } from '../components/layout';
import { mockSettings } from '../utils/mockData';

/**
 * Settings Page
 */
const Settings = () => {
  const [settings, setSettings] = useState(mockSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (section, key) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: !settings[section][key],
      },
    });
  };

  const handleInputChange = (section, key, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Show success message (would integrate with toast notification system)
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <DashboardShell>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-headline-2 mb-2">Settings</h1>
        <p className="text-body-small">Manage your account settings and preferences</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-3xl"
      >
        {/* Notification Settings */}
        <motion.div variants={cardVariants}>
          <Card variant="glass" padding="lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1">Notifications</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose how you receive updates
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'email', label: 'Email Notifications' },
                { key: 'push', label: 'Push Notifications' },
                { key: 'sms', label: 'SMS Notifications' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-smooth">
                  <label htmlFor={item.key} className="text-sm font-medium cursor-pointer">
                    {item.label}
                  </label>
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={settings.notifications[item.key]}
                    onChange={() => handleToggle('notifications', item.key)}
                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus-ring"
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div variants={cardVariants}>
          <Card variant="glass" padding="lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Eye className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1">Privacy</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Control who can see your information
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'profilePublic', label: 'Make Profile Public' },
                { key: 'showEmail', label: 'Show Email Address' },
                { key: 'allowMessages', label: 'Allow Direct Messages' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-smooth">
                  <label htmlFor={item.key} className="text-sm font-medium cursor-pointer">
                    {item.label}
                  </label>
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={settings.privacy[item.key]}
                    onChange={() => handleToggle('privacy', item.key)}
                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus-ring"
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div variants={cardVariants}>
          <Card variant="glass" padding="lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Lock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1">Security</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Secure your account
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-smooth">
                <label htmlFor="twofa" className="text-sm font-medium cursor-pointer">
                  Two-Factor Authentication
                </label>
                <input
                  type="checkbox"
                  id="twofa"
                  checked={settings.security.twoFactorAuth}
                  onChange={() => handleToggle('security', 'twoFactorAuth')}
                  className="w-5 h-5 rounded border-slate-300 text-primary-600 focus-ring"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <label htmlFor="timeout" className="text-sm font-medium mb-2 block">
                  Session Timeout (minutes)
                </label>
                <select
                  id="timeout"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus-ring transition-smooth"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={cardVariants}>
          <Card variant="glass" padding="lg" className="border-error-200 dark:border-error-900/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-error-100 dark:bg-error-900/30">
                <LogOut className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-error-600 dark:text-error-400 mb-1">
                  Danger Zone
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Irreversible and destructive actions
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="danger" size="md" className="w-full">
                Log Out All Devices
              </Button>
              <Button variant="danger" size="md" className="w-full">
                Delete Account
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          variants={cardVariants}
          className="flex gap-3"
        >
          <Button
            variant="primary"
            size="lg"
            isLoading={isSaving}
            onClick={handleSave}
            className="flex-1"
          >
            Save Changes
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Reset
          </Button>
        </motion.div>
      </motion.div>
    </DashboardShell>
  );
};

export default Settings;
