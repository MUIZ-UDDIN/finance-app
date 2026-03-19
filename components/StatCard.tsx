"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: "green" | "red" | "blue" | "purple";
}

const colorMap = {
  green: {
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  red: {
    icon: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
    text: "text-red-700 dark:text-red-400",
  },
  blue: {
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    text: "text-blue-700 dark:text-blue-400",
  },
  purple: {
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
    text: "text-purple-700 dark:text-purple-400",
  },
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-xl sm:text-2xl font-bold mt-1 truncate ${colors.text}`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}
