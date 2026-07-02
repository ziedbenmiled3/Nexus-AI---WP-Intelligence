import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  CreditCard, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  Layout,
  ShieldCheck,
  ExternalLink,
  Save,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Zap,
  Search,
  Filter,
  Key,
  Eye,
  EyeOff,
  Cpu,
  Sparkles,
  Command,
  LifeBuoy,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../providers/FirebaseProvider';
import { cn } from '../lib/utils';
import { testGeminiConnection } from '../lib/gemini';
import MatrixController from './MatrixController';

export default function SuperAdminView({ 
  setActiveTab, 
  settings = {},
  plans: cloudPlans = []
}: { 
  setActiveTab: (tab: string) => void,
  settings?: any,
  plans?: any[]
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userEmail = user?.email || localStorage.getItem('nexus_user_email');
  const isMasterAdminUser = userEmail?.toLowerCase() === 'ziedbenmiled3@gmail.com' || userEmail?.toLowerCase() === 'contact@nexuswp.pro';
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteCount, setSiteCount] = useState(0);

  // Support Tickets States
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedAdminTicket, setSelectedAdminTicket] = useState<any>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [customerSearch, setCustomerSearch] = useState('');
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [trialDurationUnit, setTrialDurationUnit] = useState<'days' | 'hours'>('days');

  useEffect(() => {
    if (editingPlan && String(editingPlan.id).toLowerCase().includes('trial')) {
      const hours = editingPlan.duration_hours || 24;
      if (hours % 24 === 0) {
        setTrialDurationUnit('days');
      } else {
        setTrialDurationUnit('hours');
      }
    }
  }, [editingPlan?.id]);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isDeletingPlan, setIsDeletingPlan] = useState<string | null>(null);
  
  // CRM States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [offerData, setOfferData] = useState({ title: '', content: '' });
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [giftPlanId, setGiftPlanId] = useState('');

  const [paypalClientId, setPaypalClientId] = useState('');
  const [isSavingPaypal, setIsSavingPaypal] = useState(false);
  const [paypalStatus, setPaypalStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [annualDiscount, setAnnualDiscount] = useState('20');
  const [isSavingDiscount, setIsSavingDiscount] = useState(false);
  const [discountStatus, setDiscountStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isRepairingRegistry, setIsRepairingRegistry] = useState(false);
  const [repairStatus, setRepairStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Gemini Master Key States
  const [geminiMasterKey, setGeminiMasterKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isSavingMasterKey, setIsSavingMasterKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; count?: number; models?: string[]; error?: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  // AppSumo States
  const [appsumoApiKey, setAppsumoApiKey] = useState('');
  const [appsumoClientId, setAppsumoClientId] = useState('');
  const [appsumoClientSecret, setAppsumoClientSecret] = useState('');
  const [isSavingAppSumo, setIsSavingAppSumo] = useState(false);
  const [appSumoStatus, setAppSumoStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load data immediately
  useEffect(() => {
    loadData();
  }, [user, userEmail]);

  // Sync master key from settings prop
  useEffect(() => {
    if (settings && settings.gemini_master_key) {
      setGeminiMasterKey(settings.gemini_master_key);
    }
    if (settings && settings.appsumo_api_key) {
      setAppsumoApiKey(settings.appsumo_api_key);
    }
    if (settings && settings.appsumo_client_id) {
      setAppsumoClientId(settings.appsumo_client_id);
    }
    if (settings && settings.appsumo_client_secret) {
      setAppsumoClientSecret(settings.appsumo_client_secret);
    }
  }, [settings]);

  const handleSaveAppSumo = async () => {
    setIsSavingAppSumo(true);
    setAppSumoStatus('idle');
    try {
      if (!isMasterAdminUser) {
        throw new Error('Not authorized to update settings.');
      }
      await Promise.all([
        firebaseService.updateSetting('appsumo_api_key', appsumoApiKey),
        firebaseService.updateSetting('appsumo_client_id', appsumoClientId),
        firebaseService.updateSetting('appsumo_client_secret', appsumoClientSecret)
      ]);
      setAppSumoStatus('success');
      setTimeout(() => setAppSumoStatus('idle'), 3000);
      alert('Paramètres AppSumo enregistrés avec succès dans Firebase.');
    } catch (err: any) {
      console.error('[Admin] AppSumo key update error:', err);
      setAppSumoStatus('error');
      alert("Échec de l'enregistrement des paramètres AppSumo : " + err.message);
    } finally {
      setIsSavingAppSumo(false);
    }
  };

  // Load mapping from props to state
  useEffect(() => {
    if (cloudPlans && cloudPlans.length > 0) {
      setPlans(cloudPlans);
    }
  }, [cloudPlans]);

  const handleTestKey = async () => {
    if (!geminiMasterKey) return;
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection(geminiMasterKey);
      // testGeminiConnection returns simplified text or response object
      // We rely on the fact that if it doesn't throw, it's successful
      setTestResult({ success: true });
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveMasterKey = async () => {
    if (!userEmail) return;
    setIsSavingMasterKey(true);
    try {
      await firebaseService.updateSetting('gemini_master_key', geminiMasterKey);
      alert('Clé Master AI enregistrée avec succès dans le Cloud.');
    } catch (err) {
      console.error('Save master key error:', err);
      alert("Erreur lors de l'enregistrement vers Firestore.");
    } finally {
      setIsSavingMasterKey(false);
    }
  };

  const handleRepairRegistry = async () => {
    if (!userEmail) return;
    setIsRepairingRegistry(true);
    setRepairStatus('idle');
    try {
      // Sync sites for ALL users found in the client list
      console.log('[Admin] Starting Global Registry Repair...');
      
      const repairTasks = subscribers.map(sub => {
        const targetEmail = sub.email || sub.user_email;
        if (targetEmail) {
          return firebaseService.syncAllSitesToRegistry(targetEmail);
        }
        return Promise.resolve({ success: true });
      });

      await Promise.all(repairTasks);
      setRepairStatus('success');
      setTimeout(() => setRepairStatus('idle'), 3000);
      alert("Protocole de réparation terminé : Le registre global des sites a été synchronisé pour tous les clients détectés.");
    } catch (err) {
      console.error('[Admin] Repair error:', err);
      setRepairStatus('error');
    } finally {
      setIsRepairingRegistry(false);
    }
  };

  const loadData = async () => {
    // PROTECT: Do not attempt to load if user is not ready or is not the Master admin
    if (!isMasterAdminUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [users, pays, settings, sitesData, plansData, ticketsData] = await Promise.all([
        firebaseService.getAllUsers(),
        firebaseService.getAllPayments(),
        firebaseService.getSettings(),
        firebaseService.getSites(userEmail!),
        firebaseService.getPlans(),
        firebaseService.getAllSupportTickets()
      ]);
      
      setSubscribers(users || []);
      setPayments(pays || []);
      setPaypalClientId(settings['paypal_client_id'] || '');
      setAnnualDiscount(settings['annual_discount_percentage'] || '20');
      setSiteCount(sitesData?.length || 0);
      setPlans(plansData || []);
      setTickets(ticketsData || []);
    } catch (err: any) {
      console.error('[Admin] Load error:', err);
      try {
        const parsed = JSON.parse(err.message);
        setError(`Échec du protocole Nexus : ${parsed.error} (Op: ${parsed.operationType})`);
      } catch {
        setError("Protocole de sécurité : Veuillez vous assurer d'être connecté avec le compte Master.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePaypal = async () => {
    setIsSavingPaypal(true);
    setPaypalStatus('idle');
    try {
      console.log('[Admin] Updating PayPal ID. Current User:', user?.email, user?.uid);
      if (!isMasterAdminUser) {
        throw new Error('Not authorized to update settings.');
      }
      await firebaseService.updatePaypalClientId(paypalClientId);
      setPaypalStatus('success');
      setTimeout(() => setPaypalStatus('idle'), 3000);
    } catch (err: any) {
      console.error('[Admin] Save error:', err);
      setPaypalStatus('error');
    } finally {
      setIsSavingPaypal(false);
    }
  };

  const handleSaveDiscount = async () => {
    setIsSavingDiscount(true);
    setDiscountStatus('idle');
    try {
      if (!isMasterAdminUser) {
        throw new Error('Not authorized to update settings.');
      }
      await firebaseService.updateSetting('annual_discount_percentage', annualDiscount);
      setDiscountStatus('success');
      setTimeout(() => setDiscountStatus('idle'), 3000);
    } catch (err: any) {
      console.error('[Admin] Discount save error:', err);
      setDiscountStatus('error');
    } finally {
      setIsSavingDiscount(false);
    }
  };

  const handleReplyTicket = async (ticketId: string, status: 'processing' | 'resolved') => {
    if (!ticketId || !ticketReplyText.trim()) return;
    setIsReplying(true);
    try {
      if (!isMasterAdminUser) {
        throw new Error('Not authorized to reply to tickets.');
      }
      await firebaseService.replyToSupportTicket(ticketId, ticketReplyText.trim(), status);
      setTicketReplyText('');
      setSelectedAdminTicket(null);
      const updatedTickets = await firebaseService.getAllSupportTickets();
      setTickets(updatedTickets || []);
    } catch (err) {
      console.error('[Admin] Error replying to ticket:', err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan.id || !editingPlan.name) return;
    
    setIsSavingPlan(true);
    try {
      await firebaseService.updatePlan(editingPlan.id, {
        ...editingPlan,
        price: Number(editingPlan.price),
        promo_price: editingPlan.promo_price ? Number(editingPlan.promo_price) : null,
        site_limit: Number(editingPlan.site_limit),
        duration_hours: (editingPlan.duration_hours !== undefined && editingPlan.duration_hours !== null) ? Number(editingPlan.duration_hours) : (editingPlan.id === 'trial' ? 24 : null)
      });
      setEditingPlan(null);
      await loadData();
    } catch (err) {
      console.error('Save plan error:', err);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce pack ?')) return;
    setIsDeletingPlan(id);
    try {
      await firebaseService.deletePlan(id);
      await loadData();
    } catch (err) {
      console.error('Delete plan error:', err);
    } finally {
      setIsDeletingPlan(null);
    }
  };

  const handleOfferGift = async () => {
    if (!selectedUser || !giftPlanId) return;
    setIsProcessingAction(true);
    try {
      const targetEmail = selectedUser.email || selectedUser.user_email;
      await firebaseService.giveFreePack(targetEmail, giftPlanId);
      setIsGiftModalOpen(false);
      setSelectedUser(null);
      await loadData();
      alert(`Pack ${giftPlanId} offert avec succès à ${targetEmail}`);
    } catch (err) {
      console.error('Gift error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSendOffer = async () => {
    if (!selectedUser || !offerData.title) return;
    setIsProcessingAction(true);
    try {
      const targetEmail = selectedUser.email || selectedUser.user_email;
      await firebaseService.sendOffer(targetEmail, offerData.title, offerData.content);
      setIsOfferModalOpen(false);
      setSelectedUser(null);
      setOfferData({ title: '', content: '' });
      alert(`Offre envoyée à ${targetEmail}`);
    } catch (err) {
      console.error('Offer error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteUser = (userItem: any) => {
    const targetEmail = userItem.email || userItem.user_email;
    if (!targetEmail) return;
    const isMasterAdmin = targetEmail.toLowerCase() === 'ziedbenmiled3@gmail.com' || targetEmail.toLowerCase() === 'contact@nexuswp.pro';
    if (isMasterAdmin) {
      alert("Erreur de protocole : Un compte Administrateur Principal ne peut pas être supprimé.");
      return;
    }
    setUserToDelete(userItem);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const targetEmail = userToDelete.email || userToDelete.user_email;
    try {
      setIsProcessingAction(true);
      await firebaseService.deleteUserAccount(userToDelete.uid || '', targetEmail);
      alert(`Le compte client ${targetEmail} a été intégralement supprimé du Nexus.`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      await loadData();
    } catch (err: any) {
      console.error('Delete user error:', err);
      alert(`Erreur lors de la suppression du compte: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Chargement du Nexus Control Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            NEXUS MASTER CONTROL
          </h1>
          <div className="space-y-1 mt-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Superuser: {userEmail}</p>
            <p className="text-[8px] text-slate-600 font-mono uppercase tracking-[0.2em]">Nexus ID: {user?.uid || 'RESTORED_SESSION'}</p>
          </div>
        </div>
        
        <button 
          onClick={loadData}
          className="px-6 py-3 bg-slate-900/50 border border-slate-800 hover:border-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Gemini Master Key Section */}
      <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Command className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">{t('superAdmin.masterKeyTitle')}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('superAdmin.masterKeySubtitle')}</p>
            </div>
          </div>
          {geminiMasterKey && (
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest">
              {t('superAdmin.detected')}
            </div>
          )}
        </div>

        <div className="space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 space-y-4 w-full">
              <div className="relative group/key">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                   <Key className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <input 
                  type={showKey ? "text" : "password"}
                  value={geminiMasterKey || ''}
                  onChange={(e) => setGeminiMasterKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-24 py-5 text-[11px] font-mono text-blue-400 focus:border-blue-500 transition-all outline-none"
                  placeholder="AIzaSy..."
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                   <span className="text-[8px] font-black text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-white/5 uppercase">L:{geminiMasterKey.length}</span>
                   <button 
                    onClick={() => setShowKey(!showKey)}
                    className="text-slate-600 hover:text-white transition-colors"
                   >
                     {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleTestKey}
                  disabled={isTestingKey || !geminiMasterKey}
                  className="py-5 bg-slate-900 border border-slate-800 hover:border-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                >
                  {isTestingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-blue-400" />}
                  {t('superAdmin.testKey')}
                </button>
                
                <button 
                  onClick={handleSaveMasterKey}
                  disabled={isSavingMasterKey || !geminiMasterKey}
                  className="py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/30 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                >
                  {isSavingMasterKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('superAdmin.saveKey')}
                </button>
              </div>

              <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-relaxed pt-2">
                * CETTE CLÉ EST UTILISÉE COMME MOTEUR AI GLOBAL PAR DÉFAUT POUR TOUS LES SITES SANS CLÉ PERSONNELLE.
              </p>
            </div>

            <div className="w-full md:w-80">
               <div className={cn(
                 "p-6 rounded-[2rem] border min-h-[220px] transition-all",
                 testResult ? (testResult.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20") : "bg-slate-950/50 border-slate-800"
               )}>
                 {!testResult && !isTestingKey ? (
                   <div className="flex flex-col items-center justify-center h-full opacity-20 text-center py-10 space-y-3">
                      <Cpu className="w-8 h-8" />
                      <p className="text-[8px] font-black uppercase tracking-widest">En attente d'analyse</p>
                   </div>
                 ) : isTestingKey ? (
                   <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-4">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Ping API Google Gemini...</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                         {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                         <span className={cn(
                           "text-[10px] font-black uppercase tracking-widest",
                           testResult.success ? "text-emerald-500" : "text-red-500"
                         )}>
                           {testResult.success ? `CLÉ VALIDE - ${testResult.count} MODÈLES TROUVÉS` : 'ERREUR DE VALIDATION'}
                         </span>
                      </div>

                      {testResult.success && testResult.models && (
                        <div className="flex flex-wrap gap-2">
                           {testResult.models.slice(0, 10).map((m, i) => (
                             <div key={i} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[7px] font-mono text-emerald-400">
                               {m}
                             </div>
                           ))}
                           {testResult.count! > 10 && (
                             <div className="text-[7px] font-black text-slate-600 uppercase mt-1">+{testResult.count! - 10} more...</div>
                           )}
                        </div>
                      )}

                      {testResult.error && (
                        <p className="text-[9px] font-bold text-red-400 uppercase leading-relaxed font-mono">{testResult.error}</p>
                      )}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </div>

      {/* Infrastructure Section */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
           <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">UNITÉ DE RÉPARATION DU REGISTRE</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Correction du verrouillage global des domaines</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                Si un site a été enregistré avant l'activation du registre global, il peut être vulnérable au vol.
                <br/><br/>
                <span className="text-white italic">Action :</span> Synchronise les domaines de TOUS les clients vers le registre central de sécurité.
              </p>
            </div>

            <button 
              onClick={handleRepairRegistry}
              disabled={isRepairingRegistry}
              className={cn(
                "w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all",
                repairStatus === 'success' 
                  ? "bg-emerald-600 text-white" 
                  : "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
              )}
            >
              {isRepairingRegistry ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : repairStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-blue-500" />
              )}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {repairStatus === 'success' ? 'SYNCHRONISATION TERMINÉE' : 'LANCER LA RÉPARATION GLOBALE'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Controller Section */}
      <MatrixController />

      {/* AppSumo Integration Section */}
      <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">UNITÉ D'INTÉGRATION APPSUMO</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Configuration de la clé API pour les clients et partenaires</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-widest">AppSumo Core</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">CLÉ API PRIVÉE / TEMPORAIRE APPSUMO</label>
              <div className="relative">
                <input 
                  type="password"
                  value={appsumoApiKey}
                  onChange={(e) => setAppsumoApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-[11px] font-mono text-white focus:border-indigo-500 transition-all outline-none"
                  placeholder="Entrez la clé de sécurité/jeton AppSumo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">APPSUMO CLIENT ID (OAUTH)</label>
              <input 
                type="text"
                value={appsumoClientId}
                onChange={(e) => setAppsumoClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-[11px] font-mono text-white focus:border-indigo-500 transition-all outline-none"
                placeholder="Client ID délivré par AppSumo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">APPSUMO CLIENT SECRET (OAUTH)</label>
              <input 
                type="password"
                value={appsumoClientSecret}
                onChange={(e) => setAppsumoClientSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-[11px] font-mono text-white focus:border-indigo-500 transition-all outline-none"
                placeholder="Client Secret délivré par AppSumo"
              />
            </div>

            <button 
              onClick={handleSaveAppSumo}
              disabled={isSavingAppSumo}
              className={cn(
                "w-full py-4 rounded-xl transition-all flex items-center justify-center gap-2",
                appSumoStatus === 'success' 
                  ? "bg-emerald-600 text-white" 
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/20"
              )}
            >
              {isSavingAppSumo ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : appSumoStatus === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span className="text-[9px] font-black uppercase tracking-widest">
                {appSumoStatus === 'success' ? 'ENREGISTRÉ' : "SAUVEGARDER L'INTÉGRATION APPSUMO"}
              </span>
            </button>
          </div>

          <div className="p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] space-y-4">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">GUIDE IMMÉDIAT ET URLS DE COMMANDE</h4>
            <div className="space-y-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
              <p>Configurez ces points de terminaison dans le portail d'intégration AppSumo :</p>
              
              <div className="space-y-1.5 bg-black/40 p-3.5 rounded-xl border border-white/5 font-mono text-[9px] text-slate-300 normal-case tracking-normal">
                <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider">Webhook URL :</span>
                <div className="truncate selection:bg-indigo-500 select-all">{typeof window !== 'undefined' ? window.location.origin : 'https://www.nexuswp.pro'}/api/webhooks/appsumo</div>
              </div>

              <div className="space-y-1.5 bg-black/40 p-3.5 rounded-xl border border-white/5 font-mono text-[9px] text-slate-300 normal-case tracking-normal">
                <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider">OAuth Redirect URL :</span>
                <div className="truncate select-all">{typeof window !== 'undefined' ? window.location.origin : 'https://www.nexuswp.pro'}/api/appsumo/redirect</div>
              </div>

              <div className="h-[1px] bg-white/5 my-2" />
              
              <p className="text-[9px] text-slate-500">
                📌 <span className="text-indigo-400 font-black">ACTIONS SUPPORTÉES :</span> L'unité écoute automatiquement les requêtes AppSumo :
                <br />- <span className="text-white">purchase / active</span> : Enregistre le coupon ou la souscription instantanément.
                <br />- <span className="text-white">upgrade / downgrade</span> : Met à jour les limites de sites du client.
                <br />- <span className="text-white">deactivate</span> : Bloque ou suspend l'accès.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Background */}
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      </div>

      {/* Pricing Configuration */}
      <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">STRATÉGIE DE TARIFICATION ANNUELLE</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Remises automatiques pour les engagements long terme</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-600/10 border border-amber-500/20 rounded-full text-[8px] font-black text-amber-500 uppercase tracking-widest">Global Pricing</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          <div className="p-6 bg-amber-600/5 border border-amber-500/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Note Stratégique</p>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
              La remise est appliquée sur le total annuel de chaque pack. <br/>
              Formule : <span className="text-white">(Prix Mensuel × 12) × (1 - Remise/100)</span>. <br/>
              Généralement conseillé : entre <span className="text-amber-400">15% et 30%</span> pour maximiser la rétention.
            </p>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">REMISE ANNUELLE (%)</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input 
                    type="number"
                    value={annualDiscount || ''}
                    onChange={(e) => setAnnualDiscount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-[11px] font-mono text-white focus:border-amber-500 transition-all outline-none"
                    placeholder="20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">%</div>
                </div>
                <button 
                  onClick={handleSaveDiscount}
                  disabled={isSavingDiscount}
                  className={cn(
                    "px-8 rounded-xl transition-all flex items-center justify-center gap-2 min-w-[140px]",
                    discountStatus === 'success' 
                      ? "bg-emerald-600 text-white" 
                      : "bg-amber-600 text-white hover:bg-amber-500 shadow-xl shadow-amber-900/20"
                  )}
                >
                  {isSavingDiscount ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : discountStatus === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {discountStatus === 'success' ? 'APPLIQUÉ' : 'MAINTENIR'}
                  </span>
                </button>
              </div>
            </div>
            {discountStatus === 'error' && (
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center italic">Erreur lors du déploiement de la stratégie.</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => setActiveTab('sites')}
          className="p-8 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] relative group cursor-pointer hover:border-blue-500/50 transition-all"
        >
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
            <Layout className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mes Sites Actifs</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black text-white italic tracking-tighter">{siteCount}</h3>
            {siteCount === 0 && (
              <span className="text-[8px] font-black text-blue-400 animate-pulse uppercase tracking-widest">Action Requise</span>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Gestion Nexus</span>
            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        <div className="p-8 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem]">
          <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
            <Users className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Abonnés Actifs</p>
          <h3 className="text-4xl font-black text-white italic tracking-tighter">{subscribers.length}</h3>
        </div>
        
        <div className="p-8 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem]">
          <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
            <CreditCard className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Transactions</p>
          <h3 className="text-4xl font-black text-white italic tracking-tighter">{payments.length}</h3>
        </div>

        <div className="p-8 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem]">
          <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nexus Status</p>
          <h3 className="text-2xl font-black text-white italic tracking-tighter">ONLINE</h3>
        </div>
      </div>

      {/* Tables List */}
      <div className="grid grid-cols-1 gap-10">
        {/* Plans Management */}
        <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Zap className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Gestion des Packs NEXUS</h2>
            </div>
            <button 
              onClick={() => setEditingPlan({
                id: '',
                name: '',
                price: 0,
                site_limit: 1,
                duration_hours: 1,
                description: '',
                features: ['Sync Automatique 24/7', 'Nexus AI Security Audit'],
                is_promo: false,
                promo_label: '',
                promo_price: null
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau Pack
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4 group relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white italic uppercase">{plan.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{plan.id}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingPlan(plan)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={isDeletingPlan === plan.id}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                    >
                      {isDeletingPlan === plan.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white italic">{plan.price} €</span>
                  {plan.is_promo && (
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">PROMO: {plan.promo_price} €</span>
                  )}
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="space-y-1.5">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>Sites Limit</span>
                      <span className="text-white">{plan.site_limit} Sites</span>
                   </div>
                   {plan.promo_label && (
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-blue-500">
                         <span>Label</span>
                         <span>{plan.promo_label}</span>
                      </div>
                   )}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {editingPlan && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Édition Protocole Pack</h3>
                    <button onClick={() => setEditingPlan(null)} className="text-slate-500 hover:text-white uppercase text-[10px] font-black">Fermer</button>
                  </div>

                  <form onSubmit={handleSavePlan} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">ID Technique (NEXUS_ID)</label>
                        <input 
                          value={editingPlan.id || ''}
                          onChange={e => setEditingPlan({...editingPlan, id: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                          placeholder="ex: starter"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Nom Public</label>
                        <input 
                          value={editingPlan.name || ''}
                          onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                          placeholder="Pack Vision"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Prix (€)</label>
                          <input 
                            type="number"
                            value={editingPlan.price || 0}
                            onChange={e => setEditingPlan({...editingPlan, price: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sites Limite</label>
                          <input 
                            type="number"
                            value={editingPlan.site_limit || 0}
                            onChange={e => setEditingPlan({...editingPlan, site_limit: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                            required
                          />
                        </div>
                      </div>

                      {/* FORCE TRIAL CONFIG AT THE TOP LEVEL IF DETECTED */}
                      {String(editingPlan.id).toLowerCase().includes('trial') && (
                        <div className="p-8 bg-blue-600/10 border-2 border-blue-500 rounded-3xl space-y-4 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6 text-blue-400 fill-blue-400" />
                                <p className="text-sm font-black text-white uppercase tracking-widest italic">CONFIG_DURÉE : TRIAL_PLAN</p>
                             </div>
                             <span className="text-[10px] font-black bg-blue-500 text-white px-3 py-1 rounded-full animate-pulse">ACTION REQUISE</span>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest">UNITÉ DE CONFIGURATION</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl border border-white/10">
                              <button
                                type="button"
                                onClick={() => {
                                  setTrialDurationUnit('days');
                                  const currentHours = editingPlan.duration_hours || 24;
                                  const rawDays = Math.round((currentHours / 24) * 10) / 10;
                                  setEditingPlan({ ...editingPlan, duration_hours: rawDays * 24 });
                                }}
                                className={cn(
                                  "py-2.5 text-xs font-black rounded-lg transition-all uppercase tracking-widest",
                                  trialDurationUnit === 'days'
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 italic"
                                    : "text-slate-400 hover:text-white bg-transparent"
                                )}
                              >
                                Jours
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setTrialDurationUnit('hours');
                                }}
                                className={cn(
                                  "py-2.5 text-xs font-black rounded-lg transition-all uppercase tracking-widest",
                                  trialDurationUnit === 'hours'
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 italic"
                                    : "text-slate-400 hover:text-white bg-transparent"
                                )}
                              >
                                Heures
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-white tracking-widest">
                              {trialDurationUnit === 'days' ? 'DURÉE DE VALIDITÉ (EN JOURS)' : 'DURÉE DE VALIDITÉ (EN HEURES)'}
                            </label>
                            <div className="relative">
                              {trialDurationUnit === 'days' ? (
                                <input 
                                  type="number"
                                  step="any"
                                  min="0.1"
                                  value={Math.round(((editingPlan.duration_hours || 24) / 24) * 10) / 10}
                                  onChange={e => {
                                    const val = Number(e.target.value);
                                    setEditingPlan({...editingPlan, duration_hours: val * 24});
                                  }}
                                  className="w-full bg-black border-2 border-blue-500 rounded-2xl px-6 py-5 text-lg font-black text-white focus:ring-4 focus:ring-blue-500/20 transition-all outline-none animate-none"
                                  placeholder="1"
                                  required
                                />
                              ) : (
                                <input 
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={editingPlan.duration_hours || 1}
                                  onChange={e => setEditingPlan({...editingPlan, duration_hours: Number(e.target.value)})}
                                  className="w-full bg-black border-2 border-blue-500 rounded-2xl px-6 py-5 text-lg font-black text-white focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                  placeholder="1.0"
                                  required
                                />
                              )}
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-blue-500 italic">
                                {trialDurationUnit === 'days' ? 'JOURS' : 'HRS'}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-[10px] font-black text-slate-500 uppercase bg-white/5 p-3 rounded-xl border border-white/5">
                              {trialDurationUnit === 'days' ? (
                                <>
                                  <div className="bg-black/40 px-2 py-1 rounded">1 jour = 24 heures</div>
                                  <div className="bg-black/40 px-2 py-1 rounded">3 jours = 72 heures</div>
                                  <div className="bg-black/40 px-2 py-1 rounded">7 jours = 168 heures</div>
                                </>
                              ) : (
                                <>
                                  <div className="bg-black/40 px-2 py-1 rounded">0.5 = 30m</div>
                                  <div className="bg-black/40 px-2 py-1 rounded">1 = 1h</div>
                                  <div className="bg-black/40 px-2 py-1 rounded">24 = 1 JOUR</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Option Promo</label>
                        <select 
                          value={editingPlan.is_promo ? 'yes' : 'no'}
                          onChange={e => setEditingPlan({...editingPlan, is_promo: e.target.value === 'yes'})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                          disabled={String(editingPlan.id).toLowerCase().includes('trial')}
                        >
                          <option value="no">NON</option>
                          <option value="yes">OUI</option>
                        </select>
                      </div>
                    </div>
                    {editingPlan.id !== 'trial' && editingPlan.is_promo && (
                      <div className="grid grid-cols-2 gap-6 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                         <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Prix Promo (€)</label>
                           <input 
                             type="number"
                             value={editingPlan.promo_price || ''}
                             onChange={e => setEditingPlan({...editingPlan, promo_price: e.target.value})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Label Promo</label>
                           <input 
                             value={editingPlan.promo_label || ''}
                             onChange={e => setEditingPlan({...editingPlan, promo_label: e.target.value})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                             placeholder="ex: -50% OFF"
                           />
                         </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Description</label>
                      <textarea 
                        value={editingPlan.description || ''}
                        onChange={e => setEditingPlan({...editingPlan, description: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white h-20"
                        placeholder="Description du pack..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Features (Une par ligne)</label>
                      <textarea 
                        value={Array.isArray(editingPlan.features) ? editingPlan.features.join('\n') : ''}
                        onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split('\n')})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white h-24"
                        placeholder="Feature 1
Feature 2"
                      />
                      <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest px-1">
                        Utilisez la touche Entrée pour séparer vos arguments
                      </p>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingPlan}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 disabled:opacity-50"
                    >
                      {isSavingPlan ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Mettre à jour le Nexus Pack'}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CRM Section - Customer Management */}
        <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                   <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Gestion de la Clientèle Nexus</h2>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pilotage des relations et offres VIP</p>
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="RECHERCHER CLIENT..."
                    value={customerSearch || ''}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-4 py-2 text-[8px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500 transition-all w-48"
                  />
                </div>
                <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase">
                   {subscribers.length} Clients
                </div>
             </div>
          </div>

          {/* Scrollable Container (L'ascenseur) */}
          <div className="relative border border-slate-800/50 rounded-3xl overflow-hidden bg-slate-950/20">
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-[#0c0e14] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Client (Email)</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Pack Actuel</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Actions Nexus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subscribers
                    .filter(sub => {
                      const email = (sub.email || sub.user_email || '').toLowerCase();
                      return email.includes(customerSearch.toLowerCase());
                    })
                    .map((item, idx) => (
                    <tr key={idx} className="group hover:bg-blue-500/5 transition-all">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-bold text-white mb-0.5">{item.email || item.user_email}</span>
                           <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">UID: {item.uid?.substring(0, 12) || item.id?.substring(0, 12)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "w-1.5 h-1.5 rounded-full",
                             item.subscription?.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-700"
                           )} />
                           <span className={cn(
                             "text-[10px] font-black uppercase tracking-tight",
                             item.subscription?.status === 'active' ? "text-blue-400" : "text-slate-500"
                           )}>
                             {item.plan_name}
                           </span>
                           {item.subscription?.is_free && (
                             <span className="text-[7px] font-black text-amber-500 border border-amber-500/30 px-1 rounded uppercase">Cadeau</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                          item.subscription?.status === 'active' ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" : "text-slate-600 bg-slate-900 border border-slate-800"
                        )}>
                          {item.subscription?.status || 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => { setSelectedUser(item); setIsGiftModalOpen(true); }}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                             title="Offrir un Pack Gratuit"
                           >
                             <Zap className="w-3 h-3" />
                             Pack VIP
                           </button>
                           <button 
                             onClick={() => { setSelectedUser(item); setIsOfferModalOpen(true); }}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                             title="Soumettre une Offre"
                           >
                             <CheckCircle2 className="w-3 h-3" />
                             OFFRE
                           </button>
                           <button 
                             onClick={() => handleDeleteUser(item)}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                             title="Supprimer entièrement le compte"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                             Supprimer
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                           <Users className="w-10 h-10 text-slate-500" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Aucun client trouvé dans le Nexus</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Gift Modal */}
        <AnimatePresence>
          {isGiftModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
            >
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0c0e14] border border-amber-500/30 rounded-[2.5rem] p-10 max-w-md w-full relative">
                <div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-amber-500/30">
                   <Zap className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter text-center mb-2">OFFRIR UN PACK VIP</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-8">Client : <span className="text-white">{selectedUser?.email || selectedUser?.user_email}</span></p>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Sélectionner le Pack à offrir</label>
                      <select 
                        value={giftPlanId || ''}
                        onChange={(e) => setGiftPlanId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xs text-white focus:border-amber-500 transition-all outline-none"
                      >
                         <option value="">-- CHOISIR UN PACK --</option>
                         {plans.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                         ))}
                      </select>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button onClick={() => setIsGiftModalOpen(false)} className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">ANNULER</button>
                      <button 
                        onClick={handleOfferGift}
                        disabled={!giftPlanId || isProcessingAction}
                        className="flex-1 py-4 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 disabled:opacity-30"
                      >
                        {isProcessingAction ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "ACTIVER LE CADEAU"}
                      </button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offer Modal */}
        <AnimatePresence>
          {isOfferModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
            >
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0c0e14] border border-blue-500/30 rounded-[2.5rem] p-10 max-w-lg w-full relative">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-blue-500/30">
                   <CheckCircle2 className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter text-center mb-2">SOUMETTRE UNE OFFRE VIP</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-8">Destinataire : <span className="text-white">{selectedUser?.email || selectedUser?.user_email}</span></p>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Titre de l'Offre</label>
                      <input 
                        value={offerData.title || ''}
                        onChange={(e) => setOfferData({...offerData, title: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xs text-white placeholder:text-slate-700"
                        placeholder="Ex: -70% sur votre prochain Renouvellement"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Contenu / Message</label>
                      <textarea 
                        value={offerData.content || ''}
                        onChange={(e) => setOfferData({...offerData, content: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xs text-white h-32 placeholder:text-slate-700"
                        placeholder="Détails de l'offre et code promo..."
                      />
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button onClick={() => setIsOfferModalOpen(false)} className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">PLUS TARD</button>
                      <button 
                        onClick={handleSendOffer}
                        disabled={!offerData.title || isProcessingAction}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 disabled:opacity-30"
                      >
                        {isProcessingAction ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "ENVOYER L'OFFRE"}
                      </button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && userToDelete && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md"
            >
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0c0e14] border border-rose-500/30 rounded-[2.5rem] p-10 max-w-lg w-full relative">
                <div className="w-16 h-16 bg-rose-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-rose-500/30">
                   <AlertTriangle className="w-8 h-8 text-rose-500 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter text-center mb-2">SUPPRESSION DE COMPTE CLIENT</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-8">
                  Client ciblé : <span className="text-rose-400">{userToDelete.email || userToDelete.user_email}</span>
                </p>
                
                <div className="space-y-6">
                  <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl text-[11px] text-slate-300 leading-relaxed font-semibold">
                    ⚠️ <span className="text-rose-500 uppercase font-black">Attention, Alerte Critique :</span> Cette action supprimera définitivement le profil de l'utilisateur, ses abonnements, ses sites associés et son historique complet du registre système Nexus. Aucun retour en arrière n'est possible.
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }} 
                      type="button"
                      className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                      disabled={isProcessingAction}
                    >
                      ANNULER
                    </button>
                    <button 
                      onClick={confirmDeleteUser}
                      type="button"
                      disabled={isProcessingAction}
                      className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 transition-all active:scale-95 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessingAction ? <RefreshCw className="w-4 h-4 animate-spin" /> : "CONFIRMER"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Support Tickets Section */}
        <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                   <LifeBuoy className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Gestion des Tickets de Support</h2>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Remontées d'anomalies de sessions utilisateurs</p>
                </div>
             </div>
             
             <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                {tickets.length} Tickets Actifs
             </div>
          </div>

          <div className="relative border border-slate-800/50 rounded-3xl overflow-hidden bg-slate-950/20 mb-6 font-sans">
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-[#0c0e14] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Client & Catégorie</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Sujet du Ticket</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Écran Actif</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map((t, idx) => (
                    <tr key={idx} className="group hover:bg-[#1e1b4b]/30 transition-all">
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-white">{t.user_email}</span>
                          <span className={cn(
                            "text-[8px] font-mono uppercase tracking-widest w-fit px-1.5 py-0.5 rounded",
                            t.category === 'bug' ? "bg-red-500/10 text-red-400" :
                            t.category === 'suggestion' ? "bg-amber-500/10 text-amber-400" :
                            t.category === 'connection' ? "bg-blue-500/10 text-blue-400" : "bg-slate-500/10 text-slate-400"
                          )}>
                            {t.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[11px] font-semibold text-slate-200 uppercase tracking-tight line-clamp-1">{t.subject}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{t.active_tab || 'Inconnu'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                          t.status === 'new' ? "text-blue-500 bg-blue-500/10" :
                          t.status === 'processing' ? "text-amber-500 bg-amber-500/10 animate-pulse" :
                          "text-emerald-500 bg-emerald-500/10"
                        )}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => setSelectedAdminTicket(t)}
                          className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          RÉPONDRE
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                           <LifeBuoy className="w-10 h-10 text-slate-500" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Aucun ticket soumis</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Support Reply Modal */}
        <AnimatePresence>
          {selectedAdminTicket && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
            >
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0c0e14] border border-indigo-500/30 rounded-[2.5rem] p-10 max-w-lg w-full relative h-[90vh] overflow-y-auto no-scrollbar">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-indigo-500/30">
                   <LifeBuoy className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter text-center mb-1">RÉPONDRE AU CLIENT</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-6">Sujet : <span className="text-white italic">{selectedAdminTicket.subject}</span></p>
                
                <div className="space-y-6">
                   <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                      <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1 pl-1">Description Utilisateur :</p>
                      <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                         {selectedAdminTicket.description}
                      </p>
                      <p className="text-[8px] font-mono text-slate-600 uppercase tracking-tight mt-3">Écran actif : {selectedAdminTicket.active_tab} | Nav : {selectedAdminTicket.browser_info?.substring(0, 100)}...</p>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Message d'orientation ou réponse :</label>
                      <textarea 
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xs text-white h-24 placeholder:text-slate-700 font-semibold"
                        placeholder="Rédigez votre réponse ici..."
                      />
                   </div>

                   {/* Existing Reply if any */}
                   {selectedAdminTicket.admin_reply && (
                      <div className="p-3 bg-indigo-950/30 border border-indigo-800/20 rounded-xl">
                         <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Réponse actuelle :</p>
                         <p className="text-[11px] text-slate-300 italic font-medium">{selectedAdminTicket.admin_reply}</p>
                      </div>
                   )}

                   <div className="flex flex-col gap-3">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleReplyTicket(selectedAdminTicket.id, 'processing')}
                          disabled={!ticketReplyText.trim() || isReplying}
                          className="flex-1 py-4 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-30"
                        >
                           {isReplying ? "CHARGEMENT..." : "EN COURS"}
                        </button>
                        <button 
                          onClick={() => handleReplyTicket(selectedAdminTicket.id, 'resolved')}
                          disabled={!ticketReplyText.trim() || isReplying}
                          className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-30"
                        >
                           {isReplying ? "CHARGEMENT..." : "RÉSOLU & FERMER"}
                        </button>
                      </div>
                      <button onClick={() => { setSelectedAdminTicket(null); setTicketReplyText(''); }} className="w-full py-4 bg-slate-900 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">PLUS TARD / FERMER</button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payments Table */}
        <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
          <div className="flex items-center gap-4 mb-8">
             <CreditCard className="w-5 h-5 text-emerald-500" />
             <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Journal Financier</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Client</th>
                  <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Montant</th>
                  <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Transaction</th>
                  <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((pay, idx) => (
                  <tr key={idx} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 text-[11px] font-bold text-white">{pay.user_email}</td>
                    <td className="py-4 text-emerald-400 font-black italic">{pay.amount} €</td>
                    <td className="py-4 text-[10px] font-mono text-slate-500">{pay.transaction_id}</td>
                    <td className="py-4 text-[10px] font-mono text-slate-500">
                      {typeof pay.created_at === 'string' ? pay.created_at : 'Recent'}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                      Aucun paiement enregistré
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
