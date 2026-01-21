import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { Users, FileText, Lock, Settings, Save, AlertTriangle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardShell from '../../components/layout/DashboardShell';
import api from '../../utils/api';

// Tab components (placeholders for now)
const GeneralSettings = () => {
    const [settings, setSettings] = useState({
        allowRegistrations: true,
        maintenanceMode: false,
        sessionTimeout: 60,
        enforceMFA: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setSettings(res);
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleSave = async () => {
        try {
            await api.patch('/admin/settings', settings);
            toast.success('System settings updated');
        } catch (err) {
            toast.error('Failed to update settings');
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings size={20} /> System Configuration
                </h3>

                <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Allow Registrations</p>
                            <p className="text-slate-500 text-sm">Enable or disable new user signups</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="allowRegistrations"
                                checked={settings.allowRegistrations}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Maintenance Mode</p>
                            <p className="text-slate-500 text-sm">Restrict access to Admins only</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-error-300 dark:peer-focus:ring-error-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-error-600" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock size={20} /> Security Policies
                </h3>

                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                        <input
                            type="number"
                            name="sessionTimeout"
                            value={settings.sessionTimeout}
                            onChange={handleChange}
                            className="input-field max-w-xs"
                            min="5"
                            max="1440"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Enforce MFA</p>
                            <p className="text-slate-500 text-sm">Require Two-Factor Authentication for all users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enforceMFA"
                                checked={settings.enforceMFA}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button type="button" onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [adminFeed, setAdminFeed] = useState([]);

    useEffect(() => {
        fetchUsers();

        // Socket connection for real-time updates
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            withCredentials: true,
        });

        socket.emit('join-admin-room');

        socket.on('user-updated', (updatedUser) => {
            setUsers(prev => prev.map(u =>
                u._id === updatedUser.userId ? { ...u, ...updatedUser } : u
            ));
            // If status changed to suspended for current view, toast?
        });

        socket.on('admin-action', (action) => {
            setAdminFeed(prev => [action, ...prev].slice(0, 50));
        });

        return () => {
            socket.disconnect();
        };
    }, [page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/users?page=${page}&limit=10`);
            // Handle various response formats defensively
            // Correctly handle the response structure from api.js wrapper + usersController
            // api.js returns { data: { data: [], pagination: {} }, status, ... }
            // So res.data is the controller response.
            const responseBody = res.data || {};
            // The controller returns { data: [users], pagination: {...} }
            const usersList = Array.isArray(responseBody) ? responseBody : (responseBody.data || []);
            setUsers(Array.isArray(usersList) ? usersList : []);
            setTotalPages(responseBody.pagination?.pages || 1);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.users.changeRole(userId, newRole);
            toast.success(`Role updated to ${newRole}`);
            // No need to fetchUsers() as socket will update state
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const handleStatusChange = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

        if (newStatus === 'suspended') {
            if (!window.confirm('Are you sure you want to suspend this user? This will invalidate their current session immediately.')) return;
        }

        try {
            await api.users.updateStatus(userId, newStatus);
            toast.success(`User ${newStatus}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleResetMFA = async (userId) => {
        if (!window.confirm('Are you sure you want to reset MFA for this user?')) return;
        try {
            await api.post(`/users/${userId}/reset-mfa`);
            toast.success('MFA reset successfully');
        } catch (err) {
            toast.error('Failed to reset MFA');
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">User Management</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="pb-3 pl-2">User</th>
                            <th className="pb-3">Role</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-3 pl-2">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                <td className="py-3">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:ring-2 focus:ring-primary-500 ${user.role === 'Admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                            user.role === 'TeamLead' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                    >
                                        <option value="User">User</option>
                                        <option value="TeamLead">TeamLead</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Auditor">Auditor</option>
                                    </select>
                                </td>
                                <td className="py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="py-3 text-right pr-2 space-x-2">
                                    <button
                                        onClick={() => handleResetMFA(user._id)}
                                        className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300"
                                        title="Reset MFA"
                                    >
                                        Reset MFA
                                    </button>
                                    {user.role !== 'Admin' && (
                                        <button
                                            onClick={() => handleStatusChange(user._id, user.status)}
                                            className={`text-xs px-3 py-1 rounded font-medium transition-colors ${user.status === 'active'
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:border-red-800'
                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 dark:border-emerald-800'
                                                }`}
                                        >
                                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-sm text-slate-500 disabled:opacity-50 hover:text-slate-700"
                >
                    Previous
                </button>
                <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-sm text-slate-500 disabled:opacity-50 hover:text-slate-700"
                >
                    Next
                </button>
            </div>

            {/* Admin Audit Feed - Always visible */}
            <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                <h4 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                    <Activity size={16} /> Live Admin Activity
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                    {adminFeed.length > 0 ? (
                        adminFeed.map((action, i) => (
                            <div key={i} className="text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
                                <span>
                                    <span className="font-medium text-slate-900 dark:text-slate-200">{action.adminName}</span> {action.details}
                                </span>
                                <span className="text-slate-400">{new Date(action.timestamp).toLocaleTimeString()}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-xs text-slate-400 text-center py-4">
                            No recent admin activity. Try changing a user's role or status to see live updates here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter,] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        try {
            const typeQuery = filter !== 'all' ? `&type=${filter}` : '';
            const res = await api.get(`/security/audit?limit=20${typeQuery}`);
            // Handle both array and object responses
            setLogs(Array.isArray(res) ? res : (res.data || []));
        } catch (err) {
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/security/audit/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Audit log downloaded');
        } catch (err) {
            toast.error('Failed to export logs');
        }
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText size={20} /> Audit Trail
                </h3>
                <button type="button" onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
                    Download CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="pb-3 text-slate-500">Time</th>
                            <th className="pb-3 text-slate-500">User</th>
                            <th className="pb-3 text-slate-500">Action</th>
                            <th className="pb-3 text-slate-500">IP Address</th>
                            <th className="pb-3 text-slate-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {logs.map((log) => (
                            <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-2 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="py-2 font-medium">{log.userId?.name || 'Unknown'}</td>
                                <td className="py-2">{log.type || 'LOGIN'}</td>
                                <td className="py-2 text-mono text-xs">{log.ipAddress}</td>
                                <td className="py-2">
                                    <span className={`xs-badge ${log.success ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                                        {log.success ? 'Success' : 'Failed'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'audit', label: 'Audit Logs', icon: FileText },
    ];

    return (
        <DashboardShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        Admin Control Panel
                    </h1>
                    <p className="text-slate-500 mt-2">Manage system configuration and security.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
              flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
            `}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'general' && <GeneralSettings />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'audit' && <AuditLogs />}
                </motion.div>
            </div>
        </DashboardShell >
    );
};

export default AdminDashboard;
