import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../hooks';

/**
 * Login Page
 */
const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">SG</span>
          </div>
          <h1 className="text-headline-2 mb-2">Welcome to SentryGate</h1>
          <p className="text-body-small text-slate-600 dark:text-slate-400">Verified access. Visible actions.</p>
        </div>

        {/* Login Card */}
        <Card variant="glass-lg" padding="lg" className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Demo Role Switcher */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-800/30">
              <label htmlFor="demo-role-select" className="block text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
                🚀 Quick Demo Login
              </label>
              <select id="demo-role-select"
                onChange={(e) => {
                  const role = e.target.value;
                  if (role === 'admin') setFormData({ email: 'admin@example.com', password: 'admin12345' });
                  else if (role === 'teamlead') setFormData({ email: 'teamlead@example.com', password: 'teamlead123' });
                  else if (role === 'user') setFormData({ email: 'user@example.com', password: 'user12345' });
                  else if (role === 'auditor') setFormData({ email: 'auditor@example.com', password: 'auditor123' });
                  else setFormData({ email: '', password: '' });
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-700 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">-- Select a Role to Auto-Fill --</option>
                <option value="admin">👑 Admin (Full Access)</option>
                <option value="teamlead">👨‍💼 Team Lead (Manager)</option>
                <option value="user">👤 User (Standard)</option>
                <option value="auditor">👁️ Auditor (Read Only)</option>
              </select>
            </div>

            {/* Error Message */}
            {(formError || error) && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{formError || error}</p>
              </div>
            )}

            {/* Email Input */}
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              label="Email Address"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Password Input */}
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              label="Password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Demo Credentials
              </span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Try these demo credentials:
            </p>
            <div className="space-y-3 text-xs">
              {/* Admin */}
              <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="font-bold text-blue-700 dark:text-blue-300 mb-1">👑 Admin (Full Access)</p>
                <p className="text-slate-700 dark:text-slate-300 font-mono">
                  <span className="font-semibold">Email:</span> admin@example.com
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-mono">
                  <span className="font-semibold">Password:</span> admin12345
                </p>
              </div>

              {/* Team Lead */}
              <div className="p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="font-bold text-green-700 dark:text-green-300 mb-1">👨‍💼 Team Lead (Limited)</p>
                <p className="text-slate-700 dark:text-slate-300 font-mono">
                  <span className="font-semibold">Email:</span> teamlead@example.com
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-mono">
                  <span className="font-semibold">Password:</span> teamlead123
                </p>
              </div>

              {/* Regular User */}
              <div className="p-2 rounded bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="font-bold text-purple-700 dark:text-purple-300 mb-1">👤 User (Basic)</p>
                <p className="text-slate-700 dark:text-slate-300 font-mono">
                  <span className="font-semibold">Email:</span> user@example.com
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-mono">
                  <span className="font-semibold">Password:</span> user12345
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-body-small">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
