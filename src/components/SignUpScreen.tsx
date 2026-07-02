import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock,
  User as UserIcon,
  Calendar,
  Phone,
  MapPin,
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Globe,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../providers/FirebaseProvider';
import { firebaseService } from '../services/firebaseService';

interface Props {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export default function SignUpScreen({ onSuccess, onBack }: Props) {
  const { i18n } = useTranslation();
  
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

  const { loginWithEmail, signUpWithEmail } = useAuth();
  
  // Tab/Mode state: 'signin' or 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !password) {
      setError(isEn ? 'Please fill in all credentials' : 'Veuillez renseigner vos identifiants');
      return;
    }

    if (mode === 'signup' && (!nom || !prenom || !birthDate || !phone || !address)) {
      setError(isEn ? 'Please fill in all registration fields' : 'Veuillez renseigner tous les champs d’inscription');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        // Sign In Flow
        console.log('[SignUpScreen] Logging in:', cleanEmail);
        const loggedUser = await loginWithEmail(cleanEmail, password);
        // Sync profile with the raw password so it can be recovered/displayed if necessary
        await firebaseService.syncUserProfile(loggedUser, { raw_password: password });
        onSuccess(cleanEmail);
      } else {
        // Sign Up Flow
        console.log('[SignUpScreen] Registering new user:', cleanEmail);
        const registeredUser = await signUpWithEmail(cleanEmail, password);
        
        // Sync the profile metadata
        await firebaseService.syncUserProfile(registeredUser, {
          nom: nom.trim(),
          prenom: prenom.trim(),
          birth_date: birthDate,
          phone: phone.trim(),
          address: address.trim(),
          raw_password: password
        });
        
        onSuccess(cleanEmail);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      let errMsg = err.message || (isEn ? 'Authentication failed' : 'Échec de l\'authentification');
      
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = isEn 
          ? 'Incorrect email or password. Please try again.'
          : 'Email ou mot de passe incorrect. Veuillez réessayer.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = isEn 
          ? 'This email address is already in use by another account.'
          : 'Cette adresse e-mail est déjà associée à un autre compte.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = isEn 
          ? 'The password is too weak. Please use at least 6 characters.'
          : 'Le mot de passe est trop faible. Veuillez utiliser au moins 6 caractères.';
      } else if (err.code === 'auth/network-request-failed' || err.message?.includes('network-request-failed')) {
        errMsg = isEn
          ? 'Network connection failed. Please check your internet connection.'
          : 'Échec de la connexion réseau. Veuillez vérifier votre connexion internet.';
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
        className="relative max-w-lg w-full bg-gradient-to-b from-[#0c0e14] to-[#06080b] border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-2xl overflow-hidden my-8"
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
              {mode === 'signin' 
                ? (isEn ? 'SIGN IN' : 'SE CONNECTER')
                : (isEn ? 'CREATE YOUR ACCOUNT' : 'CRÉER VOTRE COMPTE')
              }
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
              {mode === 'signin'
                ? (isEn ? 'Access your dashboard' : 'Accédez à votre tableau de bord')
                : (isEn ? 'Register to activate your ultimate Phase III pack' : 'Enregistrez-vous pour activer votre pack Phase III')
              }
            </p>
          </div>

          {/* Selector Switch Mode */}
          <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/5 rounded-xl">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                mode === 'signin' 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'SIGN IN' : 'CONNEXION'}
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                mode === 'signup' 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'SIGN UP' : 'INSCRIPTION'}
            </button>
          </div>

          {/* Error display */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Conditional signup fields */}
            {mode === 'signup' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                {/* Last Name & First Name in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] px-1">
                      {isEn ? 'First Name' : 'Prénom'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        required={mode === 'signup'}
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        placeholder={isEn ? "John" : "Jean"}
                        disabled={isLoading}
                        className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] px-1">
                      {isEn ? 'Last Name' : 'Nom'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        required={mode === 'signup'}
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder={isEn ? "Doe" : "Dupont"}
                        disabled={isLoading}
                        className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Birth Date & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] px-1">
                      {isEn ? 'Date of Birth' : 'Date de naissance'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="date" 
                        required={mode === 'signup'}
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] px-1">
                      {isEn ? 'Phone Number' : 'Téléphone'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="tel" 
                        required={mode === 'signup'}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                        disabled={isLoading}
                        className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] px-1">
                    {isEn ? 'Address' : 'Adresse'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      required={mode === 'signup'}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={isEn ? "123 Champs-Élysées, Paris" : "123 Champs-Élysées, Paris"}
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Email Address */}
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
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 font-black uppercase tracking-[0.25em] px-1">
                {isEn ? 'Password' : 'Mot de passe'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/10 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' 
                      ? (isEn ? 'LOG IN' : 'SE CONNECTER') 
                      : (isEn ? 'ACTIVATE PRO PACK' : "ACTIVER MON PACK")
                    }
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

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
