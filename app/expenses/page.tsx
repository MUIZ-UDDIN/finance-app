"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ArrowUpCircle, CheckCircle } from "lucide-react";
import { addTransaction, EXPENSE_CATEGORIES } from "@/lib/store";
import { useCurrency } from "@/lib/CurrencyContext";
import { Transaction, ExpenseCategory } from "@/lib/types";
import AdBanner from "@/components/AdBanner";

export default function ExpensesPage() {
  const { currency } = useCurrency();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || parseFloat(amount) <= 0) return;

    const transaction: Transaction = {
      id: uuidv4(),
      type: "expense",
      description,
      amount: parseFloat(amount),
      category: category === "other" && customCategory.trim() ? customCategory.trim() as ExpenseCategory : category,
      date,
      createdAt: new Date().toISOString(),
    };

    addTransaction(transaction);
    setSuccess(true);
    setDescription("");
    setAmount("");
    setCustomCategory("");
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add Expense</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Track where your money goes</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 sm:px-5 py-3 sm:py-4 rounded-xl">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm sm:text-base">Expense recorded successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowUpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Expense Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your expense information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expense Name
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Groceries, Netflix, Rent"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount ({currency.symbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="input-field text-xl sm:text-2xl font-bold text-red-500 dark:text-red-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="select-field"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {category === "other" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Gifts, Pets, Subscriptions"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full text-center">
          Add Expense
        </button>
      </form>

      <AdBanner adSlot="3456789012" adFormat="horizontal" className="mt-2" />
    </div>
  );
}
