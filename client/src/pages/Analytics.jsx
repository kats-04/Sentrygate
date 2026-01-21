import React, { useState } from 'react';
import { Search, Filter, Users as UsersIcon, UserPlus, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Badge } from '../components/ui';
import { DashboardShell } from '../components/layout';
import InviteUserModal from '../components/InviteUserModal';
import { useAuth } from '../hooks';
import { useNotification } from '../context/NotificationContext';

const Analytics = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { user } = useAuth();
  const { success, error } = useNotification();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users-search', searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/v1/users/search?${params}`, {
        credentials: 'include',
      });
      return res.json();
    },
    enabled: searchQuery.length > 0 || Object.values(filters).some(v => v),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    setFilters({ role: '', status: '', dateFrom: '', dateTo: '' });
    setSearchQuery('');
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/v1/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to change role');

      success(`Role updated to ${newRole}`);
      refetch();
    } catch (err) {
      error(err.message);
    }
  };

  const exportCSV = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/v1/users/export`, '_blank');
    success('Exporting users to CSV...');
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <DashboardShell>
      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-2 mb-2">User Analytics & Search</h1>
            <p className="text-body-small">Search and filter users by various criteria</p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={exportCSV}>
                <Download size={18} className="mr-2" />
                Export CSV
              </Button>
              <Button variant="primary" onClick={() => setInviteModalOpen(true)}>
                <UserPlus size={18} className="mr-2" />
                Invite User
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <Card variant="glass" padding="lg" className="mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus-ring"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              Filters
            </Button>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700"
            >
              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus-ring"
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="TeamLead">Team Lead</option>
                  <option value="User">User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus-ring"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus-ring"
                />
              </div>

              <div className="md:col-span-4">
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </Card>

      {/* Results */}
      {isLoading && (
        <Card variant="glass" padding="lg">
          <div className="text-center py-8 text-slate-500">Loading...</div>
        </Card>
      )}

      {data && (
        <Card variant="glass" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              Search Results ({data.total || 0})
            </h2>
          </div>

          {data.data && data.data.length > 0 ? (
            <div className="space-y-3">
              {data.data.map((userItem) => (
                <div
                  key={userItem._id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-smooth"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400">
                    {userItem.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{userItem.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{userItem.email}</p>
                  </div>
                  <Badge variant={userItem.status === 'active' ? 'success' : 'warning'}>
                    {userItem.status}
                  </Badge>

                  {isAdmin ? (
                    <select
                      value={userItem.role}
                      onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                      className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium"
                    >
                      <option value="User">User</option>
                      <option value="TeamLead">Team Lead</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    <Badge>{userItem.role}</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <UsersIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No users found matching your criteria</p>
            </div>
          )}
        </Card>
      )}
    </DashboardShell>
  );
};

export default Analytics;
