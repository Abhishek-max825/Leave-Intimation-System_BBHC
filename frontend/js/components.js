// ============================================================
// AutoLeave AI – Reusable Components Library
// ============================================================

const { useState, useEffect, useCallback, createContext, useContext } = React;

// ============================================================
// CONTEXT
// ============================================================
window.AppContext = createContext(null);
window.ToastContext = createContext(null);

// ============================================================
// UTILITY HELPERS
// ============================================================
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelativeTime(isoStr) {
  if (!isoStr) return '';
  const now = new Date();
  const then = new Date(isoStr);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(isoStr);
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

window.formatDate = formatDate;
window.formatRelativeTime = formatRelativeTime;
window.cn = cn;

// ============================================================
// ICON COMPONENT (Lucide SVG via createElementNS)
// ============================================================
// Map of icon names to SVG path data
const ICON_PATHS = {
  Layers: '<rect width="16" height="16" x="4" y="2" rx="2" /><path d="m22 7-8-5-8 5"/><path d="m22 12-8-5-8 5"/><path d="m22 17-8-5-8 5"/>',
  LayoutDashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  FilePlus2: '<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M6 12v6"/>',
  ClipboardList: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  Bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  UserCircle: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  LogOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  Moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  X: '<path d="M18 6 6 18M6 6l12 12"/>',
  CheckCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  XCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  AlertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  Info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  FileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  Sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>',
  BarChart2: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  Calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  CalendarDays: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  CalendarCheck: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/>',
  ChevronDown: '<polyline points="6 9 12 15 18 9"/>',
  ChevronRight: '<polyline points="9 18 15 12 9 6"/>',
  ChevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  Search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  EyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
  User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  Send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  Upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  Plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  RefreshCw: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  MessageCircle: '<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>',
  MessageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  Hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  Tag: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>',
  Radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
  TrendingUp: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  TrendingDown: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  Stethoscope: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
  Siren: '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1Z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="M4.929 4.929 5.64 5.64"/><path d="M12 12v6"/>',
  LayoutGrid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  List: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  CheckCheck: '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
  BellOff: '<path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="m2 2 20 20"/>',
  Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  Database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  Settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  Save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  Check: '<polyline points="20 6 9 17 4 12"/>',
  Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  Menu: '<line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>',
};

function Icon({ name, size = 18, className = '', strokeWidth = 2 }) {
  const paths = ICON_PATHS[name] || ICON_PATHS['FileText'];

  return React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: cn('inline-block flex-shrink-0', className),
    'aria-hidden': 'true',
    dangerouslySetInnerHTML: { __html: paths },
  });
}

window.Icon = Icon;

// ============================================================
// TOAST SYSTEM
// ============================================================
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return React.createElement(window.ToastContext.Provider, { value: { addToast } },
    children,
    React.createElement('div', { className: 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]', 'aria-live': 'polite' },
      toasts.map(toast => React.createElement(ToastItem, { key: toast.id, toast, onRemove: removeToast }))
    )
  );
}

function ToastItem({ toast, onRemove }) {
  const configs = {
    success: { icon: 'CheckCircle', bg: 'bg-white dark:bg-slate-800', border: 'border-green-500', icon_color: 'text-green-500', title: 'Success' },
    error: { icon: 'XCircle', bg: 'bg-white dark:bg-slate-800', border: 'border-red-500', icon_color: 'text-red-500', title: 'Error' },
    warning: { icon: 'AlertTriangle', bg: 'bg-white dark:bg-slate-800', border: 'border-amber-500', icon_color: 'text-amber-500', title: 'Warning' },
    info: { icon: 'Info', bg: 'bg-white dark:bg-slate-800', border: 'border-teal-500', icon_color: 'text-teal-500', title: 'Info' },
  };
  const c = configs[toast.type] || configs.info;

  return React.createElement('div', {
    className: cn('toast-enter flex items-start gap-3 p-4 rounded-xl shadow-lg border-l-4 dark:border dark:border-slate-700', c.bg, c.border),
    style: { animation: 'slideInRight 0.3s ease-out' }
  },
    React.createElement(Icon, { name: c.icon, size: 20, className: c.icon_color }),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement('p', { className: 'text-sm font-semibold text-slate-800 dark:text-slate-100' }, c.title),
      React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed' }, toast.msg)
    ),
    React.createElement('button', {
      onClick: () => onRemove(toast.id),
      className: 'p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 smooth-transition flex-shrink-0',
    },
      React.createElement(Icon, { name: 'X', size: 14 })
    )
  );
}

window.ToastProvider = ToastProvider;

function useToast() {
  return useContext(window.ToastContext);
}
window.useToast = useToast;

