import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase Project Configuration
// Database URL explicitly provided: https://aluminium-erp-5d0e9-default-rtdb.firebaseio.com
const firebaseConfig = {
  apiKey: "AIzaSyAc5UIcWiN_xBfWSVpl0bOo-PczRSU5VeM",
  authDomain: "aluminium-erp-5d0e9.firebaseapp.com",
  databaseURL: "https://aluminium-erp-5d0e9-default-rtdb.firebaseio.com",
  projectId: "aluminium-erp-5d0e9",
  storageBucket: "aluminium-erp-5d0e9.firebasestorage.app",
  messagingSenderId: "9946754612824",
  appId: "1:946754612824:web:05315d99b64f0fca7fe42d"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const database = getDatabase(app, "https://aluminium-erp-5d0e9-default-rtdb.firebaseio.com");
export const auth = getAuth(app);

export default app;
