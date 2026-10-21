import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, PiggyBank, Target, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.ts';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
  monthlyBudget: number;
  currentCurrency: string;
  onEditBudget: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  netBalance,
  incomeCount,
  expenseCount,
  monthlyBudget,
  currentCurrency,
  onEditBudget,
}) => {
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;
  const budgetUsagePercent = monthlyBudget > 0 ? Math.min(Math.round((totalExpenses / monthlyBudget) * 100), 200) : 0;
  const budgetRemaining = Math.max(monthlyBudget - totalExpenses, 0);
  const isOverBudget = monthlyBudget > 0 && totalExpenses > monthlyBudget;
  const isNearBudget = monthlyBudget > 0 && budgetUsagePercent >= 85 && !isOverBudget;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Balance Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Net Balance</span>
          <div className="p-2 rounded-lg bg-slate-50 text-slate-700">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${
            netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
          }`}>
            {formatCurrency(netBalance, currentCurrency)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span>Savings Rate:</span>
            <span className={`font-mono tabular-nums font-semibold ${savingsRate >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {savingsRate}%
            </span>
            <span aria-hidden="true">·</span>
            <span>{incomeCount + expenseCount} total entries</span>
          </div>
        </div>
      </div>

      {/* 2. Total Income Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Income</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-emerald-700">
            +{formatCurrency(totalIncome, currentCurrency)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span>{incomeCount} credit transactions</span>
            <span aria-hidden="true">·</span>
            <span>Active cycle</span>
          </div>
        </div>
      </div>

      {/* 3. Total Expenses Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Spending</span>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-rose-700">
            -{formatCurrency(totalExpenses, currentCurrency)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span>{expenseCount} debit transactions</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums font-medium text-slate-700">
              {expenseCount > 0 ? formatCurrency(totalExpenses / expenseCount, currentCurrency) : '$0'} avg
            </span>
          </div>
        </div>
      </div>

      {/* 4. Monthly Budget Progress Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Monthly Budget</span>
          <button
            onClick={onEditBudget}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium underline underline-offset-2 hover:bg-slate-50 px-1 py-0.5 rounded transition-colors"
          >
            Adjust
          </button>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
              {formatCurrency(totalExpenses, currentCurrency)}
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-500">
              of {formatCurrency(monthlyBudget, currentCurrency)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget
                  ? 'bg-rose-600'
                  : isNearBudget
                  ? 'bg-amber-500'
                  : 'bg-slate-900'
              }`}
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span className="font-mono tabular-nums font-medium">
              {budgetUsagePercent}% spent
            </span>
            {isOverBudget ? (
              <span className="text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 inline" />
                Over by {formatCurrency(totalExpenses - monthlyBudget, currentCurrency)}
              </span>
            ) : (
              <span className="text-slate-600 font-mono tabular-nums">
                {formatCurrency(budgetRemaining, currentCurrency)} left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
