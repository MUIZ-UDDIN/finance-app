"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import TransactionItem from "@/components/TransactionItem";
import AdBanner from "@/components/AdBanner";
import { useCurrency } from "@/lib/CurrencyContext";
import {
  getMonthlyData,
  getTotalBalance,
  getRecentTransactions,
  getLast6MonthsData,
  getCategorySummary,
  deleteTransaction,
} from "@/lib/store";
import { Transaction, MonthlyBudget, CategorySummary } from "@/lib/types";

const DashboardCharts = dynamic<{ chartData: MonthlyBudget[]; categoryData: CategorySummary[] }>(
  () => import("@/components/DashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 card"><div className="h-56 sm:h-72 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" /></div>
        <div className="card"><div className="h-56 sm:h-72 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" /></div>
      </div>
    ),
  }
);

export default function Dashboard() {
  const { formatAmount } = useCurrency();
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

      <DashboardCharts chartData={chartData} categoryData={categoryData} />

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
