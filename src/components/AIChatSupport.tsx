import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Zap, User, Cpu, Loader2 } from 'lucide-react';
import { sendMessage } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Bonjour ! Je suis Nexus, votre assistant d'élite. Comment puis-je vous aider à propulser votre boutique WooCommerce aujourd'hui ?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await sendMessage(userMsg, history);
      setMessages(prev => [...prev, { role: 'model', text: response || "Je n'ai pas pu générer de réponse." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Erreur de connexion avec le protocole Nexus. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        id="ai-chat-trigger"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 group overflow-hidden",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Zap className="w-7 h-7 text-white fill-white relative z-10" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[101] w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none">NEXUS AI</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">PROTOCOLE ACTIF</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    m.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg",
                    m.role === 'user' ? "bg-zinc-800" : "bg-indigo-600"
                  )}>
                    {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white fill-white" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed",
                    m.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white/5 text-slate-300 border border-white/5 rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="bg-white/5 text-slate-400 p-4 rounded-2xl border border-white/5 rounded-tl-none italic text-xs flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                    Le protocole Nexus réfléchit...
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSend}
              className="p-6 pt-0"
            >
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question au protocole..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm font-medium outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-white rounded-xl flex items-center justify-center text-black hover:bg-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group/send"
                >
                  <Send className="w-4 h-4 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-700 font-bold uppercase tracking-[0.2em] mt-4">
                POWERED BY NEXUS-X PROMETHEUS ENGINE
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
