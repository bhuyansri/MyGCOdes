import React, { useState, useEffect } from 'react';
import { Delete, Lock } from 'lucide-react';

interface Props {
  mode: 'setup' | 'verify';
  onComplete: (pin: string) => void;
  title?: string;
  error?: string;
}

const PinView: React.FC<Props> = ({ mode, onComplete, title, error }) => {
  const [pin, setPin] = useState('');
  
  useEffect(() => {
    if (pin.length === 4) {
      // Small delay for UX
      setTimeout(() => {
        onComplete(pin);
        setPin(''); // Reset for safety or next step
      }, 300);
    }
  }, [pin, onComplete]);

  const handleNumClick = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num.toString());
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center pt-10">
        <div className="bg-indigo-50 p-4 rounded-full mb-6 text-indigo-600">
            <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
            {title || (mode === 'setup' ? 'Create a PIN' : 'Enter PIN')}
        </h2>
        <p className="text-sm text-gray-500 mb-8">
            {mode === 'setup' ? 'Secure your personal finance data' : 'Please verify your identity'}
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
                <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                        i < pin.length 
                        ? 'bg-indigo-600 border-indigo-600 scale-110' 
                        : 'bg-transparent border-gray-300'
                    }`}
                />
            ))}
        </div>

        {error && <p className="text-red-500 text-sm animate-pulse font-medium">{error}</p>}
      </div>

      {/* Numpad */}
      <div className="bg-gray-50 rounded-t-3xl p-6 pb-12">
        <div className="grid grid-cols-3 gap-y-6 gap-x-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                    key={num}
                    onClick={() => handleNumClick(num)}
                    className="h-16 w-full flex items-center justify-center text-2xl font-semibold text-gray-800 rounded-full active:bg-gray-200 transition-colors focus:outline-none"
                >
                    {num}
                </button>
            ))}
            <div className="h-16"></div> {/* Spacer */}
            <button
                onClick={() => handleNumClick(0)}
                className="h-16 w-full flex items-center justify-center text-2xl font-semibold text-gray-800 rounded-full active:bg-gray-200 transition-colors focus:outline-none"
            >
                0
            </button>
            <button
                onClick={handleDelete}
                className="h-16 w-full flex items-center justify-center text-gray-500 rounded-full active:bg-gray-200 transition-colors focus:outline-none"
            >
                <Delete size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default PinView;