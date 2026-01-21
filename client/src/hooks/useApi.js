import { useState, useCallback, useEffect } from 'react';
import api from '../utils/api';

/**
 * useAuth Hook
 * Manages authentication state and operations
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await api.auth.me();
        // Unwrap: response.data is body, body.data is user
        setUser(response.data.data);
        setError(null);
      } catch (err) {
        setUser(null);
        setError(null); // Not an error if not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = useCallback(
    async (name, email, password) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.auth.register(name, email, password);
        setUser(response.data.data);
        return response.data; // Return body
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (email, password) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.auth.login(email, password);
        setUser(response.data.data);
        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(
    async () => {
      try {
        setLoading(true);
        await api.auth.logout();
        setUser(null);
        setError(null);
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    setUser,
  };
}

/**
 * useUsers Hook
 * Manages user data and operations
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });

  const fetchUsers = useCallback(
    async (page = 1, limit = 10, role = null) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.users.getAll(page, limit, role);
        // Unwrap: response.data is body, body.data is array
        setUsers(response.data.data);
        setPagination(response.data.pagination);
        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserById = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.users.getById(id);
        return response.data.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (data) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.users.updateProfile(data);
        // Typically updateProfile returns { data: user }
        return response.data.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchUsers = useCallback(
    async (query, limit = 20) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.users.search(query, limit);
        // Search likely returns { data: [] }
        return response.data.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteUser = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);
        await api.users.delete(id);
        setUsers((prev) => prev.filter((u) => u._id !== id));
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const changeRole = useCallback(
    async (id, role) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.users.changeRole(id, role);
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? response.data.data : u))
        );
        return response.data.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    getUserById,
    updateProfile,
    searchUsers,
    deleteUser,
    changeRole,
  };
}

/**
 * useAnalytics Hook
 * Manages analytics data
 */
export function useAnalytics() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [engagement, setEngagement] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.analytics.getStats();
        // Stats returns body directly as obj? Check controller.
        // If controller returns res.json(obj), then response.data is obj.
        setStats(response.data);
        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchTrends = useCallback(
    async (days = 30) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.analytics.getTrends(days);
        // If returns { data: [] }
        setTrends(response.data.data || response.data);
        return response.data.data || response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchEngagement = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.analytics.getEngagement();
        setEngagement(response.data.engagement);
        return response.data.engagement;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchDashboardSummary = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.analytics.getDashboardSummary();
        setSummary(response.data.summary);
        return response.data.summary;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    stats,
    trends,
    engagement,
    summary,
    loading,
    error,
    fetchStats,
    fetchTrends,
    fetchEngagement,
    fetchDashboardSummary,
  };
}
