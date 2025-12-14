import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, ExpenseTag, Goal, Settings, Category } from '../types';
import { Check, DollarSign, Calendar, AlignLeft, ArrowLeft, ArrowRightLeft } from 'lucide-react';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (transaction: Transaction) => void;
  onCancel: () => void;
  goals: Goal[];
  settings: Settings;
  initialData?: Transaction | null;
}

// UI Options for the "Type" field
const TYPE_OPTIONS = ['Need', 'Want', 'Invest', 'Transfer', 'Park'];

const AddTransactionView: React.FC<Props> = ({ onAdd, onUpdate, onCancel, goals, settings, initialData }) => {
  // Main Tab State: Only 'EXPENSE' or 'INCOME'
  const [mainTab, setMainTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  
  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // The "Type" selection (formerly Tag). Defaults to 'Need'.
  const [selectedType, setSelectedType] = useState<string>('Need');

  // Account Fields
  const [bankAccount, setBankAccount] = useState<string>(settings.bankAccounts[0] || 'Cash'); // "Paid From" or "Deposit To"
  
  // Conditional Fields based on Type
  const [toAccount, setToAccount] = useState<string>(settings.bankAccounts[1] || 'Main Bank'); // For Transfer
  const [goalId, setGoalId] = useState<string>(''); // For Park
  const [parkAccount, setParkAccount] = useState<string>(settings.parkAccounts[0] || 'Cash'); // For Park

  // Determine which category list to use
  const activeCategoryList = mainTab === 'INCOME' ? settings.incomeCategories : settings.expenseCategories;

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setNote(initialData.note);
      setDate(initialData.date.split('T')[0]);
      
      if (initialData.type === TransactionType.INCOME) {
          setMainTab('INCOME');
          setCategory(initialData.category);
          if (initialData.bankAccount) setBankAccount(initialData.bankAccount);
      } else {
          setMainTab('EXPENSE');
          
          if (initialData.type === TransactionType.TRANSFER) {
              setSelectedType('Transfer');
              if (initialData.bankAccount) setBankAccount(initialData.bankAccount);
              if (initialData.toAccount) setToAccount(initialData.toAccount);
          } else if (initialData.type === TransactionType.PARKED) {
              setSelectedType('Park');
              if (initialData.bankAccount) setParkAccount(initialData.bankAccount);
              if (initialData.goalId) setGoalId(initialData.goalId);
          } else {
              // Standard Expense
              setSelectedType(initialData.tag || 'Need');
              setCategory(initialData.category);
              if (initialData.bankAccount) setBankAccount(initialData.bankAccount);
          }
      }
    } else {
      // Set default category when tab changes if current category isn't valid for new tab
      if (activeCategoryList.length > 0 && !activeCategoryList.includes(category)) {
          setCategory(activeCategoryList[0]);
      }
    }
  }, [initialData, settings, mainTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const payload: any = {
      amount: parseFloat(amount),
      date,
      note: note || 'No description',
    };

    if (mainTab === 'INCOME') {
        payload.type = TransactionType.INCOME;
        // If category is not set (empty string), pick the first one from income list
        payload.category = category || settings.incomeCategories[0];
        payload.bankAccount = bankAccount;
    } else {
        // Handle Expense Types
        if (selectedType === 'Transfer') {
            if (bankAccount === toAccount) {
                alert("From and To accounts must be different.");
                return;
            }
            payload.type = TransactionType.TRANSFER;
            payload.category = Category.TRANSFER;
            payload.bankAccount = bankAccount; // Source
            payload.toAccount = toAccount; // Destination
        } 
        else if (selectedType === 'Park') {
            if(!goalId) {
                alert("Please select a goal");
                return;
            }
            if (bankAccount === parkAccount) {
                 alert("Cannot park to the same account. Please choose a different Park Location.");
                 return;
            }
            payload.type = TransactionType.PARKED;
            payload.category = 'Goal Contribution';
            payload.goalId = goalId;
            // For Parked, we treat bankAccount as where the money IS now (destination)
            payload.bankAccount = parkAccount; 
        } 
        else {
            // Standard Expense (Need, Want, Invest)
            payload.type = TransactionType.EXPENSE;
            payload.category = category || settings.expenseCategories[0];
            payload.tag = selectedType as ExpenseTag;
            payload.bankAccount = bankAccount;
        }
    }

    if (initialData) {
        onUpdate({ ...payload, id: initialData.id });
    } else {
        onAdd(payload);
    }
  };

  return (
    <div className="h-full flex flex-col pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        
        {/* 1. Main Options (Expense / Income) */}
        <div className="bg-gray-200 p-1 rounded-xl flex text-center">
          <button
            type="button"
            onClick={() => setMainTab('EXPENSE')}
            className={`flex-1 py-3 px-2 rounded-lg text-sm font-bold transition-all ${
              mainTab === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setMainTab('INCOME')}
            className={`flex-1 py-3 px-2 rounded-lg text-sm font-bold transition-all ${
              mainTab === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Income
          </button>
        </div>

        {/* 2. Amount Input - Compact */}
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Amount ({settings.currencySymbol})</label>
            <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm border border-gray-100"
                    autoFocus
                    required
                    step="0.01"
                />
            </div>
        </div>

        {/* 3. Logic Branching */}
        
        {/* --- INCOME VIEW --- */}
        {mainTab === 'INCOME' && (
             <div className="space-y-4 animate-fade-in">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Deposit To Account</label>
                    <select 
                        value={bankAccount} 
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full p-3 bg-white rounded-xl border border-gray-100 text-gray-700 font-medium"
                    >
                        {settings.bankAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Source Category</label>
                     <div className="flex flex-wrap gap-2">
                        {activeCategoryList.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-3 rounded-xl text-xs font-medium border text-center transition-all ${
                                    category === cat 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                    : 'bg-white text-gray-600 border-gray-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- EXPENSE VIEW --- */}
        {mainTab === 'EXPENSE' && (
            <div className="space-y-4 animate-fade-in">
                
                {/* Paid From (Always visible for expense types) - Compact */}
                <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Paid From (Account)</label>
                     <select 
                        value={bankAccount} 
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full p-3 bg-white rounded-xl border border-gray-100 text-gray-700 font-medium"
                    >
                        {settings.bankAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                </div>

                {/* Type Selection */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                        Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {TYPE_OPTIONS.map(t => (
                            <button 
                                key={t} 
                                type="button"
                                onClick={() => setSelectedType(t)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap border transition-all ${
                                    selectedType === t 
                                    ? 'bg-gray-800 text-white border-gray-800 shadow-md' 
                                    : 'bg-white text-gray-600 border-gray-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conditional Fields based on Selected Type */}
                
                {/* A. Standard Expense (Need, Want, Invest) */}
                {['Need', 'Want', 'Invest'].includes(selectedType) && (
                    <div className="animate-fade-in">
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {activeCategoryList.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-3 rounded-xl text-xs font-medium border text-center transition-all ${
                                        category === cat 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                        : 'bg-white text-gray-600 border-gray-100'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* B. Transfer */}
                {selectedType === 'Transfer' && (
                    <div className="animate-fade-in">
                         <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase flex items-center gap-2">
                            To Bank <ArrowRightLeft size={14} className="text-blue-500" />
                         </label>
                         <select 
                            value={toAccount} 
                            onChange={(e) => setToAccount(e.target.value)}
                            className="w-full p-4 bg-white rounded-xl border border-gray-100 text-gray-700 font-medium"
                        >
                            {settings.bankAccounts.filter(acc => acc !== bankAccount).map(acc => <option key={acc} value={acc}>{acc}</option>)}
                        </select>
                    </div>
                )}

                {/* C. Park */}
                {selectedType === 'Park' && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Goal Selection</label>
                            {goals.length > 0 ? (
                                <select 
                                    value={goalId} 
                                    onChange={(e) => setGoalId(e.target.value)}
                                    className="w-full p-4 bg-white rounded-xl border border-gray-100 text-gray-700 font-medium"
                                >
                                    <option value="">Select a Goal...</option>
                                    {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            ) : (
                                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm">
                                    No goals found. Please create a goal in Settings first.
                                </div>
                            )}
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Park At (Account)</label>
                             <select 
                                value={parkAccount} 
                                onChange={(e) => setParkAccount(e.target.value)}
                                className="w-full p-4 bg-white rounded-xl border border-gray-100 text-gray-700 font-medium"
                            >
                                {/* Filter out the 'Paid From' account to avoid parking to self */}
                                {settings.parkAccounts.filter(acc => acc !== bankAccount).map(acc => <option key={acc} value={acc}>{acc}</option>)}
                            </select>
                        </div>
                    </div>
                )}

            </div>
        )}

        {/* 4. Common Details (Date, Note) */}
        <div className="space-y-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-2">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <Calendar size={20} className="text-gray-400" />
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 text-gray-700 font-medium focus:outline-none"
                    required
                />
            </div>
            <div className="flex items-center gap-3">
                <AlignLeft size={20} className="text-gray-400" />
                <input 
                    type="text" 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note"
                    className="flex-1 text-gray-700 focus:outline-none"
                />
            </div>
        </div>

        <button 
            type="submit" 
            className="mt-auto w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
            <Check size={24} />
            {initialData ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionView;