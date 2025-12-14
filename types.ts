export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  PARKED = 'parked',
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
  GOAL_CONTRIBUTION = 'Goal Contribution'
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
  bankAccount?: string;    // Required for Income, Parked AND Expense now
  goalId?: string;         // Required for Parked
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  deadline?: string;
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
  categories: string[];   // Dynamic list of categories
  tagLimits: {
    [key in ExpenseTag]: number;
  };
  privacyModeEnabled: boolean;
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
  GOALS = 'goals'
}

export interface ExpenseSummary {
  category: string;
  amount: number;
  color: string;
}