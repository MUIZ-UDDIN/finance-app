export type TransactionType = "income" | "expense";

export type ExpenseCategory =
  | "food"
  | "transport"
  | "housing"
  | "utilities"
  | "entertainment"
  | "healthcare"
  | "education"
  | "shopping"
  | "savings"
  | "other";

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: ExpenseCategory | "income";
  date: string; // ISO string
  createdAt: string;
  tags?: string[];
  notes?: string;
  account?: string;
  isRecurring?: boolean;
  recurringId?: string;
}

export interface MonthlyBudget {
  month: string; // "YYYY-MM"
  income: number;
  expenses: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface BudgetGoal {
  id: string;
  category: ExpenseCategory | "total";
  limit: number;
  month: string; // "YYYY-MM"
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: ExpenseCategory | "income";
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  startDate: string;
  nextDate: string;
  isActive: boolean;
  account?: string;
  lastProcessed?: string;
}

export interface BillReminder {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: "once" | "weekly" | "monthly" | "yearly";
  category: ExpenseCategory;
  isPaid: boolean;
  notifyBefore: number; // days before due date
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "savings" | "investment" | "other";
  balance: number;
  color: string;
  icon: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  createdAt: string;
}
