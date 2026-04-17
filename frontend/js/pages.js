// ============================================================
// AutoLeave AI – All Page Components
// ============================================================

const { useState, useEffect, useCallback, useMemo, useRef } = React;

const DEFAULT_FACULTY_OPTIONS = ["Pranam", "Megha", "Harish Kanchan", "JayaSheela", "Wilma"];

// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ onLogin }) {
  const [form, setForm] = useState({
    role: 'student',
    userId: '',
    password: '',
    name: '',
    loginUserId: '',
    department: 'Department of Computer Application',
    customDepartment: '',
    registerPassword: '',
  });
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [defaultAdmin, setDefaultAdmin] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Focus first input after mount
    setTimeout(() => {
      const el = document.getElementById('userId');
      if (el) el.focus();
    }, 200);
  }, []);

  useEffect(() => {
    const loadFacultyUsers = async () => {
      try {
        let list = await window.AuthService.getFacultyUsers();
        if (!list || list.length === 0) {
          const seeded = await window.AuthService.bootstrapFacultyUsers();
          list = seeded.users || [];
        }
        setFacultyUsers(list);
      } catch (e) {
        console.warn('Failed to load faculty users', e);
      }
    };
    loadFacultyUsers();
  }, []);

  useEffect(() => {
    const loadDefaultAdmin = async () => {
      try {
        const admin = await window.AuthService.bootstrapAdminUser();
        setDefaultAdmin(admin);
      } catch (e) {
        console.warn('Failed to bootstrap default admin', e);
      }
    };
    loadDefaultAdmin();
  }, []);

  useEffect(() => {
    if (form.role !== 'admin') return;
    setShowRegister(false);
    setForm((prev) => ({
      ...prev,
      userId: defaultAdmin?.loginUserId || '',
      password: defaultAdmin?.defaultPassword || '',
    }));
  }, [form.role, defaultAdmin]);

  const validate = () => {
    const e = {};
    if (!form.role) e.role = 'Role is required.';
    if (!form.userId.trim()) {
      e.userId = `${form.role.charAt(0).toUpperCase() + form.role.slice(1)} login ID is required.`;
    }
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      let loginUserId = form.userId.trim() || null;
      let loginPassword = form.password;

      // Keep admin login deterministic by fetching/syncing the default admin first.
      if (form.role === 'admin') {
        const admin = await window.AuthService.bootstrapAdminUser();
        setDefaultAdmin(admin);
        loginUserId = admin?.loginUserId || loginUserId;
        loginPassword = admin?.defaultPassword || loginPassword;
        setForm((prev) => ({
          ...prev,
          userId: loginUserId || '',
          password: loginPassword || '',
        }));
      }

      const session = await window.AuthService.login({
        userId: loginUserId,
        role: form.role,
        password: loginPassword,
      });
      onLogin(session);
      addToast('Logged in successfully.', 'success');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const registerUserByRole = async () => {
    setApiError('');
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.loginUserId.trim()) e.loginUserId = 'Custom userId is required.';
    if (form.loginUserId.trim() && form.loginUserId.trim().length < 4) e.loginUserId = 'Custom userId must be at least 4 characters.';
    if (!form.department.trim()) e.department = 'Department is required.';
    if (form.department === 'other' && !form.customDepartment.trim()) e.customDepartment = 'Please specify department name.';
    if (!form.registerPassword || form.registerPassword.length < 4) e.registerPassword = 'Password must be at least 4 characters.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const created = await window.AuthService.register({
        name: form.name.trim(),
        role: form.role,
        department: form.department,
        customDepartment: form.customDepartment.trim(),
        loginUserId: form.loginUserId.trim(),
        password: form.registerPassword,
      });
      setForm((p) => ({ ...p, userId: created.loginUserId || created.userId, password: p.registerPassword }));
      addToast(`${form.role} account created. Custom userId added for login.`, 'success', 6000);
    } catch (err) {
      setApiError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'min-h-screen bg-transparent flex' },
    // Left branding panel
    React.createElement('div', { className: 'hidden lg:flex lg:w-5/12 xl:w-1/2 bg-teal-700 relative overflow-hidden flex-col justify-between p-10' },
      // Background pattern
      React.createElement('div', { className: 'absolute inset-0 opacity-10', style: { backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' } }),
      React.createElement('div', { className: 'absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20' }),
      React.createElement('div', { className: 'absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-20 -translate-x-20' }),

      // Logo
      React.createElement('div', { className: 'relative' },
        React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
          React.createElement('div', { className: 'w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center' },
            React.createElement(Icon, { name: 'Layers', size: 24, className: 'text-white' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-2xl font-bold text-white' }, 'AutoLeave AI'),
            React.createElement('p', { className: 'text-teal-200 text-sm' }, 'Smart Leave Intimation System')
          )
        )
      ),

      // Center content
      React.createElement('div', { className: 'relative space-y-6' },
        React.createElement('h2', { className: 'text-3xl xl:text-4xl font-bold text-white leading-snug' },
          'Transparent,',
          React.createElement('br'),
          'Smart, and',
          React.createElement('br'),
          React.createElement('span', { className: 'text-teal-200' }, 'Instant')
        ),
        React.createElement('p', { className: 'text-teal-100 text-base leading-relaxed' },
          'Apply for leave, track approvals in real-time, and get AI-powered insights — all from one unified platform designed for modern students.'
        ),
        React.createElement('div', { className: 'space-y-3' },
          [
            { icon: 'Sparkles', text: 'AI-powered approval prediction' },
            { icon: 'Bell', text: 'Real-time status notifications' },
            { icon: 'BarChart2', text: 'Attendance-aware insights' },
            { icon: 'Shield', text: 'Transparent leave workflows' },
          ].map(item =>
            React.createElement('div', { key: item.text, className: 'flex items-center gap-3' },
              React.createElement('div', { className: 'w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0' },
                React.createElement(Icon, { name: item.icon, size: 14, className: 'text-white' })
              ),
              React.createElement('span', { className: 'text-teal-100 text-sm' }, item.text)
            )
          )
        )
      ),

      // Footer
      React.createElement('div', { className: 'relative' },
        React.createElement('p', { className: 'text-teal-300/70 text-xs' }, '© 2024 AutoLeave AI · Student Leave Management · v2.0')
      )
    ),

    // Right login form
    React.createElement('div', { className: 'flex-1 flex items-center justify-center p-6 sm:p-10' },
      React.createElement('div', { className: 'w-full max-w-sm page-enter' },
        // Mobile logo
        React.createElement('div', { className: 'lg:hidden flex items-center gap-3 mb-8' },
          React.createElement('div', { className: 'w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center' },
            React.createElement(Icon, { name: 'Layers', size: 20, className: 'text-white' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100' }, 'AutoLeave AI'),
            React.createElement('p', { className: 'text-slate-400 text-xs' }, 'Smart Leave System')
          )
        ),

        React.createElement('div', { className: 'mb-7' },
          React.createElement('h2', { className: 'text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 tracking-tight' }, 'Welcome back'),
          React.createElement('p', { className: 'text-slate-500 dark:text-slate-400 text-sm' }, 'Select role and login to see your dashboard.')
        ),

        apiError && React.createElement('div', { className: 'mb-4' },
          React.createElement(AlertBanner, { type: 'error', message: apiError, onClose: () => setApiError('') })
        ),

        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4 pro-surface rounded-2xl p-5', noValidate: true },
          React.createElement(SelectField, {
            label: 'Role',
            id: 'role',
            value: form.role,
            onChange: e => setForm(p => ({ ...p, role: e.target.value })),
            error: errors.role,
            required: true,
          },
            React.createElement('option', { value: 'student' }, 'Student'),
            React.createElement('option', { value: 'faculty' }, 'Faculty'),
            React.createElement('option', { value: 'admin' }, 'Admin')
          ),

          !showRegister && (
            form.role === 'faculty'
              ? React.createElement(SelectField, {
                  label: 'Faculty Account',
                  id: 'faculty-user',
                  value: form.userId,
                  onChange: e => { setForm(p => ({ ...p, userId: e.target.value })); setErrors(p => ({ ...p, userId: '' })); },
                  error: errors.userId,
                  required: true,
                },
                  React.createElement('option', { value: '' }, '— Select faculty account —'),
                  facultyUsers.map((f) =>
                    React.createElement('option', { key: f.userId, value: f.userId }, `${f.name} (${f.department})`)
                  )
                )
              : React.createElement(InputField, {
                  label: form.role === 'student' ? 'Student Login ID' : 'Login ID',
                  id: 'userId',
                  type: 'text',
                  placeholder: form.role === 'admin' ? 'Default admin login ID auto-filled' : 'Enter custom login ID',
                  value: form.userId,
                  onChange: e => { setForm(p => ({ ...p, userId: e.target.value })); setErrors(p => ({ ...p, userId: '' })); },
                  error: errors.userId,
                  readOnly: form.role === 'admin',
                })
          ),

          !showRegister && React.createElement(InputField, {
            label: 'Password',
            id: 'login-password',
            type: 'password',
            placeholder: 'Enter account password',
            value: form.password,
            onChange: e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); },
            error: errors.password,
            required: true,
          }),

          form.role !== 'admin' && React.createElement('div', { className: 'border-t border-slate-200 pt-4' },
            React.createElement('button', {
              type: 'button',
              className: 'w-full text-left text-sm text-teal-700 hover:text-teal-800 font-medium',
              onClick: () => setShowRegister((prev) => !prev),
            }, showRegister ? `Hide create ${form.role} account` : `Create new ${form.role} account`),

            showRegister && React.createElement('div', { className: 'mt-3 space-y-3' },
              React.createElement('p', { className: 'text-xs text-slate-500 mb-2' }, `New ${form.role}? Create account and login using your custom userId.`),
              React.createElement(InputField, {
                label: 'Name',
                id: 'name',
                type: 'text',
                placeholder: 'Abhishek',
                value: form.name,
                onChange: e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); },
                error: errors.name,
              }),
              React.createElement(SelectField, {
                label: 'Department',
                id: 'department-select',
                value: form.department,
                onChange: e => { setForm(p => ({ ...p, department: e.target.value })); setErrors(p => ({ ...p, department: '', customDepartment: '' })); },
                error: errors.department,
                required: true,
              },
                React.createElement('option', { value: 'Department of Computer Application' }, 'Department of Computer Application'),
                React.createElement('option', { value: 'Department of Commerce' }, 'Department of Commerce'),
                React.createElement('option', { value: 'other' }, 'Other')
              ),
              form.department === 'other' && React.createElement(InputField, {
                label: 'Specify Department Name',
                id: 'customDepartment',
                type: 'text',
                placeholder: 'Enter department name',
                value: form.customDepartment,
                onChange: e => { setForm(p => ({ ...p, customDepartment: e.target.value })); setErrors(p => ({ ...p, customDepartment: '' })); },
                error: errors.customDepartment,
                required: true,
              }),
              React.createElement(InputField, {
                label: 'Custom UserId',
                id: 'loginUserId',
                type: 'text',
                placeholder: 'e.g. bca_abhishek',
                value: form.loginUserId,
                onChange: e => { setForm(p => ({ ...p, loginUserId: e.target.value })); setErrors(p => ({ ...p, loginUserId: '' })); },
                error: errors.loginUserId,
                required: true,
              }),
              React.createElement(InputField, {
                label: 'Create Password',
                id: 'registerPassword',
                type: 'password',
                placeholder: 'At least 4 characters',
                value: form.registerPassword,
                onChange: e => { setForm(p => ({ ...p, registerPassword: e.target.value })); setErrors(p => ({ ...p, registerPassword: '' })); },
                error: errors.registerPassword,
                required: true,
              }),
              React.createElement(Button, {
                type: 'button',
                variant: 'secondary',
                size: 'md',
                loading,
                className: 'w-full mt-2',
                onClick: registerUserByRole,
              }, `Create ${form.role} Account`)
            )
          ),

          !showRegister && React.createElement(Button, {
            type: 'submit',
            variant: 'primary',
            size: 'lg',
            loading,
            className: 'w-full',
          }, 'Continue')
        ),

        React.createElement('p', { className: 'mt-8 text-center text-xs text-slate-400 dark:text-slate-500' },
          'Having trouble? Contact your college IT support.'
        )
      )
    )
  );
}