// ============================================================
// STATUS BADGE
// ============================================================
function StatusBadge({ status, size = 'md' }) {
  const map = {
    approved: { label: 'Approved', cls: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' },
    pending: { label: 'Pending', cls: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' },
    rejected: { label: 'Rejected', cls: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]' },
    under_review: { label: 'Under Review', cls: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' },
  };
  const cfg = map[status] || map.pending;
  const sizes = { sm: 'text-[11px] px-2 py-0.5', md: 'text-[11px] px-2.5 py-0.5', lg: 'text-[11px] px-2.5 py-0.5' };

  return React.createElement('span', {
    className: cn('inline-flex items-center font-medium rounded-full border', cfg.cls, sizes[size]),
    role: 'status',
    'aria-label': cfg.label,
  },
    cfg.label
  );
}
window.StatusBadge = StatusBadge;

// ============================================================
// SKELETON LOADERS
// ============================================================
function SkeletonLine({ className = 'h-4 w-full' }) {
  return React.createElement('div', { className: cn('shimmer-bg rounded-lg', className) });
}

function SkeletonCard({ className = '' }) {
  return React.createElement('div', { className: cn('bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-700', className) },
    React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
      React.createElement('div', { className: 'shimmer-bg w-10 h-10 rounded-xl flex-shrink-0' }),
      React.createElement('div', { className: 'flex-1 space-y-2' },
        React.createElement(SkeletonLine, { className: 'h-3 w-20' }),
        React.createElement(SkeletonLine, { className: 'h-5 w-12' })
      )
    ),
    React.createElement(SkeletonLine, { className: 'h-3 w-full' })
  );
}

function SkeletonTable() {
  return React.createElement('div', { className: 'space-y-3' },
    [1, 2, 3, 4].map(i =>
      React.createElement('div', { key: i, className: 'bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 flex gap-4 items-center' },
        React.createElement('div', { className: 'shimmer-bg w-8 h-8 rounded-lg flex-shrink-0' }),
        React.createElement('div', { className: 'flex-1 space-y-2' },
          React.createElement(SkeletonLine, { className: 'h-3 w-32' }),
          React.createElement(SkeletonLine, { className: 'h-3 w-48' })
        ),
        React.createElement('div', { className: 'shimmer-bg h-6 w-16 rounded-full' })
      )
    )
  );
}

window.SkeletonCard = SkeletonCard;
window.SkeletonTable = SkeletonTable;
window.SkeletonLine = SkeletonLine;

// ============================================================
// LOADING SPINNER
// ============================================================
function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return React.createElement('div', {
    className: cn('border-2 border-slate-200 dark:border-slate-600 border-t-teal-500 rounded-full animate-spin', sizes[size], className),
    role: 'status',
    'aria-label': 'Loading...',
  });
}

function LoadingOverlay({ message = 'Loading...' }) {
  return React.createElement('div', { className: 'flex flex-col items-center justify-center gap-3 py-16' },
    React.createElement(Spinner, { size: 'lg' }),
    React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400' }, message)
  );
}

window.Spinner = Spinner;
window.LoadingOverlay = LoadingOverlay;

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ icon = 'FileText', title, message, actionLabel, onAction }) {
  return React.createElement('div', { className: 'flex flex-col items-center justify-center gap-4 py-16 text-center' },
    React.createElement('div', { className: 'w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center' },
      React.createElement(Icon, { name: icon, size: 28, className: 'text-slate-400 dark:text-slate-500' })
    ),
    React.createElement('div', null,
      React.createElement('h3', { className: 'text-base font-semibold text-slate-700 dark:text-slate-300 mb-1' }, title),
      React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 max-w-xs' }, message)
    ),
    actionLabel && React.createElement('button', {
      onClick: onAction,
      className: 'btn-primary btn-press px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl smooth-transition flex items-center gap-2'
    },
      React.createElement(Icon, { name: 'Plus', size: 16 }),
      actionLabel
    )
  );
}
window.EmptyState = EmptyState;

// ============================================================
// ERROR STATE
// ============================================================
function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return React.createElement('div', { className: 'flex flex-col items-center justify-center gap-4 py-16 text-center' },
    React.createElement('div', { className: 'w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center' },
      React.createElement(Icon, { name: 'AlertCircle', size: 28, className: 'text-red-400' })
    ),
    React.createElement('div', null,
      React.createElement('h3', { className: 'text-base font-semibold text-slate-700 dark:text-slate-300 mb-1' }, 'Failed to load'),
      React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400 max-w-xs' }, message)
    ),
    onRetry && React.createElement('button', {
      onClick: onRetry,
      className: 'btn-press px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium rounded-xl smooth-transition flex items-center gap-2 text-slate-700 dark:text-slate-300'
    },
      React.createElement(Icon, { name: 'RefreshCw', size: 16 }),
      'Retry'
    )
  );
}
window.ErrorState = ErrorState;

