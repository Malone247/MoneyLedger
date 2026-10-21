import React from 'react';
import { X, Edit3, Trash2, Calendar, CreditCard, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types.ts';
import { getCategoryById, getPaymentMethodLabel } from '../data/categories.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  currentCurrency: string;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onEdit,
  onDelete,
  currentCurrency,
}) => {
  if (!transaction) return null;

  const category = getCategoryById(transaction.category);
  const isExpense = transaction.type === 'expense';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-slate-900 transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Transaction Details
          </span>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Main Descriptor */}
        <div className="text-center py-5 border-b border-slate-100">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${category.colorClass}`}>
            <CategoryIcon iconName={category.icon} className="w-6 h-6" />
          </div>
          <h3 id="detail-title" className="text-lg font-bold text-slate-900 px-4">
            {transaction.description}
          </h3>
          <div className="text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-1">
            <span className={isExpense ? 'text-rose-600' : 'text-emerald-700'}>
              {isExpense ? '-' : '+'}
              {formatCurrency(transaction.amount, currentCurrency)}
            </span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-semibold">
            {isExpense ? 'Outgoing Expense' : 'Incoming Credit'}
          </p>
        </div>

        {/* Detailed Fields */}
        <div className="py-4 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Category
            </span>
            <span className="font-semibold text-slate-900">{category.name}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Date Recorded
            </span>
            <span className="font-semibold font-mono tabular-nums text-slate-900">
              {formatDate(transaction.date)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Payment Method
            </span>
            <span className="font-semibold text-slate-900">
              {getPaymentMethodLabel(transaction.paymentMethod)}
            </span>
          </div>

          {transaction.notes && (
            <div className="py-1.5 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5" /> Memo & Notes
              </span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                {transaction.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between py-1 text-2xs text-slate-400">
            <span>Reference ID</span>
            <span className="font-mono">{transaction.id}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <button
            onClick={() => {
              if (window.confirm('Delete this transaction?')) {
                onDelete(transaction.id);
                onClose();
              }
            }}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(transaction);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