// ============================================================
// DASHBOARD PAGE
// ============================================================
function DashboardPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = window.AuthService.getSession();
      if (!session?.role) throw new Error('Missing session. Please login again.');

      let result;
      if (session.role === 'student') result = await window.DashboardService.getStudentDashboard();
      else if (session.role === 'faculty') result = await window.DashboardService.getFacultyDashboard();
      else result = await window.DashboardService.getAdminDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (error) return React.createElement('div', { className: 'p-6' },
    React.createElement(ErrorState, { message: error, onRetry: loadDashboard })
  );

  const session = window.AuthService.getSession();
  const role = (session?.role || 'student').toLowerCase();

  if (role === 'faculty') {
    return React.createElement(FacultyDashboardPage, { loading, data, error, onReload: loadDashboard, onNavigate });
  }

  if (role === 'admin') {
    return React.createElement(AdminDashboardPage, { loading, data, error, onReload: loadDashboard });
  }

  // Student dashboard (default)
  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
  const recentLeaves = data?.recentLeaves || [];
  const latest = recentLeaves[0] || null;
  const attendance = latest?.attendance ?? 0;

  return React.createElement('div', { className: 'px-7 py-6 space-y-6' },
    // Welcome Banner
    React.createElement('div', { className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3' },
      React.createElement('div', null,
        loading
            ? React.createElement('div', { className: 'space-y-2' },
              React.createElement(SkeletonLine, { className: 'h-6 w-48' }),
              React.createElement(SkeletonLine, { className: 'h-4 w-64' })
            )
          : React.createElement(React.Fragment, null,
              React.createElement('h2', { className: 'text-[18px] font-medium text-[#0F172A]' },
                `Welcome, ${session?.name?.split(' ')[0] || 'Student'}`
              ),
              React.createElement('p', { className: 'text-[13px] text-[#64748B] mt-0.5' },
                `Role-based dashboard · Student`
              )
            )
      ),
      React.createElement(Button, {
        variant: 'primary',
        onClick: () => onNavigate('apply'),
        className: 'flex-shrink-0 self-start sm:self-auto',
        disabled: loading,
      },
        '+',
        'Apply Leave'
      )
    ),

    // Stats Cards
    React.createElement('div', { className: 'grid grid-cols-2 lg:grid-cols-4 gap-4' },
      [
        { key: 'total', title: 'Total Applied', icon: 'FileText', iconColor: 'text-[#2563EB]', subtitle: 'All time requests' },
        { key: 'approved', title: 'Approved', icon: 'CheckCircle', iconColor: 'text-[#16A34A]', subtitle: 'Leave granted' },
        { key: 'pending', title: 'Pending', icon: 'Clock', iconColor: 'text-[#D97706]', subtitle: 'Awaiting decision' },
        { key: 'rejected', title: 'Rejected', icon: 'XCircle', iconColor: 'text-[#DC2626]', subtitle: 'Not sanctioned' },
      ].map(c =>
        React.createElement(StatCard, { key: c.key, loading, title: c.title, value: loading ? '—' : (stats?.[c.key] ?? 0), icon: c.icon, iconColor: c.iconColor, subtitle: c.subtitle })
      )
    ),

    // Main grid
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6' },

      // Left column - 2/3 width on large screens
      React.createElement('div', { className: 'lg:col-span-2 space-y-6' },

        // Latest Leave + AI
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-[10px] uppercase tracking-[0.1em] text-[#94A3B8] mb-2' }, 'Latest Leave'),
          loading
            ? React.createElement(SkeletonCard)
            : latest
              ? React.createElement(Card, { className: 'p-4 sm:p-5' },
                  React.createElement('div', { className: 'flex flex-col sm:flex-row sm:items-start gap-4' },
                    React.createElement('div', { className: 'flex-1' },
                      React.createElement('div', { className: 'flex items-start justify-between gap-2 mb-3' },
                        React.createElement('div', null,
                          React.createElement('p', { className: 'text-[15px] font-semibold text-[#0F172A]' }, latest.leaveType),
                          React.createElement('p', { className: 'text-[13px] text-[#64748B] mt-1 flex items-center gap-1' },
                            React.createElement(Icon, { name: 'Calendar', size: 12 }),
                            `${latest.duration} day(s) · Attendance ${latest.attendance}%`
                          )
                        ),
                        React.createElement(StatusBadge, { status: latest.status, size: 'lg' })
                      ),
                      React.createElement('p', { className: 'text-[13px] text-[#64748B] line-clamp-2 mb-3' }, latest.reason || '—'),
                      React.createElement('div', { className: 'flex items-center gap-2 text-[12px] text-[#94A3B8] flex-wrap' },
                        React.createElement('span', null, `Decision: ${latest.decision || '—'}`),
                        React.createElement('span', null, '·'),
                        React.createElement('span', null, `Risk: ${latest.riskLevel || '—'}`),
                        React.createElement('span', null, '·'),
                        React.createElement('span', null, `New Attendance: ${latest.newAttendance}%`)
                      ),
                      latest.riskLevel === 'HIGH' && React.createElement('div', { className: 'mt-3' },
                        React.createElement(AlertBanner, { type: 'warning', message: '⚠ Attendance may drop below 75%' })
                      )
                    )
                  ),
                  React.createElement('div', { className: 'mt-4 pt-3 border-t border-[#E2E8F0] flex gap-2' },
                    React.createElement('button', { className: 'text-[13px] text-[#2563EB] font-medium', onClick: () => onNavigate('history') }, 'View History →')
                  )
                )
              : React.createElement(Card, { className: 'p-5' },
                  React.createElement(EmptyState, {
                    icon: 'FileText',
                    title: 'No leave requests yet',
                    message: 'Apply for your first leave to see its status here.',
                    actionLabel: 'Apply Leave',
                    onAction: () => onNavigate('apply'),
                  })
                )
        ),

        // Recent Notifications
        React.createElement('div', null,
          React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('h3', { className: 'text-[10px] uppercase tracking-[0.1em] text-[#94A3B8]' }, 'Recent Updates'),
            React.createElement('button', {
              onClick: () => onNavigate('notifications'),
              className: 'text-[13px] text-[#2563EB] hover:underline flex items-center gap-0.5',
            }, 'See all')
          ),
          loading
            ? React.createElement(Card, { className: 'p-2 divide-y divide-slate-100 dark:divide-slate-700' },
                [1, 2, 3].map(i => React.createElement('div', { key: i, className: 'flex gap-3 p-2' },
                  React.createElement('div', { className: 'shimmer-bg w-8 h-8 rounded-lg flex-shrink-0' }),
                  React.createElement('div', { className: 'flex-1 space-y-2 py-1' },
                    React.createElement(SkeletonLine, { className: 'h-3 w-32' }),
                    React.createElement(SkeletonLine, { className: 'h-3' })
                  )
                ))
              )
            : React.createElement(Card, { className: 'p-2 divide-y divide-slate-100 dark:divide-slate-700' },
                (data?.notifications?.slice(0, 4) || []).map(n =>
                  React.createElement(NotificationItem, {
                    key: n.id,
                    notif: n,
                    compact: true,
                    onMarkRead: async (id) => {
                      await window.NotificationService.markAsRead(id);
                    }
                  })
                ),
                (!data?.notifications || data.notifications.length === 0) && React.createElement('div', { className: 'p-4 text-center' },
                  React.createElement('p', { className: 'text-sm text-slate-400 dark:text-slate-500' }, 'No notifications yet')
                )
              )
        ),
      ),

      // Right column
      React.createElement('div', { className: 'space-y-6' },

        // Attendance Widget
        React.createElement(AttendanceWidget, {
          loading,
          percentage: attendance || 0,
          totalDays: 100,
          presentDays: Math.round((attendance || 0)),
        }),

        // AI Prediction Card
        React.createElement('div', null,
          React.createElement(AIPredictionCard, {
            loading,
            probability: latest ? Math.round((latest.predictionScore || 0) * 100) : 0,
            explanation: latest?.reason || 'Apply leave to see AI prediction.',
            factors: [
              { label: 'Attendance', value: `${latest?.attendance ?? 0}%`, percent: latest?.attendance ?? 0 },
              { label: 'Leave Type', value: `${latest?.leaveType ?? '—'}`, percent: 70 },
              { label: 'Duration', value: `${latest?.duration ?? 0}d`, percent: 60 },
              { label: 'Risk', value: `${latest?.riskLevel ?? '—'}`, percent: latest?.riskLevel === 'HIGH' ? 30 : latest?.riskLevel === 'MEDIUM' ? 60 : 85 },
            ],
          })
        ),

        // Quick Actions
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-[10px] uppercase tracking-[0.1em] text-[#94A3B8] mb-3' }, 'Quick Actions'),
          React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
            [
              { icon: 'FilePlus2', label: 'Apply Leave', page: 'apply' },
              { icon: 'ClipboardList', label: 'View History', page: 'history' },
              { icon: 'Bell', label: 'Notifications', page: 'notifications' },
              { icon: 'UserCircle', label: 'Profile', page: 'profile' },
            ].map(a =>
              React.createElement('button', {
                key: a.page,
                onClick: () => onNavigate(a.page),
                className: 'flex flex-col items-center gap-2 p-4 rounded-[10px] border border-[#E2E8F0] bg-white smooth-transition',
              },
                React.createElement(Icon, { name: a.icon, size: 18, className: 'text-[#2563EB]' }),
                React.createElement('span', { className: 'text-[12px] font-medium text-[#0F172A]' }, a.label)
              )
            )
          )
        )
      )
    )
  );
}

