import { CategoryItem, CurrencyConfig, PaymentMethod } from '../types.ts';

export const CATEGORIES: CategoryItem[] = [
  // Expense Categories
  { id: 'groceries', name: 'Groceries & Market', type: 'expense', icon: 'ShoppingCart', colorClass: 'text-emerald-700 bg-emerald-50' },
  { id: 'dining', name: 'Dining & Cafes', type: 'expense', icon: 'Utensils', colorClass: 'text-amber-700 bg-amber-50' },
  { id: 'housing', name: 'Housing & Rent', type: 'expense', icon: 'Home', colorClass: 'text-indigo-700 bg-indigo-50' },
  { id: 'utilities', name: 'Utilities & Bills', type: 'expense', icon: 'Zap', colorClass: 'text-blue-700 bg-blue-50' },
  { id: 'transport', name: 'Transit & Fuel', type: 'expense', icon: 'Car', colorClass: 'text-cyan-700 bg-cyan-50' },
  { id: 'shopping', name: 'Shopping & Retail', type: 'expense', icon: 'ShoppingBag', colorClass: 'text-pink-700 bg-pink-50' },
  { id: 'entertainment', name: 'Entertainment & Fun', type: 'expense', icon: 'Film', colorClass: 'text-purple-700 bg-purple-50' },
  { id: 'health', name: 'Healthcare & Wellness', type: 'expense', icon: 'HeartPulse', colorClass: 'text-rose-700 bg-rose-50' },
  { id: 'travel', name: 'Travel & Lodging', type: 'expense', icon: 'Plane', colorClass: 'text-sky-700 bg-sky-50' },
  { id: 'education', name: 'Education & Courses', type: 'expense', icon: 'BookOpen', colorClass: 'text-teal-700 bg-teal-50' },
  { id: 'other_expense', name: 'General Expense', type: 'expense', icon: 'ArrowUpRight', colorClass: 'text-slate-700 bg-slate-100' },

  // Income Categories
  { id: 'salary', name: 'Primary Salary', type: 'income', icon: 'Briefcase', colorClass: 'text-emerald-700 bg-emerald-50' },
  { id: 'freelance', name: 'Freelance & Contract', type: 'income', icon: 'Laptop', colorClass: 'text-blue-700 bg-blue-50' },
  { id: 'investment', name: 'Investments & Dividends', type: 'income', icon: 'TrendingUp', colorClass: 'text-indigo-700 bg-indigo-50' },
  { id: 'gift_income', name: 'Gift / Reimbursement', type: 'income', icon: 'Gift', colorClass: 'text-violet-700 bg-violet-50' },
  { id: 'other_income', name: 'General Income', type: 'income', icon: 'ArrowDownLeft', colorClass: 'text-teal-700 bg-teal-50' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'cash', label: 'Cash' },
  { id: 'digital_wallet', label: 'Digital Wallet / Pay' },
];

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
];

export function getCategoryById(categoryId: string): CategoryItem {
  const found = CATEGORIES.find(c => c.id === categoryId);
  if (found) return found;
  return {
    id: categoryId,
    name: categoryId.replace(/_/g, ' '),
    type: 'expense',
    icon: 'Tag',
    colorClass: 'text-slate-700 bg-slate-100',
  };
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const found = PAYMENT_METHODS.find(m => m.id === method);
  return found ? found.label : method;
}
