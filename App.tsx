import React, { useState, useEffect } from 'react';
import { Transaction, AppView, User, Settings, Goal } from './types';
import DashboardView from './components/DashboardView';
import AddTransactionView from './components/AddTransactionView';
import AnalyticsView from './components/AnalyticsView';
import AiInsightsView from './components/AiInsightsView';
import LoginView from './components/LoginView';
import PinView from './components/PinView';
import SettingsView from './components/SettingsView';
import GoalView from './components/GoalView';
import { LayoutDashboard, Plus, PieChart, Sparkles, Trophy } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { db } from './services/databaseService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [isLoading, setIsLoading] = useState(true);
  const [pinError, setPinError] = useState('');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  // State for editing
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // 1. Initial Load
  useEffect(() => {
    const initApp = async () => {
      const storedUser = await db.getUser();
      const hasPin = await db.hasPin();
      const storedTransactions = await db.getTransactions();
      const storedSettings = await db.getSettings();
      const storedGoals = await db.getGoals();

      setTransactions(storedTransactions);
      setSettings(storedSettings);
      setGoals(storedGoals);
      setIsPrivacyMode(storedSettings.privacyModeEnabled);

      if (storedUser) {
        setUser(storedUser);
        if (hasPin) {
            setCurrentView(AppView.PIN_ENTRY);
        } else {
            setCurrentView(AppView.PIN_SETUP);
        }
      } else {
        setCurrentView(AppView.LOGIN);
      }
      setIsLoading(false);
    };

    initApp();
  }, []);

  // --- Handlers ---

  const handleLoginSuccess = async (loggedInUser: User) => {
    await db.saveUser(loggedInUser);
    setUser(loggedInUser);
    setCurrentView(AppView.PIN_SETUP);
  };

  const handlePinSetup = async (pin: string) => {
    await db.setPin(pin);
    setCurrentView(AppView.DASHBOARD);
  };

  const handlePinVerify = async (pin: string) => {
    const isValid = await db.verifyPin(pin);
    if (isValid) {
      setPinError('');
      setCurrentView(AppView.DASHBOARD);
    } else {
      setPinError('Incorrect PIN. Please try again.');
    }
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: uuidv4(),
    };
    await db.addTransaction(transaction);
    setTransactions([transaction, ...transactions]);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
      await db.updateTransaction(updatedTx);
      setTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
      setEditingTransaction(null);
      setCurrentView(AppView.DASHBOARD);
  };

  const handleEditRequest = (t: Transaction) => {
      setEditingTransaction(t);
      setCurrentView(AppView.ADD);
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    await db.saveSettings(newSettings);
    setSettings(newSettings);
    // Also update privacy local state if changed in settings
    setIsPrivacyMode(newSettings.privacyModeEnabled);
  };

  const handleAddGoal = async (goal: Goal) => {
    await db.saveGoal(goal);
    setGoals([...goals, goal]);
  };

  const handleDeleteGoal = async (id: string) => {
    await db.deleteGoal(id);
    setGoals(goals.filter(g => g.id !== id));
  };

  // --- Render Logic ---

  if (isLoading || !settings) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-indigo-600">Loading...</div>;
  }

  // Views without nav
  const fullScreenViews = [AppView.LOGIN, AppView.PIN_SETUP, AppView.PIN_ENTRY, AppView.ADD, AppView.SETTINGS];
  const showNav = !fullScreenViews.includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case AppView.LOGIN:
        return <LoginView onLoginSuccess={handleLoginSuccess} />;
      case AppView.PIN_SETUP:
        return <PinView mode="setup" onComplete={handlePinSetup} />;
      case AppView.PIN_ENTRY:
        return <PinView mode="verify" onComplete={handlePinVerify} error={pinError} />;
      
      // Feature Views
      case AppView.DASHBOARD:
        return (
          <DashboardView 
            transactions={transactions} 
            settings={settings} 
            onOpenSettings={() => setCurrentView(AppView.SETTINGS)}
            isPrivacyMode={isPrivacyMode}
            onTogglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
            onEditTransaction={handleEditRequest}
          />
        );
      case AppView.ADD:
        return (
            <AddTransactionView 
                onAdd={handleAddTransaction} 
                onUpdate={handleUpdateTransaction}
                onCancel={() => {
                    setEditingTransaction(null);
                    setCurrentView(AppView.DASHBOARD);
                }} 
                goals={goals} 
                settings={settings} 
                initialData={editingTransaction}
            />
        );
      case AppView.ANALYTICS:
        return <AnalyticsView transactions={transactions} settings={settings} />;
      case AppView.AI_INSIGHTS:
        return <AiInsightsView transactions={transactions} />;
      case AppView.SETTINGS:
        return (
          <SettingsView 
            settings={settings} 
            goals={goals} 
            onSaveSettings={handleSaveSettings} 
            onAddGoal={handleAddGoal} 
            onDeleteGoal={handleDeleteGoal}
            onBack={() => setCurrentView(AppView.DASHBOARD)}
          />
        );
      case AppView.GOALS:
        return <GoalView goals={goals} transactions={transactions} settings={settings} isPrivacyMode={isPrivacyMode} />;
      default:
        return <DashboardView transactions={transactions} settings={settings} onOpenSettings={() => setCurrentView(AppView.SETTINGS)} isPrivacyMode={isPrivacyMode} onTogglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)} onEditTransaction={handleEditRequest} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Main Content Area */}
        <main className={`flex-1 ${showNav ? 'p-5 pt-8' : ''} overflow-y-auto no-scrollbar`}>
          {renderView()}
        </main>

        {/* Bottom Navigation */}
        {showNav && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
             <div className="w-full max-w-md bg-white border-t border-gray-100 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <nav className="flex justify-around items-center p-2">
                    <button 
                        onClick={() => setCurrentView(AppView.DASHBOARD)}
                        className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === AppView.DASHBOARD ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LayoutDashboard size={24} strokeWidth={currentView === AppView.DASHBOARD ? 2.5 : 2} />
                        <span className="text-[10px] font-medium mt-1">Home</span>
                    </button>

                    <button 
                         onClick={() => setCurrentView(AppView.ANALYTICS)}
                         className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === AppView.ANALYTICS ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <PieChart size={24} strokeWidth={currentView === AppView.ANALYTICS ? 2.5 : 2} />
                        <span className="text-[10px] font-medium mt-1">Analytics</span>
                    </button>

                    <div className="relative -top-6">
                        <button 
                            onClick={() => {
                                setEditingTransaction(null);
                                setCurrentView(AppView.ADD);
                            }}
                            className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-300 hover:bg-indigo-700 hover:scale-105 transition-all"
                        >
                            <Plus size={28} strokeWidth={3} />
                        </button>
                    </div>

                    <button 
                         onClick={() => setCurrentView(AppView.GOALS)}
                         className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === AppView.GOALS ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Trophy size={24} strokeWidth={currentView === AppView.GOALS ? 2.5 : 2} />
                        <span className="text-[10px] font-medium mt-1">Goals</span>
                    </button>

                    <button 
                         onClick={() => setCurrentView(AppView.AI_INSIGHTS)}
                         className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentView === AppView.AI_INSIGHTS ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Sparkles size={24} strokeWidth={currentView === AppView.AI_INSIGHTS ? 2.5 : 2} />
                        <span className="text-[10px] font-medium mt-1">Advisor</span>
                    </button>
                </nav>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;