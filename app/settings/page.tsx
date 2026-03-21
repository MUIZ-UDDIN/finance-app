"use client";

import { useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useCurrency, CURRENCIES } from "@/lib/CurrencyContext";
import { getTransactions, saveTransactions } from "@/lib/store";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [showConfirm, setShowConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    saveTransactions([]);
    setShowConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const handleExportAll = () => {
    const txns = getTransactions();
    const json = JSON.stringify(txns, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          const existing = getTransactions();
          saveTransactions([...data, ...existing]);
          window.location.reload();
        }
      } catch {
        alert("Invalid file format. Please upload a valid JSON backup.");
      }
    };
    reader.readAsText(file);
  };

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your preferences</p>
      </div>

      {cleared && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 sm:px-5 py-3 sm:py-4 rounded-xl">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm sm:text-base">All data cleared successfully!</p>
        </div>
      )}

      <div className="card space-y-6">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Appearance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose your preferred theme</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Currency</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select your preferred currency for display</p>
          <select
            value={currency.code}
            onChange={(e) => {
              const selected = CURRENCIES.find((c) => c.code === e.target.value);
              if (selected) setCurrency(selected);
            }}
            className="select-field"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Data Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Export, import, or clear your data</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportAll}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Backup (JSON)
            </button>
            <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer">
              <Download className="w-4 h-4 rotate-180" />
              Import Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <div>
          <h2 className="font-semibold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This action cannot be undone</p>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Are you sure? All transactions will be permanently deleted.</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleClearData} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    Yes, Delete All
                  </button>
                  <button onClick={() => setShowConfirm(false)} className="btn-secondary text-sm py-2">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
