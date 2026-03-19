"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  PiggyBank,
} from "lucide-react";
import {
  getMonthlyData,
  getCategorySummary,
  getTransactions,
  EXPENSE_CATEGORIES,
} from "@/lib/store";
import { useCurrency } from "@/lib/CurrencyContext";
import { CategorySummary, MonthlyBudget } from "@/lib/types";

interface Insight {
  type: "success" | "warning" | "tip" | "info";
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function InsightsPage() {
  const { formatAmount } = useCurrency();
  const [monthlyData, setMonthlyData] = useState<MonthlyBudget>({
    month: "",
    income: 0,
    expenses: 0,
    balance: 0,
  });
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const data = getMonthlyData();
    const cats = getCategorySummary();
    const txns = getTransactions();
    setMonthlyData(data);
    setCategories(cats);
    generateInsights(data, cats, txns.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateInsights = (
    data: MonthlyBudget,
    cats: CategorySummary[],
    txnCount: number
  ) => {
    const newInsights: Insight[] = [];

    if (txnCount === 0) {
      newInsights.push({
        type: "tip",
        title: "Get Started",
        description:
          "Start adding your income and expenses to get personalized AI insights about your spending habits.",
        icon: <Lightbulb className="w-5 h-5" />,
      });
      setInsights(newInsights);
      return;
    }

    if (data.income > 0) {
      const savingsRate = (data.balance / data.income) * 100;
      if (savingsRate >= 30) {
        newInsights.push({
          type: "success",
          title: "Excellent Savings Rate!",
          description: `You're saving ${savingsRate.toFixed(1)}% of your income. This is above the recommended 20%. Keep it up!`,
          icon: <CheckCircle className="w-5 h-5" />,
        });
      } else if (savingsRate >= 20) {
        newInsights.push({
          type: "success",
          title: "Good Savings Rate",
          description: `You're saving ${savingsRate.toFixed(1)}% of your income. You're meeting the recommended 20% target.`,
          icon: <CheckCircle className="w-5 h-5" />,
        });
      } else if (savingsRate >= 0) {
        newInsights.push({
          type: "warning",
          title: "Low Savings Rate",
          description: `You're only saving ${savingsRate.toFixed(1)}% of your income. Try to reach at least 20% for financial health.`,
          icon: <AlertTriangle className="w-5 h-5" />,
        });
      } else {
        newInsights.push({
          type: "warning",
          title: "Overspending Alert!",
          description: `You've spent ${formatAmount(Math.abs(data.balance))} more than your income this month. Review your expenses immediately.`,
          icon: <AlertTriangle className="w-5 h-5" />,
        });
      }
    }

    if (cats.length > 0) {
      const top = cats[0];
      const catInfo = EXPENSE_CATEGORIES.find((c) => c.value === top.category);
      newInsights.push({
        type: "info",
        title: `Top Spending: ${catInfo?.label || top.category}`,
        description: `Your highest expense category is ${catInfo?.label || top.category} at ${formatAmount(top.total)} (${top.percentage.toFixed(1)}% of total expenses). Consider if this can be optimized.`,
        icon: <TrendingUp className="w-5 h-5" />,
      });
    }

    if (cats.length >= 3) {
      const topThreeTotal = cats.slice(0, 3).reduce((s, c) => s + c.total, 0);
      const topThreePercent = data.expenses > 0 ? (topThreeTotal / data.expenses) * 100 : 0;
      if (topThreePercent > 80) {
        newInsights.push({
          type: "tip",
          title: "Spending Concentrated",
          description: `Your top 3 categories account for ${topThreePercent.toFixed(0)}% of expenses. Diversifying or reducing these could significantly improve your budget.`,
          icon: <Lightbulb className="w-5 h-5" />,
        });
      }
    }

    if (data.expenses > 0 && data.income > 0) {
      const expenseRatio = (data.expenses / data.income) * 100;
      if (expenseRatio > 90) {
        newInsights.push({
          type: "warning",
          title: "Tight Budget",
          description: `You're spending ${expenseRatio.toFixed(0)}% of your income. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
          icon: <PiggyBank className="w-5 h-5" />,
        });
      }
    }

    newInsights.push({
      type: "tip",
      title: "AI Recommendation",
      description:
        data.income > 0
          ? `Based on your income of ${formatAmount(data.income)}, aim for a monthly emergency fund contribution of ${formatAmount(data.income * 0.1)} (10% of income).`
          : "Add your monthly income to receive personalized budget recommendations.",
      icon: <Brain className="w-5 h-5" />,
    });

    setInsights(newInsights);
  };

  const insightStyles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300",
    warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
    tip: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    info: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300",
  };

  const iconStyles = {
    success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
    tip: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    info: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
          Smart analysis of your spending habits
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="card text-center">
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 dark:text-emerald-400 mx-auto" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-2 truncate">
            {formatAmount(monthlyData.income)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Income</p>
        </div>
        <div className="card text-center">
          <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 dark:text-red-400 mx-auto" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-2 truncate">
            {formatAmount(monthlyData.expenses)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Expenses</p>
        </div>
        <div className="card text-center">
          <PiggyBank className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500 dark:text-primary-400 mx-auto" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-2 truncate">
            {formatAmount(monthlyData.balance)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Savings</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
          AI-Generated Insights
        </h2>

        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-xl p-4 sm:p-5 ${insightStyles[insight.type]}`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconStyles[insight.type]}`}
              >
                {insight.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">{insight.title}</h3>
                <p className="text-xs sm:text-sm mt-1 opacity-90">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expense Breakdown
          </h2>
          <div className="space-y-3">
            {categories.map((cat) => {
              const catInfo = EXPENSE_CATEGORIES.find(
                (c) => c.value === cat.category
              );
              return (
                <div key={cat.category} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-base sm:text-lg w-7 sm:w-8">{catInfo?.emoji || "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                        {catInfo?.label || cat.category}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                        {formatAmount(cat.total)} ({cat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
