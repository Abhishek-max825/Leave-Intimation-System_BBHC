// ============================================================
// AutoLeave AI – API Service Layer
// ============================================================
// Replace BASE_URL and mock implementations with real API calls.
// ============================================================

const BASE_URL = '/api/v1'; // TODO: Replace with actual backend URL

// Simulated network delay
const delay = (ms = 800) => new Promise(res => setTimeout(res, ms));

// Generic fetch wrapper (ready for real API)
async function apiFetch(endpoint, options = {}) {
  // TODO: Replace with real fetch:
  // const response = await fetch(`${BASE_URL}${endpoint}`, {
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
  //   ...options,
  // });
  // if (!response.ok) throw new Error(response.statusText);
  // return response.json();
  console.log(`[API] ${options.method || 'GET'} ${BASE_URL}${endpoint}`);
  await delay(900 + Math.random() * 400);
}

// ============================================================
// Auth Service
// ============================================================
window.AuthService = {
  /**
   * Login with credentials
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    await delay(1200);
    // Simulate validation
    if (!email || !password) throw new Error('Email and password are required.');
    if (password.length < 4) throw new Error('Invalid credentials. Please try again.');
    // TODO: Call real API: POST /auth/login { email, password }
    return {
      token: 'mock-jwt-token-xyz',
      student: window.MOCK_DATA.student,
    };
  },

  /**
   * Logout
   */
  logout: async () => {
    await delay(300);
    // TODO: Call real API: POST /auth/logout
    return true;
  },

  /**
   * Get current session
   */
  getSession: () => {
    // TODO: Decode JWT token from localStorage
    const stored = localStorage.getItem('autoleave_user');
    return stored ? JSON.parse(stored) : null;
  },
};

// ============================================================
// Dashboard Service
// ============================================================
window.DashboardService = {
  /**
   * Get full dashboard data for a student
   * @param {string} studentId
   */
  getStudentDashboard: async (studentId) => {
    await delay(1000);
    // TODO: GET /dashboard/:studentId
    const leaves = window.MOCK_DATA.leaveRequests;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;

    return {
      student: window.MOCK_DATA.student,
      stats: {
        total: leaves.length,
        approved,
        pending,
        rejected,
      },
      latestLeave: leaves[1], // pending one as latest
      notifications: window.MOCK_DATA.notifications.slice(0, 4),
      attendance: window.MOCK_DATA.student.attendance,
      attendanceHistory: window.MOCK_DATA.attendanceHistory,
    };
  },
};

// ============================================================
// Leave Service
// ============================================================
window.LeaveService = {
  /**
   * Submit a new leave application
   * @param {object} data - Leave form data
   */
  submitLeaveApplication: async (data) => {
    await delay(1500);
    // Simulate occasional errors for demo
    // TODO: POST /leaves { ...data }
    if (!data.reason || data.reason.trim().length < 10) {
      throw new Error('Please provide a more detailed reason (at least 10 characters).');
    }
    const newLeave = {
      id: `LR-2024-00${Date.now().toString().slice(-3)}`,
      ...data,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      facultyRemark: null,
      aiPrediction: Math.floor(55 + Math.random() * 35),
      aiExplanation: 'Based on current attendance and leave history, approval chances are moderate.',
    };
    // Add to mock data
    window.MOCK_DATA.leaveRequests.unshift(newLeave);
    return newLeave;
  },

  /**
   * Get all leave requests with optional filters
   * @param {object} filters - { status, type, startDate, endDate, search }
   */
  getLeaveHistory: async (filters = {}) => {
    await delay(900);
    // TODO: GET /leaves?status=&type=&startDate=&endDate=&search=
    let leaves = [...window.MOCK_DATA.leaveRequests];

    if (filters.status && filters.status !== 'all') {
      leaves = leaves.filter(l => l.status === filters.status);
    }
    if (filters.type && filters.type !== 'all') {
      leaves = leaves.filter(l => l.typeKey === filters.type);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      leaves = leaves.filter(l =>
        l.reason.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }
    if (filters.startDate) {
      leaves = leaves.filter(l => l.startDate >= filters.startDate);
    }
    if (filters.endDate) {
      leaves = leaves.filter(l => l.endDate <= filters.endDate);
    }

    return { leaves, total: leaves.length };
  },

  /**
   * Cancel a leave request
   * @param {string} leaveId
   */
  cancelLeave: async (leaveId) => {
    await delay(700);
    // TODO: DELETE /leaves/:id
    const idx = window.MOCK_DATA.leaveRequests.findIndex(l => l.id === leaveId);
    if (idx !== -1) {
      window.MOCK_DATA.leaveRequests.splice(idx, 1);
    }
    return true;
  },
};

// ============================================================
// AI Prediction Service
// ============================================================
window.PredictionService = {
  /**
   * Get AI approval prediction for a leave application
   * @param {object} data - { type, days, reason, startDate }
   */
  getPrediction: async (data) => {
    await delay(600);
    // TODO: POST /ai/predict { ...data }
    // This would call a trained ML model endpoint
    const student = window.MOCK_DATA.student;
    let base = 70;

    // Attendance factor
    if (student.attendance >= 85) base += 10;
    else if (student.attendance < 75) base -= 20;

    // Leave type factor
    if (data.type === 'emergency') base += 15;
    else if (data.type === 'sick') base += 8;
    else if (data.type === 'personal') base -= 5;

    // Duration factor
    if (data.days <= 2) base += 5;
    else if (data.days > 5) base -= 10;

    // Reason length factor (proxy for detail)
    if (data.reason && data.reason.length > 50) base += 5;

    const probability = Math.min(95, Math.max(25, base + Math.floor(Math.random() * 10 - 5)));

    return {
      probability,
      confidence: probability > 70 ? 'high' : probability > 50 ? 'moderate' : 'low',
      explanation: probability > 70
        ? `Strong approval probability. Good attendance record (${student.attendance}%) and leave type support a positive outcome.`
        : probability > 50
        ? `Moderate approval chances. Consider providing additional documentation for better outcomes.`
        : `Lower approval probability. Attendance may be a concern. Ensure you have valid supporting documents.`,
      factors: [
        { label: 'Attendance Record', impact: student.attendance >= 80 ? 'positive' : 'negative', value: `${student.attendance}%` },
        { label: 'Leave Type', impact: data.type === 'emergency' || data.type === 'sick' ? 'positive' : 'neutral', value: data.type },
        { label: 'Duration', impact: (data.days || 1) <= 3 ? 'positive' : 'neutral', value: `${data.days || 1} day(s)` },
        { label: 'Prior History', impact: 'positive', value: '2 approvals' },
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
  getNotifications: async (studentId) => {
    await delay(600);
    // TODO: GET /notifications?studentId=
    return window.MOCK_DATA.notifications;
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId
   */
  markAsRead: async (notificationId) => {
    await delay(300);
    // TODO: PATCH /notifications/:id { read: true }
    const notif = window.MOCK_DATA.notifications.find(n => n.id === notificationId);
    if (notif) notif.read = true;
    return true;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    await delay(500);
    // TODO: PATCH /notifications/mark-all-read
    window.MOCK_DATA.notifications.forEach(n => n.read = true);
    return true;
  },

  /**
   * Get unread count
   */
  getUnreadCount: () => {
    return window.MOCK_DATA.notifications.filter(n => !n.read).length;
  },
};

console.log('[AutoLeave AI] API Services loaded. Replace mock implementations with real API calls.');
