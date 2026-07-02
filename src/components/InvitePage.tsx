import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Crown, 
  Star, 
  Globe,
  Lock,
  Sparkles,
  MousePointer2,
  Cpu,
  Layers,
  Fingerprint,
  TrendingUp,
  LineChart,
  ShoppingBag,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  ThumbsUp,
  DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';

const TRANSLATIONS = {
  fr: {
    badge: "INVITATION VIP EXCLUSIVE",
    title_line1: "RÉIMAGINEZ",
    title_line2_prefix: "LE ",
    title_line2_suffix: "POSSIBLE.",
    tagline: '"WP_AGENT.AI n\'est pas un outil, c\'est votre nouveau standard. Automatisez votre WooCommerce avec une intelligence brute."',
    email_placeholder: "VOTRE EMAIL PROFESSIONNEL",
    cta_claim: "RÉCLAMER L'ACCÈS",
    access_validated: "ACCÈS DE CONSOLE VALIDÉ",
    access_validated_desc: "Vérifiez vos emails. Votre profil sécurisé Nexus est en cours de création.",
    bento_title1: "Cerveau Artificiel Natif WooCommerce.",
    bento_desc1: "Notre moteur IA analyse chaque transaction et chaque interaction client pour optimiser vos stocks et vos prix en temps réel, sans aucune intervention humaine.",
    bento_title2: "PRÉDICTION 2.0",
    bento_desc2: "Anticipez la demande avant même qu'elle n'existe.",
    bento_title3: "Sécurité de Grade Militaire.",
    bento_desc3: "Vos données WooCommerce sont chiffrées de bout en bout via le protocole Nexus. Personne, pas même nous, ne peut y accéder.",
    marquee_exclusive: "EXCLUSIF",
    final_title_part1: "SOYEZ LE ",
    final_title_part2_underline: "PREMIER",
    final_title_part3: " À POSSÉDER L'AVENIR.",
    footer_return: "RETOURNER AU PROTOCOLE ↑",
    login: "CONNEXION",
    secure_server: "SERVEUR SÉCURISÉ ACTIF",
    // New Translations
    sandbox_title: "CONTRÔLEZ L'IA EN DIRECT",
    sandbox_subtitle: "Lancez des requêtes autonomes simulées pour tester la puissance de l'agent",
    pricing_tab: "🔥 Smart Pricing",
    stock_tab: "📦 Stock Predictor",
    seo_tab: "✍️ SEO Auto-Write",
    pricing_sub: "Ajustez vos prix selon l'attention réelle",
    stock_sub: "Zéro rupture, -40% de capital bloqué",
    seo_sub: "Copywriting de grade international en 1 clic",
    security_tab: "🛡️ Cyber Shield",
    security_sub: "Surveillance & modération IP en temps réel",
    launch_sim: "ACTIVER L'IA AUTONOME",
    simulating: "PROJECTION SÉMANTIQUE...",
    try_again: "RÉINITIALISER",
    roi_title: "SIMULATEUR DE RENTABILITÉ",
    roi_subtitle: "Découvrez l'impact de WP_AGENT.AI sur votre chiffre d'affaires",
    roi_traffic: "Visiteurs Mensuels",
    roi_cart: "Panier Moyen",
    roi_projected: "GAIN SUPPLÉMENTAIRE ESTIMÉ (PAR AN)"
  },
  en: {
    badge: "EXCLUSIVE VIP INVITATION",
    title_line1: "REIMAGINE",
    title_line2_prefix: "THE ",
    title_line2_suffix: "POSSIBLE.",
    tagline: '"WP_AGENT.AI is not a tool, it\'s your new standard. Automate your WooCommerce with raw intelligence."',
    email_placeholder: "YOUR PROFESSIONAL EMAIL",
    cta_claim: "CLAIM ACCESS",
    access_validated: "CONSOLE ACCESS VALIDATED",
    access_validated_desc: "Check your emails. Your secure Nexus workspace profile is being setup.",
    bento_title1: "Native AI Brain for WooCommerce.",
    bento_desc1: "Our AI engine analyzes every single transaction and customer behavior. It optimizes your prices and stock levels live, 100% hands-free.",
    bento_title2: "PREDICTION 2.0",
    bento_desc2: "Anticipate customer orders before they even happen physically.",
    bento_title3: "Military-Grade Encryption Vault.",
    bento_desc3: "Your complete WooCommerce catalog data is entirely encrypted via double-layered TLS 1.3 tunnels. No one else has access.",
    marquee_exclusive: "EXCLUSIVE",
    final_title_part1: "BE THE ",
    final_title_part2_underline: "FIRST",
    final_title_part3: " TO OWN THE FUTURE.",
    footer_return: "RETURN TO PROTOCOL ↑",
    login: "LOGIN",
    secure_server: "SECURE CHANNEL STATUS: LIVE",
    // New Translations
    sandbox_title: "CONTROL THE AI IN REAL-TIME",
    sandbox_subtitle: "Execute simulated autonomous queries to test the agent's raw capabilities",
    pricing_tab: "🔥 Smart Pricing",
    stock_tab: "📦 Stock Predictor",
    seo_tab: "✍️ SEO Auto-Write",
    pricing_sub: "Adapt pricing live according to real visitor traction",
    stock_sub: "Zero inventory stock-outs, -40% frozen capital",
    seo_sub: "High-level international copywriting in 1 click",
    security_tab: "🛡️ Cyber Shield",
    security_sub: "Real-time threat blocking & lockdown",
    launch_sim: "LAUNCH AUTONOMOUS AI",
    simulating: "COMPUTING SEMANTIC LAYERS...",
    try_again: "RESET SIMULATOR",
    roi_title: "PROFITABILITY FORECAST MODEL",
    roi_subtitle: "Project how much WP_AGENT.AI will save and generate on your store",
    roi_traffic: "Monthly Unique Visitors",
    roi_cart: "Average Cart Value",
    roi_projected: "ESTIMATED ANNUAL NET GAIN BOOST"
  }
};

