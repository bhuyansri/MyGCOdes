import { Transaction, User, Settings, Goal, ExpenseTag, Category, ExchangeCard, TransactionType } from "../types";
import { v4 as uuidv4 } from 'uuid';

const APP_MODE_KEY = 'fintrack_app_mode'; // 'REAL' or 'FOREIGN'

const BASE_KEYS = {
  TRANSACTIONS: 'fintrack_transactions',
  USER: 'fintrack_user',
  PIN: 'fintrack_pin',
  SETTINGS: 'fintrack_settings',
  GOALS: 'fintrack_goals',
  EXCHANGE_RATES: 'fintrack_exchange_rates'
};

const DEFAULT_SETTINGS: Settings = {
  currencySymbol: '$',
  currencyCode: 'USD',
  bankAccounts: ['Cash', 'Main Bank'],
  parkAccounts: ['Cash', 'Main Bank', 'Vault'],
  
  expenseCategories: [
    'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 
    'Entertainment', 'Health', 'Other'
  ],
  incomeCategories: [
    'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'
  ],

  tagLimits: {
    [ExpenseTag.NEED]: 50,
    [ExpenseTag.WANT]: 30,
    [ExpenseTag.INVEST]: 20,
    [ExpenseTag.ADJUSTMENT]: 0
  },
  privacyModeEnabled: true, // Default to TRUE as requested
  enableAI: false, 
  primaryAccount: 'Main Bank',
  dashboardScope: 'PRIMARY'
};

// Helper to get the correct key based on mode
const getKey = (baseKey: string) => {
    const mode = localStorage.getItem(APP_MODE_KEY);
    if (mode === 'FOREIGN') {
        return `foreign_${baseKey}`;
    }
    return baseKey;
};

// Seed Data for Foreign View
const seedForeignData = () => {
    const keys = {
        TRANSACTIONS: getKey(BASE_KEYS.TRANSACTIONS),
        USER: getKey(BASE_KEYS.USER),
        SETTINGS: getKey(BASE_KEYS.SETTINGS),
        GOALS: getKey(BASE_KEYS.GOALS),
        EXCHANGE_RATES: getKey(BASE_KEYS.EXCHANGE_RATES)
    };

    if (localStorage.getItem(keys.USER)) return; // Already seeded

    const dummyUser: User = { id: 'demo', name: 'Foreign Viewer', email: 'demo@fintrack.ai' };
    const dummySettings: Settings = { ...DEFAULT_SETTINGS, privacyModeEnabled: true };
    const dummyGoals: Goal[] = [
        { id: 'g1', name: 'Europe Trip', targetAmount: 5000, deadline: '2025-06-01' },
        { id: 'g2', name: 'Emergency Fund', targetAmount: 10000 }
    ];

    const today = new Date();
    const dummyTransactions: Transaction[] = [
        { id: uuidv4(), date: today.toISOString(), amount: 4500, type: TransactionType.INCOME, category: 'Salary', bankAccount: 'Main Bank', note: 'Monthly Salary' },
        { id: uuidv4(), date: new Date(today.getTime() - 86400000).toISOString(), amount: 120, type: TransactionType.EXPENSE, category: 'Food & Dining', tag: ExpenseTag.NEED, bankAccount: 'Main Bank', note: 'Grocery' },
        { id: uuidv4(), date: new Date(today.getTime() - 172800000).toISOString(), amount: 50, type: TransactionType.EXPENSE, category: 'Transportation', tag: ExpenseTag.NEED, bankAccount: 'Cash', note: 'Fuel' },
        { id: uuidv4(), date: new Date(today.getTime() - 259200000).toISOString(), amount: 200, type: TransactionType.PARKED, category: 'Goal Contribution', bankAccount: 'Vault', goalId: 'g1', note: 'Saving for trip' },
        { id: uuidv4(), date: new Date(today.getTime() - 345600000).toISOString(), amount: 1500, type: TransactionType.EXPENSE, category: 'Bills & Utilities', tag: ExpenseTag.NEED, bankAccount: 'Main Bank', note: 'Rent' },
        { id: uuidv4(), date: new Date(today.getTime() - 432000000).toISOString(), amount: 300, type: TransactionType.EXPENSE, category: 'Entertainment', tag: ExpenseTag.WANT, bankAccount: 'Main Bank', note: 'Concert tickets' },
    ];

    localStorage.setItem(keys.USER, JSON.stringify(dummyUser));
    localStorage.setItem(keys.SETTINGS, JSON.stringify(dummySettings));
    localStorage.setItem(keys.GOALS, JSON.stringify(dummyGoals));
    localStorage.setItem(keys.TRANSACTIONS, JSON.stringify(dummyTransactions));
    localStorage.setItem(keys.EXCHANGE_RATES, JSON.stringify([]));
};

