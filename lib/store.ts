"use client";

import { Transaction, MonthlyBudget, CategorySummary, ExpenseCategory } from "./types";
import { saveBackup } from "./backup";

const STORAGE_KEY = "finance-app-transactions";

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  const data = JSON.stringify(transactions);
  localStorage.setItem(STORAGE_KEY, data);
  saveBackup(data);
}

export function addTransaction(transaction: Transaction): Transaction[] {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  saveTransactions(transactions);
  return transactions;
}

export function deleteTransaction(id: string): Transaction[] {
  const transactions = getTransactions().filter((t) => t.id !== id);
  saveTransactions(transactions);
  return transactions;
}

export function getMonthlyData(month?: string): MonthlyBudget {
  const now = new Date();
  const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const transactions = getTransactions().filter((t) => t.date.startsWith(targetMonth));

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    month: targetMonth,
    income,
    expenses,
    balance: income - expenses,
  };
}

export function getCategorySummary(month?: string): CategorySummary[] {
  const now = new Date();
  const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const expenses = getTransactions().filter(
    (t) => t.type === "expense" && t.date.startsWith(targetMonth)
  );

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap: Record<string, { total: number; count: number }> = {};
  expenses.forEach((t) => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { total: 0, count: 0 };
    }
    categoryMap[t.category].total += t.amount;
    categoryMap[t.category].count += 1;
  });

  return Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getLast6MonthsData(): MonthlyBudget[] {
  const months: MonthlyBudget[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(getMonthlyData(month));
  }

  return months;
}

export function getTotalBalance(): number {
  const transactions = getTransactions();
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return income - expenses;
}

export function getRecentTransactions(limit: number = 5): Transaction[] {
  return getTransactions().slice(0, limit);
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: "food", label: "Food & Dining", emoji: "🍔" },
  { value: "transport", label: "Transport", emoji: "🚗" },
  { value: "housing", label: "Housing & Rent", emoji: "🏠" },
  { value: "utilities", label: "Utilities & Bills", emoji: "💡" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "healthcare", label: "Healthcare", emoji: "🏥" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "savings", label: "Savings & Investment", emoji: "💰" },
  { value: "other", label: "Other", emoji: "📋" },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
