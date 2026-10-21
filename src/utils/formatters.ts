import { Transaction, PaymentMethod } from '../types.ts';
import { SUPPORTED_CURRENCIES } from '../data/categories.ts';

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  
  // Format with standard Intl or fallback
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function exportTransactionsToCSV(transactions: Transaction[]): void {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes'];
  
  const rows = transactions.map(t => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.type}"`,
    `"${t.category}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${t.paymentMethod}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `moneyledger_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVToTransactions(csvText: string): Transaction[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const results: Transaction[] = [];

  // Simple CSV line splitter that handles quotes
  const parseLine = (text: string) => {
    const values: string[] = [];
    let insideQuote = false;
    let currentValue = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (insideQuote && text[i + 1] === '"') {
          currentValue += '"';
          i++; // skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    return values;
  };

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = parseLine(rawLine);
    if (cols.length >= 6) {
      const id = cols[0] || `tx-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const date = cols[1] || new Date().toISOString().split('T')[0];
      const type = cols[2] === 'income' ? 'income' : 'expense';
      const category = cols[3] || 'other_expense';
      const description = cols[4] || 'Imported Entry';
      const amount = parseFloat(cols[5]) || 0;
      const paymentMethod = (cols[6] as PaymentMethod) || 'credit_card';
      const notes = cols[7] || '';

      if (amount > 0) {
        results.push({
          id,
          date,
          type,
          category,
          description,
          amount,
          paymentMethod,
          notes,
          createdAt: Date.now(),
        });
      }
    }
  }

  return results;
}