export const db = {
  // --- App Mode ---
  isForeignView(): boolean {
      return localStorage.getItem(APP_MODE_KEY) === 'FOREIGN';
  },

  async toggleForeignView(enable: boolean): Promise<void> {
      if (enable) {
          localStorage.setItem(APP_MODE_KEY, 'FOREIGN');
          seedForeignData();
      } else {
          localStorage.removeItem(APP_MODE_KEY);
      }
  },

  // --- User & Auth ---
  async saveUser(user: User): Promise<void> {
    localStorage.setItem(getKey(BASE_KEYS.USER), JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const data = localStorage.getItem(getKey(BASE_KEYS.USER));
    return data ? JSON.parse(data) : null;
  },

  async setPin(pin: string): Promise<void> {
    // PIN is always shared or we can separate it. Let's keep PIN global for security.
    localStorage.setItem(BASE_KEYS.PIN, pin);
  },

  async verifyPin(inputPin: string): Promise<boolean> {
    const storedPin = localStorage.getItem(BASE_KEYS.PIN);
    return storedPin === inputPin;
  },

  async hasPin(): Promise<boolean> {
    return !!localStorage.getItem(BASE_KEYS.PIN);
  },

  async logout(): Promise<void> {
    const mode = this.isForeignView();
    if (mode) {
        localStorage.removeItem(getKey(BASE_KEYS.USER));
    } else {
        localStorage.removeItem(BASE_KEYS.USER);
        localStorage.removeItem(BASE_KEYS.PIN);
    }
  },

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    const data = localStorage.getItem(getKey(BASE_KEYS.TRANSACTIONS));
    return data ? JSON.parse(data) : [];
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    const current = await this.getTransactions();
    const updated = [transaction, ...current];
    localStorage.setItem(getKey(BASE_KEYS.TRANSACTIONS), JSON.stringify(updated));
  },

  async updateTransaction(transaction: Transaction): Promise<void> {
    const current = await this.getTransactions();
    const updated = current.map(t => t.id === transaction.id ? transaction : t);
    localStorage.setItem(getKey(BASE_KEYS.TRANSACTIONS), JSON.stringify(updated));
  },

  // --- Settings ---
  async getSettings(): Promise<Settings> {
    const data = localStorage.getItem(getKey(BASE_KEYS.SETTINGS));
    if (!data) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(data);
    // Migrations
    if (parsed.categories && (!parsed.expenseCategories || !parsed.incomeCategories)) {
        parsed.expenseCategories = parsed.categories;
        parsed.incomeCategories = DEFAULT_SETTINGS.incomeCategories;
        delete parsed.categories;
    }
    if (parsed.enableAI === undefined) parsed.enableAI = false;
    if (!parsed.primaryAccount) parsed.primaryAccount = parsed.bankAccounts[0] || 'Main Bank';
    if (!parsed.dashboardScope) parsed.dashboardScope = 'PRIMARY';
    
    return parsed;
  },

  async saveSettings(settings: Settings): Promise<void> {
    localStorage.setItem(getKey(BASE_KEYS.SETTINGS), JSON.stringify(settings));
  },

  // --- Account Management ---
  async renameAccount(oldName: string, newName: string): Promise<void> {
      const transactions = await this.getTransactions();
      const updatedTransactions = transactions.map(t => ({
          ...t,
          bankAccount: t.bankAccount === oldName ? newName : t.bankAccount,
          toAccount: t.toAccount === oldName ? newName : t.toAccount
      }));
      localStorage.setItem(getKey(BASE_KEYS.TRANSACTIONS), JSON.stringify(updatedTransactions));

      const settings = await this.getSettings();
      const updatedSettings = {
          ...settings,
          bankAccounts: settings.bankAccounts.map(acc => acc === oldName ? newName : acc),
          parkAccounts: settings.parkAccounts.map(acc => acc === oldName ? newName : acc),
          primaryAccount: settings.primaryAccount === oldName ? newName : settings.primaryAccount
      };
      await this.saveSettings(updatedSettings);
  },

  // --- Goals ---
  async getGoals(): Promise<Goal[]> {
    const data = localStorage.getItem(getKey(BASE_KEYS.GOALS));
    return data ? JSON.parse(data) : [];
  },

  async saveGoal(goal: Goal): Promise<void> {
    const goals = await this.getGoals();
    goals.push(goal);
    localStorage.setItem(getKey(BASE_KEYS.GOALS), JSON.stringify(goals));
  },

  async deleteGoal(id: string): Promise<void> {
    const goals = await this.getGoals();
    const updated = goals.filter(g => g.id !== id);
    localStorage.setItem(getKey(BASE_KEYS.GOALS), JSON.stringify(updated));
  },

  // --- Exchange Rates ---
  async getExchangeCards(): Promise<ExchangeCard[]> {
      const data = localStorage.getItem(getKey(BASE_KEYS.EXCHANGE_RATES));
      return data ? JSON.parse(data) : [];
  },

  async saveExchangeCards(cards: ExchangeCard[]): Promise<void> {
      localStorage.setItem(getKey(BASE_KEYS.EXCHANGE_RATES), JSON.stringify(cards));
  },

  // --- Export ---
  async exportData(): Promise<string> {
    const transactions = await this.getTransactions();
    const user = await this.getUser();
    const settings = await this.getSettings();
    const goals = await this.getGoals();
    
    const exportData = {
      app: "FinTrack AI",
      mode: this.isForeignView() ? "Foreign View" : "Real Data",
      exportedAt: new Date().toISOString(),
      user,
      settings,
      goals,
      transactions
    };
    
    return JSON.stringify(exportData, null, 2);
  },

  // --- Privacy & Cleanup ---
  async clearAllData(): Promise<void> {
    const k = BASE_KEYS; // For clear all, we might want to clear EVERYTHING including foreign
    // But usually clearAllData is for the current context.
    // Let's clear current context.
    const prefix = this.isForeignView() ? 'foreign_' : 'fintrack_';
    
    Object.values(BASE_KEYS).forEach(key => {
        // If foreign, remove foreign_key, else remove key
        const target = this.isForeignView() ? `foreign_${key}` : key;
        localStorage.removeItem(target);
    });
  }
};