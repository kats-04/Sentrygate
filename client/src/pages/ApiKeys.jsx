import { useState } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, Copy, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { Card, Badge, Input, Button } from '../components/ui';
import DashboardShell from '../components/layout/DashboardShell';

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Production API Key',
      lastFour: 'a1b2',
      permissions: ['read:users', 'read:analytics', 'write:users'],
      isActive: true,
      lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Development Key',
      lastFour: 'c3d4',
      permissions: ['read:users', 'read:teams', 'read:analytics'],
      isActive: true,
      lastUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Testing Key (Revoked)',
      lastFour: 'e5f6',
      permissions: ['read:users'],
      isActive: false,
      lastUsedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(['read:users']);
  const [showNewKey, setShowNewKey] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const availablePermissions = [
    { value: 'read:users', label: 'Read Users', category: 'Users' },
    { value: 'write:users', label: 'Write Users', category: 'Users' },
    { value: 'read:teams', label: 'Read Teams', category: 'Teams' },
    { value: 'write:teams', label: 'Write Teams', category: 'Teams' },
    { value: 'read:analytics', label: 'Read Analytics', category: 'Analytics' },
    { value: 'read:notifications', label: 'Read Notifications', category: 'Notifications' },
    { value: 'write:notifications', label: 'Write Notifications', category: 'Notifications' },
    { value: 'admin:all', label: 'Admin All', category: 'Admin' },
  ];

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      lastFour: Math.random().toString(36).substr(2, 4),
      permissions: selectedPermissions,
      isActive: true,
      lastUsedAt: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    setApiKeys([newKey, ...apiKeys]);
    setShowNewKey(newKey.id);
    setNewKeyName('');
    setSelectedPermissions(['read:users']);
    setShowCreateForm(false);
  };

  const handleDeleteKey = (keyId) => {
    setDeleteLoading(keyId);
    setTimeout(() => {
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      setDeleteLoading(null);
    }, 800);
  };

  const handleCopyKey = (keyId) => {
    setCopiedId(keyId);
    navigator.clipboard.writeText(`sk_live_${keyId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return 'Just now';
  };

  const isExpiringSoon = (expiresAt) => {
    const daysUntilExpiry = Math.floor((new Date(expiresAt) - new Date()) / (24 * 60 * 60 * 1000));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt) => new Date(expiresAt) < new Date();

  const activeKeys = apiKeys.filter(k => k.isActive).length;
  const expiredKeys = apiKeys.filter(k => isExpired(k.expiresAt)).length;
  const expiringKeys = apiKeys.filter(k => isExpiringSoon(k.expiresAt)).length;

  return (
    <DashboardShell title="API Keys" subtitle="Manage your API keys for programmatic access">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Keys</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{apiKeys.length}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{activeKeys}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{expiringKeys}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{expiredKeys}</p>
          </Card>
        </div>

        {/* Create New Key Form */}
        {showCreateForm && (
          <Card className="p-6 border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {['Users', 'Teams', 'Analytics', 'Notifications', 'Admin'].map(category => {
                    const categoryPerms = availablePermissions.filter(p => p.category === category);
                    return (
                      <div key={category}>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {category}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {categoryPerms.map(perm => (
                            <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPermissions([...selectedPermissions, perm.value]);
                                  } else {
                                    setSelectedPermissions(selectedPermissions.filter(p => p !== perm.value));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {perm.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  Create Key
                </Button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* New Key Revealed */}
        {showNewKey && (
          <Card className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                ✓ API Key Created Successfully
              </h3>
              <button
                onClick={() => setShowNewKey(null)}
                className="text-green-600 hover:text-green-700"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-green-800 dark:text-green-300 mb-3">
              Save this key somewhere safe. You won't be able to see it again.
            </p>
            <div className="bg-white dark:bg-gray-900 p-4 rounded border border-green-200 dark:border-green-800 font-mono text-sm break-all">
              sk_live_{showNewKey}
            </div>
          </Card>
        )}

        {/* Action Button */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        )}

        {/* API Keys List */}
        <Card className="overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {apiKeys.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No API keys yet. Create one to get started.
              </div>
            ) : (
              apiKeys.map(key => (
                <div
                  key={key.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
                    !key.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {key.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ...{key.lastFour}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!key.isActive && (
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Revoked
                        </Badge>
                      )}
                      {isExpired(key.expiresAt) && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Expired
                        </Badge>
                      )}
                      {isExpiringSoon(key.expiresAt) && !isExpired(key.expiresAt) && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          Expiring Soon
                        </Badge>
                      )}
                      {key.isActive && !isExpired(key.expiresAt) && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(key.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Last Used</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatTime(key.lastUsedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Expires</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(key.expiresAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Permissions</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {key.permissions.length} permission{key.permissions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyKey(key.id)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                    >
                      {copiedId === key.id ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      disabled={deleteLoading === key.id}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleteLoading === key.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* API Documentation Link */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                📚 Using API Keys
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Include your API key in the Authorization header: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">Authorization: Bearer YOUR_API_KEY</code>
              </p>
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
                View API Documentation →
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