interface InvitePageProps {
  lang?: 'fr' | 'en';
  onLangChange?: (l: 'fr' | 'en') => void;
}

export default function InvitePage({ lang: externalLang, onLangChange }: InvitePageProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [localLang, setLocalLang] = useState<'fr' | 'en'>(() => {
    const saved = localStorage.getItem('nexus_lang');
    return (saved === 'en' || saved === 'fr') ? saved : 'fr';
  });

  const activeLang = externalLang || localLang;

  const handleLangSelect = (selected: 'fr' | 'en') => {
    if (onLangChange) {
      onLangChange(selected);
    } else {
      setLocalLang(selected);
      localStorage.setItem('nexus_lang', selected);
    }
  };

  const t = (key: keyof typeof TRANSLATIONS['fr']): string => {
    return TRANSLATIONS[activeLang]?.[key] || TRANSLATIONS['fr']?.[key] || '';
  };

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [showRefToast, setShowRefToast] = useState(false);

  // ROI state
  const [roiTraffic, setRoiTraffic] = useState<number>(35000);
  const [roiCart, setRoiCart] = useState<number>(65);

  // Sandbox simulation states
  const [sandboxTab, setSandboxTab] = useState<'pricing' | 'stock' | 'seo' | 'security'>('pricing');
  const [simActive, setSimActive] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Smart Pricing simulator live state
  const [livePrice, setLivePrice] = useState(89.00);
  const [liveSales, setLiveSales] = useState(24);
  const [liveDemand, setLiveDemand] = useState('NORMAL');

  // Stock Simulator state
  const [stockDays, setStockDays] = useState(12);
  const [stockStatus, setStockStatus] = useState<'CRITICAL' | 'OPTIMAL'>('CRITICAL');

  // SEO Simulator typing state
  const [seoScore, setSeoScore] = useState(38);
  const [seoText, setSeoText] = useState("Sneaker premium avec semelle en caoutchouc et lacets noirs classiques. Très confortable.");

  // Security Simulator state
  const [securityStatus, setSecurityStatus] = useState<'SAFE' | 'ATTACK_BLOCKED'>('SAFE');
  const [blockedCount, setBlockedCount] = useState(3);

  // Accordion active FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Capture referral code from URL and save for later
  useEffect(() => {
    const referralCode = new URLSearchParams(window.location.search).get('ref');
    if (referralCode) {
      setRefCode(referralCode);
      localStorage.setItem('nexus_ref_code', referralCode);
      setShowRefToast(true);
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setShowRefToast(false), 8000);
      return () => clearTimeout(timer);
    } else {
      // Fallback check from storage
      const stored = localStorage.getItem('nexus_ref_code');
      if (stored) {
        setRefCode(stored);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSuccess(true);
      // In a real app we'd send this to a DB along with the active refCode
      console.log('Registering guest with ref:', refCode, 'email:', email);
    }
  };

  // Run simulated dynamic steps
  const triggerSimulation = () => {
    setSimActive(true);
    setSimStep(1);

    if (sandboxTab === 'pricing') {
      setTimeout(() => {
        setSimStep(2);
        setLivePrice(94.20);
        setLiveDemand('OPTIMAL (PANIER CHAUD)');
      }, 1000);
      setTimeout(() => {
        setSimStep(3);
        setLiveSales(39);
        setSimActive(false);
      }, 2500);
    } else if (sandboxTab === 'stock') {
      setTimeout(() => {
        setSimStep(2);
        setStockStatus('OPTIMAL');
      }, 1200);
      setTimeout(() => {
        setSimStep(3);
        setStockDays(45);
        setSimActive(false);
      }, 2600);
    } else if (sandboxTab === 'seo') {
      setTimeout(() => {
        setSimStep(2);
        setSeoText(activeLang === 'fr' 
          ? "🌟 Chaussure d'Élite Nexus-X : Conçue avec un polymère réactif à mémoire de forme et un système de ventilation breveté. Optimisée pour une poussée d'énergie cinétique de +14% et une adhérence tout-terrain suprême." 
          : "🌟 Nexus-X Elite Tech Sneakers: Crafted with proprietary kinetic responsive polymer and micro-mesh airflow tunnels. Engineered for absolute shock absorption, returning 14% more energy."
        );
        setSeoScore(98);
      }, 1500);
      setTimeout(() => {
        setSimStep(3);
        setSimActive(false);
      }, 2800);
    } else if (sandboxTab === 'security') {
      setTimeout(() => {
        setSimStep(2);
        setSecurityStatus('ATTACK_BLOCKED');
        setBlockedCount(prev => prev + 1);
      }, 1200);
      setTimeout(() => {
        setSimStep(3);
        setSimActive(false);
      }, 2600);
    }
  };

  const resetSimulation = () => {
    setSimStep(0);
    setSimActive(false);
    if (sandboxTab === 'pricing') {
      setLivePrice(89.00);
      setLiveSales(24);
      setLiveDemand('NORMAL');
    } else if (sandboxTab === 'stock') {
      setStockDays(12);
      setStockStatus('CRITICAL');
    } else if (sandboxTab === 'seo') {
      setSeoText("Sneaker premium avec semelle en caoutchouc et lacets noirs classiques. Très confortable.");
      setSeoScore(38);
    } else if (sandboxTab === 'security') {
      setSecurityStatus('SAFE');
    }
  };

  useEffect(() => {
    resetSimulation();
  }, [sandboxTab]);

  // Calculate projected gain: base conversion uplift roughly 2.4% + stock savings
  const calculateGain = () => {
    const baselineRevenue = roiTraffic * 0.02 * roiCart * 12; // 2% baseline CR
    const optimizationGain = baselineRevenue * 0.35; // 35% average revenue boost via smart pricing and stock protection
    return Math.round(optimizationGain);
  };

  const FAQS = activeLang === 'fr' ? [
    {
      q: "Comment s'installe WP_AGENT.AI ?",
      a: "L'installation prend moins de 2 minutes. Notre système génère un script Javascript asynchrone universel ou un léger hook léger pour WPCode. Aucune extension lourde n'est requise, préservant 100% de la vitesse de votre serveur."
    },
    {
      q: "Le système est-il compatible avec tous les thèmes ?",
      a: "Oui, WP_AGENT.AI opère au niveau de l'API REST de WooCommerce de manière totalement indépendante de votre thème graphique. Que vous utilisiez Elementor, Divi ou Bricks, le fonctionnement est identique."
    },
    {
      q: "Est-ce sécurisé pour mes données de clients ?",
      a: "Intégralement. WP_AGENT.AI chiffre et tunnelise toutes les communications en TLS 1.3 bidirectionnel. Nous n'enregistrons aucun mot de passe de base de données. De plus, vous gardez le contrôle total depuis votre console Nexus."
    },
    {
      q: "Que se passe-t-il après la validation de l'essai gratuit ?",
      a: "Votre compte gratuit comporte 1440 minutes (24 heures) d'analyse réelle et de corrections automatiques. Vous pourrez ensuite choisir d'activer un protocole récurrent (Starter, Pro ou Elite) ou suspendre le lien sans aucun frais."
    }
  ] : [
    {
      q: "How fast is the installation process?",
      a: "It takes under 2 minutes. The platform generates an asynchronous, ultra-lightweight client script or simple WPCode hook. No bloated plug-ins are loaded, preserving 100% of your website speed score."
    },
    {
      q: "Is it fully compatible with all custom themes?",
      a: "Yes. WP_AGENT.AI works directly on top of your native WooCommerce REST API securely, meaning it runs flawlessly regardless of whether you run Elementor, Divi, Bricks, or custom Gutenberg blocks."
    },
    {
      q: "How safe is my database and customer records?",
      a: "Fully certified. All queries are encrypted and double-tunneled using TLS 1.3. We never store database administrative credentials. You retain absolute control from your central Nexus panel."
    },
    {
      q: "What happens after my live trial session completes?",
      a: "Your trial provides 1440 minutes (24 hours) of real, unthrottled execution and automatic optimizations. Afterwards, you can easily shift to any standard protocol (Starter, Pro, or Elite) or disable the script instantly without charges."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-indigo-500/40 selection:text-indigo-200 overflow-x-hidden font-sans">
      
      {/* Referral Notification Toast */}
      <AnimatePresence>
        {showRefToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-slate-950/90 backdrop-blur-3xl border border-indigo-500/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(99,102,241,0.25)] flex items-start gap-4"
          >
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0 border border-indigo-500/20">
              <Crown className="w-5 h-5 fill-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">INVITATION EXCLUSIVE</span>
                <button 
                  onClick={() => setShowRefToast(false)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs font-black text-white mt-1">Code Sponsor : <span className="font-mono text-emerald-400">{refCode}</span></p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide leading-relaxed">
                {activeLang === 'fr' 
                  ? "Avantages VIP appliqués : Période d'essai d'IA live déverrouillée et priorité de bande passante." 
                  : "All benefits applied: Secure live sandbox trial authorized and network prioritization active."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-End Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Dynamic Mesh Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/15 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[130px] rounded-full animate-pulse delay-700" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] bg-emerald-500/5 blur-[110px] rounded-full animate-pulse delay-1000" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)]" />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 backdrop-blur-md bg-black/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.location.href = '/'}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 animate-pulse" />
            <div className="relative w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
          </div>
          <div>
            <span className="text-xs font-black tracking-[0.4em] uppercase block leading-none">WP_AGENT.AI</span>
            <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-[0.3em]">
              {activeLang === 'fr' ? 'PROTOCOLE NEXUS-X' : 'NEXUS-X PROTOCOL'}
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          {/* Brand Lang Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-[8.5px] font-black uppercase tracking-widest text-slate-400">
            <button
              onClick={() => handleLangSelect('fr')}
              className={cn(
                "px-2.5 py-1 rounded-full transition-all text-[8px]",
                activeLang === 'fr' 
                  ? "bg-indigo-600 text-white font-black shadow-lg" 
                  : "hover:text-white"
              )}
            >
              FR
            </button>
            <button
              onClick={() => handleLangSelect('en')}
              className={cn(
                "px-2.5 py-1 rounded-full transition-all text-[8px]",
                activeLang === 'en' 
                  ? "bg-indigo-600 text-white font-black shadow-lg" 
                  : "hover:text-white"
              )}
            >
              EN
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              {t('secure_server')}
            </span>
          </div>
          <button 
            onClick={() => window.location.href = '/'} 
            className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors"
          >
            {t('login')}
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-10"
          >
            <Crown className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">
              {t('badge')}
            </span>
          </motion.div>

          {/* Master Headline */}
          <div className="relative mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-[8rem] lg:text-[10rem] font-display font-black italic uppercase tracking-tighter leading-[0.8] mb-6"
            >
              {t('title_line1')} <br />
              {t('title_line2_prefix')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-purple-500">{t('title_line2_suffix')}</span>
            </motion.h1>
            
            {/* Sponsor Badge floating */}
            {refCode && (
              <motion.div
                initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
                animate={{ rotate: -5, scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500/15 via-indigo-600/10 to-indigo-500/15 border border-indigo-500/30 rounded-2xl mb-4 text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] shadow-xl"
              >
                🤝 {activeLang === 'fr' ? 'Parrainé par ' : 'Referred by '}<span className="font-mono text-white underline decoration-emerald-500/40">{refCode}</span>
              </motion.div>
            )}
            
            {/* Floating Element Around Headline */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 right-[10%] hidden lg:block"
            >
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl rotate-12">
                 <Fingerprint className="w-8 h-8 text-indigo-400" />
              </div>
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto mb-12 italic font-display"
          >
            {t('tagline')}
          </motion.p>

          {/* High-End Opt-in Form */}
          <div className="max-w-xl mx-auto mb-16">
            {!success ? (
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onSubmit={handleSubmit}
                className="relative p-2 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col sm:flex-row gap-2 group focus-within:border-indigo-500/50 transition-all duration-500 shadow-2xl"
              >
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-6 flex items-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder={t('email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-5 pl-14 pr-6 text-xs font-black uppercase tracking-[0.2em] outline-none placeholder:text-slate-600 text-white"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-white text-black py-4 px-10 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
                >
                  {t('cta_claim')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-indigo-600/10 backdrop-blur-3xl border border-indigo-500/30 p-10 rounded-[2.5rem] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none" />
                <ShieldCheck className="w-14 h-14 text-indigo-400 mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-[0.2em] mb-3">{t('access_validated')}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.35em] leading-relaxed">
                  {t('access_validated_desc')}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive AI Sandbox Section - Brand New */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
              NEXUS INSTANT SANDBOX
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mt-4 italic font-display">
              {t('sandbox_title')}
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-black mt-2">
              {t('sandbox_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/40 border border-slate-800/80 rounded-[3rem] p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-3xl rounded-full" />
            
            {/* Tab Selector Left */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setSandboxTab('pricing')}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border transition-all relative flex flex-col gap-1 cursor-pointer",
                    sandboxTab === 'pricing' 
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-xl shadow-indigo-500/5" 
                      : "bg-black/20 border-slate-800/50 text-slate-400 hover:text-white hover:border-slate-700"
                  )}
                >
                  {sandboxTab === 'pricing' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-full" />
                  )}
                  <span className="text-sm font-black uppercase tracking-wider block">{t('pricing_tab')}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t('pricing_sub')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSandboxTab('stock')}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border transition-all relative flex flex-col gap-1 cursor-pointer",
                    sandboxTab === 'stock' 
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-xl shadow-indigo-500/5" 
                      : "bg-black/20 border-slate-800/50 text-slate-400 hover:text-white hover:border-slate-700"
                  )}
                >
                  {sandboxTab === 'stock' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-full" />
                  )}
                  <span className="text-sm font-black uppercase tracking-wider block">{t('stock_tab')}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t('stock_sub')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSandboxTab('seo')}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border transition-all relative flex flex-col gap-1 cursor-pointer",
                    sandboxTab === 'seo' 
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-xl shadow-indigo-500/5" 
                      : "bg-black/20 border-slate-800/50 text-slate-400 hover:text-white hover:border-slate-700"
                  )}
                >
                  {sandboxTab === 'seo' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-full" />
                  )}
                  <span className="text-sm font-black uppercase tracking-wider block">{t('seo_tab')}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t('seo_sub')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSandboxTab('security')}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border transition-all relative flex flex-col gap-1 cursor-pointer",
                    sandboxTab === 'security' 
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-xl shadow-indigo-500/5" 
                      : "bg-black/20 border-slate-800/50 text-slate-400 hover:text-white hover:border-slate-700"
                  )}
                >
                  {sandboxTab === 'security' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-full" />
                  )}
                  <span className="text-sm font-black uppercase tracking-wider block">{t('security_tab')}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t('security_sub')}</span>
                </button>
              </div>

              {/* Simulation CTA */}
              <div className="mt-4">
                {simStep === 0 ? (
                  <button
                    type="button"
                    onClick={triggerSimulation}
                    disabled={simActive}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <Cpu className="w-4 h-4" />
                    {t('launch_sim')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetSimulation}
                    disabled={simActive}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('try_again')}
                  </button>
                )}
              </div>
            </div>

            {/* Sandbox Viewport Right */}
            <div className="lg:col-span-8 bg-black/50 border border-slate-800/60 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[350px] relative">
              
              {/* Top Bar Terminal style */}
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-4 text-[9px] font-mono font-black tracking-widest text-slate-500 uppercase">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/45" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/45" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/45" />
                  <span className="ml-2 font-mono text-[8px] text-indigo-400">NEXUS_AGENT_SANDBOX_ST_05</span>
                </div>
                <div>
                  STATUS: {simActive ? 'COMPUTING' : simStep > 0 ? 'OPTIMIZED' : 'IDLE'}
                </div>
              </div>

              {/* Dynamic Screens based on tab */}
              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  
                  {/* pricing screen */}
                  {sandboxTab === 'pricing' && (
                    <motion.div
                      key="pricing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/60 border border-slate-900 rounded-2xl p-6">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">PRODUIT WOOCOMMERCE</span>
                          <h4 className="text-lg font-black uppercase tracking-tight text-white mt-1 italic font-display">Nexus Elite Sneakers</h4>
                        </div>
                        <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-right">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">DEMANDE LIVE</span>
                          <span className="text-xs font-mono font-black text-indigo-400 block">{liveDemand}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 text-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Prix de Vente Actuel</span>
                          <span className="text-3xl font-mono font-black text-white">
                            {livePrice.toFixed(2)} €
                          </span>
                          {simStep > 0 && <span className="text-[10px] font-bold text-emerald-400 block mt-1">+5.20€ Ajustement IA</span>}
                        </div>

                        <div className="bg-indigo-500/5 border border-indigo-505/20 rounded-2xl p-5 text-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Taux de Conversion Estimé</span>
                          <span className="text-3xl font-mono font-black text-indigo-400">
                            {liveSales} %
                          </span>
                          {simStep > 0 && <span className="text-[10px] font-bold text-indigo-300 block mt-1">Intérêt converti</span>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* stock screen */}
                  {sandboxTab === 'stock' && (
                    <motion.div
                      key="stock"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">STOCK ACTUEL : SNEAKERS S-01</span>
                          <p className="text-base font-black text-white mt-1 uppercase tracking-tight">VÉLOCITÉ DES COMMANDES : +18/Jour</p>
                        </div>
                        <div className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          stockStatus === 'CRITICAL' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse"
                        )}>
                          {stockStatus}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-955/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Épuisement Estimé</span>
                          <span className="text-3xl font-mono font-black text-red-400">{stockDays} jours</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">Prédiction IA</span>
                        </div>

                        <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Stratégie de Commande</span>
                          <span className="text-xs font-black uppercase tracking-wide mt-2">
                            {simStep === 0 
                              ? "⚠️ Alerte imminente de réapprovisionnement" 
                              : "🚀 Ordre auto planifié : +150 unités livrées J-20"
                            }
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* seo screen */}
                  {sandboxTab === 'seo' && (
                    <motion.div
                      key="seo"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">GÉNÉRATEUR SÉMANTIQUE SEO</span>
                          <span className={cn(
                            "text-[10px] font-mono font-black px-2.5 py-1 rounded-full",
                            seoScore > 50 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold" : "bg-yellow-500/15 text-yellow-500 border border-yellow-500/20"
                          )}>
                            SCORE GOOGLE BOT : {seoScore}/100
                          </span>
                        </div>
                        <div className="bg-black/40 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 min-h-[100px] leading-relaxed relative overflow-hidden">
                          {seoText}
                          {simActive && (
                            <div className="absolute inset-x-0 bottom-0 py-1.5 bg-indigo-600 font-sans font-black uppercase text-[8.5px] tracking-widest text-center text-white">
                              {t('simulating')}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* security screen */}
                  {sandboxTab === 'security' && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 w-full"
                    >
                      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">NEXUS CYBER SHIELD</span>
                          <p className="text-base font-black text-white mt-1 uppercase tracking-tight">
                            {activeLang === 'fr' ? 'SÉCURITÉ DU SYSTÈME WORDPRESS' : 'WORDPRESS SYSTEM SECURITY'}
                          </p>
                        </div>
                        <div className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-widest",
                          securityStatus === 'SAFE' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-500 border border-red-500/30"
                        )}>
                          {securityStatus === 'SAFE' 
                            ? (activeLang === 'fr' ? 'SYSTÈME PROTÉGÉ' : 'SYSTEM SECURE')
                            : (activeLang === 'fr' ? 'MENACE BLOQUÉE' : 'THREAT BLOCKED')
                          }
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950/45 border border-slate-900 rounded-2xl p-5 flex flex-col justify-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            {activeLang === 'fr' ? 'Adresses IP Bannies' : 'Banned IP Addresses'}
                          </span>
                          <span className="text-3xl font-mono font-black text-white">{blockedCount}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                            {activeLang === 'fr' ? 'Surveillance Temps Réel' : 'Real-time Monitoring'}
                          </span>
                        </div>

                        <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-center text-left">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">
                            {activeLang === 'fr' ? 'Dernier Événement' : 'Latest Event'}
                          </span>
                          <div className="text-[11px] leading-relaxed mt-2 text-slate-300">
                            {simStep === 0 
                              ? (activeLang === 'fr' ? "✓ En attente d'activité suspecte sur le webhook..." : "✓ Listening for suspicious webhook payloads...") 
                              : (activeLang === 'fr' 
                                  ? "🛑 Tentative d'injection SQL bloquée : IP 198.51.100.41 bannie d'urgence !" 
                                  : "🛑 SQL Injection attempt prevented: IP 198.51.100.41 banned instantly!")
                            }
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Console logs output */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between font-mono text-[9px] text-slate-500">
                <span className="uppercase font-mono">⚡ SYS_OK • PIPELINE INTEGRATED VIA NEXUS APIS</span>
                <span className="font-mono text-indigo-400">SESSION_ACTIVE</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-950/30 via-slate-900/40 to-black border border-indigo-500/20 rounded-[3rem] p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              {t('roi_title')}
            </span>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">
              {t('roi_subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Input 1: Traffic Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase font-black tracking-widest text-slate-400">{t('roi_traffic')}</span>
                <span className="text-base font-mono font-black text-indigo-400">
                  {roiTraffic.toLocaleString()} {activeLang === 'fr' ? 'visites/mois' : 'visits/month'}
                </span>
              </div>
              <input 
                type="range"
                min="5000"
                max="300000"
                step="5000"
                value={roiTraffic}
                onChange={(e) => setRoiTraffic(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Input 2: Average Cart Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase font-black tracking-widest text-slate-400">{t('roi_cart')}</span>
                <span className="text-base font-mono font-black text-indigo-400">{roiCart} €</span>
              </div>
              <input 
                type="range"
                min="15"
                max="250"
                step="5"
                value={roiCart}
                onChange={(e) => setRoiCart(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Highlight Projected Returns */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-[2rem] p-6 text-center relative overflow-hidden max-w-xl mx-auto">
              <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
              <p className="text-[10px] font-black tracking-[0.25em] text-slate-500 uppercase mb-2">
                {t('roi_projected')}
              </p>
              <p className="text-4xl md:text-5xl font-mono font-black text-emerald-400">
                + {calculateGain().toLocaleString()} € / {activeLang === 'fr' ? 'an' : 'year'}
              </p>
              <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mt-2">
                {activeLang === 'fr' 
                  ? "Modèle basé sur l'augmentation du panier moyen (+4.2%) et de la conversion (+18.4%)" 
                  : "Calculation model based on +4.2% cart price optimization and +18.4% stock protection efficiency"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative z-10 px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Main Feature - Large */}
            <motion.div 
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
              className="md:col-span-8 p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] relative overflow-hidden group hover:bg-white/[0.07] transition-all duration-500"
            >
               <div className="relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                   <Cpu className="w-7 h-7 text-white" />
                 </div>
                 <h3 className="text-4xl font-display font-black italic uppercase tracking-tighter mb-6 leading-none text-white">
                   {t('bento_title1')}
                 </h3>
                 <p className="text-slate-400 font-medium uppercase tracking-tight text-sm leading-relaxed max-w-md">
                   {t('bento_desc1')}
                 </p>
               </div>
               {/* Decorative Element */}
               <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden hidden lg:block opacity-20 group-hover:opacity-40 transition-opacity">
                  <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 border-[20px] border-indigo-500/20 rounded-full" />
                  <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-80 h-80 border-[20px] border-indigo-500/20 rounded-full scale-125" />
               </div>
            </motion.div>

            {/* Small Card 1 */}
            <motion.div 
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              className="md:col-span-4 p-8 bg-white/5 border border-white/10 rounded-[3rem] group hover:bg-indigo-500/5 transition-all duration-500 text-center flex flex-col items-center justify-center"
            >
               <Layers className="w-10 h-10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-black uppercase tracking-widest mb-4 italic text-white/90">
                 {t('bento_title2')}
               </h3>
               <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-loose max-w-[200px]">
                 {t('bento_desc2')}
               </p>
            </motion.div>

            {/* Small Card 2 */}
            <motion.div className="md:col-span-4 p-8 bg-indigo-600 rounded-[3rem] text-white flex flex-col justify-between group hover:rotate-2 transition-transform duration-500">
               <div className="flex justify-between items-start">
                  <Star className="w-8 h-8 fill-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">ELITE ONLY</span>
               </div>
               <div>
                  <p className="text-[4rem] font-display font-black italic tracking-tighter leading-none mb-2">99.8%</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                    {activeLang === 'fr' ? 'FIABILITÉ PROTOCOLE' : 'PROTOCOL RELIABILITY'}
                  </p>
               </div>
            </motion.div>

            {/* Card 3 - Medium */}
            <motion.div className="md:col-span-8 p-12 bg-white/5 border border-white/10 rounded-[3rem] relative overflow-hidden flex items-center gap-12 group">
                <div className="flex-1 relative z-10">
                   <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-4 leading-none text-white">
                     {t('bento_title3')}
                   </h3>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                     {t('bento_desc3')}
                   </p>
                </div>
                <div className="w-1/3 hidden sm:block">
                   <div className="aspect-square bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center p-8 group-hover:border-indigo-500/50 transition-colors">
                      <Lock className="w-20 h-20 text-indigo-500 opacity-20" />
                   </div>
                </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Social Trust Marquee - Stylized */}
      <section className="relative z-10 py-16 bg-white overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-slower">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex items-center gap-10 mx-10">
               <span className="text-6xl font-display font-black italic uppercase tracking-tighter text-black opacity-10">NEXUS_PROTOCOL</span>
               <div className="w-4 h-4 bg-indigo-600 rounded-full" />
               <span className="text-6xl font-display font-black italic uppercase tracking-tighter text-black">{t('marquee_exclusive')}</span>
               <div className="w-4 h-4 bg-indigo-600 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Elegant Accordion Q&A Section */}
      <section className="relative z-10 py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            FAQ STATUS
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-4 italic font-display">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left flex justify-between items-center text-white hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500">0{idx + 1}.</span>
                  <span className="text-sm font-black uppercase tracking-wider">{item.q}</span>
                </div>
                {openFaq === idx ? (
                  <ChevronDown className="w-4 h-4 text-indigo-400 rotate-180 transition-transform" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 transition-transform" />
                )}
              </button>
              
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-xs text-slate-400 uppercase tracking-wide leading-relaxed pl-12">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA / Quote */}
      <section className="relative z-10 py-32 px-8 text-center bg-black">
        <div className="max-w-3xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl mx-auto mb-10 flex items-center justify-center animate-pulse"
           >
              <MousePointer2 className="w-6 h-6 text-indigo-400" />
           </motion.div>
           <h2 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter leading-[0.9] mb-12 text-white">
             {t('final_title_part1')} <br />
             <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">
               {t('final_title_part2_underline')}
             </span> 
             {t('final_title_part3')}
           </h2>
           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 hover:text-white transition-colors cursor-pointer block mx-auto"
           >
             {t('footer_return')}
           </button>
        </div>
      </section>

      {/* High-End Footer */}
      <footer className="relative z-10 py-20 px-8 bg-[#020203] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-2">
               <Zap className="w-4 h-4 text-white fill-white" />
               <span className="text-xs font-black tracking-[0.5em] uppercase">WP_AGENT.AI</span>
             </div>
             <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">{activeLang === 'fr' ? 'TOUS DROITS RÉSERVÉS' : 'ALL RIGHTS RESERVED'} © 2026</p>
          </div>
          
          <div className="flex gap-12 text-white">
             <div className="flex flex-col gap-4 text-center md:text-left">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  {activeLang === 'fr' ? 'PROTOCOLE' : 'PROTOCOL'}
                </span>
                <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                  {activeLang === 'fr' ? 'SÉCURITÉ' : 'SECURITY'}
                </a>
                <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">API</a>
             </div>
             <div className="flex flex-col gap-4 text-center md:text-left">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  {activeLang === 'fr' ? 'RÉSEAUX' : 'NETWORKS'}
                </span>
                <a href="https://www.youtube.com/@NEXUSWPAI" target="_blank" rel="noreferrer" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">YOUTUBE</a>
                <a href="https://www.tiktok.com/@nexus4291" target="_blank" rel="noreferrer" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">TIKTOK</a>
                <a href="https://x.com/NEXUS_WP_IA" target="_blank" rel="noreferrer" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">X / TWITTER</a>
                <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">DISCORD</a>
             </div>
          </div>
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-slower {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-slower {
          animation: marquee-slower 40s linear infinite;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99,102,241,0.5);
          transition: background 0.15s, transform 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #818cf8;
          transform: scale(1.15);
        }
      `}} />
    </div>
  );
}
