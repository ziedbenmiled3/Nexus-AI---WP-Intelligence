import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  LayoutGrid,
  ArrowRight,
  Zap,
  Loader2,
  X,
  Link,
  Settings,
  RefreshCw,
  Unlink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WPConfig } from '../types';
import { cn } from '../lib/utils';
import { firebaseService } from '../services/firebaseService';
import { testWPConnection } from '../lib/wordpress';
import { testGeminiConnection } from '../lib/gemini';

import { useAuth } from '../providers/FirebaseProvider';

interface MultiSiteConfig extends WPConfig {
  id: string;
}

export default function SitesView({ 
  currentConfig, 
  onSwitch,
  currentSub,
  sites,
  setSites,
  setActiveTab
}: { 
  currentConfig: WPConfig | null,
  onSwitch: (config: WPConfig | null) => void,
  currentSub: any,
  sites: MultiSiteConfig[],
  setSites: React.Dispatch<React.SetStateAction<MultiSiteConfig[]>>,
  setActiveTab?: (tab: string) => void
}) {
  const { user } = useAuth();
  const userEmail = user?.email || localStorage.getItem('nexus_user_email');
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showScriptPopup, setShowScriptPopup] = useState(false);

  const isAdminUser = userEmail?.toLowerCase() === 'ziedbenmiled3@gmail.com' || userEmail?.toLowerCase() === 'contact@nexuswp.pro';
  const siteLimit = isAdminUser ? 100 : (currentSub?.site_limit || 0);
  const isLimitReached = siteLimit !== -1 && (siteLimit === 0 || sites.length >= siteLimit);

  const fetchSites = useCallback(async (showLoader = false) => {
    if (!userEmail) return;

    if (showLoader) setIsRefreshing(true);
    
    try {
      const data = await firebaseService.getSites(userEmail);
      if (Array.isArray(data)) {
        const mapped = data.map((s: any) => ({
          ...s,
          applicationPassword: s.application_password
        }));
        setSites(mapped);
        localStorage.setItem('nexus_sites_list', JSON.stringify(mapped));

        // Registry sync for Super Admin to ensure global protection of their assets
        if (isAdminUser) {
          firebaseService.syncAllSitesToRegistry(userEmail);
        }
      }
    } catch (err) {
      console.error('Failed to sync sites:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [userEmail, isAdminUser, setSites]);

  useEffect(() => {
    fetchSites();
    // Safety timeout: don't stay in loading state forever
    const timer = setTimeout(() => {
      setIsLoadingSites(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [fetchSites]);

  const [error, setError] = useState<React.ReactNode | null>(null);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addAuthMode, setAddAuthMode] = useState<'standard' | 'woocommerce'>('standard');
  const [editAuthMode, setEditAuthMode] = useState<'standard' | 'woocommerce'>('standard');
  const [newSite, setNewSite] = useState({
    url: '',
    username: '',
    password: '',
    consumerKey: '',
    consumerSecret: '',
    geminiApiKey: ''
  });
  const [editSiteData, setEditSiteData] = useState({
    url: '',
    username: '',
    password: '',
    consumerKey: '',
    consumerSecret: '',
    geminiApiKey: ''
  });
  const [isTesting, setIsTesting] = useState(false);

  const handleTestGemini = async (key: string) => {
    if (!key) {
      setError("Veuillez entrer une clé API pour tester.");
      return;
    }
    
    // Reset states
    setIsTestingGemini(true);
    setGeminiStatus('idle');
    setError(null);

    try {
      // Test through proxy
      await testGeminiConnection(key);
      setGeminiStatus('success');
      setError(null);
      // Keep success status for 5 seconds then go back to idle
      setTimeout(() => setGeminiStatus('idle'), 5000);
    } catch (err: any) {
      console.warn("Test Gemini failed:", err.message);
      setGeminiStatus('error');
      
      // If we got a real error message, show it but don't block the button
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          setError(parsed.error || parsed.details || err.message);
        } catch {
          setError(err.message);
        }
      }
    } finally {
      setIsTestingGemini(false);
    }
  };

  useEffect(() => {
    // Reset status to idle whenever the key is changed so the user can re-test
    setGeminiStatus('idle');
  }, [newSite.geminiApiKey, editSiteData.geminiApiKey]);

  useEffect(() => {
    localStorage.setItem('nexus_sites_list', JSON.stringify(sites));
  }, [sites]);

  const handleUpdateSite = async (e: React.FormEvent) => {
    console.log('Update site triggered', { editingSiteId, editAuthMode });
    e.preventDefault();
    if (!editingSiteId) return;
    
    setIsTesting(true);
    setError(null);

    const siteToUpdate = sites.find(s => s.id === editingSiteId);
    if (!siteToUpdate) return;

    let cleanUrl = editSiteData.url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

    const authConfig = editAuthMode === 'woocommerce' 
      ? {
          url: cleanUrl,
          username: '',
          applicationPassword: '',
          consumerKey: editSiteData.consumerKey,
          consumerSecret: editSiteData.consumerSecret,
          geminiApiKey: editSiteData.geminiApiKey
        }
      : {
          url: cleanUrl,
          username: editSiteData.username,
          applicationPassword: editSiteData.password,
          geminiApiKey: editSiteData.geminiApiKey
        };

    try {
      // Test new credentials via proxy
      await testWPConnection(authConfig);

      const updatedSites = sites.map(s => 
        s.id === editingSiteId 
          ? { ...s, ...authConfig }
          : s
      );

      setSites(updatedSites);
      localStorage.setItem('nexus_sites_list', JSON.stringify(updatedSites));
      
      // Save to Firebase
      if (userEmail) {
        await firebaseService.saveSite({
          id: editingSiteId,
          user_email: userEmail,
          ...authConfig,
          application_password: authConfig.applicationPassword // Map back to DB field name
        });
      }
      if (isActive(siteToUpdate.url) || isActive(cleanUrl)) {
        onSwitch(authConfig);
      }

      setEditingSiteId(null);
    } catch (err: any) {
      if (err.message === 'SITE_ALREADY_REGISTERED') {
        setError(
          <div className="space-y-2 text-left">
            <p className="text-red-400 font-bold uppercase tracking-tighter">Accès Interdit / Domaine Verrouillé</p>
            <p className="text-[10px] text-slate-400 font-medium normal-case tracking-normal leading-relaxed">
              Le domaine <span className="text-blue-400 italic">"{editSiteData.url}"</span> est <span className="text-white">définitivement lié</span> au premier compte Nexus qui l'a enregistré.
              <br /><br />
              Par mesure de sécurité et pour éviter les abus, un site ne peut jamais être transféré vers un autre compte, même s'il est supprimé du tableau de bord d'origine.
            </p>
          </div>
        );
        return;
      }
      console.error('Connection test failed:', err);
      // Check if it's the specific HTML/Proxy error we sent from server.ts
      const proxyError = err.response?.data?.error;
      const proxyMessage = err.response?.data?.message;
      const status = err.response?.status;
      
      if (status === 401) {
        setError(
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="font-bold uppercase tracking-tight">Erreur d'Authentification (401)</p>
            </div>
            
            <div className="space-y-3 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
              <p className="text-[10px] text-slate-300 font-medium normal-case tracking-normal">
                Votre site WordPress a refusé les identifiants. Voici les causes possibles :
              </p>
              
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-red-500 text-[10px] font-black mt-0.5">•</span>
                  <p className="text-[9px] normal-case tracking-normal text-slate-400">
                    <strong className="text-white">Identifiant :</strong> Utilisez votre pseudo (ex: "admin"), pas votre e-mail. La casse est importante.
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 text-[10px] font-black mt-0.5">•</span>
                  <p className="text-[9px] normal-case tracking-normal text-slate-400">
                    <strong className="text-white">Code 16 caractères :</strong> Utilisez le code généré dans WordPress (ex: <code className="text-blue-400 px-1 bg-white/5 rounded">abcd efgh ijkl mnop</code>), pas votre mot de passe habituel.
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 text-[10px] font-black mt-0.5">•</span>
                  <p className="text-[9px] normal-case tracking-normal text-slate-400">
                    <strong className="text-white">Apache / .htaccess :</strong> Copiez ce code <strong className="text-blue-400">tout en haut</strong> de votre fichier <strong className="text-emerald-400">.htaccess</strong> :
                  </p>
                </li>
              </ul>

              <pre className="bg-black/50 p-2.5 rounded-lg text-[7px] text-blue-400 font-mono overflow-x-auto border border-white/5 select-all">
{`# NEXUS PROXY FIX
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]`}
              </pre>

              <p className="text-[8px] text-slate-500 italic mt-2 border-t border-white/5 pt-2">
                Note: Si vous utilisez Cloudflare, iThemes Security ou Wordfence, vérifiez qu'ils ne bloquent pas les requêtes vers /wp-json/.
              </p>
            </div>
          </div>
        );
      } else if (proxyError && typeof proxyError === 'string' && proxyError.includes('HTML_RESPONSE')) {
          setError(
            <div className="space-y-2">
              <p>L'API REST de votre WordPress semble bloquée ou désactivée.</p>
              <ul className="list-disc ml-4 text-[9px] lowercase italic font-medium space-y-1 normal-case tracking-normal">
                <li>Vérifiez dans <span className="text-white">Réglages &gt; Permaliens</span> (ne doit pas être sur "Simple").</li>
                <li>Désactivez temporairement les plugins de sécurité (Wordfence, All-in-one WP Security).</li>
                <li>Assurez-vous que l'URL est correcte (ex: <span className="text-blue-400">https://votre-site.com</span>).</li>
              </ul>
            </div>
          );
      } else if (proxyError) {
        setError(proxyError);
      } else if (proxyMessage) {
        setError(proxyMessage);
      } else {
        setError(err.message || 'Erreur de connexion. Vérifiez l\'URL et vos identifiants WordPress.');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const startEditing = (site: MultiSiteConfig) => {
    setEditingSiteId(site.id);
    const mode = (site.consumerKey && site.consumerSecret) ? 'woocommerce' : 'standard';
    setEditAuthMode(mode);
    setEditSiteData({
      url: site.url,
      username: site.username || '',
      password: site.applicationPassword || '',
      consumerKey: site.consumerKey || '',
      consumerSecret: site.consumerSecret || '',
      geminiApiKey: site.geminiApiKey || ''
    });
    setError(null);
  };

  const handleAddSite = async (e: React.FormEvent) => {
    console.log('Add site triggered', { addAuthMode });
    e.preventDefault();
    setIsTesting(true);
    setError(null);

    // Basic cleaning of URL
    let cleanUrl = newSite.url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

    // Local check for duplicates
    const normalizedNew = cleanUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    const isDuplicate = sites.some(s => {
      const existingNorm = s.url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
      return existingNorm === normalizedNew;
    });

    if (isDuplicate) {
      setError(
        <div className="space-y-1">
          <p className="font-bold">Ce site est déjà dans votre liste.</p>
        </div>
      );
      setIsTesting(false);
      return;
    }

    const authConfig = addAuthMode === 'woocommerce'
      ? {
          url: cleanUrl,
          username: '',
          applicationPassword: '',
          consumerKey: newSite.consumerKey,
          consumerSecret: newSite.consumerSecret,
          geminiApiKey: newSite.geminiApiKey
        }
      : {
          url: cleanUrl,
          username: newSite.username,
          applicationPassword: newSite.password,
          geminiApiKey: newSite.geminiApiKey
        };

    try {
      // Test the connection via proxy
      await testWPConnection(authConfig);

      const config: MultiSiteConfig = {
        id: Math.random().toString(36).substring(2, 15),
        ...authConfig
      };

      const updatedSites = [...sites, config];
      setSites(updatedSites);
      localStorage.setItem('nexus_sites_list', JSON.stringify(updatedSites));
      
      // Save to Firebase
      if (userEmail) {
        await firebaseService.saveSite({
          id: config.id,
          user_email: userEmail,
          ...authConfig,
          application_password: authConfig.applicationPassword
        });
      }

      setIsAdding(false);
      setNewSite({ url: '', username: '', password: '', consumerKey: '', consumerSecret: '', geminiApiKey: '' });
      
      // Auto-connect to the newly added site
      onSwitch(config);
      // Trigger the modal popup to prompt the user to install the script
      setShowScriptPopup(true);
      
    } catch (err: any) {
      if (err.message === 'SITE_ALREADY_REGISTERED') {
        setError(
          <div className="space-y-2 text-left">
            <p className="text-red-400 font-bold uppercase tracking-tighter">Propriété Exclusive Nexus</p>
            <p className="text-[10px] text-slate-400 font-medium normal-case tracking-normal leading-relaxed">
              Le site <span className="text-blue-400 italic">"{cleanUrl}"</span> a déjà été enregistré dans le système Nexus par une autre adresse email.
              <br /><br />
              <strong className="text-white text-xs block mb-1">Règle Anti-Fraude :</strong>
              Pour garantir l'intégrité des abonnements, un domaine est rattaché <span className="text-blue-500 font-black">À VIE</span> au premier compte utilisateur. Il ne peut être déplacé vers un nouveau compte, même après suppression.
            </p>
          </div>
        );
        return;
      }
      console.error('Connection test failed:', err);
      // Check if it's the specific HTML/Proxy error we sent from server.ts
      const proxyError = err.response?.data?.error;
      const proxyMessage = err.response?.data?.message;
      const status = err.response?.status;
      
      if (status === 401) {
        setError(
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="font-bold uppercase tracking-tight">Accès Refusé (401)</p>
            </div>
            
            <div className="space-y-3 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
              <p className="text-[10px] text-slate-300 font-medium normal-case tracking-normal">
                WordPress ne reconnaît pas vos accès. Vérifiez ces points :
              </p>
              
              <div className="space-y-2">
                <div className="text-[9px] text-slate-400 space-y-1 leading-relaxed">
                   <p><strong className="text-white">1. Identifiant :</strong> Utilisez votre pseudo, pas votre email.</p>
                   <p><strong className="text-white">2. Mot de passe :</strong> Utilisez le code de 16 caractères généré dans WP &gt; Profil.</p>
                   <p><strong className="text-white">3. .htaccess (Important) :</strong> Si vous êtes sous Apache, ajoutez ceci en haut du fichier :</p>
                </div>
                
                <pre className="bg-black/50 p-2.5 rounded-lg text-[7px] text-blue-400 font-mono overflow-x-auto border border-white/5">
{`# NEXUS PROXY FIX
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]`}
                </pre>
              </div>
            </div>
          </div>
        );
      } else if (proxyError && typeof proxyError === 'string' && proxyError.includes('HTML_RESPONSE')) {
          setError(
            <div className="space-y-2 text-left">
              <p>Impossible d'accéder à l'API de votre site (Erreur 404/Block).</p>
              <ul className="list-disc ml-4 text-[9px] space-y-1 normal-case tracking-normal font-medium text-slate-400">
                <li>Allez dans <strong className="text-white italic">Réglages &gt; Permaliens</strong> et ré-enregistrez en choisissant un autre format que "Simple".</li>
                <li>Votre hébergeur ou un plugin de sécurité bloque peut-être l'API REST.</li>
                <li>Vérifiez que <strong className="text-white italic">Application Passwords</strong> est bien supporté par votre installation.</li>
              </ul>
            </div>
          );
      } else if (proxyError) {
        setError(proxyError);
      } else if (proxyMessage) {
        setError(proxyMessage);
      } else {
        setError(err.message || 'Erreur de connexion au site WordPress.');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const removeSite = async (id: string, url?: string) => {
    const updatedSites = sites.filter(s => s.id !== id);
    setSites(updatedSites);
    localStorage.setItem('nexus_sites_list', JSON.stringify(updatedSites));
    
    // Clean up connections if the removed site was active
    const isCurrentlyActive = currentConfig && (currentConfig.id === id || currentConfig.url === url);
    if (isCurrentlyActive) {
      if (updatedSites.length > 0) {
        onSwitch(updatedSites[0]);
      } else {
        onSwitch(null);
      }
    }
    
    // Remove from Firebase
    try {
      await firebaseService.deleteSite(id, url);
    } catch (e) {
      console.error("Failed to delete site from Firebase", e);
    }
  };

  const isActive = (url: string) => currentConfig?.url === url;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Stat Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center gap-4">
            {isLoadingSites ? 'SYNCHRONISATION...' : (sites.length > 0 ? (user?.email ? 'MES SITES CLOUD' : 'MES SITES LOCAUX') : 'MES SITES')}
            {!isLoadingSites && <span className="bg-blue-600 text-[10px] px-3 py-1 rounded-full not-italic tracking-widest">{sites.length} ACTIVE</span>}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Environnements WordPress Nexus Connectés</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
           <div className="px-4 py-2 text-right">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Capacité Nexus</p>
              <p className="text-xs font-black text-white italic tracking-tighter">{isLoadingSites ? '...' : sites.length} / {siteLimit === 0 ? '0' : siteLimit} SITES</p>
           </div>
           <div className="h-10 w-24 bg-slate-800 rounded-lg overflow-hidden relative">
              <div className="h-full bg-blue-600 rounded-full blur-[2px] opacity-50" style={{ width: `${isLoadingSites ? 0 : (sites.length / (siteLimit || 1)) * 100}%` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-[80%] h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${isLoadingSites ? 0 : (sites.length / (siteLimit || 1)) * 100}%` }} />
                 </div>
              </div>
           </div>

           <button 
             onClick={() => fetchSites(true)}
             disabled={isRefreshing || isLoadingSites}
             className="p-4 bg-slate-900 shadow-xl border border-white/5 text-slate-400 hover:text-white rounded-xl transition-all disabled:opacity-50 active:scale-95"
             title="Synchroniser avec le cloud"
           >
              <RefreshCw className={cn("w-4 h-4", (isRefreshing || isLoadingSites) && "animate-spin")} />
           </button>

           {!isAdding && !isLoadingSites && (
              <button 
                onClick={() => {
                  if (isLimitReached) {
                    setError(`Limite de sites atteinte (${siteLimit}). Veuillez améliorer votre pack.`);
                  } else {
                    setIsAdding(true);
                  }
                }}
                className={cn(
                  "px-6 py-4 rounded-xl flex items-center gap-3 transition-all shadow-2xl active:scale-95",
                  isLimitReached 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-white text-black hover:scale-105 shadow-blue-900/20"
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.1em]">Ajouter un site</span>
              </button>
           )}
           {isAdding && (
              <button 
                onClick={() => setIsAdding(false)}
                className="bg-slate-800 text-white px-6 py-4 rounded-xl flex items-center gap-3 hover:bg-slate-700 transition-all active:scale-95"
              >
                <span className="text-[11px] font-black uppercase tracking-[0.1em]">Annuler</span>
              </button>
           )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoadingSites ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-40 space-y-4"
          >
             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Chargement de votre infrastructure Nexus...</p>
          </motion.div>
        ) : isAdding ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Form Table */}
            <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden backdrop-blur-xl">
               {/* Banner de plugins requis avant connexion */}
               <div className="mb-8 p-6 bg-blue-500/5 hover:bg-blue-500/[0.08] transition-all border border-blue-500/10 rounded-2xl flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10">
                 <div className="space-y-2 max-w-3xl">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                     <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] font-mono">
                       PLUGINS REQUIS AVANT DE CONNECTER VOTRE SITE
                     </h4>
                   </div>
                   <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider leading-relaxed">
                     Pour éviter tout blocage de connexion et assurer le bon fonctionnement de l'IA, veuillez installer et activer :
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                     <div className="bg-slate-950/60 p-3 rounded-lg border border-purple-500/10 flex items-start gap-2">
                       <span className="text-purple-400 font-mono text-xs font-bold mt-0.5">①</span>
                       <div className="text-[10px]">
                         <p className="font-extrabold text-slate-100 uppercase tracking-wider">RankMath SEO / Yoast SEO</p>
                         <p className="text-slate-400 text-[9px] font-medium leading-normal mt-0.5">Indispensable pour la rédaction et l'analyse automatisée de vos métadonnées SEO par l'IA.</p>
                       </div>
                     </div>
                     <div className="bg-slate-950/60 p-3 rounded-lg border border-amber-500/10 flex items-start gap-2">
                       <span className="text-amber-400 font-mono text-xs font-bold mt-0.5">②</span>
                       <div className="text-[10px]">
                         <p className="font-extrabold text-slate-100 uppercase tracking-wider">WP CORS (CORS Enabling)</p>
                         <p className="text-slate-400 text-[9px] font-medium leading-normal mt-0.5">Indispensable pour autoriser les échanges d'API REST entre Nexus et votre navigateur sans blocage CORS.</p>
                       </div>
                     </div>
                   </div>
                 </div>
                 <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
                   <span className="flex-1 lg:flex-initial text-center text-[8px] border border-purple-500/20 bg-purple-500/5 text-purple-400 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider">SEO ACTIVE ✓</span>
                   <span className="flex-1 lg:flex-initial text-center text-[8px] border border-amber-500/20 bg-amber-500/5 text-amber-400 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider">WP CORS CONFIGURED ✓</span>
                 </div>
               </div>

               <div className="flex gap-4 mb-8">
                  <button 
                    type="button" 
                    onClick={() => setAddAuthMode('standard')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                      addAuthMode === 'standard' ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-slate-500"
                    )}
                  >
                    WordPress Standard
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAddAuthMode('woocommerce')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                      addAuthMode === 'woocommerce' ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-slate-500"
                    )}
                  >
                    WooCommerce API Keys
                  </button>
               </div>

               <form onSubmit={handleAddSite} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Url WordPress</label>
                    <input 
                      required
                      placeholder="https://votre-site.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white outline-none focus:border-blue-500 transition-all"
                      value={newSite.url || ''}
                      onChange={e => setNewSite({...newSite, url: e.target.value})}
                    />
                  </div>
                  
                  {addAuthMode === 'standard' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Utilisateur / Email</label>
                        <input 
                          required
                          placeholder="admin"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white outline-none focus:border-blue-500 transition-all"
                          value={newSite.username || ''}
                          onChange={e => setNewSite({...newSite, username: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Mot de Passe Application</label>
                        <input 
                          required
                          type="password"
                          placeholder="•••• •••• •••• ••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white outline-none focus:border-blue-500 transition-all"
                          value={newSite.password || ''}
                          onChange={e => setNewSite({...newSite, password: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Clé Client (Consumer Key)</label>
                        <input 
                          required
                          placeholder="ck_..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white outline-none focus:border-blue-500 transition-all"
                          value={newSite.consumerKey || ''}
                          onChange={e => setNewSite({...newSite, consumerKey: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Secret Client (Consumer Secret)</label>
                        <input 
                          required
                          type="password"
                          placeholder="cs_..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white outline-none focus:border-blue-500 transition-all"
                          value={newSite.consumerSecret || ''}
                          onChange={e => setNewSite({...newSite, consumerSecret: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1 italic">
                      Clé API Gemini (Recommandé pour éviter les quotas)
                    </label>
                    <input 
                      placeholder="Entrez votre clé API Gemini personnelle"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black outline-none focus:border-blue-500 transition-all text-blue-400"
                      value={newSite.geminiApiKey || ''}
                      onChange={e => setNewSite({...newSite, geminiApiKey: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => handleTestGemini(newSite.geminiApiKey)}
                      disabled={isTestingGemini}
                      className={cn(
                        "absolute right-2 top-8 px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all h-10 mt-1 mr-1",
                        geminiStatus === 'success' ? "bg-emerald-500 text-white" : 
                        geminiStatus === 'error' ? "bg-red-500 text-white" : 
                        "bg-white/10 text-slate-400 hover:bg-white/20"
                      )}
                    >
                      {isTestingGemini ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                       geminiStatus === 'success' ? "VALIDE ✓" : 
                       geminiStatus === 'error' ? "ERREUR ✗" : "TESTER"}
                    </button>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic pl-1 mt-1 leading-relaxed">
                      {isAdminUser 
                        ? "En tant que Super Admin, vous utilisez la clé serveur globale par défaut."
                        : "L'intelligence Nexus nécessite votre propre moteur. Obtenez votre clé "
                      }
                      {!isAdminUser && (
                        <>
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 underline hover:text-blue-400">Gratuite (Free tier)</a>
                          <span> ou activez le mode payant pour quelques centimes par mois.</span>
                        </>
                      )}
                    </p>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isTesting}
                    className="w-full h-[58px] bg-white text-black font-black uppercase tracking-[0.1em] text-xs rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-blue-500/10"
                  >
                    {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer l\'ajout'}
                  </button>
               </form>
               {error && (
                 <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                   <AlertCircle className="w-4 h-4" />
                   {error}
                 </div>
               )}
            </div>

            {/* Plugins Requis Section */}
            <div className="bg-[#0b1017] border border-blue-500/10 rounded-[2.5rem] p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-[0.2em] font-mono">
                    AUTORISATIONS & PLUGINS WORDPRESS REQUIS
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Trois extensions WordPress majeures doivent être installées et actives sur votre WP pour orchestrer l'IA Nexus
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plugin 1: SEO */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-blue-500/20 transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-white tracking-wider">RankMath / Yoast</span>
                        <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] px-2 py-0.5 rounded font-black uppercase">Plugin SEO</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">
                        Donne l'accès aux balises métadonnées. Indispensable pour l'analyse SEO, la rédaction ou l'optimisation des balises méta par le Rédacteur Intelligent.
                      </p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 font-semibold italic mt-auto">
                    Recommandé : RankMath SEO ou Yoast SEO.
                  </p>
                </div>

                {/* Plugin 2: WP CORS */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-blue-500/20 transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Link className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-white tracking-wider">WP CORS</span>
                        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] px-2 py-0.5 rounded font-black uppercase">CORS Header</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">
                        Autorise les échanges d'API REST entre Nexus et votre navigateur. Résout les erreurs de blocage de ressources d'origine croisée.
                      </p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 font-semibold italic mt-auto">
                    Requis : Installer l'extension "WP CORS" ou activer les en-têtes Access-Control-Allow-Origin.
                  </p>
                </div>

                {/* Plugin 3: WooCommerce */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-blue-500/20 transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-white tracking-wider">WooCommerce</span>
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] px-2 py-0.5 rounded font-black uppercase">E-Commerce</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">
                        Donne l'accès au catalogue e-commerce. Indispensable pour modifier l'inventaire en direct, synchroniser les prix, et optimiser les descriptifs produits.
                      </p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 font-semibold italic mt-auto">
                    Requis : API REST de lecture/écriture (R/W) WooCommerce active.
                  </p>
                </div>
              </div>
            </div>

            {/* Instruction Footer */}
            <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-8">
               <InstructionStep number="1" title="Accéder au profil" desc="Connectez-vous à votre WordPress, allez dans Utilisateurs > Profil." />
               <InstructionStep number="2" title="Générer le code" desc="Scrollez jusqu'à Mots de passe d'application. Donnez lui un nom (ex: WP AI Nexus) et cliquez sur Ajouter." />
               <InstructionStep number="3" title="Lier le site" desc="Copiez le code généré de 16 caractères et utilisez-le ici avec votre identifiant habituel." />
               <InstructionStep number="4" title="Clé Gemini IA" desc="Générez votre clé sur Google AI Studio. C'est GRATUIT pour la plupart des usages. La version payante ne coûte que quelques centimes par mois." />
            </div>

            <div className="bg-blue-600/5 p-6 rounded-2xl border border-blue-500/10 flex items-center gap-4">
               <ShieldCheck className="w-5 h-5 text-blue-500" />
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  SÉCURITÉ : LE MOT DE PASSE D'APPLICATION EST SPÉCIFIQUE À CET USAGE ET PEUT ÊTRE RÉVOQUÉ À TOUT MOMENT.
               </p>
            </div>
          </motion.div>
        ) : sites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800 rounded-[3rem] border-dashed space-y-8"
          >
             <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/5">
                <Globe className="w-8 h-8 text-slate-700" />
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Prêt à connecter votre premier site ?</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lancez-vous en quelques secondes</p>
             </div>
             <button 
                onClick={() => setIsAdding(true)}
                className="px-12 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-white/10"
             >
                Commencer maintenant
             </button>

             <div className="flex gap-12 pt-12 border-t border-white/5 w-full max-w-4xl justify-center">
                <SimpleStep number="1" title="Profil WordPress" />
                <SimpleStep number="2" title="Code d'accès" />
                <SimpleStep number="3" title="Liaison Immédiate" />
             </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
              <motion.div 
                key={site.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-8 rounded-[2.5rem] border transition-all relative group overflow-hidden",
                  isActive(site.url) 
                    ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/50" 
                    : "bg-[#0a0c10] border-slate-800 hover:border-slate-700"
                )}
              >
                {isActive(site.url) && (
                   <div className="absolute top-0 right-0 bg-blue-500 text-white px-6 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3 h-3 fill-current" />
                      Nexus Linked
                   </div>
                )}
                
                <div className="flex justify-between items-start mb-8">
                   <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center relative">
                      <Globe className="w-6 h-6 text-white" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0c10] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => startEditing(site)}
                        className="p-3 bg-slate-800 text-slate-500 hover:text-white rounded-xl transition-all"
                        title="Paramètres de connexion"
                      >
                         <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeSite(site.id, site.url)}
                        className="p-3 bg-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                      <a 
                        href={site.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-blue-500/10 text-blue-500/50 hover:text-blue-500 hover:bg-blue-500/20 rounded-xl transition-all"
                      >
                         <ExternalLink className="w-4 h-4" />
                      </a>
                   </div>
                </div>

                <div className="space-y-2 mb-8">
                   <h4 className="text-xl font-black text-white italic uppercase tracking-tighter truncate leading-none">{site.url?.replace('https://', '') || 'URL Inconnue'}</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="w-3 h-1 bg-white/10 rounded-full" />
                      Sync Active
                   </p>
                </div>

                {isActive(site.url) ? (
                   <div className="flex gap-2 w-full">
                     <button 
                        onClick={() => onSwitch(site)}
                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-blue-900/40"
                     >
                        Tableau de bord
                        <ArrowRight className="w-4 h-4" />
                     </button>
                     <button 
                        onClick={() => onSwitch(null)}
                        className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                        title="Déconnecter par sécurité"
                      >
                         <Unlink className="w-3.5 h-3.5" />
                         <span className="hidden sm:inline">DÉCONNECTER</span>
                     </button>
                   </div>
                 ) : (
                   <button 
                      onClick={() => onSwitch(site)}
                      className="w-full py-4 bg-slate-900 text-slate-500 border border-slate-800 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                   >
                      Sélectionner le site
                      <ArrowRight className="w-4 h-4" />
                   </button>
                 )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingSiteId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
             <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg p-10 overflow-hidden relative shadow-2xl"
             >
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                         <Settings className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <h4 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">Mise à jour accès</h4>
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                            {sites.find(s => s.id === editingSiteId)?.url?.replace('https://', '') || 'Modifier le site'}
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setEditingSiteId(null)}
                     className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                   >
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="bg-slate-900/40 border border-blue-500/10 rounded-2xl p-4 mb-6 space-y-2">
                   <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-blue-500" />
                      <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Intelligence BYOK (Bring Your Own Key)</p>
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      Nexus utilise vos propres ressources IA pour garantir une vitesse maximale. <span className="text-emerald-500">La version GRATUITE suffit largement.</span> Pour les gros catalogues, la version payante coûte moins de 0.10€ pour des milliers d'optimisations.
                   </p>
                   <a 
                     href="https://aistudio.google.com/app/apikey" 
                     target="_blank" 
                     rel="noreferrer"
                     className="inline-flex items-center gap-1.5 text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all mt-1"
                   >
                     Créer ma clé gratuite sur Google AI Studio <ExternalLink className="w-2.5 h-2.5" />
                   </a>
                </div>

                 <form onSubmit={handleUpdateSite} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Url WordPress</label>
                      <input 
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white focus:border-blue-500 transition-all outline-none"
                        value={editSiteData.url || ''}
                        onChange={e => setEditSiteData({...editSiteData, url: e.target.value})}
                      />
                   </div>
                    {editAuthMode === 'standard' ? (
                      <>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Utilisateur / Email</label>
                           <input 
                             required
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white focus:border-blue-500 transition-all outline-none"
                             value={editSiteData.username || ''}
                             onChange={e => setEditSiteData({...editSiteData, username: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Nouveau Mot de Passe Application</label>
                           <input 
                             required
                             type="password"
                             placeholder="•••• •••• •••• ••••"
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white focus:border-blue-500 transition-all outline-none"
                             value={editSiteData.password || ''}
                             onChange={e => setEditSiteData({...editSiteData, password: e.target.value})}
                           />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Clé Client (Consumer Key)</label>
                           <input 
                             required
                             placeholder="ck_..."
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white focus:border-blue-500 transition-all outline-none"
                             value={editSiteData.consumerKey || ''}
                             onChange={e => setEditSiteData({...editSiteData, consumerKey: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Secret Client (Consumer Secret)</label>
                           <input 
                             required
                             type="password"
                             placeholder="cs_..."
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white focus:border-blue-500 transition-all outline-none"
                             value={editSiteData.consumerSecret || ''}
                             onChange={e => setEditSiteData({...editSiteData, consumerSecret: e.target.value})}
                           />
                        </div>
                      </>
                    )}

                   {error && (
                     <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                     </div>
                   )}

                    <div className="space-y-2 pb-4 border-t border-white/5 pt-4 relative">
                       <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-1 italic">
                         {isAdminUser ? "Clé API Gemini Master (Exploitation Système)" : "Clé API Gemini Personnelle (STRICTEMENT REQUISE)"}
                       </label>
                       <input 
                         required={!isAdminUser}
                         placeholder={isAdminUser ? "Activé par défaut pour Administrateur" : "Entrez votre clé API Gemini"}
                         className={cn(
                            "w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black focus:border-blue-500 transition-all outline-none",
                            isAdminUser ? "text-emerald-500/50 italic" : "text-blue-400"
                          )}
                         value={editSiteData.geminiApiKey || ''}
                         onChange={e => setEditSiteData({...editSiteData, geminiApiKey: e.target.value})}
                       />
                       <button 
                         type="button"
                         onClick={() => handleTestGemini(editSiteData.geminiApiKey)}
                         disabled={isTestingGemini}
                         className={cn(
                           "absolute right-2 top-11 px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all h-10 mt-1 mr-1",
                           geminiStatus === 'success' ? "bg-emerald-500 text-white" : 
                           geminiStatus === 'error' ? "bg-red-500 text-white" : 
                           "bg-white/10 text-slate-400 hover:bg-white/20"
                         )}
                       >
                         {isTestingGemini ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                          geminiStatus === 'success' ? "VALIDE ✓" : 
                          geminiStatus === 'error' ? "ERREUR ✗" : "TESTER"}
                       </button>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic pl-1 mt-1">
                         {isAdminUser 
                            ? "Utilisation automatique de la clé Nexus Cloud." 
                            : "Essentiel pour l'IA. Préférez la clé "} 
                         {!isAdminUser && (
                           <>
                             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 underline hover:text-blue-400">Gratuite</a>
                             <span> (Frais dérisoires si payant).</span>
                           </>
                         )}
                       </p>
                    </div>

                   <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={isTesting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[11px] rounded-xl transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 group"
                      >
                         {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                           <>
                             Mettre à jour les accès
                             <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                           </>
                         )}
                      </button>
                   </div>
                </form>
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Script telemetry setup guide modal popup */}
      <AnimatePresence>
        {showScriptPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-950 border border-blue-500/30 rounded-[2.5rem] max-w-xl w-full p-8 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-in fade-in zoom-in-95 duration-300"
            >
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

              <button 
                onClick={() => setShowScriptPopup(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter col-span-full">
                    SITE WORDPRESS AJOUTÉ AVEC SUCCÈS !
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Félicitations, l'environnement est configuré
                  </p>
                </div>

                <div className="space-y-4 text-left bg-slate-900/50 p-6 rounded-2xl border border-white/5 w-full font-sans">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center text-xs font-black shrink-0 font-mono">1</span>
                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wide leading-relaxed">
                      Dirigez-vous vers la section <span className="text-blue-400 font-extrabold text-xs">"Gestion Clientèle WP"</span> (dans le menu latéral à gauche) pour récupérer votre script de télémétrie JS.
                    </p>
                  </div>

                  <div className="flex gap-3 border-t border-white/5 pt-4">
                    <span className="w-5 h-5 bg-purple-600/20 text-purple-400 rounded-lg flex items-center justify-center text-xs font-black shrink-0 font-mono font-bold">2</span>
                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wide leading-relaxed">
                      💡 <span className="text-purple-400 font-black">CONSEIL DE CONFIGURATION :</span> Nous vous conseillons vivement d'utiliser l'extension gratuite WordPress <span className="text-white font-extrabold">WPCode</span> (anciennement "Insert Headers and Footers") pour insérer facilement votre script JS de télémétrie dans le Header de votre site.
                    </p>
                  </div>

                  <div className="flex gap-3 border-t border-white/5 pt-4">
                    <span className="w-5 h-5 bg-amber-600/20 text-amber-400 rounded-lg flex items-center justify-center text-xs font-black shrink-0 font-mono font-bold">3</span>
                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wide leading-relaxed">
                      🔑 <span className="text-amber-400 font-black">CLÉ API GEMINI :</span> N'oubliez pas d'indiquer votre clé API Gemini. Vous pouvez l'obtenir entièrement gratuitement ici : 
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 underline mt-1 font-black"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        OBTENIR MA CLÉ GEMINI GRATUITE ↗
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                  <button
                    onClick={() => {
                      setShowScriptPopup(false);
                      if (setActiveTab) {
                        setActiveTab('wp-crm');
                      }
                    }}
                    className="flex-1 px-6 py-4 bg-white hover:bg-slate-200 text-black font-black uppercase tracking-widest text-[11px] rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group active:scale-95"
                  >
                    Aller au script d'intégration
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setShowScriptPopup(false)}
                    className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 hover:border-white/10 font-black uppercase tracking-widest text-[11px] rounded-xl transition-all active:scale-95"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InstructionStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex-1 space-y-4">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 text-white italic font-black text-xl rounded-full flex items-center justify-center shrink-0">
             {number}
          </div>
          <h5 className="font-black text-white uppercase italic tracking-tighter leading-none">{title}</h5>
       </div>
       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
          {desc}
       </p>
    </div>
  );
}

function SimpleStep({ number, title }: { number: string, title: string }) {
  return (
    <div className="flex items-center gap-4">
       <div className="w-10 h-10 bg-blue-600/20 text-blue-500 italic font-black text-lg rounded-xl flex items-center justify-center border border-blue-500/20">
          {number}
       </div>
       <div>
          <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1 italic">{title}</h5>
          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Configuration requise</p>
       </div>
    </div>
  );
}
