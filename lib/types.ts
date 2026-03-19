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
