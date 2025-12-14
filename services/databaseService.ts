import { Transaction, User, Settings, Goal, ExpenseTag, Category } from "../types";

const STORAGE_KEYS = {
  TRANSACTIONS: 'fintrack_transactions',
  USER: 'fintrack_user',
  PIN: 'fintrack_pin',
  SETTINGS: 'fintrack_settings',
  GOALS: 'fintrack_goals'
};

const DEFAULT_SETTINGS: Settings = {
  currencySymbol: '$',
  currencyCode: 'USD',
  bankAccounts: ['Cash', 'Main Bank'],
  parkAccounts: ['Cash', 'Main Bank', 'Vault'],
  categories: Object.values(Category), // Initialize with default enum values
  tagLimits: {
    [ExpenseTag.NEED]: 50,
    [ExpenseTag.WANT]: 30,
    [ExpenseTag.INVEST]: 20,
    [ExpenseTag.ADJUSTMENT]: 0
  },
  privacyModeEnabled: false,
  enableAI: true // Default to true, but user can disable
};

export const db = {
  // --- User & Auth ---
  async saveUser(user: User): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  async setPin(pin: string): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.PIN, pin);
  },

  async verifyPin(inputPin: string): Promise<boolean> {
    const storedPin = localStorage.getItem(STORAGE_KEYS.PIN);
    return storedPin === inputPin;
  },

  async hasPin(): Promise<boolean> {
    return !!localStorage.getItem(STORAGE_KEYS.PIN);
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PIN);
  },

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    const current = await this.getTransactions();
    const updated = [transaction, ...current];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  },

  async updateTransaction(transaction: Transaction): Promise<void> {
    const current = await this.getTransactions();
    const updated = current.map(t => t.id === transaction.id ? transaction : t);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  },

  // --- Settings ---
  async getSettings(): Promise<Settings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    
    // Migration: If old settings exist without categories or enableAI, add them
    const parsed = JSON.parse(data);
    if (!parsed.categories) {
        parsed.categories = Object.values(Category);
    }
    if (parsed.enableAI === undefined) {
        parsed.enableAI = true;
    }
    return parsed;
  },

  async saveSettings(settings: Settings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- Goals ---
  async getGoals(): Promise<Goal[]> {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  },

  async saveGoal(goal: Goal): Promise<void> {
    const goals = await this.getGoals();
    goals.push(goal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  async deleteGoal(id: string): Promise<void> {
    const goals = await this.getGoals();
    const updated = goals.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  },

  // --- Export ---
  async exportData(): Promise<string> {
    const transactions = await this.getTransactions();
    const user = await this.getUser();
    const settings = await this.getSettings();
    const goals = await this.getGoals();
    
    const exportData = {
      app: "FinTrack AI",
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
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PIN);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
  }
};