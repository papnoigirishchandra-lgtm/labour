import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBsiR-x4Br58i75OsXQLl8J7mRuxkpeI4g",
  authDomain: "labour-e010e.firebaseapp.com",
  projectId: "labour-e010e",
  storageBucket: "labour-e010e.firebasestorage.app",
  messagingSenderId: "621284314794",
  appId: "1:621284314794:web:f5d67d808e637e15ae8ad3",
  measurementId: "G-XFRKJ2SJH6",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Get Firebase Auth instance
export const firebaseAuth = getAuth(firebaseApp);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(firebaseApp);
}

export { analytics };
