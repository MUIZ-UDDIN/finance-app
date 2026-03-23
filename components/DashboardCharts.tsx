"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useCurrency } from "@/lib/CurrencyContext";
import { useTheme } from "@/lib/ThemeContext";
import { formatMonth } from "@/lib/store";
import { MonthlyBudget, CategorySummary } from "@/lib/types";

const PIE_COLORS = [
  "#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#64748b",
];

interface DashboardChartsProps {
  chartData: MonthlyBudget[];
  categoryData: CategorySummary[];
}

export default function DashboardCharts({ chartData, categoryData }: DashboardChartsProps) {
  const { formatAmount } = useCurrency();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const tickColor = isDark ? "#64748b" : "#94a3b8";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 card">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Income vs Expenses (Last 6 Months)
        </h2>
        <div className="h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="month"
                tickFormatter={(v) => formatMonth(v).split(" ")[0]}
                tick={{ fontSize: 11, fill: tickColor }}
              />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} />
              <Tooltip
                formatter={(value: number) => formatAmount(value)}
                labelFormatter={(label) => formatMonth(label)}
                contentStyle={{
                  borderRadius: "12px",
                  border: `1px solid ${tooltipBorder}`,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  backgroundColor: tooltipBg,
                  color: isDark ? "#e2e8f0" : "#1e293b",
                }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expense Categories
        </h2>
        {categoryData.length > 0 ? (
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatAmount(value)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: `1px solid ${tooltipBorder}`,
                    backgroundColor: tooltipBg,
                    color: isDark ? "#e2e8f0" : "#1e293b",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 sm:h-72 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            No expenses yet this month
          </div>
        )}
      </div>
    </div>
  );
}
