import React, { useMemo, useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Tag, 
  CreditCard,
  Target
} from 'lucide-react';
import { Transaction } from '../types.ts';
import { getCategoryById, CATEGORIES } from '../data/categories.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currentCurrency: string;
  monthlyBudget: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  currentCurrency,
  monthlyBudget,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30days'>('all');

  // Filter transactions based on selected period
  const activeTransactions = useMemo(() => {
    if (selectedPeriod === '30days') {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 30);
      return transactions.filter(t => new Date(t.date) >= past30);
    }
    return transactions;
  }, [transactions, selectedPeriod]);

  // Aggregate category breakdown for expenses
  const categoryStats = useMemo(() => {
    const expenseTx = activeTransactions.filter(t => t.type === 'expense');
    const totalExpense = expenseTx.reduce((acc, t) => acc + t.amount, 0);

    const map = new Map<string, { total: number; count: number }>();

    for (const t of expenseTx) {
      const existing = map.get(t.category) || { total: 0, count: 0 };
      map.set(t.category, {
        total: existing.total + t.amount,
        count: existing.count + 1,
      });
    }

    const list = Array.from(map.entries()).map(([catId, data]) => {
      const category = getCategoryById(catId);
      const percentage = totalExpense > 0 ? (data.total / totalExpense) * 100 : 0;
      return {
        id: catId,
        name: category.name,
        icon: category.icon,
        colorClass: category.colorClass,
        total: data.total,
        count: data.count,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    return {
      list: list.sort((a, b) => b.total - a.total),
      totalExpense,
    };
  }, [activeTransactions]);

  // Aggregate income sources
  const incomeStats = useMemo(() => {
    const incomeTx = activeTransactions.filter(t => t.type === 'income');
    const totalIncome = incomeTx.reduce((acc, t) => acc + t.amount, 0);

    const map = new Map<string, number>();
    for (const t of incomeTx) {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }

    const list = Array.from(map.entries()).map(([catId, amount]) => {
      const category = getCategoryById(catId);
      const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
      return {
        id: catId,
        name: category.name,
        icon: category.icon,
        colorClass: category.colorClass,
        amount,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    return {
      list: list.sort((a, b) => b.amount - a.amount),
      totalIncome,
    };
  }, [activeTransactions]);

  // Key performance facts
  const insights = useMemo(() => {
    const expenses = activeTransactions.filter(t => t.type === 'expense');
    const incomes = activeTransactions.filter(t => t.type === 'income');

    const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);
    const totalEarned = incomes.reduce((s, t) => s + t.amount, 0);

    // Largest expense
    const largestExpense = expenses.length > 0
      ? [...expenses].sort((a, b) => b.amount - a.amount)[0]
      : null;

    // Top category
    const topCategory = categoryStats.list[0] || null;

    // Average transaction size
    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

    return {
      totalSpent,
      totalEarned,
      netFlow: totalEarned - totalSpent,
      largestExpense,
      topCategory,
      avgExpense,
    };
  }, [activeTransactions, categoryStats]);

  return (
    <div className="space-y-6">
      {/* Top filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Financial Insights & Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of your spending allocations, income streams, and cash trends.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedPeriod === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Ledger Records
          </button>
          <button
            onClick={() => setSelectedPeriod('30days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedPeriod === '30days'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recent 30 Days
          </button>
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Top Spending Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Top Outflow Category
          </span>
          <div className="mt-2">
            {insights.topCategory ? (
              <div>
                <p className="text-lg font-bold text-slate-900 truncate">
                  {insights.topCategory.name}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-mono tabular-nums font-semibold text-slate-800">
                    {formatCurrency(insights.topCategory.total, currentCurrency)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-rose-600 font-medium">
                    {insights.topCategory.percentage}% of spending
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-1">No expenses recorded yet</p>
            )}
          </div>
        </div>

        {/* Largest Single Expense */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Largest Single Expense
          </span>
          <div className="mt-2">
            {insights.largestExpense ? (
              <div>
                <p className="text-lg font-bold text-slate-900 truncate">
                  {insights.largestExpense.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-mono tabular-nums font-semibold text-rose-600">
                    {formatCurrency(insights.largestExpense.amount, currentCurrency)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{insights.largestExpense.date}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-1">No expenses recorded</p>
            )}
          </div>
        </div>

        {/* Average Expense Size */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Average Expense Size
          </span>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(insights.avgExpense, currentCurrency)}
            </p>
            <div className="text-xs text-slate-500 mt-1">
              Per recorded debit transaction
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown: Spending by Category & Income Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending By Category */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Outflow by Category
              </h3>
              <p className="text-xs text-slate-500">
                Where your funds are distributed
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-slate-900">
              {formatCurrency(categoryStats.totalExpense, currentCurrency)}
            </span>
          </div>

          {categoryStats.list.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No expenses in this period.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryStats.list.map((cat) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${cat.colorClass}`}>
                        <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-800">{cat.name}</span>
                      <span className="text-slate-400">({cat.count})</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(cat.total, currentCurrency)}
                      </span>
                      <span className="text-slate-500 w-12 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-slate-800 h-full rounded-full transition-all duration-300"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income Sources Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Income Sources
              </h3>
              <p className="text-xs text-slate-500">
                Earnings streams and contributions
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700">
              +{formatCurrency(incomeStats.totalIncome, currentCurrency)}
            </span>
          </div>

          {incomeStats.list.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No income entries in this period.
            </div>
          ) : (
            <div className="space-y-4">
              {incomeStats.list.map((inc) => (
                <div key={inc.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${inc.colorClass}`}>
                        <CategoryIcon iconName={inc.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-800">{inc.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="font-semibold text-emerald-700">
                        +{formatCurrency(inc.amount, currentCurrency)}
                      </span>
                      <span className="text-slate-500 w-12 text-right">
                        {inc.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${inc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
