"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }
    // Handle redirect result (if user was redirected for Google sign-in)
    getRedirectResult(firebaseAuth).catch(() => {});
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) { setError("Firebase not configured."); return; }
      try {
        await signInWithPopup(firebaseAuth, googleProvider);
      } catch (popupError: unknown) {
        const code = popupError && typeof popupError === "object" && "code" in popupError
          ? (popupError as { code: string }).code : "";
        if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
          await signInWithRedirect(firebaseAuth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (e: unknown) {
      console.error("Google Sign-In Error:", e);
      setError(getErrorMessage(e));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) { setError("Firebase not configured."); return; }
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) { setError("Firebase not configured."); return; }
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(result.user, { displayName: name });
      setUser({ ...result.user, displayName: name });
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  const logout = async () => {
    try {
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) return;
      await signOut(firebaseAuth);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) { setError("Firebase not configured."); return; }
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, resetPassword, error, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function getErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "code" in e) {
    const code = (e as { code: string }).code;
    switch (code) {
      case "auth/user-not-found": return "No account found with this email.";
      case "auth/wrong-password": return "Incorrect password. Please try again.";
      case "auth/email-already-in-use": return "An account with this email already exists.";
      case "auth/weak-password": return "Password must be at least 6 characters.";
      case "auth/invalid-email": return "Please enter a valid email address.";
      case "auth/popup-closed-by-user": return "Sign-in popup was closed. Please try again.";
      case "auth/network-request-failed": return "Network error. Check your connection.";
      case "auth/too-many-requests": return "Too many attempts. Please try again later.";
      case "auth/invalid-credential": return "Invalid email or password.";
      default: return "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
