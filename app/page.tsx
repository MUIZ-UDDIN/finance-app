"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
} from "lucide-react";
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
import Link from "next/link";
import StatCard from "@/components/StatCard";
import TransactionItem from "@/components/TransactionItem";
import AdBanner from "@/components/AdBanner";
import { useCurrency } from "@/lib/CurrencyContext";
import { useTheme } from "@/lib/ThemeContext";
import {
  getMonthlyData,
  getTotalBalance,
  getRecentTransactions,
  getLast6MonthsData,
  getCategorySummary,
  formatMonth,
  deleteTransaction,
} from "@/lib/store";
import { Transaction, MonthlyBudget, CategorySummary } from "@/lib/types";

const PIE_COLORS = [
  "#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#64748b",
];

export default function Dashboard() {
  const { formatAmount } = useCurrency();
  const { resolvedTheme } = useTheme();
  const [monthlyData, setMonthlyData] = useState<MonthlyBudget>({
    month: "",
    income: 0,
    expenses: 0,
    balance: 0,
  });
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<MonthlyBudget[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);

  const loadData = () => {
    setMonthlyData(getMonthlyData());
    setTotalBalance(getTotalBalance());
    setRecentTxns(getRecentTransactions(5));
    setChartData(getLast6MonthsData());
    setCategoryData(getCategorySummary());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    loadData();
  };

  const savingsRate =
    monthlyData.income > 0
      ? ((monthlyData.balance / monthlyData.income) * 100).toFixed(1)
      : "0";

  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const tickColor = isDark ? "#64748b" : "#94a3b8";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Your financial overview at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Balance"
          value={formatAmount(totalBalance)}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="Monthly Income"
          value={formatAmount(monthlyData.income)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatAmount(monthlyData.expenses)}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          icon={DollarSign}
          color="purple"
          trend={Number(savingsRate) >= 20 ? "Healthy" : "Needs attention"}
          trendUp={Number(savingsRate) >= 20}
        />
      </div>

      <AdBanner adSlot="1234567890" adFormat="horizontal" className="my-2" />

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

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
          <Link
            href="/transactions"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentTxns.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentTxns.map((txn) => (
              <TransactionItem
                key={txn.id}
                transaction={txn}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500">
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm mt-1">
              Start by adding your{" "}
              <Link href="/income" className="text-primary-600 dark:text-primary-400 underline">
                monthly income
              </Link>{" "}
              or an{" "}
              <Link href="/expenses" className="text-primary-600 dark:text-primary-400 underline">
                expense
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
