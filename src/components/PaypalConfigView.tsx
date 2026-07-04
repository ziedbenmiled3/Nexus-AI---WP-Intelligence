import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  RefreshCw, 
  AlertCircle, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  Shield,
  HelpCircle,
  Key,
  Eye,
  EyeOff,
  Search,
  DollarSign,
  TrendingUp,
  Sliders,
  Calendar,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../providers/FirebaseProvider';
import { cn } from '../lib/utils';

export default function PaypalConfigView() {
  const { user } = useAuth();
  const isSuperAdmin = user?.email?.toLowerCase() === 'contact@nexuswp.pro';
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalTestMode, setPaypalTestMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showKey, setShowKey] = useState(false);

  // Payments / Transactions State
  const [payments, setPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Step state for documentation
  const [activeStep, setActiveStep] = useState(0);

  const stepsProtocol = [
    {
      title: "1. Compte PayPal Professionnel",
      desc: "Vous devez impérativement posséder ou surclasser votre compte PayPal standard en compte Professionnel (Business). C'est entièrement gratuit et requis pour obtenir des API.",
      actionLabel: "Créer un compte Business",
      link: "https://www.paypal.com/fr/business"
    },
    {
      title: "2. Créer l'Application API",
      desc: "Rendez-vous sur le portail PayPal Developer dans la section « Apps & Credentials » (Applications et identifiants). Cliquez sur le bouton bleu « Create App » (Créer une application). Entrez le nom 'Nexus' et validez.",
      actionLabel: "Aller sur PayPal Developer",
      link: "https://developer.paypal.com/dashboard/"
    },
    {
      title: "3. Extraire le Client ID",
      desc: "Une fois l'application créée, assurez-vous de passer du mode « Sandbox » (Test) au mode « Live » (Production) en haut à droite. Copiez l'identifiant intitulé « Client ID ».",
      actionLabel: "Documentation PayPal",
      link: "https://developer.paypal.com/api/rest/"
    },
    {
      title: "4. Liaison avec le Système Nexus",
      desc: "Collez la clé Client ID copiée dans le formulaire à droite de cet écran, puis cliquez sur le protocole d'enregistrement sécurisé. Le SDK Nexus est maintenant opérationnel pour vos clients !",
      actionLabel: "Vérifier le statut du paiement",
      link: null
    }
  ];

  useEffect(() => {
    loadPaypalData();
  }, [user]);

  const loadPaypalData = async () => {
    if (!isSuperAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [settings, pays] = await Promise.all([
        firebaseService.getSettings(),
        firebaseService.getAllPayments()
      ]);
      setPaypalClientId(settings['paypal_client_id'] || '');
      setPaypalTestMode(settings['paypal_test_mode'] === 'true');
      setPayments(pays || []);
    } catch (err) {
      console.error('[PaypalConfig] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePaypal = async () => {
    setIsSaving(true);
    setStatus('idle');
    try {
      if (!isSuperAdmin) {
        throw new Error('Non autorisé.');
      }
      await firebaseService.updatePaypalClientId(paypalClientId);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('[PaypalConfig] Error saving paypal ID:', err);
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTestMode = async () => {
    try {
      const nextState = !paypalTestMode;
      setPaypalTestMode(nextState);
      await firebaseService.updateSetting('paypal_test_mode', String(nextState));
    } catch (err) {
      console.error('[PaypalConfig] Error toggling Paypal test mode:', err);
    }
  };

  const handleClearTransactions = async () => {
    setIsClearing(true);
    try {
      if (!isSuperAdmin) {
        throw new Error('Non autorisé.');
      }
      await firebaseService.clearAllPayments();
      setShowConfirmClear(false);
      // Recharger pour réinitialiser complètement l'état de l'abonnement et vider la notification obsolète
      window.location.reload();
    } catch (err) {
      console.error('[PaypalConfig] Error clearing transactions:', err);
    } finally {
      setIsClearing(false);
    }
  };

  const totalVolume = payments.reduce((acc, curr) => {
    // Standardize price/amount
    const amt = parseFloat(curr.amount) || parseFloat(curr.price) || 0;
    return acc + amt;
  }, 0);

  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    const email = (p.user_email || p.customer_email || '').toLowerCase();
    const id = (p.id || p.transaction_id || '').toLowerCase();
    const plan = (p.plan_id || p.plan_name || '').toLowerCase();
    
    const matchesSearch = email.includes(q) || id.includes(q) || plan.includes(q);
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'success') return matchesSearch && (!p.status || p.status === 'succeeded' || p.status === 'completed' || p.status === 'approved' || p.status === 'active');
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
          INITIALISATION DU MODULE PAYPAL...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Upper Brand Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
              PASSERELLE & INSTALLATION PAYPAL
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
              Configuration du processeur de paiement centralisé pour la boutique Nexus
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center min-w-[140px]">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
               <TrendingUp className="w-3 h-3 text-emerald-500" /> volume global
             </span>
             <span className="text-xl font-mono font-bold text-emerald-400">{totalVolume.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
          </div>

          <div className="px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center min-w-[120px]">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">ventes réelles</span>
             <span className="text-xl font-mono font-bold text-white">{payments.length}</span>
          </div>
        </div>

        {/* Abstract design vector */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Grid of config & instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Timeline Protocol column */}
        <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                 <HelpCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                 <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">PROTOCOLE D'INSTALLATION</h2>
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Guide étape par étape pour les Administrateurs</p>
              </div>
            </div>

            {/* Steps tabs selector */}
            <div className="grid grid-cols-4 gap-2 bg-slate-950/80 p-1 border border-white/5 rounded-xl">
               {stepsProtocol.map((step, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setActiveStep(idx)}
                   className={cn(
                     "py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                     activeStep === idx 
                       ? "bg-blue-600 text-white shadow-md shadow-blue-900/40" 
                       : "text-slate-500 hover:text-slate-300"
                   )}
                 >
                   Étape {idx + 1}
                 </button>
               ))}
            </div>

            {/* Active step content display */}
            <AnimatePresence mode="wait">
               <motion.div 
                 key={activeStep}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 10 }}
                 transition={{ duration: 0.2 }}
                 className="p-6 bg-slate-900/30 border border-slate-800 rounded-3xl space-y-4 min-h-[160px] flex flex-col justify-between"
               >
                 <div className="space-y-2">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider italic flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400 not-italic font-black">
                        {activeStep + 1}
                      </span>
                      {stepsProtocol[activeStep].title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                      {stepsProtocol[activeStep].desc}
                    </p>
                 </div>

                 {stepsProtocol[activeStep].link && (
                    <a 
                      href={stepsProtocol[activeStep].link!} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="self-start flex items-center gap-1 text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors mt-2"
                    >
                      {stepsProtocol[activeStep].actionLabel}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                 )}
               </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-slate-900 pt-6 mt-6 flex items-center gap-3 text-slate-500">
             <Shield className="w-4 h-4 text-emerald-500" />
             <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
               Cryptage SSL de protocole SHA-256 actif sur l'ensemble de la passerelle.
             </span>
          </div>
        </div>

        {/* Credentials Editor Panel Column */}
        <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                   <Key className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                   <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">IDENTIFIANTS API</h2>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Enregistrement sécurisé du Client ID PayPal</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  paypalClientId ? "bg-emerald-500 animate-pulse" : "bg-red-500 animate-pulse"
                )} />
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest",
                  paypalClientId ? "text-emerald-500" : "text-red-500"
                )}>
                  {paypalClientId ? "PASSERELLE TECHNIQUE EN DIRECT" : "PAS DE CLÉ DÉTECTÉE"}
                </span>
              </div>
            </div>

            <div className="space-y-4 bg-slate-950 p-6 rounded-3xl border border-white/5 relative group/cred">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  PAYPAL CLIENT ID (PRODUCTION)
                </label>
                <div className="bg-slate-900 border border-white/5 rounded-md px-2 py-0.5 text-[8px] font-mono text-slate-500 font-bold uppercase">
                  Live Key Only
                </div>
              </div>

              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"}
                  value={paypalClientId || ''}
                  onChange={(e) => setPaypalClientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-24 py-4 text-xs font-mono text-blue-400 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Ex: AUa69Qk_zC..."
                />
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <span className="text-[7px] font-black text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                    L:{paypalClientId.length}
                  </span>
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-[8.5px] text-slate-500 font-semibold leading-relaxed">
                Ce Client ID public sera utilisé par le widget PayPal sur la boutique d'abonnements pour charger les plans de manière sécurisée. Ne divulguez jamais le Client Secret de l'application API.
              </p>
            </div>

            {/* Simulator Toggle Box */}
            <div className="space-y-4 bg-slate-950 p-6 rounded-3xl border border-white/5 relative">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    🚀 SIMULATEUR DE PAIEMENT (MODE TEST)
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Permet de tester le processus complet sans carte bancaire réelle
                  </span>
                </div>
                
                <button 
                  onClick={handleToggleTestMode}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    paypalTestMode ? "bg-emerald-500" : "bg-slate-800"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      paypalTestMode ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="h-[1px] bg-white/5" />

              <div className="text-[9.5px] text-slate-400 font-semibold leading-relaxed space-y-1.5">
                <p>
                  Lorsque le <span className="text-emerald-400 font-extrabold uppercase">Mode Test</span> est actif :
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                  <li>Un bouton d'action <span className="text-slate-300 font-bold">🧪 SIMULER LE PAIEMENT (MODE TEST)</span> s'affichera directement sur la page tarifs du site.</li>
                  <li>Le clic simulera instantanément une autorisation et capture PayPal pour le plan sélectionné.</li>
                  <li>Vous pourrez tester tout le cycle d'approvisionnement, d'enregistrement dans Firestore, et de mise à jour des limites sans débourser un centime.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleSavePaypal}
              disabled={isSaving}
              className={cn(
                "w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-30",
                status === 'success' 
                  ? "bg-emerald-600 text-white shadow-emerald-900/20" 
                  : status === 'error'
                  ? "bg-red-600 text-white shadow-red-900/20"
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/20"
              )}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {status === 'success' ? "IDENTIFIANTS ENREGISTRÉS !" : status === 'error' ? "ERREUR D'ENREGISTREMENT" : "APPLIQUER LA CLÉ CLIENT"}
            </button>
            
            {status === 'success' && (
              <p className="text-[8px] text-emerald-500 font-black uppercase text-center tracking-widest animate-pulse">
                La passerelle a été mise à jour avec succès dans la base Firestore.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Registrar list */}
      <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                 <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                 <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">HISTORIQUE DES TRANSACTIONS PAYPAL</h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Audit et suivi réel des fonds facturés aux utilisateurs</p>
              </div>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-auto">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                 <input 
                   type="text"
                   placeholder="FILTRER PAR EMAIL OU TRX ID..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-[8.5px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-emerald-500"
                 />
              </div>

              {/* Status query selector */}
              <select 
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-[8.5px] font-black uppercase tracking-widest text-white focus:outline-none"
              >
                <option value="all">TOUS STATUTS ({payments.length})</option>
                <option value="success">SUCCÈS / PAYÉS</option>
              </select>

              {/* Remettre à zéro button */}
              {!showConfirmClear ? (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  disabled={isClearing || payments.length === 0}
                  className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/40 transition-colors border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl px-4 py-2.5 text-[8.5px] font-black uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remettre à zéro
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <button
                    onClick={handleClearTransactions}
                    disabled={isClearing}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 transition-colors text-white rounded-xl px-3 py-2.5 text-[8.5px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-red-950/25 shrink-0"
                  >
                    {isClearing ? (
                      <RefreshCw className="w-3 animate-spin" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    Confirmer ?
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    disabled={isClearing}
                    className="bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 rounded-xl px-3 py-2.5 text-[8.5px] font-black uppercase tracking-widest cursor-pointer shrink-0"
                  >
                    Annuler
                  </button>
                </div>
              )}
           </div>
        </div>

        {/* Big Table */}
        <div className="relative border border-slate-800/50 rounded-3xl overflow-hidden bg-slate-950/20">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-[#0c0e14] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Client (Email)</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Formule d'Abonnement</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Date effective</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Montant Facturé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.map((p, idx) => {
                  const amt = parseFloat(p.amount) || parseFloat(p.price) || 0;
                  const dateStr = p.created_at || p.timestamp;
                  let formattedDate = 'Inconnue';
                  if (dateStr) {
                    try {
                      formattedDate = new Date(dateStr).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch {
                      formattedDate = dateStr;
                    }
                  }

                  return (
                    <tr key={idx} className="group hover:bg-emerald-500/5 transition-all">
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-emerald-400 transition-colors uppercase">
                           {p.id || p.transaction_id || 'LOCAL-GIFT-BYPASS'}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                           <span className="text-[11px] font-semibold text-white">{p.user_email || p.customer_email || 'VIP_NEXUS_MEMBER'}</span>
                           <span className="text-[7.5px] font-mono text-slate-600 uppercase">Acheteur enregistré</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-1 rounded-md uppercase tracking-wider">
                           {p.plan_name || p.plan_id || 'Formule Active'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-semibold text-slate-400">
                         <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            {formattedDate}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="text-sm font-mono font-black text-emerald-400">
                           + {amt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                         </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-20">
                          <DollarSign className="w-10 h-10 text-slate-500" />
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Aucune transaction répertoriée</span>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
