"use client";

import { Shield, Zap, Globe, Smartphone, PiggyBank, Brain, Target, BarChart3 } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Brain, title: "AI-Powered Insights", desc: "Get smart analysis of your spending patterns and personalized tips." },
  { icon: PiggyBank, title: "Savings Goals", desc: "Set targets and track progress towards your financial dreams." },
  { icon: Target, title: "Budget Goals", desc: "Set monthly spending limits per category with visual progress." },
  { icon: BarChart3, title: "Financial Reports", desc: "Detailed monthly and yearly summaries with CSV export." },
  { icon: Smartphone, title: "Works Offline", desc: "Install as a PWA and use it anywhere, even without internet." },
  { icon: Shield, title: "Private & Secure", desc: "Your data stays on your device. No tracking, no data selling." },
  { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed on both mobile and desktop devices." },
  { icon: Globe, title: "Multi-Currency", desc: "Support for multiple currencies with instant conversion display." },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">About FinanceAI</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Your smart personal finance companion</p>
      </div>

      {/* Hero */}
      <div className="card bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 border-primary-100 dark:border-primary-900/50">
        <div className="text-center py-4 sm:py-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl sm:text-3xl font-bold">F</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">FinanceAI</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
            FinanceAI is a free, AI-powered personal finance manager designed to help you take control of your money. 
            Track income and expenses, set budgets, manage bills, and reach your savings goals — all from one beautiful app.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Version 1.0.0</p>
        </div>
      </div>

      {/* Mission */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Our Mission</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          We believe everyone deserves access to powerful financial tools. FinanceAI was built to simplify personal 
          finance management — no complicated spreadsheets, no expensive subscriptions. Just a clean, fast, and 
          intelligent app that works on any device and respects your privacy.
        </p>
      </div>

      {/* Features */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Privacy First</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          Your financial data is stored locally on your device. We do not collect, sell, or share your personal 
          financial information with any third party. Authentication is handled securely through Firebase, and 
          your transaction data never leaves your browser.
        </p>
      </div>

      {/* Links */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/contact" className="btn-primary text-sm py-2 px-5 text-center">Contact Us</Link>
          <Link href="/settings" className="btn-secondary text-sm py-2 px-5 text-center">Settings</Link>
          <Link href="/" className="btn-secondary text-sm py-2 px-5 text-center">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
