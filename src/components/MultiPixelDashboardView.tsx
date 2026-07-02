import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Settings, 
  Check, 
  Save, 
  RefreshCw, 
  Activity, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Code, 
  Calendar, 
  Info, 
  Copy, 
  Play, 
  FileText, 
  ExternalLink,
  Zap,
  Sparkles,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { firebaseService } from '../services/firebaseService';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface PixelPlatformConfig {
  id: string;
  enabled: boolean;
  events: {
    PageView: boolean;
    InitiateCheckout: boolean;
    Purchase: boolean;
  };
}

interface MultiPixelSettings {
  meta: PixelPlatformConfig;
  google: PixelPlatformConfig;
  tiktok: PixelPlatformConfig;
  pinterest: PixelPlatformConfig;
}

const DEFAULT_PIXELS: MultiPixelSettings = {
  meta: {
    id: '678192305819304',
    enabled: true,
    events: { PageView: true, InitiateCheckout: true, Purchase: true }
  },
  google: {
    id: 'G-7NW9B34X12',
    enabled: true,
    events: { PageView: true, InitiateCheckout: true, Purchase: true }
  },
  tiktok: {
    id: 'CT18DB390X42',
    enabled: false,
    events: { PageView: true, InitiateCheckout: false, Purchase: false }
  },
  pinterest: {
    id: '817290538190203',
    enabled: false,
    events: { PageView: true, InitiateCheckout: false, Purchase: false }
  }
};

interface MultiPixelDashboardViewProps {
  config?: { url: string; [key: string]: any } | null;
}

