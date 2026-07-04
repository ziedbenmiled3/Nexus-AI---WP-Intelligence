import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Loader2, 
  AlertCircle, 
  Send, 
  RefreshCw, 
  Activity, 
  MapPin, 
  Wifi, 
  Sparkles, 
  CheckCircle2, 
  Laptop, 
  Smartphone,
  ChevronDown,
  Info,
  DollarSign,
  Gift,
  Bell,
  Lock,
  SearchCode,
  AlertTriangle,
  Mail,
  Coins,
  Trash2,
  Edit2
} from 'lucide-react';
import { useAuth } from '../providers/FirebaseProvider';
import { firebaseService } from '../services/firebaseService';
import { cn } from '../lib/utils';

interface LiveSaaSSession {
  id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  device: 'mobile' | 'desktop' | 'tablet';
  activePage: string;
  durationSeconds: number;
  lastActiveLabel: string;
  action: 'generating_article' | 'auditing_seo' | 'optimizing_links' | 'managing_stock' | 'idle';
  pointsGratified?: boolean;
}

export default function NexusCrmView() {
  const { user } = useAuth();
  const userEmail = user?.email || '';
  const isAdmin = userEmail.toLowerCase() === 'contact@nexuswp.pro';

  // State
  const [crmTab, setCrmTab] = useState<'users' | 'billing' | 'live'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Gifting Modal State
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [selectedUserForGift, setSelectedUserForGift] = useState<any | null>(null);
  const [giftPlanId, setGiftPlanId] = useState('');
  const [giftDurationDays, setGiftDurationDays] = useState(30);
  const [isGiftingLoading, setIsGiftingLoading] = useState(false);

  // Notification Modal State
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [selectedUserForNotify, setSelectedUserForNotify] = useState<any | null>(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyContent, setNotifyContent] = useState('');
  const [isNotifyingLoading, setIsNotifyingLoading] = useState(false);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Delete user states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // User Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editPrenom, setEditPrenom] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    try {
      setIsSavingUser(true);
      await firebaseService.updateUserProfile(selectedUserForEdit.uid, {
        nom: editNom.trim(),
        prenom: editPrenom.trim(),
        birth_date: editBirthDate,
        phone: editPhone.trim(),
        address: editAddress.trim(),
        raw_password: editPassword,
        display_name: `${editPrenom} ${editNom}`.trim()
      });
      showToast('Profil client mis à jour avec succès.', 'success');
      setIsEditOpen(false);
      setSelectedUserForEdit(null);
      await loadNexusData();
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      alert('Erreur lors de la mise à jour du profil : ' + err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  // Live Connections Simulation
  const [liveSessions, setLiveSessions] = useState<LiveSaaSSession[]>([]);
  const [realSess, setRealSess] = useState<LiveSaaSSession[]>([]);
  const [trafficMode, setTrafficMode] = useState<'hybrid' | 'live' | 'demo' | 'history'>('live');
  const [liveLog, setLiveLog] = useState<{ id: string; text: string; time: string; type: 'success' | 'warn' | 'info' }[]>([]);
  const [connectionHistory, setConnectionHistory] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const fetchConnectionHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/saas-telemetry/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.logs) {
          setConnectionHistory(data.logs);
        }
      }
    } catch (err) {
      console.warn("Erreur lors de la récupération de l'historique de connexions:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const clearConnectionHistory = async () => {
    if (!showWipeConfirm) {
      setShowWipeConfirm(true);
      setTimeout(() => setShowWipeConfirm(false), 4005);
      return;
    }
    try {
      const res = await fetch('/api/saas-telemetry/history/clear', { method: 'POST' });
      if (res.ok) {
        showToast("L'historique complet a été supprimé !", "success");
        setConnectionHistory([]);
        setShowWipeConfirm(false);
      } else {
        showToast("Impossible d'effacer l'historique.", "info");
      }
    } catch (err) {
      console.warn("Error clearing connection history:", err);
    }
  };

  // Toast helper
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Log pusher helper
  const pushLog = (text: string, type: 'success' | 'warn' | 'info' = 'info') => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLiveLog(prev => [
      { id: Math.random().toString(36), text, time, type },
      ...prev.slice(0, 19) // keep last 20
    ]);
  };

  // Poll real-time SaaS platform telemetry from backend
  const prevRealSessRef = useRef<LiveSaaSSession[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    let lastRealCount = 0;
    
    const fetchSaaSTelemetry = async () => {
      try {
        const res = await fetch('/api/saas-telemetry');
        if (res.ok) {
          const data = (await res.json()) as any[];
          const mappedData: LiveSaaSSession[] = data.map((item) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            city: item.city,
            country: item.country,
            device: item.device,
            activePage: item.activePage,
            durationSeconds: item.durationSeconds,
            lastActiveLabel: item.lastActiveLabel,
            action: item.action,
            pointsGratified: !!item.pointsGratified,
          }));

          setRealSess(mappedData);

          if (mappedData.length > 0 && lastRealCount === 0) {
            pushLog(
              `📡 [TELEMETRY REAL] Connexion établie ! Capté ${mappedData.length} utilisateur(s) actif(s) sur la console SaaS Nexus.`,
              'success'
            );
            showToast('Nouveaux utilisateurs réels détectés par la télémétrie Nexus !', 'info');
          }

          // Push active navigation logs in real-time for real users!
          mappedData.forEach(newSess => {
            const oldSess = prevRealSessRef.current.find(s => s.email.toLowerCase() === newSess.email.toLowerCase());
            if (!oldSess || oldSess.activePage !== newSess.activePage) {
              let logText = "";
              if (newSess.action === 'generating_article') {
                logText = `✍️ [REEL] ${newSess.name} rédige un article de blog de 3000 mots optimisé via IA`;
              } else if (newSess.action === 'auditing_seo') {
                logText = `🔍 [REEL] ${newSess.name} lance un audit technique SEO complet`;
              } else if (newSess.action === 'optimizing_links') {
                logText = `🔗 [REEL] ${newSess.name} peaufine son maillage interne de liens`;
              } else if (newSess.action === 'managing_stock') {
                logText = `📦 [REEL] ${newSess.name} vérifie ses prévisions et alertes de stock`;
              } else {
                logText = `💻 [REEL] ${newSess.name} navigue sur : ${newSess.activePage || 'Accueil de la console'}`;
              }
              pushLog(logText, "success");
            }
          });
          prevRealSessRef.current = mappedData;

          lastRealCount = mappedData.length;
        }
      } catch (err) {
        console.warn('Error polling SaaS telemetry:', err);
      }
    };

    fetchSaaSTelemetry();
    const interval = setInterval(fetchSaaSTelemetry, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Fetch Nexus Platform Database
  const loadNexusData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, paymentsData, plansData] = await Promise.all([
        firebaseService.getAllUsers(),
        firebaseService.getAllPayments(),
        firebaseService.getPlans()
      ]);
      setUsers(usersData || []);
      setPayments(paymentsData || []);
      setPlans(plansData || []);
      initializeLiveSessions(usersData || []);
      if (liveLog.length === 0) {
        pushLog("Console de Télémétrie Core Nexus initialisée", "success");
        pushLog(`Synchronisation Firestore : ${usersData?.length || 0} fiches clients synchronisées`, "info");
      }
    } catch (err: any) {
      console.error('[Nexus CRM] Failed to load SaaS database:', err);
      setError('Impossible d’ouvrir le registre de données SaaS de Nexus.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNexusData();
    fetchConnectionHistory();
  }, [userEmail, isAdmin]);

  // Seed live connected sessions
  const initializeLiveSessions = (currentUsers: any[]) => {
    const locations = [
      { city: 'Paris', country: 'France' },
      { city: 'Bruxelles', country: 'Belgique' },
      { city: 'Genève', country: 'Suisse' },
      { city: 'Montréal', country: 'Canada' },
      { city: 'Lyon', country: 'France' },
      { city: 'Tunis', country: 'Tunisie' },
      { city: 'Casablanca', country: 'Maroc' }
    ];

    const nexusPages = [
      { page: 'Audit Technique SEO en cours...', action: 'auditing_seo' },
      { page: 'Rédaction d’article AI de 3000 mots...', action: 'generating_article' },
      { page: 'Configuration AutoPilot Maillage Interne...', action: 'optimizing_links' },
      { page: 'Analyse Prévisionnelle des Stocks...', action: 'managing_stock' },
      { page: 'Consultation du Dashboard Général', action: 'idle' }
    ];

    // Build session entries EXCLUSIVELY based on real registered Firestore users
    const seed: LiveSaaSSession[] = currentUsers.map((u, idx) => {
      const name = u.name || u.displayName || u.display_name || u.email?.split('@')[0] || `Client Nexus #${idx + 1}`;
      const email = u.email || '';
      const loc = locations[idx % locations.length];
      const pg = nexusPages[idx % nexusPages.length];

      return {
        id: u.uid || `sess_real_${idx}`,
        name,
        email,
        city: u.city || loc.city,
        country: u.country || loc.country,
        device: idx % 3 === 0 ? 'desktop' : (idx % 3 === 1 ? 'mobile' : 'tablet'),
        activePage: pg.page,
        durationSeconds: Math.floor(120 + idx * 80),
        lastActiveLabel: 'Actif en direct',
        action: pg.action as any
      };
    });

    setLiveSessions(seed);
  };

  // Simulated live connection actions (changes operations periodically)
  useEffect(() => {
    if (!isAdmin || liveSessions.length === 0) return;

    const interval = setInterval(() => {
      setLiveSessions((prev) => 
        prev.map((sess) => {
          if (Math.random() > 0.8) {
            const nexusPages = [
              { page: 'Rédaction d’article AI de 3000 mots...', action: 'generating_article' },
              { page: 'Audit Technique SEO en cours...', action: 'auditing_seo' },
              { page: 'Configuration AutoPilot Maillage Interne...', action: 'optimizing_links' },
              { page: 'Analyse Prévisionnelle des Stocks...', action: 'managing_stock' },
              { page: 'Consultation du Dashboard Général', action: 'idle' }
            ];
            const nextOption = nexusPages[Math.floor(Math.random() * nexusPages.length)];
            
            // Push active telemetry logs in real-time
            let logText = "";
            if (nextOption.action === 'generating_article') {
              logText = `✍️ ${sess.name} rédige un article de blog de 3000 mots optimisé via IA`;
            } else if (nextOption.action === 'auditing_seo') {
              logText = `🔍 ${sess.name} lance un audit technique SEO complet`;
            } else if (nextOption.action === 'optimizing_links') {
              logText = `🔗 ${sess.name} peaufine son maillage interne de liens`;
            } else if (nextOption.action === 'managing_stock') {
              logText = `📦 ${sess.name} vérifie ses prévisions et alertes de stock`;
            } else {
              logText = `💻 ${sess.name} est de retour sur l'accueil de la console`;
            }
            
            // Only push to live logs if we are displaying demo or hybrid mode (when real sessions are indeed empty)
            if (trafficMode === 'demo' || (trafficMode === 'hybrid' && realSess.length === 0)) {
              pushLog(logText, "info");
            }

            return {
              ...sess,
              activePage: nextOption.page,
              action: nextOption.action as any,
              durationSeconds: sess.durationSeconds + 15
            };
          }
          return {
            ...sess,
            durationSeconds: sess.durationSeconds + 15
          };
        })
      );
    }, 12000);

    return () => clearInterval(interval);
  }, [liveSessions, isAdmin, trafficMode, realSess.length]);

  // Dynamically select SaaS sessions based on Mode
  const displayedSess = (() => {
    if (trafficMode === 'live') {
      return realSess;
    } else if (trafficMode === 'demo') {
      return liveSessions;
    } else {
      // hybrid: show real if any, else fall back to simulation
      return realSess.length > 0 ? realSess : liveSessions;
    }
  })();

  // Direct actions inside live dashboard
  const handleLiveBonus = async (sessionId: string, userName: string, sessionEmail: string) => {
    setLiveSessions((prev) => 
      prev.map(s => s.id === sessionId ? { ...s, pointsGratified: true } : s)
    );
    setRealSess((prev) => 
      prev.map(s => s.email.toLowerCase() === sessionEmail.toLowerCase() ? { ...s, pointsGratified: true } : s)
    );

    try {
      await fetch('/api/saas-telemetry/gratify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sessionEmail })
      });
    } catch (err) {
      console.warn("Failed to notify credit reward to server", err);
    }

    showToast(`⚡ Crédits bonus de 500 jetons offerts avec succès à ${userName} !`, 'success');
  };

  // Action: Gift Plan Package
  const triggerGiftPlan = async () => {
    if (!selectedUserForGift || !giftPlanId) return;
    setIsGiftingLoading(true);
    try {
      const daysInput = Number(giftDurationDays) || 30;
      await firebaseService.giveFreePack(selectedUserForGift.email, giftPlanId, daysInput);
      
      showToast(`🎁 Plan d'abonnement "${giftPlanId}" activé pour ${selectedUserForGift.email} (${daysInput} jours) !`);
      setIsGiftOpen(false);
      setSelectedUserForGift(null);
      setGiftPlanId('');
      
      // Reload lists
      await loadNexusData();
    } catch (err) {
      console.error('Failed to gift pack:', err);
      alert('Une erreur est survenue lors du don d’abonnement.');
    } finally {
      setIsGiftingLoading(false);
    }
  };

  // Action: Send System Notification / Offer
  const triggerSendNotification = async () => {
    if (!selectedUserForNotify || !notifyTitle.trim() || !notifyContent.trim()) return;
    setIsNotifyingLoading(true);
    try {
      await firebaseService.sendOffer(selectedUserForNotify.email, notifyTitle.trim(), notifyContent.trim());
      showToast(`📢 Alerte système ("${notifyTitle}") notifiée dans l'espace de ${selectedUserForNotify.email} !`);
      setIsNotifyOpen(false);
      setSelectedUserForNotify(null);
      setNotifyTitle('');
      setNotifyContent('');
    } catch (err) {
      console.error('Failed to send notification offer:', err);
      alert('Erreur lors de la transmission de l\'alerte.');
    } finally {
      setIsNotifyingLoading(false);
    }
  };

  // Action: Supprimer entièrement le compte client
  const handleDeleteUser = (userItem: any) => {
    const targetEmail = userItem.email || userItem.user_email;
    if (!targetEmail) return;
    const isMasterAdmin = targetEmail.toLowerCase() === 'contact@nexuswp.pro';
    if (isMasterAdmin) {
      alert("Erreur de protocole : Un compte Administrateur Principal ne peut pas être supprimé.");
      return;
    }
    setUserToDelete(userItem);
    setIsDeleteOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const targetEmail = userToDelete.email || userToDelete.user_email;
    try {
      setIsDeletingUser(true);
      await firebaseService.deleteUserAccount(userToDelete.uid || '', targetEmail);
      showToast(`Le compte client ${targetEmail} a été intégralement supprimé du Nexus.`, 'info');
      setIsDeleteOpen(false);
      setUserToDelete(null);
      await loadNexusData();
    } catch (err: any) {
      console.error('Delete user error:', err);
      alert(`Erreur lors de la suppression du compte: ${err.message}`);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Filter users based on search query & plan
  const filteredUsers = users.filter(usr => {
    const query = searchQuery.toLowerCase();
    const displayName = usr.display_name || usr.displayName || usr.name || usr.username || (usr.first_name && usr.last_name ? `${usr.first_name} ${usr.last_name}` : '') || '';
    const matchSearch = 
      displayName.toLowerCase().includes(query) || 
      (usr.email || '').toLowerCase().includes(query) || 
      (usr.uid || '').toLowerCase().includes(query);

    const matchPlan = 
      planFilter === 'all' || 
      (usr.subscription?.plan_id === planFilter);

    return matchSearch && matchPlan;
  });

  // Security Access lock screen for non-admin accounts
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 text-center">
        <div className="bg-[#0c0e14] border border-red-500/10 rounded-[3rem] p-12 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Accès Réservé - Nexus Master Owner</h2>
            <p className="text-[10px] text-red-400 font-extrabold uppercase tracking-[0.4em]">ADMINISTRATION INTERNE DU SAAS NEXUS</p>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed max-w-lg mx-auto font-medium">
            Seul le compte administrateur principal (<strong className="text-white">contact@nexuswp.pro</strong>) est authentifié 
            pour examiner le fichier des utilisateurs inscrits sur la SaaS Nexus, octroyer des privilèges VIP et interagir avec les sessions en direct.
          </p>

          <div className="pt-4 border-t border-slate-900 flex justify-center text-[10px] font-mono text-slate-500">
            <span>Nexus Auth Protocols 2.5 • Protection Niv. 5 Active</span>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-4">
      {/* Banner CRM Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-950/40 p-8 border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              Clientèle <span className="text-blue-500">Plateforme Nexus</span>
            </h2>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-1">
            Gérez les inscrits à votre SaaS, attribuez des packs VIP et lisez la comptabilité
          </p>
        </div>

        {/* Outer Tabs Switcher */}
        <div className="flex bg-[#0c0e14] border border-slate-800 rounded-2xl p-1 shadow-2xl self-start lg:self-auto">
          <button 
            onClick={() => setCrmTab('users')}
            className={cn(
              "px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer",
              crmTab === 'users' ? "bg-blue-600 text-white shadow-xl shadow-blue-950/40" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Utilisateurs SaaS ({users.length})
          </button>
          <button 
            onClick={() => setCrmTab('billing')}
            className={cn(
              "px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer",
              crmTab === 'billing' ? "bg-blue-600 text-white shadow-xl shadow-blue-950/40" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Journal Financier
          </button>
          <button 
            onClick={() => setCrmTab('live')}
            className={cn(
              "px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer",
              crmTab === 'live' ? "bg-blue-600 text-white shadow-xl shadow-blue-950/40" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            Radar Directe ({displayedSess.length})
          </button>
        </div>
      </div>

      {/* Outer feedback notification */}
      {toastMessage && (
        <div className={cn(
          "p-4 border rounded-2xl text-xs font-bold uppercase tracking-wider text-center animate-pulse shadow-lg",
          toastMessage.type === 'success' ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400" : "bg-blue-500/15 border-blue-500/20 text-blue-400"
        )}>
          {toastMessage.text}
        </div>
      )}

      {/* QUICK OVERVIEW STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Inscrits SaaS</p>
            <h3 className="text-3xl font-black text-white italic tracking-tight">{isLoading ? '...' : users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Abonnés Actifs</p>
            <h3 className="text-3xl font-black text-green-400 italic tracking-tight">
              {isLoading ? '...' : users.filter(u => u.subscription?.plan_id && u.subscription?.plan_id !== 'none' && u.subscription?.status === 'active').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
        </div>

        <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Revenus cumulés direct</p>
            <h3 className="text-3xl font-black text-amber-500 italic tracking-tight font-mono">
              {isLoading ? '...' : `${payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)} €`}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-lg">
            €
          </div>
        </div>

        <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Gabarits de Plans</p>
            <h3 className="text-3xl font-black text-purple-400 italic tracking-tight">{isLoading ? '...' : plans.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Gift className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Extraction de l'annuaire SaaS...</p>
        </div>
      ) : error ? (
        <div className="border border-red-500/25 p-8 rounded-3xl bg-red-950/20 flex items-center gap-4 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 grow-0 text-red-400 shrink-0" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {/* TAB 1: USERS LIST */}
            {crmTab === 'users' && (
              <motion.div
                key="nexus-users"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Search and filter tools */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem]">
                  <div className="relative w-full sm:w-80">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="RECHERCHER PAR NOM, EMAIL, ID..."
                      className="w-full pl-10 pr-4 py-3 bg-black border border-slate-900 rounded-xl text-xs text-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-700 font-bold uppercase"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Plan :</span>
                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="bg-black border border-slate-850 px-4 py-3 rounded-xl text-xs text-white outline-none focus:border-blue-600 appearance-none pr-8 relative font-bold min-w-[150px]"
                    >
                      <option value="all">TOUS LES PLANS</option>
                      <option value="none">AUCUN PLAN</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table containing customers */}
                <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-black/40">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight italic">
                      Registre des comptes enregistrés sur le Nexus SaaS
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {filteredUsers.length} Fiches Trouvées
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 uppercase text-[9px] font-black tracking-widest bg-black/40">
                          <th className="p-6 pl-8">Nom et Identifiants</th>
                          <th className="p-6">Statut & Activité Client</th>
                          <th className="p-6">Plan SaaS Actif</th>
                          <th className="p-6">État Subscription</th>
                          <th className="p-6">Expiration estimée</th>
                          <th className="p-6 text-right">Actions Nexus VIP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 bg-black/10">
                        {filteredUsers.map((usr, idx) => {
                          const userDisplayName = usr.display_name || usr.displayName || usr.name || usr.username || (usr.first_name && usr.last_name ? `${usr.first_name} ${usr.last_name}` : '') || 'Utilisateur sans Profil';
                          const createdDate = usr.created_at ? new Date(usr.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Compte Historique';
                          const subId = usr.subscription?.plan_id || 'none';
                          const subStatus = usr.subscription?.status || 'inactive';
                          const subExpires = usr.subscription?.expires_at ? new Date(usr.subscription.expires_at).toLocaleDateString() : 'N/A';

                          // Check if they are in live simulation or match current user
                          const isCurUser = usr.email?.toLowerCase() === userEmail.toLowerCase();
                          const matchedLiveSess = displayedSess.find(s => s.email.toLowerCase() === usr.email?.toLowerCase());

                          return (
                            <tr key={idx} className="hover:bg-slate-950/40 transition-colors group/row">
                              <td 
                                onClick={() => {
                                  setSelectedUserForEdit(usr);
                                  setEditNom(usr.nom || '');
                                  setEditPrenom(usr.prenom || '');
                                  setEditBirthDate(usr.birth_date || '');
                                  setEditPhone(usr.phone || '');
                                  setEditAddress(usr.address || '');
                                  setEditEmail(usr.email || '');
                                  setEditPassword(usr.raw_password || '');
                                  setIsEditOpen(true);
                                }}
                                className="p-6 pl-8 cursor-pointer group-hover/row:text-blue-400 transition-colors"
                                title="Cliquer pour gérer le profil client et modifier son mot de passe"
                              >
                                <div>
                                  <span className="text-xs font-black text-slate-200 block group-hover/row:text-blue-400 transition-colors flex items-center gap-1.5">
                                    {userDisplayName}
                                    <Edit2 className="w-3 h-3 text-slate-600 group-hover/row:text-blue-400 opacity-0 group-hover/row:opacity-100 transition-all" />
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono font-bold">{usr.email}</span>
                                  <span className="text-[8px] font-black text-slate-650 text-indigo-505 block mt-0.5">INSCRIT LE : {createdDate}</span>
                                </div>
                              </td>
                              <td className="p-6">
                                {isCurUser ? (
                                  <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                    </span>
                                    <div>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block">En ligne (Vous)</span>
                                      <span className="text-[8px] text-slate-500 block">Analyse du Nexus CRM ...</span>
                                    </div>
                                  </div>
                                ) : matchedLiveSess ? (
                                  <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <div>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">Actif en ligne</span>
                                      <span className="text-[8px] text-slate-400 block italic font-medium">{matchedLiveSess.activePage}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-800"></span>
                                    <div>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block">Hors ligne</span>
                                      <span className="text-[8px] text-slate-500 block">Pas de session active</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="p-6">
                                <span className={cn(
                                  "inline-block px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                                  subId === 'trial' && "bg-slate-800/20 text-slate-400 border-slate-800",
                                  subId === 'starter' && "bg-blue-600/5 text-blue-400 border-blue-500/10",
                                  subId === 'agency' && "bg-purple-600/5 text-purple-400 border-purple-500/10",
                                  subId === 'none' && "bg-red-650/5 text-red-500 border-red-500/10"
                                )}>
                                  {usr.plan_name || 'Aucun Plan'}
                                </span>
                              </td>
                              <td className="p-6">
                                <span className={cn(
                                  "inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider",
                                  subStatus === 'active' ? "text-green-400" : "text-slate-500"
                                )}>
                                  <span className={cn("w-2 h-2 rounded-full", subStatus === 'active' ? "bg-green-400" : "bg-slate-500")} />
                                  {subStatus === 'active' ? 'Activé' : 'Inactif'}
                                </span>
                              </td>
                              <td className="p-6 text-xs text-slate-500 font-bold font-mono">
                                {subExpires}
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setSelectedUserForGift(usr);
                                      setIsGiftOpen(true);
                                    }}
                                    className="p-2.5 bg-amber-500/10 hover:bg-amber-500 border border-transparent hover:border-amber-400 hover:text-black rounded-lg text-amber-500 transition-all flex items-center justify-center cursor-pointer"
                                    title="Offrir un Pack d'Abonnement"
                                  >
                                    <Gift className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUserForEdit(usr);
                                      setEditNom(usr.nom || '');
                                      setEditPrenom(usr.prenom || '');
                                      setEditBirthDate(usr.birth_date || '');
                                      setEditPhone(usr.phone || '');
                                      setEditAddress(usr.address || '');
                                      setEditEmail(usr.email || '');
                                      setEditPassword(usr.raw_password || '');
                                      setIsEditOpen(true);
                                    }}
                                    className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500 border border-transparent hover:border-indigo-400 hover:text-white rounded-lg text-indigo-400 transition-all flex items-center justify-center cursor-pointer"
                                    title="Gérer le profil / Modifier mot de passe"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUserForNotify(usr);
                                      setIsNotifyOpen(true);
                                    }}
                                    className="p-2.5 bg-blue-500/10 hover:bg-blue-500 border border-transparent hover:border-blue-400 hover:text-white rounded-lg text-blue-400 transition-all flex items-center justify-center cursor-pointer"
                                    title="Envoyer une Alerte Système"
                                  >
                                    <Bell className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(usr)}
                                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500 border border-transparent hover:border-rose-400 hover:text-white rounded-lg text-rose-500 transition-all flex items-center justify-center cursor-pointer"
                                    title="Supprimer entièrement le compte"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-24 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                              Aucun utilisateur inscrit sur Nexus ne correspond à vos filtres
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: FINANCIAL BILLING JOURNAL */}
            {crmTab === 'billing' && (
              <motion.div
                key="nexus-billing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 space-y-6"
              >
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Journal des Paiements et Facturation</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Revenus directs facturés à la clientèle du SaaS Nexus</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                        <th className="p-4">Client Payer</th>
                        <th className="p-4">Transaction ID Store</th>
                        <th className="p-4">Pack Enregistré</th>
                        <th className="p-4">Timestamp de commande</th>
                        <th className="p-4 text-right">Montant Collecté</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40">
                      {payments.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                          <td className="p-4 text-sm font-bold text-white">{p.user_email}</td>
                          <td className="p-4 text-xs font-mono text-slate-500">{p.transaction_id || 'paypal_live_order'}</td>
                          <td className="p-4 text-xs font-semibold uppercase text-indigo-400">{p.plan_id || 'starter'}</td>
                          <td className="p-4 text-xs font-mono text-slate-500">
                            {typeof p.created_at === 'string' ? p.created_at : 'Recent'}
                          </td>
                          <td className="p-4 text-right font-mono font-black italic text-emerald-400">
                            +{p.amount} €
                          </td>
                        </tr>
                      ))}

                      {payments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-24 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                            Aucune transaction enregistrée pour l'instant
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB 3: LIVE CONNECTIONS SHIELD */}
            {crmTab === 'live' && (
              <motion.div
                key="nexus-live"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Data Signal Control Dashboard */}
                <div className="bg-[#0b0c10] border border-blue-950/40 p-5 rounded-[2.2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center shrink-0">
                      <span className={cn("w-3.5 h-3.5 rounded-full absolute animate-ping opacity-75", realSess.length > 0 ? "bg-emerald-500" : "bg-blue-500/40")} />
                      <span className={cn("w-2.5 h-2.5 rounded-full relative", realSess.length > 0 ? "bg-emerald-400 animate-pulse" : "bg-blue-400")} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Source du Signal Télémétrie Core :</span>
                      <span className="text-[10px] font-bold text-slate-500 font-mono block transition-colors duration-300">
                        {realSess.length > 0 
                          ? `📡 TÉLÉMÉTRIE ACTIVE EN RÉEL EN DIRECT (${realSess.length} console(s) active(s))` 
                          : "⏳ ÉCOUTE SAAS EN DIRECT : En attente de connexions d’abonnés..."}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center bg-black/60 p-1 rounded-2xl border border-slate-850/60 shrink-0 select-none">
                    <span className="hidden lg:block text-[8px] font-mono font-black uppercase tracking-widest text-slate-500 px-3">Origine du Radar :</span>
                    <button
                      onClick={() => {
                        setTrafficMode('hybrid');
                        showToast('Mode Hybride automatique activé !', 'info');
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer",
                        trafficMode === 'hybrid'
                          ? "bg-blue-600 text-white shadow-md shadow-blue-950"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      🤖 Hybride (Auto)
                    </button>
                    <button
                      onClick={() => {
                        setTrafficMode('live');
                        showToast('Flux réel du SaaS uniquement branché.', 'info');
                      }}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1",
                        trafficMode === 'live'
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      📡 Live Réel ({realSess.length})
                    </button>
                    <button
                      onClick={() => {
                        setTrafficMode('history');
                        fetchConnectionHistory();
                        showToast('Historique des connexions des clients chargé.', 'info');
                      }}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1",
                        trafficMode === 'history'
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      🕒 Historique ({connectionHistory.length})
                    </button>
                    <button
                      onClick={() => {
                        setTrafficMode('demo');
                        showToast('Simulation de démonstration activée.', 'info');
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer",
                        trafficMode === 'demo'
                          ? "bg-slate-800 text-white border border-slate-700/50"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      🔬 Démo
                    </button>
                  </div>
                </div>

                {/* Embedded Live Counters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Sessions Actives</p>
                        <h4 className="text-2xl font-black text-white font-mono">{displayedSess.length}</h4>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Activité Proactive</p>
                        <h4 className="text-2xl font-black text-emerald-400 font-mono">
                          {displayedSess.filter(s => s.action !== 'idle').length}
                        </h4>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Convertis VIP</p>
                        <h4 className="text-2xl font-black text-amber-500 font-mono">
                          {users.filter(u => u.subscription?.plan_id && u.subscription?.plan_id !== 'none').length}
                        </h4>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Gift className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Signal Télémétrie</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-black text-emerald-400 font-mono tracking-widest">ACTIVE</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Wifi className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Radar Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Left component: Table (3 columns) */}
                  <div className="lg:col-span-3 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                    {trafficMode === 'history' ? (
                      <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
                          <div>
                            <h3 className="text-lg font-black text-indigo-400 uppercase tracking-tight italic">Registres de Connexion Historiques</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                              Historique de connexion de vos clients, heure de connexion, temps passé et dernières sections visitées
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                              <input
                                type="text"
                                placeholder="Filtrer..."
                                value={historyFilter}
                                onChange={(e) => setHistoryFilter(e.target.value)}
                                className="bg-black/40 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-600 w-36"
                              />
                            </div>
                            <button
                              onClick={fetchConnectionHistory}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-indigo-600 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                              title="Rafraîchir"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                            <button
                              onClick={clearConnectionHistory}
                              className={cn(
                                "px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors transition-all duration-300",
                                showWipeConfirm
                                  ? "bg-red-650 text-white border-red-500 hover:bg-red-600 scale-102"
                                  : "border-red-900/40 bg-red-950/20 text-red-500 hover:bg-red-900/10 animate-pulse"
                              )}
                              title={showWipeConfirm ? "Confirmer l'effacement définitif de l'historique" : "Effacer l'historique de connexions"}
                            >
                              <Trash2 className="w-3 h-3" /> {showWipeConfirm ? "SÛR ? CLIQUEZ ENCORE" : "WIPE"}
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          {isLoadingHistory ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-3">
                              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                              <span className="text-xs text-slate-500 font-mono">Chargement de la base de données de télémétrie Nexus...</span>
                            </div>
                          ) : (
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-900/60 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                                  <th className="p-4 pl-6">Abonné Client</th>
                                  <th className="p-4">Heure de Connexion</th>
                                  <th className="p-4">Dernière Section Visitée</th>
                                  <th className="p-4">Temps de Session</th>
                                  <th className="p-4">Géolocalisation (Ville - Pays)</th>
                                  <th className="p-4 text-right pr-6">Terminal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-900">
                                {connectionHistory
                                  .filter(log => {
                                    const term = historyFilter.toLowerCase();
                                    return (
                                      (log.email || '').toLowerCase().includes(term) ||
                                      (log.name || '').toLowerCase().includes(term) ||
                                      (log.last_page || '').toLowerCase().includes(term) ||
                                      (log.city || '').toLowerCase().includes(term) ||
                                      (log.device || '').toLowerCase().includes(term)
                                    );
                                  })
                                  .map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-950/40 transition-colors text-xs">
                                      <td className="p-4 pl-6">
                                        <div>
                                          <span className="text-xs font-black text-slate-200 block">{log.name}</span>
                                          <span className="text-[10px] font-medium text-slate-500">{log.email}</span>
                                        </div>
                                      </td>
                                      <td className="p-4 text-xs font-mono font-bold text-indigo-400">
                                        {log.login_time}
                                      </td>
                                      <td className="p-4">
                                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-indigo-900/20 text-indigo-300 bg-indigo-500/[0.04]">
                                          {log.last_page}
                                        </span>
                                      </td>
                                      <td className="p-4 font-mono font-bold text-slate-400">
                                        {log.duration_seconds >= 60 
                                          ? `${Math.floor(log.duration_seconds / 60)} min ${log.duration_seconds % 60} s`
                                          : `${log.duration_seconds} s`
                                        }
                                      </td>
                                      <td className="p-4 text-xs font-semibold text-slate-300">
                                        <div className="flex items-center gap-1.5">
                                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                          <span>{log.city}, {log.country || 'France'}</span>
                                        </div>
                                      </td>
                                      <td className="p-4 text-right pr-6 text-slate-400 font-mono text-[9px] uppercase tracking-widest font-black">
                                        <div className="flex items-center gap-1.5 justify-end">
                                          {(log.device || '').toUpperCase().includes('MOBILE') ? (
                                            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                          ) : (
                                            <Laptop className="w-3.5 h-3.5 text-slate-500" />
                                          )}
                                          <span>{log.device || 'ORDINATEUR'}</span>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}

                                {connectionHistory.filter(log => {
                                  const term = historyFilter.toLowerCase();
                                  return (
                                    (log.email || '').toLowerCase().includes(term) ||
                                    (log.name || '').toLowerCase().includes(term) ||
                                    (log.last_page || '').toLowerCase().includes(term) ||
                                    (log.city || '').toLowerCase().includes(term)
                                  );
                                }).length === 0 && (
                                  <tr>
                                    <td colSpan={6} className="py-24 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                                      Aucun enregistrement d'historique trouvé ou disponible.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
                          <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Radar des connexions SaaS en Direct</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                              Examinez la navigation active sur vos modules Nexus (SEO, Stock, AutoPilot, Blog) en Temps Réel
                            </p>
                          </div>
                          <div className="flex items-center gap-3 bg-black/40 border border-slate-850 px-4 py-2 rounded-xl text-[10px] text-slate-400">
                            <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
                            <span className="font-bold uppercase tracking-wider">Radar Actif</span>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-900/60 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                                <th className="p-4 pl-6">Abonné Client</th>
                                <th className="p-4">Geoloc</th>
                                <th className="p-4">Terminal Device</th>
                                <th className="p-4">Activité Directe</th>
                                <th className="p-4">Durée active</th>
                                <th className="p-4 text-right pr-6">Offre de fidélisation</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {displayedSess.map((session) => (
                                <tr key={session.id} className="hover:bg-slate-950/40 transition-colors text-xs">
                                  <td className="p-4 pl-6">
                                    <div>
                                      <span className="text-xs font-black text-slate-200 block">{session.name}</span>
                                      <span className="text-[10px] font-medium text-slate-500">{session.email}</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                      <span className="font-bold text-slate-300">{session.city}, {session.country}</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2 text-slate-400">
                                      {session.device === 'mobile' ? (
                                        <>
                                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                          <span className="text-[9px] font-black uppercase tracking-widest">Mobile</span>
                                        </>
                                      ) : session.device === 'tablet' ? (
                                        <>
                                          <Smartphone className="w-3.5 h-3.5 text-slate-500 rotate-90" />
                                          <span className="text-[9px] font-black uppercase tracking-widest">Tablette</span>
                                        </>
                                      ) : (
                                        <>
                                          <Laptop className="w-3.5 h-3.5 text-slate-500" />
                                          <span className="text-[9px] font-black uppercase tracking-widest">Ordinateur</span>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className={cn(
                                      "text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border",
                                      session.action === 'generating_article' && "text-amber-400 bg-amber-500/5 border-amber-500/10",
                                      session.action === 'auditing_seo' && "text-cyan-400 bg-cyan-500/5 border-cyan-500/10",
                                      session.action === 'optimizing_links' && "text-purple-400 bg-purple-500/5 border-purple-500/10",
                                      session.action === 'managing_stock' && "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
                                      session.action === 'idle' && "text-slate-400 bg-slate-500/5 border-slate-500/10"
                                    )}>
                                      {session.activePage}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-slate-500">
                                    {Math.floor(session.durationSeconds / 60)} min {session.durationSeconds % 60} s
                                  </td>
                                  <td className="p-4 text-right pr-6">
                                    <button
                                      onClick={() => handleLiveBonus(session.id, session.name, session.email)}
                                      disabled={session.pointsGratified}
                                      className={cn(
                                        "px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto cursor-pointer",
                                        session.pointsGratified 
                                          ? "bg-green-600/15 border border-green-500/20 text-green-400" 
                                          : "bg-blue-600 text-white hover:bg-blue-500 select-none shadow-md hover:shadow-blue-900/30"
                                      )}
                                    >
                                      {session.pointsGratified ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                                          VIP Gratifié (+500c)
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3 text-white fill-white" />
                                          Offrir Credits Bonus
                                        </>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              ))}

                              {displayedSess.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="py-24 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                                    Aucun client connecté actuellement sous télémétrie active.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column: Console Feed & Comparatif Nexus Matrix (1 column) */}
                  <div className="space-y-6">
                    {/* Log Terminal Console */}
                    <div className="bg-[#07080c] border border-slate-800 rounded-[2rem] p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
                          <span className="w-2.5 h-2.5 bg-yellow-500/80 rounded-full" />
                          <span className="w-2.5 h-2.5 bg-green-500/80 rounded-full" />
                          <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest ml-1">Live Telemetry</span>
                        </div>
                        <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">STREAM</span>
                      </div>

                      <div className="h-[220px] overflow-y-auto space-y-2 no-scrollbar font-mono text-[9px] leading-relaxed">
                        {liveLog.map((log) => (
                          <div key={log.id} className="text-slate-400 flex items-start gap-1 text-left">
                            <span className="text-slate-600 shrink-0">[{log.time}]</span>
                            <span className={cn(
                              log.type === 'success' ? "text-emerald-400" : log.type === 'warn' ? "text-amber-400" : "text-sky-400"
                            )}>
                              {log.text}
                            </span>
                          </div>
                        ))}
                        {liveLog.length === 0 && (
                          <div className="text-slate-600 italic">En attente de télémétrie utilisateur...</div>
                        )}
                      </div>
                    </div>

                    {/* Comparatif Nexus Matrix Card */}
                    <div className="bg-[#0c0e14] border border-blue-900/30 rounded-[2rem] p-6 space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[40px] rounded-full pointer-events-none" />
                      
                      <div className="border-b border-slate-900 pb-3">
                        <h4 className="text-xs font-black text-white uppercase tracking-tight italic">Comparatif Nexus Matrix</h4>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">SaaS Core vs Intégrations Clients</p>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-slate-400">
                            <span>SaaS Nexus Core (Inscrits)</span>
                            <span className="text-blue-400">{users.length}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min((users.length/10)*100, 100)}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-slate-400">
                            <span>WooCommerce Connectés (WP)</span>
                            <span className="text-green-400">{payments.length + 2}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(((payments.length + 2)/10)*100, 100)}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-slate-400">
                            <span>Ratio de conversion SaaS</span>
                            <span className="text-amber-500">
                              {users.length > 0 ? Math.round((users.filter(u => u.subscription?.plan_id && u.subscription?.plan_id !== 'none').length / users.length) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full" 
                              style={{ width: `${users.length > 0 ? (users.filter(u => u.subscription?.plan_id && u.subscription?.plan_id !== 'none').length / users.length) * 100 : 0}%` }} 
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-slate-400">
                            <span>Taux de santé Télémétrie</span>
                            <span className="text-cyan-400">99.8%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '99.8%' }} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 text-[8px] font-mono text-slate-500 flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-slate-900">
                        <span>Sync active sécurisée</span>
                        <span className="text-emerald-400 animate-pulse font-bold">100% OK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL Gifting plans */}
      <AnimatePresence>
        {isGiftOpen && selectedUserForGift && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-2xl space-y-6"
            >
              <button 
                onClick={() => {
                  setIsGiftOpen(false);
                  setSelectedUserForGift(null);
                }}
                className="absolute top-6 right-6 text-slate-500 hover:text-white text-xs font-black cursor-pointer"
              >
                ✕ Fermer
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-500">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Attribuer des avantages VIP</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cadeau destiné au compte : {selectedUserForGift.email}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Plan Pro / VIP à offrir</label>
                  <select
                    value={giftPlanId}
                    onChange={(e) => setGiftPlanId(e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500 transition-all font-bold"
                  >
                    <option value="">-- CHOISIR UN PLAN --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name.toUpperCase()} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de Jours d'accès</label>
                  <input 
                    required
                    type="number" 
                    value={giftDurationDays}
                    onChange={(e) => setGiftDurationDays(Number(e.target.value))}
                    placeholder="30" 
                    className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none transition-all placeholder:text-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-900">
                <button 
                  onClick={() => setIsGiftOpen(false)}
                  className="flex-1 py-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={triggerGiftPlan}
                  disabled={!giftPlanId || isGiftingLoading}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-45 shadow-lg shadow-amber-950/20 cursor-pointer"
                >
                  {isGiftingLoading ? 'Enregistrement...' : 'ACTIVER LE CADEAU'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL Send System Notice / Offer */}
      <AnimatePresence>
        {isNotifyOpen && selectedUserForNotify && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-2xl space-y-6"
            >
              <button 
                onClick={() => {
                  setIsNotifyOpen(false);
                  setSelectedUserForNotify(null);
                }}
                className="absolute top-6 right-6 text-slate-500 hover:text-white text-xs font-black cursor-pointer"
              >
                ✕ Fermer
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-500">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Transmettre une Alerte Système</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">S'affichera sur le tableau de bord de : {selectedUserForNotify.email}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Titre de l'Alerte</label>
                  <input 
                    required
                    type="text" 
                    value={notifyTitle}
                    onChange={(e) => setNotifyTitle(e.target.value)}
                    placeholder="Ex: PROMO : Obtenez -30% sur votre abonnement !" 
                    className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-700 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Message d'explications de l'Alerte</label>
                  <textarea 
                    required
                    rows={4}
                    value={notifyContent}
                    onChange={(e) => setNotifyContent(e.target.value)}
                    placeholder="Contenu complet s'affichant dans son espace utilisateur..." 
                    className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-900">
                <button 
                  onClick={() => setIsNotifyOpen(false)}
                  className="flex-1 py-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={triggerSendNotification}
                  disabled={!notifyTitle.trim() || !notifyContent.trim() || isNotifyingLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-45 shadow-lg shadow-blue-950/20 cursor-pointer"
                >
                  {isNotifyingLoading ? 'Transmission...' : 'ENVOYER L\'ALERTE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Edit / Password Manager Modal */}
      <AnimatePresence>
        {isEditOpen && selectedUserForEdit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-blue-500/30 rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 mx-auto mb-4 text-blue-400">
                  <Edit2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Gérer le Profil Client</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Email du compte : <span className="text-blue-400 font-mono">{selectedUserForEdit.email}</span>
                </p>
              </div>

              <form onSubmit={handleSaveUserEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Prénom</label>
                    <input 
                      type="text" 
                      value={editPrenom}
                      onChange={(e) => setEditPrenom(e.target.value)}
                      placeholder="Prénom" 
                      className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom</label>
                    <input 
                      type="text" 
                      value={editNom}
                      onChange={(e) => setEditNom(e.target.value)}
                      placeholder="Nom" 
                      className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Date de naissance</label>
                    <input 
                      type="date" 
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-600 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
                    <input 
                      type="tel" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+33 6 ..." 
                      className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Adresse</label>
                  <input 
                    type="text" 
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Adresse complète" 
                    className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <label className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" /> Mot de passe du compte (En clair)
                  </label>
                  <input 
                    type="text" 
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Entrez un nouveau mot de passe" 
                    className="w-full bg-black border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-400 font-mono font-bold focus:border-amber-500 outline-none transition-all"
                  />
                  <p className="text-[8px] text-slate-500 italic mt-1 leading-normal">
                    Ce mot de passe est enregistré pour permettre aux administrateurs de le voir ou de le modifier directement à la demande du client.
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-900">
                  <button 
                    type="button"
                    onClick={() => { setIsEditOpen(false); setSelectedUserForEdit(null); }}
                    className="flex-1 py-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
                    disabled={isSavingUser}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingUser}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-45 shadow-lg shadow-blue-950/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : "ENREGISTRER"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && userToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-rose-500/30 rounded-[2.5rem] p-10 max-w-lg w-full relative shadow-2xl space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-600/20 rounded-2xl flex items-center justify-center border border-rose-500/30 mx-auto mb-4 text-rose-500">
                  <AlertTriangle className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-rose-500 italic uppercase tracking-tighter">SUPPRESSION DE COMPTE CLIENT</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Client ciblé : <span className="text-rose-400">{userToDelete.email || userToDelete.user_email}</span>
                </p>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl text-[11px] text-slate-300 leading-relaxed font-semibold">
                ⚠️ <span className="text-rose-500 uppercase font-black">Attention, Alerte Critique :</span> Cette action supprimera définitivement le profil de l'utilisateur, ses abonnements, ses sites associés et son historique complet du registre système Nexus. Aucun retour en arrière n'est possible.
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-900">
                <button 
                  onClick={() => { setIsDeleteOpen(false); setUserToDelete(null); }}
                  className="flex-1 py-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
                  disabled={isDeletingUser}
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDeleteUser}
                  disabled={isDeletingUser}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-950/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeletingUser ? <RefreshCw className="w-4 h-4 animate-spin" /> : "CONFIRMER"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
