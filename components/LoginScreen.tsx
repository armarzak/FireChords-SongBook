
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[500] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/20">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Songbook Pro</h1>
        <p className="text-zinc-400 text-sm mb-12">Your personal stage repertoire, synced.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Your Stage Name (e.g. Jimi)" 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-center font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            disabled={name.trim().length < 2}
            className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 shadow-xl"
          >
            Start Playing
          </button>
        </form>

        <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
          By continuing, you agree to share your chords with the community.
        </p>
      </div>
    </div>
  );
};
