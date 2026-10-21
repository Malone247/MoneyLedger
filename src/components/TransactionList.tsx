import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  X, 
  Calendar,
  CreditCard,
  Plus,
  ArrowUpDown,
  CheckSquare,
  Square,
  ArrowDownLeft,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types.ts';
import { CATEGORIES, PAYMENT_METHODS, getCategoryById, getPaymentMethodLabel } from '../data/categories.ts';
import { formatCurrency, formatDate, exportTransactionsToCSV, parseCSVToTransactions } from '../utils/formatters.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface TransactionListProps {
  transactions: Transaction[];
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onImportTransactions: (imported: Transaction[]) => void;
  currentCurrency: string;
  isCompact?: boolean; // When rendered as a compact preview on Overview
  onViewAll?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onImportTransactions,
  currentCurrency,
  isCompact = false,
  onViewAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'today' | 'this_month' | 'past_30' | 'this_year'>('all');
  const [sortOption, setSortOption] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timezone-safe date check
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
          return false;
        }

        // Payment method filter
        if (selectedMethod !== 'all' && tx.paymentMethod !== selectedMethod) {
          return false;
        }

        // Timeframe filter with timezone-safe parsing
        if (selectedTimeframe !== 'all' && tx.date) {
          const parts = tx.date.split('-').map(Number);
          const [y, m, d] = parts;
          if (parts.length === 3) {
            if (selectedTimeframe === 'today') {
              if (y !== currentYear || (m - 1) !== currentMonth || d !== currentDay) {
                return false;
              }
            } else if (selectedTimeframe === 'this_month') {
              if (y !== currentYear || (m - 1) !== currentMonth) {
                return false;
              }
            } else if (selectedTimeframe === 'past_30') {
              const txTime = new Date(y, m - 1, d).getTime();
              const thirtyDaysAgo = new Date(currentYear, currentMonth, currentDay - 30).getTime();
              if (txTime < thirtyDaysAgo) {
                return false;
              }
            } else if (selectedTimeframe === 'this_year') {
              if (y !== currentYear) {
                return false;
              }
            }
          }
        }

        // Search query (matches description, notes, category, or amount)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const categoryName = getCategoryById(tx.category).name.toLowerCase();
          const matchesDesc = tx.description.toLowerCase().includes(query);
          const matchesNotes = (tx.notes || '').toLowerCase().includes(query);
          const matchesCategory = categoryName.includes(query);
          const matchesAmount = tx.amount.toString().includes(query);
          if (!matchesDesc && !matchesNotes && !matchesCategory && !matchesAmount) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortOption === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortOption === 'amount_desc') {
          return b.amount - a.amount;
        } else {
          return a.amount - b.amount;
        }
      });
  }, [transactions, searchQuery, selectedType, selectedCategory, selectedMethod, selectedTimeframe, sortOption, currentYear, currentMonth, currentDay]);

  // If in compact mode for dashboard preview, slice to top 5
  const displayedTransactions = isCompact ? filteredTransactions.slice(0, 5) : filteredTransactions;

  // Filtered Totals for feedback ribbon
  const filteredSummary = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'income') {
        inflow += t.amount;
      } else {
        outflow += t.amount;
      }
    }
    return {
      inflow,
      outflow,
      net: inflow - outflow,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const imported = parseCSVToTransactions(text);
        if (imported.length > 0) {
          onImportTransactions(imported);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedMethod('all');
    setSelectedTimeframe('all');
    setSortOption('date_desc');
  };

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected transactions?`)) {
      selectedIds.forEach(id => onDeleteTransaction(id));
      setSelectedIds([]);
    }
  };

  const handleExportSelected = () => {
    const selected = transactions.filter(t => selectedIds.includes(t.id));
    exportTransactionsToCSV(selected.length > 0 ? selected : filteredTransactions);
  };

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedType !== 'all' || 
    selectedCategory !== 'all' || 
    selectedMethod !== 'all' || 
    selectedTimeframe !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title or Search */}
          <div className="flex-1">
            {isCompact ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
                  <p className="text-xs text-slate-500">Latest entries in your financial ledger</p>
                </div>
                {onViewAll && (
                  <button
                    onClick={onViewAll}
                    className="text-xs font-semibold text-slate-900 hover:text-emerald-700 underline underline-offset-4 flex items-center gap-1"
                  >
                    <span>View All {transactions.length} Entries</span>
                    <span>&rarr;</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search payee, category, notes, or amount..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Tools */}
          {!isCompact && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {selectedIds.length > 0 ? (
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <span className="text-xs font-semibold px-2 text-slate-700">
                    {selectedIds.length} selected
                  </span>
                  <button
                    onClick={handleExportSelected}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded border border-slate-200"
                  >
                    Export Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-slate-500 hover:text-slate-800 px-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => exportTransactionsToCSV(filteredTransactions)}
                    disabled={transactions.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40"
                    title="Export ledger as CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Import transactions from CSV"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Import CSV</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv"
                    className="hidden"
                  />

                  <button
                    onClick={onOpenNewTransaction}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Record Entry</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Secondary Filter Row (Only in full ledger view) */}
        {!isCompact && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
            {/* Type selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedType === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setSelectedType('expense')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedType === 'expense'
                    ? 'bg-white text-rose-600 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setSelectedType('income')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedType === 'income'
                    ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Income
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Timeframe */}
              <select
                aria-label="Filter timeframe"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="bg-white text-slate-700 text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_month">This Month</option>
                <option value="past_30">Past 30 Days</option>
                <option value="this_year">This Year</option>
              </select>

              {/* Category */}
              <select
                aria-label="Filter category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white text-slate-700 text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 max-w-[140px] truncate cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Payment Method */}
              <select
                aria-label="Filter payment method"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="bg-white text-slate-700 text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="all">All Methods</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>

              {/* Sort Order */}
              <select
                aria-label="Sort order"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-white text-slate-700 text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2 px-1 py-1"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Filter Summary Ribbon (Only in full ledger view) */}
        {!isCompact && (
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 mt-3 border border-slate-100 font-mono tabular-nums">
            <div className="flex items-center gap-3">
              <span>
                Records: <strong className="text-slate-900">{filteredSummary.count}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">|</span>
              <span>
                Inflow: <strong className="text-emerald-700">+{formatCurrency(filteredSummary.inflow, currentCurrency)}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">|</span>
              <span>
                Outflow: <strong className="text-rose-600">-{formatCurrency(filteredSummary.outflow, currentCurrency)}</strong>
              </span>
            </div>
            <div className="mt-1 sm:mt-0">
              <span>
                Net Flow:{' '}
                <strong className={filteredSummary.net >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                  {formatCurrency(filteredSummary.net, currentCurrency)}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Table Header & Content */}
      {displayedTransactions.length === 0 ? (
        <div className="py-16 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">
            {hasActiveFilters ? 'No transactions match your current filters' : 'No transactions recorded yet'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {hasActiveFilters
              ? 'Try modifying your search query, timeframe, category, or payment method.'
              : 'Start logging your everyday expenses and income to gain clarity on your cashflow.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          ) : (
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Record First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {!isCompact && (
                  <th scope="col" className="py-3 pl-4 pr-1 w-8">
                    <button
                      onClick={handleToggleSelectAll}
                      title="Select all"
                      className="text-slate-400 hover:text-slate-700 flex items-center"
                    >
                      {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th scope="col" className="py-3 px-4 sm:px-6">Description / Payee</th>
                <th scope="col" className="py-3 px-4 hidden sm:table-cell">Category</th>
                <th scope="col" className="py-3 px-4 hidden md:table-cell">Date</th>
                <th scope="col" className="py-3 px-4 hidden lg:table-cell">Method</th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right">Amount</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayedTransactions.map((tx) => {
                const category = getCategoryById(tx.category);
                const isExpense = tx.type === 'expense';
                const isConfirmingDelete = confirmDeleteId === tx.id;
                const isSelected = selectedIds.includes(tx.id);

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onEditTransaction(tx)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected ? 'bg-slate-50/90' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Checkbox column */}
                    {!isCompact && (
                      <td className="py-3.5 pl-4 pr-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleSelect(tx.id, e)}
                          className="text-slate-300 group-hover:text-slate-500 hover:text-slate-900"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {/* Description & Category */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${category.colorClass}`}>
                          <CategoryIcon iconName={category.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md group-hover:text-slate-700">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 sm:hidden">
                            <span>{category.name}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatDate(tx.date)}</span>
                          </div>
                          {tx.notes && (
                            <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5 hidden sm:block">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category (Desktop) */}
                    <td className="py-3.5 px-4 hidden sm:table-cell text-xs text-slate-600">
                      <span>{category.name}</span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-600 font-mono tabular-nums whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-500 whitespace-nowrap">
                      {getPaymentMethodLabel(tx.paymentMethod)}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono tabular-nums font-bold whitespace-nowrap">
                      <span className={isExpense ? 'text-rose-600' : 'text-emerald-700'}>
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount, currentCurrency)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {isConfirmingDelete ? (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-xs text-rose-600 font-medium">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteTransaction(tx.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-xs bg-rose-600 text-white px-2 py-1 rounded hover:bg-rose-700 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-slate-600 hover:text-slate-900 px-1.5 py-1"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit entry"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(tx.id)}
                            title="Delete entry"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count indicator */}
      {displayedTransactions.length > 0 && (
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong className="text-slate-700 font-mono tabular-nums">{displayedTransactions.length}</strong> of{' '}
            <strong className="text-slate-700 font-mono tabular-nums">{transactions.length}</strong> total records
          </span>
          {isCompact && onViewAll ? (
            <button
              onClick={onViewAll}
              className="font-semibold text-slate-900 hover:text-emerald-700 underline underline-offset-4"
            >
              Open Complete Ledger ({transactions.length} entries) &rarr;
            </button>
          ) : (
            <span className="text-slate-400">
              Click any transaction row to inspect and edit details
            </span>
          )}
        </div>
      )}
    </div>
  );
};
