import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../hooks';

/**
 * Sign Up Page
 * User registration with form validation
 */
const SignUp = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');

    // Check password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^a-zA-Z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email');
      return false;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    }
  };

  const getPasswordStrengthLabel = () => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[passwordStrength] || 'Very Weak';
  };

  const getPasswordStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    return colors[passwordStrength - 1] || 'bg-red-500';
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
          <h1 className="text-headline-2 mb-2">Join SentryGate</h1>
          <p className="text-body-small text-slate-600 dark:text-slate-400">Verified access. Visible actions.</p>
        </div>

        {/* Sign Up Card */}
        <Card variant="glass-lg" padding="lg" className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {(formError || error) && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{formError || error}</p>
              </div>
            )}

            {/* Name Input */}
            <Input
              type="text"
              name="name"
              placeholder="Enter your full name"
              label="Full Name"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />

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

            {/* Role Select (Demo Only) */}
            <div className="space-y-1">
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Select Demo Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none text-slate-900 dark:text-white"
                >
                  <option value="User">User (Standard)</option>
                  <option value="TeamLead">Team Lead (Manager)</option>
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Auditor">Auditor (Read Only)</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                *For demo purposes only. Usually assigned by admin.
              </p>
            </div>

            {/* Password Input */}
            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter password (min 8 chars)"
                label="Password"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Strength
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <Input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm password"
              label="Confirm Password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Show Password Checkbox */}
            <label htmlFor="showPassword" className="flex items-center gap-2 cursor-pointer">
              <input
                id="showPassword"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">Show password</span>
            </label>

            {/* Password Requirements */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Password Requirements:
              </p>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  {formData.password.length >= 8 ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-slate-400" />
                  )}
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  {/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-slate-400" />
                  )}
                  Mix of uppercase and lowercase
                </li>
                <li className="flex items-center gap-2">
                  {/[0-9]/.test(formData.password) ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-slate-400" />
                  )}
                  At least one number
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Terms
              </span>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-slate-600 dark:text-slate-400">
            By signing up, you agree to our{' '}
            <button type="button" className="text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Service
            </button>
            {' '}and{' '}
            <button type="button" className="text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </button>
          </p>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-body-small">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
