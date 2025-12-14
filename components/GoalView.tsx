import React from 'react';
import { Goal, Transaction, TransactionType, Settings } from '../types';
import { Target, Trophy } from 'lucide-react';

interface Props {
  goals: Goal[];
  transactions: Transaction[];
  settings: Settings;
  isPrivacyMode: boolean;
}

const GoalView: React.FC<Props> = ({ goals, transactions, settings, isPrivacyMode }) => {
  
  const getGoalProgress = (goalId: string) => {
    return transactions
      .filter(t => t.type === TransactionType.PARKED && t.goalId === goalId)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const formatMoney = (amount: number) => {
    if (isPrivacyMode) return `${settings.currencySymbol}****`;
    return `${settings.currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <div className="pb-24 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Goals <Trophy className="text-yellow-500 fill-yellow-500" />
        </h1>
        <p className="text-gray-500 text-sm">Track your parked funds</p>
      </div>

      {goals.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-400 mb-2">No goals set yet.</p>
              <p className="text-xs text-indigo-500">Go to Settings to create a goal.</p>
          </div>
      ) : (
          <div className="grid gap-4">
              {goals.map(goal => {
                  const saved = getGoalProgress(goal.id);
                  const progress = Math.min((saved / goal.targetAmount) * 100, 100);
                  
                  // Find where the money is parked for this goal
                  const parkedLocations = transactions
                    .filter(t => t.type === TransactionType.PARKED && t.goalId === goal.id)
                    .reduce((acc, curr) => {
                        const loc = curr.bankAccount || 'Unknown';
                        acc[loc] = (acc[loc] || 0) + curr.amount;
                        return acc;
                    }, {} as Record<string, number>);

                  return (
                      <div key={goal.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <h3 className="font-bold text-gray-800 text-lg">{goal.name}</h3>
                                  <p className="text-xs text-gray-500">Target: {formatMoney(goal.targetAmount)}</p>
                              </div>
                              <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                                  {Math.round(progress)}%
                              </div>
                          </div>

                          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                              ></div>
                          </div>

                          <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-gray-900">{formatMoney(saved)}</span>
                              <Target size={20} className="text-gray-300" />
                          </div>

                          {/* Parked Locations */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Parked At</p>
                              <div className="flex flex-wrap gap-2">
                                  {Object.entries(parkedLocations).map(([loc, amt]) => (
                                      <span key={loc} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                          {loc}: {formatMoney(amt as number)}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default GoalView;