// ============================================================
// ALERT BANNER
// ============================================================
function AlertBanner({ type = 'info', message, onClose }) {
  const configs = {
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400', icon: 'Info' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', icon: 'AlertTriangle' },
    error: { bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', icon: 'AlertCircle' },
    success: { bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400', icon: 'CheckCircle' },
  };
  const c = configs[type];

  return React.createElement('div', { className: cn('flex items-center gap-3 px-4 py-3 rounded-xl border text-sm', c.bg, c.text) },
    React.createElement(Icon, { name: c.icon, size: 16 }),
    React.createElement('span', { className: 'flex-1' }, message),
    onClose && React.createElement('button', { onClick: onClose, className: 'hover:opacity-70 smooth-transition' },
      React.createElement(Icon, { name: 'X', size: 14 })
    )
  );
}
window.AlertBanner = AlertBanner;

// ============================================================
// FORM COMPONENTS
// ============================================================
function InputField({ label, id, error, helperText, className = '', required, ...props }) {
  return React.createElement('div', { className: cn('flex flex-col gap-1.5', className) },
    label && React.createElement('label', {
      htmlFor: id,
      className: 'text-[13px] font-medium text-[#374151] flex items-center gap-1 mb-1'
    },
      label,
      required && React.createElement('span', { className: 'text-red-500 text-xs', 'aria-hidden': 'true' }, '*')
    ),
    React.createElement('input', {
      id,
      'aria-describedby': error ? `${id}-error` : helperText ? `${id}-hint` : undefined,
      'aria-invalid': !!error,
      className: cn(
        'w-full h-9 px-3 text-[14px] rounded-md border bg-white text-[#0F172A] placeholder-[#94A3B8] smooth-transition focus:border-[#2563EB]',
        error ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
      ),
      required,
      ...props
    }),
    error && React.createElement('p', { id: `${id}-error`, className: 'text-[12px] text-[#DC2626] flex items-center gap-1', role: 'alert' },
      React.createElement(Icon, { name: 'AlertCircle', size: 12 }),
      error
    ),
    helperText && !error && React.createElement('p', { id: `${id}-hint`, className: 'text-xs text-slate-500 dark:text-slate-400' }, helperText)
  );
}
window.InputField = InputField;

function SelectField({ label, id, error, helperText, className = '', children, required, ...props }) {
  return React.createElement('div', { className: cn('flex flex-col gap-1.5', className) },
    label && React.createElement('label', {
      htmlFor: id,
      className: 'text-[13px] font-medium text-[#374151] flex items-center gap-1 mb-1'
    },
      label,
      required && React.createElement('span', { className: 'text-red-500 text-xs', 'aria-hidden': 'true' }, '*')
    ),
    React.createElement('div', { className: 'relative' },
      React.createElement('select', {
        id,
        'aria-invalid': !!error,
        className: cn(
          'w-full h-9 px-3 pr-9 text-[14px] rounded-md border bg-white text-[#0F172A] smooth-transition focus:border-[#2563EB] cursor-pointer',
          error ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
        ),
        required,
        ...props
      }, children),
      React.createElement('div', { className: 'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' },
        React.createElement(Icon, { name: 'ChevronDown', size: 16, className: 'text-slate-400' })
      )
    ),
    error && React.createElement('p', { className: 'text-[12px] text-[#DC2626] flex items-center gap-1', role: 'alert' },
      React.createElement(Icon, { name: 'AlertCircle', size: 12 }),
      error
    ),
    helperText && !error && React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, helperText)
  );
}
window.SelectField = SelectField;

function TextareaField({ label, id, error, helperText, className = '', required, ...props }) {
  return React.createElement('div', { className: cn('flex flex-col gap-1.5', className) },
    label && React.createElement('label', {
      htmlFor: id,
      className: 'text-[13px] font-medium text-[#374151] flex items-center gap-1 mb-1'
    },
      label,
      required && React.createElement('span', { className: 'text-red-500 text-xs', 'aria-hidden': 'true' }, '*')
    ),
    React.createElement('textarea', {
      id,
      'aria-invalid': !!error,
      className: cn(
        'w-full px-3 py-2 text-[14px] rounded-md border bg-white text-[#0F172A] placeholder-[#94A3B8] smooth-transition focus:border-[#2563EB] resize-none',
        error ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
      ),
      required,
      ...props
    }),
    error && React.createElement('p', { className: 'text-[12px] text-[#DC2626] flex items-center gap-1', role: 'alert' },
      React.createElement(Icon, { name: 'AlertCircle', size: 12 }),
      error
    ),
    helperText && !error && React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, helperText)
  );
}
window.TextareaField = TextareaField;

// ============================================================
// BUTTON COMPONENTS
// ============================================================
function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  const variants = {
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-[#2563EB]',
    secondary: 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0]',
    ghost: 'bg-transparent hover:bg-[#F8FAFC] text-[#0F172A] border-transparent',
    danger: 'bg-white hover:bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    success: 'bg-white hover:bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[13px] gap-1.5',
    md: 'px-4 py-2 text-[13px] gap-2',
    lg: 'px-4 py-2 text-[13px] gap-2',
  };

  return React.createElement('button', {
    disabled: disabled || loading,
    className: cn(
      'btn-press inline-flex items-center justify-center font-medium rounded-md border smooth-transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed',
      variants[variant],
      sizes[size],
      className
    ),
    ...props
  },
    loading ? React.createElement(React.Fragment, null,
      React.createElement(Spinner, { size: 'sm', className: 'border-white/30 border-t-white' }),
      'Loading...'
    ) : children
  );
}
window.Button = Button;

// ============================================================
// CARD COMPONENT
// ============================================================
function Card({ children, className = '', hoverable = false, onClick }) {
  return React.createElement('div', {
    className: cn(
      'pro-surface rounded-[10px]',
      hoverable && 'card-hover cursor-pointer',
      className
    ),
    onClick,
  }, children);
}
window.Card = Card;

// ============================================================
// SUMMARY STAT CARD
// ============================================================
function StatCard({ title, value, icon, iconBg, iconColor, subtitle, trend, loading }) {
  if (loading) return React.createElement(SkeletonCard);

  return React.createElement(Card, { hoverable: false, className: 'p-4 sm:p-4.5' },
    React.createElement('div', { className: 'mb-2' },
      React.createElement(Icon, { name: icon, size: 16, className: iconColor })
    ),
    React.createElement('div', null,
      React.createElement('p', { className: 'text-[11px] uppercase tracking-[0.1em] text-[#94A3B8] mb-1' }, title),
      React.createElement('p', { className: 'text-[28px] leading-none font-semibold text-[#0F172A]' }, value),
      subtitle && React.createElement('p', { className: 'text-[12px] text-[#64748B] mt-2' }, subtitle)
    )
  );
}
window.StatCard = StatCard;

