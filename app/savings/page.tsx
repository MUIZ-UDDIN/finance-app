"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { PiggyBank, Plus, Trash2, TrendingUp, Minus, Target } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";
import { getSavingsGoals, addSavingsGoal, deleteSavingsGoal, updateSavingsGoal } from "@/lib/store";
import { SavingsGoal } from "@/lib/types";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function SavingsPage() {
  const { formatAmount } = useCurrency();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [addAmountId, setAddAmountId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  useEffect(() => {
    setGoals(getSavingsGoals());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || parseFloat(target) <= 0) return;
    const goal: SavingsGoal = {
      id: uuidv4(),
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      deadline: deadline || undefined,
      color: COLORS[goals.length % COLORS.length],
      createdAt: new Date().toISOString(),
    };
    setGoals(addSavingsGoal(goal));
    setName("");
    setTarget("");
    setDeadline("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => setGoals(deleteSavingsGoal(id));

  const handleAddMoney = (id: string) => {
    if (!addAmount || parseFloat(addAmount) === 0) return;
    setGoals(updateSavingsGoal(id, parseFloat(addAmount)));
    setAddAmountId(null);
    setAddAmount("");
  };

  const handleWithdraw = (id: string) => {
    if (!addAmount || parseFloat(addAmount) === 0) return;
    setGoals(updateSavingsGoal(id, -parseFloat(addAmount)));
    setAddAmountId(null);
    setAddAmount("");
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Track progress towards your financial goals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Overall Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{overallProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-3">
          <div className="bg-primary-500 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(overallProgress, 100)}%` }} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Saved: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatAmount(totalSaved)}</span></span>
          <span className="text-gray-500 dark:text-gray-400">Target: <span className="font-semibold text-gray-900 dark:text-white">{formatAmount(totalTarget)}</span></span>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">New Savings Goal</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vacation, Emergency Fund" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Amount</label>
              <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0.00" min="1" step="0.01" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deadline (optional)</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2 px-6">Create Goal</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-6">Cancel</button>
          </div>
        </form>
      )}

      {/* Goals List */}
      {goals.length === 0 && !showForm ? (
        <div className="card text-center py-12">
          <PiggyBank className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No savings goals yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start saving towards your dreams</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div key={goal.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
                      {isComplete ? <TrendingUp className="w-5 h-5" /> : <PiggyBank className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{goal.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isComplete ? "Goal reached!" : `${formatAmount(remaining)} remaining`}
                        {daysLeft !== null && !isComplete && (
                          <span className={`ml-2 ${daysLeft < 0 ? "text-red-500" : daysLeft <= 30 ? "text-amber-500" : ""}`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setAddAmountId(addAmountId === goal.id ? null : goal.id); setAddAmount(""); }}
                      className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors" title="Add/Withdraw">
                      <Plus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold" style={{ color: goal.color }}>{formatAmount(goal.currentAmount)}</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatAmount(goal.targetAmount)}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                </div>
                <p className="text-right text-xs font-semibold mt-1" style={{ color: goal.color }}>{progress.toFixed(0)}%</p>

                {addAmountId === goal.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="Amount" min="0.01" step="0.01" className="input-field flex-1 text-sm py-2" />
                    <button onClick={() => handleAddMoney(goal.id)} className="p-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-xl transition-colors" title="Add">
                      <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </button>
                    <button onClick={() => handleWithdraw(goal.id)} className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl transition-colors" title="Withdraw">
                      <Minus className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
