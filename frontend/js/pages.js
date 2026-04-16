// ============================================================
// AutoLeave AI – All Page Components
// ============================================================

const { useState, useEffect, useCallback, useMemo } = React;

// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    // Focus email input after mount
    setTimeout(() => {
      const el = document.getElementById('email');
      if (el) el.focus();
    }, 200);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email or Register Number is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && !/^[A-Z0-9]{5,15}$/i.test(form.email.trim())) {
      e.email = 'Enter a valid email or register number.';
    }
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 4) e.password = 'Password must be at least 4 characters.';
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
      const result = await window.AuthService.login(form.email, form.password);
      localStorage.setItem('autoleave_user', JSON.stringify(result.student));
      onLogin(result.student);
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    setForm({ email: 'arjun.mehta@college.edu', password: 'demo1234' });
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
          React.createElement('p', { className: 'text-slate-500 dark:text-slate-400 text-sm' }, 'Sign in to continue to your leave management workspace.')
        ),

        apiError && React.createElement('div', { className: 'mb-4' },
          React.createElement(AlertBanner, { type: 'error', message: apiError, onClose: () => setApiError('') })
        ),

        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4 pro-surface rounded-2xl p-5', noValidate: true },
          React.createElement(InputField, {
            label: 'Email / Register Number',
            id: 'email',
            type: 'text',
            placeholder: 'arjun.mehta@college.edu',
            value: form.email,
            onChange: e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); },
            error: errors.email,
            required: true,
            autoComplete: 'username',
          }),

          React.createElement('div', { className: 'flex flex-col gap-1.5' },
            React.createElement('label', { htmlFor: 'password', className: 'text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1' },
              'Password',
              React.createElement('span', { className: 'text-red-500 text-xs' }, '*')
            ),
            React.createElement('div', { className: 'relative' },
              React.createElement('input', {
                id: 'password',
                type: showPass ? 'text' : 'password',
                placeholder: '••••••••',
                value: form.password,
                onChange: e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); },
                autoComplete: 'current-password',
                required: true,
                'aria-invalid': !!errors.password,
                className: cn(
                  'w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 smooth-transition focus:border-teal-400',
                  errors.password ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ),
              }),
              React.createElement('button', {
                type: 'button',
                onClick: () => setShowPass(p => !p),
                className: 'absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 smooth-transition',
                'aria-label': showPass ? 'Hide password' : 'Show password',
              },
                React.createElement(Icon, { name: showPass ? 'EyeOff' : 'Eye', size: 16 })
              )
            ),
            errors.password && React.createElement('p', { className: 'text-xs text-red-500 flex items-center gap-1', role: 'alert' },
              React.createElement(Icon, { name: 'AlertCircle', size: 12 }),
              errors.password
            )
          ),

          React.createElement('div', { className: 'flex justify-end' },
            React.createElement('button', { type: 'button', className: 'text-xs text-teal-600 dark:text-teal-400 hover:underline' }, 'Forgot password?')
          ),

          React.createElement(Button, {
            type: 'submit',
            variant: 'primary',
            size: 'lg',
            loading,
            className: 'w-full',
          }, 'Sign In'),

          React.createElement('button', {
            type: 'button',
            onClick: demoLogin,
            className: 'w-full flex items-center justify-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 smooth-transition py-2',
          },
            React.createElement(Icon, { name: 'Zap', size: 14 }),
            'Use demo credentials'
          )
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
      const result = await window.DashboardService.getStudentDashboard('STU2024001');
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    // Firebase real-time listener placeholder
    const unsub = window.FirebaseFirestore.subscribeToLeaveRequests('STU2024001', (updates) => {
      console.log('[Dashboard] Real-time update received:', updates.length, 'records');
    });
    return () => unsub();
  }, [loadDashboard]);

  if (error) return React.createElement('div', { className: 'p-6' },
    React.createElement(ErrorState, { message: error, onRetry: loadDashboard })
  );

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
                `Good morning, ${data?.student?.name?.split(' ')[0] || 'Student'}`
              ),
              React.createElement('p', { className: 'text-[13px] text-[#64748B] mt-0.5' },
                'B.Tech — CSE, 3rd Year · Sec-B · Adv. Dr. Priya Ramachandran'
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
        React.createElement(StatCard, { key: c.key, loading, title: c.title, value: loading ? '—' : (data?.stats?.[c.key] ?? 0), icon: c.icon, iconColor: c.iconColor, subtitle: c.subtitle })
      )
    ),

    // Main grid
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6' },

      // Left column - 2/3 width on large screens
      React.createElement('div', { className: 'lg:col-span-2 space-y-6' },

        // Current Leave Status Card
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-[10px] uppercase tracking-[0.1em] text-[#94A3B8] mb-2' }, 'Current Leave'),
          loading
            ? React.createElement(SkeletonCard)
            : data?.latestLeave
              ? React.createElement(Card, { className: 'p-4 sm:p-5' },
                  React.createElement('div', { className: 'flex flex-col sm:flex-row sm:items-start gap-4' },
                    React.createElement('div', { className: 'flex-1' },
                      React.createElement('div', { className: 'flex items-start justify-between gap-2 mb-3' },
                        React.createElement('div', null,
                          React.createElement('p', { className: 'text-[15px] font-semibold text-[#0F172A]' }, data.latestLeave.type),
                          React.createElement('p', { className: 'text-[13px] text-[#64748B] mt-1 flex items-center gap-1' },
                            React.createElement(Icon, { name: 'Calendar', size: 12 }),
                            `${formatDate(data.latestLeave.startDate)} – ${formatDate(data.latestLeave.endDate)}`
                          )
                        ),
                        React.createElement(StatusBadge, { status: data.latestLeave.status, size: 'lg' })
                      ),
                      React.createElement('p', { className: 'text-[13px] text-[#64748B] line-clamp-2 mb-3' }, data.latestLeave.reason),
                      React.createElement('div', { className: 'flex items-center gap-2 text-[12px] text-[#94A3B8] flex-wrap' },
                        React.createElement('span', null, `Applied ${formatDate(data.latestLeave.appliedDate)}`),
                        React.createElement('span', null, '·'),
                        React.createElement('span', null, `${data.latestLeave.days} day${data.latestLeave.days > 1 ? 's' : ''}`),
                        React.createElement('span', null, '·'),
                        React.createElement('span', null, data.latestLeave.id)
                      ),
                      data.latestLeave.facultyRemark && React.createElement('div', { className: 'mt-3 p-3 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]' },
                        React.createElement('p', { className: 'text-[12px] text-[#64748B] leading-relaxed' }, data.latestLeave.facultyRemark)
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
          percentage: data?.student?.attendance || 87,
          totalDays: data?.student?.totalWorkingDays || 120,
          presentDays: data?.student?.presentDays || 105,
        }),

        // AI Prediction Card
        React.createElement('div', null,
          React.createElement(AIPredictionCard, {
            loading,
            probability: data?.latestLeave?.aiPrediction || 82,
            explanation: data?.latestLeave?.aiExplanation || 'Based on your attendance history and leave patterns, your approval outlook is strong.',
            factors: [
              { label: 'Attendance', value: '87%', percent: 87 },
              { label: 'Leave Type', value: 'Strong', percent: 74 },
              { label: 'Duration', value: 'Moderate', percent: 58 },
              { label: 'History', value: 'Good', percent: 76 },
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
// APPLY LEAVE PAGE
// ============================================================
function ApplyLeavePage({ onNavigate }) {
  const [form, setForm] = useState({ type: '', startDate: '', endDate: '', reason: '', emergencyContact: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const student = window.MOCK_DATA.student;

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const s = new Date(form.startDate);
    const e = new Date(form.endDate);
    const diff = Math.ceil((e - s) / 86400000) + 1;
    return Math.max(0, diff);
  };

  const days = calcDays();

  const updatePrediction = useCallback(async (updatedForm) => {
    if (!updatedForm.type || !updatedForm.reason || updatedForm.reason.length < 10) return;
    setPredLoading(true);
    try {
      const result = await window.PredictionService.getPrediction({
        type: updatedForm.type,
        days: calcDays(),
        reason: updatedForm.reason,
        startDate: updatedForm.startDate,
      });
      setPrediction(result);
    } catch {
      // Silently fail for prediction
    } finally {
      setPredLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (form.type && form.reason.length >= 10) updatePrediction(form); }, 800);
    return () => clearTimeout(timer);
  }, [form.type, form.reason]);

  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Please select a leave type.';
    if (!form.startDate) e.startDate = 'Start date is required.';
    if (!form.endDate) e.endDate = 'End date is required.';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      e.endDate = 'End date cannot be before start date.';
    }
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
      const typeLabel = window.MOCK_DATA.leaveTypes.find(t => t.value === form.type)?.label || form.type;
      await window.LeaveService.submitLeaveApplication({
        ...form,
        type: typeLabel,
        typeKey: form.type,
        days,
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

  const today = new Date().toISOString().split('T')[0];

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

          // Student Info
          React.createElement(Card, { className: 'p-5' },
            React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2' },
              React.createElement(Icon, { name: 'User', size: 16, className: 'text-teal-500' }),
              'Student Information'
            ),
            React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
              React.createElement(InputField, { label: 'Full Name', id: 'student-name', value: student.name, readOnly: true, className: 'opacity-80' }),
              React.createElement(InputField, { label: 'Register Number', id: 'reg-num', value: student.registerNumber, readOnly: true, className: 'opacity-80' }),
              React.createElement(InputField, { label: 'Department', id: 'dept', value: student.department, readOnly: true, className: 'opacity-80 sm:col-span-2' }),
            ),
            React.createElement('p', { className: 'text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1' },
              React.createElement(Icon, { name: 'Lock', size: 11 }),
              'Pre-filled from your profile. Contact admin to update.'
            )
          ),

          // Leave Details
          React.createElement(Card, { className: 'p-5' },
            React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2' },
              React.createElement(Icon, { name: 'Calendar', size: 16, className: 'text-teal-500' }),
              'Leave Details'
            ),
            React.createElement('div', { className: 'space-y-4' },
              React.createElement(SelectField, {
                label: 'Leave Type',
                id: 'leave-type',
                value: form.type,
                onChange: e => handleChange('type', e.target.value),
                error: errors.type,
                required: true,
              },
                React.createElement('option', { value: '' }, '— Select leave type —'),
                window.MOCK_DATA.leaveTypes.map(t =>
                  React.createElement('option', { key: t.value, value: t.value }, t.label)
                )
              ),
              React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 items-start' },
                React.createElement(InputField, {
                  label: 'Start Date',
                  id: 'start-date',
                  type: 'date',
                  value: form.startDate,
                  min: today,
                  onChange: e => handleChange('startDate', e.target.value),
                  error: errors.startDate,
                  required: true,
                }),
                React.createElement(InputField, {
                  label: 'End Date',
                  id: 'end-date',
                  type: 'date',
                  value: form.endDate,
                  min: form.startDate || today,
                  onChange: e => handleChange('endDate', e.target.value),
                  error: errors.endDate,
                  required: true,
                }),
                React.createElement('div', { className: 'flex flex-col gap-1.5' },
                  React.createElement('label', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Duration'),
                  React.createElement('div', { className: cn('px-3.5 py-2.5 rounded-xl border text-sm font-semibold', days > 0 ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400') },
                    days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '—'
                  )
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

          // Optional fields
          React.createElement(Card, { className: 'p-5' },
            React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2' },
              React.createElement(Icon, { name: 'Upload', size: 16, className: 'text-teal-500' }),
              'Additional Details (Optional)'
            ),
            React.createElement('div', { className: 'space-y-4' },
              React.createElement(InputField, {
                label: 'Emergency Contact',
                id: 'emergency-contact',
                type: 'tel',
                placeholder: '+91 98765 43210',
                value: form.emergencyContact,
                onChange: e => handleChange('emergencyContact', e.target.value),
                helperText: 'Reachable contact during your leave period.',
              }),
              React.createElement('div', { className: 'flex flex-col gap-1.5' },
                React.createElement('label', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Attachment'),
                React.createElement('div', {
                  className: 'border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center cursor-not-allowed opacity-60 hover:border-teal-300 smooth-transition',
                },
                  React.createElement(Icon, { name: 'Upload', size: 20, className: 'text-slate-400 mx-auto mb-1' }),
                  React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400' }, 'Upload medical certificate or supporting document'),
                  React.createElement('p', { className: 'text-xs text-slate-400 dark:text-slate-500 mt-0.5' }, 'PDF, JPG, PNG up to 5MB · (Backend required)')
                )
              )
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
                      prediction.factors.map((f, i) =>
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
                  ['Ensure all details are accurate.', 'Upload medical certificate if applicable.', 'You\'ll be notified via email & app.'].map(t =>
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
  const [filters, setFilters] = useState({ status: 'all', type: 'all', search: '' });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const { addToast } = useToast();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await window.LeaveService.getLeaveHistory(filters);
      setLeaves(result.leaves);
    } catch (err) {
      setError(err.message || 'Failed to load leave history.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const stats = useMemo(() => {
    const all = window.MOCK_DATA.leaveRequests;
    return {
      total: all.length,
      approved: all.filter(l => l.status === 'approved').length,
      pending: all.filter(l => l.status === 'pending').length,
      rejected: all.filter(l => l.status === 'rejected').length,
    };
  }, []);

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
            onChange: e => setFilters(p => ({ ...p, type: e.target.value })),
            className: 'pl-3.5 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 smooth-transition focus:border-teal-400 cursor-pointer w-full sm:w-auto',
            'aria-label': 'Filter by type',
          },
            React.createElement('option', { value: 'all' }, 'All Types'),
            window.MOCK_DATA.leaveTypes.map(t =>
              React.createElement('option', { key: t.value, value: t.value }, t.label)
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
function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const { addToast } = useToast();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await window.NotificationService.getNotifications('STU2024001');
      setNotifications(result);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Firebase real-time placeholder
    const unsub = window.FirebaseFirestore.subscribeToNotifications('STU2024001', (updates) => {
      console.log('[Notifications] Real-time updates received');
    });
    return () => unsub();
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
      unreadCount > 0 && React.createElement(Button, { variant: 'ghost', size: 'sm', onClick: markAllRead },
        React.createElement(Icon, { name: 'CheckCheck', size: 14 }),
        'Mark all read'
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

    // Firebase badge
    React.createElement('div', { className: 'mb-4 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl' },
      React.createElement('div', { className: 'w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0' }),
      React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400' },
        React.createElement('span', { className: 'font-medium text-slate-600 dark:text-slate-300' }, 'Firebase Real-time: '),
        'Placeholder active. Connect Firebase SDK for live push notifications.'
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
  const student = window.MOCK_DATA.student;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
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
            className: 'w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg',
            style: { background: student.profileColor }
          }, student.profileInitials),
          React.createElement('div', { className: 'absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-800', 'aria-label': 'Online status' })
        ),
        React.createElement('div', { className: 'flex-1' },
          React.createElement('h2', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100' }, student.name),
          React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 mt-0.5' }, student.email),
          React.createElement('div', { className: 'flex flex-wrap gap-2 mt-2' },
            [student.registerNumber, student.class, `Sem ${student.semester}`].map(tag =>
              React.createElement('span', { key: tag, className: 'text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full border border-teal-200 dark:border-teal-800' }, tag)
            )
          )
        )
      )
    ),

    // Student Details
    React.createElement(Card, { className: 'p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2' },
        React.createElement(Icon, { name: 'User', size: 16, className: 'text-teal-500' }),
        'Academic Details'
      ),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
        [
          ['Student ID', student.id],
          ['Register No.', student.registerNumber],
          ['Roll Number', student.rollNumber],
          ['Department', student.department],
          ['Class', student.class],
          ['Phone', student.phone],
          ['Faculty Adviser', student.adviser],
          ['Adviser Email', student.adviserEmail],
          ['Joined', formatDate(student.joinedDate)],
          ['Attendance', `${student.attendance}%`],
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
              className: 'relative w-12 h-6 rounded-full smooth-transition flex-shrink-0 bg-teal-500',
              role: 'switch',
              'aria-checked': true,
              'aria-label': 'Toggle push notifications',
            },
              React.createElement('span', { className: 'absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow smooth-transition' })
            )
          },
          {
            icon: 'Mail',
            label: 'Email Notifications',
            desc: 'Receive leave updates via email',
            control: React.createElement('button', {
              className: 'relative w-12 h-6 rounded-full smooth-transition flex-shrink-0 bg-teal-500',
              role: 'switch',
              'aria-checked': true,
              'aria-label': 'Toggle email notifications',
            },
              React.createElement('span', { className: 'absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow smooth-transition' })
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

    // Firebase Status
    React.createElement(Card, { className: 'p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900' },
      React.createElement('h3', { className: 'text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2' },
        React.createElement(Icon, { name: 'Zap', size: 16 }),
        'Firebase Integration Status'
      ),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3' },
        [
          { label: 'Authentication', status: 'Placeholder', icon: 'Shield' },
          { label: 'Firestore', status: 'Placeholder', icon: 'Database' },
          { label: 'Cloud Messaging', status: 'Placeholder', icon: 'Bell' },
        ].map(s =>
          React.createElement('div', { key: s.label, className: 'flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl' },
            React.createElement(Icon, { name: s.icon, size: 16, className: 'text-blue-500 flex-shrink-0' }),
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs font-medium text-slate-700 dark:text-slate-300' }, s.label),
              React.createElement('p', { className: 'text-[10px] text-amber-500' }, s.status)
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