// ============================================================
// AI PREDICTION CARD
// ============================================================
function AIPredictionCard({ probability = 82, explanation = '', compact = false, loading, factors = [] }) {

  if (loading) return React.createElement('div', { className: cn('bg-white rounded-[10px] border border-[#E2E8F0]', compact ? 'p-4' : 'p-5') },
    React.createElement('div', { className: 'space-y-3' },
      React.createElement(SkeletonLine, { className: 'h-4 w-32' }),
      React.createElement(SkeletonLine, { className: 'h-8 w-16' }),
      React.createElement(SkeletonLine, { className: 'h-3 w-full' })
    )
  );

  const color = '#2563EB';
  const label = probability >= 70 ? 'High Confidence' : probability >= 50 ? 'Moderate Confidence' : 'Low Confidence';
  const circumference = 2 * Math.PI * 30;
  const strokeDash = (probability / 100) * circumference;

  return React.createElement(Card, { className: cn(compact ? 'p-4' : 'p-5') },
    React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
      React.createElement(Icon, { name: 'Sparkles', size: 14, className: 'text-[#2563EB]' }),
      React.createElement('h3', { className: 'text-[10px] uppercase tracking-[0.1em] text-[#94A3B8]' }, 'AI Prediction')
    ),
    React.createElement('div', { className: 'flex items-center gap-4' },
      React.createElement('div', { className: 'relative flex-shrink-0' },
        React.createElement('svg', { width: 72, height: 72, viewBox: '0 0 72 72', 'aria-hidden': 'true' },
          React.createElement('circle', { cx: 36, cy: 36, r: 30, fill: 'none', stroke: '#E2E8F0', strokeWidth: 6 }),
          React.createElement('circle', {
            cx: 36, cy: 36, r: 30,
            fill: 'none',
            stroke: color,
            strokeWidth: 6,
            strokeLinecap: 'round',
            strokeDasharray: `${strokeDash} ${circumference}`,
            transform: 'rotate(-90 36 36)',
          })
        ),
        React.createElement('div', { className: 'absolute inset-0 flex items-center justify-center' },
          React.createElement('span', { className: 'text-[18px] font-semibold text-[#0F172A]' }, `${probability}%`)
        )
      ),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('span', {
          className: 'text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8]'
        }, label),
        !compact && React.createElement('p', { className: 'text-[12px] text-[#64748B] mt-2 leading-relaxed' }, explanation)
      )
    ),
    factors.length > 0 && React.createElement('div', { className: 'mt-3 space-y-2' },
      factors.map((f, idx) =>
        React.createElement('div', { key: `${f.label}-${idx}` },
          React.createElement('div', { className: 'flex justify-between text-[12px] text-[#64748B] mb-1' },
            React.createElement('span', null, f.label),
            React.createElement('span', { className: 'text-[#0F172A]' }, f.value)
          ),
          React.createElement('div', { className: 'h-[3px] w-full rounded-full bg-[#E2E8F0]' },
            React.createElement('div', { className: 'h-[3px] rounded-full bg-[#2563EB]', style: { width: `${f.percent || 50}%` } })
          )
        )
      )
    )
  );
}
window.AIPredictionCard = AIPredictionCard;

// ============================================================
// ATTENDANCE RING WIDGET
// ============================================================
function AttendanceWidget({ percentage = 87, totalDays = 120, presentDays = 105, loading }) {
  if (loading) return React.createElement(Card, { className: 'p-5 space-y-3' },
    React.createElement(SkeletonLine, { className: 'h-4 w-28' }),
    React.createElement('div', { className: 'flex gap-4' },
      React.createElement('div', { className: 'shimmer-bg w-20 h-20 rounded-full' }),
      React.createElement('div', { className: 'flex-1 space-y-2 py-2' },
        React.createElement(SkeletonLine, { className: 'h-3' }),
        React.createElement(SkeletonLine, { className: 'h-3 w-3/4' })
      )
    )
  );

  const color = '#16A34A';
  const circumference = 2 * Math.PI * 34;
  const strokeDash = (percentage / 100) * circumference;

  return React.createElement(Card, { className: 'p-5' },
    React.createElement('h3', { className: 'text-[10px] uppercase tracking-[0.1em] text-[#94A3B8] mb-3' }, 'Attendance Insight'),
    React.createElement('div', { className: 'flex items-center gap-5' },
      React.createElement('div', { className: 'relative flex-shrink-0' },
        React.createElement('svg', { width: 80, height: 80, viewBox: '0 0 88 88', 'aria-label': `${percentage}% attendance` },
          React.createElement('circle', { cx: 44, cy: 44, r: 34, fill: 'none', stroke: '#E2E8F0', strokeWidth: 7 }),
          React.createElement('circle', {
            cx: 44, cy: 44, r: 34,
            fill: 'none',
            stroke: color,
            strokeWidth: 7,
            strokeLinecap: 'round',
            strokeDasharray: `${strokeDash} ${circumference}`,
            transform: 'rotate(-90 44 44)',
          })
        ),
        React.createElement('div', { className: 'absolute inset-0 flex items-center justify-center' },
          React.createElement('span', { className: 'text-[16px] font-semibold text-[#0F172A]' }, `${percentage}%`)
        )
      ),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'space-y-2 mb-3' },
          React.createElement('div', { className: 'flex justify-between text-[13px]' },
            React.createElement('span', { className: 'text-[#64748B]' }, 'Present'),
            React.createElement('span', { className: 'font-medium text-[#0F172A]' }, presentDays)
          ),
          React.createElement('div', { className: 'flex justify-between text-[13px]' },
            React.createElement('span', { className: 'text-[#64748B]' }, 'Working Days'),
            React.createElement('span', { className: 'font-medium text-[#0F172A]' }, totalDays)
          ),
          React.createElement('div', { className: 'flex justify-between text-[13px]' },
            React.createElement('span', { className: 'text-[#64748B]' }, 'Absent'),
            React.createElement('span', { className: 'font-medium text-[#0F172A]' }, totalDays - presentDays)
          )
        ),
        React.createElement('span', { className: 'inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]' },
          React.createElement('span', { className: 'w-1.5 h-1.5 rounded-full bg-[#16A34A]' }),
          'On Track'
        )
      )
    )
  );
}
window.AttendanceWidget = AttendanceWidget;

