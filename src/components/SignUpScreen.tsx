import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../providers/FirebaseProvider';

interface Props {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export default function SignUpScreen({ onSuccess, onBack }: Props) {
  const { loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (email.toLowerCase() === 'admin') {
      setError('Veuillez utiliser une adresse email valide');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    // Simulate API call for direct email if needed, or just use success
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(email);
    }, 1200);
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider !== 'Google') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      if (user?.email) {
        onSuccess(user.email);
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          <div className="space-y-1">
            <p>Ce domaine n'est pas autorisé dans votre console Firebase.</p>
            <p className="text-[8px] opacity-70 normal-case italic">Allez dans Authentication &gt; Settings &gt; Authorized domains et ajoutez :</p>
            <code className="bg-black/40 p-1.5 rounded-lg border border-white/10 mt-1 block select-all font-mono text-[9px] text-blue-400">{window.location.hostname}</code>
          </div>
        );
      } else if (err.code === 'auth/popup-blocked') {
        setError('Le popup a été bloqué. Veuillez autoriser les fenêtres surgissantes pour ce site.');
      } else if (err.code === 'auth/network-request-failed') {
        setError(
          <div className="space-y-1">
            <p>Erreur réseau Firebase. Cela arrive souvent si un bloqueur de publicité (AdBlock) empêche la connexion.</p>
            <p className="text-[8px] opacity-70 normal-case italic">Essayez de désactiver vos extensions ou utilisez le champ email ci-dessous.</p>
          </div>
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('La fenêtre de connexion a été fermée avant la fin de l\'opération.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(`Le fournisseur ${provider} n'est pas activé dans votre console Firebase.`);
      } else {
        setError(`Erreur: ${err.message || 'Échec de la connexion'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050608] flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">CRÉER VOTRE COMPTE NEXUS</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Enregistrez-vous pour activer votre pack Phase III
            </p>
          </div>

          <div className="space-y-4 mb-10">
             <button 
               onClick={() => handleSocialLogin('Google')}
               disabled={isLoading}
               className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all text-xs font-bold uppercase tracking-widest text-slate-200"
             >
                <Chrome className="w-4 h-4 text-blue-400" />
                Google
             </button>

          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="relative mb-10 text-center">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
             <span className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em] text-slate-600 bg-[#0a0c10] px-4">OU PAR EMAIL</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-3 px-2">Adresse Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@votre-domaine.com"
                  className="w-full px-6 py-5 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white placeholder:text-slate-700 focus:border-blue-600/50 transition-all outline-none"
                />
             </div>

             <button 
               type="submit"
               disabled={isLoading}
               className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/20 disabled:opacity-50"
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>CONTINUER L'ACTIVATION <ArrowRight className="w-4 h-4" /></>}
             </button>
          </form>

          <button 
            onClick={onBack}
            className="w-full mt-8 py-2 text-[9px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
          >
            Retour aux packs
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full -z-0" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/10 blur-[80px] rounded-full -z-0" />
      </motion.div>
    </div>
  );
}