// ============================================================
// FACULTY DASHBOARD
// ============================================================
function FacultyDashboardPage({ loading, data, onNavigate }) {
  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const { addToast } = useToast();

  const loadPending = useCallback(async (showLoader = true) => {
    if (showLoader) setPendingLoading(true);
    try {
      const leaves = await window.LeaveService.getFacultyPending();
      setPending(leaves);
    } catch (e) {
      if (showLoader) addToast(e.message || 'Failed to load pending leaves', 'error');
    } finally {
      if (showLoader) setPendingLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(true); }, [loadPending]);
  useEffect(() => {
    const interval = setInterval(() => {
      loadPending(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadPending]);

  const decide = async (id, status) => {
    try {
      const decisionReason = window.prompt('Optional reason for this decision (leave blank if not needed):', '') || '';
      await window.LeaveService.facultyDecision(id, status, decisionReason);
      addToast(`Leave ${status} successfully`, 'success');
      loadPending();
    } catch (e) {
      addToast(e.message || 'Action failed', 'error');
    }
  };

  const forwardToAdmin = async (id) => {
    try {
      const forwardReason = window.prompt('Reason for forwarding to admin (optional):', '') || '';
      await window.LeaveService.facultyForwardToAdmin(id, forwardReason);
      addToast('Leave forwarded to admin successfully', 'success');
      loadPending();
    } catch (e) {
      addToast(e.message || 'Failed to forward leave', 'error');
    }
  };

  return React.createElement('div', { className: 'p-6 space-y-5 page-enter' },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100' }, 'Faculty Dashboard'),
        React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 mt-0.5' }, 'Review pending leaves with AI risk insights.')
      ),
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement(Button, { variant: 'secondary', onClick: loadPending }, React.createElement(Icon, { name: 'RefreshCw', size: 16 }), 'Refresh'),
        React.createElement(Button, { variant: 'primary', onClick: () => onNavigate('faculty-apply') }, React.createElement(Icon, { name: 'FilePlus2', size: 16 }), 'Apply Leave')
      )
    ),

    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4' },
      React.createElement(StatCard, { loading, title: 'Pending', value: data?.stats?.pending ?? 0, icon: 'Clock', iconColor: 'text-amber-600', subtitle: 'Needs action' }),
      React.createElement(StatCard, { loading, title: 'Approved', value: data?.stats?.approved ?? 0, icon: 'CheckCircle', iconColor: 'text-green-600', subtitle: 'Completed' }),
      React.createElement(StatCard, { loading, title: 'Rejected', value: data?.stats?.rejected ?? 0, icon: 'XCircle', iconColor: 'text-red-600', subtitle: 'Completed' }),
    ),

    React.createElement(Card, { className: 'p-4' },
      React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3' }, 'Pending Leaves'),
      pendingLoading
        ? React.createElement(LoadingOverlay, { message: 'Loading pending leaves...' })
        : pending.length === 0
          ? React.createElement(EmptyState, { icon: 'ClipboardList', title: 'No pending leaves', message: 'All caught up.' })
          : React.createElement('div', { className: 'space-y-3' },
              pending.map(l =>
                React.createElement(Card, { key: l.leaveId, className: 'p-4 border border-slate-100' },
                  React.createElement('div', { className: 'flex flex-col md:flex-row md:items-center md:justify-between gap-3' },
                    React.createElement('div', { className: 'min-w-0' },
                      React.createElement('p', { className: 'font-semibold text-slate-800' }, `${l.leaveType} · ${l.duration} day(s)`),
                      React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `Attendance: ${l.attendance}% · New: ${l.newAttendance}% · Risk: ${l.riskLevel}`),
                      l.riskLevel === 'HIGH' && React.createElement('p', { className: 'text-xs text-amber-700 mt-1' }, '⚠ Consider rejecting or reducing duration')
                    ),
                    React.createElement('div', { className: 'flex items-center gap-3' },
                      React.createElement('div', { className: 'w-40' },
                        React.createElement(AIPredictionCard, { compact: true, probability: Math.round((l.predictionScore || 0) * 100), explanation: l.decision || '' })
                      ),
                      React.createElement('div', { className: 'flex gap-2' },
                        React.createElement(Button, { variant: 'success', onClick: () => decide(l.leaveId, 'approved') }, 'Approve'),
                        React.createElement(Button, { variant: 'danger', onClick: () => decide(l.leaveId, 'rejected') }, 'Reject'),
                        React.createElement(Button, { variant: 'secondary', onClick: () => forwardToAdmin(l.leaveId) }, 'Forward to Admin')
                      )
                    )
                  )
                )
              )
            )
    )
  );
}

