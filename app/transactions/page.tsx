"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import TransactionItem from "@/components/TransactionItem";
import { useCurrency } from "@/lib/CurrencyContext";
import { getTransactions, deleteTransaction } from "@/lib/store";
import { Transaction, TransactionType } from "@/lib/types";
import AdBanner from "@/components/AdBanner";

export default function TransactionsPage() {
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");

  const loadData = () => {
    setTransactions(getTransactions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    loadData();
  };

  const handleExport = () => {
    const csv = [
      "Date,Type,Description,Category,Amount",
      ...filtered.map(
        (t) => `${t.date},${t.type},${t.description.replace(/,/g, ";")},${t.category},${t.amount}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">View and manage all your transactions</p>
        </div>
        {transactions.length > 0 && (
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 self-start">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
          <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Total Txns</p>
          <p className="text-base sm:text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{filtered.length}</p>
        </div>
        <div className="card bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
          <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">Income</p>
          <p className="text-sm sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 break-all leading-tight">{formatAmount(totalIncome)}</p>
        </div>
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Expenses</p>
          <p className="text-sm sm:text-2xl font-bold text-red-700 dark:text-red-300 mt-1 break-all leading-tight">{formatAmount(totalExpenses)}</p>
        </div>
      </div>

      <AdBanner adSlot="4567890123" adFormat="horizontal" className="my-2" />

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | TransactionType)}
              className="select-field w-auto"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((txn) => (
              <TransactionItem
                key={txn.id}
                transaction={txn}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 sm:py-16 text-center text-gray-400 dark:text-gray-500">
            <p className="text-lg">No transactions found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term" : "Start by adding income or expenses"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
