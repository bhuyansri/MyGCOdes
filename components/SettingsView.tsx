import React, { useState } from 'react';
import { Settings, ExpenseTag, Goal, Currency } from '../types';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/databaseService';

interface Props {
  settings: Settings;
  goals: Goal[];
  onSaveSettings: (settings: Settings) => void;
  onAddGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onBack: () => void;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
];

const SettingsView: React.FC<Props> = ({ settings, goals, onSaveSettings, onAddGoal, onDeleteGoal, onBack }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [newBankAccount, setNewBankAccount] = useState('');
  const [newParkAccount, setNewParkAccount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  // New Goal State
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const handleSave = () => {
    onSaveSettings(localSettings);
    onBack();
  };

  const addBankAccount = () => {
    if (newBankAccount && !localSettings.bankAccounts.includes(newBankAccount)) {
      setLocalSettings(prev => ({
        ...prev,
        bankAccounts: [...prev.bankAccounts, newBankAccount],
        // Also add to park accounts by default
        parkAccounts: prev.parkAccounts.includes(newBankAccount) ? prev.parkAccounts : [...prev.parkAccounts, newBankAccount]
      }));
      setNewBankAccount('');
    }
  };

  const addParkAccount = () => {
    if (newParkAccount && !localSettings.parkAccounts.includes(newParkAccount)) {
        setLocalSettings(prev => ({
          ...prev,
          parkAccounts: [...prev.parkAccounts, newParkAccount]
        }));
        setNewParkAccount('');
    }
  };

  const addCategory = () => {
    if (newCategory && !localSettings.categories.includes(newCategory)) {
        setLocalSettings(prev => ({
            ...prev,
            categories: [...prev.categories, newCategory]
        }));
        setNewCategory('');
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const code = e.target.value;
      const currency = CURRENCIES.find(c => c.code === code);
      if (currency) {
          setLocalSettings({
              ...localSettings,
              currencyCode: currency.code,
              currencySymbol: currency.symbol
          });
      }
  };

  const handleCreateGoal = () => {
      if(newGoalName && newGoalTarget) {
          onAddGoal({
              id: uuidv4(),
              name: newGoalName,
              targetAmount: parseFloat(newGoalTarget)
          });
          setNewGoalName('');
          setNewGoalTarget('');
      }
  };
  
  const handleWipeData = async () => {
      if (confirm("ARE YOU SURE? This will permanently delete ALL transactions, settings, and account info from this device. This action cannot be undone.")) {
          await db.clearAllData();
          window.location.reload(); // Hard reload to reset app state
      }
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="space-y-8">
        {/* General */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">General</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Currency</label>
                    <select 
                        value={localSettings.currencyCode}
                        onChange={handleCurrencyChange}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                        {CURRENCIES.map(c => (
                            <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Encrypt/Hide Values Initially</span>
                    <button 
                        onClick={() => setLocalSettings({...localSettings, privacyModeEnabled: !localSettings.privacyModeEnabled})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.privacyModeEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${localSettings.privacyModeEnabled ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>
            </div>
        </section>
        
        {/* Privacy & Data */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <Shield size={20} className="text-green-600" />
                <h3 className="font-bold text-gray-800">Privacy & Data</h3>
            </div>
            
            <div className="space-y-6">
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-xs text-green-800 font-medium">
                        Your financial data is stored locally on this device. We do not track, sell, or sync your data to any cloud servers by default.
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-gray-700 font-medium block">Enable AI Advisor</span>
                        <span className="text-[10px] text-gray-500 max-w-[200px] block leading-tight mt-1">
                            Sends anonymized transaction summaries to Google Gemini for processing. Disable to keep data 100% offline.
                        </span>
                    </div>
                    <button 
                        onClick={() => setLocalSettings({...localSettings, enableAI: !localSettings.enableAI})}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${localSettings.enableAI ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${localSettings.enableAI ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <button 
                        onClick={handleWipeData}
                        className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 py-3 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                        <AlertTriangle size={18} />
                        Delete All Data & Reset
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        Permanently wipes local storage database.
                    </p>
                </div>
            </div>
        </section>

        {/* Categories */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Transaction Categories</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {localSettings.categories.map(cat => (
                    <span key={cat} className="flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                        {cat}
                        {/* Prevent deleting if it's the only category, or maybe advanced logic later */}
                        <button onClick={() => setLocalSettings(prev => ({...prev, categories: prev.categories.filter(c => c !== cat)}))}>
                            <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="New Category" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                />
                <button onClick={addCategory} className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Plus size={20} /></button>
            </div>
        </section>

        {/* Bank Accounts */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Bank Accounts</h3>
            <ul className="mb-4 space-y-2">
                {localSettings.bankAccounts.map(acc => (
                    <li key={acc} className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        {acc}
                        {acc !== 'Cash' && (
                             <button onClick={() => setLocalSettings(prev => ({...prev, bankAccounts: prev.bankAccounts.filter(a => a !== acc)}))}><Trash2 size={14} className="text-red-400" /></button>
                        )}
                    </li>
                ))}
            </ul>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="New Bank Account" 
                    value={newBankAccount}
                    onChange={(e) => setNewBankAccount(e.target.value)}
                    className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                />
                <button onClick={addBankAccount} className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Plus size={20} /></button>
            </div>
        </section>

         {/* Park Accounts */}
         <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Park Accounts</h3>
            <p className="text-xs text-gray-500 mb-3">Where you physically keep money for goals.</p>
            <ul className="mb-4 space-y-2">
                {localSettings.parkAccounts.map(acc => (
                    <li key={acc} className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        {acc}
                        <button onClick={() => setLocalSettings(prev => ({...prev, parkAccounts: prev.parkAccounts.filter(a => a !== acc)}))}><Trash2 size={14} className="text-red-400" /></button>
                    </li>
                ))}
            </ul>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="New Park Account (e.g. Vault)" 
                    value={newParkAccount}
                    onChange={(e) => setNewParkAccount(e.target.value)}
                    className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                />
                <button onClick={addParkAccount} className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Plus size={20} /></button>
            </div>
        </section>

        {/* Goals Management */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Goals</h3>
            <div className="space-y-3 mb-4">
                {goals.map(goal => (
                    <div key={goal.id} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
                        <div>
                            <p className="font-semibold">{goal.name}</p>
                            <p className="text-xs text-gray-500">Target: {localSettings.currencySymbol}{goal.targetAmount}</p>
                        </div>
                        <button onClick={() => onDeleteGoal(goal.id)} className="text-red-500 bg-red-50 p-2 rounded-full"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <input 
                    type="text" 
                    placeholder="Goal Name" 
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                />
                <input 
                    type="number" 
                    placeholder="Target Amount" 
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                />
            </div>
            <button onClick={handleCreateGoal} className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-semibold">Add Goal</button>
        </section>

        {/* Tag Limits */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Expense Tag Limits (%)</h3>
            <div className="space-y-4">
                {Object.values(ExpenseTag).map(tag => (
                    tag !== ExpenseTag.ADJUSTMENT && (
                        <div key={tag}>
                            <label className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                <span>{tag}</span>
                                <span>{localSettings.tagLimits[tag]}%</span>
                            </label>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={localSettings.tagLimits[tag]}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings, 
                                    tagLimits: { ...localSettings.tagLimits, [tag]: parseInt(e.target.value) }
                                })}
                                className="w-full accent-indigo-600"
                            />
                        </div>
                    )
                ))}
            </div>
        </section>

        <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
            <Save size={24} />
            Save Configuration
        </button>
      </div>
    </div>
  );
};

export default SettingsView;