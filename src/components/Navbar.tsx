import React from 'react';
import { Plus, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../data/categories.ts';
import { LogoM } from './MoneyLedgerLogo.tsx';

interface NavbarProps {
  activeTab: 'dashboard' | 'transactions' | 'analytics' | 'budget';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'analytics' | 'budget') => void;
  onOpenNewTransaction: () => void;
  currentCurrency: string;
  onChangeCurrency: (code: string) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  currentCurrency,
  onChangeCurrency,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Zone 1: Brand wordmark where M forms the logo */}
          <div className="flex items-center shrink-0">
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="inline-flex items-center gap-0.5 tracking-tight group whitespace-nowrap"
            >
              <LogoM className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-105" />
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 -ml-0.5">
                oney<span className="text-slate-900">Ledger</span>
              </span>
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Analytics & Trends
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'budget'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Budget Goals
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Currency selector */}
            <div className="relative inline-block text-left">
              <select
                aria-label="Select currency"
                value={currentCurrency}
                onChange={(e) => onChangeCurrency(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
              >
                {SUPPORTED_CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset data button for testing */}
            <button
              onClick={onResetData}
              title="Reset with sample data"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Demo Data</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'transactions' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'budget' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Budget
          </button>
        </div>
      </div>
    </header>
  );
};
