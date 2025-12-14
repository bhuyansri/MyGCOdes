import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Plus, Trash2, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/databaseService';
import { ExchangeCard } from '../types';

interface Props {
  onBack: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'RUB', 'BRL', 'IDR', 'SGD', 'MYR'];

const ExchangeRateView: React.FC<Props> = ({ onBack }) => {
  const [cards, setCards] = useState<ExchangeCard[]>([]);
  
  // Form State for new card
  const [newFrom, setNewFrom] = useState('USD');
  const [newTo, setNewTo] = useState('EUR');

  useEffect(() => {
    const loadCards = async () => {
        const storedCards = await db.getExchangeCards();
        setCards(storedCards);
    };
    loadCards();
  }, []);

  const saveCards = async (newCards: ExchangeCard[]) => {
      setCards(newCards);
      await db.saveExchangeCards(newCards);
  };

  const fetchRate = async (from: string, to: string): Promise<number> => {
      try {
          const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
          const data = await res.json();
          return data.rates[to] || 0;
      } catch (e) {
          console.error("Rate fetch failed", e);
          return 0;
      }
  };

  const handleAddView = async () => {
      if (cards.length >= 3) {
          alert("Maximum 3 exchange views allowed.");
          return;
      }
      
      const rate = await fetchRate(newFrom, newTo);
      
      const newCard: ExchangeCard = {
          id: uuidv4(),
          from: newFrom,
          to: newTo,
          amount: 1, // Default amount
          rate: rate,
          lastUpdated: new Date().toLocaleTimeString()
      };
      
      const updated = [...cards, newCard];
      saveCards(updated);
  };

  const updateCardAmount = (id: string, amount: string) => {
      const updated = cards.map(c => c.id === id ? { ...c, amount: parseFloat(amount) || 0 } : c);
      saveCards(updated); // Save on edit to keep state if user leaves
  };

  const refreshCard = async (id: string) => {
      const card = cards.find(c => c.id === id);
      if (card) {
          const rate = await fetchRate(card.from, card.to);
          const updated = cards.map(c => c.id === id ? { ...c, rate, lastUpdated: new Date().toLocaleTimeString() } : c);
          saveCards(updated);
      }
  };

  const swapCurrency = async (id: string) => {
      const card = cards.find(c => c.id === id);
      if (card) {
          const newFrom = card.to;
          const newTo = card.from;
          const newRate = await fetchRate(newFrom, newTo);
          
          const updated = cards.map(c => c.id === id ? { 
              ...c, 
              from: newFrom, 
              to: newTo, 
              rate: newRate, 
              lastUpdated: new Date().toLocaleTimeString() 
          } : c);
          saveCards(updated);
      }
  };

  const deleteCard = (id: string) => {
      const updated = cards.filter(c => c.id !== id);
      saveCards(updated);
  };

  return (
    <div className="pb-24 animate-fade-in h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Exchange Rates</h1>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
          {/* Creator */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">New Viewer</h3>
              <div className="flex items-center gap-2 mb-4">
                  <select 
                      value={newFrom} 
                      onChange={(e) => setNewFrom(e.target.value)}
                      className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold"
                  >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ArrowRight size={20} className="text-gray-400" />
                  <select 
                      value={newTo} 
                      onChange={(e) => setNewTo(e.target.value)}
                      className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold"
                  >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
              </div>
              <button 
                  onClick={handleAddView}
                  disabled={cards.length >= 3}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:bg-gray-400 flex justify-center items-center gap-2"
              >
                  <Plus size={20} />
                  {cards.length >= 3 ? 'Max Views Reached' : 'Create View'}
              </button>
          </div>

          {/* Cards */}
          <div className="space-y-4">
              {cards.map(card => (
                  <div key={card.id} className="bg-white p-5 rounded-2xl shadow-md border border-indigo-50 relative">
                      <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2 text-indigo-700 font-bold">
                              <span>{card.from}</span>
                              <ArrowRight size={16} />
                              <span>{card.to}</span>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => swapCurrency(card.id)} className="text-indigo-400 hover:text-indigo-600 bg-indigo-50 p-1 rounded-full" title="Swap Currencies">
                                  <ArrowRightLeft size={16} />
                              </button>
                              <button onClick={() => refreshCard(card.id)} className="text-gray-400 hover:text-indigo-600 p-1">
                                  <RefreshCw size={16} />
                              </button>
                              <button onClick={() => deleteCard(card.id)} className="text-red-300 hover:text-red-500 p-1">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>

                      <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1">
                              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">{card.from} Amount</label>
                              <input 
                                  type="number" 
                                  value={card.amount}
                                  onChange={(e) => updateCardAmount(card.id, e.target.value)}
                                  className="w-full p-2 bg-gray-50 rounded-lg text-lg font-bold text-gray-800"
                              />
                          </div>
                          <div className="flex-1">
                               <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Result ({card.to})</label>
                               <div className="w-full p-2 bg-indigo-50 rounded-lg text-lg font-bold text-indigo-700">
                                   {card.rate ? (card.amount * card.rate).toFixed(2) : '...'}
                               </div>
                          </div>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                           <span>1 {card.from} = {card.rate} {card.to}</span>
                           <span>Updated: {card.lastUpdated}</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default ExchangeRateView;