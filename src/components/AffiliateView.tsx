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
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import Sparkline from './Sparkline';

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

export default function AffiliateView({ userEmail }: { userEmail: string }) {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(userEmail === 'ziedbenmiled3@gmail.com');
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

  useEffect(() => {
    fetchData();
  }, [activeMode]);

  const handleSyncUsers = async () => {
    const { firebaseService } = await import('../services/firebaseService');
    setIsSyncing(true);
    try {
      const users = await firebaseService.getAllUsers();
      if (users && users.length > 0) {
        const res = await axios.post('/api/admin/sync-affiliates', { users }, { headers: { 'x-user-email': userEmail } });
        alert(`${res.data.created} nouveaux profils affiliés créés.`);
        await fetchData();
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeMode === 'user') {
        const res = await axios.get('/api/affiliate/stats', { headers: { 'x-user-email': userEmail } });
        setProfile(res.data.affiliate);
        setReferrals(res.data.referrals);
        setPayouts(res.data.payouts);
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
      alert('Erreur lors de la demande de paiement');
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
      alert('Erreur lors du paiement');
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Referrals Table */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Historique des Ventes
                  </h3>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="FILTRER LES VENTES..."
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
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Client</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Pack</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Montant</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Com.</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Date</th>
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
                  <Send className="w-4 h-4" /> Retrait (Min 50€)
                </h3>
                
                <div className="flex-1 space-y-6">
                  <div className="bg-black/20 border border-slate-800 rounded-2xl p-6 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Disponible pour retrait</p>
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
                      {isRequesting ? 'TRAITEMENT...' : 'Demander le Paiement'}
                    </button>
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-4">Paiement via PayPal sous 24/48h</p>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-2 sticky top-0 bg-slate-950 py-2">Dernières Demandes</h4>
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
                          {p.status === 'paid' ? 'Payé' : 'En attente'}
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
                  <Settings className="w-4 h-4" /> Configuration des Commissions
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
                              <span className="text-[8px] font-black text-emerald-500 uppercase">Sauvegardé</span>
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
                  <ExternalLink className="w-4 h-4" /> Configuration PayPal API
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">1</div>
                    <p className="text-[10px] font-bold text-slate-400">Générez vos API Credentials (Client ID & Secret) sur le portail <a href="https://developer.paypal.com/dashboard/applications" target="_blank" className="text-blue-500 underline">Developer PayPal</a>.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">2</div>
                    <p className="text-[10px] font-bold text-slate-400">Configurez ces variables dans votre panneau de contrôle Nexus (bouton Paramètres &gt; Secrets).</p>
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
                    <CreditCard className="w-4 h-4" /> Demandes de Paiement Actives
                  </h3>
                  {payoutRequests.length > 0 && (
                     <p className="text-[9px] font-black text-blue-500 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        {payoutRequests.length} DEMANDE(S) EN ATTENTE
                     </p>
                  )}
               </div>

               <div className="space-y-3">
                  {payoutRequests.length === 0 ? (
                    <div className="bg-black/20 border border-dashed border-slate-800 rounded-3xl p-12 text-center opacity-40">
                       <Zap className="w-8 h-8 mx-auto mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Toutes les demandes ont été traitées</p>
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
                             <p className="text-[8px] font-black text-slate-600 uppercase mt-1">Rejoint le {new Date(req.requested_at).toLocaleDateString()}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-center md:text-right">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Montant Demandé</p>
                             <p className="text-2xl font-black text-white italic tracking-tighter">{req.amount.toFixed(2)}€</p>
                          </div>
                          
                          <button 
                            onClick={() => handlePay(req.id)}
                            disabled={processingId === req.id}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3 disabled:opacity-50"
                          >
                            {processingId === req.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                            {processingId === req.id ? 'VERIFICATION...' : 'PAYER MAINTENANT'}
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
                    <Table className="w-4 h-4" /> Registre des Affiliés
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
                      <input 
                        type="text"
                        placeholder="RECHERCHER AFFILIÉ..."
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
                      {isSyncing ? "Sync en cours..." : "Sync Clients Nexus"}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[600px] shadow-inner custom-scrollbar pr-2">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-950 z-10 shadow-md">
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Affilié</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Activité (7j)</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Revenu Gen.</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Pending</th>
                        <th className="text-left py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Profil</th>
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
                             <div className="flex items-center gap-3">
                               {aff.pending_payouts && aff.pending_payouts > 0 ? (
                                 <button 
                                   onClick={async () => {
                                     const req = payoutRequests.find(r => r.affiliate_id === aff.id);
                                     if (req) {
                                       handlePay(req.id);
                                     } else {
                                       alert('Veuillez utiliser la section "Demandes Actives" pour ce paiement spécifique.');
                                     }
                                   }}
                                   className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase hover:bg-emerald-500 transition-all flex items-center gap-1 shadow-lg shadow-emerald-950/20"
                                 >
                                   <CreditCard className="w-3 h-3" /> PAYER
                                 </button>
                               ) : (
                                 <div className="flex gap-1 items-center">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">ACTIF</span>
                                 </div>
                               )}
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
                    <CreditCard className="w-4 h-4" /> Demandes de Paiement
                  </h3>
                  {payoutRequests.length > 1 && (
                    <button 
                      onClick={async () => {
                        if (!confirm('Payer toutes les demandes en attente via PayPal ?')) return;
                        setIsPayingAll(true);
                        try {
                          await axios.post('/api/admin/batch-payout', {}, { headers: { 'x-user-email': userEmail } });
                          await fetchData();
                        } catch (err: any) {
                          alert(err.response?.data?.error || 'Erreur lors du paiement groupé');
                        } finally {
                          setIsPayingAll(false);
                        }
                      }}
                      disabled={isPayingAll}
                      className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-lg text-[8px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      {isPayingAll ? <Zap className="w-3 h-3 animate-spin" /> : null}
                      {isPayingAll ? 'SYNC...' : 'Tout Payer'}
                    </button>
                  )}
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                  {payoutRequests.length === 0 ? (
                    <div className="text-center p-12 bg-black/20 border border-dashed border-slate-800 rounded-2xl">
                      <Zap className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                      <p className="text-[9px] font-black text-slate-600 uppercase">Aucune demande en attente</p>
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
                        {processingId === req.id ? 'Paiement en cours...' : 'Payer via PayPal'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
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
