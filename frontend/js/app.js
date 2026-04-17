// ============================================================
// AutoLeave AI – Main App Entry Point
// ============================================================

const { useState, useEffect, useCallback } = React;

// ============================================================
// DARK MODE HOOK
// ============================================================
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('autoleave_dark');
    if (stored !== null) return stored === 'true';
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('autoleave_dark', isDark);
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(p => !p), []);
  return [isDark, toggle];
}

// ============================================================
// UNREAD COUNT HOOK
// ============================================================
function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const syncUnreadCount = async () => {
      try {
        const current = await window.NotificationService.getUnreadCount();
        if (active) setCount(Number(current) || 0);
      } catch {
        if (active) setCount(0);
      }
    };

    syncUnreadCount();
    const interval = setInterval(syncUnreadCount, 3000);
    return () => clearInterval(interval);
  }, []);

  return [count, setCount];
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
function App() {
  const [isDark, toggleDark] = useDarkMode();
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [unreadCount] = useUnreadCount();
  const [pageKey, setPageKey] = useState(0); // For re-triggering page animations

  // Check for existing session
  useEffect(() => {
    const stored = window.AuthService.getSession();
    if (stored) {
      setUser(stored);
      setPage('dashboard');
    }
  }, []);

  // Handle logout event
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('autoleave_user');
      setUser(null);
      setPage('login');
    };
    window.addEventListener('autoleave:logout', handleLogout);
    return () => window.removeEventListener('autoleave:logout', handleLogout);
  }, []);

  const handleLogin = useCallback((studentData) => {
    setUser(studentData);
    setPage('dashboard');
  }, []);

  const navigateTo = useCallback((newPage) => {
    if (newPage === page) return;
    setPageKey(k => k + 1);
    setPage(newPage);
    // Scroll to top on navigation
    document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0 });
  }, [page]);

  // Render current page
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return React.createElement(DashboardPage, { key: pageKey, onNavigate: navigateTo });
      case 'admin-approvals':
        return React.createElement(AdminApprovalPage, { key: pageKey });
      case 'apply':
        return React.createElement(ApplyLeavePage, { key: pageKey, onNavigate: navigateTo });
      case 'faculty-apply':
        return React.createElement(FacultyApplyLeavePage, { key: pageKey, onNavigate: navigateTo });
      case 'history':
        return React.createElement(LeaveHistoryPage, { key: pageKey, onNavigate: navigateTo });
      case 'notifications':
        return React.createElement(NotificationsPage, { key: pageKey, onNavigate: navigateTo });
      case 'profile':
        return React.createElement(ProfilePage, { key: pageKey, onToggleDark: toggleDark, isDark });
      default:
        return React.createElement(DashboardPage, { key: pageKey, onNavigate: navigateTo });
    }
  };

  if (!user) {
    return React.createElement(ToastProvider, null,
      React.createElement('div', { className: 'min-h-screen' },
        React.createElement(LoginPage, { onLogin: handleLogin })
      )
    );
  }

  return React.createElement(ToastProvider, null,
    React.createElement(AppLayout, {
      currentPage: page,
      onNavigate: navigateTo,
      student: user,
      unreadCount,
      onToggleDark: toggleDark,
      isDark,
    },
      renderPage()
    )
  );
}

// ============================================================
// MOUNT APP
// ============================================================
const rootEl = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(rootEl);
reactRoot.render(React.createElement(App));

console.log('%c🚀 AutoLeave AI loaded successfully!', 'color: #14b8a6; font-size: 14px; font-weight: bold;');
console.log('%cStudent Leave Management System v2.0', 'color: #64748b; font-size: 12px;');
