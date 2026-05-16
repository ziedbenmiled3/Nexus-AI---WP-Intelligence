import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, Loader2, DollarSign, Wallet } from 'lucide-react';

interface Props {
  plan: any;
  email: string;
  onSuccess: (transactionId: string) => void;
  onBack: () => void;
}

export default function PaymentScreen({ plan, email, onSuccess, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = () => {
    setIsLoading(true);
    // Simulate PayPal process
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(`PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050608] flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 md:p-14 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
             <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">PAIEMENT SÉCURISÉ</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                   Activation du {plan.name} pour {email}
                </p>
             </div>
             <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
             </div>
          </div>

          <div className="bg-black/40 rounded-3xl p-8 border border-white/5 mb-10">
             <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prix</span>
             </div>
             <div className="flex justify-between items-end mb-8">
                <div>
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{plan.name}</h3>
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Abonnement Mensuel Nexus</p>
                </div>
                <div className="text-3xl font-black text-white italic tracking-tighter">
                   {plan.price} $
                </div>
             </div>
             <div className="border-t border-white/5 pt-6 flex justify-between items-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">TOTAL À PAYER</span>
                <span className="text-3xl font-black text-blue-500 italic tracking-tighter">{plan.price} $</span>
             </div>
          </div>

          <div className="space-y-6">
             <button 
               onClick={handlePay}
               disabled={isLoading}
               className="w-full py-6 bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-900/30 disabled:opacity-50"
             >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Payer avec PayPal
                  </>
                )}
             </button>
             
             <button 
               disabled={isLoading}
               className="w-full py-6 bg-white text-black hover:bg-slate-100 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
             >
                <CreditCard className="w-5 h-5" />
                Carte Bancaire
             </button>
          </div>

          <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
             <div className="flex items-center gap-3">
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all rounded" />
                <span>Paiement crypté SSL 256-bit</span>
             </div>
             <button onClick={onBack} className="hover:text-white transition-colors">Annuler</button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full -z-0" />
      </motion.div>
    </div>
  );
}
