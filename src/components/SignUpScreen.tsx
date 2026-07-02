import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Chrome, 
  Mail, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Globe,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../providers/FirebaseProvider';

interface Props {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export default function SignUpScreen({ onSuccess, onBack }: Props) {
  const { i18n } = useTranslation();
  
  // Clean language handler
  const [lang, setLang] = useState<'fr' | 'en'>(() => {
    const current = i18n.language?.startsWith('en') ? 'en' : 'fr';
    return current;
  });

  const toggleLang = () => {
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const isEn = lang === 'en';

  const [isInIframe] = useState(() => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top;
    } catch (e) {
      return true;
    }
  });

  const { loginWithGoogle, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle standard Email Sign-In / Registration
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin') {
      setError(isEn ? 'Please enter a valid email address' : 'Veuillez saisir une adresse email valide');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await loginWithEmail(cleanEmail);
      const emailToUse = user?.email || cleanEmail;
      onSuccess(emailToUse);
    } catch (err: any) {
      console.error('Email Authentication error:', err);
      let errMsg = err.message || (isEn ? 'Authentication failed' : 'Échec de l\'authentification');
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = isEn 
          ? 'Email login is not enabled in Firebase Auth for this project. Please use the Google Login button.'
          : 'La connexion par email n\'est pas activée dans Firebase pour ce projet. Veuillez utiliser le bouton de connexion Google.';
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login via Standard Popup
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      if (user?.email) {
        onSuccess(user.email);
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      let errMsg = err.message || (isEn ? 'Google authentication failed' : 'Échec de l\'authentification Google');
      
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/popup-blocked' || err.message?.includes('popup')) {
        if (isInIframe) {
          errMsg = isEn 
            ? 'Google Auth Popup blocked or closed. Because the app is inside the AI Studio preview iframe, browsers block authentication popups. Please click the "Open in New Tab" icon (top-right of the preview panel) to log in with Google, or use the email activation below.'
            : 'La fenêtre de connexion Google a été bloquée ou fermée. L\'application étant dans un iframe d\'aperçu AI Studio, les navigateurs bloquent les popups d\'authentification. Veuillez cliquer sur l\'icône "Ouvrir dans un nouvel onglet" (en haut à droite de l\'aperçu) pour vous connecter avec Google, ou utilisez la connexion par e-mail ci-dessous.';
        } else {
          errMsg = isEn
            ? 'The Google Sign-In popup was closed or blocked. Please allow popups for this site and try again.'
            : 'La fenêtre de connexion Google a été fermée ou bloquée. Veuillez autoriser les fenêtres pop-up pour ce site et réessayer.';
        }
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020305] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans text-white">
      
      {/* Decorative futuristic background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a10_1px,transparent_1px),linear-gradient(to_bottom,#0f172a10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative max-w-md w-full bg-gradient-to-b from-[#0c0e14] to-[#06080b] border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        {/* Glow Line Header */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        <div className="relative z-10 space-y-6">
          
          {/* Top Row: Language & Back buttons */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <button 
              onClick={onBack}
              className="group flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>{isEn ? "Back" : "Retour"}</span>
            </button>

            <button 
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-black tracking-widest text-slate-300 uppercase transition-all"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span>{lang === 'fr' ? 'English' : 'Français'}</span>
            </button>
          </div>

          {/* Core Title and Subheader */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.25em] text-blue-400">
              <Sparkles className="w-3 h-3" />
              <span>{isEn ? "SECURE ACCESS" : "PORTAIL SÉCURISÉ NEXUS"}</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white leading-none">
              {isEn ? 'CREATE YOUR ACCOUNT' : 'CRÉER VOTRE COMPTE'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
              {isEn ? 'Register to activate your ultimate Phase III pack' : 'Enregistrez-vous pour activer votre pack Phase III'}
            </p>
          </div>

          {/* Error display */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AUTHENTICATION METHODS CONTAINER */}
          <div className="space-y-4">
            
            {/* Google Login button */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center gap-2.5 transition-all text-xs font-bold uppercase tracking-widest text-slate-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-4 h-4 text-blue-400" />
                  <span>Google</span>
                </>
              )}
            </button>

            {isInIframe && (
              <p className="text-[10px] text-blue-400/80 text-center leading-relaxed max-w-xs mx-auto font-medium">
                {isEn 
                  ? "💡 Running in Preview: If Google Login fails, please open this app in a new tab (top-right preview icon) or use the Email field below."
                  : "💡 Mode Aperçu : Si la connexion Google échoue, ouvrez cette application dans un nouvel onglet (icône en haut à droite) ou utilisez l'option Email ci-dessous."
                }
              </p>
            )}

            {/* Separator */}
            <div className="relative py-2 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <span className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em] text-slate-600 bg-[#06080b] px-3">
                {isEn ? 'OR' : 'OU'}
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] px-1">
                  {isEn ? 'Email Address' : 'Adresse Email'}
                </label>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@votre-domaine.com"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/10 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isEn ? 'CONTINUE ACTIVATION' : "CONTINUER L'ACTIVATION"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Footer Security Notes */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-medium text-slate-600">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{isEn ? "Secure encrypted access" : "Accès crypté ultra-sécurisé"}</span>
            </div>
            <span>Nexus WP Suite</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
