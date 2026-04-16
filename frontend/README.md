# AutoLeave AI – Smart Leave Intimation System

> A modern, polished, fully responsive student leave management web app for colleges. Built as a frontend-complete, production-ready college project demo.

---

## 🎯 Project Goal

AutoLeave AI digitizes the entire student leave process — from application to real-time tracking and AI-powered approval predictions. The app is designed to feel like a premium SaaS dashboard product suitable for a final-year college project demo.

---

## ✅ Completed Features

### Pages & Navigation
- **Login Page** – Clean two-column layout with branding panel, form validation, show/hide password, demo credentials autofill, error feedback
- **Student Dashboard** – Summary stats cards, current leave status, recent notifications, AI prediction card, attendance widget, quick actions
- **Leave Application** – Multi-section form with student info pre-fill, auto-calculate duration, inline validation, AI prediction live preview, success state
- **Leave History** – Search & filter (by status, type), card view and table view toggle, leave detail modal, mini stats, color-coded badges
- **Notifications** – Unread/read states, filter tabs, mark all read, notification type icons, relative timestamps, Firebase placeholder banner
- **Profile & Settings** – Student details grid, dark mode toggle, notification preferences, Firebase integration status, save preferences

### Shared Components
- `AppLayout` – Responsive two-column layout (sidebar + content)
- `Sidebar` – Desktop sticky navigation with active states, student mini-profile, dark mode toggle, logout
- `MobileHeader` – Sticky top bar for mobile with hamburger and notification bell
- `MobileBottomNav` – Thumb-friendly bottom navigation for mobile
- `DesktopHeader` – Breadcrumb header with date, user avatar, notification bell
- `StatCard` – Animated summary cards with icons and trend indicators
- `AIPredictionCard` – SVG ring progress animation, confidence label
- `AttendanceWidget` – Circular ring chart for attendance with recommendation message
- `StatusBadge` – Color-coded status pills (Approved, Pending, Rejected, Under Review)
- `NotificationItem` – Unread indicator, relative time, type-specific icon
- `LeaveCard` – Card layout for leave history with AI prediction and remark preview
- `LeaveDetailModal` – Full detail modal with ESC key close, status display, AI prediction
- `ToastProvider` / `ToastItem` – Slide-in toast system (success, error, warning, info)
- `AlertBanner` – Inline alert banners with dismiss
- `Button` – Variants (primary, secondary, ghost, danger, success), loading state
- `InputField` / `SelectField` / `TextareaField` – Validated form fields with error states
- `Spinner` / `LoadingOverlay` – Loading indicators
- `SkeletonCard` / `SkeletonTable` / `SkeletonLine` – Shimmer skeleton loaders
- `EmptyState` / `ErrorState` – Beautiful empty and error fallback UI
- `Icon` – Custom SVG icon component (no external dependency)

### Design System
- Teal/blue accent color palette
- Green = Approved, Amber = Pending, Red = Rejected
- Soft shadows, rounded cards, clean white/slate surfaces
- Dark mode support (toggle in sidebar, profile, mobile header)
- Responsive: mobile-first → tablet → laptop → desktop
- CSS animations: shimmer, slide-in, fade-in, pulse, count-up
- Hover lift effects, button press effects, smooth transitions

### AI Prediction
- Live prediction updates as form is filled
- Probability ring visualization
- Factor breakdown (attendance, type, duration, history)
- Confidence level label (High, Moderate, Low)

### Data & Services (Mock/Placeholder)
- `MockData` – 5 realistic leave requests, 7 notifications, attendance history, student profile
- `AuthService` – login, logout, getSession (localStorage)
- `DashboardService` – getStudentDashboard
- `LeaveService` – submitLeaveApplication, getLeaveHistory, cancelLeave
- `PredictionService` – getPrediction (factor-based algorithm)
- `NotificationService` – getNotifications, markAsRead, markAllAsRead, getUnreadCount
- `FirebaseAuth` – signIn, signOut, onAuthStateChanged (placeholder)
- `FirebaseFirestore` – subscribeToLeaveRequests, subscribeToNotifications (placeholder)
- `FirebaseMessaging` – requestPermission, onForegroundMessage (placeholder)

---

## 📂 Project Structure

```
index.html                  ← Main HTML entry point (Tailwind, React CDN, Babel)
js/
  mockData.js               ← Seed data, status configs, leave types
  firebase.js               ← Firebase integration placeholders
  services.js               ← API service layer (mock + real-API-ready)
  components.js             ← All reusable UI components
  pages.js                  ← Login, Dashboard, Apply, History, Notifications, Profile
  app.js                    ← Root App component, routing, dark mode, mount
```

---

## 🔗 Navigation & Routes (Client-side)

All navigation is state-based (no URL routing). Pages:

| State Key       | Page                    |
|-----------------|-------------------------|
| `login`         | Login Page              |
| `dashboard`     | Student Dashboard       |
| `apply`         | Leave Application Form  |
| `history`       | Leave History           |
| `notifications` | Notifications Center    |
| `profile`       | Profile & Settings      |

---

## 🛠️ Tech Stack

| Technology       | Purpose                          |
|------------------|----------------------------------|
| React 18         | UI framework (CDN, no bundler)   |
| Tailwind CSS     | Utility-first styling (CDN)      |
| Babel Standalone | JSX transpilation in browser     |
| Chart.js (CDN)   | Statistics charts (placeholder)  |
| Custom SVG Icons | Built-in icon system             |

---

## 🔌 Backend & Firebase Integration

### To connect a real backend:
1. Open `js/services.js`
2. Set `BASE_URL` to your API endpoint
3. Replace mock `delay()` implementations with real `fetch()` calls
4. Add JWT token retrieval from localStorage

### To connect Firebase:
1. Open `js/firebase.js`
2. Replace `FirebaseConfig` with your real Firebase project config
3. Install Firebase SDK and uncomment the real implementation lines
4. The subscription structure is already set up for Firestore real-time listeners

---

## 🎨 Demo Credentials

| Field      | Value                          |
|------------|-------------------------------|
| Email      | `arjun.mehta@college.edu`     |
| Password   | `demo1234` (any 4+ chars)     |

Click **"Use demo credentials"** on the login page to autofill.

---

## 📊 Demo Data Summary

- **Student:** Arjun Mehta, 21CS1047, CSE 3rd Year, 87% attendance
- **Leave Requests:** 5 (2 approved, 2 pending, 1 rejected)
- **AI Predictions:** 91%, 82%, 78%, 64%, 45%
- **Notifications:** 7 (3 unread)
- **Faculty Adviser:** Dr. Priya Ramachandran

---

## 🚀 To Deploy

Go to the **Publish tab** to deploy this project as a live website with one click.

---

## 🔮 Recommended Next Steps

1. **Connect real backend API** – Replace service methods in `services.js`
2. **Add Firebase** – Replace placeholders in `firebase.js` with real SDK
3. **URL-based routing** – Add React Router or hash-based routing for sharable URLs
4. **Faculty dashboard module** – Build the approver-side interface
5. **Statistics chart** – Implement Chart.js for attendance trend visualization
6. **File upload** – Implement document attachment upload with Firebase Storage
7. **PWA** – Add service worker and manifest for installable app
8. **Export** – Add PDF export for leave records
9. **Email integration** – Trigger email notifications via backend
10. **Production build** – Migrate to Create React App or Vite for production deployment

---

*AutoLeave AI v2.0 – Built for BCA/B.Tech Final Year College Project Demo*
