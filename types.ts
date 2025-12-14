export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  PARKED = 'parked',
  TRANSFER = 'transfer',
}

// Keeping Enum for default initialization, but app will use strings mostly
export enum Category {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transportation',
  SHOPPING = 'Shopping',
  BILLS = 'Bills & Utilities',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health',
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  OTHER = 'Other',
  GOAL_CONTRIBUTION = 'Goal Contribution',
  TRANSFER = 'Inter Account Transfer'
}

export enum ExpenseTag {
  NEED = 'Need',
  WANT = 'Want',
  INVEST = 'Invest',
  ADJUSTMENT = 'Adjustments',
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string; // Changed from Enum to string to support custom categories
  date: string; // ISO string
  note: string;
  
  tag?: ExpenseTag;        // Required for Expense
  bankAccount?: string;    // Required for Income, Parked, Expense (Source), Transfer (Source)
  toAccount?: string;      // Required for Transfer (Destination)
  goalId?: string;         // Required for Parked
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  deadline?: string;
}

export interface ExchangeCard {
  id: string;
  from: string;
  to: string;
  amount: number;
  rate: number | null;
  lastUpdated: string | null;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Settings {
  currencySymbol: string; // Storing the symbol (e.g. $)
  currencyCode: string;   // Storing the code (e.g. USD)
  bankAccounts: string[];
  parkAccounts: string[]; 
  
  // Split categories
  expenseCategories: string[];
  incomeCategories: string[];

  tagLimits: {
    [key in ExpenseTag]: number;
  };
  privacyModeEnabled: boolean;
  enableAI: boolean; 
  
  // New Settings
  primaryAccount: string; // The "Main Bank" logic
  dashboardScope: 'ALL' | 'PRIMARY'; // Calculate overview based on all or just main
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export enum AppView {
  LOGIN = 'login',
  PIN_SETUP = 'pin_setup',
  PIN_ENTRY = 'pin_entry',
  DASHBOARD = 'dashboard',
  ADD = 'add',
  ANALYTICS = 'analytics',
  AI_INSIGHTS = 'ai_insights',
  SETTINGS = 'settings',
  GOALS = 'goals',
  EXCHANGE_RATE = 'exchange_rate'
}

export interface ExpenseSummary {
  category: string;
  amount: number;
  color: string;
}