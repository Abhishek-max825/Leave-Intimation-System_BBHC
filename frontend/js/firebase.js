// ============================================================
// AutoLeave AI – Firebase Integration Placeholder
// ============================================================
// This file provides a clean placeholder architecture for Firebase
// integration. Connect real Firebase SDK when backend is ready.
// ============================================================

window.FirebaseConfig = {
  // TODO: Replace with real Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "autoleave-ai.firebaseapp.com",
  projectId: "autoleave-ai",
  storageBucket: "autoleave-ai.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

// ============================================================
// Firebase Auth Placeholder
// ============================================================
window.FirebaseAuth = {
  /**
   * Sign in with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object}>}
   */
  signInWithEmailAndPassword: async (email, password) => {
    // TODO: Replace with:
    // import { signInWithEmailAndPassword } from "firebase/auth";
    // return signInWithEmailAndPassword(auth, email, password);
    console.log('[Firebase Auth] signInWithEmailAndPassword called (placeholder)');
    return { user: { uid: 'mock-uid', email } };
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    // TODO: Replace with: import { signOut } from "firebase/auth"; return signOut(auth);
    console.log('[Firebase Auth] signOut called (placeholder)');
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    // TODO: Replace with: auth.currentUser
    return null;
  },

  /**
   * Subscribe to auth state changes
   * @param {function} callback
   * @returns {function} unsubscribe
   */
  onAuthStateChanged: (callback) => {
    // TODO: Replace with: onAuthStateChanged(auth, callback)
    console.log('[Firebase Auth] onAuthStateChanged listener registered (placeholder)');
    return () => {}; // unsubscribe no-op
  },
};

// ============================================================
// Firebase Firestore Placeholder
// ============================================================
window.FirebaseFirestore = {
  /**
   * Listen to a student's leave requests in real-time
   * @param {string} studentId
   * @param {function} onUpdate - callback with array of leave requests
   * @returns {function} unsubscribe
   */
  subscribeToLeaveRequests: (studentId, onUpdate) => {
    // TODO: Replace with Firestore real-time listener:
    // const q = query(collection(db, 'leaveRequests'), where('studentId', '==', studentId));
    // return onSnapshot(q, (snapshot) => {
    //   const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //   onUpdate(data);
    // });
    console.log('[Firestore] Subscribed to leave requests for student:', studentId);
    return () => console.log('[Firestore] Unsubscribed from leave requests');
  },

  /**
   * Listen to real-time notifications for a student
   * @param {string} studentId
   * @param {function} onUpdate
   * @returns {function} unsubscribe
   */
  subscribeToNotifications: (studentId, onUpdate) => {
    // TODO: Replace with Firestore real-time listener:
    // const q = query(collection(db, 'notifications'), where('studentId', '==', studentId), orderBy('createdAt', 'desc'));
    // return onSnapshot(q, (snapshot) => {
    //   const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //   onUpdate(data);
    // });
    console.log('[Firestore] Subscribed to notifications for student:', studentId);
    return () => console.log('[Firestore] Unsubscribed from notifications');
  },

  /**
   * Get a single leave request by ID
   * @param {string} leaveId
   */
  getLeaveRequest: async (leaveId) => {
    // TODO: Replace with:
    // const docRef = doc(db, 'leaveRequests', leaveId);
    // const docSnap = await getDoc(docRef);
    // return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    console.log('[Firestore] getLeaveRequest called for:', leaveId);
    return null;
  },

  /**
   * Update notification read status
   * @param {string} notificationId
   */
  markNotificationRead: async (notificationId) => {
    // TODO: Replace with:
    // await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    console.log('[Firestore] markNotificationRead:', notificationId);
  },
};

// ============================================================
// Firebase Cloud Messaging Placeholder (Push Notifications)
// ============================================================
window.FirebaseMessaging = {
  /**
   * Request notification permission and get FCM token
   */
  requestPermissionAndGetToken: async () => {
    // TODO: Replace with:
    // const messaging = getMessaging(app);
    // const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
    // return token;
    console.log('[FCM] requestPermissionAndGetToken called (placeholder)');
    return 'mock-fcm-token';
  },

  /**
   * Listen to foreground messages
   * @param {function} onMessage
   */
  onForegroundMessage: (onMessage) => {
    // TODO: Replace with:
    // onMessage(messaging, (payload) => { onMessage(payload); });
    console.log('[FCM] onForegroundMessage listener registered (placeholder)');
  },
};

console.log('[AutoLeave AI] Firebase placeholders loaded. Connect real Firebase SDK to activate real-time features.');
