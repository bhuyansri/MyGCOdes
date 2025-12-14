import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, RefreshCw, MessageSquareQuote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  transactions: Transaction[];
}

const AiInsightsView: React.FC<Props> = ({ transactions }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions);
    setAdvice(result);
    setLoading(false);
  };

  useEffect(() => {
    if (!advice && transactions.length > 0) {
      fetchAdvice();
    }
  }, []);

  return (
    <div className="pb-24 animate-fade-in h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           AI Advisor <Sparkles className="text-indigo-500 fill-indigo-500" size={24} />
        </h1>
        <p className="text-gray-500 text-sm">Smart insights powered by Gemini</p>
      </div>

      <div className="flex-1 flex flex-col">
        {transactions.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
               <MessageSquareQuote size={48} className="mb-4 text-gray-300" />
               <p>Add some transactions to unlock AI insights.</p>
           </div>
        ) : (
            <>
                <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 border border-indigo-50 overflow-hidden relative">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 w-full"></div>
                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-24 bg-gray-100 rounded-xl mt-4"></div>
                            </div>
                        ) : (
                            <div className="prose prose-sm prose-indigo max-w-none">
                                <ReactMarkdown 
                                    components={{
                                        h1: ({node, ...props}) => <h3 className="text-lg font-bold text-indigo-700 mt-0 mb-2" {...props} />,
                                        h2: ({node, ...props}) => <h4 className="text-base font-bold text-gray-800 mt-4 mb-2" {...props} />,
                                        h3: ({node, ...props}) => <h5 className="text-sm font-bold text-gray-700 mt-3 mb-1" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-gray-600" {...props} />,
                                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                        p: ({node, ...props}) => <p className="text-gray-600 leading-relaxed mb-3" {...props} />,
                                        strong: ({node, ...props}) => <span className="font-semibold text-gray-900" {...props} />
                                    }}
                                >
                                    {advice || ''}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={fetchAdvice}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-indigo-600 font-medium shadow-sm active:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh Insights
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default AiInsightsView;