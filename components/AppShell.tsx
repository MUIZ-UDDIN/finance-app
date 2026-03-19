"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/lib/ThemeContext";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <Sidebar />
        <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
