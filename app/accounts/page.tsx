"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { CreditCard, Plus, Trash2, Wallet, Building2, PiggyBank, TrendingUp, MoreHorizontal } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";
import { getAccounts, addAccount, deleteAccount, ACCOUNT_TYPES } from "@/lib/store";
import { Account } from "@/lib/types";

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
  cash: <Wallet className="w-5 h-5" />,
  bank: <Building2 className="w-5 h-5" />,
  credit: <CreditCard className="w-5 h-5" />,
  savings: <PiggyBank className="w-5 h-5" />,
  investment: <TrendingUp className="w-5 h-5" />,
  other: <MoreHorizontal className="w-5 h-5" />,
};

export default function AccountsPage() {
  const { formatAmount } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    setAccounts(getAccounts());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || balance === "") return;
    const typeInfo = ACCOUNT_TYPES.find(t => t.value === type);
    const account: Account = {
      id: uuidv4(),
      name,
      type: type as Account["type"],
      balance: parseFloat(balance) || 0,
      color: typeInfo?.color || "#6b7280",
      icon: type,
      createdAt: new Date().toISOString(),
    };
    setAccounts(addAccount(account));
    setName("");
    setBalance("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setAccounts(deleteAccount(id));
  };

  const totalAssets = accounts.filter(a => a.type !== "credit").reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === "credit").reduce((s, a) => s + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your financial accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assets</p>
          <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 break-all">{formatAmount(totalAssets)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Liabilities</p>
          <p className="text-sm sm:text-base font-bold text-red-500 dark:text-red-400 break-all">{formatAmount(totalLiabilities)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Worth</p>
          <p className={`text-sm sm:text-base font-bold break-all ${netWorth >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400"}`}>{formatAmount(netWorth)}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">New Account</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Bank, Cash" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="select-field">
                {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Balance</label>
              <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" step="0.01" className="input-field" required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2 px-6">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-6">Cancel</button>
          </div>
        </form>
      )}

      {/* Accounts List */}
      {accounts.length === 0 && !showForm ? (
        <div className="card text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No accounts added</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your bank accounts, credit cards, and cash</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map(account => {
            const typeInfo = ACCOUNT_TYPES.find(t => t.value === account.type);
            return (
              <div key={account.id} className="card flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${account.color}15`, color: account.color }}>
                    {ACCOUNT_ICONS[account.type] || ACCOUNT_ICONS.other}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{account.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{typeInfo?.label || account.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-sm sm:text-base font-bold whitespace-nowrap ${
                    account.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                  }`}>
                    {formatAmount(Math.abs(account.balance))}
                  </span>
                  <button onClick={() => handleDelete(account.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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
