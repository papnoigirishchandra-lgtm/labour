import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth } from "./firebase.config";

// Set persistence to LOCAL
setPersistence(firebaseAuth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email: string,
  password: string,
  fullName?: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    // Update user profile with full name
    if (fullName) {
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });
    }

    return {
      success: true,
      user: userCredential.user,
      message: "Account created successfully",
    };
  } catch (error: unknown) {
    const errorMessage = mapFirebaseError(error);
    return {
      success: false,
      error: errorMessage,
      code: (error as Record<string, unknown>).code,
    };
  }
};

/**
 * Sign in with email and password
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    return {
      success: true,
      user: userCredential.user,
      message: "Logged in successfully",
    };
  } catch (error: unknown) {
    const errorMessage = mapFirebaseError(error);
    return {
      success: false,
      error: errorMessage,
      code: (error as Record<string, unknown>).code,
    };
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  try {
    await signOut(firebaseAuth);
    return { success: true, message: "Logged out successfully" };
  } catch (error: unknown) {
    const errorMessage = mapFirebaseError(error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
    return {
      success: true,
      message: "Password reset email sent. Check your inbox.",
    };
  } catch (error: unknown) {
    const errorMessage = mapFirebaseError(error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return firebaseAuth.currentUser;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(firebaseAuth, callback);
};

/**
 * Sign in with Google
 */
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Request additional scopes if needed
    provider.addScope("profile");
    provider.addScope("email");

    const result = await signInWithPopup(firebaseAuth, provider);

    return {
      success: true,
      user: result.user,
      message: "Logged in with Google successfully",
    };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    // Handle popup blocked or dismissed
    if (err.code === "auth/popup-blocked") {
      return {
        success: false,
        error: "Popup was blocked. Please allow popups and try again.",
        code: err.code,
      };
    }
    if (err.code === "auth/popup-closed-by-user") {
      return {
        success: false,
        error: "Sign in cancelled. Please try again.",
        code: err.code,
      };
    }

    const errorMessage = mapFirebaseError(error);
    return {
      success: false,
      error: errorMessage,
      code: err.code,
    };
  }
};

/**
 * Map Firebase error codes to user-friendly messages
 */
export const mapFirebaseError = (error: unknown): string => {
  const err = error as Record<string, unknown>;
  const code = String(err.code || "");

  const errorMap: Record<string, string> = {
    "auth/user-not-found": "Email not found. Please register first.",
    "auth/wrong-password": "Invalid password. Please try again.",
    "auth/invalid-email": "Invalid email address.",
    "auth/user-disabled": "Your account has been disabled.",
    "auth/email-already-in-use":
      "Email is already registered. Please login instead.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/operation-not-allowed": "Sign-in method is not enabled.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests":
      "Too many failed login attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/internal-error": "An internal error occurred. Please try again.",
    "auth/popup-blocked": "Popup was blocked. Please allow popups.",
    "auth/popup-closed-by-user": "Sign in cancelled.",
    "auth/cancelled-popup-request": "Popup request cancelled.",
    "auth/account-exists-with-different-credential":
      "An account exists with this email. Please login with that method.",
  };

  return errorMap[code] || (String(err.message) || "An error occurred");
};

export default {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  getCurrentUser,
  onAuthChange,
  mapFirebaseError,
};