function FacultyApplyLeavePage({ onNavigate }) {
  const [applyLoading, setApplyLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [leaveSummary, setLeaveSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [applyForm, setApplyForm] = useState({
    attendance: 85,
    leaveType: '',
    duration: 1,
    reason: '',
  });
  const [applyErrors, setApplyErrors] = useState({});
  const { addToast } = useToast();

  const loadOwnLeaveSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const summary = await window.LeaveService.getFacultyOwnLeaveSummary();
      setLeaveSummary({
        total: Number(summary?.total) || 0,
        pending: Number(summary?.pending) || 0,
        approved: Number(summary?.approved) || 0,
        rejected: Number(summary?.rejected) || 0,
      });
    } catch {
      // Keep default summary when backend is unavailable.
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwnLeaveSummary();
  }, [loadOwnLeaveSummary]);

  const validateApply = () => {
    const e = {};
    if (applyForm.attendance === undefined || applyForm.attendance === null || applyForm.attendance === '') e.attendance = 'Attendance is required.';
    if (!applyForm.leaveType) e.leaveType = 'Leave type is required.';
    if (!applyForm.duration || Number(applyForm.duration) < 1) e.duration = 'Duration must be at least 1 day.';
    if (!applyForm.reason || applyForm.reason.trim().length < 10) e.reason = 'Reason should be at least 10 characters.';
    return e;
  };

  const submitFacultyLeave = async (evt) => {
    evt.preventDefault();
    const e = validateApply();
    setApplyErrors(e);
    if (Object.keys(e).length > 0) return;

    setApplyLoading(true);
    try {
      await window.LeaveService.facultyApplyLeave({
        attendance: Number(applyForm.attendance),
        leaveType: applyForm.leaveType,
        duration: Number(applyForm.duration),
        reason: applyForm.reason.trim(),
      });
      addToast('Faculty leave submitted to admin successfully.', 'success');
      loadOwnLeaveSummary();
      setApplyForm({ attendance: 85, leaveType: '', duration: 1, reason: '' });
      setApplyErrors({});
      setTimeout(() => onNavigate('dashboard'), 600);
    } catch (err) {
      addToast(err.message || 'Failed to submit faculty leave.', 'error');
    } finally {
      setApplyLoading(false);
    }
  };

  return React.createElement('div', { className: 'p-6 space-y-5 page-enter' },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100' }, 'Faculty Leave Application'),
        React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 mt-0.5' }, 'Submit your leave request to admin from this dedicated page.')
      ),
      React.createElement(Button, { variant: 'secondary', onClick: () => onNavigate('dashboard') }, React.createElement(Icon, { name: 'ChevronLeft', size: 16 }), 'Back to Dashboard')
    ),
    React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3' },
      React.createElement(StatCard, { loading: summaryLoading, title: 'Leaves Taken', value: leaveSummary.total, icon: 'FileText', iconColor: 'text-blue-600', subtitle: 'All faculty requests' }),
      React.createElement(StatCard, { loading: summaryLoading, title: 'Pending', value: leaveSummary.pending, icon: 'Clock', iconColor: 'text-amber-600', subtitle: 'Awaiting admin action' }),
      React.createElement(StatCard, { loading: summaryLoading, title: 'Approved', value: leaveSummary.approved, icon: 'CheckCircle', iconColor: 'text-green-600', subtitle: 'Sanctioned by admin' }),
      React.createElement(StatCard, { loading: summaryLoading, title: 'Rejected', value: leaveSummary.rejected, icon: 'XCircle', iconColor: 'text-red-600', subtitle: 'Declined by admin' }),
    ),
    React.createElement(Card, { className: 'p-4' },
      React.createElement('form', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3', onSubmit: submitFacultyLeave },
        React.createElement(InputField, {
          label: 'Current Attendance (%)',
          id: 'faculty-attendance',
          type: 'number',
          min: 0,
          max: 100,
          value: applyForm.attendance,
          onChange: (e) => { setApplyForm((p) => ({ ...p, attendance: e.target.value })); setApplyErrors((p) => ({ ...p, attendance: '' })); },
          error: applyErrors.attendance,
          required: true,
        }),
        React.createElement(SelectField, {
          label: 'Leave Type',
          id: 'faculty-leave-type',
          value: applyForm.leaveType,
          onChange: (e) => { setApplyForm((p) => ({ ...p, leaveType: e.target.value })); setApplyErrors((p) => ({ ...p, leaveType: '' })); },
          error: applyErrors.leaveType,
          required: true,
        },
          React.createElement('option', { value: '' }, '— Select leave type —'),
          ['medical', 'personal', 'emergency'].map((t) =>
            React.createElement('option', { key: t, value: t }, t)
          )
        ),
        React.createElement(InputField, {
          label: 'Duration (days)',
          id: 'faculty-duration',
          type: 'number',
          min: 1,
          max: 7,
          value: applyForm.duration,
          onChange: (e) => { setApplyForm((p) => ({ ...p, duration: e.target.value })); setApplyErrors((p) => ({ ...p, duration: '' })); },
          error: applyErrors.duration,
          required: true,
        }),
        React.createElement('div', { className: 'flex items-end' },
          React.createElement(Button, { type: 'submit', variant: 'primary', loading: applyLoading, className: 'w-full md:w-auto' }, 'Submit to Admin')
        ),
        React.createElement('div', { className: 'md:col-span-2' },
          React.createElement(TextareaField, {
            label: 'Reason',
            id: 'faculty-reason',
            rows: 3,
            value: applyForm.reason,
            onChange: (e) => { setApplyForm((p) => ({ ...p, reason: e.target.value })); setApplyErrors((p) => ({ ...p, reason: '' })); },
            error: applyErrors.reason,
            required: true,
          })
        )
      )
    )
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboardPage({ loading, data, initialTab = 'analytics' }) {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState(initialTab);
  const [busy, setBusy] = useState(false);
  const [reportFilters, setReportFilters] = useState({ role: 'student', name: '', userId: '' });
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState('');
  const { addToast } = useToast();

  const loadAll = useCallback(async (showLoader = true) => {
    if (showLoader) setBusy(true);
    try {
      const [u, l, p] = await Promise.all([
        window.LeaveService.getAdminUsers(),
        window.LeaveService.getAdminLeaves(),
        window.LeaveService.getAdminPending(),
      ]);
      setUsers(u);
      setLeaves(l);
      setPending(p);
    } catch (e) {
      if (showLoader) addToast(e.message || 'Failed to load admin data', 'error');
    } finally {
      if (showLoader) setBusy(false);
    }
  }, []);

  useEffect(() => { loadAll(true); }, [loadAll]);
  useEffect(() => {
    const interval = setInterval(() => {
      loadAll(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const analytics = {
    totalUsers: Number(data?.analytics?.totalUsers) || 0,
    totalStudents: Number(data?.analytics?.totalStudents) || 0,
    totalFaculty: Number(data?.analytics?.totalFaculty) || 0,
    totalAdmins: Number(data?.analytics?.totalAdmins) || 0,
    totalLeaves: Number(data?.analytics?.totalLeaves) || 0,
    studentLeaves: Number(data?.analytics?.studentLeaves) || 0,
    facultyLeaves: Number(data?.analytics?.facultyLeaves) || 0,
    approvalRate: Number(data?.analytics?.approvalRate) || 0,
    pendingFacultyRequests: Number(data?.analytics?.pendingFacultyRequests) || 0,
  };
  const handleAdminDecision = async (leaveId, status) => {
    try {
      const decisionReason = window.prompt('Optional reason for this decision (leave blank if not needed):', '') || '';
      await window.LeaveService.adminDecision(leaveId, status, decisionReason);
      addToast(`Leave ${status} successfully`, 'success');
      loadAll();
    } catch (e) {
      addToast(e.message || 'Failed to update leave status', 'error');
    }
  };

  const buildPersonReport = () => {
    setReportError('');
    const normalizedName = String(reportFilters.name || '').trim().toLowerCase();
    const normalizedUserId = String(reportFilters.userId || '').trim().toLowerCase();
    const roleFilter = String(reportFilters.role || 'all').toLowerCase();
    const allowedRoles = roleFilter === 'all' ? ['student', 'faculty'] : [roleFilter];

    if (!normalizedName && !normalizedUserId) {
      setReport(null);
      setReportError('Enter student/faculty name or userId to generate report.');
      return;
    }

    let matches = users.filter((u) => allowedRoles.includes(String(u.role || '').toLowerCase()));
    if (normalizedUserId) {
      matches = matches.filter((u) => {
        const internalId = String(u.userId || '').toLowerCase();
        const customId = String(u.loginUserId || '').toLowerCase();
        return internalId === normalizedUserId || customId === normalizedUserId;
      });
    }
    if (normalizedName) {
      matches = matches.filter((u) => String(u.name || '').toLowerCase().includes(normalizedName));
    }

    if (matches.length === 0) {
      setReport(null);
      setReportError('No matching student/faculty found for the entered details.');
      return;
    }
    if (matches.length > 1 && !normalizedUserId) {
      setReport(null);
      setReportError('Multiple matches found. Please enter exact userId for a unique report.');
      return;
    }

    const person = matches[0];
    const personRole = String(person.role || '').toLowerCase();
    const personLeaves = leaves
      .filter((l) =>
        String(l.studentId || '') === String(person.userId) &&
        String(l.applicantRole || '').toLowerCase() === personRole
      )
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const total = personLeaves.length;
    const approved = personLeaves.filter((l) => l.status === 'approved').length;
    const pendingCount = personLeaves.filter((l) => l.status === 'pending').length;
    const rejected = personLeaves.filter((l) => l.status === 'rejected').length;
    const highRisk = personLeaves.filter((l) => String(l.riskLevel || '').toUpperCase() === 'HIGH').length;
    const averageDuration = total === 0
      ? 0
      : Number((personLeaves.reduce((sum, l) => sum + (Number(l.duration) || 0), 0) / total).toFixed(2));
    const averagePrediction = total === 0
      ? 0
      : Number((personLeaves.reduce((sum, l) => sum + (Number(l.predictionScore) || 0), 0) / total * 100).toFixed(2));
    const approvalRateForPerson = total === 0 ? 0 : Number(((approved / total) * 100).toFixed(2));

    setReport({
      person,
      total,
      approved,
      pending: pendingCount,
      rejected,
      highRisk,
      averageDuration,
      averagePrediction,
      approvalRateForPerson,
      recentLeaves: personLeaves.slice(0, 10),
    });
  };

  return React.createElement('div', { className: 'p-6 space-y-5 page-enter' },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100' }, 'Admin Dashboard'),
        React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 mt-0.5' }, 'Monitor users, leaves, and analytics.')
      ),
      React.createElement(Button, { variant: 'secondary', onClick: loadAll }, React.createElement(Icon, { name: 'RefreshCw', size: 16 }), 'Refresh')
    ),

    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
      React.createElement(StatCard, { loading, title: 'Students', value: analytics.totalStudents, icon: 'GraduationCap', iconColor: 'text-blue-600', subtitle: `of ${analytics.totalUsers} total users` }),
      React.createElement(StatCard, { loading, title: 'Faculty', value: analytics.totalFaculty, icon: 'UserCheck', iconColor: 'text-indigo-600', subtitle: `Admins: ${analytics.totalAdmins}` }),
      React.createElement(StatCard, { loading, title: 'Student Leaves', value: analytics.studentLeaves, icon: 'ClipboardList', iconColor: 'text-purple-600', subtitle: `Faculty leaves: ${analytics.facultyLeaves}` }),
      React.createElement(StatCard, { loading, title: 'Total Leaves', value: analytics.totalLeaves, icon: 'FileText', iconColor: 'text-slate-700', subtitle: 'Student + Faculty requests' }),
      React.createElement(StatCard, { loading, title: 'Approval Rate', value: `${analytics.approvalRate}%`, icon: 'BarChart2', iconColor: 'text-green-600', subtitle: 'Approved / Total' }),
      React.createElement(StatCard, { loading, title: 'Pending Faculty', value: analytics.pendingFacultyRequests ?? 0, icon: 'Clock', iconColor: 'text-amber-600', subtitle: 'Needs admin action' }),
    ),

    React.createElement('div', { className: 'flex gap-2' },
      ['analytics', 'users', 'leaves', 'pending'].map(t =>
        React.createElement('button', {
          key: t,
          onClick: () => setTab(t),
          className: cn('px-3.5 py-1.5 rounded-lg text-sm font-medium smooth-transition capitalize',
            tab === t ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          ),
        }, t)
      )
    ),

    busy
      ? React.createElement(LoadingOverlay, { message: 'Loading admin data...' })
      : tab === 'analytics'
        ? React.createElement('div', { className: 'space-y-4' },
            React.createElement(Card, { className: 'p-4' },
              React.createElement('h3', { className: 'text-sm font-semibold mb-3' }, 'Person-wise Analysis'),
              React.createElement('p', { className: 'text-xs text-slate-500 mb-3' }, 'Search by student/faculty name or exact userId to generate a detailed report.'),
              React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-3' },
                React.createElement(SelectField, {
                  label: 'Role',
                  id: 'analysis-role',
                  value: reportFilters.role,
                  onChange: (e) => setReportFilters((p) => ({ ...p, role: e.target.value })),
                },
                  React.createElement('option', { value: 'student' }, 'Student only'),
                  React.createElement('option', { value: 'faculty' }, 'Faculty only'),
                ),
                React.createElement(InputField, {
                  label: 'Name',
                  id: 'analysis-name',
                  type: 'text',
                  placeholder: 'Enter name',
                  value: reportFilters.name,
                  onChange: (e) => setReportFilters((p) => ({ ...p, name: e.target.value })),
                }),
                React.createElement(InputField, {
                  label: 'UserId',
                  id: 'analysis-userid',
                  type: 'text',
                  placeholder: 'Enter exact userId',
                  value: reportFilters.userId,
                  onChange: (e) => setReportFilters((p) => ({ ...p, userId: e.target.value })),
                }),
                React.createElement('div', { className: 'flex items-end' },
                  React.createElement(Button, { variant: 'primary', onClick: buildPersonReport, className: 'w-full md:w-auto' },
                    React.createElement(Icon, { name: 'Search', size: 16 }),
                    'Generate Report'
                  )
                )
              ),
              reportError && React.createElement('p', { className: 'text-xs text-red-600 mt-2' }, reportError)
            ),
            report && React.createElement(React.Fragment, null,
              React.createElement(Card, { className: 'p-4' },
                React.createElement('div', { className: 'flex flex-col md:flex-row md:items-center md:justify-between gap-2' },
                  React.createElement('div', null,
                    React.createElement('h3', { className: 'text-sm font-semibold' }, `${report.person.name} (${report.person.role})`),
                    React.createElement('p', { className: 'text-xs text-slate-500 mt-0.5' }, `Login ID: ${report.person.loginUserId || report.person.userId} · Department: ${report.person.department || 'N/A'}`)
                  ),
                  React.createElement('p', { className: 'text-xs text-slate-500' }, 'Detailed leave behavior summary')
                )
              ),
              React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-3' },
                React.createElement(StatCard, { loading: false, title: 'Total Leaves', value: report.total, icon: 'FileText', iconColor: 'text-blue-600', subtitle: 'Overall requests' }),
                React.createElement(StatCard, { loading: false, title: 'Approved', value: report.approved, icon: 'CheckCircle', iconColor: 'text-green-600', subtitle: `${report.approvalRateForPerson}% approval` }),
                React.createElement(StatCard, { loading: false, title: 'Pending', value: report.pending, icon: 'Clock', iconColor: 'text-amber-600', subtitle: 'Awaiting decision' }),
                React.createElement(StatCard, { loading: false, title: 'Rejected', value: report.rejected, icon: 'XCircle', iconColor: 'text-red-600', subtitle: 'Declined requests' }),
                React.createElement(StatCard, { loading: false, title: 'Avg Duration', value: `${report.averageDuration}d`, icon: 'Calendar', iconColor: 'text-indigo-600', subtitle: 'Average leave length' }),
                React.createElement(StatCard, { loading: false, title: 'Avg AI Score', value: `${report.averagePrediction}%`, icon: 'Sparkles', iconColor: 'text-purple-600', subtitle: `High-risk: ${report.highRisk}` }),
              ),
              React.createElement(Card, { className: 'p-4' },
                React.createElement('h3', { className: 'text-sm font-semibold mb-3' }, 'Recent Leave Records (max 10)'),
                report.recentLeaves.length === 0
                  ? React.createElement(EmptyState, { icon: 'ClipboardList', title: 'No leave records', message: 'This person has not submitted leave requests yet.' })
                  : React.createElement('div', { className: 'space-y-2' },
                      report.recentLeaves.map((l) =>
                        React.createElement(Card, { key: l.leaveId, className: 'p-3 border border-slate-100' },
                          React.createElement('div', { className: 'flex items-center justify-between gap-3' },
                            React.createElement('div', null,
                              React.createElement('p', { className: 'text-sm font-medium' }, `${l.leaveType} · ${l.duration} day(s)`),
                              React.createElement('p', { className: 'text-xs text-slate-500 mt-0.5' }, `Status: ${l.status} · Risk: ${l.riskLevel} · New Attendance: ${l.newAttendance}%`)
                            ),
                            React.createElement('span', { className: 'text-xs text-slate-400' }, `${Math.round((Number(l.predictionScore) || 0) * 100)}% AI`)
                          )
                        )
                      )
                    )
              )
            )
          )
      : tab === 'users'
        ? React.createElement(Card, { className: 'p-4' },
            React.createElement('h3', { className: 'text-sm font-semibold mb-3' }, 'Users'),
            users.length === 0
              ? React.createElement(EmptyState, { icon: 'User', title: 'No users', message: 'No users found.' })
              : React.createElement('div', { className: 'overflow-x-auto' },
                  React.createElement('table', { className: 'w-full text-sm' },
                    React.createElement('thead', null,
                      React.createElement('tr', { className: 'text-left text-xs text-slate-500' },
                        ['Name', 'Role', 'Department', 'Login ID'].map(h => React.createElement('th', { key: h, className: 'py-2 pr-3' }, h))
                      )
                    ),
                    React.createElement('tbody', { className: 'divide-y' },
                      users.map(u =>
                        React.createElement('tr', { key: u.userId },
                          React.createElement('td', { className: 'py-2 pr-3 font-medium' }, u.name),
                          React.createElement('td', { className: 'py-2 pr-3' }, u.role),
                          React.createElement('td', { className: 'py-2 pr-3' }, u.department),
                          React.createElement('td', { className: 'py-2 pr-3 font-mono text-xs text-slate-500' }, u.loginUserId || u.userId),
                        )
                      )
                    )
                  )
                )
          )
        : tab === 'leaves'
          ? React.createElement(Card, { className: 'p-4' },
              React.createElement('h3', { className: 'text-sm font-semibold mb-3' }, 'Leaves'),
              leaves.length === 0
                ? React.createElement(EmptyState, { icon: 'FileText', title: 'No leaves', message: 'No leaves found.' })
                : React.createElement('div', { className: 'space-y-3' },
                    leaves.slice(0, 20).map(l =>
                      React.createElement(Card, { key: l.leaveId, className: 'p-4 border border-slate-100' },
                        React.createElement('div', { className: 'flex items-center justify-between gap-4' },
                          React.createElement('div', null,
                            React.createElement('p', { className: 'font-semibold' }, `${l.leaveType} · ${l.duration} day(s)`),
                            React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `Status: ${l.status} · Risk: ${l.riskLevel} · New Attendance: ${l.newAttendance}%`)
                          ),
                          React.createElement(AIPredictionCard, { compact: true, probability: Math.round((l.predictionScore || 0) * 100), explanation: l.decision })
                        )
                      )
                    )
                  )
            )
          : tab === 'pending'
            ? React.createElement(Card, { className: 'p-4' },
                React.createElement('h3', { className: 'text-sm font-semibold mb-3' }, 'Pending Faculty Leave Requests'),
                pending.length === 0
                  ? React.createElement(EmptyState, { icon: 'ClipboardList', title: 'No pending requests', message: 'No faculty leave requests are awaiting approval.' })
                  : React.createElement('div', { className: 'space-y-3' },
                      pending.map(l =>
                        React.createElement(Card, { key: l.leaveId, className: 'p-4 border border-slate-100' },
                          React.createElement('div', { className: 'flex flex-col md:flex-row md:items-center md:justify-between gap-3' },
                            React.createElement('div', null,
                              React.createElement('p', { className: 'font-semibold' }, `${l.leaveType} · ${l.duration} day(s)`),
                              React.createElement('p', { className: 'text-xs text-slate-500 mt-1' }, `Faculty: ${l.facultyName || 'Unknown'} · Attendance: ${l.attendance}% · Risk: ${l.riskLevel}`)
                            ),
                            React.createElement('div', { className: 'flex items-center gap-2' },
                              React.createElement(Button, { variant: 'success', onClick: () => handleAdminDecision(l.leaveId, 'approved') }, 'Approve'),
                              React.createElement(Button, { variant: 'danger', onClick: () => handleAdminDecision(l.leaveId, 'rejected') }, 'Reject')
                            )
                          )
                        )
                      )
                    )
              )
          : React.createElement(Card, { className: 'p-4' },
              React.createElement('p', { className: 'text-sm text-slate-600' }, 'Use the tabs above to view users and leaves.')
            )
  );
}

