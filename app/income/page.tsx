"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ArrowDownCircle, CheckCircle } from "lucide-react";
import { addTransaction } from "@/lib/store";
import { useCurrency } from "@/lib/CurrencyContext";
import { Transaction } from "@/lib/types";
import AdBanner from "@/components/AdBanner";

export default function IncomePage() {
  const { currency } = useCurrency();
  const [description, setDescription] = useState("Monthly Salary");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const transaction: Transaction = {
      id: uuidv4(),
      type: "income",
      description,
      amount: parseFloat(amount),
      category: "income",
      date,
      createdAt: new Date().toISOString(),
    };

    addTransaction(transaction);
    setSuccess(true);
    setAmount("");
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add Income</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Record your monthly income or any earnings</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 sm:px-5 py-3 sm:py-4 rounded-xl">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm sm:text-base">Income added successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Income Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details below</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly Salary, Freelance Work"
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
              className="input-field text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400"
              required
            />
          </div>

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
          Add Income
        </button>
      </form>

      <AdBanner adSlot="2345678901" adFormat="horizontal" className="mt-2" />
    </div>
  );
}
