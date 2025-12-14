import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { Transaction, TransactionType, ExpenseTag, Settings } from '../types';
import { Calendar, Filter } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  settings: Settings;
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];
const TAG_COLORS: Record<ExpenseTag, string> = {
    [ExpenseTag.NEED]: '#ef4444', // Red
    [ExpenseTag.WANT]: '#f59e0b', // Amber
    [ExpenseTag.INVEST]: '#10b981', // Green
    [ExpenseTag.ADJUSTMENT]: '#64748b' // Slate
};

const AnalyticsView: React.FC<Props> = ({ transactions, settings }) => {
  // Time Filtering State
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter transactions based on time
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (timeFilter === 'THIS_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (timeFilter === 'LAST_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (timeFilter === 'CUSTOM' && customStart && customEnd) {
        start = new Date(customStart);
        end = new Date(customEnd);
    }

    if (!start || !end) return transactions;

    return transactions.filter(t => {
        const d = new Date(t.date);
        return d >= start! && d <= end!;
    });
  }, [transactions, timeFilter, customStart, customEnd]);

  // 1. Tag Breakdown (Need, Want, Invest)
  const expenses = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const tagData = Object.values(ExpenseTag).map(tag => {
      const amount = expenses.filter(t => t.tag === tag).reduce((acc, curr) => acc + curr.amount, 0);
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      const limit = settings.tagLimits[tag] || 0;
      return { name: tag, value: amount, percentage, limit, color: TAG_COLORS[tag] };
  }).filter(d => d.value > 0);

  // 2. Category Breakdown
  const expensesByCategory = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map((cat, index) => ({
    name: cat,
    value: expensesByCategory[cat],
    color: COLORS[index % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  // 3. Account Balances (Current Snapshot - NOT affected by time filter usually, 
  //    but prompt says "Account Balance of all the bank in Analytics Screen. Values of (Income, Expence and parked)")
  //    Typically balances are lifetime, so we use `transactions` prop, NOT `filteredTransactions` for current balance.
  const accountBalances = settings.bankAccounts.map(acc => {
      const income = transactions.filter(t => t.type === TransactionType.INCOME && t.bankAccount === acc).reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions.filter(t => t.type === TransactionType.EXPENSE && t.bankAccount === acc).reduce((sum, t) => sum + t.amount, 0);
      const parked = transactions.filter(t => t.type === TransactionType.PARKED && t.bankAccount === acc).reduce((sum, t) => sum + t.amount, 0);
      return {
          name: acc,
          income,
          expense,
          parked,
          balance: income - expense - parked
      };
  });

  return (
    <div className="pb-24 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Analytics</h1>
        <p className="text-gray-500 text-sm">Financial Health Check</p>
      </div>

      {/* Time Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <div className="flex items-center gap-2 mb-3">
             <Filter size={16} className="text-indigo-500" />
             <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Time Period</span>
         </div>
         <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm mb-2"
         >
             <option value="ALL">All Time</option>
             <option value="THIS_MONTH">This Month</option>
             <option value="LAST_MONTH">Last Month</option>
             <option value="CUSTOM">Custom Range</option>
         </select>
         
         {timeFilter === 'CUSTOM' && (
             <div className="flex gap-2">
                 <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="flex-1 p-2 text-xs border rounded-lg" />
                 <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="flex-1 p-2 text-xs border rounded-lg" />
             </div>
         )}
      </div>

      {/* Account Balances Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="font-semibold text-gray-800 mb-4">Account Balances</h3>
         <div className="space-y-4">
             {accountBalances.map(acc => (
                 <div key={acc.name} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                     <div className="flex justify-between items-center mb-1">
                         <span className="font-medium text-gray-700">{acc.name}</span>
                         <span className={`font-bold ${acc.balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                             {settings.currencySymbol}{acc.balance.toLocaleString()}
                         </span>
                     </div>
                     <div className="flex justify-between text-[10px] text-gray-400">
                         <span className="text-green-600">+{settings.currencySymbol}{acc.income.toLocaleString()}</span>
                         <span className="text-red-400">-{settings.currencySymbol}{acc.expense.toLocaleString()}</span>
                         <span className="text-purple-400">Pk: {settings.currencySymbol}{acc.parked.toLocaleString()}</span>
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* 50/30/20 Rule Analysis */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Budget Utilization (Tags)</h3>
          <p className="text-xs text-gray-400 mb-4">Based on filtered period</p>
          <div className="space-y-4">
              {tagData.map((item) => (
                  <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{item.name}</span>
                          <span className="text-gray-500">
                              {Math.round(item.percentage)}% used (Limit: {item.limit}%)
                          </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="h-2.5 rounded-full" 
                            style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }}
                          ></div>
                      </div>
                  </div>
              ))}
              {tagData.length === 0 && <p className="text-sm text-gray-400 text-center">No expenses tagged in this period.</p>}
          </div>
      </div>

      {/* Spending Breakdown Pie */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Category Breakdown</h3>
        <div className="h-64 w-full">
            {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${settings.currencySymbol}${value}`} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No expense data in this period
                </div>
            )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {pieData.slice(0, 5).map(item => (
                <div key={item.name} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                    {item.name}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;