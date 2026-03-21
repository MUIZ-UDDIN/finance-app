"use client";

import { Transaction, MonthlyBudget, CategorySummary, ExpenseCategory, BudgetGoal, RecurringTransaction, BillReminder, Account, SavingsGoal } from "./types";
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

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "food", label: "Food & Dining" },
  { value: "transport", label: "Transport" },
  { value: "housing", label: "Housing & Rent" },
  { value: "utilities", label: "Utilities & Bills" },
  { value: "entertainment", label: "Entertainment" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "shopping", label: "Shopping" },
  { value: "savings", label: "Savings & Investment" },
  { value: "other", label: "Other" },
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

// ─── Budget Goals ───────────────────────────────────────────
const BUDGET_KEY = "finance-app-budgets";

export function getBudgetGoals(): BudgetGoal[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(BUDGET_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBudgetGoals(goals: BudgetGoal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUDGET_KEY, JSON.stringify(goals));
}

export function addBudgetGoal(goal: BudgetGoal): BudgetGoal[] {
  const goals = getBudgetGoals();
  const existing = goals.findIndex(g => g.category === goal.category && g.month === goal.month);
  if (existing >= 0) goals[existing] = goal;
  else goals.push(goal);
  saveBudgetGoals(goals);
  return goals;
}

export function deleteBudgetGoal(id: string): BudgetGoal[] {
  const goals = getBudgetGoals().filter(g => g.id !== id);
  saveBudgetGoals(goals);
  return goals;
}

// ─── Recurring Transactions ─────────────────────────────────
const RECURRING_KEY = "finance-app-recurring";

export function getRecurringTransactions(): RecurringTransaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(RECURRING_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRecurringTransactions(items: RecurringTransaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECURRING_KEY, JSON.stringify(items));
}

export function addRecurringTransaction(item: RecurringTransaction): RecurringTransaction[] {
  const items = getRecurringTransactions();
  items.push(item);
  saveRecurringTransactions(items);
  return items;
}

export function deleteRecurringTransaction(id: string): RecurringTransaction[] {
  const items = getRecurringTransactions().filter(r => r.id !== id);
  saveRecurringTransactions(items);
  return items;
}

export function getNextDate(current: string, frequency: RecurringTransaction["frequency"]): string {
  const d = new Date(current);
  switch (frequency) {
    case "daily": d.setDate(d.getDate() + 1); break;
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "biweekly": d.setDate(d.getDate() + 14); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "yearly": d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split("T")[0];
}

export function processRecurringTransactions(): void {
  const items = getRecurringTransactions();
  const today = new Date().toISOString().split("T")[0];
  let changed = false;

  items.forEach(item => {
    if (!item.isActive) return;
    while (item.nextDate <= today) {
      const txn: Transaction = {
        id: `${item.id}-${item.nextDate}`,
        type: item.type,
        description: item.description,
        amount: item.amount,
        category: item.category,
        date: item.nextDate,
        createdAt: new Date().toISOString(),
        isRecurring: true,
        recurringId: item.id,
        account: item.account,
      };
      addTransaction(txn);
      item.lastProcessed = item.nextDate;
      item.nextDate = getNextDate(item.nextDate, item.frequency);
      changed = true;
    }
  });

  if (changed) saveRecurringTransactions(items);
}

// ─── Bill Reminders ─────────────────────────────────────────
const BILLS_KEY = "finance-app-bills";

export function getBillReminders(): BillReminder[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(BILLS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBillReminders(bills: BillReminder[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
}

export function addBillReminder(bill: BillReminder): BillReminder[] {
  const bills = getBillReminders();
  bills.push(bill);
  saveBillReminders(bills);
  return bills;
}

export function deleteBillReminder(id: string): BillReminder[] {
  const bills = getBillReminders().filter(b => b.id !== id);
  saveBillReminders(bills);
  return bills;
}

export function toggleBillPaid(id: string): BillReminder[] {
  const bills = getBillReminders();
  const bill = bills.find(b => b.id === id);
  if (bill) bill.isPaid = !bill.isPaid;
  saveBillReminders(bills);
  return bills;
}

// ─── Accounts ───────────────────────────────────────────────
const ACCOUNTS_KEY = "finance-app-accounts";

export function getAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(ACCOUNTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAccounts(accounts: Account[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function addAccount(account: Account): Account[] {
  const accounts = getAccounts();
  accounts.push(account);
  saveAccounts(accounts);
  return accounts;
}

export function deleteAccount(id: string): Account[] {
  const accounts = getAccounts().filter(a => a.id !== id);
  saveAccounts(accounts);
  return accounts;
}

export function updateAccountBalance(id: string, amount: number, operation: "add" | "subtract"): Account[] {
  const accounts = getAccounts();
  const account = accounts.find(a => a.id === id);
  if (account) {
    account.balance = operation === "add" ? account.balance + amount : account.balance - amount;
  }
  saveAccounts(accounts);
  return accounts;
}

// ─── Savings Goals ──────────────────────────────────────────
const SAVINGS_KEY = "finance-app-savings-goals";

export function getSavingsGoals(): SavingsGoal[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SAVINGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSavingsGoals(goals: SavingsGoal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVINGS_KEY, JSON.stringify(goals));
}

export function addSavingsGoal(goal: SavingsGoal): SavingsGoal[] {
  const goals = getSavingsGoals();
  goals.push(goal);
  saveSavingsGoals(goals);
  return goals;
}

export function deleteSavingsGoal(id: string): SavingsGoal[] {
  const goals = getSavingsGoals().filter(g => g.id !== id);
  saveSavingsGoals(goals);
  return goals;
}

export function updateSavingsGoal(id: string, amount: number): SavingsGoal[] {
  const goals = getSavingsGoals();
  const goal = goals.find(g => g.id === id);
  if (goal) goal.currentAmount = Math.max(0, goal.currentAmount + amount);
  saveSavingsGoals(goals);
  return goals;
}

export const ACCOUNT_TYPES = [
  { value: "cash", label: "Cash", color: "#22c55e" },
  { value: "bank", label: "Bank Account", color: "#3b82f6" },
  { value: "credit", label: "Credit Card", color: "#ef4444" },
  { value: "savings", label: "Savings Account", color: "#f59e0b" },
  { value: "investment", label: "Investment", color: "#8b5cf6" },
  { value: "other", label: "Other", color: "#6b7280" },
];
