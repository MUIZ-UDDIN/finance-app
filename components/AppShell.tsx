"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "@/lib/ThemeContext";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import { AuthProvider } from "@/lib/AuthContext";
import { restoreIfNeeded } from "@/lib/backup";
import { processRecurringTransactions } from "@/lib/store";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import AuthGuard from "./AuthGuard";

function AppContent({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  useEffect(() => {
    restoreIfNeeded().then((wasRestored) => {
      if (wasRestored) {
        setRestored(true);
        setTimeout(() => setRestored(false), 4000);
      }
      // Process any due recurring transactions
      try { processRecurringTransactions(); } catch {}
      setReady(true);
    }).catch(() => {
      setReady(true);
    });
  }, []);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        {restored && (
          <div className="mb-4 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-sm animate-slide-up">
            <span>✓</span>
            <span>Your data was automatically restored from backup.</span>
          </div>
        )}
        {ready ? children : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
