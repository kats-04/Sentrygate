import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import CommandPalette from './components/ui/CommandPalette';
import Toast from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Teams = lazy(() => import('./pages/Teams'));
const SecurityCenter = lazy(() => import('./pages/SecurityCenter'));
const AuditTrail = lazy(() => import('./pages/AuditTrail'));
const ApiKeys = lazy(() => import('./pages/ApiKeys'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard')); // Admin Dashboard
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * Loading Fallback Component
 */
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 animate-pulse" />
      <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
    </div>
  </div>
);

/**
 * Main App Component with Routing
 */
const App = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <Toast />
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />

              {/* Dashboard Routes (Protected) */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
              <Route path="/security" element={<ProtectedRoute><SecurityCenter /></ProtectedRoute>} />
              <Route path="/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
              <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />

              <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirects and 404 */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
