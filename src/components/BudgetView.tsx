import React from 'react';
import { Target, AlertTriangle, CheckCircle2, Sliders, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types.ts';
import { CATEGORIES, getCategoryById } from '../data/categories.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface BudgetViewProps {
  monthlyBudget: number;
  transactions: Transaction[];
  currentCurrency: string;
  onOpenBudgetModal: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  monthlyBudget,
  transactions,
  currentCurrency,
  onOpenBudgetModal,
}) => {
  // Compute monthly spending (current month)
  const now = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const expenseTx = currentMonthTransactions.filter((t) => t.type === 'expense');
  const totalSpent = expenseTx.reduce((acc, t) => acc + t.amount, 0);

  const budgetUsage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const isOverBudget = totalSpent > monthlyBudget;
  const remainingBudget = Math.max(monthlyBudget - totalSpent, 0);

  // Group current month spending by category
  const categorySpentMap = new Map<string, number>();
  for (const t of expenseTx) {
    categorySpentMap.set(t.category, (categorySpentMap.get(t.category) || 0) + t.amount);
  }

  // 50/30/20 Guideline benchmark based on monthly budget
  const needsBudget = monthlyBudget * 0.5;
  const wantsBudget = monthlyBudget * 0.3;
  const savingsBudget = monthlyBudget * 0.2;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Monthly Envelope Target
              </span>
              {isOverBudget ? (
                <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Over Budget
                </span>
              ) : (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> On Track
                </span>
              )}
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatCurrency(totalSpent, currentCurrency)}
              <span className="text-sm font-normal text-slate-500 ml-2">
                allocated of {formatCurrency(monthlyBudget, currentCurrency)} cap
              </span>
            </div>
          </div>

          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Monthly Cap</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Cycle Utilization</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {Math.round(budgetUsage)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-rose-600' : budgetUsage >= 85 ? 'bg-amber-500' : 'bg-slate-900'
              }`}
              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>0%</span>
            <span>
              {isOverBudget
                ? `Exceeded cap by ${formatCurrency(totalSpent - monthlyBudget, currentCurrency)}`
                : `${formatCurrency(remainingBudget, currentCurrency)} available to spend`}
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Suggested 50/30/20 Balanced Model */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          50 / 30 / 20 Allocation Benchmark
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          A standard balanced budgeting framework applied against your target of {formatCurrency(monthlyBudget, currentCurrency)}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">50% Needs</span>
              <span>Housing, Groceries, Utilities</span>
            </div>
            <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-2">
              {formatCurrency(needsBudget, currentCurrency)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Fixed essential obligations
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">30% Wants</span>
              <span>Dining, Shopping, Leisure</span>
            </div>
            <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-2">
              {formatCurrency(wantsBudget, currentCurrency)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Discretionary personal enjoyment
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">20% Savings</span>
              <span>Emergency & Long-term</span>
            </div>
            <p className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-2">
              {formatCurrency(savingsBudget, currentCurrency)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Reserves, debt payoffs, investing
            </p>
          </div>
        </div>
      </div>

      {/* Category breakdown in current cycle */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Current Month Spending by Category
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Real expenditure logged in the current calendar month.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.filter((c) => c.type === 'expense').map((cat) => {
            const spent = categorySpentMap.get(cat.id) || 0;
            const percentOfTotal = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cat.colorClass}`}>
                    <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {cat.name}
                    </p>
                    <p className="text-2xs text-slate-400">
                      {percentOfTotal}% of total spend
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(spent, currentCurrency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
