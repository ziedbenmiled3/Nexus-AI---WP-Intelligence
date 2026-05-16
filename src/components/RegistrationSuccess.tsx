import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  onContinue: () => void;
  planName?: string;
}

export default function RegistrationSuccess({ onContinue, planName }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-[#050608] flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0a0c10] border border-white/5 rounded-[3.5rem] p-12 relative overflow-hidden text-center shadow-2xl"
      >
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </motion.div>

          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">
            COMPTE RÉACTIVÉ <br />
            <span className="text-indigo-500">AVEC SUCCÈS</span>
          </h2>
          
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-10">
            Votre profil Nexus est maintenant actif. {planName && `Le ${planName} est prêt à être configuré.`}
          </p>

          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-10 space-y-4">
             <div className="flex items-center gap-4 text-left">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Identité Vérifiée Phase III</span>
             </div>
             <div className="flex items-center gap-4 text-left">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Accès Prioritaire Activé</span>
             </div>
          </div>

          <button 
            onClick={onContinue}
            className="w-full py-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/30 active:scale-95"
          >
            CONTINUER VERS LA CONFIGURATION <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Backdrop Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -z-0" />
      </motion.div>
    </div>
  );
}
