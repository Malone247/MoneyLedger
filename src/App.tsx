/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SummaryCards } from './components/SummaryCards.tsx';
import { TransactionList } from './components/TransactionList.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { BudgetView } from './components/BudgetView.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { TransactionDetailModal } from './components/TransactionDetailModal.tsx';
import { BudgetModal } from './components/BudgetModal.tsx';
import { Transaction, TransactionType } from './types.ts';
import { INITIAL_TRANSACTIONS } from './data/sampleTransactions.ts';
import { LogoM } from './components/MoneyLedgerLogo.tsx';
import { 
  Plus, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sliders, 
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'moneyledger_transactions_v2',
  BUDGET: 'moneyledger_monthly_budget_v2',
  CURRENCY: 'moneyledger_currency_v2',
};

export default function App() {
  // 1. Transactions state with localStorage persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_TRANSACTIONS;
  });

  // 2. Budget limit state
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return 3200;
  });

  // 3. Currency state
  const [currentCurrency, setCurrentCurrency] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved) return saved;
    } catch {
      // Fallback
    }
    return 'USD';
  });

  // 4. Active navigation view (with hash support)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics' | 'budget'>(() => {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'transactions', 'analytics', 'budget'].includes(hash)) {
      return hash as any;
    }
    return 'dashboard';
  });

  // Modals & Inspection states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [newTxPresetType, setNewTxPresetType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Sync tab with URL hash
  const handleTabChange = (tab: 'dashboard' | 'transactions' | 'analytics' | 'budget') => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'transactions', 'analytics', 'budget'].includes(hash)) {
        setActiveTab(hash as any);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, monthlyBudget.toString());
    } catch (e) {
      console.error('Failed to save budget to localStorage', e);
    }
  }, [monthlyBudget]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currentCurrency);
    } catch (e) {
      console.error('Failed to save currency to localStorage', e);
    }
  }, [currentCurrency]);

  // Calculations for current ledger state
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incCount = 0;
    let expCount = 0;

    for (const t of transactions) {
      if (t.type === 'income') {
        income += t.amount;
        incCount++;
      } else {
        expense += t.amount;
        expCount++;
      }
    }

    return {
      totalIncome: income,
      totalExpenses: expense,
      netBalance: income - expense,
      incomeCount: incCount,
      expenseCount: expCount,
    };
  }, [transactions]);

  // Transaction CRUD handlers
  const handleSaveTransaction = (
    transactionData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === existingId
            ? { ...t, ...transactionData }
            : t
        )
      );
      showToast('Transaction updated successfully');
    } else {
      const newTx: Transaction = {
        ...transactionData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Transaction added to ledger');
    }
  };

  const handleOpenNewTransaction = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setNewTxPresetType(type);
    setIsTxModalOpen(true);
  };

  const handleInspectOrEditTransaction = (tx: Transaction) => {
    // Open the detail inspection modal
    setDetailTransaction(tx);
  };

  const handleStartEditing = (tx: Transaction) => {
    setDetailTransaction(null);
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (detailTransaction?.id === id) {
      setDetailTransaction(null);
    }
    showToast('Transaction removed from ledger');
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    setTransactions((prev) => [...imported, ...prev]);
    showToast(`Successfully imported ${imported.length} transactions`);
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setMonthlyBudget(3200);
    showToast('Reset to demo sample dataset');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
        currentCurrency={currentCurrency}
        onChangeCurrency={setCurrentCurrency}
        onResetData={handleResetData}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ============================================================ */}
        {/* TAB 1: DASHBOARD / OVERVIEW                                   */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200">
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Financial Overview & Health
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time summary of your account balance, monthly budget, and cashflow.
                </p>
              </div>

              {/* Quick Add buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenNewTransaction('expense')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/60"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+ Expense</span>
                </button>
                <button
                  onClick={() => handleOpenNewTransaction('income')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>+ Income</span>
                </button>
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Budget</span>
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <SummaryCards
              totalIncome={summary.totalIncome}
              totalExpenses={summary.totalExpenses}
              netBalance={summary.netBalance}
              incomeCount={summary.incomeCount}
              expenseCount={summary.expenseCount}
              monthlyBudget={monthlyBudget}
              currentCurrency={currentCurrency}
              onEditBudget={() => setIsBudgetModalOpen(true)}
            />

            {/* Recent Transactions Preview (Compact top 5) */}
            <TransactionList
              transactions={transactions}
              onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
              onEditTransaction={handleInspectOrEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onImportTransactions={handleImportTransactions}
              currentCurrency={currentCurrency}
              isCompact={true}
              onViewAll={() => handleTabChange('transactions')}
            />

            {/* Category spending distribution & cash flow */}
            <AnalyticsView
              transactions={transactions}
              currentCurrency={currentCurrency}
              monthlyBudget={monthlyBudget}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: DEDICATED TRANSACTIONS LEDGER                          */}
        {/* ============================================================ */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Dedicated Page Header for Transactions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Transactions Ledger
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Audit, search, filter, export, and record your historical income and expenses.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenNewTransaction('expense')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Expense</span>
                </button>
                <button
                  onClick={() => handleOpenNewTransaction('income')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Income</span>
                </button>
              </div>
            </div>

            {/* Full-featured Ledger Table */}
            <TransactionList
              transactions={transactions}
              onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
              onEditTransaction={handleInspectOrEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onImportTransactions={handleImportTransactions}
              currentCurrency={currentCurrency}
              isCompact={false}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ANALYTICS & TRENDS                                     */}
        {/* ============================================================ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsView
              transactions={transactions}
              currentCurrency={currentCurrency}
              monthlyBudget={monthlyBudget}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: BUDGET GOALS                                          */}
        {/* ============================================================ */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <BudgetView
              monthlyBudget={monthlyBudget}
              transactions={transactions}
              currentCurrency={currentCurrency}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Floating Add Button for Mobile */}
      <div className="sm:hidden fixed bottom-5 right-5 z-30">
        <button
          onClick={() => handleOpenNewTransaction('expense')}
          className="w-13 h-13 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-transform active:scale-95"
          aria-label="Add transaction"
        >
          <Plus className="w-6 h-6 text-emerald-400" />
        </button>
      </div>

      {/* Detail / Inspection Modal */}
      <TransactionDetailModal
        transaction={detailTransaction}
        onClose={() => setDetailTransaction(null)}
        onEdit={handleStartEditing}
        onDelete={handleDeleteTransaction}
        currentCurrency={currentCurrency}
      />

      {/* Add / Edit Transaction Form Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currentCurrency={currentCurrency}
        defaultType={newTxPresetType}
      />

      {/* Monthly Budget Adjustment Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={monthlyBudget}
        onSaveBudget={(val) => {
          setMonthlyBudget(val);
          showToast('Monthly budget cap updated');
        }}
        currentCurrency={currentCurrency}
      />

      {/* Transient Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium py-2.5 px-4 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Site Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 font-bold text-slate-800">
              <LogoM className="w-5 h-5 -mr-0.5" />
              <span>oneyLedger</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Local & offline-ready financial tracking</span>
          </div>
          <div>
            <span>Data stored securely in your browser</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
