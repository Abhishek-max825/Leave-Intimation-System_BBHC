// ============================================================
// AutoLeave AI – API Service Layer (REAL BACKEND INTEGRATION)
// ============================================================

const DEFAULT_BASE_URL = 'http://localhost:5000';

function getBaseUrl() {
  return localStorage.getItem('autoleave_baseurl') || DEFAULT_BASE_URL;
}

function setBaseUrl(url) {
  localStorage.setItem('autoleave_baseurl', url);
}

window.setAutoLeaveBaseUrl = setBaseUrl;

async function apiFetch(path, { method = 'GET', headers = {}, body } = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

function getSession() {
  const stored = localStorage.getItem('autoleave_user');
  return stored ? JSON.parse(stored) : null;
}

function buildRoleHeaders(overrides = {}) {
  const session = getSession();
  const role = overrides.role || session?.role;
  const userId = overrides.userId || session?.userId;
  const userName = overrides.userName || session?.name;

  const h = {};
  if (role) h['x-user-role'] = role;
  if (userId) h['x-user-id'] = userId;
  if (userName) h['x-user-name'] = userName;
  return h;
}

// ============================================================
// Auth Service
// ============================================================
window.AuthService = {
  /**
   * Login (mock auth): by userId (optional for faculty/admin).
   * If userId is provided, we fetch user details from backend and store session.
   * If not provided, we store a role-only session.
   */
  login: async ({ userId, role, password }) => {
    const r = role ? String(role).toLowerCase() : null;

    if (userId) {
      const user = await apiFetch('/api/users/login', { method: 'POST', body: { userId, password } });
      const session = { ...user, role: user.role || r, userId: user.userId };
      localStorage.setItem('autoleave_user', JSON.stringify(session));
      return session;
    }

    throw new Error('userId and password are required.');
  },

  /**
   * Logout
   */
  logout: async () => {
    localStorage.removeItem('autoleave_user');
    return true;
  },

  /**
   * Get current session
   */
  getSession: () => {
    return getSession();
  },

  register: async ({ name, role, department, customDepartment, password }) => {
    const created = await apiFetch('/api/users/register', {
      method: 'POST',
      body: { name, role, department, customDepartment, password },
    });
    return created;
  },

  getFacultyUsers: async () => {
    return apiFetch('/api/users/faculty');
  },

  bootstrapFacultyUsers: async () => {
    return apiFetch('/api/users/faculty/bootstrap', { method: 'POST' });
  },
};

// ============================================================
// Dashboard Service
// ============================================================
window.DashboardService = {
  getStudentDashboard: async () => {
    return apiFetch('/api/student/dashboard', { headers: buildRoleHeaders({ role: 'student' }) });
  },

  getFacultyDashboard: async () => {
    return apiFetch('/api/faculty/dashboard', { headers: buildRoleHeaders({ role: 'faculty' }) });
  },

  getAdminDashboard: async () => {
    return apiFetch('/api/admin/dashboard', { headers: buildRoleHeaders({ role: 'admin' }) });
  },
};

// ============================================================
// Leave Service
// ============================================================
window.LeaveService = {
  submitLeaveApplication: async (data) => {
    // Backend student apply expects: attendance, leaveType, duration, reason
    return apiFetch('/api/student/apply', {
      method: 'POST',
      headers: buildRoleHeaders({ role: 'student' }),
      body: data,
    });
  },

  /**
   * Get all leave requests with optional filters
   * @param {object} filters - { status, type, startDate, endDate, search }
   */
  getStudentLeaves: async () => {
    return apiFetch('/api/student/leaves', { headers: buildRoleHeaders({ role: 'student' }) });
  },

  getFacultyPending: async () => {
    return apiFetch('/api/faculty/pending', { headers: buildRoleHeaders({ role: 'faculty' }) });
  },

  facultyApplyLeave: async (data) => {
    return apiFetch('/api/faculty/apply', {
      method: 'POST',
      headers: buildRoleHeaders({ role: 'faculty' }),
      body: data,
    });
  },

  facultyDecision: async (leaveId, status, reason = '') => {
    return apiFetch(`/api/faculty/leave/${leaveId}`, {
      method: 'PUT',
      headers: buildRoleHeaders({ role: 'faculty' }),
      body: { status, reason },
    });
  },

  getAdminUsers: async () => {
    return apiFetch('/api/admin/users', { headers: buildRoleHeaders({ role: 'admin' }) });
  },

  getAdminLeaves: async () => {
    return apiFetch('/api/admin/leaves', { headers: buildRoleHeaders({ role: 'admin' }) });
  },

  getAdminPending: async () => {
    return apiFetch('/api/admin/pending', { headers: buildRoleHeaders({ role: 'admin' }) });
  },

  adminDecision: async (leaveId, status, reason = '') => {
    return apiFetch(`/api/admin/leave/${leaveId}`, {
      method: 'PUT',
      headers: buildRoleHeaders({ role: 'admin' }),
      body: { status, reason },
    });
  },
};

// ============================================================
// AI Prediction Service
// ============================================================
window.PredictionService = {
  // Backend returns prediction during apply. Here we do a light client-side preview.
  getPreview: async ({ attendance, leaveType, duration }) => {
    const att = Number(attendance) || 0;
    const dur = Number(duration) || 1;
    const type = String(leaveType || '').toLowerCase();
    let score = 0.3;
    if (att > 90) score += 0.45;
    else if (att > 80) score += 0.3;
    else if (att > 70) score += 0.1;
    else score -= 0.15;
    if (type === 'medical') score += 0.2;
    else if (type === 'emergency') score += 0.1;
    else score -= 0.05;
    if (dur >= 6) score -= 0.12;
    else if (dur >= 4) score -= 0.06;
    score = Math.max(0.02, Math.min(0.98, score));
    const probability = Math.round(score * 100);
    return {
      probability,
      explanation: 'Preview based on attendance, leave type, and duration.',
      factors: [
        { label: 'Attendance', impact: att >= 80 ? 'positive' : 'negative', value: `${att}%` },
        { label: 'Leave Type', impact: type === 'medical' ? 'positive' : type === 'emergency' ? 'positive' : 'neutral', value: type || '—' },
        { label: 'Duration', impact: dur <= 2 ? 'positive' : dur >= 6 ? 'negative' : 'neutral', value: `${dur} day(s)` },
      ],
    };
  },
};

// ============================================================
// Notifications Service
// ============================================================
window.NotificationService = {
  /**
   * Get all notifications for a student
   * @param {string} studentId
   */
  getNotifications: async () => {
    try {
      const notifications = await apiFetch('/api/notifications', {
        headers: buildRoleHeaders(),
      });
      return Array.isArray(notifications) ? notifications : [];
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      // Fallback for older backend instances where notifications route is not yet available.
      if (message.includes('route not found') || message.includes('(404)')) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId
   */
  markAsRead: async (notificationId) => {
    await apiFetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: buildRoleHeaders(),
    });
    return true;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    await apiFetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: buildRoleHeaders(),
    });
    return true;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    const notifications = await window.NotificationService.getNotifications();
    return notifications.filter(n => !n.read).length;
  },
};

console.log('[AutoLeave AI] API Services loaded (backend-integrated). Base URL:', getBaseUrl());
