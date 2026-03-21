"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Bell, Plus, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";
import { getBillReminders, addBillReminder, deleteBillReminder, toggleBillPaid, EXPENSE_CATEGORIES } from "@/lib/store";
import { BillReminder, ExpenseCategory } from "@/lib/types";

export default function BillsPage() {
  const { formatAmount } = useCurrency();
  const [bills, setBills] = useState<BillReminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState<BillReminder["frequency"]>("monthly");
  const [category, setCategory] = useState<ExpenseCategory>("utilities");
  const [notifyBefore, setNotifyBefore] = useState("3");

  useEffect(() => {
    setBills(getBillReminders());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || parseFloat(amount) <= 0) return;
    const bill: BillReminder = {
      id: uuidv4(),
      name,
      amount: parseFloat(amount),
      dueDate,
      frequency,
      category,
      isPaid: false,
      notifyBefore: parseInt(notifyBefore),
      createdAt: new Date().toISOString(),
    };
    setBills(addBillReminder(bill));
    setName("");
    setAmount("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => setBills(deleteBillReminder(id));
  const handleTogglePaid = (id: string) => setBills(toggleBillPaid(id));

  const today = new Date();
  const getDaysUntil = (dateStr: string) => {
    const due = new Date(dateStr);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatus = (bill: BillReminder) => {
    if (bill.isPaid) return "paid";
    const days = getDaysUntil(bill.dueDate);
    if (days < 0) return "overdue";
    if (days <= bill.notifyBefore) return "upcoming";
    return "normal";
  };

  const sortedBills = [...bills].sort((a, b) => {
    const statusOrder = { overdue: 0, upcoming: 1, normal: 2, paid: 3 };
    return statusOrder[getStatus(a)] - statusOrder[getStatus(b)];
  });

  const unpaidTotal = bills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0);
  const overdueCount = bills.filter(b => getStatus(b) === "overdue").length;
  const upcomingCount = bills.filter(b => getStatus(b) === "upcoming").length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Bill Reminders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Never miss a payment</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Bill
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unpaid</p>
          <p className="text-base sm:text-lg font-bold text-red-500 dark:text-red-400 break-all">{formatAmount(unpaidTotal)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Overdue</p>
          <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Soon</p>
          <p className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">{upcomingCount}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">New Bill Reminder</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bill Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricity, Internet" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" className="input-field" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as BillReminder["frequency"])} className="select-field">
                <option value="once">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="select-field">
                {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remind Before</label>
              <select value={notifyBefore} onChange={(e) => setNotifyBefore(e.target.value)} className="select-field">
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">7 days</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2 px-6">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-6">Cancel</button>
          </div>
        </form>
      )}

      {/* Bills List */}
      {sortedBills.length === 0 && !showForm ? (
        <div className="card text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No bill reminders</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add bills to track payment due dates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedBills.map(bill => {
            const status = getStatus(bill);
            const days = getDaysUntil(bill.dueDate);
            return (
              <div key={bill.id} className={`card flex items-center justify-between gap-3 ${bill.isPaid ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button onClick={() => handleTogglePaid(bill.id)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      status === "paid" ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : status === "overdue" ? "bg-red-100 dark:bg-red-900/30"
                        : status === "upcoming" ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                    {status === "paid" ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      : status === "overdue" ? <AlertTriangle className="w-4 h-4 text-red-500" />
                      : <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${bill.isPaid ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>{bill.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {status === "paid" ? "Paid" : status === "overdue" ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}` : `Due in ${days} day${days !== 1 ? "s" : ""}`}
                      <span className="ml-2 capitalize">• {bill.frequency}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-sm font-bold whitespace-nowrap ${status === "overdue" ? "text-red-500" : status === "paid" ? "text-gray-400" : "text-gray-900 dark:text-white"}`}>
                    {formatAmount(bill.amount)}
                  </span>
                  <button onClick={() => handleDelete(bill.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
