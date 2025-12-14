import React from 'react';
import { Wallet, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface Props {
  onLoginSuccess: (user: User) => void;
}

const LoginView: React.FC<Props> = ({ onLoginSuccess }) => {
  
  const handleGoogleLogin = () => {
    // In a real Android app, this calls GoogleAuth.signIn() plugin.
    // For this web demo, we simulate a successful auth response.
    const mockUser: User = {
      id: '123456789',
      name: 'Demo User',
      email: 'user@example.com',
      photoUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff'
    };

    // Simulate network delay
    setTimeout(() => {
      onLoginSuccess(mockUser);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-50 to-white animate-fade-in">
      <div className="mb-10 flex flex-col items-center">
        <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-200 mb-6 transform -rotate-6">
          <Wallet size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">FinTrack AI</h1>
        <p className="text-gray-500 text-center">Smart finance tracking <br/>powered by Gemini</p>
      </div>

      <div className="w-full space-y-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-4 rounded-xl shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-gray-50"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
           <ShieldCheck size={16} className="text-green-600" />
           <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Local Storage Only</span>
        </div>
        <p className="text-xs text-gray-400 text-center px-6 max-w-xs">
          Your financial data stays on your device. We do not sync your transactions to the cloud.
        </p>
      </div>
    </div>
  );
};

export default LoginView;