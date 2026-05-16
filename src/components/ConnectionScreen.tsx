import React, { useState } from 'react';
import { WPConfig } from '../types';
import { Loader2, Globe, User, Lock, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onConnect: (config: WPConfig) => void;
  isLoading: boolean;
  error: string | null;
}

export default function ConnectionScreen({ onConnect, isLoading, error }: Props) {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect({ url, username, applicationPassword: appPassword });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden">
        <div className="p-10 bg-slate-950 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">WordPress Maestro</h1>
            <p className="text-slate-500 text-sm font-medium">L'agent intelligent pour votre business.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">URL du Site WP</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="w-3.5 h-3.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="url"
                  placeholder="https://votre-site.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm transition-all text-slate-200"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Nom d'utilisateur</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-3.5 h-3.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="admin"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm transition-all text-slate-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Mot de Passe Application</label>
                <a 
                  href="https://wordpress.org/documentation/article/application-passwords/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-tighter"
                >
                  Guide ?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-3.5 h-3.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx xxxx"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm transition-all font-mono text-slate-200"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-900/30 text-sm tracking-tight"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Initialiser la Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="p-6 bg-slate-950 text-center border-t border-slate-800">
           <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Agent Crypte • Google Cloud Platform</p>
        </div>
      </div>
    </motion.div>
  );
}
