import React, { useState } from 'react';
import { X, Check, Target } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../data/categories.ts';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSaveBudget: (newBudget: number) => void;
  currentCurrency: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSaveBudget,
  currentCurrency,
}) => {
  const currencyObj = SUPPORTED_CURRENCIES.find(c => c.code === currentCurrency) || SUPPORTED_CURRENCIES[0];
  const [budgetVal, setBudgetVal] = useState(currentBudget.toString());
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetVal);
    if (isNaN(val) || val <= 0) {
      setError('Please provide a positive monthly budget target.');
      return;
    }
    onSaveBudget(Math.round(val));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Target className="w-4 h-4" />
            </div>
            <h3 id="budget-modal-title" className="text-base font-semibold text-slate-900">
              Set Monthly Spending Cap
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-slate-500">
            Define your target maximum expenditure for each 30-day billing cycle to receive progress alerts.
          </p>

          {error && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Monthly Budget Cap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-base">
                {currencyObj.symbol}
              </div>
              <input
                type="number"
                min="10"
                step="10"
                required
                value={budgetVal}
                onChange={(e) => {
                  setBudgetVal(e.target.value);
                  setError('');
                }}
                className="w-full pl-8 pr-4 py-2.5 text-xl font-mono tabular-nums font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Target</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
