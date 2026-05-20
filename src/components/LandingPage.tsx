import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Monitor, 
  ArrowRight, 
  Globe, 
  CheckCircle2, 
  Rocket,
  Lock,
  Search,
  MessageSquare,
  Star,
  Database,
  Layout,
  Crown,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeJsonParse } from '../lib/utils';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import { firebaseService } from '../services/firebaseService';
import ComparisonTable from './ComparisonTable';
import { DEFAULT_NEXUS_CONFIG } from '../constants';

const FALLBACK_PLANS = [
  { id: 'trial', name: 'Test Vision', price: 0, site_limit: 1, description: 'Testez toutes les fonctionnalités pendant 60 minutes' },
  { id: 'starter', name: 'Starter Protocol', price: 29, site_limit: 1, description: 'Gestion d\'un seul site WordPress' },
  { id: 'pro', name: 'Pro Nexus', price: 79, site_limit: 5, description: 'Gestion jusqu\'à 5 sites WordPress' },
  { id: 'elite', name: 'Elite Vision', price: 199, site_limit: 12, description: 'Gestion jusqu\'à 12 sites WordPress' }
];

export default function LandingPage({ 
  onSelectPlan, 
  lang, 
  onLangChange,
  externalPlans,
  settings
}: { 
  onSelectPlan: (planId: string) => void,
  lang: 'fr' | 'en',
  onLangChange: (lang: 'fr' | 'en') => void,
  externalPlans?: any[],
  settings?: any
}) {
  const [plans, setPlans] = useState<any[]>(FALLBACK_PLANS);
  const [matrixConfig, setMatrixConfig] = useState<any>(DEFAULT_NEXUS_CONFIG);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'terms'>('home');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [annualDiscount, setAnnualDiscount] = useState(20);

  useEffect(() => {
    const syncData = async () => {
      try {
        const plansSource = (externalPlans && externalPlans.length > 0) 
          ? externalPlans 
          : await firebaseService.getPlans();
        
        const settingsSource = (settings && Object.keys(settings).length > 0)
          ? settings
          : await firebaseService.getSettings();

        const configRaw = settingsSource?.['nexus_matrix_config'];
        let matrixData = configRaw ? (typeof configRaw === 'string' ? safeJsonParse(configRaw, DEFAULT_NEXUS_CONFIG) : configRaw) : DEFAULT_NEXUS_CONFIG;
        
        // Validation: if categories or packs are missing, use defaults
        if (!matrixData?.categories || !matrixData?.packs) {
          matrixData = DEFAULT_NEXUS_CONFIG;
        }

        setMatrixConfig(matrixData);

        const getFeaturesForPack = (packId: string, defaultFeatures: string[]) => {
          if (!matrixData?.packs?.[packId]) return defaultFeatures;
          const activeIds = matrixData.packs[packId].activeFeatures || [];
          if (!Array.isArray(activeIds) || activeIds.length === 0) return defaultFeatures;
          
          const mapped = activeIds.map((id: string) => {
            // New categorized lookup
            let label = id;
            matrixData.categories?.some((cat: any) => {
              const feat = cat.features?.find((f: any) => f.id === id);
              if (feat) {
                label = feat.label;
                return true;
              }
              return false;
            });
            return label;
          }).filter(Boolean);

          return mapped.length > 0 ? mapped : defaultFeatures;
        };

        const plansToSync = (Array.isArray(plansSource) && plansSource.length > 0) ? plansSource : FALLBACK_PLANS;
        
        const syncedPlans = plansToSync.map(plan => {
          const planId = String(plan.id).toLowerCase();
          const matrixPack = matrixData?.packs?.[planId === 'trial' ? 'test' : planId];
          
          if (matrixPack) {
            return {
              ...plan,
              name: matrixPack.name || plan.name,
              price: matrixPack.price ? parseInt(String(matrixPack.price).replace(/[^0-9]/g, '')) : plan.price,
              features: getFeaturesForPack(planId === 'trial' ? 'test' : planId, plan.features || [])
            };
          }
          return plan;
        });

        const sorted = [...syncedPlans].sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        setPlans(sorted);
        
        if (settingsSource?.['annual_discount_percentage']) {
          setAnnualDiscount(Number(settingsSource['annual_discount_percentage']));
        }
      } catch (err) {
        console.error('[Landing] Failed to sync data', err);
      }
    };

    syncData();
  }, [externalPlans, settings]);

  useEffect(() => {
    if (!lang) return;
    firebaseService.getTranslations(lang)
      .then(data => {
        if (data) setTranslations(data);
      })
      .catch(err => console.error('Failed to fetch translations', err));
  }, [lang]);

  const t = (key: string, fallback: string) => {
    if (translations[key]) return translations[key];
    
    // Custom fallbacks for EN if translation is missing in DB
    if (lang === 'en') {
      switch(key) {
        case 'hero_title_1': return 'DOMINATE';
        case 'hero_title_2': return 'AT AI SPEED.';
        case 'hero_subtitle': return 'Scale your productivity 10x. WP_AGENT.AI analyzes, optimizes, and manages your WooCommerce stores autonomously with surgical precision.';
        case 'cta_start': return 'START NOW';
        case 'learn_more': return 'LEARN MORE';
        case 'about_vision': return 'OUR VISION';
        case 'about_quote': return '"We created WP_AGENT.AI to free entrepreneurs from repetitive tasks and let them focus on what really matters: growth."';
        case 'popular': return 'POPULAR';
        case 'per_month': return 'MONTH';
        case 'wordpress_sites': return 'WORDPRESS SITES';
        case 'nexus_protocol_access': return 'AI PROTOCOL ACCESS';
        case 'priority_support': return '24/7 PRIORITY SUPPORT';
        case 'activate_now': return 'ACTIVATE NOW';
        case 'activate_trial': return 'ACTIVATE TRIAL';
        case 'session_60_min': return '60 MIN SESSION';
        case 'trial_title': return 'TRY THE VISION FOR FREE.';
        case 'about_heading_1': return 'INTELLIGENCE';
        case 'about_heading_2': return 'AT THE SERVICE';
        case 'about_heading_3': return 'OF COMMERCE.';
        case 'features_title': return 'OUR CUTTING-EDGE TECHNOLOGIES';
        case 'pricing_title': return 'NEXUS PACKS';
        case 'about_vision_heading': return 'OUR VISION';
        case 'about_vision_subtitle': return 'INTELLIGENCE AT THE SERVICE OF COMMERCE.';
        case 'features': return 'FEATURES';
        case 'pricing': return 'PRICING';
        case 'about': return 'ABOUT';
        case 'legal': return 'LEGAL';
        case 'product': return 'PRODUCT';
        case 'privacy': return 'PRIVACY';
        case 'terms': return 'TERMS';
        default: return fallback;
      }
    }
    return fallback;
  };

  if (currentView === 'privacy') return <PrivacyPolicy onBack={() => { setCurrentView('home'); window.scrollTo(0,0); }} />;
  if (currentView === 'terms') return <TermsOfService onBack={() => { setCurrentView('home'); window.scrollTo(0,0); }} />;

  const paidPlans = plans.filter(p => p.price > 0);
  const trialPlan = plans.find(p => p.id === 'trial' || p.price === 0);

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 100, -50, 0], 
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 50, 0], 
            y: [0, 100, -50, 0],
            scale: [1, 1.1, 1.3, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, 50, -100, 0], 
            y: [0, -100, 50, 0],
            scale: [1, 1.4, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-emerald-600/5 blur-[150px] rounded-full" 
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#02040a]/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center border border-white/20">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
            <span className="text-xl font-display font-black italic uppercase tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">WP_AGENT.AI</span>
          </motion.div>
          
          <div className="hidden lg:flex items-center gap-12">
            <div className="flex gap-10">
              <a href="#features" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-400 transition-colors relative group">
                {t('features', 'FEATURES')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
              </a>
              <a href="#pricing" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-400 transition-colors relative group">
                {t('pricing', 'PRICING')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
              </a>
              <a href="#about" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-400 transition-colors relative group">
                {t('about', 'ABOUT')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
              </a>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
               {['fr', 'en'].map((l) => (
                 <button 
                  key={l}
                  onClick={() => onLangChange(l as any)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black transition-all", 
                    lang === l ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
                  )}
                 >{l.toUpperCase()}</button>
               ))}
            </div>

            <button 
              onClick={() => onSelectPlan('none')}
              className="relative px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white group-hover:bg-indigo-50 transition-colors" />
              <span className="relative text-black group-hover:scale-105 transition-transform inline-block">
                {lang === 'en' ? 'LOGIN' : 'SE CONNECTER'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-60 pb-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl shadow-indigo-500/10"
          >
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>{lang === 'en' ? 'AI SPEED PROTOCOL ACTIVE' : 'PROTOCOLE DE VITESSE IA ACTIF'}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-7xl md:text-9xl lg:text-[140px] font-display font-black italic uppercase tracking-tighter leading-[0.8] mb-16"
          >
            <span className="block">{t('hero_title_1', 'AUTOMATISEZ')}</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent py-4 text-[50px] md:text-[80px] lg:text-[110px]">VOTRE RÉDACTION</span>
            <span className="block text-3xl lg:text-6xl mt-4 opacity-90">{t('hero_title_2', 'ET BOOSTEZ VOTRE SEO À LA VITESSE DE L\'IA.')}</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-20"
          >
            <p className="text-xl md:text-2xl text-slate-300 font-medium tracking-tight leading-relaxed mb-12">
              {t('hero_subtitle', 'L\'agent autonome qui analyse, optimise et gère vos boutiques WooCommerce directement depuis WordPress.')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <button 
                onClick={() => onSelectPlan('none')}
                className="w-full sm:w-auto group relative px-10 py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] overflow-hidden shadow-2xl shadow-emerald-600/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-700 group-hover:scale-105 transition-transform" />
                <span className="relative flex items-center justify-center gap-3">
                  {lang === 'en' ? 'TRY FOR FREE' : 'ESSAYER GRATUITEMENT'} 
                  <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-2" />
                </span>
              </button>

              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                {t('learn_more', 'EN SAVOIR PLUS')}
              </button>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {lang === 'en' ? 'NO CREDIT CARD REQUIRED' : 'PAS DE CARTE BANCAIRE REQUISE'}
            </p>
          </motion.div>

          {/* Social Proof - Logos */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-10 md:gap-20 mb-20"
          >
            <div className="flex items-center gap-2 grayscale brightness-200">
               <Database className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">FIREBASE</span>
            </div>
            <div className="flex items-center gap-2 grayscale brightness-200">
               <Globe className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">GOOGLE CLOUD</span>
            </div>
            <div className="flex items-center gap-2 grayscale brightness-200">
               <Zap className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">GEMINI AI</span>
            </div>
            <div className="flex items-center gap-2 grayscale brightness-200">
               <Monitor className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">WORDPRESS</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 opacity-60"
          >
             <div className="flex -space-x-4">
                {[1,2,3,4,5].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" className="w-10 h-10 rounded-full border-4 border-[#02040a] ring-1 ring-white/10" />
                ))}
             </div>
             <div className="text-left">
                <div className="flex gap-0.5 text-amber-500 mb-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+1,200 UTILISATEURS ACTIFS</span>
             </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-40 px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto border-y border-white/5 py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="text-left">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-6 block">
                {t('about_vision', 'NOTRE VISION')}
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter mb-8 leading-[0.9]">
                {t('about_heading_1', "L'INTELLIGENCE")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">{t('about_heading_2', 'AU SERVICE')}</span> <br />
                {t('about_heading_3', 'DU COMMERCE.')}
              </h2>
            </div>
            <div className="text-left space-y-6">
              <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
                {t('about_quote', '"Nous avons créé WP_AGENT.AI pour libérer les entrepreneurs des tâches répétitives et leur permettre de se concentrer sur ce qui compte vraiment : la croissance."')}
              </p>
              <div className="flex items-center gap-4 pt-8">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/20">
                  <img src="https://i.pravatar.cc/100?img=33" alt="Founder" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-white">ZIED B.</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">FOUNDER & CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-40 px-6 lg:px-8 relative overflow-hidden bg-white/[0.02]">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-6 block">
            {lang === 'en' ? 'WORKFLOW' : 'PROCESSUS'}
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter mb-20">
            {lang === 'en' ? 'HOW IT WORKS.' : 'COMMENT ÇA MARCHE.'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2 hidden md:block" />
            
            {[
              { 
                step: '01', 
                title: lang === 'en' ? 'CONNECT' : 'CONNECTEZ', 
                desc: lang === 'en' ? '1-click installation on your WordPress site via our plugin.' : 'Installation en 1 clic sur votre site WordPress via notre plugin.',
                icon: Zap
              },
              { 
                step: '02', 
                title: lang === 'en' ? 'ANALYZE' : 'ANALYSEZ', 
                desc: lang === 'en' ? 'AI understands your existing content and inventory.' : 'L\'IA comprend votre contenu actuel et votre inventaire.',
                icon: Search
              },
              { 
                step: '03', 
                title: lang === 'en' ? 'GENERATE' : 'GÉNÉREZ', 
                desc: lang === 'en' ? 'Get articles and optimizations in seconds.' : 'Obtenez des articles et des optimisations en quelques secondes.',
                icon: Rocket 
              }
            ].map((s, i) => (
              <div key={i} className="relative group">
                <div className="w-20 h-20 bg-[#0c0e14] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:border-indigo-500/50 transition-all shadow-2xl relative z-10">
                  <s.icon className="w-8 h-8 text-indigo-500" />
                </div>
                <span className="text-[10px] font-black text-slate-600 block mb-2">{s.step}</span>
                <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter mb-4 text-white">{s.title}</h3>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packs - Highlighted Section */}
      <section id="pricing" className="py-32 px-6 lg:px-8 relative bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl text-left">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-4 block">PREMIUM ACCESS</span>
              <h2 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter">
                {lang === 'en' ? 'THE' : 'LES'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">NEXUS</span> {lang === 'en' ? 'PACKS' : 'PACKS'}
              </h2>
            </div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest max-w-sm text-right">
              {lang === 'en' ? 'Secure payment via PayPal. Cancel anytime with zero hidden fees.' : 'Payement sécurisé via PayPal. Annulation à tout moment sans frais cachés.'}
            </p>
          </div>

          {/* Billing Selector */}
          <div className="flex justify-center mb-16 relative z-[70]">
            <div className="bg-[#0c0e14] border border-white/10 p-1.5 rounded-3xl flex items-center relative gap-1 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "relative z-10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  billingCycle === 'monthly' ? "text-white" : "text-slate-500 hover:text-slate-400"
                )}
              >
                {lang === 'en' ? 'Monthly' : 'Mensuel'}
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "relative z-10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  billingCycle === 'yearly' ? "text-white" : "text-slate-500 hover:text-slate-400"
                )}
              >
                {lang === 'en' ? 'Yearly' : 'Annuel'}
                <span className="bg-amber-600/20 text-amber-500 px-2 py-0.5 rounded-lg text-[8px]">-{annualDiscount}%</span>
              </button>
              
              {/* Slider Background */}
              <motion.div 
                className="absolute h-[calc(100%-12px)] bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20"
                initial={false}
                animate={{
                  left: billingCycle === 'monthly' ? 6 : '50%',
                  width: 'calc(50% - 9px)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
            {plans.length > 0 ? plans.map((plan, idx) => {
              const planId = String(plan.id).toLowerCase();
              const isTrial = planId === 'trial' || plan.price === 0;
              const isFeatured = planId === 'pro' || (!isTrial && plans.filter(p => p.price > 0).length >= 2 && plans.indexOf(plan) === 2);
              
              const monthlyPrice = (plan.is_promo && plan.promo_price ? plan.promo_price : plan.price);
              const displayPrice = billingCycle === 'monthly' ? monthlyPrice : Math.floor((monthlyPrice * 12) * (1 - annualDiscount / 100));

              return (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={cn(
                    "group relative p-[1px] rounded-[3rem] transition-all duration-700 w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-2rem)] max-w-sm flex flex-col",
                    isFeatured 
                      ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_30px_100px_-20px_rgba(79,70,229,0.3)] lg:scale-105 z-10" 
                      : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <div className="bg-[#080b12] rounded-[2.95rem] p-10 h-full flex flex-col items-center">
                    {((isFeatured || isTrial) || (billingCycle === 'yearly' && !isTrial)) && (
                      <div className={cn(
                        "absolute top-6 right-8 flex items-center gap-2 px-4 py-1.5 rounded-full",
                        isTrial ? "bg-emerald-500" : "bg-indigo-600"
                      )}>
                        {isTrial ? <Sparkles className="w-3 h-3 text-white" /> : <Crown className="w-3 h-3 text-white fill-white" />}
                        <span className="text-[8px] font-black uppercase tracking-widest text-white">
                          {isTrial ? "VISION GRATUITE" : (billingCycle === 'yearly' ? `-${annualDiscount}% OFF` : t('popular', 'POPULAIRE'))}
                        </span>
                      </div>
                    )}

                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative overflow-hidden",
                      isTrial && "bg-emerald-500/10 text-emerald-400",
                      planId === 'starter' && "bg-blue-500/10 text-blue-400",
                      (planId === 'pro' || planId === 'premium' || isFeatured) && "bg-indigo-500/10 text-indigo-400",
                      planId === 'elite' && "bg-purple-500/10 text-purple-400"
                    )}>
                      <div className="absolute inset-0 bg-current opacity-5" />
                      {isTrial && <Sparkles className="w-8 h-8" />}
                      {planId === 'starter' && <Rocket className="w-8 h-8" />}
                      {(planId === 'pro' || planId === 'premium' || isFeatured) && <Zap className="w-8 h-8" />}
                      {planId === 'elite' && <Crown className="w-8 h-8" />}
                    </div>

                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">{plan.name}</h3>
                    
                      <div className="flex flex-col items-center mb-10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-display font-black italic tracking-tighter text-white">
                            {displayPrice}
                          </span>
                          <span className="text-lg font-bold text-slate-600 uppercase">{isTrial ? '' : '$'}</span>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                            / {isTrial ? (
                              (plan.duration_hours >= 1) 
                                ? `${plan.duration_hours} HEURE${plan.duration_hours > 1 ? 'S' : ''}` 
                                : `${(plan.duration_hours || 1) * 60} MIN`
                            ) : (billingCycle === 'monthly' ? t('per_month', 'MOIS') : (lang === 'en' ? 'YEAR' : 'AN'))}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && !isTrial && (
                          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-2">
                            {lang === 'en' ? 'ONLY' : 'SOIT'} {((displayPrice) / 12).toFixed(1)}$ / {t('per_month', 'MOIS')}
                          </p>
                        )}
                      </div>

                      <div className="w-full space-y-3 mb-10">
                        {plan.features?.slice(0, 5).map((feature: string, fIdx: number) => (
                          <div key={fIdx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 opacity-80 text-left">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white truncate">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                    <button 
                      onClick={() => onSelectPlan(plan.id)}
                      className={cn(
                        "w-full py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn mt-auto",
                        isFeatured 
                          ? "bg-white text-black shadow-2xl shadow-white/10" 
                          : (isTrial ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20" : "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20")
                      )}
                    >
                      <div className="absolute inset-0 bg-current opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                      {isTrial ? t('activate_trial', 'ACTIVER L\'ESSAI') : t('activate_now', 'ACTIVER MAINTENANT')}
                    </button>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/10 w-full">
                <p className="text-slate-500 font-black uppercase tracking-widest">
                  {lang === 'en' ? 'Initializing Nexus protocols...' : 'Initialisation des plans Nexus...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section id="comparison" className="py-24 bg-[#0a0a0f] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase tracking-tighter mb-4">
              NEXUS <span className="text-indigo-500">MATRIX</span> ARCHITECTURE
            </h2>
            <div className="w-20 h-1 bg-indigo-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
              Protocoles de privilèges et déploiement IA
            </p>
          </div>
          <ComparisonTable config={matrixConfig || DEFAULT_NEXUS_CONFIG} />
        </div>
      </section>

      {/* Social Proof - Key Figures & Testimonials */}
      <section className="py-40 px-6 lg:px-8 border-y border-white/5 bg-[#02040a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-6 block">
                {lang === 'en' ? 'TRUSTED BY LEADERS' : 'ILS NOUS FONT CONFIANCE'}
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter mb-12">
                {lang === 'en' ? 'PROVEN' : 'PERFORMANCE'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">RESULTS.</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: lang === 'en' ? 'Articles Generated' : 'Articles Générés', value: '+5,200', icon: MessageSquare },
                  { label: lang === 'en' ? 'Time Saved / Week' : 'Gain de Temps / Semaine', value: '+30%', icon: Activity },
                  { label: lang === 'en' ? 'Active Nexus Sites' : 'Sites Nexus Actifs', value: '1,200+', icon: Monitor },
                  { label: lang === 'en' ? 'User Satisfaction' : 'Score Satisfaction', value: '4.9/5', icon: Star },
                ].map((stat, i) => (
                  <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-indigo-500/20 transition-all group">
                    <stat.icon className="w-6 h-6 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-display font-black italic uppercase tracking-tighter text-white mb-2">{stat.value}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {[
                { 
                  name: 'Thomas D.', 
                  role: lang === 'en' ? 'SEO Agency Manager' : 'Directeur Agence SEO', 
                  comment: lang === 'en' ? '"Nexus has literally divided our drafting time by 3. SEO quality is impressive."' : '"Nexus a littéralement divisé par 3 notre temps de rédaction. La qualité SEO est bluffante."' 
                },
                { 
                  name: 'Marie L.', 
                  role: lang === 'en' ? 'E-commerce Owner' : 'Propriétaire E-commerce', 
                  comment: lang === 'en' ? '"Finally an AI that respects WooCommerce taxonomies. A game changer for my 500+ products catalog."' : '"Enfin une IA qui respecte les taxonomies WooCommerce. Un gain de temps monstrueux sur mon catalogue."' 
                },
              ].map((testimonial, i) => (
                <div key={i} className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] relative group hover:bg-indigo-500/10 transition-all">
                  <div className="flex gap-1 mb-6 text-amber-500">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-lg font-medium text-slate-300 italic mb-8 leading-relaxed">
                    {testimonial.comment}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center font-black text-xs">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">{testimonial.name}</p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Grid */}
      <section id="features" className="py-40 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
             <motion.span 
               whileInView={{ opacity: 1 }} 
               initial={{ opacity: 0 }}
               className="text-indigo-500 font-display font-black text-6xl md:text-8xl italic uppercase tracking-tighter opacity-10 mb-[-2rem] block"
             >
               POWERED BY AI
             </motion.span>
             <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter text-white relative z-10">
               {t('features_title', 'NOS TECHNOLOGIES DE POINTE')}
             </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              {[
                { 
                  icon: Database, 
                  title: 'Analyse Corpus Massive', 
                  desc: 'Traitement asynchrone de dizaines de milliers de produits WooCommerce sans ralentir votre serveur.',
                  color: 'blue',
                  log: 'DATABASE_ANALYZER'
                },
                { 
                  icon: Activity, 
                  title: 'Optimisation Stock 2.0', 
                  desc: 'Algorithmes prédictifs qui identifient les ruptures de stock avant qu\'elles n\'apparaissent.',
                  color: 'emerald',
                  log: 'STOCK_PREDICTOR'
                },
                { 
                  icon: Layers, 
                  title: 'Taxonomie Smart-Link', 
                  desc: 'Organisation automatique de vos catégories et tags pour un SEO parfait et une navigation fluide.',
                  color: 'purple',
                  log: 'TAXONOMY_ENGINE'
                },
                {
                  icon: Rocket,
                  title: 'Nexus AutoPilot',
                  desc: 'Automatisation totale des tâches de maintenance et d\'optimisation SEO en tâche de fond.',
                  color: 'amber',
                  log: 'AUTOPILOT_CORE'
                }
              ].map((f, i) => (
                <div 
                  key={i}
                  onMouseEnter={() => setActiveFeature(i)}
                  className={cn(
                    "cursor-pointer p-8 rounded-[2.5rem] border transition-all duration-500",
                    activeFeature === i 
                      ? "bg-white/5 border-white/10 shadow-2xl shadow-indigo-600/5 translate-x-4 scale-105" 
                      : "bg-transparent border-transparent opacity-30 grayscale"
                  )}
                >
                  <div className="flex items-start gap-6">
                     <div className={cn(
                       "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
                       activeFeature === i ? "border-indigo-500/20 bg-indigo-500/10 scale-110 shadow-lg" : "border-white/5 bg-white/5"
                     )}>
                        <f.icon className={cn("w-7 h-7", activeFeature === i ? "text-indigo-400" : "text-slate-500")} />
                     </div>
                     <div className="text-left">
                        <h3 className="text-xl font-display font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
                          {t(`feat_${i+1}_title`, f.title)}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          {t(`feat_${i+1}_desc`, f.desc)}
                        </p>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="aspect-square relative flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                    className="relative w-full max-w-lg aspect-video bg-[#0a0f1d] border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden p-10"
                  >
                    <div className="flex items-center justify-between mb-8 opacity-50">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">SYS_LOG::ACTIVE</span>
                    </div>
                    
                    <div className="space-y-4 font-mono text-[10px] text-indigo-400/80 text-left">
                      <p className="flex items-center gap-3">
                         <span className="text-slate-600 italic">{">"}</span>
                         <span>INITIALIZING <span className="text-white font-bold">{['CORPUS_ANALYZER', 'STOCK_AI_2.0', 'SMART_LINK_V2', 'AUTOPILOT_DAEMON'][activeFeature]}</span>_CORE</span>
                      </p>
                      <p className="flex items-center gap-3">
                         <span className="text-slate-600 italic">{">"}</span>
                         <span>SCANNING REMOTE ASSETS... <span className="text-emerald-400 font-bold">DONE</span></span>
                      </p>
                      <p className="flex items-center gap-3">
                         <span className="text-slate-600 italic">{">"}</span>
                         <span>RUNNING NEURAL HEURISTICS...</span>
                      </p>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden my-4">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '99.8%' }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                        />
                      </div>
                      <p className="text-emerald-400 font-bold flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4" />
                        {`> ANALYSE RÉUSSIE: 99.8% PRÉCISION`}
                      </p>
                    </div>

                    <div className="mt-12 grid grid-cols-3 gap-4 opacity-20">
                       {[1,2,3].map(i => (
                         <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/10" />
                       ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nexus Ecosystem - The "Multi-verse" explanation */}
      <section className="py-40 px-6 lg:px-8 bg-indigo-950/10 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-4 block">WORKSPACE CONTROL</span>
             <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter text-white mb-6">
                NEXUS ECOSYSTEM.
             </h2>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
                Une suite de modules de haute précision conçue pour automatiser chaque recoin de votre flotte WordPress.
             </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Dashboard SEO', icon: Activity },
              { name: 'AutoPilot 2.0', icon: Rocket },
              { name: 'Stock AI', icon: Database },
              { name: 'Internal Link', icon: Layers },
              { name: 'Media Opti', icon: Monitor },
              { name: 'Taxonomy', icon: Layout },
              { name: 'Schema Eng.', icon: Shield },
              { name: 'Multi-Site', icon: Globe },
              { name: 'Vision AI', icon: Sparkles },
              { name: 'Security', icon: Lock },
              { name: 'Maintenance', icon: Zap },
              { name: 'Audit Pro', icon: Search }
            ].map((module, i) => (
              <div key={i} className="p-8 bg-[#0a0c10] border border-white/5 rounded-[2rem] hover:border-indigo-500/30 transition-all flex flex-col items-center gap-4 group">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                  <module.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{module.name}</span>
              </div>
            ))}
          </div>

          {/* Nexus Multi-verse Spotlight */}
          <div className="mt-32 p-16 bg-gradient-to-br from-[#0c0e14] to-indigo-950/20 border border-white/5 rounded-[4rem] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <Crown className="w-40 h-40 text-white" />
             </div>
             <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[8px] font-black uppercase tracking-[0.3em] mb-8">
                   <Crown className="w-3 h-3" />
                   NEXUS MULTI-VERSE PRO EXCLUSIF
                </span>
                <h3 className="text-3xl md:text-5xl font-display font-black italic uppercase tracking-tighter text-white mb-6 leading-none">
                   GESTION MASSIVE POUR <br /> FLOTTES DE 100+ SITES.
                </h3>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed mb-10 max-w-xl">
                   Le pack Nexus Multi-verse déverrouille l'accès direct aux API Beta Nexus, permettant un pilotage centralisé et une synchronisation inter-domaines en temps réel.
                </p>
                <div className="flex flex-wrap gap-4">
                   <button 
                     onClick={() => window.location.href = `mailto:vision@nexus.ai?subject=Nexus Multi-verse Inquiry`}
                     className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform"
                   >
                      COMMANDER VISION CUSTOM →
                   </button>
                   <button 
                     onClick={() => window.location.href = `mailto:vision@nexus.ai?subject=Demande accès Documentation API Nexus&body=Bonjour, je souhaite consulter la documentation technique de l'API Nexus pour mon infrastructure.`}
                     className="px-10 py-5 border border-white/10 text-[10px] font-black text-white hover:bg-white/5 rounded-2xl uppercase tracking-widest transition-all"
                   >
                      VOIR LA DOCUMENTATION API
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-40 px-6 lg:px-8 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-4 block">FAQ</span>
             <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter text-white">
                {lang === 'en' ? 'QUESTIONS?' : 'DES QUESTIONS?'}
             </h2>
          </div>

          <div className="space-y-4">
            {[
              { 
                q: lang === 'en' ? 'Is my data secure?' : 'Mes données sont-elles sécurisées?', 
                a: lang === 'en' ? 'Yes, we use banking-grade encryption and we never store your WordPress credentials.' : 'Oui, nous utilisons un chiffrement de niveau bancaire et nous ne stockons jamais vos identifiants WordPress.'
              },
              { 
                q: lang === 'en' ? 'Compatible with Elementor?' : 'Compatible avec Elementor?', 
                a: lang === 'en' ? 'Wp_agent.ai works with all builders (Elementor, Divi, Gutenberg) as it operates at the content level.' : 'Wp_agent.ai fonctionne avec tous les builders (Elementor, Divi, Gutenberg) car il agit au niveau du contenu.'
              },
              { 
                q: lang === 'en' ? 'Can I cancel anytime?' : 'Puis-je annuler à tout moment?', 
                a: lang === 'en' ? 'Absolutely. No contracts, no hidden fees. Cancel in one click from your dashboard.' : 'Absolument. Pas d\'engagement, pas de frais cachés. Annulez en un clic depuis votre tableau de bord.'
              }
            ].map((item, i) => (
              <details key={i} className="group bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden">
                <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                  <span className="text-sm font-black uppercase tracking-widest text-white">{item.q}</span>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-transform group-open:rotate-45">
                    <Zap className="w-4 h-4 text-indigo-500" />
                  </div>
                </summary>
                <div className="px-8 pb-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-40 px-6 lg:px-8 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                 <Zap className="w-7 h-7 text-white fill-white" />
               </div>
               <span className="text-3xl font-display font-black italic uppercase tracking-tighter">WP_AGENT.AI</span>
             </div>

             <div className="flex gap-12">
               <div className="flex flex-col gap-4 text-left">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t('product', 'PRODUCT')}</span>
                  <a 
                   href="#features" 
                   onClick={() => { setCurrentView('home'); }}
                   className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                  >{t('features', 'FEATURES')}</a>
                  <a 
                   href="#pricing" 
                   onClick={() => { setCurrentView('home'); }}
                   className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                  >{t('pricing', 'PRICING')}</a>
                  <a 
                   href="#about" 
                   onClick={() => { setCurrentView('home'); }}
                   className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                  >{t('about', 'ABOUT')}</a>
               </div>
               <div className="flex flex-col gap-4 text-left">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t('legal', 'LEGAL')}</span>
                  <button 
                   onClick={() => { setCurrentView('privacy'); window.scrollTo(0,0); }}
                   className="text-[10px] font-black text-slate-500 uppercase text-left tracking-widest hover:text-white transition-colors"
                  >{t('privacy', 'PRIVACY')}</button>
                  <button 
                   onClick={() => { setCurrentView('terms'); window.scrollTo(0,0); }}
                   className="text-[10px] font-black text-slate-500 uppercase text-left tracking-widest hover:text-white transition-colors"
                  >{t('terms', 'TERMS')}</button>
               </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 border-t border-white/5">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
               © 2026 WP_AGENT.AI — DESIGNED FOR THE FUTURE OF COMMERCE.
             </p>

             <div className="flex gap-4">
                <div className="px-6 py-3 bg-white/5 rounded-full flex items-center gap-3 border border-white/5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SENSORS_OK</span>
                </div>
                <div className="px-6 py-3 bg-white/5 rounded-full flex items-center gap-3 border border-white/5">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">v1.5.8_STABLE</span>
                </div>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