// ============================================================
// NOTIFICATION ITEM
// ============================================================
function NotificationItem({ notif, onMarkRead, compact = false }) {
  const typeCfg = window.NOTIFICATION_TYPE_CONFIG[notif.type] || window.NOTIFICATION_TYPE_CONFIG.note;

  return React.createElement('div', {
    className: cn(
      'flex items-start gap-3 rounded-xl smooth-transition',
      compact ? 'p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50' : 'p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50',
      !notif.read && 'bg-teal-50/60 dark:bg-teal-900/10'
    ),
    onClick: () => !notif.read && onMarkRead && onMarkRead(notif.id),
    role: 'listitem',
  },
    React.createElement('div', { className: cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', typeCfg.bg) },
      React.createElement(Icon, { name: notif.icon || 'Bell', size: 15, className: typeCfg.color })
    ),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement('div', { className: 'flex items-start justify-between gap-2' },
        React.createElement('p', { className: cn('text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight', !notif.read && 'font-semibold') }, notif.title),
        React.createElement('span', { className: 'text-xs text-slate-400 dark:text-slate-500 flex-shrink-0' }, formatRelativeTime(notif.timestamp))
      ),
      React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2' }, notif.message)
    ),
    !notif.read && React.createElement('div', { className: 'w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5 notif-pulse' })
  );
}
window.NotificationItem = NotificationItem;

