"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Target, Plus, Trash2, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";
import { getBudgetGoals, addBudgetGoal, deleteBudgetGoal, getCategorySummary, getMonthlyData, EXPENSE_CATEGORIES } from "@/lib/store";
import { BudgetGoal, ExpenseCategory } from "@/lib/types";

export default function BudgetsPage() {
  const { formatAmount } = useCurrency();
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory | "total">("total");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    setGoals(getBudgetGoals());
  }, []);

  const currentMonthGoals = goals.filter(g => g.month === month);
  const categories = getCategorySummary(month);
  const monthlyData = getMonthlyData(month);

  const getSpent = (cat: ExpenseCategory | "total") => {
    if (cat === "total") return monthlyData.expenses;
    const found = categories.find(c => c.category === cat);
    return found ? found.total : 0;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || parseFloat(limit) <= 0) return;
    const goal: BudgetGoal = {
      id: uuidv4(),
      category,
      limit: parseFloat(limit),
      month,
      createdAt: new Date().toISOString(),
    };
    setGoals(addBudgetGoal(goal));
    setLimit("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setGoals(deleteBudgetGoal(id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Budget Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Set spending limits and track your progress</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input-field text-sm py-2 px-3"
          />
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">New Budget Goal</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory | "total")} className="select-field">
                <option value="total">Total Spending</option>
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Limit</label>
              <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0.00" min="1" step="0.01" className="input-field" required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2 px-6">Save Goal</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-6">Cancel</button>
          </div>
        </form>
      )}

      {/* Overall Month Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Monthly Overview</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Income</p>
            <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 break-all">{formatAmount(monthlyData.income)}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expenses</p>
            <p className="text-sm sm:text-base font-bold text-red-500 dark:text-red-400 break-all">{formatAmount(monthlyData.expenses)}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
            <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 break-all">{formatAmount(monthlyData.balance)}</p>
          </div>
        </div>
      </div>

      {/* Budget Goals List */}
      {currentMonthGoals.length === 0 ? (
        <div className="card text-center py-12">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No budget goals for this month</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click &quot;Add Goal&quot; to set spending limits</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentMonthGoals.map((goal) => {
            const spent = getSpent(goal.category);
            const percentage = Math.min((spent / goal.limit) * 100, 100);
            const isOver = spent > goal.limit;
            const isNear = percentage >= 80 && !isOver;
            const catLabel = goal.category === "total" ? "Total Spending" : EXPENSE_CATEGORIES.find(c => c.value === goal.category)?.label || goal.category;

            return (
              <div key={goal.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isOver ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : isNear ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {isOver ? <AlertTriangle className="w-4 h-4" /> : isNear ? <TrendingUp className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{catLabel}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatAmount(spent)} / {formatAmount(goal.limit)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      isOver ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : isNear ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}>
                      {percentage.toFixed(0)}%
                    </span>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      isOver ? "bg-red-500" : isNear ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {isOver && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">
                    Over budget by {formatAmount(spent - goal.limit)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
