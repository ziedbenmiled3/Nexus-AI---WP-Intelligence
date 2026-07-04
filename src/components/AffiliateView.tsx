import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Send, 
  Settings, 
  CreditCard, 
  ChevronRight, 
  Zap,
  LayoutDashboard,
  ExternalLink,
  Table,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  Crown,
  Sparkles,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import Sparkline from './Sparkline';

const TRANSLATIONS = {
  fr: {
    estimez_gains: "Estimez Vos Gains Passifs",
    simulateur_desc: "Simulateur de revenus récurrents d'affiliation",
    choisissez_plan: "1. Choisissez le Plan Principal de Promotion",
    nombre_abonnes: "2. Nombre d'Abonnés Actifs Parrainés",
    taux_comm: "3. Votre Taux de Commission Actuel",
    taux_desc: "% de commissions sur la vente",
    passif_mensuel: "Passif Mensuel Récurrent",
    mrr_net: "/mois (MRR Net)",
    rente_annuelle: "Rente Annuelle Estimée",
    an_generes: "/an générés",
    clients: "clients",
    client_singular: "client",
    copy: "client",
    objectif: "Objectif :",
    kit_titre: "Outils d’Influence d’Élite",
    kit_desc: "Matériel de marketing sémantique à copier-coller",
    kit_email: "Kit Email",
    kit_social: "Post Réseau",
    kit_playbook: "Arguments VIP",
    copier_btn: "COPIER LA RESSOURCE EN 1 CLIC",
    copie_btn: "COPIÉ DANS LE PRESSE-PAPIERS !",
    sujet_email: "Optimisation WooCommerce Autonome - Libérez vos marges et votre SEO ?",
    corps_email: "Bonjour,\n\nJe vous contacte au sujet de votre boutique WooCommerce. En l'analysant, j'ai constaté des opportunités majeures pour automatiser vos opérations, générer des publicités vidéos et stimuler instantanément vos conversions grâce à WP_AGENT.AI.\n\nC'est une plateforme d'IA autonome asynchrone qui gère en direct :\n- Nexus Vidéo & Voice Studio (crée automatiquement des vidéos verticales de vente AIDA sonorisées par les voix off ultra-réalistes de Rachel, Antoni, ou Bella avec option de téléchargement direct)\n- Dynamic Smart Pricing (réajuste vos prix en permanence selon la demande d'achat)\n- Stock Optimizer prévisionnel (prévient les ruptures de stock jusqu'à 45 jours)\n- Générateur SEO multilingue et conformité technique Google\n\nIntégrez le script asynchrone universel de manière non-bloquante en moins de 2 minutes.\n\nRéclamez votre essai VIP gratuit de 24 heures : \n👉 ",
    corps_email_fin: "\n\nBien amicalement,\n[Votre Nom]",
    social_text: "🚀 WooCommerce est formidable, mais gérer les variations de prix concurrentiels et l'approvisionnement des stocks est un casse-tête quotidien.\n\nWP_AGENT.AI révolutionne l'e-commerce en coulisse. Une IA autonome qui :\n🎥 Studio Vidéo Publicitaire (compile des vidéos de vente au format TikTok/Reels en 1 clic avec des voix off IA exceptionnelles de réalisme)\n📊 Calcule et ajuste les tarifs WooCommerce d'après la demande d'achat\n📦 Modélise et anticipe les besoins fournisseurs jusqu'à 45 jours\n✍️ Structure un SEO de grade Google Bot pour toutes vos fiches produits\n\nIntégration non-bloquante ultra rapide en moins de 2 minutes via script (WPCode).\n\nProfitez de l'accès VIP gratuit de 24 heures pour tester en direct :\n👉 ",
    playbook_1_title: "Installation en < 2min chrono",
    playbook_1_desc: "Insertion d'un simple hook universel asynchrone via WPCode. Aucune extension lourde requise, vitesse de page préservée intégralement.",
    playbook_2_title: "Studio Vidéo AIDA & Voix Off IA",
    playbook_2_desc: "Conçoit en un instant des clips publicitaires verticaux prêts à poster sur les réseaux pour booster l'engagement organique de vos produits.",
    playbook_3_title: "Smart Pricing Autonome",
    playbook_3_desc: "Analyse sémantique et comportementale permanente calculant le point d'inflexion idéal pour capter l'achat sans dévaluer le catalogue.",
    arguments_majeurs: "Arguments Majeurs de Promotion de WP_AGENT.AI :\n1. Connexion non-bloquante ultra rapide en < 2 minutes via un simple hook asynchrone.\n2. Studio Vidéo Publicitaire vertical AIDA avec voix off ultra-réalistes interchangeables (Antoni, Bella, Rachel) et téléchargement direct MP4.\n3. Smart Pricing autonome maximisant la rentabilité à chaque panier chaud de WooCommerce.",
    historique_ventes: "Historique des Ventes",
    filtrer_ventes: "FILTRER LES VENTES...",
    th_client: "Client",
    th_pack: "Pack",
    th_montant: "Montant",
    th_com: "Com.",
    th_date: "Date",
    retrait_titre: "Retrait (Min 50€)",
    dispo_retrait: "Disponible pour retrait",
    demander_paiement: "Demander le Paiement",
    paypal_delai: "Paiement via PayPal sous 24/48h",
    dernieres_demandes: "Dernières Demandes",
    traitement: "TRAITEMENT...",
    alert_demande_paiement_err: "Erreur lors de la demande de paiement",
    nouv_profils: "nouveaux profils affiliés créés.",
    sync_err: "Erreur lors de la synchronisation",
    alert_payout_sec: 'Veuillez utiliser la section "Demandes Actives" pour ce paiement spécifique.',
    alert_batch_err: 'Erreur lors du paiement groupé',
    alert_single_payout_err: 'Erreur lors du paiement',
    demande_payout_titre: "Demandes de Paiement Actives",
    toutes_demandes_traitees: "Toutes les demandes ont été traitées",
    montant_demande: "Montant Demandé",
    rejoint: "Rejoint le",
    registration_title: "Configuration des Commissions",
    sync_btn: "Sync Clients Nexus",
    sync_ing: "Sync en cours...",
    search_aff: "RECHERCHER AFFILIÉ...",
    registre_aff: "Registre des Affiliés",
    demandes_paiement: "Demandes de Paiement",
    toutes_payer: "Tout Payer",
    aucune_demande: "Aucune demande en attente",
    payer_paypal: "Payer via PayPal",
    paye_status: "Payé",
    attente_status: "En attente",
    actif_status: "ACTIF",
    th_aff: "Affilié",
    th_act: "Activité (7j)",
    th_rev: "Revenu Gen.",
    th_prof: "Profil",
    billing_mode: "VUE SUPER-ADMIN",
    user_console: "CONSOLE PARTENAIRE",
    delete_confirm: "Êtes-vous sûr de vouloir supprimer définitivement cet affilié ainsi que son historique complet ?"
  },
  en: {
    estimez_gains: "Estimate Your Passive Earnings",
    simulateur_desc: "Interactive affiliate recurring revenue simulator",
    choisissez_plan: "1. Choose Primary Promotion Plan",
    nombre_abonnes: "2. Number of Sponsored Active Subscribers",
    taux_comm: "3. Your Current Commission Percentage",
    taux_desc: "% of sales commission",
    passif_mensuel: "Passive Monthly Recurring Revenue",
    mrr_net: "/month (Net MRR)",
    rente_annuelle: "Estimated Annual Return",
    an_generes: "/year generated",
    clients: "subscribers",
    client_singular: "subscriber",
    copy: "subscriber",
    objectif: "Target:",
    kit_titre: "Elite Influence Toolkit",
    kit_desc: "High-converting semantic marketing materials ready to paste",
    kit_email: "Email Kit",
    kit_social: "Social Post",
    kit_playbook: "VIP Bulletpoints",
    copier_btn: "COPY RESOURCE IN 1-CLICK",
    copie_btn: "COPIED TO CLIPBOARD!",
    sujet_email: "Autonomous WooCommerce Optimization - Boost margins & SEO?",
    corps_email: "Hello,\n\nI am reaching out regarding your WooCommerce store. When auditing it, I identified massive opportunities to automate your sales operations, auto-generate marketing materials, and instantly boost conversions using WP_AGENT.AI.\n\nIt is an autonomous background AI platform that dynamically handles:\n- Nexus Video & Voice Studio (creates automatic vertical AIDA promotional videos voiced by ultra-realistic voice profiles Rachel, Antoni, or Bella with direct single-click downloads)\n- Dynamic Smart Pricing (adapts items pricing live based on interest demand)\n- Predictive Stock Optimizer (prevents inventory stockouts up to 45 days ahead)\n- Multilingual SEO Generator with flawless Google Bot compliance\n\nYou can integrate the universal script easily in under 2 minutes (WPCode).\n\nClaim your complimentary 24-hour VIP live trial:\n👉 ",
    corps_email_fin: "\n\nWarm regards,\n[Your Name]",
    social_text: "🚀 WooCommerce is amazing, but managing competitive prices and supplier stocking is a daily headache.\n\nWP_AGENT.AI revolutionizes e-commerce behind the scenes with autonomous AI:\n🎥 Vertical Ads Video Studio (renders high-quality vertical selling slideshows with human-sounding voice voice-overs in one click)\n📊 Adapts WooCommerce pricing live based on purchase demand\n📦 Automates inventory forecasts up to 45 days ahead\n✍️ Writes SEO and meta layers matching Google Bot's standards instantly\n\nIntegrates seamlessly in under 2 minutes via script (WPCode).\n\nClaim your 24-hour free VIP trial slot here:\n👉 ",
    playbook_1_title: "Installation under 2min flat",
    playbook_1_desc: "Insert a single asynchronous universal hook via WPCode. No bloated plugins loaded, preserving 100% of your website speed score.",
    playbook_2_title: "AIDA Video & Voice Studio",
    playbook_2_desc: "Conceive social video ads narrated by high-quality AI speech actors in 1-click, and download MP4 files instantly.",
    playbook_3_title: "Autonomous Smart Pricing",
    playbook_3_desc: "Constant behavioral analytics determining the perfect price point live to trigger the purchase without catalog value degradation.",
    arguments_majeurs: "Key Promotional Selling Points of WP_AGENT.AI:\n1. Non-blocking connection in < 2 mins flat via universal async script.\n2. In-app vertical AIDA Video Production Studio with interchangeable realistic narration voices (Antoni, Bella, Rachel) alongside secure direct MP4 downloading.\n3. Autonomous smart pricing maximizing profit on hot WooCommerce carts.",
    historique_ventes: "Sales History",
    filtrer_ventes: "FILTER SALES...",
    th_client: "Customer",
    th_pack: "Pack",
    th_montant: "Amount",
    th_com: "Com.",
    th_date: "Date",
    retrait_titre: "Withdrawal (Min 50€)",
    dispo_retrait: "Available for withdrawal",
    demander_paiement: "Request Payout",
    paypal_delai: "Payout inside PayPal within 24/48h",
    dernieres_demandes: "Latest Requests",
    traitement: "PROCESSING...",
    alert_demande_paiement_err: "Error requesting payout",
    nouv_profils: "new affiliate profiles created.",
    sync_err: "Error during synchronization",
    alert_payout_sec: 'Please use the "Active Requests" section for this specific payout.',
    alert_batch_err: 'Error during batch payout',
    alert_single_payout_err: 'Error executing payout',
    demande_payout_titre: "Active Payout Requests",
    toutes_demandes_traitees: "All requests have been successfully processed",
    montant_demande: "Payout Amount",
    rejoint: "Joined on",
    registration_title: "Commission Settings",
    sync_btn: "Sync Nexus Customers",
    sync_ing: "Syncing...",
    search_aff: "SEARCH AFFILIATE...",
    registre_aff: "Affiliates Registry",
    demandes_paiement: "Payout Requests",
    toutes_payer: "Pay All",
    aucune_demande: "No pending requests",
    payer_paypal: "Pay via PayPal",
    paye_status: "Paid",
    attente_status: "Pending",
    actif_status: "ACTIVE",
    th_aff: "Affiliate",
    th_act: "Activity (7d)",
    th_rev: "Rev. Gen.",
    th_prof: "Profile",
    billing_mode: "SUPER-ADMIN VIEW",
    user_console: "PARTNER CONSOLE",
    delete_confirm: "Are you sure you want to permanently delete this affiliate and all of their historical records?"
  }
};