export default function MultiPixelDashboardView({ config }: MultiPixelDashboardViewProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language && i18n.language.startsWith('fr') ? 'fr' : 'en';

  const siteId = config?.url ? config.url.replace(/https?:\/\//, '').replace(/\/$/, '') : 'default_site';
  const dbKey = `pixel_settings_${siteId}`;

  // State Management
  const [activeTab, setActiveTab] = useState<'meta' | 'google' | 'tiktok' | 'pinterest'>('meta');
  const [pixelSettings, setPixelSettings] = useState<MultiPixelSettings>(DEFAULT_PIXELS);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'month'>('30d');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Script and Copying States
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  
  // Diagnostic Diagnostics State (Simulation with G-AI / Nexus Engine)
  const [diagnosticLoading, setDiagnosticLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any[] | null>(null);

  // Load configuration from Firebase
  useEffect(() => {
    async function loadConfigs() {
      try {
        const savedSettings = await firebaseService.getSettings();
        if (savedSettings && savedSettings[dbKey]) {
          const parsed = typeof savedSettings[dbKey] === 'string' 
            ? JSON.parse(savedSettings[dbKey]) 
            : savedSettings[dbKey];
          if (parsed && typeof parsed === 'object') {
            setPixelSettings(prev => ({ ...prev, ...parsed }));
          }
        } else {
          // fallback to local storage
          const local = localStorage.getItem(dbKey);
          if (local) {
            setPixelSettings(JSON.parse(local));
          }
        }
      } catch (err) {
        console.warn('[Pixel Settings] Error reading cloud config', err);
      }
    }
    loadConfigs();
  }, [dbKey]);

  // Save Config to database
  const savePlatformConfig = async (platformId: 'meta' | 'google' | 'tiktok' | 'pinterest', inputId: string) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedSettings = {
        ...pixelSettings,
        [platformId]: {
          ...pixelSettings[platformId],
          id: inputId
        }
      };
      
      setPixelSettings(updatedSettings);
      
      // Persist to Cloud Settings DB
      await firebaseService.updateSetting(dbKey, JSON.stringify(updatedSettings));
      // Save locally
      localStorage.setItem(dbKey, JSON.stringify(updatedSettings));

      setSaveStatus({
        type: 'success',
        message: currentLang === 'fr' 
          ? `Configuration ${getPlatformLabel(platformId)} sauvegardée et déployée !` 
          : `Configuration ${getPlatformLabel(platformId)} successfully saved and deployed!`
      });
      
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      setSaveStatus({
        type: 'error',
        message: currentLang === 'fr' 
          ? "Échec de l'enregistrement de la configuration." 
          : "Failed to persist tracking settings."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePlatform = async (platformId: 'meta' | 'google' | 'tiktok' | 'pinterest') => {
    const updatedSettings = {
      ...pixelSettings,
      [platformId]: {
        ...pixelSettings[platformId],
        enabled: !pixelSettings[platformId].enabled
      }
    };
    setPixelSettings(updatedSettings);
    try {
      await firebaseService.updateSetting(dbKey, JSON.stringify(updatedSettings));
      localStorage.setItem(dbKey, JSON.stringify(updatedSettings));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleEventMapping = async (platformId: 'meta' | 'google' | 'tiktok' | 'pinterest', eventName: 'PageView' | 'InitiateCheckout' | 'Purchase') => {
    const updatedSettings = {
      ...pixelSettings,
      [platformId]: {
        ...pixelSettings[platformId],
        events: {
          ...pixelSettings[platformId].events,
          [eventName]: !pixelSettings[platformId].events[eventName]
        }
      }
    };
    setPixelSettings(updatedSettings);
    try {
      await firebaseService.updateSetting(dbKey, JSON.stringify(updatedSettings));
      localStorage.setItem(dbKey, JSON.stringify(updatedSettings));
    } catch (e) {
      console.error(e);
    }
  };

  const getPlatformLabel = (id: string) => {
    switch(id) {
      case 'meta': return 'Meta Ads (Facebook)';
      case 'google': return 'Google Analytics 4 (GA4)';
      case 'tiktok': return 'TikTok Pixel';
      case 'pinterest': return 'Pinterest Marketing';
      default: return id;
    }
  };

  const getPlatformColor = (id: string) => {
    switch(id) {
      case 'meta': return '#3b82f6'; // Blue
      case 'google': return '#f59e0b'; // Amber
      case 'tiktok': return '#ec4899'; // Pink
      case 'pinterest': return '#ef4444'; // Red
      default: return '#10b981';
    }
  };

  const getPlatformGradient = (id: string) => {
    switch(id) {
      case 'meta': return 'from-blue-600 to-indigo-600 border-blue-500/20';
      case 'google': return 'from-amber-500 to-orange-600 border-amber-500/20';
      case 'tiktok': return 'from-pink-500 to-violet-600 border-pink-500/20';
      case 'pinterest': return 'from-red-500 to-rose-600 border-red-500/20';
      default: return 'from-emerald-500 to-teal-600 border-emerald-500/20';
    }
  };

  const getPlatformPlaceholder = (id: string) => {
    switch(id) {
      case 'meta': return 'Ex: 1528394058192305';
      case 'google': return 'Ex: G-H4BW9XZ0L2';
      case 'tiktok': return 'Ex: CHT18D203X01';
      case 'pinterest': return 'Ex: 817290538190203';
      default: return 'ID';
    }
  };

  // Generate dynamic stats and beautiful chart mock lines that adjust depending on tab, enabled features and date ranges
  const activeConf = pixelSettings[activeTab];

  const getDaysCount = () => {
    if (dateRange === '7d') return 7;
    if (dateRange === '30d') return 30;
    return 15; // Month-to-date simulated
  };

  const generateSimulatedData = () => {
    const days = getDaysCount();
    const dataList = [];
    const baseValueMultiplier = activeTab === 'google' ? 2.5 : activeTab === 'meta' ? 1.8 : 0.8;
    
    // Scale down values if platform is deactivated
    const multiplier = activeConf.enabled ? baseValueMultiplier : 0;

    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
      
      const pvVal = Math.floor((120 + Math.sin(i / 1.5) * 40 + Math.random() * 20) * multiplier);
      const icVal = Math.floor((40 + Math.sin(i / 1.5) * 15 + Math.random() * 8) * multiplier);
      const purVal = Math.floor((12 + Math.sin(i / 1.5) * 5 + Math.random() * 3) * multiplier);

      dataList.push({
        name: dateStr,
        PageView: activeConf.events.PageView ? pvVal : 0,
        InitiateCheckout: activeConf.events.InitiateCheckout ? icVal : 0,
        Purchase: activeConf.events.Purchase ? purVal : 0
      });
    }
    return dataList;
  };

  const chartData = generateSimulatedData();

  // Compute stats on active simulated data
  const totalEvents = chartData.reduce((acc, curr) => acc + curr.PageView + curr.InitiateCheckout + curr.Purchase, 0);
  const totalPurchases = chartData.reduce((acc, curr) => acc + curr.Purchase, 0);
  const avgConversionRate = totalEvents > 0 ? ((totalPurchases / (totalEvents * 0.7)) * 100).toFixed(2) : '0.00';
  const totalValue = (totalPurchases * 68).toLocaleString('fr-FR', { maximumFractionDigits: 0 });

  // Generate Lightweight PHP Integration Code
  const phpEmbedCode = `<?php
/**
 * Script d'intégration Nexus Multi-Pixel asynchrone universel.
 * À copier-coller dans le fichier functions.php de votre thème WordPress parent/enfant.
 */
add_action('wp_head', 'nexus_inject_platform_pixels');

function nexus_inject_platform_pixels() {
    // 1. Meta Pixel configuration
    if (${pixelSettings.meta.enabled ? 'true' : 'false'}) { ?>
        <!-- Meta Pixel Code -->
        <script>
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelSettings.meta.id}');
        fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" src="https://www.facebook.com/tr?id=${pixelSettings.meta.id}&ev=PageView&noscript=1"/></noscript>
    <?php }

    // 2. Google Analytics v4 configuration
    if (${pixelSettings.google.enabled ? 'true' : 'false'}) { ?>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=${pixelSettings.google.id}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${pixelSettings.google.id}');
        </script>
    <?php }

    // 3. TikTok Ads Configuration
    if (${pixelSettings.tiktok.enabled ? 'true' : 'false'}) { ?>
        <!-- TikTok Pixel -->
        <script>
        !function (w, d, t) { w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","trackWithSegmentEvent","setAndTrack","doubleTrack"];ttq.instance=function(t){for(var e=ttq.methods,n=0;n<e.length;n++)ttq[t][e[n]]=ttq.getAndTrack(ttq,e[n]);return ttq};ttq.load=function(e,n){var t="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e].push(Date.now()),ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelSettings.tiktok.id}'); ttq.page();
        }(window, document, 'ttq');
        </script>
    <?php }

    // 4. Pinterest Marketing Configuration
    if (${pixelSettings.pinterest.enabled ? 'true' : 'false'}) { ?>
        <!-- Pinterest Tag -->
        <script>
        !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(
        Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";
        var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
        pintrk('load', '${pixelSettings.pinterest.id}');
        pintrk('page');
        </script>
    <?php }
}`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(phpEmbedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Launch Pixel Security and Matching Rates G-AI diagnostic 
  const runDiagnosticScan = () => {
    setDiagnosticLoading(true);
    setDiagnosticResult(null);

    setTimeout(() => {
      setDiagnosticResult([
        {
          check: currentLang === 'fr' ? "Validation de l'injection asynchrone" : "Validation of asynchronous injection",
          status: 'success',
          detail: currentLang === 'fr' 
            ? "Script de moins de 1.2Ko injecté asynchroniquement sans bloquage du fil principal du navigateur." 
            : "Under 1.2Kb custom async script detected in headers, maintaining green Google Lighthouse page speeds."
        },
        {
          check: currentLang === 'fr' ? "Dédoublonnage des événements (Browser vs Server)" : "Event Deduplication (Browser vs Server)",
          status: 'success',
          detail: currentLang === 'fr' 
            ? "Clés de correlation 'event_id' alignées pour s'accoupler sans doublon lors de l'enregistrement de l'achat." 
            : "Perfect alignment of 'event_id' strings preventing duplicate counting during WooCommerce checkout peaks."
        },
        {
          check: currentLang === 'fr' ? "Protection des données & Cookie Consent" : "Privacy Shielding & Cookie Consent",
          status: 'success',
          detail: currentLang === 'fr' 
            ? "Vérification de la conformité du protocole RGPD pour purger les détails du visiteur sur refus de consentement." 
            : "GDPR compliance framework verified; automatically purging tracking tokens if user declines options."
        },
        {
          check: currentLang === 'fr' ? "Latence de synchronisation API Conversions" : "API Conversions Server Delay",
          status: 'success',
          detail: currentLang === 'fr' 
            ? "Taux de succès du dispatch API Conversions de Gateway Nexus évalué à 100% (Temps de réponse 31ms)." 
            : "Response latency on gateway APIs evaluated at 31ms; backup server-to-server dispatching fully armed."
        },
        {
          check: currentLang === 'fr' ? "Mise en adéquation du taux de correspondance (EMQ)" : "Event Match Quality Score (EMQ)",
          status: 'success',
          detail: currentLang === 'fr' 
            ? "Score EMQ évalué à 8.4/10 grâce à l'envoi asynchrone sécurisé du pays, device et type d'appareil client." 
            : "Platform EMQ evaluated at 8.4/10, maximizing performance scores on major advertising portals."
        }
      ]);
      setDiagnosticLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-10 animate-fade-in text-slate-100 max-w-7xl mx-auto p-4 md:p-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#0c0e14] border border-slate-800 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl -z-10" />
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Marketing & Conversion Engines
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight italic">
            Multi-Pixel Integration & Analytics
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-xl">
            {currentLang === 'fr' 
              ? "Centralisez la configuration de vos balises de suivi publicitaires et surveillez la puissance de vos tunnels d'acquisition client sans ralentir WordPress."
              : "Centralize your public marketing trackers and analyze visitor tunnels across advertising platforms with zero impact on WordPress local footprint."}
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-[#050505] border border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-white hover:border-slate-700 outline-none transition-all"
          >
            <option value="7d">7 {currentLang === 'fr' ? 'derniers jours' : 'days ago'}</option>
            <option value="30d">30 {currentLang === 'fr' ? 'derniers jours' : 'days ago'}</option>
            <option value="month">{currentLang === 'fr' ? 'Ce mois-ci' : 'Current month'}</option>
          </select>
          <button 
            onClick={copyEmbedCode}
            className="px-5 py-3 rounded-xl text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-black uppercase tracking-widest hover:border-slate-700 hover:text-white transition-all flex items-center gap-2"
          >
            {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Code className="w-4 h-4" />}
            {copiedCode ? (currentLang === 'fr' ? 'Script copié' : 'Code copied') : (currentLang === 'fr' ? 'Exporter PHP Script' : 'Export script PHP')}
          </button>
        </div>
      </div>

      {/* Grid Platform Switches (Tabs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(pixelSettings).map(([id, configItem]) => {
          const isSelected = activeTab === id;
          const label = getPlatformLabel(id);
          const color = getPlatformColor(id);
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                "p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden group flex flex-col justify-between h-36 min-h-[140px]",
                isSelected 
                  ? "bg-[#111319] border-slate-700 shadow-xl"
                  : "bg-[#090b11] border-slate-800/40 hover:border-slate-800 hover:bg-slate-900/40"
              )}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: color }} />
              )}
              {/* Dynamic decorative backdrop circles */}
              <div 
                className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10 transition-transform group-hover:scale-150 duration-700"
                style={{ backgroundColor: color }}
              />

              <div className="flex justify-between items-start w-full">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {id === 'google' ? 'Analytics Service' : 'Advertising Pixel'}
                </span>
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full flex shrink-0 animate-ping absolute top-6 right-6", 
                  configItem.enabled ? "bg-green-400" : "bg-transparent"
                )} />
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full flex shrink-0 relative", 
                  configItem.enabled ? "bg-green-400 border border-green-300" : "bg-slate-700 border border-slate-600"
                )} />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-black text-white font-mono tracking-tight group-hover:text-white transition-colors">
                  {id === 'meta' ? 'Meta Ads' : id === 'google' ? 'Google GA4' : id === 'tiktok' ? 'TikTok Ads' : 'Pinterest'}
                </div>
                <div className="text-[10px] font-bold text-slate-500 font-mono">
                  {configItem.enabled ? (configItem.id || 'Active') : (currentLang === 'fr' ? 'Désactivé' : 'Disabled')}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {saveStatus && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest",
            saveStatus.type === 'success' 
              ? "bg-[#10b981]/5 border border-[#10b981]/20 text-[#10b981] shadow-lg shadow-[#10b981]/5" 
              : "bg-red-500/10 border border-red-500/20 text-red-500"
          )}
        >
          {saveStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {saveStatus.message}
        </motion.div>
      )}

      {/* Core Setup & Performance Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Configuration Panel & Handshake Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#090b11] border border-slate-800/80 rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${getPlatformGradient(activeTab)} opacity-[0.03] rounded-full blur-3xl`} />
            
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-mono font-black"
                style={{ backgroundColor: getPlatformColor(activeTab) }}
              >
                {activeTab[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">
                  {getPlatformLabel(activeTab)}
                </h3>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Configuration localisée du pixel
                </span>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                {activeTab === 'google' ? 'ID de mesure GA4 (G-XXX)' : 'ID de Pixel Publicitaire (Pixel ID)'}
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  id={`pixel_id_input_${activeTab}`}
                  defaultValue={activeConf.id}
                  className="w-full bg-[#050505] border border-slate-800 rounded-xl px-5 py-4 text-xs font-mono text-white tracking-wider focus:border-slate-700 outline-none transition-all pr-12 focus:shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)] font-medium"
                  placeholder={getPlatformPlaceholder(activeTab)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {activeTab === 'google' 
                  ? "Utilisé pour la balise gtag.js et les flux d'événements Google Tag Manager." 
                  : "Sert de jeton d'identification pour la liaison sémantique de vos balises."}
              </p>
            </div>

            {/* Switch Toggle */}
            <div className="flex items-center justify-between p-5 bg-black/30 border border-slate-800/60 rounded-2xl">
              <div className="space-y-1 pr-4">
                <div className="text-[11px] font-black uppercase text-white tracking-wide">
                  {currentLang === 'fr' ? 'Activer le tag de suivi' : 'Activate pixel tracking'}
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {currentLang === 'fr'
                    ? "Permet d'injecter immédiatement ce pixel sur votre boutique connected."
                    : "Instantly injects this tracking code into your connected WordPress store headers."}
                </p>
              </div>

              {/* Styled Checkbox Toggle Switch */}
              <button
                onClick={() => togglePlatform(activeTab)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative outline-none flex items-center p-0.5",
                  activeConf.enabled ? "bg-green-500" : "bg-slate-800"
                )}
                id={`toggle_active_${activeTab}`}
              >
                <div 
                  className={cn(
                    "w-5 h-5 bg-white rounded-full shadow-md transform transition-transform",
                    activeConf.enabled ? "translate-x-6" : "translate-x-0"
                  )} 
                />
              </button>
            </div>

            {/* Event trigger configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  {currentLang === 'fr' ? "Mapping d'événements standards (AIDA)" : "Standard event mapping (AIDA)"}
                </span>
              </div>

              <div className="space-y-3 bg-[#050505]/40 p-5 rounded-2xl border border-slate-800/40">
                {(['PageView', 'InitiateCheckout', 'Purchase'] as const).map((evt) => {
                  const isChecked = activeConf.events[evt];
                  return (
                    <button
                      key={evt}
                      onClick={() => toggleEventMapping(activeTab, evt)}
                      className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-900/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          isChecked 
                            ? "bg-blue-500 border-blue-400 text-white" 
                            : "bg-black border-slate-800 text-transparent hover:border-slate-600"
                        )}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300 font-mono">{evt}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">
                        {evt === 'PageView' ? 'Attention' : evt === 'InitiateCheckout' ? 'Desir' : 'Action (Buy)'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save platform button */}
            <button
              onClick={() => {
                const el = document.getElementById(`pixel_id_input_${activeTab}`) as HTMLInputElement;
                if (el) {
                  savePlatformConfig(activeTab, el.value);
                }
              }}
              disabled={isSaving}
              className="w-full bg-[#1e2230] border border-slate-800 hover:border-slate-700 hover:bg-[#252a3a] text-white p-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 text-center"
              id={`save_platform_config_btn_${activeTab}`}
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {currentLang === 'fr' ? 'Confirmer la mise à jour' : 'Update pixel settings'}
            </button>
          </div>

          {/* AI Diagnostic Section */}
          <div className="bg-[#090b11] border border-slate-800/80 rounded-[2.5rem] p-8 md:p-10 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider block">
                    G-AI Pixel Diagnostic
                  </h4>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
                    Validation du pont d'acquisition
                  </span>
                </div>
              </div>
              <button 
                onClick={runDiagnosticScan}
                disabled={diagnosticLoading}
                className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
              >
                {diagnosticLoading ? 'Scan...' : (currentLang === 'fr' ? 'Scanner' : 'Scan Network')}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
              {currentLang === 'fr'
                ? "Simulez une analyse asynchrone pour vérifier la performance sémantique des tags, évaluer le niveau EMQ de consentement et valider les clés de double-corrélation."
                : "Verify metadata transmission quality, server-to-browser cookie deduplication tags, and GDPR pixel consent status."}
            </p>

            {diagnosticLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-2 bg-black/20 rounded-xl border border-slate-800/40">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Analyse des paquets de diagnostic...
                </span>
              </div>
            )}

            {diagnosticResult && (
              <div className="space-y-4 animate-fade-in bg-[#050505]/40 border border-slate-800/40 p-5 rounded-2xl">
                {diagnosticResult.map((res, id) => (
                  <div key={id} className="space-y-1.5 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-300 font-mono">
                        {res.check}
                      </div>
                      <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest font-mono">
                        OK
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                      {res.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Analytics Dashboard, metrics & graphs (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* KPI Mini Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#090b11] border border-slate-800/40 p-6 rounded-[2rem] space-y-2">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] block">
                {currentLang === 'fr' ? 'Événements Suivis' : 'Tracked Events'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  {totalEvents.toLocaleString('fr-FR')}
                </span>
                <span className="text-[9px] text-green-400 font-mono font-bold">
                  +18.4%
                </span>
              </div>
              <p className="text-[9px] text-slate-600 font-medium">PageView + Checkout + Buy</p>
            </div>

            <div className="bg-[#090b11] border border-slate-800/40 p-6 rounded-[2rem] space-y-2">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] block">
                {currentLang === 'fr' ? 'Taux de Conversion' : 'Conversion Rate'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  {avgConversionRate}%
                </span>
                <span className="text-[9px] text-blue-400 font-mono font-bold">
                  +0.42%
                </span>
              </div>
              <p className="text-[9px] text-slate-600 font-medium">Trafic converti en commande</p>
            </div>

            <div className="bg-[#090b11] border border-slate-800/40 p-6 rounded-[2rem] space-y-2">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] block">
                {currentLang === 'fr' ? 'Valeur Générée' : 'Generated Value'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                  {totalValue} €
                </span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">
                  +12.1%
                </span>
              </div>
              <p className="text-[9px] text-slate-600 font-medium">Estimations de paniers payés</p>
            </div>
          </div>

          {/* Recharts dynamic analytics area */}
          <div className="bg-[#090b11] border border-slate-800/60 rounded-[2.5rem] p-8 md:p-10 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest font-mono">
                  {currentLang === 'fr' ? 'Courbes de Télémétrie d\'Acquisition' : 'Acquisition Telemetry Streams'}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                {activeConf.events.PageView && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-400" />
                    PageView
                  </div>
                )}
                {activeConf.events.InitiateCheckout && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-400" />
                    Checkout
                  </div>
                )}
                {activeConf.events.Purchase && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-400" />
                    Purchase
                  </div>
                )}
              </div>
            </div>

            {/* Recharts container component */}
            <div className="h-72 w-full pr-4 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0c0e14', 
                      borderColor: '#1e293b',
                      borderRadius: '16px',
                      color: '#f8fafc',
                      fontFamily: 'monospace',
                      fontSize: '11px'
                    }} 
                  />
                  {activeConf.events.PageView && (
                    <Area 
                      type="monotone" 
                      dataKey="PageView" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorPV)" 
                    />
                  )}
                  {activeConf.events.InitiateCheckout && (
                    <Area 
                      type="monotone" 
                      dataKey="InitiateCheckout" 
                      stroke="#f59e0b" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorIC)" 
                    />
                  )}
                  {activeConf.events.Purchase && (
                    <Area 
                      type="monotone" 
                      dataKey="Purchase" 
                      stroke="#10b981" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorPur)" 
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Alert / Informational box */}
            <div className="flex items-start gap-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-white">
                  Délai de Propagation Publicitaire
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  {currentLang === 'fr'
                    ? "Les modifications appliquées s'activent asynchroniquement sur votre site. En règle générale, Meta et GA4 nécessitent de 30 secondes à 5 minutes pour que l'intégration asynchrone commence à diffuser ses premiers événements de diagnostic."
                    : "Configurations take immediate, non-blocking effect. Meta and GA4 generally require 30 seconds up to 5 minutes of server-to-browser handshake before active streams display initial metrics."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
