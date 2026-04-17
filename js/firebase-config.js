// ── Firebase Configuration ──
// Replace the placeholder values below with your Firebase project credentials.
// Get these from: https://console.firebase.google.com → Project Settings → General → Your apps

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword as fbUpdatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoirRIeANVGi1zKioY6WMtvEs_9hdnbv8",
  authDomain: "lagoon-project-d0c77.firebaseapp.com",
  projectId: "lagoon-project-d0c77",
  storageBucket: "lagoon-project-d0c77.firebasestorage.app",
  messagingSenderId: "108520528284",
  appId: "1:108520528284:web:471b0a3b74af1922801059"
};

// Primary app instance
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Secondary app for creating accounts without signing out current user
const secondaryApp = initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondaryApp);

// Re-export Firestore utilities
export {
  collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp, writeBatch,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
  fbUpdatePassword
};
