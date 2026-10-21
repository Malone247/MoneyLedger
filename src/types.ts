export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'bank_transfer' 
  | 'digital_wallet';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  colorClass: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}
