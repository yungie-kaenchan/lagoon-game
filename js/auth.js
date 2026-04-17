// ── Authentication Module ──
import {
  auth, db, secondaryAuth,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
  doc, getDoc, setDoc, serverTimestamp
} from './firebase-config.js';

const EMAIL_DOMAIN = '@lagoon.local';

function usernameToEmail(username) {
  if (username.includes('@')) return username;
  return username.toLowerCase().trim() + EMAIL_DOMAIN;
}

export function emailToUsername(email) {
  return email.replace(EMAIL_DOMAIN, '');
}

// Login with username + password
export async function login(username, password) {
  const email = usernameToEmail(username);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) {
    throw new Error('User profile not found. Contact your teacher.');
  }
  return { uid: cred.user.uid, ...userDoc.data() };
}

// Logout
export async function logout() {
  await signOut(auth);
  window.location.href = getBasePath() + '/login.html';
}

// Create a student account (called by teacher)
export async function createStudentAccount(username, password, displayName, classGroup = '', avatarEmoji = '🐠', teacherUid = null) {
  const email = usernameToEmail(username);

  // Use secondary auth so the teacher stays logged in
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  await signOut(secondaryAuth);

  const userData = {
    uid: cred.user.uid,
    username: username.toLowerCase().trim(),
    email: email,
    role: 'student',
    displayName: displayName || username,
    avatarEmoji: avatarEmoji,
    classGroup: classGroup,
    createdAt: serverTimestamp(),
    createdBy: teacherUid,
    isActive: true
  };

  await setDoc(doc(db, 'users', cred.user.uid), userData);
  return { uid: cred.user.uid, ...userData };
}

// Create a teacher account (called by existing teacher)
export async function createTeacherAccount(username, password, displayName) {
  const email = usernameToEmail(username);
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  await signOut(secondaryAuth);

  const userData = {
    uid: cred.user.uid,
    username: username.toLowerCase().trim(),
    email: email,
    role: 'teacher',
    displayName: displayName || username,
    avatarEmoji: '🌟',
    classGroup: '',
    createdAt: serverTimestamp(),
    createdBy: null,
    isActive: true
  };

  await setDoc(doc(db, 'users', cred.user.uid), userData);
  return { uid: cred.user.uid, ...userData };
}

// Get current user data from Firestore
export async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      unsub();
      if (!firebaseUser) { resolve(null); return; }
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) { resolve(null); return; }
        resolve({ uid: firebaseUser.uid, ...userDoc.data() });
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Auth guard - redirect if not logged in or wrong role
export async function requireAuth(allowedRole = null) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = getBasePath() + '/login.html';
    return null;
  }
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'teacher') {
      window.location.href = getBasePath() + '/teacher/dashboard.html';
    } else {
      window.location.href = getBasePath() + '/student/dashboard.html';
    }
    return null;
  }

  // Set up global logout function
  window._logout = logout;
  return user;
}

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/student/') || path.includes('/teacher/')) {
    return '..';
  }
  return '.';
}
