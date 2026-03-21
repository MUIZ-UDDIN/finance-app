"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { RefreshCw, Plus, Trash2, Pause, Play, Calendar } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";
import { getRecurringTransactions, addRecurringTransaction, deleteRecurringTransaction, saveRecurringTransactions, getNextDate, EXPENSE_CATEGORIES } from "@/lib/store";
import { RecurringTransaction, ExpenseCategory, TransactionType } from "@/lib/types";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function RecurringPage() {
  const { formatAmount } = useCurrency();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "income">("food");
  const [frequency, setFrequency] = useState<RecurringTransaction["frequency"]>("monthly");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setItems(getRecurringTransactions());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || parseFloat(amount) <= 0) return;
    const item: RecurringTransaction = {
      id: uuidv4(),
      type,
      description,
      amount: parseFloat(amount),
      category: type === "income" ? "income" : category,
      frequency,
      startDate,
      nextDate: startDate,
      isActive: true,
    };
    setItems(addRecurringTransaction(item));
    setDescription("");
    setAmount("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setItems(deleteRecurringTransaction(id));
  };

  const handleToggle = (id: string) => {
    const updated = items.map(i =>
      i.id === id ? { ...i, isActive: !i.isActive } : i
    );
    setItems(updated);
    saveRecurringTransactions(updated);
  };

  const activeItems = items.filter(i => i.isActive);
  const pausedItems = items.filter(i => !i.isActive);

  const monthlyTotal = (list: RecurringTransaction[], txType: TransactionType) => {
    return list.filter(i => i.type === txType && i.isActive).reduce((sum, i) => {
      let monthly = i.amount;
      switch (i.frequency) {
        case "daily": monthly = i.amount * 30; break;
        case "weekly": monthly = i.amount * 4.33; break;
        case "biweekly": monthly = i.amount * 2.17; break;
        case "yearly": monthly = i.amount / 12; break;
      }
      return sum + monthly;
    }, 0);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Recurring</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage automatic transactions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Recurring
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Income</p>
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 break-all">{formatAmount(monthlyTotal(items, "income"))}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Expenses</p>
          <p className="text-base sm:text-lg font-bold text-red-500 dark:text-red-400 break-all">{formatAmount(monthlyTotal(items, "expense"))}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">New Recurring Transaction</h2>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => { setType("expense"); setCategory("food"); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${type === "expense" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
              Expense
            </button>
            <button type="button" onClick={() => { setType("income"); setCategory("income"); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${type === "income" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Salary, Netflix" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" className="input-field" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {type === "expense" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="select-field">
                  {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as RecurringTransaction["frequency"])} className="select-field">
                {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" required />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2 px-6">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-6">Cancel</button>
          </div>
        </form>
      )}

      {/* Active */}
      {activeItems.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Active ({activeItems.length})</h2>
          <div className="space-y-2">
            {activeItems.map(item => (
              <div key={item.id} className="card flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    item.type === "income" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
                  }`}>
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{item.frequency}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Next: {new Date(item.nextDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-sm font-bold whitespace-nowrap ${item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                    {item.type === "income" ? "+" : "-"}{formatAmount(item.amount)}
                  </span>
                  <button onClick={() => handleToggle(item.id)} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Pause">
                    <Pause className="w-4 h-4 text-amber-500" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paused */}
      {pausedItems.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Paused ({pausedItems.length})</h2>
          <div className="space-y-2">
            {pausedItems.map(item => (
              <div key={item.id} className="card flex items-center justify-between gap-3 opacity-60">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.frequency} • Paused</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-500 whitespace-nowrap">{formatAmount(item.amount)}</span>
                  <button onClick={() => handleToggle(item.id)} className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Resume">
                    <Play className="w-4 h-4 text-emerald-500" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No recurring transactions</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add salary, rent, or subscriptions</p>
        </div>
      )}
    </div>
  );
}