const getMilestoneLabel = (count: number, activeLang: 'fr' | 'en') => {
  if (activeLang === 'en') {
    if (count <= 5) return "Comfortable Pocket Money ☕";
    if (count <= 15) return "Complete Tool Cost Recovery 🛠️";
    if (count <= 30) return "Powerful Side Revenue 🚀";
    if (count <= 50) return "Active Financial Independence 💼";
    return "Absolute Financial Freedom & Affiliate Elite Rank 🔥";
  } else {
    if (count <= 5) return "Complément Confortable ☕";
    if (count <= 15) return "Amortissement Total Outils 🛠️";
    if (count <= 30) return "Revenu Secondaire Puissant 🚀";
    if (count <= 50) return "Indépendance financière active 💼";
    return "Liberté Financière Totale & Élite d'Affiliation 🔥";
  }
};

interface AffiliateProfile {
  id: number;
  user_email: string;
  user_name: string;
  paypal_email: string;
  referral_code: string;
  total_revenue: number;
  current_balance: number;
  created_at: string;
  referral_count?: number;
  pending_payouts?: number;
  sparkline?: { date: string, total: number }[];
}

export default function AffiliateView({ userEmail, plans }: { userEmail: string; plans?: any[] }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language && i18n.language.startsWith('en') ? 'en' : 'fr';
  const tl = (key: keyof typeof TRANSLATIONS['fr']) => TRANSLATIONS[currentLang][key];

  const [isAdmin, setIsAdmin] = useState(userEmail === 'contact@nexuswp.pro');
  const [activeMode, setActiveMode] = useState<'user' | 'admin'>(isAdmin ? 'admin' : 'user');
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [allAffiliates, setAllAffiliates] = useState<AffiliateProfile[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [commissionSettings, setCommissionSettings] = useState<any[]>([]);
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  
  // Filters
  const [affiliateSearch, setAffiliateSearch] = useState('');
  const [salesSearch, setSalesSearch] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isPayingAll, setIsPayingAll] = useState(false);

  // Custom modal states for iframe safety (avoiding window.confirm/alert)
  const [affDeleteTarget, setAffDeleteTarget] = useState<AffiliateProfile | null>(null);
  const [isDeletingAff, setIsDeletingAff] = useState(false);
  const [isPayAllOpen, setIsPayAllOpen] = useState(false);

  // Affiliate Growth states
  const [simCount, setSimCount] = useState<number>(10);
  const [simPack, setSimPack] = useState<'starter' | 'pro' | 'elite'>('pro');
  const [simComm, setSimComm] = useState<number>(25);
  const [promoTab, setPromoTab] = useState<'email' | 'social' | 'playbook'>('email');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Dynamic Currency Conversion state & logic
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR');
  
  const getPlanPrice = (pk: 'starter' | 'pro' | 'elite') => {
    if (plans && plans.length > 0) {
      const found = plans.find(p => p.id && String(p.id).toLowerCase() === pk);
      if (found && typeof found.price !== 'undefined') {
        return Number(found.price);
      }
    }
    // Fallback if not loaded
    return pk === 'starter' ? 29 : pk === 'pro' ? 79 : 199;
  };

  const getCalculatedPrice = (baseEur: number) => {
    if (selectedCurrency === 'EUR') {
      return `${baseEur.toFixed(2)}€`;
    } else {
      return `$${(baseEur * 1.08).toFixed(2)}`;
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeMode]);

  useEffect(() => {
    if (commissionSettings && commissionSettings.length > 0) {
      const dbPackName = simPack === 'starter' ? 'Basic' : simPack === 'pro' ? 'Pro' : 'Elite';
      const commSetting = commissionSettings.find(
        c => c.pack_name?.toLowerCase() === dbPackName.toLowerCase()
      );
      if (commSetting) {
        setSimComm(commSetting.percentage);
      }
    } else {
      const fallback = simPack === 'starter' ? 10 : simPack === 'pro' ? 15 : 25;
      setSimComm(fallback);
    }
  }, [simPack, commissionSettings]);

  const handleSyncUsers = async () => {
    const { firebaseService } = await import('../services/firebaseService');
    setIsSyncing(true);
    try {
      const users = await firebaseService.getAllUsers();
      if (users && users.length > 0) {
        const res = await axios.post('/api/admin/sync-affiliates', { users }, { headers: { 'x-user-email': userEmail } });
        alert(`${res.data.created} ${tl('nouv_profils')}`);
        await fetchData();
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert(tl('sync_err'));
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeMode === 'user') {
        const [statsRes, commsRes] = await Promise.all([
          axios.get('/api/affiliate/stats', { headers: { 'x-user-email': userEmail } }),
          axios.get('/api/admin/commissions', { headers: { 'x-user-email': userEmail } })
        ]);
        setProfile(statsRes.data.affiliate);
        setReferrals(statsRes.data.referrals);
        setPayouts(statsRes.data.payouts);
        setCommissionSettings(commsRes.data);
      } else {
        const [affs, reqs, comms] = await Promise.all([
          axios.get('/api/admin/affiliates', { headers: { 'x-user-email': userEmail } }),
          axios.get('/api/admin/payout-requests', { headers: { 'x-user-email': userEmail } }),
          axios.get('/api/admin/commissions', { headers: { 'x-user-email': userEmail } })
        ]);
        setAllAffiliates(affs.data);
        setPayoutRequests(reqs.data);
        setCommissionSettings(comms.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!profile || profile.current_balance < 50) return;
    setIsRequesting(true);
    try {
      await axios.post('/api/affiliate/request-payout', { amount: profile.current_balance }, { headers: { 'x-user-email': userEmail } });
      await fetchData();
    } catch (err) {
      alert(tl('alert_demande_paiement_err'));
    } finally {
      setIsRequesting(false);
    }
  };

  const handlePay = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await axios.post('/api/admin/execute-payout', { requestId }, { headers: { 'x-user-email': userEmail } });
      await fetchData();
    } catch (err) {
      alert(tl('alert_single_payout_err'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateCommission = async (pack: string, percentage: number) => {
    setSavingStatus(prev => ({ ...prev, [pack]: 'saving' }));
    try {
      await axios.post('/api/admin/commissions', { pack, percentage }, { headers: { 'x-user-email': userEmail } });
      await fetchData();
      setSavingStatus(prev => ({ ...prev, [pack]: 'saved' }));
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [pack]: 'idle' }));
      }, 2000);
    } catch (err) {
      setSavingStatus(prev => ({ ...prev, [pack]: 'idle' }));
    }
  };

  const confirmDeleteAffiliate = async () => {
    if (!affDeleteTarget) return;
    setIsDeletingAff(true);
    try {
      await axios.delete(`/api/admin/affiliates/${affDeleteTarget.id}`, { headers: { 'x-user-email': userEmail } });
      setAffDeleteTarget(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error deleting affiliate');
    } finally {
      setIsDeletingAff(false);
    }
  };

  const confirmPayAll = async () => {
    setIsPayingAll(true);
    try {
      await axios.post('/api/admin/batch-payout', {}, { headers: { 'x-user-email': userEmail } });
      setIsPayAllOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || tl('alert_batch_err'));
    } finally {
      setIsPayingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Zap className="w-8 h-8 text-blue-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 bg-[#050505] min-h-screen">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
            {t('affiliate.title').split(' ')[0]} <span className="text-blue-500">{t('affiliate.title').split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">
            {t('affiliate.subtitle')}
          </p>
        </div>

        {isAdmin && (
          <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1.5 shadow-2xl">
            <button 
              onClick={() => setActiveMode('user')}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeMode === 'user' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('affiliate.console')}
            </button>
            <button 
              onClick={() => setActiveMode('admin')}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeMode === 'admin' ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Settings className="w-4 h-4" />
              {t('affiliate.adminView')}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeMode === 'user' ? (
          <motion.div 
            key="user"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* User Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard 
                label={t('affiliate.balance')} 
                value={`${profile?.current_balance.toFixed(2)}€`} 
                icon={CreditCard} 
                sub={profile && profile.current_balance >= 50 ? "Prêt pour retrait" : "Min. 50€ pour retrait"}
                color="blue"
              />
              <StatCard 
                label={t('affiliate.totalRevenue')} 
                value={`${profile?.total_revenue.toFixed(2)}€`} 
                icon={DollarSign} 
                sub="Depuis la création"
                color="emerald"
              />
              <StatCard 
                label={t('affiliate.referrals')} 
                value={referrals.length.toString()} 
                icon={Users} 
                sub="Inscriptions validées"
                color="purple"
              />
              <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t('affiliate.referralLink')}</h4>
                <div className="bg-black/40 border border-slate-800/50 rounded-xl p-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-blue-400 truncate">
                    {window.location.origin}/invite?ref={profile?.referral_code}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/invite?ref=${profile?.referral_code}`);
                      alert(t('common.success'));
                    }}
                    className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* INTRO INTERACTIVE : Simulateur de Gains d'Affilié & Kit de Matériel Promotionnel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
              {/* Calculatrice Interactive de Commissions */}
              <div className="lg:col-span-6 bg-gradient-to-br from-slate-900/40 via-slate-900/60 to-indigo-950/25 border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{tl('estimez_gains')}</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{tl('simulateur_desc')}</p>
                    </div>
                  </div>
                  
                  {/* Currency Selector */}
                  <div className="inline-flex bg-black/60 border border-slate-800 rounded-xl p-1 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCurrency('EUR')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        selectedCurrency === 'EUR' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      EUR (€)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCurrency('USD')}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        selectedCurrency === 'USD' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Select Pack */}
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">{tl('choisissez_plan')}</span>
                    <div className="grid grid-cols-3 gap-3">
                      {(['starter', 'pro', 'elite'] as const).map((pk) => {
                        const basePrice = getPlanPrice(pk);
                        const displayPriceText = selectedCurrency === 'EUR' 
                          ? `${basePrice}€` 
                          : `$${Math.round(basePrice * 1.08)}`;
                        const label = pk === 'starter' ? 'Starter' : pk === 'pro' ? 'Pro' : 'Elite';
                        return (
                          <button
                            key={pk}
                            type="button"
                            onClick={() => setSimPack(pk)}
                            className={cn(
                              "p-4 rounded-2xl border text-center transition-all cursor-pointer",
                              simPack === pk 
                                ? "bg-indigo-600/15 border-indigo-505/50 text-white shadow-lg shadow-indigo-500/5" 
                                : "bg-black/25 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                            )}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider block mb-1">{label}</span>
                            <span className="text-xs font-mono font-black">{displayPriceText}/{currentLang === 'en' ? 'month' : 'mois'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Range Slider for Sim Count */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tl('nombre_abonnes')}</span>
                      <span className="text-sm font-mono font-black text-indigo-400">{simCount} {simCount > 1 ? tl('clients') : tl('client_singular')}</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="150"
                      value={simCount}
                      onChange={(e) => setSimCount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-600 mt-1">
                      <span>1 {tl('copy')}</span>
                      <span>50 {tl('clients')}</span>
                      <span>100 {tl('clients')}</span>
                      <span>150 {tl('clients')}</span>
                    </div>
                  </div>

                  {/* Rate of Commission */}
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{tl('taux_comm')}</span>
                    <div className="flex items-center gap-4 bg-black/30 border border-slate-800 rounded-2xl px-4 py-3">
                      <input 
                        type="number" 
                        min="10"
                        max="50"
                        value={simComm}
                        onChange={(e) => setSimComm(Math.min(50, Math.max(10, parseInt(e.target.value) || 20)))}
                        className="bg-transparent border-none text-white font-mono font-black text-sm w-16 focus:outline-none"
                      />
                      <div className="text-xs font-black text-slate-500">{tl('taux_desc')}</div>
                    </div>
                  </div>

                  {/* Calculations and Lift */}
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-indigo-500/20 blur-xl rounded-full" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{tl('passif_mensuel')}</span>
                        <span className="text-2xl font-mono font-black text-white">
                          {getCalculatedPrice(getPlanPrice(simPack) * simCount * (simComm / 100))}
                          <span className="text-[9px] font-black text-indigo-400 block mt-1">{tl('mrr_net')}</span>
                        </span>
                      </div>
                      <div className="border-l border-slate-800/80 pl-4">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{tl('rente_annuelle')}</span>
                        <span className="text-2xl font-mono font-black text-emerald-400">
                          {getCalculatedPrice(getPlanPrice(simPack) * simCount * (simComm / 100) * 12)}
                          <span className="text-[9px] font-black text-emerald-500 block mt-1">{tl('an_generes')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Milestones dynamic badge */}
                    <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Crown className="w-3.5 h-3.5 fill-indigo-400" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-300">
                        {tl('objectif')} <span className="text-indigo-400">
                          {getMilestoneLabel(simCount, currentLang)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kit Marketing de Haute Conversion */}
              <div className="lg:col-span-6 bg-gradient-to-br from-slate-900/40 via-slate-900/60 to-purple-950/25 border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" />
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{tl('kit_titre')}</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{tl('kit_desc')}</p>
                    </div>
                  </div>

                  {/* Tabs Selector */}
                  <div className="flex bg-black/40 border border-slate-800/80 rounded-xl p-1 mb-6">
                    <button
                      type="button"
                      onClick={() => setPromoTab('email')}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                        promoTab === 'email' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {tl('kit_email')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoTab('social')}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                        promoTab === 'social' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {tl('kit_social')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoTab('playbook')}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                        promoTab === 'playbook' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {tl('kit_playbook')}
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="bg-black/40 border border-slate-800/80 rounded-2xl p-4 min-h-[160px] max-h-[220px] overflow-y-auto custom-scrollbar font-mono text-[9.5px] leading-relaxed relative pr-2 select-text text-slate-300">
                    {promoTab === 'email' && (
                      <div className="whitespace-pre-line">
                        <strong>Sujet : {tl('sujet_email')}</strong>
                        {"\n\n"}{tl('corps_email')}{window.location.origin}/invite?ref={profile?.referral_code || 'votre_code'}
                        {tl('corps_email_fin')}
                      </div>
                    )}

                    {promoTab === 'social' && (
                      <div className="whitespace-pre-line">
                        {tl('social_text')}{window.location.origin}/invite?ref={profile?.referral_code || 'votre-code'}
                      </div>
                    )}

                    {promoTab === 'playbook' && (
                      <ul className="space-y-4 list-none pl-0">
                        <li className="flex gap-2.5">
                          <span className="text-purple-400 font-bold">●</span>
                          <div>
                            <strong className="text-white block uppercase text-[8.5px] tracking-wider">{tl('playbook_1_title')}</strong>
                            {tl('playbook_1_desc')}
                          </div>
                        </li>
                        <li className="flex gap-2.5">
                          <span className="text-purple-400 font-bold">●</span>
                          <div>
                            <strong className="text-white block uppercase text-[8.5px] tracking-wider">{tl('playbook_2_title')}</strong>
                            {tl('playbook_2_desc')}
                          </div>
                        </li>
                        <li className="flex gap-2.5">
                          <span className="text-purple-400 font-bold">●</span>
                          <div>
                            <strong className="text-white block uppercase text-[8.5px] tracking-wider">{tl('playbook_3_title')}</strong>
                            {tl('playbook_3_desc')}
                          </div>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>

                {/* Copy CTA */}
                <button
                  type="button"
                  onClick={() => {
                    let text = "";
                    if (promoTab === 'email') {
		      text = `Sujet : ${tl('sujet_email')}\n\n${tl('corps_email')}${window.location.origin}/invite?ref=${profile?.referral_code || 'votre_code'}${tl('corps_email_fin')}`;
                    } else if (promoTab === 'social') {
		      text = `${tl('social_text')}${window.location.origin}/invite?ref=${profile?.referral_code || 'votre_code'}`;
                    } else {
		      text = tl('arguments_majeurs');
                    }
                    navigator.clipboard.writeText(text);
                    setCopiedType(promoTab);
                    setTimeout(() => setCopiedType(null), 2000);
                  }}
                  className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-500 transition-colors text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  {copiedType === promoTab ? tl('copie_btn') : tl('copier_btn')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Referrals Table */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> {tl('historique_ventes')}
                  </h3>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder={tl('filtrer_ventes')}
                      value={salesSearch || ''}
                      onChange={(e) => setSalesSearch(e.target.value)}
                      className="bg-black/40 border border-slate-800 rounded-lg pl-8 pr-4 py-2 text-[8px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500 transition-all w-full md:w-64"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-950 z-10">
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_client')}</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_pack')}</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_montant')}</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_com')}</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_date')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {referrals
                        .filter(r => 
                          r.customer_email.toLowerCase().includes(salesSearch.toLowerCase()) || 
                          r.product_pack.toLowerCase().includes(salesSearch.toLowerCase())
                        )
                        .map((r, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4 text-[10px] font-bold text-slate-400">{r.customer_email}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-[8px] font-black uppercase">
                              {r.product_pack}
                            </span>
                          </td>
                          <td className="py-4 text-[10px] font-black text-white">{r.sale_amount}€</td>
                          <td className="py-4 text-[10px] font-black text-emerald-400">+{r.commission_amount}€</td>
                          <td className="py-4 text-[9px] font-bold text-slate-600">{new Date(r.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payout Requests */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col h-full">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                  <Send className="w-4 h-4" /> {tl('retrait_titre')}
                </h3>
                
                <div className="flex-1 space-y-6">
                  <div className="bg-black/20 border border-slate-800 rounded-2xl p-6 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{tl('dispo_retrait')}</p>
                    <p className="text-4xl font-black text-white leading-none">
                      {profile?.current_balance.toFixed(2)}<span className="text-blue-500 text-xl ml-1">€</span>
                    </p>
                    <button 
                      onClick={handleRequestPayout}
                      disabled={!profile || profile.current_balance < 50 || isRequesting}
                      className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-30 disabled:translate-y-0 flex items-center justify-center gap-2"
                    >
                      {isRequesting ? (
                        <Zap className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isRequesting ? tl('traitement') : tl('demander_paiement')}
                    </button>
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-4">{tl('paypal_delai')}</p>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-2 sticky top-0 bg-slate-950 py-2">{tl('dernieres_demandes')}</h4>
                    {payouts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            p.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                          )}>
                            {p.status === 'paid' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white uppercase">{p.amount}€</p>
                            <p className="text-[8px] font-bold text-slate-600 uppercase">{new Date(p.requested_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest",
                          p.status === 'paid' ? "text-emerald-500" : "text-orange-500"
                        )}>
                          {p.status === 'paid' ? tl('paye_status') : tl('attente_status')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Admin Commission Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> {tl('registration_title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {commissionSettings.map((comm) => (
                    <div key={comm.pack_name} className="bg-black/20 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pack {comm.pack_name}</p>
                        <AnimatePresence>
                          {savingStatus[comm.pack_name] === 'saving' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-blue-500 animate-pulse" />
                              <span className="text-[8px] font-black text-blue-500 uppercase">Sync...</span>
                            </motion.div>
                          )}
                          {savingStatus[comm.pack_name] === 'saved' && (
                            <motion.div initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span className="text-[8px] font-black text-emerald-500 uppercase">{currentLang === 'en' ? 'Saved' : 'Sauvegardé'}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          value={comm.percentage || 0}
                          onChange={(e) => handleUpdateCommission(comm.pack_name, parseInt(e.target.value))}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xl font-black text-white w-24 focus:outline-none focus:border-blue-500"
                        />
                        <div className="text-2xl font-black text-slate-600">%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] p-8">
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> {currentLang === 'en' ? 'PayPal API Configuration' : 'Configuration PayPal API'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">1</div>
                    <p className="text-[10px] font-bold text-slate-400">
                      {currentLang === 'en' 
                        ? "Generate your API Credentials (Client ID & Secret) on the " 
                        : "Générez vos API Credentials (Client ID & Secret) sur le portail "}
                      <a href="https://developer.paypal.com/dashboard/applications" target="_blank" className="text-blue-500 underline">Developer PayPal</a>.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">2</div>
                    <p className="text-[10px] font-bold text-slate-400">
                      {currentLang === 'en'
                        ? "Configure these variables in your Nexus control panel (Settings button > Secrets)."
                        : "Configurez ces variables dans votre panneau de contrôle Nexus (bouton Paramètres > Secrets)."}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[9px] text-slate-500">
                    PAYPAL_CLIENT_ID<br/>
                    PAYPAL_CLIENT_SECRET<br/>
                    PAYPAL_MODE (sandbox ou live)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden mb-8">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> {tl('demande_payout_titre')}
                  </h3>
                  {payoutRequests.length > 0 && (
                     <p className="text-[9px] font-black text-blue-500 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        {payoutRequests.length} {currentLang === 'en' ? 'PENDING REQUEST(S)' : 'DEMANDE(S) EN ATTENTE'}
                     </p>
                  )}
               </div>

               <div className="space-y-3">
                  {payoutRequests.length === 0 ? (
                     <div className="bg-black/20 border border-dashed border-slate-800 rounded-3xl p-12 text-center opacity-40">
                        <Zap className="w-8 h-8 mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest">{tl('toutes_demandes_traitees')}</p>
                     </div>
                  ) : payoutRequests.map((req) => (
                    <div key={req.id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-950/60 border border-slate-800 rounded-3xl hover:border-slate-700 transition-all gap-6">
                       <div className="flex items-center gap-5 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/10 shrink-0">
                             <Users className="w-6 h-6 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[11px] font-black text-white uppercase truncate">{req.user_name}</p>
                             <p className="text-[9px] font-bold text-slate-500 truncate">{req.paypal_email || req.user_email}</p>
                             <p className="text-[8px] font-black text-slate-600 uppercase mt-1">{tl('rejoint')} {new Date(req.requested_at).toLocaleDateString()}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-center md:text-right">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{tl('montant_demande')}</p>
                             <p className="text-2xl font-black text-white italic tracking-tighter">{req.amount.toFixed(2)}€</p>
                          </div>
                          
                          <button 
                            onClick={() => handlePay(req.id)}
                            disabled={processingId === req.id}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3 disabled:opacity-50"
                          >
                            {processingId === req.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                            {processingId === req.id ? (currentLang === 'en' ? 'VERIFYING...' : 'VERIFICATION...') : (currentLang === 'en' ? 'PAY NOW' : 'PAYER MAINTENANT')}
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Affiliates Master Table */}
              <div className="lg:col-span-12 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Table className="w-4 h-4" /> {tl('registre_aff')}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
                      <input 
                        type="text"
                        placeholder={tl('search_aff')}
                        value={affiliateSearch || ''}
                        onChange={(e) => setAffiliateSearch(e.target.value)}
                        className="bg-black/40 border border-slate-800 rounded-lg pl-8 pr-4 py-2 text-[8px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500 transition-all md:w-48"
                      />
                    </div>
                    <button 
                      onClick={handleSyncUsers}
                      disabled={isSyncing}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Users className={cn("w-3 h-3", isSyncing && "animate-spin")} />
                      {isSyncing ? tl('sync_ing') : tl('sync_btn')}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[600px] shadow-inner custom-scrollbar pr-2">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-950 z-10 shadow-md">
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_aff')}</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_act')}</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_rev')}</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Pending</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{tl('th_prof')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {allAffiliates
                        .filter(aff => 
                          aff.user_email.toLowerCase().includes(affiliateSearch.toLowerCase()) || 
                          aff.user_name.toLowerCase().includes(affiliateSearch.toLowerCase())
                        )
                        .map((aff) => (
                        <tr key={aff.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <p className="text-[10px] font-black text-white uppercase">{aff.user_name}</p>
                            <p className="text-[8px] font-bold text-slate-500 truncate max-w-[120px]">{aff.user_email}</p>
                          </td>
                          <td className="py-4 pr-8">
                            <Sparkline data={aff.sparkline?.map(s => s.total) || []} color="#7c3aed" />
                          </td>
                          <td className="py-4 text-[10px] font-black text-white">{aff.total_revenue.toFixed(2)}€</td>
                          <td className="py-4 text-[10px] font-black text-orange-400">{aff.pending_payouts?.toFixed(2) || '0.00'}€</td>
                          <td className="py-4">
                             <div className="flex items-center justify-between gap-3 pr-2">
                               {aff.pending_payouts && aff.pending_payouts > 0 ? (
                                 <button 
                                   onClick={async () => {
                                     const req = payoutRequests.find(r => r.affiliate_id === aff.id);
                                     if (req) {
                                       handlePay(req.id);
                                     } else {
                                       alert(tl('alert_payout_sec'));
                                     }
                                   }}
                                   className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase hover:bg-emerald-500 transition-all flex items-center gap-1 shadow-lg shadow-emerald-950/20 animate-fade-in"
                                 >
                                   <CreditCard className="w-3 h-3" /> {currentLang === 'en' ? 'PAY' : 'PAYER'}
                                 </button>
                               ) : (
                                 <div className="flex gap-1 items-center">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{tl('actif_status')}</span>
                                 </div>
                               )}

                               <button
                                 onClick={() => setAffDeleteTarget(aff)}
                                 className="p-1.5 rounded-lg bg-red-950/40 text-red-500 hover:bg-red-800 hover:text-white transition-all border border-red-900/30 shrink-0"
                                 title={currentLang === 'en' ? 'Delete affiliate' : "Supprimer l'affilié"}
                               >
                                 <Trash2 className="w-3 h-3" />
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Payout Requests Admin */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> {tl('demandes_paiement')}
                  </h3>
                  {payoutRequests.length > 1 && (
                    <button 
                      onClick={() => setIsPayAllOpen(true)}
                      disabled={isPayingAll}
                      className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-lg text-[8px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      {isPayingAll ? <Zap className="w-3 h-3 animate-spin" /> : null}
                      {isPayingAll ? 'SYNC...' : tl('toutes_payer')}
                    </button>
                  )}
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                  {payoutRequests.length === 0 ? (
                    <div className="text-center p-12 bg-black/20 border border-dashed border-slate-800 rounded-2xl">
                      <Zap className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                      <p className="text-[9px] font-black text-slate-600 uppercase">{tl('aucune_demande')}</p>
                    </div>
                  ) : payoutRequests.map((req) => (
                    <div key={req.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-white uppercase">{req.user_name}</p>
                          <p className="text-[8px] font-bold text-slate-500">{req.paypal_email || req.user_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-blue-500 leading-none">{req.amount}€</p>
                          <p className="text-[8px] font-bold text-slate-600 mt-1 uppercase">{new Date(req.requested_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handlePay(req.id)}
                        disabled={processingId === req.id || isPayingAll}
                        className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {processingId === req.id ? (
                          <Zap className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        {processingId === req.id ? (currentLang === 'en' ? 'Payment in progress...' : 'Paiement en cours...') : tl('payer_paypal')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Affiliate Custom Confirmation Modal */}
      <AnimatePresence>
        {affDeleteTarget && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-red-500/30 rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-2xl space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30 mx-auto mb-4 text-red-500">
                  <Trash2 className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-red-500 italic uppercase tracking-tighter">
                  {currentLang === 'en' ? 'DELETE AFFILIATE' : "SUPPRIMER L'AFFILIÉ"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {currentLang === 'en' ? 'Affiliate:' : 'Affilié :'} <span className="text-red-400 font-black">{affDeleteTarget.user_email}</span>
                </p>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl text-[11px] text-slate-300 leading-relaxed font-semibold">
                ⚠️ <span className="text-red-500 uppercase font-black">{currentLang === 'en' ? 'Critical Alert:' : 'Alerte Critique :'}</span> {tl('delete_confirm')}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-900">
                <button 
                  onClick={() => setAffDeleteTarget(null)}
                  className="flex-1 py-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
                  disabled={isDeletingAff}
                >
                  {currentLang === 'en' ? 'Cancel' : 'Annuler'}
                </button>
                <button 
                  onClick={confirmDeleteAffiliate}
                  disabled={isDeletingAff}
                  className="flex-1 py-3 bg-red-600 hover:bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-950/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeletingAff ? <RefreshCw className="w-4 h-4 animate-spin" /> : (currentLang === 'en' ? 'CONFIRM' : "CONFIRMER")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay All Custom Confirmation Modal */}
      <AnimatePresence>
        {isPayAllOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-blue-500/30 rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-2xl space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 mx-auto mb-4 text-blue-500">
                  <CreditCard className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-blue-400 italic uppercase tracking-tighter">
                  {currentLang === 'en' ? 'PAY ALL REQUESTS' : 'PAYER TOUTES LES DEMANDES'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {payoutRequests.length} {currentLang === 'en' ? 'pending payment requests' : 'demandes de paiement en attente'}
                </p>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl text-[11px] text-slate-300 leading-relaxed font-semibold">
                💸 <span className="text-blue-400 uppercase font-black">{currentLang === 'en' ? 'Attention:' : 'Attention :'}</span> {currentLang === 'en' ? 'Are you sure you want to process and pay all pending payout requests in bulk via PayPal?' : 'Êtes-vous sûr de vouloir traiter et payer toutes les demandes en attente de façon groupée via PayPal ?'}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-900">
                <button 
                  onClick={() => setIsPayAllOpen(false)}
                  className="flex-1 py-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
                  disabled={isPayingAll}
                >
                  {currentLang === 'en' ? 'Cancel' : 'Annuler'}
                </button>
                <button 
                  onClick={confirmPayAll}
                  disabled={isPayingAll}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-950/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPayingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : (currentLang === 'en' ? 'PAY NOW' : "PAYER MAINTENANT")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, sub, color }: any) {
  const colors = {
    blue: "text-blue-500 shadow-blue-900/20 bg-blue-600/5 border-blue-500/10",
    emerald: "text-emerald-500 shadow-emerald-900/20 bg-emerald-600/5 border-emerald-500/10",
    purple: "text-purple-500 shadow-purple-900/20 bg-purple-600/5 border-purple-500/10",
  }[color as 'blue' | 'emerald' | 'purple'];

  return (
    <div className={cn("bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group", colors)}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
          <Icon className="w-4 h-4 opacity-40" />
        </div>
        <p className="text-3xl font-black text-white italic tracking-tighter mb-1">{value}</p>
        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{sub}</p>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
        <Icon size={80} />
      </div>
    </div>
  );
}