// ============================================================
// SIDEBAR COMPONENT
// ============================================================
function Sidebar({ currentPage, onNavigate, student, unreadCount, onToggleDark, isDark, isOpen, onClose }) {
  const role = (student?.role || 'student').toLowerCase();
  const navItems =
    role === 'faculty'
      ? [
          { page: 'dashboard', icon: 'LayoutDashboard', label: 'Faculty Dashboard' },
          { page: 'faculty-apply', icon: 'FilePlus2', label: 'Apply Leave' },
          { page: 'notifications', icon: 'Bell', label: 'Notifications', badge: unreadCount },
          { page: 'profile', icon: 'UserCircle', label: 'Profile' },
        ]
      : role === 'admin'
        ? [
            { page: 'dashboard', icon: 'LayoutDashboard', label: 'Admin Dashboard' },
            { page: 'admin-approvals', icon: 'ClipboardCheck', label: 'Approvals' },
            { page: 'notifications', icon: 'Bell', label: 'Notifications', badge: unreadCount },
            { page: 'profile', icon: 'UserCircle', label: 'Profile' },
          ]
        : [
            { page: 'dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
            { page: 'apply', icon: 'FilePlus2', label: 'Apply Leave' },
            { page: 'history', icon: 'ClipboardList', label: 'Leave History' },
            { page: 'notifications', icon: 'Bell', label: 'Notifications', badge: unreadCount },
            { page: 'profile', icon: 'UserCircle', label: 'Profile & Settings' },
          ];

  return React.createElement(React.Fragment, null,
    // Overlay for mobile
    isOpen && React.createElement('div', {
      className: 'fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden',
      onClick: onClose,
      'aria-hidden': 'true'
    }),

    // Sidebar
    React.createElement('aside', {
      className: cn(
        'fixed top-0 left-0 h-full w-[240px] bg-[#FFFFFF] border-r border-[#E2E8F0] z-40 flex flex-col sidebar-transition',
        'lg:translate-x-0 lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ),
      'aria-label': 'Main navigation',
    },
      // Logo area
      React.createElement('div', { className: 'h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0' },
        React.createElement('div', { className: 'flex items-center gap-2.5' },
          React.createElement('div', { className: 'w-5 h-5 rounded bg-[#2563EB] flex items-center justify-center' },
            React.createElement(Icon, { name: 'Layers', size: 12, className: 'text-white' })
          ),
          React.createElement('h1', { className: 'text-[15px] font-semibold text-[#0F172A] leading-none' },
            'AutoLeave ',
            React.createElement('span', { className: 'text-[#2563EB]' }, 'AI')
          )
        ),
        React.createElement('button', {
          onClick: onClose,
          className: 'lg:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-500',
          'aria-label': 'Close menu',
        },
          React.createElement(Icon, { name: 'X', size: 18 })
        )
      ),

      // Student profile mini
      React.createElement('div', { className: 'px-5 py-3 border-b border-[#E2E8F0] flex-shrink-0' },
        React.createElement('p', { className: 'text-[14px] font-medium text-[#0F172A] truncate' }, student?.name || 'Student'),
        React.createElement('p', { className: 'text-[12px] text-[#64748B] truncate' }, (student?.role || 'student').toUpperCase())
      ),

      // Nav
      React.createElement('nav', { className: 'flex-1 overflow-y-auto pt-4', 'aria-label': 'Page navigation' },
        React.createElement('p', { className: 'text-[10px] text-[#94A3B8] uppercase tracking-[0.1em] px-5 mb-2' }, 'Menu'),
        React.createElement('ul', { className: 'space-y-0.5', role: 'list' },
          navItems.map(item =>
            React.createElement('li', { key: item.page },
              React.createElement('button', {
                onClick: () => { onNavigate(item.page); onClose(); },
                className: cn(
                  'w-[calc(100%-16px)] ml-2 mr-2 flex items-center gap-3 px-3 py-2 rounded-md text-[13px] smooth-transition font-medium tracking-[0.01em] text-left border-l-2',
                  currentPage === item.page
                    ? 'bg-[#EFF6FF] text-[#2563EB] border-l-[#2563EB]'
                    : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] border-l-transparent'
                ),
                'aria-current': currentPage === item.page ? 'page' : undefined,
              },
                React.createElement('span', { className: cn(currentPage === item.page ? 'text-[#2563EB]' : 'text-[#64748B]') },
                  React.createElement(Icon, { name: item.icon, size: 16 })
                ),
                React.createElement('span', { className: 'flex-1' }, item.label),
                item.badge > 0 && React.createElement('span', { className: 'w-1.5 h-1.5 rounded-full bg-[#DC2626]' })
              )
            )
          )
        )
      ),

      // Footer actions
      React.createElement('div', { className: 'px-5 py-3 border-t border-[#E2E8F0] flex-shrink-0' },
        React.createElement('button', {
          className: 'w-full flex items-center gap-2 text-[13px] text-[#DC2626] smooth-transition font-medium',
          onClick: () => window.dispatchEvent(new CustomEvent('autoleave:logout')),
        },
          React.createElement(Icon, { name: 'LogOut', size: 14 }),
          'Sign Out'
        )
      )
    )
  );
}
window.Sidebar = Sidebar;

// ============================================================
// MOBILE HEADER
// ============================================================
function MobileHeader({ currentPage, onOpenMenu, student, unreadCount, onNavigate }) {
  const pageNames = {
    dashboard: 'Dashboard',
    'admin-approvals': 'Admin Approvals',
    apply: 'Apply Leave',
    'faculty-apply': 'Apply Leave',
    history: 'Leave History',
    notifications: 'Notifications',
    profile: 'Profile & Settings',
  };

  return React.createElement('header', { className: 'lg:hidden sticky top-0 z-20 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between', 'aria-label': 'Mobile header' },
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement('button', {
        onClick: onOpenMenu,
        className: 'p-2 rounded-md hover:bg-slate-100 text-slate-600 smooth-transition',
        'aria-label': 'Open menu',
      },
        React.createElement(Icon, { name: 'Menu', size: 22 })
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'w-6 h-6 bg-[#2563EB] rounded-md flex items-center justify-center' },
          React.createElement(Icon, { name: 'Layers', size: 12, className: 'text-white' })
        ),
        React.createElement('h2', { className: 'text-sm font-medium text-[#0F172A]' }, pageNames[currentPage] || 'AutoLeave AI')
      )
    ),
    React.createElement('div', { className: 'flex items-center gap-2' },
      React.createElement('button', {
        onClick: () => onNavigate('notifications'),
        className: 'relative p-2 rounded-md hover:bg-slate-100 text-slate-600 smooth-transition',
        'aria-label': `Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`,
      },
        React.createElement(Icon, { name: 'Bell', size: 20 }),
        unreadCount > 0 && React.createElement('span', {
          className: 'absolute top-1 right-1 w-1.5 h-1.5 bg-[#DC2626] rounded-full',
          'aria-hidden': 'true',
        })
      ),
      React.createElement('div', {
        className: 'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80 smooth-transition',
        style: { background: '#2563EB' },
        onClick: () => onNavigate('profile'),
        role: 'button',
        'aria-label': 'Go to profile',
        tabIndex: 0,
      }, student?.profileInitials || 'AM'),
      React.createElement('button', {
        onClick: () => window.dispatchEvent(new CustomEvent('autoleave:logout')),
        className: 'p-2 rounded-md hover:bg-red-50 text-red-600 smooth-transition',
        'aria-label': 'Sign out',
      },
        React.createElement(Icon, { name: 'LogOut', size: 18 })
      )
    )
  );
}
window.MobileHeader = MobileHeader;

