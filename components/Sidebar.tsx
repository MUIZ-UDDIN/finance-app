"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  List,
  Brain,
  Wallet,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Settings,
  LogOut,
  Target,
  RefreshCw,
  Bell,
  FileText,
  CreditCard,
  PiggyBank,
  User,
  Info,
  Mail,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useCurrency, CURRENCIES } from "@/lib/CurrencyContext";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Add Income", icon: ArrowDownCircle },
  { href: "/expenses", label: "Add Expense", icon: ArrowUpCircle },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/budgets", label: "Budget Goals", icon: Target },
  { href: "/recurring", label: "Recurring", icon: RefreshCw },
  { href: "/bills", label: "Bills", icon: Bell },
  { href: "/accounts", label: "Accounts", icon: CreditCard },
  { href: "/savings", label: "Savings Goals", icon: PiggyBank },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/insights", label: "AI Insights", icon: Brain },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/contact", label: "Contact Us", icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { user, logout } = useAuth();
  const [showCurrency, setShowCurrency] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const themeIcons = { light: Sun, dark: Moon, system: Monitor };
  const nextTheme: Record<string, "light" | "dark" | "system"> = {
    light: "dark",
    dark: "system",
    system: "light",
  };

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg text-gray-900 dark:text-white truncate">FinanceAI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Smart Money Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-950 dark:text-primary-300"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary-600 dark:text-primary-400" : ""}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
        <div className="relative">
          <button
            onClick={() => setShowCurrency(!showCurrency)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <span>{currency.symbol} {currency.code}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCurrency ? "rotate-180" : ""}`} />
          </button>
          {showCurrency && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c); setShowCurrency(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    currency.code === c.code
                      ? "text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-950"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {c.symbol} {c.code} — {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setTheme(nextTheme[theme])}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            {(() => { const ThIcon = themeIcons[theme]; return <ThIcon className="w-4 h-4" />; })()}
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
          <span className="text-xs text-gray-400">{resolvedTheme === "dark" ? "Dark" : "Light"}</span>
        </button>

        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || "User"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                {(user.displayName || user.email || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {user.displayName || user.email?.split("@")[0]}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">FinanceAI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(nextTheme[theme])}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {resolvedTheme === "dark" ? (
              <Moon className="w-5 h-5 text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop always visible, mobile slide-in */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {sidebarContent}
      </aside>
    </>
  );
}
