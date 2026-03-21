"use client";

import { useState } from "react";
import { User, Mail, Lock, CheckCircle, Camera } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameSuccess, setNameSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [error, setError] = useState("");

  const isEmailUser = user?.providerData.some(p => p.providerId === "password");

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user || !displayName.trim()) return;
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch {
      setError("Failed to update name. Please try again.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user || !isEmailUser) return;
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPassSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccess(false), 3000);
    } catch {
      setError("Current password is incorrect or session expired.");
    }
  };

  const createdAt = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  const lastSignIn = user?.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "N/A";

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your account</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            {user?.photoURL ? (
              <Image src={user.photoURL} alt={user.displayName || "User"} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {(user?.displayName || user?.email || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.displayName || user?.email?.split("@")[0]}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              {user?.providerData.map(p => (
                <span key={p.providerId} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg capitalize">
                  {p.providerId === "password" ? "Email" : p.providerId.replace(".com", "")}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Member since</span>
            <span className="text-gray-900 dark:text-white font-medium">{createdAt}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Last sign in</span>
            <span className="text-gray-900 dark:text-white font-medium">{lastSignIn}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">User ID</span>
            <span className="text-gray-400 dark:text-gray-500 font-mono text-xs truncate ml-4 max-w-[200px]">{user?.uid}</span>
          </div>
        </div>
      </div>

      {/* Update Name */}
      <form onSubmit={handleUpdateName} className="card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Display Name</h2>
        </div>
        {nameSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" /> Name updated successfully!
          </div>
        )}
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="input-field" required />
        <button type="submit" className="btn-primary text-sm py-2 px-6">Update Name</button>
      </form>

      {/* Change Password - Only for email users */}
      {isEmailUser && (
        <form onSubmit={handleChangePassword} className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>
          {passSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" /> Password changed successfully!
            </div>
          )}
          <div className="space-y-3">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="input-field" required />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min. 6 characters)" className="input-field" required minLength={6} />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="input-field" required minLength={6} />
          </div>
          <button type="submit" className="btn-primary text-sm py-2 px-6">Change Password</button>
        </form>
      )}
    </div>
  );
}
