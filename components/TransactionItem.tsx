"use client";

import { Transaction } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/store";
import { useCurrency } from "@/lib/CurrencyContext";
import { Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export default function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const { formatAmount } = useCurrency();
  const isIncome = transaction.type === "income";
  const categoryInfo = EXPENSE_CATEGORIES.find((c) => c.value === transaction.category);
  const emoji = isIncome ? "💵" : categoryInfo?.emoji || "📋";

  return (
    <div className="flex items-center justify-between py-3 px-2 sm:px-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0 ${
            isIncome ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-red-50 dark:bg-red-900/30"
          }`}
        >
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{transaction.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(transaction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {!isIncome && categoryInfo && (
              <span className="ml-2 text-gray-400 dark:text-gray-500 hidden sm:inline">• {categoryInfo.label}</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="text-right">
          <p
            className={`text-sm font-semibold ${
              isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
            }`}
          >
            {isIncome ? "+" : "-"}{formatAmount(transaction.amount)}
          </p>
          <div className="flex items-center justify-end">
            {isIncome ? (
              <ArrowDownLeft className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <ArrowUpRight className="w-3 h-3 text-red-400" />
            )}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}
