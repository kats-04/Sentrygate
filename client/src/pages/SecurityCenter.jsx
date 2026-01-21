import { useState, useEffect } from 'react';
import { Shield, Laptop, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Card, Badge } from '../components/ui';
import DashboardShell from '../components/layout/DashboardShell';

export default function SecurityCenter() {
  const [sessions, setSessions] = useState([
    {
      id: '1',
      device: 'Desktop',
      browser: 'Chrome',
      os: 'Windows 11',
      ipAddress: '192.168.1.100',
      location: { city: 'San Francisco', country: 'USA' },
      lastActivity: new Date(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isActive: true,
      isCurrent: true,
    },
    {
      id: '2',
      device: 'Mobile',
      browser: 'Safari',
      os: 'iOS 17',
      ipAddress: '203.45.67.89',
      location: { city: 'New York', country: 'USA' },
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isActive: true,
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Tablet',
      browser: 'Chrome',
      os: 'iPad OS',
      ipAddress: '156.89.23.45',
      location: { city: 'Boston', country: 'USA' },
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isActive: false,
      isCurrent: false,
    },
  ]);

  const [revokeLoading, setRevokeLoading] = useState(null);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);

  const handleRevokeSession = (sessionId) => {
    setRevokeLoading(sessionId);
    setTimeout(() => {
      setSessions(sessions.filter(s => s.id !== sessionId));
      setRevokeLoading(null);
    }, 1000);
  };

  const handleRevokeAllSessions = () => {
    setRevokeLoading('all');
    setTimeout(() => {
      const current = sessions.find(s => s.isCurrent);
      setSessions(current ? [current] : []);
      setRevokeLoading(null);
      setShowRevokeAllConfirm(false);
    }, 1500);
  };

  const activeSessions = sessions.filter(s => s.isActive);
  const inactiveSessions = sessions.filter(s => !s.isActive);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return 'Just now';
  };

  return (
    <DashboardShell title="Security Center" subtitle="Manage your account security and sessions">
      <div className="space-y-6">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{activeSessions.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Devices</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{sessions.length}</p>
              </div>
              <Laptop className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Login</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2">Just now</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Active Sessions */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Active Sessions
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activeSessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No active sessions</div>
            ) : (
              activeSessions.map(session => (
                <div key={session.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Laptop className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session.device} - {session.browser}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{session.os}</p>
                        </div>
                        {session.isCurrent && (
                          <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Current Device
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          {session.location.city}, {session.location.country}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          IP: {session.ipAddress}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Last active: {formatTime(session.lastActivity)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Logged in: {formatTime(session.createdAt)}
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokeLoading === session.id}
                        className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50"
                      >
                        {revokeLoading === session.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {activeSessions.length > 1 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowRevokeAllConfirm(true)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Revoke all other sessions
              </button>
            </div>
          )}
        </Card>

        {/* Inactive Sessions */}
        {inactiveSessions.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Inactive Sessions
              </h2>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {inactiveSessions.map(session => (
                <div key={session.id} className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Laptop className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session.device} - {session.browser}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{session.os}</p>
                        </div>
                        <Badge className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Inactive
                        </Badge>
                      </div>

                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        {session.location.city}, {session.location.country} • {session.ipAddress}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Revoke All Confirmation Modal */}
        {showRevokeAllConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Revoke All Sessions?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will sign you out of all other devices. You'll need to sign in again on those devices.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRevokeAllConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeAllSessions}
                  disabled={revokeLoading === 'all'}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50"
                >
                  {revokeLoading === 'all' ? 'Revoking...' : 'Revoke All'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Security Tips */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">🔒 Security Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>✓ Review active sessions regularly</li>
            <li>✓ Revoke sessions from unknown devices</li>
            <li>✓ Use strong, unique passwords</li>
            <li>✓ Enable two-factor authentication</li>
            <li>✓ Keep your browser and OS updated</li>
          </ul>
        </Card>
      </div>
    </DashboardShell>
  );
}
