import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types.ts';
import { CATEGORIES, PAYMENT_METHODS, SUPPORTED_CURRENCIES } from '../data/categories.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTransaction: Transaction | null;
  currentCurrency: string;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  currentCurrency,
  defaultType = 'expense',
}) => {
  const currencyObj = SUPPORTED_CURRENCIES.find(c => c.code === currentCurrency) || SUPPORTED_CURRENCIES[0];

  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(defaultType === 'income' ? 'salary' : 'dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Sync state when editing an existing transaction
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setError('');
    } else {
      // Default reset
      const initialType = defaultType || 'expense';
      setType(initialType);
      setDescription('');
      setAmount('');
      setCategory(initialType === 'income' ? 'salary' : 'dining');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setNotes('');
      setError('');
    }
  }, [editingTransaction, isOpen, defaultType]);

  // When type changes, ensure category matches the type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const availableCategories = CATEGORIES.filter(c => c.type === newType || c.type === 'both');
    if (!availableCategories.some(c => c.id === category)) {
      setCategory(availableCategories[0]?.id || 'other_expense');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description or payee name.');
      return;
    }

    onSave(
      {
        description: description.trim(),
        amount: Math.round(numAmount * 100) / 100,
        type,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      },
      editingTransaction?.id
    );

    onClose();
  };

  const filteredCategories = CATEGORIES.filter(c => c.type === type || c.type === 'both');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 transition-all text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="modal-headline" className="text-lg font-semibold text-slate-900">
              {editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your income or expense entry details.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Type Selector (Segmented control) */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Amount
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-base">
                {currencyObj.symbol}
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 text-lg font-mono tabular-nums font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Payee
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
              placeholder="e.g. Trader Joe's Groceries, Client Milestone"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              >
              </input>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add memo or tax classification..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              <span>{editingTransaction ? 'Save Changes' : 'Record Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
