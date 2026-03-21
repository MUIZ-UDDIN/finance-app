"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Download, ChevronDown, X } from "lucide-react";
import TransactionItem from "@/components/TransactionItem";
import { useCurrency } from "@/lib/CurrencyContext";
import { getTransactions, deleteTransaction, EXPENSE_CATEGORIES } from "@/lib/store";
import { Transaction, TransactionType } from "@/lib/types";
import AdBanner from "@/components/AdBanner";

export default function TransactionsPage() {
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

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

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
    setCategoryFilter("all");
    setSortBy("date");
    setSortOrder("desc");
  };

  const hasActiveFilters = search || typeFilter !== "all" || dateFrom || dateTo || amountMin || amountMax || categoryFilter !== "all";

  const filtered = transactions
    .filter((t) => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchDateFrom = !dateFrom || t.date >= dateFrom;
      const matchDateTo = !dateTo || t.date <= dateTo;
      const matchAmountMin = !amountMin || t.amount >= parseFloat(amountMin);
      const matchAmountMax = !amountMax || t.amount <= parseFloat(amountMax);
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchSearch && matchType && matchDateFrom && matchDateTo && matchAmountMin && matchAmountMax && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
      }
      return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
    });

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
        {/* Search & Basic Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
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
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | TransactionType)}
              className="select-field w-auto text-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showAdvanced || hasActiveFilters
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Filter className="w-4 h-4" />
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mb-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From Date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To Date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Amount</label>
                <input type="number" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} placeholder="0" min="0" step="0.01" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Amount</label>
                <input type="number" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="Any" min="0" step="0.01" className="input-field text-sm py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-field text-sm py-2">
                  <option value="all">All Categories</option>
                  <option value="income">Income</option>
                  {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "amount")} className="select-field text-sm py-2">
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Order</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")} className="select-field text-sm py-2">
                  <option value="desc">{sortBy === "date" ? "Newest First" : "Highest First"}</option>
                  <option value="asc">{sortBy === "date" ? "Oldest First" : "Lowest First"}</option>
                </select>
              </div>
            </div>
          </div>
        )}

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
              {hasActiveFilters ? "Try adjusting your filters" : "Start by adding income or expenses"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