// ============================================================
// MOBILE BOTTOM NAV
// ============================================================
function MobileBottomNav({ currentPage, onNavigate, unreadCount, student }) {
  const role = (student?.role || 'student').toLowerCase();
  const items = role === 'faculty'
    ? [
        { page: 'dashboard', icon: 'LayoutDashboard', label: 'Home' },
        { page: 'faculty-apply', icon: 'FilePlus2', label: 'Apply' },
        { page: 'notifications', icon: 'Bell', label: 'Alerts', badge: unreadCount },
        { page: 'profile', icon: 'UserCircle', label: 'Profile' },
      ]
    : role === 'admin'
      ? [
          { page: 'dashboard', icon: 'LayoutDashboard', label: 'Home' },
          { page: 'admin-approvals', icon: 'ClipboardCheck', label: 'Approve' },
          { page: 'notifications', icon: 'Bell', label: 'Alerts', badge: unreadCount },
          { page: 'profile', icon: 'UserCircle', label: 'Profile' },
        ]
      : [
          { page: 'dashboard', icon: 'LayoutDashboard', label: 'Home' },
          { page: 'apply', icon: 'FilePlus2', label: 'Apply' },
          { page: 'history', icon: 'ClipboardList', label: 'History' },
          { page: 'notifications', icon: 'Bell', label: 'Alerts', badge: unreadCount },
          { page: 'profile', icon: 'UserCircle', label: 'Profile' },
        ];

  return React.createElement('nav', {
    className: 'lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#E2E8F0] flex items-stretch safe-area-bottom',
    'aria-label': 'Mobile bottom navigation',
  },
    items.map(item =>
      React.createElement('button', {
        key: item.page,
        onClick: () => onNavigate(item.page),
        className: cn(
          'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 smooth-transition relative',
          currentPage === item.page ? 'text-[#2563EB]' : 'text-slate-400'
        ),
        'aria-current': currentPage === item.page ? 'page' : undefined,
        'aria-label': item.label,
      },
        currentPage === item.page && React.createElement('span', { className: 'absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#2563EB] rounded-full', 'aria-hidden': 'true' }),
        React.createElement('div', { className: 'relative' },
          React.createElement(Icon, { name: item.icon, size: 20 }),
          item.badge > 0 && React.createElement('span', {
            className: 'absolute top-0 right-0 w-1.5 h-1.5 bg-[#DC2626] rounded-full',
            'aria-hidden': 'true',
          })
        ),
        React.createElement('span', { className: 'text-[10px] font-medium leading-none mt-0.5' }, item.label)
      )
    )
  );
}
window.MobileBottomNav = MobileBottomNav;

// ============================================================
// DESKTOP HEADER
// ============================================================
function DesktopHeader({ currentPage, student, unreadCount, onNavigate, onToggleDark, isDark }) {
  const pageNames = {
    dashboard: 'Dashboard',
    apply: 'Apply Leave',
    'faculty-apply': 'Apply Leave',
    history: 'Leave History',
    notifications: 'Notifications',
    profile: 'Profile & Settings',
  };

  return React.createElement('header', { className: 'hidden lg:flex sticky top-0 z-10 h-14 bg-white border-b border-[#E2E8F0] px-6 items-center justify-between', 'aria-label': 'Desktop header' },
    React.createElement('div', null,
      React.createElement('h2', { className: 'text-[14px] font-medium text-[#0F172A]' }, pageNames[currentPage] || 'Dashboard')
    ),
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement('p', { className: 'text-[13px] text-[#64748B]' },
        new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
      ),
      React.createElement('button', {
        onClick: onToggleDark,
        className: 'w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] smooth-transition',
        'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
      },
        React.createElement(Icon, { name: isDark ? 'Sun' : 'Moon', size: 14 })
      ),
      React.createElement('button', {
        onClick: () => onNavigate('notifications'),
        className: 'relative w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] smooth-transition',
        'aria-label': `Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`,
      },
        React.createElement(Icon, { name: 'Bell', size: 14 }),
        unreadCount > 0 && React.createElement('span', {
          className: 'absolute top-1 right-1 w-1.5 h-1.5 bg-[#DC2626] rounded-full',
          'aria-hidden': 'true',
        })
      ),
      React.createElement('button', {
        onClick: () => onNavigate('profile'),
        className: 'flex items-center gap-2 px-1 py-1.5 smooth-transition',
        'aria-label': 'Go to profile',
      },
        React.createElement('div', {
          className: 'w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-medium',
          style: { background: '#2563EB' }
        }, student?.profileInitials || 'AM'),
        React.createElement('div', { className: 'hidden xl:block text-left' },
          React.createElement('p', { className: 'text-[13px] font-medium text-[#0F172A] leading-tight' }, student?.name || 'Arjun Mehta'),
          React.createElement('p', { className: 'text-[11px] text-[#64748B]' }, '3rd Year · CSE')
        )
      ),
      React.createElement('button', {
        onClick: () => window.dispatchEvent(new CustomEvent('autoleave:logout')),
        className: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 smooth-transition',
        'aria-label': 'Sign out',
      },
        React.createElement(Icon, { name: 'LogOut', size: 13 }),
        'Sign Out'
      )
    )
  );
}
window.DesktopHeader = DesktopHeader;

// ============================================================
// APP LAYOUT WRAPPER
// ============================================================
function AppLayout({ children, currentPage, onNavigate, student, unreadCount, onToggleDark, isDark }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return React.createElement('div', { className: 'h-full flex' },
    React.createElement(Sidebar, {
      currentPage,
      onNavigate,
      student,
      unreadCount,
      onToggleDark,
      isDark,
      isOpen: sidebarOpen,
      onClose: () => setSidebarOpen(false),
    }),
    React.createElement('div', { className: 'flex-1 flex flex-col min-w-0 lg:pl-[240px]' },
      React.createElement(MobileHeader, { currentPage, onOpenMenu: () => setSidebarOpen(true), student, unreadCount, onNavigate }),
      React.createElement(DesktopHeader, { currentPage, student, unreadCount, onNavigate, onToggleDark, isDark }),
      React.createElement('main', { className: 'flex-1 overflow-y-auto main-content', id: 'main-content', tabIndex: -1 },
        React.createElement('div', { className: 'app-shell content-wrap page-enter py-0' }, children)
      ),
      React.createElement(MobileBottomNav, { currentPage, onNavigate, unreadCount, student })
    )
  );
}
window.AppLayout = AppLayout;

