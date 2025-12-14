import React, { useState } from 'react';
import { Transaction, TransactionType, Settings } from '../types';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Download, Eye, EyeOff, Settings as SettingsIcon, Archive, ArrowRightLeft, Globe } from 'lucide-react';
import { db } from '../services/databaseService';

interface Props {
  transactions: Transaction[];
  settings: Settings;
  onOpenSettings: () => void;
  onOpenExchange: () => void;
  isPrivacyMode: boolean;
  onTogglePrivacy: () => void;
  onEditTransaction: (t: Transaction) => void;
}

const DashboardView: React.FC<Props> = ({ transactions, settings, onOpenSettings, onOpenExchange, isPrivacyMode, onTogglePrivacy, onEditTransaction }) => {
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');

  // Filter based on selected scope (ALL vs PRIMARY)
  const scopeTransactions = transactions.filter(t => {
      if (settings.dashboardScope === 'ALL') return true;
      // If Primary Only: Include if it affects the primary account
      return t.bankAccount === settings.primaryAccount || t.toAccount === settings.primaryAccount;
  });

  const totalIncome = scopeTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .filter(t => settings.dashboardScope === 'ALL' || t.bankAccount === settings.primaryAccount)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = scopeTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .filter(t => settings.dashboardScope === 'ALL' || t.bankAccount === settings.primaryAccount)
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalParked = scopeTransactions
    .filter(t => t.type === TransactionType.PARKED)
    .filter(t => settings.dashboardScope === 'ALL' || t.bankAccount === settings.primaryAccount)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Transfer Calculation logic
  let transferNet = 0;
  if (settings.dashboardScope === 'PRIMARY') {
      const incomingTransfers = scopeTransactions
        .filter(t => t.type === TransactionType.TRANSFER && t.toAccount === settings.primaryAccount)
        .reduce((acc, curr) => acc + curr.amount, 0);
        
      const outgoingTransfers = scopeTransactions
        .filter(t => t.type === TransactionType.TRANSFER && t.bankAccount === settings.primaryAccount)
        .reduce((acc, curr) => acc + curr.amount, 0);
        
      transferNet = incomingTransfers - outgoingTransfers;
  }
  // If scope is ALL, transferNet is 0 because money just moved inside the system.

  const balance = totalIncome - totalExpense - totalParked + transferNet;

  const filteredTransactions = transactions
    .filter(t => filterType === 'ALL' || t.type === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExport = async () => {
    const jsonString = await db.exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fintrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("Data exported!");
  };

  const formatAmount = (amount: number) => {
    if (isPrivacyMode) return `${settings.currencySymbol}****`;
    return `${settings.currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Wallet</h1>
          <p className="text-sm text-gray-500">
              {settings.dashboardScope === 'PRIMARY' ? `${settings.primaryAccount} Overview` : 'Total Net Worth'}
              {db.isForeignView() && <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Foreign View</span>}
          </p>
        </div>
        <div className="flex gap-2">
            <button onClick={onTogglePrivacy} className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 active:bg-gray-200">
                {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button onClick={handleExport} className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 active:bg-gray-200">
                <Download size={18} />
            </button>
             <button onClick={onOpenExchange} className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 active:bg-indigo-100">
                <Globe size={18} />
            </button>
            <button onClick={onOpenSettings} className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <SettingsIcon size={20} />
            </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <p className="text-indigo-100 text-sm font-medium mb-1">Available Balance</p>
        <h2 className="text-4xl font-bold mb-6">{formatAmount(balance)}</h2>
        
        <div className="flex gap-2">
          <div className="flex-1 bg-white/20 rounded-xl p-2 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-indigo-100 text-[10px] uppercase">
               Income
            </div>
            <p className="font-semibold text-sm">{formatAmount(totalIncome)}</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-xl p-2 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-indigo-100 text-[10px] uppercase">
               Expense
            </div>
            <p className="font-semibold text-sm">{formatAmount(totalExpense)}</p>
          </div>
           <div className="flex-1 bg-white/20 rounded-xl p-2 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-indigo-100 text-[10px] uppercase">
               Parked
            </div>
            <p className="font-semibold text-sm">{formatAmount(totalParked)}</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex p-1 bg-gray-200 rounded-xl overflow-x-auto no-scrollbar">
          {(['ALL', TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.TRANSFER, TransactionType.PARKED] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg capitalize whitespace-nowrap transition-all ${filterType === type ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
              >
                  {type.toLowerCase()}
              </button>
          ))}
      </div>

      {/* Transactions List */}
      <div>
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400">No transactions found.</p>
            </div>
          ) : (
            filteredTransactions.map((t) => (
              <div 
                key={t.id} 
                onClick={() => onEditTransaction(t)}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                      t.type === TransactionType.INCOME ? 'bg-green-100 text-green-600' : 
                      t.type === TransactionType.PARKED ? 'bg-purple-100 text-purple-600' :
                      t.type === TransactionType.TRANSFER ? 'bg-blue-100 text-blue-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                    {t.type === TransactionType.INCOME && <TrendingUp size={18} />}
                    {t.type === TransactionType.EXPENSE && <TrendingDown size={18} />}
                    {t.type === TransactionType.PARKED && <Archive size={18} />}
                    {t.type === TransactionType.TRANSFER && <ArrowRightLeft size={18} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{t.category}</p>
                    <p className="text-xs text-gray-500">
                        {new Date(t.date).toLocaleDateString()} 
                        {t.type === TransactionType.TRANSFER 
                            ? ` • ${t.bankAccount} → ${t.toAccount}`
                            : t.bankAccount && ` • ${t.bankAccount}`
                        }
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${
                    t.type === TransactionType.INCOME ? 'text-green-600' : 
                    t.type === TransactionType.PARKED ? 'text-purple-600' :
                    t.type === TransactionType.TRANSFER ? 'text-blue-600' :
                    'text-gray-900'
                }`}>
                  {t.type === TransactionType.INCOME ? '+' : t.type === TransactionType.TRANSFER ? '' : '-'}{formatAmount(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;