"use client";

import { useState, useEffect } from "react";
import { FileText, Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";
import { getTransactions, getMonthlyData, getCategorySummary, EXPENSE_CATEGORIES } from "@/lib/store";

export default function ReportsPage() {
  const { formatAmount, currency } = useCurrency();
  const [period, setPeriod] = useState<"month" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const txns = getTransactions();
  const years = Array.from(new Set(txns.map(t => t.date.split("-")[0]))).sort().reverse();
  if (years.length === 0) years.push(String(new Date().getFullYear()));

  // Get data based on period
  const getFilteredData = () => {
    if (period === "month") {
      const monthly = getMonthlyData(selectedMonth);
      const categories = getCategorySummary(selectedMonth);
      const filtered = txns.filter(t => t.date.startsWith(selectedMonth));
      return { ...monthly, categories, transactions: filtered };
    } else {
      const filtered = txns.filter(t => t.date.startsWith(selectedYear));
      const income = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      const categoryMap: Record<string, { total: number; count: number }> = {};
      const expTxns = filtered.filter(t => t.type === "expense");
      const totalExp = expTxns.reduce((s, t) => s + t.amount, 0);
      expTxns.forEach(t => {
        if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, count: 0 };
        categoryMap[t.category].total += t.amount;
        categoryMap[t.category].count += 1;
      });
      const categories = Object.entries(categoryMap).map(([cat, d]) => ({
        category: cat, total: d.total, count: d.count, percentage: totalExp > 0 ? (d.total / totalExp) * 100 : 0,
      })).sort((a, b) => b.total - a.total);

      return { income, expenses, balance: income - expenses, categories, transactions: filtered };
    }
  };

  const data = getFilteredData();
  const savingsRate = data.income > 0 ? ((data.income - data.expenses) / data.income) * 100 : 0;
  const avgDailyExpense = period === "month"
    ? data.expenses / new Date(parseInt(selectedMonth.split("-")[0]), parseInt(selectedMonth.split("-")[1]), 0).getDate()
    : data.expenses / 365;

  // Monthly breakdown for yearly
  const getMonthlyBreakdown = () => {
    if (period !== "year") return [];
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const key = `${selectedYear}-${String(m).padStart(2, "0")}`;
      const monthData = getMonthlyData(key);
      if (monthData.income > 0 || monthData.expenses > 0) {
        months.push(monthData);
      }
    }
    return months;
  };

  const monthlyBreakdown = getMonthlyBreakdown();

  const handleExportCSV = () => {
    const filtered = data.transactions;
    if (filtered.length === 0) return;
    const headers = "Date,Type,Description,Category,Amount\n";
    const rows = filtered.map(t =>
      `${t.date},${t.type},${t.description.replace(/,/g, " ")},${t.category},${t.amount}`
    ).join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${period === "month" ? selectedMonth : selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periodLabel = period === "month"
    ? new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : selectedYear;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Detailed financial summaries</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Period Selector */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <button onClick={() => setPeriod("month")}
              className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-sm font-medium transition-all ${period === "month" ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
              Monthly
            </button>
            <button onClick={() => setPeriod("year")}
              className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-sm font-medium transition-all ${period === "year" ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
              Yearly
            </button>
          </div>
          {period === "month" ? (
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="input-field text-sm py-2 px-3" />
          ) : (
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="select-field text-sm py-2 px-3">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card text-center">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
          <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 break-all mt-1">{formatAmount(data.income)}</p>
        </div>
        <div className="card text-center">
          <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
          <p className="text-sm sm:text-base font-bold text-red-500 dark:text-red-400 break-all mt-1">{formatAmount(data.expenses)}</p>
        </div>
        <div className="card text-center">
          <Wallet className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Net Savings</p>
          <p className={`text-sm sm:text-base font-bold break-all mt-1 ${data.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400"}`}>{formatAmount(data.balance)}</p>
        </div>
        <div className="card text-center">
          <FileText className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</p>
          <p className={`text-sm sm:text-base font-bold mt-1 ${savingsRate >= 0 ? "text-purple-600 dark:text-purple-400" : "text-red-500 dark:text-red-400"}`}>{savingsRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Key Metrics — {periodLabel}</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.transactions.length}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Expense</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatAmount(avgDailyExpense)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Highest Category</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {data.categories.length > 0 ? (EXPENSE_CATEGORIES.find(c => c.value === data.categories[0].category)?.label || data.categories[0].category) : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Income Transactions</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.transactions.filter(t => t.type === "income").length}</span>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      {data.categories.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h2>
          <div className="space-y-3">
            {data.categories.map(cat => {
              const label = EXPENSE_CATEGORIES.find(c => c.value === cat.category)?.label || cat.category;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{label}</span>
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{formatAmount(cat.total)} ({cat.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(cat.percentage, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yearly Monthly Breakdown */}
      {period === "year" && monthlyBreakdown.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Breakdown</h2>
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-2 px-4 sm:px-6 font-medium text-gray-500 dark:text-gray-400">Month</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Income</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500 dark:text-gray-400">Expenses</th>
                  <th className="text-right py-2 px-4 sm:px-6 font-medium text-gray-500 dark:text-gray-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown.map(m => (
                  <tr key={m.month} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="py-2.5 px-4 sm:px-6 text-gray-900 dark:text-white font-medium">
                      {new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short" })}
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-600 dark:text-emerald-400">{formatAmount(m.income)}</td>
                    <td className="py-2.5 px-2 text-right text-red-500 dark:text-red-400">{formatAmount(m.expenses)}</td>
                    <td className={`py-2.5 px-4 sm:px-6 text-right font-semibold ${m.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400"}`}>
                      {formatAmount(m.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.transactions.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No data for this period</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add transactions to see your report</p>
        </div>
      )}
    </div>
  );
}