// ============================================================
// LEAVE REQUEST CARD (for history)
// ============================================================
function LeaveCard({ leave, onViewDetails }) {
  return React.createElement(Card, { hoverable: true, className: 'p-4 cursor-pointer', onClick: () => onViewDetails && onViewDetails(leave) },
    React.createElement('div', { className: 'flex items-start justify-between gap-3 mb-3' },
      React.createElement('div', { className: 'flex items-start gap-3 flex-1 min-w-0' },
        React.createElement('div', { className: 'w-9 h-9 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0' },
          React.createElement(Icon, { name: leave.typeKey === 'sick' ? 'Stethoscope' : leave.typeKey === 'emergency' ? 'Siren' : 'Calendar', size: 17, className: 'text-teal-600 dark:text-teal-400' })
        ),
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', { className: 'text-sm font-semibold text-slate-800 dark:text-slate-100 truncate' }, leave.type),
          React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5' }, leave.reason)
        )
      ),
      React.createElement(StatusBadge, { status: leave.status })
    ),
    React.createElement('div', { className: 'flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap' },
      React.createElement('span', { className: 'flex items-center gap-1' },
        React.createElement(Icon, { name: 'CalendarDays', size: 12 }),
        `${formatDate(leave.startDate)} – ${formatDate(leave.endDate)}`
      ),
      React.createElement('span', { className: 'flex items-center gap-1' },
        React.createElement(Icon, { name: 'Clock', size: 12 }),
        `${leave.days} day${leave.days > 1 ? 's' : ''}`
      ),
      React.createElement('span', { className: 'flex items-center gap-1 ml-auto' },
        React.createElement(Icon, { name: 'Sparkles', size: 12, className: 'text-purple-400' }),
        React.createElement('span', { className: 'text-purple-600 dark:text-purple-400 font-medium' }, `${leave.aiPrediction}% AI`)
      )
    ),
    leave.facultyName && React.createElement('div', { className: 'mt-2 text-xs text-slate-500 dark:text-slate-400' },
      `Sent to faculty: ${leave.facultyName}`
    ),
    leave.facultyRemark && React.createElement('div', { className: 'mt-3 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5' },
      React.createElement(Icon, { name: 'MessageCircle', size: 12, className: 'mt-0.5 flex-shrink-0' }),
      React.createElement('span', { className: 'line-clamp-2' }, leave.facultyRemark)
    )
  );
}
window.LeaveCard = LeaveCard;

// ============================================================
// LEAVE DETAIL MODAL
// ============================================================
function LeaveDetailModal({ leave, onClose }) {
  if (!leave) return null;

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'modal-title',
  },
    React.createElement('div', { className: 'absolute inset-0 bg-black/50 backdrop-blur-sm', onClick: onClose, 'aria-hidden': 'true' }),
    React.createElement('div', { className: 'relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in-up' },
      React.createElement('div', { className: 'sticky top-0 bg-white dark:bg-slate-800 px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between rounded-t-2xl z-10' },
        React.createElement('div', null,
          React.createElement('h2', { id: 'modal-title', className: 'text-base font-semibold text-slate-800 dark:text-slate-100' }, 'Leave Request Details'),
          React.createElement('p', { className: 'text-xs text-slate-400 dark:text-slate-500 mt-0.5' }, leave.id)
        ),
        React.createElement('button', { onClick: onClose, className: 'p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 smooth-transition', 'aria-label': 'Close modal' },
          React.createElement(Icon, { name: 'X', size: 18 })
        )
      ),
      React.createElement('div', { className: 'px-5 py-4 space-y-4' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, leave.type),
          React.createElement(StatusBadge, { status: leave.status, size: 'lg' })
        ),
        React.createElement('div', { className: 'accent-line' }),
        React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
          [
            ['Start Date', formatDate(leave.startDate)],
            ['End Date', formatDate(leave.endDate)],
            ['Duration', `${leave.days} day${leave.days > 1 ? 's' : ''}`],
            ['Applied On', formatDate(leave.appliedDate)],
          ].map(([k, v]) =>
            React.createElement('div', { key: k, className: 'bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3' },
              React.createElement('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mb-1' }, k),
              React.createElement('p', { className: 'text-sm font-semibold text-slate-800 dark:text-slate-200' }, v)
            )
          )
        ),
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('p', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Reason for Leave'),
          React.createElement('div', { className: 'bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3' },
            React.createElement('p', { className: 'text-sm text-slate-600 dark:text-slate-400 leading-relaxed' }, leave.reason)
          )
        ),
        leave.facultyRemark && React.createElement('div', { className: 'space-y-2' },
          React.createElement('p', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5' },
            React.createElement(Icon, { name: 'MessageCircle', size: 14 }),
            'Faculty Remark'
          ),
          React.createElement('div', { className: cn('rounded-xl p-3 border', leave.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : leave.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700') },
            React.createElement('p', { className: 'text-sm leading-relaxed text-slate-700 dark:text-slate-300' }, leave.facultyRemark)
          )
        ),
        React.createElement(AIPredictionCard, { probability: leave.aiPrediction, explanation: leave.aiExplanation, compact: true })
      )
    )
  );
}
window.LeaveDetailModal = LeaveDetailModal;

console.log('[AutoLeave AI] Components library loaded.');
