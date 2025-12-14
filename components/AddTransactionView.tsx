import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, ExpenseTag, Goal, Settings } from '../types';
import { Check, DollarSign, Calendar, AlignLeft, ArrowLeft } from 'lucide-react';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (transaction: Transaction) => void;
  onCancel: () => void;
  goals: Goal[];
  settings: Settings;
  initialData?: Transaction | null;
}

const AddTransactionView: React.FC<Props> = ({ onAdd, onUpdate, onCancel, goals, settings, initialData }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Fields
  const [tag, setTag] = useState<ExpenseTag>(ExpenseTag.NEED);
  const [bankAccount, setBankAccount] = useState<string>(settings.bankAccounts[0] || 'Cash');
  const [goalId, setGoalId] = useState<string>('');
  const [parkAccount, setParkAccount] = useState<string>(settings.parkAccounts[0] || 'Cash');

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setType(initialData.type);
      setCategory(initialData.category);
      setNote(initialData.note);
      setDate(initialData.date.split('T')[0]);
      
      if (initialData.tag) setTag(initialData.tag);
      if (initialData.bankAccount) {
          if (initialData.type === TransactionType.PARKED) {
             setParkAccount(initialData.bankAccount);
          } else {
             setBankAccount(initialData.bankAccount);
          }
      }
      if (initialData.goalId) setGoalId(initialData.goalId);
    } else {
      // Default category if not set
      if (settings.categories.length > 0) {
          setCategory(settings.categories[0]);
      }
    }
  }, [initialData, settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const payload: any = {
      amount: parseFloat(amount),
      type,
      date,
      note: note || 'No description',
    };

    if (type === TransactionType.EXPENSE) {
        payload.category = category;
        payload.tag = tag;
        payload.bankAccount = bankAccount; // Now Expenses also have a source
    } else if (type === TransactionType.INCOME) {
        payload.category = 'Salary'; 
        // Allow user to pick category for income if they want, but typically Salary/Freelance
        if (category) payload.category = category;
        
        payload.bankAccount = bankAccount;
    } else if (type === TransactionType.PARKED) {
        if(!goalId) {
            alert("Please select a goal");
            return;
        }
        payload.category = 'Goal Contribution';
        payload.goalId = goalId;
        payload.bankAccount = parkAccount;
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
        {/* Type Selector */}
        <div className="bg-gray-200 p-1 rounded-xl flex text-center">
          <button
            type="button"
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
              type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType(TransactionType.INCOME)}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
              type === TransactionType.INCOME ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType(TransactionType.PARKED)}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
              type === TransactionType.PARKED ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Parked
          </button>
        </div>

        {/* Amount Input */}
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Amount ({settings.currencySymbol})</label>
            <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-3xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm border border-gray-100"
                    autoFocus
                    required
                    step="0.01"
                />
            </div>
        </div>

        {/* Dynamic Fields based on Type */}
        {type === TransactionType.EXPENSE && (
            <div className="space-y-4 animate-fade-in">
                {/* Paid From */}
                <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Paid From (Account)</label>
                     <select 
                        value={bankAccount} 
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full p-4 bg-white rounded-xl border border-gray-100 text-gray-700 font-medium"
                    >
                        {settings.bankAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Tag (Mandatory)</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {Object.values(ExpenseTag).map(t => (
                            <button 
                                key={t} 
                                type="button"
                                onClick={() => setTag(t)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${tag === t ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {settings.categories.map((cat) => (
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

        {type === TransactionType.INCOME && (
            <div className="space-y-4 animate-fade-in">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Deposit To Account</label>
                    <select 
                        value={bankAccount} 
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full p-4 bg-white rounded-xl border border-gray-100 text-gray-700 font-medium"
                    >
                        {settings.bankAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Source Category</label>
                     <div className="flex flex-wrap gap-2">
                        {settings.categories.map((cat) => (
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

        {type === TransactionType.PARKED && (
             <div className="space-y-4 animate-fade-in">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">For Goal</label>
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
                        {settings.parkAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                    </select>
                </div>
             </div>
        )}

        {/* Details */}
        <div className="space-y-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
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