function AdminApprovalPage() {
  return React.createElement(AdminDashboardPage, {
    loading: false,
    data: { analytics: {} },
    initialTab: 'pending',
  });
}

// ============================================================
// APPLY LEAVE PAGE
// ============================================================
function ApplyLeavePage({ onNavigate }) {
  const [form, setForm] = useState({ attendance: 85, leaveType: '', duration: 1, reason: '', facultyName: '' });
  const [facultyOptions, setFacultyOptions] = useState(DEFAULT_FACULTY_OPTIONS);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const session = window.AuthService.getSession();

  useEffect(() => {
    const loadFacultyOptions = async () => {
      try {
        const facultyUsers = await window.AuthService.getFacultyUsers();
        if (Array.isArray(facultyUsers) && facultyUsers.length > 0) {
          const names = facultyUsers
            .map((f) => String(f.name || "").trim())
            .filter(Boolean);
          if (names.length > 0) {
            setFacultyOptions(names);
          }
        }
      } catch (e) {
        // keep default options if backend is unavailable
      }
    };
    loadFacultyOptions();
  }, []);

  const updatePrediction = useCallback(async (updatedForm) => {
    if (!updatedForm.leaveType || !updatedForm.reason || updatedForm.reason.length < 10) return;
    setPredLoading(true);
    try {
      const result = await window.PredictionService.getPreview({
        attendance: updatedForm.attendance,
        leaveType: updatedForm.leaveType,
        duration: updatedForm.duration,
      });
      setPrediction(result);
    } catch {
      // Silently fail for prediction
    } finally {
      setPredLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (form.leaveType && form.reason.length >= 10) updatePrediction(form); }, 600);
    return () => clearTimeout(timer);
  }, [form.leaveType, form.reason, form.attendance, form.duration]);

  const validate = () => {
    const e = {};
    if (session?.role !== 'student') e.role = 'Only students can apply leave.';
    if (form.attendance === undefined || form.attendance === null) e.attendance = 'Attendance is required.';
    if (!form.leaveType) e.leaveType = 'Please select a leave type.';
    if (!form.duration || Number(form.duration) < 1) e.duration = 'Duration must be at least 1.';
    if (!form.facultyName) e.facultyName = 'Please choose the faculty to send this request to.';
    if (!form.reason.trim()) e.reason = 'Please provide a reason for leave.';
    else if (form.reason.trim().length < 20) e.reason = 'Please provide a more detailed reason (at least 20 characters).';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await window.LeaveService.submitLeaveApplication({
        attendance: Number(form.attendance),
        leaveType: form.leaveType,
        duration: Number(form.duration),
        reason: form.reason,
        facultyName: form.facultyName,
      });
      setSubmitted(true);
      addToast('Leave application submitted successfully! You\'ll be notified of updates.', 'success', 5000);
      setTimeout(() => onNavigate('history'), 2500);
    } catch (err) {
      addToast(err.message || 'Failed to submit application. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  if (submitted) {
    return React.createElement('div', { className: 'p-6 flex items-center justify-center min-h-96' },
      React.createElement('div', { className: 'text-center page-enter' },
        React.createElement('div', { className: 'w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4' },
          React.createElement(Icon, { name: 'CheckCircle', size: 36, className: 'text-green-500' })
        ),
        React.createElement('h3', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100 mb-2' }, 'Application Submitted!'),
        React.createElement('p', { className: 'text-slate-500 dark:text-slate-400 text-sm mb-4' }, 'Redirecting to leave history...'),
        React.createElement(Spinner, { size: 'md', className: 'mx-auto' })
      )
    );
  }

  return React.createElement('div', { className: 'p-4 sm:p-6 page-enter' },
    React.createElement('div', { className: 'mb-6' },
      React.createElement('h2', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100 mb-1' }, 'Apply for Leave'),
      React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400' }, 'Fill in the details below to submit your leave request.')
    ),

    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-5' },

      // Main Form
      React.createElement('div', { className: 'lg:col-span-2' },
        React.createElement('form', { onSubmit: handleSubmit, noValidate: true, className: 'space-y-5' },

          // Leave Details
          React.createElement(Card, { className: 'p-5' },
            React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2' },
              React.createElement(Icon, { name: 'Calendar', size: 16, className: 'text-teal-500' }),
              'Leave Details'
            ),
            React.createElement('div', { className: 'space-y-4' },
              React.createElement(InputField, {
                label: 'Current Attendance (%)',
                id: 'attendance',
                type: 'number',
                value: form.attendance,
                min: 0,
                max: 100,
                onChange: e => handleChange('attendance', e.target.value),
                error: errors.attendance,
                required: true,
              }),
              React.createElement(SelectField, {
                label: 'Leave Type',
                id: 'leave-type',
                value: form.leaveType,
                onChange: e => handleChange('leaveType', e.target.value),
                error: errors.leaveType,
                required: true,
              },
                React.createElement('option', { value: '' }, '— Select leave type —'),
                ['medical', 'personal', 'emergency'].map(t =>
                  React.createElement('option', { key: t, value: t }, t)
                )
              ),
              React.createElement(InputField, {
                label: 'Duration (days)',
                id: 'duration',
                type: 'number',
                value: form.duration,
                min: 1,
                max: 7,
                onChange: e => handleChange('duration', e.target.value),
                error: errors.duration,
                required: true,
              }),
              React.createElement(SelectField, {
                label: 'Send To Faculty',
                id: 'faculty-name',
                value: form.facultyName,
                onChange: e => handleChange('facultyName', e.target.value),
                error: errors.facultyName,
                required: true,
              },
                React.createElement('option', { value: '' }, '— Select faculty —'),
                facultyOptions.map(name =>
                  React.createElement('option', { key: name, value: name }, name)
                )
              ),
              React.createElement(TextareaField, {
                label: 'Reason for Leave',
                id: 'reason',
                value: form.reason,
                rows: 4,
                placeholder: 'Explain your reason in detail. Include any supporting context such as medical condition, family urgency, etc.',
                onChange: e => handleChange('reason', e.target.value),
                error: errors.reason,
                required: true,
                helperText: `${form.reason.length} characters${form.reason.length < 20 ? ' (min 20)' : ''}`,
              })
            )
          ),

          // Submit
          React.createElement('div', { className: 'flex flex-col sm:flex-row gap-3 sticky bottom-4 sm:static' },
            React.createElement(Button, { variant: 'secondary', type: 'button', onClick: () => onNavigate('dashboard'), className: 'sm:w-auto' },
              React.createElement(Icon, { name: 'ChevronLeft', size: 16 }),
              'Cancel'
            ),
            React.createElement(Button, { variant: 'primary', type: 'submit', loading, className: 'flex-1 sm:flex-none sm:min-w-40' },
              loading ? null : React.createElement(Icon, { name: 'Send', size: 16 }),
              loading ? null : 'Submit Application'
            )
          )
        )
      ),

      // AI Prediction Sidebar
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', { className: 'sticky top-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2' },
            React.createElement(Icon, { name: 'Sparkles', size: 16, className: 'text-purple-500' }),
            'AI Prediction Preview'
          ),
          predLoading
            ? React.createElement(Card, { className: 'p-5' },
                React.createElement('div', { className: 'flex items-center gap-3 text-slate-500 dark:text-slate-400' },
                  React.createElement(Spinner, { size: 'sm' }),
                  React.createElement('span', { className: 'text-sm' }, 'Analyzing...')
                )
              )
            : prediction
              ? React.createElement(React.Fragment, null,
                  React.createElement(AIPredictionCard, { probability: prediction.probability, explanation: prediction.explanation }),
                  React.createElement(Card, { className: 'mt-3 p-4' },
                    React.createElement('p', { className: 'text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2.5' }, 'Prediction Factors'),
                    React.createElement('div', { className: 'space-y-2' },
                      (prediction.factors || []).map((f, i) =>
                        React.createElement('div', { key: i, className: 'flex items-center justify-between text-xs' },
                          React.createElement('span', { className: 'text-slate-600 dark:text-slate-400' }, f.label),
                          React.createElement('span', { className: cn('font-medium flex items-center gap-1', f.impact === 'positive' ? 'text-green-600 dark:text-green-400' : f.impact === 'negative' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400') },
                            f.impact === 'positive' ? React.createElement(Icon, { name: 'TrendingUp', size: 11 }) : f.impact === 'negative' ? React.createElement(Icon, { name: 'TrendingDown', size: 11 }) : null,
                            f.value
                          )
                        )
                      )
                    )
                  )
                )
              : React.createElement(Card, { className: 'p-5 text-center' },
                  React.createElement(Icon, { name: 'Sparkles', size: 24, className: 'text-slate-300 dark:text-slate-600 mx-auto mb-2' }),
                  React.createElement('p', { className: 'text-sm text-slate-400 dark:text-slate-500 leading-relaxed' }, 'Fill in the leave type and reason to see AI prediction.')
                ),

          // Info card
          React.createElement(Card, { className: 'mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' },
            React.createElement('div', { className: 'flex gap-2.5' },
              React.createElement(Icon, { name: 'Info', size: 16, className: 'text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0' }),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-xs font-medium text-teal-700 dark:text-teal-300 mb-1' }, 'Before you submit'),
                React.createElement('ul', { className: 'text-xs text-teal-600 dark:text-teal-400 space-y-1 list-disc list-inside' },
                  [
                    'Ensure all details are accurate.',
                    `This request will be sent to: ${form.facultyName || 'selected faculty member'}.`,
                    'You\'ll be notified via email & app.'
                  ].map(t =>
                    React.createElement('li', { key: t }, t)
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}

// ============================================================
// LEAVE HISTORY PAGE
// ============================================================
function LeaveHistoryPage({ onNavigate }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: 'all', leaveType: 'all', search: '' });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const { addToast } = useToast();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = window.AuthService.getSession();
      if (session?.role !== 'student') {
        setLeaves([]);
        return;
      }
      const result = await window.LeaveService.getStudentLeaves();
      // client-side filtering for demo
      let items = [...result];
      if (filters.status !== 'all') items = items.filter((l) => l.status === filters.status);
      if (filters.leaveType !== 'all') items = items.filter((l) => l.leaveType === filters.leaveType);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter((l) => String(l.reason || '').toLowerCase().includes(q) || String(l.leaveType || '').toLowerCase().includes(q));
      }
      setLeaves(items.map((l) => ({
        id: l.leaveId,
        type: l.leaveType,
        typeKey: l.leaveType,
        facultyName: l.facultyName || '',
        startDate: l.createdAt || new Date().toISOString(),
        endDate: l.createdAt || new Date().toISOString(),
        days: l.duration,
        status: l.status,
        reason: l.reason || '',
        aiPrediction: Math.round((l.predictionScore || 0) * 100),
        aiExplanation: l.reason || '',
        facultyRemark: null,
        appliedDate: l.createdAt || new Date().toISOString(),
      })));
    } catch (err) {
      setError(err.message || 'Failed to load leave history.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const stats = useMemo(() => {
    const all = leaves;
    return {
      total: all.length,
      approved: all.filter(l => l.status === 'approved').length,
      pending: all.filter(l => l.status === 'pending').length,
      rejected: all.filter(l => l.status === 'rejected').length,
    };
  }, [leaves]);

  return React.createElement('div', { className: 'p-4 sm:p-6 space-y-5 page-enter' },
    // Header
    React.createElement('div', { className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100' }, 'Leave History'),
        React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 mt-0.5' }, 'All your leave requests and their current status.')
      ),
      React.createElement(Button, { variant: 'primary', onClick: () => onNavigate('apply') },
        React.createElement(Icon, { name: 'Plus', size: 16 }),
        'New Application'
      )
    ),

    // Mini stats
    React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-4 gap-3' },
      [
        { label: 'Total', value: stats.total, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
        { label: 'Approved', value: stats.approved, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Pending', value: stats.pending, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Rejected', value: stats.rejected, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
      ].map(s =>
        React.createElement('div', { key: s.label, className: cn('rounded-xl p-3 text-center', s.bg) },
          React.createElement('p', { className: cn('text-2xl font-bold', s.color) }, s.value),
          React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, s.label)
        )
      )
    ),

    // Filters
    React.createElement(Card, { className: 'p-4' },
      React.createElement('div', { className: 'flex flex-col sm:flex-row gap-3 items-stretch sm:items-center' },
        React.createElement('div', { className: 'relative flex-1' },
          React.createElement('div', { className: 'absolute left-3 top-1/2 -translate-y-1/2' },
            React.createElement(Icon, { name: 'Search', size: 16, className: 'text-slate-400' })
          ),
          React.createElement('input', {
            type: 'search',
            placeholder: 'Search by reason, type, or ID...',
            value: filters.search,
            onChange: e => setFilters(p => ({ ...p, search: e.target.value })),
            className: 'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 smooth-transition focus:border-teal-400',
            'aria-label': 'Search leave history',
          })
        ),
        React.createElement('div', { className: 'relative' },
          React.createElement('select', {
            value: filters.status,
            onChange: e => setFilters(p => ({ ...p, status: e.target.value })),
            className: 'pl-3.5 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 smooth-transition focus:border-teal-400 cursor-pointer w-full sm:w-auto',
            'aria-label': 'Filter by status',
          },
            React.createElement('option', { value: 'all' }, 'All Status'),
            React.createElement('option', { value: 'approved' }, 'Approved'),
            React.createElement('option', { value: 'pending' }, 'Pending'),
            React.createElement('option', { value: 'rejected' }, 'Rejected')
          ),
          React.createElement('div', { className: 'absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none' },
            React.createElement(Icon, { name: 'ChevronDown', size: 14, className: 'text-slate-400' })
          )
        ),
        React.createElement('div', { className: 'relative' },
          React.createElement('select', {
            value: filters.type,
            onChange: e => setFilters(p => ({ ...p, leaveType: e.target.value })),
            className: 'pl-3.5 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 smooth-transition focus:border-teal-400 cursor-pointer w-full sm:w-auto',
            'aria-label': 'Filter by type',
          },
            React.createElement('option', { value: 'all' }, 'All Types'),
            ['medical', 'personal', 'emergency'].map(t =>
              React.createElement('option', { key: t, value: t }, t)
            )
          ),
          React.createElement('div', { className: 'absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none' },
            React.createElement(Icon, { name: 'ChevronDown', size: 14, className: 'text-slate-400' })
          )
        ),
        // View toggle
        React.createElement('div', { className: 'flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0' },
          React.createElement('button', {
            onClick: () => setViewMode('cards'),
            className: cn('p-2.5 smooth-transition', viewMode === 'cards' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'),
            'aria-label': 'Card view', 'aria-pressed': viewMode === 'cards',
          }, React.createElement(Icon, { name: 'LayoutGrid', size: 16 })),
          React.createElement('button', {
            onClick: () => setViewMode('table'),
            className: cn('p-2.5 smooth-transition', viewMode === 'table' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'),
            'aria-label': 'Table view', 'aria-pressed': viewMode === 'table',
          }, React.createElement(Icon, { name: 'List', size: 16 }))
        )
      )
    ),

    // Results
    error
      ? React.createElement(ErrorState, { message: error, onRetry: loadHistory })
      : loading
        ? React.createElement(SkeletonTable)
        : leaves.length === 0
          ? React.createElement(EmptyState, {
              icon: 'ClipboardList',
              title: 'No leave records found',
              message: filters.search || filters.status !== 'all' || filters.type !== 'all'
                ? 'Try adjusting your filters.'
                : 'You haven\'t applied for any leaves yet.',
              actionLabel: 'Apply Leave',
              onAction: () => onNavigate('apply'),
            })
          : viewMode === 'cards'
            ? React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
                leaves.map(leave =>
                  React.createElement(LeaveCard, { key: leave.id, leave, onViewDetails: setSelectedLeave })
                )
              )
            : React.createElement('div', { className: 'overflow-x-auto' },
                React.createElement(Card, { className: 'overflow-hidden' },
                  React.createElement('table', { className: 'w-full text-sm', role: 'table', 'aria-label': 'Leave history table' },
                    React.createElement('thead', null,
                      React.createElement('tr', { className: 'bg-slate-50 dark:bg-slate-700/50 text-left' },
                        ['ID', 'Type', 'Period', 'Days', 'Status', 'AI Pred.', 'Applied On'].map(h =>
                          React.createElement('th', { key: h, className: 'px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap' }, h)
                        )
                      )
                    ),
                    React.createElement('tbody', { className: 'divide-y divide-slate-100 dark:divide-slate-700' },
                      leaves.map(leave =>
                        React.createElement('tr', {
                          key: leave.id,
                          onClick: () => setSelectedLeave(leave),
                          className: 'hover:bg-slate-50 dark:hover:bg-slate-700/30 smooth-transition cursor-pointer',
                        },
                          React.createElement('td', { className: 'px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs' }, leave.id),
                          React.createElement('td', { className: 'px-4 py-3' },
                            React.createElement('div', null,
                              React.createElement('p', { className: 'font-medium text-slate-700 dark:text-slate-300' }, leave.type),
                              React.createElement('p', { className: 'text-xs text-slate-400 line-clamp-1 max-w-xs' }, leave.reason)
                            )
                          ),
                          React.createElement('td', { className: 'px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap' },
                            `${formatDate(leave.startDate)} – ${formatDate(leave.endDate)}`
                          ),
                          React.createElement('td', { className: 'px-4 py-3 text-slate-700 dark:text-slate-300 font-medium' }, `${leave.days}d`),
                          React.createElement('td', { className: 'px-4 py-3' }, React.createElement(StatusBadge, { status: leave.status })),
                          React.createElement('td', { className: 'px-4 py-3' },
                            React.createElement('span', { className: 'text-xs font-medium text-purple-600 dark:text-purple-400' }, `${leave.aiPrediction}%`)
                          ),
                          React.createElement('td', { className: 'px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap' }, formatDate(leave.appliedDate))
                        )
                      )
                    )
                  )
                )
              ),

    // Modal
    React.createElement(LeaveDetailModal, { leave: selectedLeave, onClose: () => setSelectedLeave(null) })
  );
}

// ============================================================
// NOTIFICATIONS PAGE
// ============================================================
function NotificationsPage({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const { addToast } = useToast();
  const previousCountRef = useRef(0);

  const loadNotifications = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
      setError('');
    }
    try {
      const result = await window.NotificationService.getNotifications();
      setNotifications(result);
      if (!showLoader && result.length > previousCountRef.current) {
        addToast('New notification received', 'info', 2500);
      }
      previousCountRef.current = result.length;
    } catch (err) {
      if (showLoader) setError(err.message || 'Failed to load notifications.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAllRead = async () => {
    await window.NotificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All notifications marked as read.', 'success');
  };

  const markRead = useCallback(async (id) => {
    await window.NotificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'read') return notifications.filter(n => n.read);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const session = window.AuthService.getSession();
  const isAdmin = String(session?.role || '').toLowerCase() === 'admin';

  return React.createElement('div', { className: 'p-4 sm:p-6 page-enter' },
    React.createElement('div', { className: 'flex items-center justify-between mb-5' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2' },
          'Notifications',
          unreadCount > 0 && React.createElement('span', { className: 'inline-flex items-center justify-center w-6 h-6 bg-teal-500 text-white text-xs font-bold rounded-full notif-pulse' }, unreadCount)
        ),
        React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 mt-0.5' },
          unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'
        )
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        isAdmin && React.createElement(Button, {
          variant: 'secondary',
          size: 'sm',
          onClick: () => onNavigate && onNavigate('admin-approvals'),
        },
          React.createElement(Icon, { name: 'ClipboardCheck', size: 14 }),
          'Go to Approvals'
        ),
        unreadCount > 0 && React.createElement(Button, { variant: 'ghost', size: 'sm', onClick: markAllRead },
          React.createElement(Icon, { name: 'CheckCheck', size: 14 }),
          'Mark all read'
        )
      )
    ),

    // Filter tabs
    React.createElement('div', { className: 'flex gap-2 mb-4' },
      ['all', 'unread', 'read'].map(f =>
        React.createElement('button', {
          key: f,
          onClick: () => setFilter(f),
          className: cn(
            'px-3.5 py-1.5 rounded-lg text-sm font-medium smooth-transition capitalize',
            filter === f
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          ),
        }, f, f === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : '')
      )
    ),

    React.createElement('div', { className: 'mb-4 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl' },
      React.createElement('div', { className: 'w-2 h-2 bg-green-500 rounded-full flex-shrink-0' }),
      React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400' },
        React.createElement('span', { className: 'font-medium text-slate-600 dark:text-slate-300' }, 'MongoDB Notifications: '),
        'Notifications are loaded from backend APIs.'
      )
    ),

    error
      ? React.createElement(ErrorState, { message: error, onRetry: loadNotifications })
      : loading
        ? React.createElement('div', { className: 'space-y-2' },
            [1, 2, 3, 4, 5].map(i =>
              React.createElement('div', { key: i, className: 'bg-white dark:bg-slate-800 rounded-xl p-3 flex gap-3 border border-slate-100 dark:border-slate-700' },
                React.createElement('div', { className: 'shimmer-bg w-8 h-8 rounded-lg flex-shrink-0' }),
                React.createElement('div', { className: 'flex-1 space-y-2' },
                  React.createElement(SkeletonLine, { className: 'h-3 w-36' }),
                  React.createElement(SkeletonLine, { className: 'h-3' })
                )
              )
            )
          )
        : filtered.length === 0
          ? React.createElement(EmptyState, {
              icon: 'BellOff',
              title: filter === 'unread' ? 'No unread notifications' : 'No notifications',
              message: filter === 'unread' ? 'You\'re all caught up!' : 'Leave activity notifications will appear here.',
            })
          : React.createElement(Card, { className: 'p-1 divide-y divide-slate-100 dark:divide-slate-700' },
              filtered.map(notif =>
                React.createElement(NotificationItem, { key: notif.id, notif, onMarkRead: markRead })
              )
            )
  );
}

// ============================================================
// PROFILE & SETTINGS PAGE
// ============================================================
function ProfilePage({ onToggleDark, isDark }) {
  const session = window.AuthService.getSession() || {};
  const [profile, setProfile] = useState({
    userId: session.userId || '',
    loginUserId: session.loginUserId || session.userId || '',
    name: session.name || 'User',
    role: session.role || 'student',
    department: session.department || 'N/A',
    createdAt: null,
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, approvalRate: 0 });
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pref, setPref] = useState(() => {
    const push = localStorage.getItem('autoleave_push_notif');
    const email = localStorage.getItem('autoleave_email_notif');
    return {
      push: push !== 'false',
      email: email !== 'false',
    };
  });
  const { addToast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const me = await window.AuthService.getMyProfile();
        setProfile((p) => ({
          ...p,
          userId: me.userId || p.userId,
          loginUserId: me.loginUserId || me.userId || p.loginUserId,
          name: me.name || p.name,
          role: me.role || p.role,
          department: me.department || p.department,
          createdAt: me.createdAt || p.createdAt,
        }));
      } catch {
        // Fall back to session if backend is temporarily unavailable.
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadRoleStats = async () => {
      try {
        const role = String(profile.role || '').toLowerCase();
        if (role === 'student') {
          const leaves = await window.LeaveService.getStudentLeaves();
          const total = leaves.length;
          const approved = leaves.filter((l) => l.status === 'approved').length;
          const pending = leaves.filter((l) => l.status === 'pending').length;
          const rejected = leaves.filter((l) => l.status === 'rejected').length;
          const approvalRate = total === 0 ? 0 : Number(((approved / total) * 100).toFixed(2));
          setStats({ total, approved, pending, rejected, approvalRate });
          return;
        }
        if (role === 'faculty') {
          const summary = await window.LeaveService.getFacultyOwnLeaveSummary();
          const total = Number(summary?.total) || 0;
          const approved = Number(summary?.approved) || 0;
          const pending = Number(summary?.pending) || 0;
          const rejected = Number(summary?.rejected) || 0;
          const approvalRate = total === 0 ? 0 : Number(((approved / total) * 100).toFixed(2));
          setStats({ total, approved, pending, rejected, approvalRate });
          return;
        }
        const adminDashboard = await window.DashboardService.getAdminDashboard();
        const approvalRate = Number(adminDashboard?.analytics?.approvalRate) || 0;
        const pending = Number(adminDashboard?.analytics?.pendingFacultyRequests) || 0;
        setStats({
          total: Number(adminDashboard?.analytics?.totalLeaves) || 0,
          approved: 0,
          pending,
          rejected: 0,
          approvalRate,
        });
      } catch {
        // Keep default zeros.
      }
    };
    loadRoleStats();
  }, [profile.role]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await window.SystemService.getHealth();
        setBackendStatus(health?.status === 'OK' ? 'Connected' : 'Degraded');
      } catch {
        setBackendStatus('Disconnected');
      }
    };
    checkBackend();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    localStorage.setItem('autoleave_push_notif', String(pref.push));
    localStorage.setItem('autoleave_email_notif', String(pref.email));
    setSaving(false);
    setSaved(true);
    addToast('Profile preferences saved successfully.', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return React.createElement('div', { className: 'p-4 sm:p-6 page-enter space-y-5' },
    // Profile Header
    React.createElement(Card, { className: 'p-5 sm:p-6' },
      React.createElement('div', { className: 'flex flex-col sm:flex-row sm:items-center gap-5' },
        React.createElement('div', { className: 'relative flex-shrink-0' },
          React.createElement('div', {
            className: 'w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg bg-blue-600',
          }, String(profile.name || 'U').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()),
          React.createElement('div', { className: 'absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-800', 'aria-label': 'Online status' })
        ),
        React.createElement('div', { className: 'flex-1' },
          React.createElement('h2', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100' }, profileLoading ? 'Loading profile...' : profile.name),
          React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 mt-0.5' }, `${String(profile.role || '').toUpperCase()} · ${profile.department || 'N/A'}`),
          React.createElement('div', { className: 'flex flex-wrap gap-2 mt-2' },
            [
              `Login ID: ${profile.loginUserId || profile.userId || 'N/A'}`,
              `Joined: ${profile.createdAt ? formatDate(profile.createdAt) : 'N/A'}`,
              `Approval Rate: ${stats.approvalRate}%`,
            ].map(tag =>
              React.createElement('span', { key: tag, className: 'text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full border border-teal-200 dark:border-teal-800' }, tag)
            )
          )
        )
      )
    ),

    // Dynamic Details
    React.createElement(Card, { className: 'p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2' },
        React.createElement(Icon, { name: 'User', size: 16, className: 'text-teal-500' }),
        'Dynamic User Details'
      ),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
        [
          ['Login ID', profile.loginUserId || profile.userId || 'N/A'],
          ['Role', String(profile.role || 'N/A').toUpperCase()],
          ['Department', profile.department || 'N/A'],
          ['Joined', profile.createdAt ? formatDate(profile.createdAt) : 'N/A'],
          ['Total Leaves', stats.total],
          ['Approved', stats.approved],
          ['Pending', stats.pending],
          ['Rejected', stats.rejected],
          ['Approval Rate', `${stats.approvalRate}%`],
          ['Backend Status', backendStatus],
        ].map(([k, v]) =>
          React.createElement('div', { key: k, className: 'bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3' },
            React.createElement('p', { className: 'text-xs text-slate-400 dark:text-slate-500 mb-0.5' }, k),
            React.createElement('p', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300 break-all' }, v)
          )
        )
      )
    ),

    // Preferences
    React.createElement(Card, { className: 'p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2' },
        React.createElement(Icon, { name: 'Settings', size: 16, className: 'text-teal-500' }),
        'Preferences & Settings'
      ),
      React.createElement('div', { className: 'space-y-3' },
        [
          {
            icon: isDark ? 'Moon' : 'Sun',
            label: 'Dark Mode',
            desc: 'Toggle dark/light theme',
            control: React.createElement('button', {
              onClick: onToggleDark,
              className: cn('relative w-12 h-6 rounded-full smooth-transition flex-shrink-0', isDark ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'),
              role: 'switch',
              'aria-checked': isDark,
              'aria-label': 'Toggle dark mode',
            },
              React.createElement('span', { className: cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow smooth-transition', isDark ? 'left-6' : 'left-0.5') })
            )
          },
          {
            icon: 'Bell',
            label: 'Push Notifications',
            desc: 'Get notified on leave status changes',
            control: React.createElement('button', {
              onClick: () => setPref((p) => ({ ...p, push: !p.push })),
              className: cn('relative w-12 h-6 rounded-full smooth-transition flex-shrink-0', pref.push ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'),
              role: 'switch',
              'aria-checked': pref.push,
              'aria-label': 'Toggle push notifications',
            },
              React.createElement('span', { className: cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow smooth-transition', pref.push ? 'left-6' : 'left-0.5') })
            )
          },
          {
            icon: 'Mail',
            label: 'Email Notifications',
            desc: 'Receive leave updates via email',
            control: React.createElement('button', {
              onClick: () => setPref((p) => ({ ...p, email: !p.email })),
              className: cn('relative w-12 h-6 rounded-full smooth-transition flex-shrink-0', pref.email ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'),
              role: 'switch',
              'aria-checked': pref.email,
              'aria-label': 'Toggle email notifications',
            },
              React.createElement('span', { className: cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow smooth-transition', pref.email ? 'left-6' : 'left-0.5') })
            )
          },
        ].map(setting =>
          React.createElement('div', { key: setting.label, className: 'flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 smooth-transition' },
            React.createElement('div', { className: 'flex items-center gap-3' },
              React.createElement('div', { className: 'w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0' },
                React.createElement(Icon, { name: setting.icon, size: 16, className: 'text-slate-600 dark:text-slate-400' })
              ),
              React.createElement('div', null,
                React.createElement('p', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, setting.label),
                React.createElement('p', { className: 'text-xs text-slate-400 dark:text-slate-500' }, setting.desc)
              )
            ),
            setting.control
          )
        )
      )
    ),

    // Backend Status
    React.createElement(Card, { className: 'p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900' },
      React.createElement('h3', { className: 'text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2' },
        React.createElement(Icon, { name: 'Zap', size: 16 }),
        'Backend Integration Status'
      ),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3' },
        [
          { label: 'Authentication', status: profile.userId ? 'Connected' : 'Disconnected', icon: 'Shield' },
          { label: 'MongoDB', status: backendStatus, icon: 'Database' },
          { label: 'Notifications API', status: backendStatus === 'Connected' ? 'Connected' : 'Unavailable', icon: 'Bell' },
        ].map(s =>
          React.createElement('div', { key: s.label, className: 'flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl' },
            React.createElement(Icon, { name: s.icon, size: 16, className: 'text-blue-500 flex-shrink-0' }),
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs font-medium text-slate-700 dark:text-slate-300' }, s.label),
              React.createElement('p', { className: cn('text-[10px]', s.status === 'Connected' ? 'text-green-600' : s.status === 'Checking...' ? 'text-amber-600' : 'text-red-600') }, s.status)
            )
          )
        )
      )
    ),

    // Actions
    React.createElement('div', { className: 'flex flex-col sm:flex-row gap-3' },
      React.createElement(Button, { variant: 'primary', onClick: handleSave, loading: saving, className: 'flex-1' },
        saved ? React.createElement(Icon, { name: 'Check', size: 16 }) : React.createElement(Icon, { name: 'Save', size: 16 }),
        saved ? 'Saved!' : 'Save Preferences'
      ),
      React.createElement(Button, {
        variant: 'danger',
        onClick: () => window.dispatchEvent(new CustomEvent('autoleave:logout')),
        className: 'sm:w-auto',
      },
        React.createElement(Icon, { name: 'LogOut', size: 16 }),
        'Sign Out'
      )
    )
  );
}

console.log('[AutoLeave AI] Pages loaded.');
