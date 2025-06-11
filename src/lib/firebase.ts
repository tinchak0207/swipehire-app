
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Added setPersistence and browserLocalPersistence
import { getFirestore } from "firebase/firestore"; // Added Firestore
import { getAnalytics } from "firebase/analytics"; // Added getAnalytics

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Replace these with your actual Firebase project configuration values!
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD7QbZ5y-WAPK6EI5dwyun2E0DE6HUFI-Y",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "swipehire-3bscz.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "swipehire-3bscz",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "swipehire-3bscz.firebasestorage.app", // Updated to user-provided value
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "651970541195",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:651970541195:web:02b8393984dc48972e068e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KZMH3C52P7" 
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
let analytics; // Declare analytics variable

if (typeof window !== 'undefined') {
  // Initialize Analytics only on the client side
  analytics = getAnalytics(app);
}


// Set authentication persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Persistence set to local. User should persist across browser sessions/tabs.
    console.log("Firebase auth persistence set to browserLocalPersistence.");
  })
  .catch((error) => {
    // Handle errors here.
    console.error("Error setting Firebase auth persistence:", error);
  });

// const storage = getStorage(app); // Example if you use Storage

export { app, auth, db, analytics /*, storage */ };

