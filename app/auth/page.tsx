"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, TrendingUp } from "lucide-react";

type Mode = "signin" | "signup" | "reset";

export default function AuthPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, error, clearError } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();

    if (mode === "signin") {
      await signInWithEmail(email, password);
    } else if (mode === "signup") {
      await signUpWithEmail(email, password, name);
    } else if (mode === "reset") {
      await resetPassword(email);
      setResetSent(true);
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    clearError();
    await signInWithGoogle();
    setSubmitting(false);
  };

  const switchMode = (m: Mode) => {
    clearError();
    setResetSent(false);
    setMode(m);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FinanceAI</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Smart Money Manager</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {mode === "signin"
              ? "Sign in to access your finances"
              : mode === "signup"
              ? "Start tracking your money for free"
              : "Enter your email to receive a reset link"}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Reset sent */}
          {resetSent && (
            <div className="mb-4 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl">
              Password reset email sent! Check your inbox.
            </div>
          )}

          {/* Google Sign In */}
          {mode !== "reset" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="input-field pl-10"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="input-field pl-10"
                required
              />
            </div>

            {mode !== "reset" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Password (min. 6 characters)" : "Password"}
                  className="input-field pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {mode === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : mode === "signup"
                ? "Create Account"
                : "Send Reset Link"}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  Sign up free
                </button>
              </>
            ) : mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button onClick={() => switchMode("signin")} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <button onClick={() => switchMode("signin")} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
