/**
 * API Service Module
 * Centralized API client for all backend communication
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_V1 = `${API_BASE}/api/v1`;

class ApiClient {
  constructor() {
    this.baseURL = API_V1;

    // Bind methods to ensure 'this' context
    this.request = this.request.bind(this);
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle empty responses or non-JSON
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP Error: ${response.status}`);
      }

      // Return data wrapped in a format that mirrors axios for backward compatibility if needed
      // or just return data directly. Most calls expect res.data.
      // To maintain compatibility with existing 'res.data' calls:
      return { data, status: response.status, ok: response.ok };
    } catch (error) {
      // Don't log 401s for silent auth checks or initial load
      const isAuthCheck = endpoint.includes('/auth/me');
      const isSilent = options.silent;

      if (!isAuthCheck && !isSilent) {
        console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
      }
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Auth endpoints
  auth = {
    register: (name, email, password, role) =>
      this.post('/auth/register', { name, email, password, role }),

    login: (email, password) =>
      this.post('/auth/login', { email, password }),

    logout: () =>
      this.post('/auth/logout'),

    me: () => this.get('/auth/me'),
  };

  // Users endpoints
  users = {
    getAll: (page = 1, limit = 10, role) => {
      const params = new URLSearchParams({ page, limit });
      if (role) params.append('role', role);
      return this.get(`/users?${params}`);
    },

    getById: (id) => this.get(`/users/${id}`),

    getProfile: () => this.get('/users/profile/me'),

    updateProfile: (data) =>
      this.patch('/users/profile', data),

    getActivity: (id, limit = 20, skip = 0) =>
      this.get(`/users/${id}/activity?limit=${limit}&skip=${skip}`),

    search: (query, limit = 20, skip = 0) =>
      this.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`),

    changeRole: (id, role) =>
      this.patch(`/users/${id}/role`, { role }),

    updateStatus: (id, status) =>
      this.patch(`/users/${id}/status`, { status }),

    delete: (id) =>
      this.delete(`/users/${id}`),

    export: () => this.get('/users/export'),
  };

  // Notification endpoints
  notifications = {
    getAll: (limit = 20, unreadOnly = false) => {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (unreadOnly) params.append('unreadOnly', 'true');
      return this.get(`/notifications?${params}`);
    },

    markAsRead: (id) => this.put(`/notifications/${id}/read`),

    markAllAsRead: () => this.put('/notifications/read-all'),

    delete: (id) => this.delete(`/notifications/${id}`),

    getPreferences: () => this.get('/notifications/preferences'),

    updatePreferences: (prefs) => this.put('/notifications/preferences', prefs),

    subscribePush: (subscription) => this.post('/notifications/subscribe', { subscription }),

    unsubscribePush: () => this.post('/notifications/unsubscribe'),
  };

  // Analytics & Dashboard endpoints
  analytics = {
    getStats: () => this.get('/dashboard/stats'),

    getTrends: (days = 30) =>
      this.get(`/analytics/trends?days=${days}`),

    getEngagement: () => this.get('/analytics/engagement'),

    getDashboardSummary: () => this.get('/dashboard/summary'),
  };
}

const apiClient = new ApiClient();
export default apiClient;
