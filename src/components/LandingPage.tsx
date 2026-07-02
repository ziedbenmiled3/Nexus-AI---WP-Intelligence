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
  Activity,
  Cpu,
  RefreshCw,
  Eye,
  Server,
  Code2,
  FileCheck2,
  AlertTriangle,
  Flame,
  MousePointer,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeJsonParse } from '../lib/utils';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import { firebaseService } from '../services/firebaseService';
import ComparisonTable from './ComparisonTable';
import { DEFAULT_NEXUS_CONFIG, mergeRegistryConfig } from '../constants';
import { TRANSLATIONS_LOCAL } from './LandingPageTranslations';
import AdvantagesShowcase from './AdvantagesShowcase';

const FALLBACK_PLANS = [
  { id: 'trial', name: 'Test Vision', price: 0, site_limit: 1, description: "Testez toutes les fonctionnalités pendant 24 heures" },
  { id: 'starter', name: 'Starter Protocol', price: 29, site_limit: 1, description: "Gestion d'un seul site WordPress" },
  { id: 'pro', name: 'Pro Nexus', price: 79, site_limit: 5, description: "Gestion jusqu'à 5 sites WordPress" },
  { id: 'elite', name: 'Elite Vision', price: 199, site_limit: 12, description: "Gestion jusqu'à 12 sites WordPress" }
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
  const customFallbackPlans = [
    { id: 'trial', name: lang === 'fr' ? 'Test Vision' : 'Trial Vision', price: 0, site_limit: 1, description: lang === 'fr' ? 'Testez toutes les fonctionnalités pendant 24 heures' : 'Test all features for 24 hours' },
    { id: 'starter', name: 'Starter Protocol', price: 29, site_limit: 1, description: lang === 'fr' ? "Gestion d'un seul site WordPress" : "Management of 1 WordPress site" },
    { id: 'pro', name: 'Pro Nexus', price: 79, site_limit: 5, description: lang === 'fr' ? "Gestion jusqu'à 5 sites WordPress" : "Management up to 5 WordPress websites" },
    { id: 'elite', name: 'Elite Vision', price: 199, site_limit: 12, description: lang === 'fr' ? "Gestion jusqu'à 12 sites WordPress" : "Management up to 12 WordPress websites" }
  ];

  const [plans, setPlans] = useState<any[]>(customFallbackPlans);

  useEffect(() => {
    // Update local plans if language changes and external plans are not provided
    if (!externalPlans || externalPlans.length === 0) {
      setPlans(customFallbackPlans);
    }
  }, [lang]);
  const [matrixConfig, setMatrixConfig] = useState<any>(DEFAULT_NEXUS_CONFIG);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'terms'>('home');
  const [activeSubPage, setActiveSubPage] = useState<'home' | 'showcase'>('home');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [annualDiscount, setAnnualDiscount] = useState(20);
  
  // Dynamic Currency Conversion state & logic
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR');
  
  const getConvertedPrice = (priceInEur: number) => {
    if (selectedCurrency === 'EUR') {
      return { value: priceInEur, symbol: '€' };
    } else {
      return { value: Math.round(priceInEur * 1.08), symbol: '$' };
    }
  };
  
  // Custom states for interactive elements
  const [activeAISector, setActiveAISector] = useState<'pricer' | 'stock' | 'seo' | 'security'>('pricer');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  
  // Simulated Radar Telemetry Feed state
  const [telemetryFeed, setTelemetryFeed] = useState<any[]>([
    { id: 1, event: 'cart_adding', item: 'Nike Air Max Pro', value: '189 €', geo: 'Paris, FR', time: 'À l\'instant', badge: 'Panier chaud' },
    { id: 2, event: 'scroll_heatmap', item: 'Guide Nutrition Végétale', value: '45 % page', geo: 'Marseille, FR', time: 'Il y a 3s', badge: 'Comportement' },
    { id: 3, event: 'order_init', item: 'Pack Sérum Hydra-Boost x3', value: '115 €', geo: 'Bruxelles, BE', time: 'Il y a 7s', badge: 'Intention d\'achat' },
    { id: 4, event: 'completed_order', item: 'Montre Titanium Falcon', value: '450 €', geo: 'Genève, CH', time: 'Il y a 12s', badge: 'Achat validé' },
  ]);

  // Keep telemetry alive with realistic data
  useEffect(() => {
    const products = [
      'iPhone 15 Case Carbon', 'Ultra-Focus Nootropics', 'Machine Espresso Barista',
      'Matelas Ortho-Cloud', 'Livre Recettes Ketogène', 'Sneakers Eco-Run Pro',
      'Lampe Projecteur Galaxy', 'Kit Hydratation Alpin'
    ];
    const cities = ['Lyon, FR', 'Bordeaux, FR', 'Lille, FR', 'Nantes, FR', 'Toulouse, FR', 'Liège, BE', 'Namur, BE', 'Lausanne, CH', 'Paris, FR'];
    const events = [
      { type: 'cart_adding', label: 'Panier chaud', prefixClass: 'text-amber-400 bg-amber-400/10' },
      { type: 'scroll_heatmap', label: 'Comportement', prefixClass: 'text-blue-400 bg-blue-400/10' },
      { type: 'order_init', label: 'Intention d\'achat', prefixClass: 'text-purple-400 bg-purple-400/10' },
      { type: 'completed_order', label: 'Achat validé', prefixClass: 'text-emerald-400 bg-emerald-400/10' }
    ];

    const interval = setInterval(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const value = Math.random() > 0.4 ? `${Math.floor(Math.random() * 250) + 15} €` : `${Math.floor(Math.random() * 80) + 20} % page`;

      setTelemetryFeed(prev => [
        {
          id: Date.now(),
          event: randomEvent.type,
          item: randomProduct,
          value,
          geo: randomCity,
          time: 'À l\'instant',
          badge: randomEvent.label
        },
        ...prev.slice(0, 3)
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
        let matrixData = configRaw 
          ? mergeRegistryConfig(typeof configRaw === 'string' ? safeJsonParse(configRaw, DEFAULT_NEXUS_CONFIG) : configRaw) 
          : DEFAULT_NEXUS_CONFIG;

        setMatrixConfig(matrixData);

        const getFeaturesForPack = (packId: string, defaultFeatures: string[]) => {
          if (!matrixData?.packs?.[packId]) return defaultFeatures;
          const activeIds = matrixData.packs[packId].activeFeatures || [];
          if (!Array.isArray(activeIds) || activeIds.length === 0) return defaultFeatures;
          
          const mapped = activeIds.map((id: string) => {
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

        const trialDbPlan = plansSource?.find((p: any) => p.id === 'trial');
        const trialDurationHours = trialDbPlan?.duration_hours !== undefined ? Number(trialDbPlan.duration_hours) : 24;

        const list = [
          {
            id: 'trial',
            defaultName: lang === 'fr' ? 'TEST VISION' : 'TRIAL VISION',
            defaultPrice: 0,
            defaultSiteLimit: 1,
            defaultDescription: lang === 'fr' 
              ? `Testez toutes les fonctionnalités pendant ${trialDurationHours % 24 === 0 ? `${trialDurationHours / 24} ${trialDurationHours / 24 > 1 ? 'jours' : 'jour'}` : `${trialDurationHours} ${trialDurationHours > 1 ? 'heures' : 'heure'}`} gratuitement`
              : `Test all features for ${trialDurationHours % 24 === 0 ? `${trialDurationHours / 24} ${trialDurationHours / 24 > 1 ? 'days' : 'day'}` : `${trialDurationHours} ${trialDurationHours > 1 ? 'hours' : 'hour'}`} for free`,
            defaultFeatures: [
              lang === 'fr' ? 'Tableau de Bord' : 'Dashboard',
              lang === 'fr' ? 'Bouclier de Sécurité' : 'Security Shield',
              lang === 'fr' ? 'Gestion Clientèle WP' : 'WordPress Client Management',
              lang === 'fr' ? 'Multi-Pixel Publicitaire' : 'Multi-Pixel Advertising',
              lang === 'fr' ? 'Nexus Social' : 'Nexus Social',
              lang === 'fr' ? 'Flux Smart Shopping' : 'Smart Shopping Feed',
              lang === 'fr' ? 'Intelligence Marché' : 'Market Intelligence',
              lang === 'fr' ? 'Analyse Stocks' : 'Stock Analysis',
              lang === 'fr' ? 'Nexus Forecast' : 'Nexus Forecast',
              lang === 'fr' ? 'Audit SEO' : 'SEO Audit',
              lang === 'fr' ? 'Machine à Contenu' : 'Content Machine',
              lang === 'fr' ? 'Auto-Pilote' : 'Autopilot',
              lang === 'fr' ? 'Maillage Interne' : 'Internal Interlinking',
              lang === 'fr' ? 'Hub de Communication' : 'Communication Hub',
              lang === 'fr' ? 'Commandes WooCommerce' : 'WooCommerce Orders',
              lang === 'fr' ? 'Manager Produits' : 'Product Manager',
              lang === 'fr' ? 'Catégories & Tags' : 'Categories & Tags',
              lang === 'fr' ? 'Maintenance' : 'Maintenance',
              lang === 'fr' ? 'Paramètres' : 'Settings',
              lang === 'fr' ? 'Invitations & Équipe' : 'Invitations & Team',
              lang === 'fr' ? 'Affiliation' : 'Affiliation'
            ]
          },
          {
            id: 'starter',
            defaultName: 'STARTER PROTOCOL',
            defaultPrice: 29,
            defaultSiteLimit: 1,
            defaultDescription: lang === 'fr' ? "Gestion d'un seul site WordPress" : "Management of 1 WordPress site",
            defaultFeatures: [
              lang === 'fr' ? 'Manager Produits, Catégories & Tags' : 'Products, Categories & Tags Manager',
              lang === 'fr' ? 'Audit SEO (Analyses de base)' : 'SEO Audit (Base analysis)',
              lang === 'fr' ? 'Maintenance & Paramètres' : 'Maintenance & Settings',
              lang === 'fr' ? 'Comm Hub (Mode Lecture Seule)' : 'Comm Hub (Read-Only Mode)'
            ]
          },
          {
            id: 'pro',
            defaultName: 'PRO NEXUS',
            defaultPrice: 89,
            defaultSiteLimit: 5,
            is_popular: true,
            defaultDescription: lang === 'fr' ? "Gestion jusqu'à 5 sites WordPress" : "Management up to 5 WordPress websites",
            defaultFeatures: [
              lang === 'fr' ? 'Machine à Contenu & Maillage' : 'Content & Interlinking Engine',
              lang === 'fr' ? 'Nexus Social & Smart Shopping' : 'Nexus Social & Smart Shopping',
              lang === 'fr' ? 'Comm Hub Core SMTP Engine' : 'Comm Hub Core SMTP Engine'
            ]
          },
          {
            id: 'elite',
            defaultName: 'ELITE VISION',
            defaultPrice: 249,
            defaultSiteLimit: 12,
            defaultDescription: lang === 'fr' ? "Gestion jusqu'à 12 sites WordPress" : "Management up to 12 WordPress websites",
            defaultFeatures: [
              lang === 'fr' ? 'Tableau de Bord' : 'Dashboard',
              lang === 'fr' ? 'Bouclier de Sécurité' : 'Security Shield',
              lang === 'fr' ? 'Gestion Clientèle WP' : 'WordPress Client Management',
              lang === 'fr' ? 'Multi-Pixel Publicitaire' : 'Multi-Pixel Advertising',
              lang === 'fr' ? 'Nexus Social' : 'Nexus Social',
              lang === 'fr' ? 'Flux Smart Shopping' : 'Smart Shopping Feed',
              lang === 'fr' ? 'Intelligence Marché' : 'Market Intelligence',
              lang === 'fr' ? 'Analyse Stocks' : 'Stock Analysis',
              lang === 'fr' ? 'Nexus Forecast' : 'Nexus Forecast',
              lang === 'fr' ? 'Audit SEO' : 'SEO Audit',
              lang === 'fr' ? 'Machine à Contenu' : 'Content Machine',
              lang === 'fr' ? 'Auto-Pilote' : 'Autopilot',
              lang === 'fr' ? 'Maillage Interne' : 'Internal Interlinking',
              lang === 'fr' ? 'Hub de Communication' : 'Communication Hub',
              lang === 'fr' ? 'Commandes WooCommerce' : 'WooCommerce Orders',
              lang === 'fr' ? 'Manager Produits' : 'Product Manager',
              lang === 'fr' ? 'Catégories & Tags' : 'Categories & Tags',
              lang === 'fr' ? 'Maintenance' : 'Maintenance',
              lang === 'fr' ? 'Paramètres' : 'Settings',
              lang === 'fr' ? 'Invitations & Équipe' : 'Invitations & Team',
              lang === 'fr' ? 'Affiliation' : 'Affiliation'
            ]
          },
          {
            id: 'launch',
            defaultName: lang === 'fr' ? 'LANCEMENT UNIQUE' : 'LAUNCH ONE-TIME',
            defaultPrice: 199,
            defaultSiteLimit: 3,
            defaultDescription: lang === 'fr' ? "Accès à vie pour 3 sites WordPress" : "Lifetime access for 3 WordPress sites",
            defaultFeatures: [
              lang === 'fr' ? 'Tableau de Bord' : 'Dashboard',
              lang === 'fr' ? 'Bouclier de Sécurité' : 'Security Shield',
              lang === 'fr' ? 'Gestion Clientèle WP' : 'WordPress Client Management',
              lang === 'fr' ? 'Multi-Pixel Publicitaire' : 'Multi-Pixel Advertising',
              lang === 'fr' ? 'Nexus Social' : 'Nexus Social',
              lang === 'fr' ? 'Flux Smart Shopping' : 'Smart Shopping Feed',
              lang === 'fr' ? 'Intelligence Marché' : 'Market Intelligence',
              lang === 'fr' ? 'Analyse Stocks' : 'Stock Analysis',
              lang === 'fr' ? 'Nexus Forecast' : 'Nexus Forecast',
              lang === 'fr' ? 'Audit SEO' : 'SEO Audit',
              lang === 'fr' ? 'Machine à Contenu' : 'Content Machine',
              lang === 'fr' ? 'Auto-Pilote' : 'Autopilot',
              lang === 'fr' ? 'Maillage Interne' : 'Internal Interlinking',
              lang === 'fr' ? 'Hub de Communication' : 'Communication Hub',
              lang === 'fr' ? 'Commandes WooCommerce' : 'WooCommerce Orders',
              lang === 'fr' ? 'Manager Produits' : 'Product Manager',
              lang === 'fr' ? 'Catégories & Tags' : 'Categories & Tags',
              lang === 'fr' ? 'Maintenance' : 'Maintenance',
              lang === 'fr' ? 'Paramètres' : 'Settings',
              lang === 'fr' ? 'Invitations & Équipe' : 'Invitations & Team',
              lang === 'fr' ? 'Affiliation' : 'Affiliation'
            ]
          }
        ];

        const syncedPlans = list.map(item => {
          const packId = item.id;
          const matrixPack = matrixData?.packs?.[packId === 'trial' ? 'test' : packId];
          const name = matrixPack?.name || item.defaultName;
          const rawPrice = matrixPack?.price !== undefined ? matrixPack.price : String(item.defaultPrice);
          const price = parseInt(String(rawPrice).replace(/[^0-9]/g, '')) || 0;
          
          const siteLimit = matrixPack?.siteLimit !== undefined ? matrixPack.siteLimit : (matrixPack?.site_limit !== undefined ? matrixPack.site_limit : item.defaultSiteLimit);
          const isLifetime = matrixPack?.isLifetime !== undefined ? !!matrixPack.isLifetime : (item.id === 'launch');
          const isLaunchPack = matrixPack?.isLaunchPack !== undefined ? !!matrixPack.isLaunchPack : (item.id === 'launch');
          const launchStockLimit = matrixPack?.launchStockLimit !== undefined ? matrixPack.launchStockLimit : 100;
          const launchStockSold = matrixPack?.launchStockSold !== undefined ? matrixPack.launchStockSold : 42;
          const isActive = matrixPack?.isActive !== undefined ? matrixPack.isActive : true;

          return {
            id: item.id,
            name,
            price,
            site_limit: siteLimit,
            description: matrixPack?.description || item.defaultDescription,
            is_popular: item.is_popular || false,
            features: getFeaturesForPack(packId === 'trial' ? 'test' : packId, item.defaultFeatures),
            isLifetime,
            isLaunchPack,
            launchStockLimit,
            launchStockSold,
            isActive,
            duration_hours: item.id === 'trial' ? trialDurationHours : undefined
          };
        }).filter(plan => plan.isActive);

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
    const local = (TRANSLATIONS_LOCAL as any)[lang]?.[key];
    if (local) return local;
    if (translations[key]) return translations[key];
    return fallback;
  };

  const phpSnippet = `/**
 * Hook d'Intégration WooCommerce pour la Nexus Matrix (Client)
 */
add_action('woocommerce_add_to_cart', 'nexus_track_add_to_cart_event', 10, 6);
function nexus_track_add_to_cart_event($cart_item_key, $product_id, $quantity) {
    if (!$product_id) return;
    $product = wc_get_product($product_id);
    $payload = array(
        'event' => 'cart_adding',
        'item' => $product ? $product->get_name() : 'Produit',
        'price' => $product ? $product->get_price() : 0,
        'quantity' => $quantity,
        'visitor_ip' => $_SERVER['REMOTE_ADDR']
    );
    wp_remote_post('https://nexuswp.pro/api/telemetry', array(
        'method' => 'POST',
        'body' => json_encode($payload),
        'headers' => array('Content-Type' => 'application/json'),
        'sslverify' => false
    ));
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phpSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (currentView === 'privacy') return <PrivacyPolicy onBack={() => { setCurrentView('home'); window.scrollTo(0,0); }} lang={lang} />;
  if (currentView === 'terms') return <TermsOfService onBack={() => { setCurrentView('home'); window.scrollTo(0,0); }} lang={lang} />;

  const paidPlans = plans.filter(p => p.price > 0);
  const trialPlan = plans.find(p => p.id === 'trial' || p.price === 0);

  return (
    <div className="min-h-screen bg-[#030712] text-[#f3f4f6] selection:bg-blue-600/30 font-sans overflow-x-hidden relative">
      {/* Grid d'arrière plan subtile */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.12] z-0 pointer-events-none" />

      {/* Orbes Lumineuses Fluides */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-10 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* HEADER / NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/60 bg-[#030712]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">Nexus WP AI</span>
              <span className="block text-[8px] tracking-[0.25em] text-blue-400 font-extrabold uppercase leading-none mt-1">E-Commerce Protocol</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => { setActiveSubPage('home'); setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }}
              className={cn("text-xs font-semibold transition-colors uppercase tracking-[0.15em] relative py-1 group", activeSubPage === 'home' ? "text-white" : "text-gray-400 hover:text-white")}
            >
              {t('nav_back_home', 'Accueil')}
              <span className={cn("absolute bottom-0 left-0 h-[2px] bg-blue-500 transition-all duration-300", activeSubPage === 'home' ? "w-full" : "w-0 group-hover:w-full")} />
            </button>

            {activeSubPage === 'home' && (
              <>
                <a href="#radar" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.15em] relative py-1 group">
                  {t('nav_radar', 'Radar Live')}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
                </a>
                <a href="#ai-automation" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.15em] relative py-1 group">
                  {t('nav_ai', "L'IA Autonome")}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
                </a>
              </>
            )}

            <button 
              onClick={() => { setActiveSubPage('showcase'); setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }}
              className={cn("text-xs font-semibold transition-colors uppercase tracking-[0.15em] relative py-1 group", activeSubPage === 'showcase' ? "text-white font-black" : "text-gray-400 hover:text-white")}
            >
              {t('nav_showcase', 'Avantages IA ✨')}
              <span className={cn("absolute bottom-0 left-0 h-[2px] bg-blue-500 transition-all duration-300", activeSubPage === 'showcase' ? "w-full" : "w-0 group-hover:w-full")} />
            </button>

            <button
              onClick={() => {
                setActiveSubPage('home');
                setTimeout(() => {
                  const el = document.getElementById('pricing');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.15em] relative py-1 group"
            >
              {t('nav_pricing', 'Tarifs')}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {/* Lang Switcher */}
            <div className="flex items-center bg-gray-900 border border-gray-800 p-1 rounded-full text-[10px] font-bold">
              <button 
                onClick={() => onLangChange('fr')} 
                className={cn("px-2.5 py-1 rounded-full transition-colors", lang === 'fr' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-gray-500 hover:text-gray-300")}
              >
                FR
              </button>
              <button 
                onClick={() => onLangChange('en')} 
                className={cn("px-2.5 py-1 rounded-full transition-colors", lang === 'en' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-gray-500 hover:text-gray-300")}
              >
                EN
              </button>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => onSelectPlan('none')} 
              id="cta-nav-access"
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_15px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all duration-300"
            >
              {t('nav_access_app', "Accéder à l'application")}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTROLLER */}
      <AnimatePresence mode="wait">
        {activeSubPage === 'showcase' ? (
          <motion.div
            key="showcase"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="pt-10"
          >
            <AdvantagesShowcase 
              lang={lang} 
              onGetStarted={() => onSelectPlan('trial')} 
              onGoToPricing={() => {
                setActiveSubPage('home');
                setTimeout(() => {
                  const el = document.getElementById('pricing');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* HERO SECTION */}
            <section className="relative pt-40 pb-24 md:pt-48 md:pb-36 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge de réassurance SEO */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-wider mb-8 animate-fade-in shadow-[0_0_15px_rgba(37,99,235,0.05)]">
            <Sparkle className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
            <span>{t('hero_badge', 'Optimisation SEO Catalogue certifiée 100% Admissible Google')}</span>
          </div>

          {/* H1 Title ultra-puissant et sans mots à risque */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
            <span className="block text-gray-400 text-lg uppercase tracking-[0.3em] font-medium mb-3">Nexus WP AI</span>
            {lang === 'fr' ? (
              <>
                L' <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Automatisation WooCommerce</span> Révolutionnée par l' <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Intelligence Artificielle E-commerce</span>
              </>
            ) : (
              <>
                Autonomous <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">WooCommerce Automation</span> Orchestrated by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Enterprise Scale Retail AI</span>
              </>
            )}
          </h1>

          {/* Sous-titre pro */}
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
            {t('hero_subtitle', "Connectez votre boutique en 2 minutes chrono. Une intégration native et indolore via des hooks PHP asynchrones légers qui exécutent nos algorithmes d'IA sans jamais ralentir vos opérations.")}
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <button 
              onClick={() => onSelectPlan('trial')}
              id="hero-cta-demo"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-[0_8px_30px_rgba(37,99,235,0.3)] hover:scale-[1.02] transition-all duration-305 flex items-center justify-center gap-2 shrink-0"
            >
              {t('hero_cta_demo', 'Démo Gratuite 24h')} <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button 
              onClick={() => onSelectPlan('none')}
              id="hero-cta-login"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 rounded-2xl text-xs font-black uppercase tracking-wider hover:scale-[1.02] transition-all duration-305 flex items-center justify-center shrink-0"
            >
              {t('hero_cta_login', 'Se Connecter')}
            </button>
          </div>

          {/* KPI Mini-grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto bg-gray-950/60 border border-gray-800/80 p-8 rounded-3xl backdrop-blur-md">
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{t('hero_kpi_1_title', '< 2 Min')}</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 mt-1">{t('hero_kpi_1_desc', 'Installation WP Code')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">{t('hero_kpi_2_title', 'ASYNCHRONE')}</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 mt-1">{t('hero_kpi_2_desc', '0% Charge Serveur local')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">{t('hero_kpi_3_title', '100% SÛR')}</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 mt-1">{t('hero_kpi_3_desc', 'Garantie Google Safe SEO')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">{t('hero_kpi_4_title', 'EN DIRECT')}</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 mt-1">{t('hero_kpi_4_desc', 'Télémétrie en Direct')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION RADAR: SUIVI D'ACTIVITÉ EN TEMPS RÉEL */}
      <section id="radar" className="py-24 border-t border-gray-800/60 bg-[#04091a]/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texte descriptif */}
            <div className="lg:col-span-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-widest mb-6">
                <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{t('radar_badge', 'Le Radar Télémétrique Live')}</span>
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                {t('radar_title', 'Surveillance Active & Télémétrie en Temps Réel')}
              </h2>
              
              <p className="text-base text-gray-400 leading-relaxed mb-6">
                {t('radar_desc', "Ne travaillez plus à l'aveugle. Notre module de télémétrie ultra-sophistiqué s'intègre sous forme de script asynchrone non-bloquant et capte les événements clés de votre boutique WooCommerce à la vitesse de l'éclair.")}
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {t('radar_feat_1_title', 'Capture des Paniers Chauds')}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('radar_feat_1_desc', "Sachez instantanément quel visiteur vient d'initier un panier, pour qui et sur quel produit précis.")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {t('radar_feat_2_title', 'Comportement & Heatmap dynamique')}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('radar_feat_2_desc', "Visualisez en direct la profondeur de défilement des fiches produits, l'attention utilisateur et la friction utilisateur.")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {t('radar_feat_3_title', 'Initiations de Paiement à la Milliseconde')}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('radar_feat_3_desc', "Enregistrement instantané des tentatives de validation de commande, fournissant des taux d'abandon précis.")}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual Simulator (L'immersion Cyberpunk interactive) */}
            <div className="lg:col-span-7 bg-gray-950/80 border border-gray-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              {/* Entête du Panel */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-ping shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] text-white uppercase leading-none">NEXUS_TELEMETRY::RADAR_FEED</h4>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">
                      {t('radar_status_active', 'SYNCHRONISATION ACTIVE EN DIRECT')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl">
                  <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                  <span className="text-[8px] font-mono text-blue-400 font-bold uppercase">
                    {t('radar_ping', 'PING: 14ms')}
                  </span>
                </div>
              </div>

              {/* Feed du Radar interactif */}
              <div className="space-y-3 relative z-10 min-h-[260px]">
                <AnimatePresence mode="popLayout">
                  {telemetryFeed.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1 - idx * 0.25, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          item.event === 'completed_order' ? "bg-emerald-500/10 text-emerald-400" :
                          item.event === 'order_init' ? "bg-purple-500/10 text-purple-400" :
                          item.event === 'cart_adding' ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {item.event === 'completed_order' ? <CheckCircle2 className="w-4 h-4" /> :
                           item.event === 'order_init' ? <Flame className="w-4 h-4" /> :
                           item.event === 'cart_adding' ? <MousePointer className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[11px] font-bold text-white truncate leading-tight mb-0.5">{item.item}</p>
                          <div className="flex items-center gap-1.5 text-[8px] font-mono text-gray-500">
                            <span className="text-gray-400 font-bold">{item.geo}</span>
                            <span>•</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-white font-black">{item.value}</span>
                        <span className={cn(
                          "block mt-1 px-2 py-0.5 rounded text-[7px] font-mono font-extrabold uppercase leading-none text-center",
                          item.event === 'completed_order' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          item.event === 'order_init' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                          item.event === 'cart_adding' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                          {item.badge}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Decorative design element - Background Scan lines */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none z-10" />
              <div className="absolute top-[40%] right-[10%] w-72 h-72 rounded-full border border-blue-500/5 animate-pulse pointer-events-none" />
              <div className="absolute top-[40%] right-[10%] w-48 h-48 rounded-full border border-blue-500/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION IA AUTONOME */}
      <section id="ai-automation" className="py-24 border-t border-gray-800/60 bg-[#030712] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[9px] font-black uppercase tracking-widest mb-6">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('ai_badge', 'Gouvernance & Moteur Intellectuel')}</span>
            </div>
            
            <h2 className="text-3 shadow-sm text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
              {lang === 'en' ? (
                <>E-Commerce <span className="text-blue-400">Artificial Intelligence</span> Running Constantly</>
              ) : (
                <>L'<span className="text-blue-400">Intelligence Artificielle E-commerce</span> en Arrière-Plan</>
              )}
            </h2>
            
            <p className="text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('ai_desc', "Explorez nos modules d'intelligence opérationnelle qui agissent de manière 100% autonome et sécurisée pour propulser les performances de votre activité.")}
            </p>
          </div>

          {/* Interactive Core Selectors */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Navigation Tabs (Bento buttons) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <button 
                onClick={() => setActiveAISector('pricer')} 
                className={cn(
                  "p-6 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 hover:translate-x-1",
                  activeAISector === 'pricer' 
                    ? "bg-gradient-to-r from-blue-900/10 to-indigo-900/10 border-blue-500/30 shadow-lg shadow-blue-500/5" 
                    : "bg-gray-950/60 border-gray-900/80 hover:border-gray-800"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", activeAISector === 'pricer' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-gray-900 border-gray-800 text-gray-500")}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {t('ai_tab_pricer_title', 'Smart Pricer')}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-normal mt-1">
                    {t('ai_tab_pricer_desc', "Tarification dynamique IA basée sur la demande, l'offre concurrente et les flux comportementaux d'achats.")}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => setActiveAISector('stock')} 
                className={cn(
                  "p-6 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 hover:translate-x-1",
                  activeAISector === 'stock' 
                    ? "bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border-purple-500/30 shadow-lg shadow-purple-500/5" 
                    : "bg-gray-950/60 border-gray-900/80 hover:border-gray-800"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", activeAISector === 'stock' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-gray-900 border-gray-800 text-gray-500")}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {t('ai_tab_stock_title', 'Stock Optimizer')}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-normal mt-1">
                    {t('ai_tab_stock_desc', "Gestion de stock intelligente prédictive pour anticiper et éviter les ruptures préjudiciables.")}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => setActiveAISector('seo')} 
                className={cn(
                  "p-6 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 hover:translate-x-1",
                  activeAISector === 'seo' 
                    ? "bg-gradient-to-r from-pink-900/10 to-purple-900/10 border-pink-500/30 shadow-lg shadow-pink-500/5" 
                    : "bg-gray-900/60 border-gray-900/80 hover:border-gray-800"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", activeAISector === 'seo' ? "bg-pink-500/10 border-pink-500/20 text-pink-400" : "bg-gray-900 border-gray-800 text-gray-500")}>
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {t('ai_tab_seo_title', 'Générateur & Correcteur SEO')}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-normal mt-1">
                    {t('ai_tab_seo_desc', "Optimisation SEO catalogue par espionnage concurrentiel international sans limite de langue.")}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => setActiveAISector('security')} 
                className={cn(
                  "p-6 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 hover:translate-x-1",
                  activeAISector === 'security' 
                    ? "bg-gradient-to-r from-emerald-900/10 to-teal-900/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5" 
                    : "bg-gray-950/60 border-gray-900/80 hover:border-gray-800"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", activeAISector === 'security' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-gray-950 border-gray-900 text-gray-500")}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {t('ai_tab_security_title', 'Cyber Shield Agent')}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-normal mt-1">
                    {t('ai_tab_security_desc', "Protection active autonome contre intrusions, brute-force Wordpress et injections de scripts sémantiques.")}
                  </p>
                </div>
              </button>
            </div>

            {/* Content Display Panel */}
            <div className="lg:col-span-8 bg-[#070b19]/60 border border-gray-800 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Cpu className="w-48 h-48 text-indigo-500" />
              </div>

              <AnimatePresence mode="wait">
                {activeAISector === 'pricer' && (
                  <motion.div 
                    key="pricer"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="text-left"
                  >
                    <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      {t('ai_pricer_tag', 'MODULE SMART PRICER PROTOCOL')}
                    </span>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-4">
                      {t('ai_pricer_headline', 'Tarification dynamique IA : Maximisez Vos Marges en Continu')}
                    </h3>
                    
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {t('ai_pricer_body', "Notre algorithme ajuste de manière autonome les prix de vos articles WooCommerce après avoir analysé en temps réel l'offre environnante des marketplaces concurrentes, le niveau de stocks disponible, et la température comportementale des visiteurs (les paniers chauds et pings télémétriques).")}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/80 border border-gray-900 rounded-2xl p-6 mb-4">
                      <div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {t('ai_pricer_indicator_title', 'INDICATEURS CLIENT PRINCIPAUX')}
                        </span>
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-gray-400 flex items-center justify-between">
                            <span>{t('ai_pricer_indicator_1', "Taux d'ajustement du prix :")}</span>
                            <span className="text-white font-mono font-bold">{t('ai_pricer_indicator_1_val', '+2.3% moyen')}</span>
                          </p>
                          <p className="text-xs text-gray-400 flex items-center justify-between">
                            <span>{t('ai_pricer_indicator_2', 'Sensibilité de conversion client :')}</span>
                            <span className="text-white font-mono font-bold">{t('ai_pricer_indicator_2_val', 'Mesurée en continu')}</span>
                          </p>
                        </div>
                      </div>
                      <div className="border-l border-gray-800 md:pl-6">
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {t('ai_pricer_value_title', "VALUE DE COMPORTEMENTS D'ACHATS")}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">
                          {t('ai_pricer_value_desc', "Dès qu'un client hésite ou abandonne un panier, l'algorithme calcule le point d'inflexion optimal pour inciter l'achat sans dévaluer le produit.")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAISector === 'stock' && (
                  <motion.div 
                    key="stock"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="text-left"
                  >
                    <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                      {t('ai_stock_tag', 'MODULE STOCK OPTIMIZER CORE')}
                    </span>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-4">
                      {t('ai_stock_headline', 'Gestion de stock intelligente : Ne Perdez Plus de Ventes Sur Rupture')}
                    </h3>
                    
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {t('ai_stock_body', 'Le moteur prédictif analyse continuellement vos courbes de vente saisonnières et quotidiennes. Il évalue la vélocité exacte de votre catalogue WooCommerce pour vous notifier des moments idéaux de recommandations fournisseurs.')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/80 border border-gray-900 rounded-2xl p-6 mb-4">
                      <div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {t('ai_stock_indicator_title', 'STATUT PREDICTIF ACTU')}
                        </span>
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-gray-400 flex items-center justify-between">
                            <span>{t('ai_stock_indicator_1', 'Précision algorithmique :')}</span>
                            <span className="text-purple-400 font-mono font-bold">{t('ai_stock_indicator_1_val', '98.4%')}</span>
                          </p>
                          <p className="text-xs text-gray-400 flex items-center justify-between">
                            <span>{t('ai_stock_indicator_2', 'Temps de prévision :')}</span>
                            <span className="text-white font-mono font-bold">{t('ai_stock_indicator_2_val', "Jusqu'à 45 jours")}</span>
                          </p>
                        </div>
                      </div>
                      <div className="border-l border-gray-800 md:pl-6">
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {t('ai_stock_value_title', 'ALERTES RUPTURES INTÉGRÉES')}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">
                          {t('ai_stock_value_desc', "Génération de fiches d'approvisionnement automatisées connectées à des rapports PDF configurés pour votre équipe d'expédition.")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAISector === 'seo' && (
                  <motion.div 
                    key="seo"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="text-left"
                  >
                    <span className="text-[10px] font-mono font-black text-pink-400 uppercase tracking-widest bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20">
                      {t('ai_seo_tag', 'GÉNÉRATEUR & CORRECTEUR SEO PROTOCOL')}
                    </span>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-4">
                      {t('ai_seo_headline', 'Optimisation SEO catalogue & Analyse concurrentielle e-commerce internationale')}
                    </h3>
                    
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {t('ai_seo_body', "Notre IA n'écrit pas à l'aveugle. Elle espionne et analyse le positionnement des mots-clés des concurrents à l'international dans n'importe quel pays ciblé (USA, UK, Allemagne, Asie...). Elle réécrit ensuite l'intégralité ou corriger les faiblesses sémantiques de vos descriptions de produits WooCommerce avec un lexique haut de gamme, hyper-admissible par les robots de Google.")}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/80 border border-gray-900 rounded-2xl p-6 mb-4">
                      <div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {t('ai_seo_indicator_title', 'EXTRACTION GÉOGRAPHIQUE')}
                        </span>
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-gray-400 flex items-center justify-between">
                            <span>{t('ai_seo_indicator_1', 'Pays concurrentiels scannés :')}</span>
                            <span className="text-pink-400 font-mono font-bold">{t('ai_seo_indicator_1_val', 'Tous pays supportés')}</span>
                          </p>
                          <p className="text-xs text-gray-400 flex items-center justify-between">
                            <span>{t('ai_seo_indicator_2', 'Volume lexical SEO :')}</span>
                            <span className="text-white font-mono font-bold">{t('ai_seo_indicator_2_val', 'Rich Lexicon 100% Google')}</span>
                          </p>
                        </div>
                      </div>
                      <div className="border-l border-gray-800 md:pl-6">
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {t('ai_seo_value_title', 'RÉDACTION AUTO-VALIDE')}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">
                          {t('ai_seo_value_desc', "Plus besoin de rédacteurs coûteux. L'IA génère et structure automatiquement les métadonnées de raccord d'avis, les balises de titres alt, et les schémas enrichis.")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAISector === 'security' && (
                  <motion.div 
                    key="security"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="text-left"
                  >
                    <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      {t('ai_security_tag', 'BOUCLIER CYBER METRIC SHIELD')}
                    </span>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-4">
                      {t('ai_security_headline', 'Sécurisez votre WordPress et WooCommerce en temps réel')}
                    </h3>
                    
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {t('ai_security_body', "Nexus Cyber Shield inspecte de manière autonome le trafic entrant et les requêtes suspectes pour prémunir votre boutique contre le piratage, l'espionnage de vulnérabilités et les attaques brute-force. Toute menace est isolée et l'IP bannie instantanément.")}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/80 border border-gray-900 rounded-2xl p-6 mb-4">
                      <div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {t('ai_security_indicator_title', 'INDICATEURS DÉFENSIFS')}
                        </span>
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-gray-400 flex items-center justify-between">
                            <span>{t('ai_security_indicator_1', 'Efficacité du pare-feu :')}</span>
                            <span className="text-emerald-400 font-mono font-bold">{t('ai_security_indicator_1_val', '99.9%')}</span>
                          </p>
                          <p className="text-xs text-gray-400 flex items-center justify-between">
                            <span>{t('ai_security_indicator_2', 'Latence de détection :')}</span>
                            <span className="text-white font-mono font-bold">{t('ai_security_indicator_2_val', '< 1 milliseconde')}</span>
                          </p>
                        </div>
                      </div>
                      <div className="border-l border-gray-800 md:pl-6">
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {t('ai_security_value_title', 'LIVRAISON DE PREUVES LIVE')}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">
                          {t('ai_security_value_desc', "Rapports d'incident automatiques, logs interactifs et bannissements d'adresses IP suspectes synchronisés en direct sur votre console centrale.")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action and security guarantee */}
              <div className="mt-auto border-t border-gray-800/60 pt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{t('ai_tls_secure', 'Processus de calcul chiffré TLS 1.3')}</span>
                </div>
                <button 
                  onClick={() => onSelectPlan('none')} 
                  id="secter-cta"
                  className="px-6 py-2.5 rounded-xl text-[10px] font-mono border border-gray-800 text-white hover:bg-gray-900 flex items-center gap-1.5 transition-all"
                >
                  {t('ai_cta_run', "Démarrer l'agent autonome")} <Zap className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SÉCURITÉ, INTEGRATION & ARCHITECTURE (WPCode, Asynchrone, Nexus Matrix) */}
      <section className="py-24 border-t border-gray-800/60 bg-[#040817]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[9px] font-black uppercase tracking-widest mb-6">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('sec_badge', 'Indolore & Ultra-Sûr')}</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
              {t('sec_title', 'Une Architecture Sans Code & Certifiée Zéro Latence')}
            </h2>
            
            <p className="text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {lang === 'en' ? (
                <>The connection takes place bypassing complex plugins. Simply add the async tracking PHP hook via the free <span className="text-white font-bold">WPCode</span> utility or your child-theme.</>
              ) : (
                <>La connexion se fait sans installer d'extension lourde ou de plugins WordPress malveillants. Copiez simplement l'extrait de code au sein du plugin gratuit <span className="text-white font-bold">WPCode</span> ou de vos thèmes enfants.</>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Explications Étape par Étape */}
            <div className="lg:col-span-5 text-left space-y-6">
              <div className="p-6 bg-gray-950/40 border border-gray-900 rounded-2xl relative group">
                <span className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 rounded-full text-white text-[9px] font-bold">{t('sec_step1_badge', 'Étape 01')}</span>
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 pt-1">{t('sec_step1_title', 'Installation WPCode ultra-facile')}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t('sec_step1_desc', "Copiez notre hook asynchrone universel. Collez-le dans votre extension WPCode d'insertion de scripts ou directement dans votre plugin personnalisé.")}
                </p>
              </div>

              <div className="p-6 bg-gray-950/40 border border-gray-900 rounded-2xl relative group">
                <span className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 rounded-full text-white text-[9px] font-bold">{t('sec_step2_badge', 'Étape 02')}</span>
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 pt-1">{t('sec_step2_title', 'Scripts Asynchrones Non-Bloquants')}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t('sec_step2_desc', "Le script s'exécute de façon asynchrone en arrière-plan client. Il ne ralentira jamais la navigation de vos acheteurs, préservant votre temps de réponse et vos scores e-commerce Core Web Vitals.")}
                </p>
              </div>

              <div className="p-6 bg-gray-950/40 border border-gray-900 rounded-2xl relative group">
                <span className="absolute -top-3 left-6 px-3 py-1 bg-purple-600 rounded-full text-white text-[9px] font-bold">{t('sec_step3_badge', 'Étape 03')}</span>
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 pt-1">{t('sec_step3_title', 'Nexus Matrix API Chiffrée')}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t('sec_step3_desc', "La communication s'établit via une connexion sécurisée HTTPS signée par chiffrement SSL. Les calculs sémantiques s’opèrent de façon externe sur \"Nexus Matrix\" évitant toute charge de base de données.")}
                </p>
              </div>
            </div>

            {/* Code Snippet Interactive Viewer */}
            <div className="lg:col-span-7 bg-[#020409] border border-gray-800 rounded-[2.5rem] p-6 shadow-3xl text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">woocommerce_tracking_hook.php</span>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-[9px] font-mono text-gray-300 transition-colors"
                >
                  {copiedSnippet ? t('sec_copied', 'Copié !') : t('sec_copy', 'Copier')}
                </button>
              </div>

              <pre className="p-4 bg-gray-950 border border-gray-900 rounded-xl font-mono text-[9px] text-gray-400 overflow-x-auto max-h-[320px] leading-relaxed scrollbar-thin scrollbar-thumb-gray-800 select-all">
                <code>{phpSnippet}</code>
              </pre>

              <div className="mt-4 flex items-center gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-[8px] font-mono text-gray-500 uppercase">{t('sec_compat', 'Compatible avec WooCommerce 6.0+, Gutenberg, Elementor, Divi et WP Rocket.')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS & PACKS SÉLECTIONNABLES */}
      <section id="pricing" className="py-24 border-t border-gray-800/60 bg-[#030712] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4 block">{t('price_badge', 'LICENCES PREMIUM')}</span>
            <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter text-white">
              {t('price_title', 'SÉLECTIONNEZ VOTRE PACK NEXUS')}
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full mt-4" />
          </div>

          {/* Currency Switcher Overlay */}
          <div className="flex flex-col items-center gap-2.5 mb-8">
            <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.25em]">
              {lang === 'fr' ? 'Convertisseur de Devise / Détection Marché' : 'Currency Converter / Market Matcher'}
            </span>
            <div className="bg-gray-950/80 border border-gray-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setSelectedCurrency('EUR')}
                className={cn(
                  "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  selectedCurrency === 'EUR' ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-gray-500 hover:text-gray-400"
                )}
              >
                € Euro {lang === 'fr' ? '[DÉFAUT]' : '[DEFAULT]'}
              </button>
              <button
                onClick={() => setSelectedCurrency('USD')}
                className={cn(
                  "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  selectedCurrency === 'USD' ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-gray-500 hover:text-gray-400"
                )}
              >
                $ Dollar {lang === 'fr' ? '(CONVERT)' : '(CONVERSION)'}
              </button>
            </div>
          </div>

          {/* Billing Cycle Selector */}
          <div className="flex justify-center mb-16">
            <div className="bg-gray-950/80 border border-gray-800 p-1.5 rounded-3xl flex items-center relative gap-1 shadow-2xl">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "relative z-10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  billingCycle === 'monthly' ? "text-white" : "text-gray-500 hover:text-gray-400"
                )}
              >
                {t('price_monthly', 'Mensuel')}
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "relative z-10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  billingCycle === 'yearly' ? "text-white" : "text-gray-500"
                )}
              >
                {t('price_yearly', 'Annuel')}
                <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-lg text-[8px] font-bold">-{annualDiscount}%</span>
              </button>
              
              <motion.div 
                className="absolute h-[calc(100%-12px)] bg-blue-600 rounded-2xl"
                initial={false}
                animate={{
                  left: billingCycle === 'monthly' ? 6 : '50%',
                  width: 'calc(50% - 9px)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>
          </div>

          {/* Highlight Pack de Lancement (Horizontal) */}
          {(() => {
            const launchPlan = plans.find(p => p.isLaunchPack || p.id === 'launch');
            if (!launchPlan) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 max-w-7xl mx-auto p-[1.5px] rounded-[3rem] bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.25)] relative overflow-hidden group text-center md:text-left"
              >
                {/* Background ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-600/10 to-amber-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="bg-[#050814] rounded-[2.95rem] p-8 md:p-10 relative z-10 flex flex-col xl:flex-row gap-8 xl:gap-12 items-stretch justify-between">
                  {/* Left / Info Part */}
                  <div className="flex-1 space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="px-4 py-1.5 bg-amber-500 text-black rounded-full text-[9px] font-black uppercase tracking-[0.25em] italic flex items-center gap-1.5 animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" />
                          {lang === 'fr' ? 'OFFRE DE LANCEMENT' : 'LAUNCH OFFER'}
                        </span>
                        <span className="px-3.5 py-1 bg-purple-500/10 border border-purple-500/35 text-purple-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {lang === 'fr' ? 'À VIE / UNIQUE' : 'LIFETIME / ONE-TIME'}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl sm:text-4xl font-display font-black italic uppercase tracking-tighter text-white">
                          {launchPlan.name}
                        </h3>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mt-2 max-w-xl mx-auto md:mx-0">
                          {launchPlan.description || (lang === 'fr' ? 'La suite complète sans aucune redevance mensuelle. Rejoignez l\'infrastructure Nexus.' : 'The complete suite without any monthly royalties. Join the Nexus infrastructure.')}
                        </p>
                      </div>
                    </div>

                    {/* Privileges Block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/40 p-5 rounded-2xl border border-gray-900/60 text-left">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span>{lang === 'fr' ? 'PRIVILÈGES À VIE' : 'LIFETIME PRIVILEGES'}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
                          {lang === 'fr' 
                            ? 'Zéro abonnement. Évitez les augmentations de prix futures et gardez votre accès actif à vie.' 
                            : 'Zero subscription. Lock in this price forever and keep your active lifetime access.'}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          <span>{lang === 'fr' ? 'ÉVOLUTIONS & MODULES FUTURS' : 'ALL FUTURE UPGRADES'}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
                          {lang === 'fr' 
                            ? 'Profitez automatiquement de tous les nouveaux modules IA, mises à jour architecturales et extensions futures.' 
                            : 'Automatically benefit from all coming AI modules, framework improvements, and future extensions.'}
                        </p>
                      </div>
                    </div>

                    {/* Price and Counter */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 xl:gap-8 bg-gray-950/60 p-6 rounded-3xl border border-gray-900/80">
                      <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
                          {getConvertedPrice(launchPlan.price).value}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-gray-500">
                          {getConvertedPrice(launchPlan.price).symbol}
                        </span>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest ml-2 px-2.5 py-1 bg-amber-500/5 border border-amber-500/15 rounded-full">
                          {lang === 'fr' ? 'PAIEMENT UNIQUE' : 'ONE-TIME PAYMENT'}
                        </span>
                      </div>

                      <div className="h-px sm:h-12 w-full sm:w-px bg-gray-800" />

                      {/* Site Limit */}
                      <div className="flex flex-col justify-center">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{lang === 'fr' ? 'Sites Autorisés' : 'Authorized Sites'}</span>
                        <span className="text-lg sm:text-xl font-black text-blue-400 uppercase tracking-wide">
                          {launchPlan.site_limit} {launchPlan.site_limit > 1 ? 'SITES' : 'SITE'}
                        </span>
                      </div>

                      <div className="h-px sm:h-12 w-full sm:w-px bg-gray-800" />

                      {/* Launch stock bar */}
                      <div className="flex-1 space-y-1.5 min-w-[200px]">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-amber-500">
                          <span>{lang === 'fr' ? 'PROMOTION RESTREINTE' : 'LIMITED STOCK'}</span>
                          <span>{launchPlan.launchStockSold} / {launchPlan.launchStockLimit}</span>
                        </div>
                        <div className="h-1.5 bg-gray-950 rounded-full w-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, (launchPlan.launchStockSold / launchPlan.launchStockLimit) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[7.5px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                          {lang === 'fr' ? `Uniquement ${Math.max(0, launchPlan.launchStockLimit - launchPlan.launchStockSold)} packs disponibles !` : `Only ${Math.max(0, launchPlan.launchStockLimit - launchPlan.launchStockSold)} remaining!`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right / Features Part */}
                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4 text-center md:text-left">
                        {lang === 'fr' ? 'TOUS LES MODULES COMPLETS INCLUS :' : 'ALL PREMIUM MODULES INCLUDED:'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {launchPlan.features?.map((feat: string, fIdx: number) => (
                          <div key={fIdx} className="flex items-center gap-3 px-4 py-3 bg-gray-950/40 rounded-2xl border border-gray-900 text-left hover:border-amber-500/20 transition-all">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-gray-300">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => onSelectPlan(launchPlan.id)}
                      className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:brightness-110 rounded-2xl text-xs font-black uppercase tracking-[0.3em] font-display transition-all duration-300 shadow-xl shadow-amber-500/10 active:scale-[0.98]"
                    >
                      {lang === 'fr' ? 'S\'INSCRIRE AU PACK DE LANCEMENT' : 'REGISTER FOR THE LAUNCH PACK'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch justify-center max-w-7xl mx-auto">
            {plans.filter(p => !p.isLaunchPack && p.id !== 'launch').map((plan, idx) => {
              const planId = String(plan.id).toLowerCase();
              const isTrial = planId === 'trial' || plan.price === 0;
              const isFeatured = planId === 'pro' && !plan.isLaunchPack;
              
              const monthlyPrice = (plan.is_promo && plan.promo_price ? plan.promo_price : plan.price);
              const displayPrice = plan.isLifetime 
                ? plan.price 
                : (billingCycle === 'monthly' ? monthlyPrice : Math.floor((monthlyPrice * 12) * (1 - annualDiscount / 100)));

              return (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  viewport={{ once: true }}
                  className={cn(
                    "p-[1px] rounded-[2.5rem] transition-all duration-500 flex flex-col relative overflow-hidden h-full",
                    isFeatured 
                      ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-[0_20px_50px_rgba(37,99,235,0.2)] lg:scale-105 z-10" 
                      : plan.isLaunchPack
                        ? "bg-gradient-to-br from-amber-500/80 to-purple-500/80 shadow-[0_20px_50px_rgba(245,158,11,0.15)] scale-100"
                        : "bg-gray-800/80 hover:bg-gray-700/80"
                  )}
                >
                  <div className="bg-[#060a16] rounded-[2.45rem] p-8 h-full flex flex-col justify-between items-center text-center relative overflow-hidden">
                    {isFeatured && (
                      <div className="absolute top-5 right-5 bg-blue-600 px-3 py-1 rounded-full text-white text-[8px] font-black uppercase tracking-wider">
                        {t('price_popular', 'Populaire')}
                      </div>
                    )}

                    {plan.isLaunchPack && (
                      <div className="absolute top-5 right-5 px-3 py-1 bg-amber-500 text-black rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-950/25 italic flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-2.5 h-2.5 text-current" />
                        {lang === 'fr' ? 'LANCEMENT' : 'LAUNCH'}
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-2">{plan.name}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider min-h-[30px] flex items-center justify-center px-4">
                        {plan.description || (isTrial ? (lang === 'fr' ? "Raccord temporaire d'évaluation" : "Temporary evaluation slot") : (lang === 'fr' ? "Idéal pour démarrer l'automatisation" : "Ideal for starting automation"))}
                      </p>
                    </div>

                    <div className="flex flex-col items-center my-4">
                      <div className="flex items-baseline gap-1 animate-fade-in">
                        <span className="text-5xl font-extrabold tracking-tight text-white">
                          {isTrial ? 0 : getConvertedPrice(displayPrice).value}
                        </span>
                        <span className="text-lg font-bold text-gray-500">
                          {isTrial ? '' : getConvertedPrice(displayPrice).symbol}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          / {isTrial ? (
                            (() => {
                              const trialDuration = plan.duration_hours !== undefined ? Number(plan.duration_hours) : 24;
                              return (trialDuration % 24 === 0)
                                ? `${trialDuration / 24} ${lang === 'fr' ? `JOUR${(trialDuration / 24) > 1 ? 'S' : ''}` : `DAY${(trialDuration / 24) > 1 ? 'S' : ''}`}`
                                : (trialDuration >= 1)
                                  ? `${trialDuration} ${lang === 'fr' ? `HEURE${trialDuration > 1 ? 'S' : ''}` : `HOUR${trialDuration > 1 ? 'S' : ''}`}`
                                  : `${(trialDuration || 1) * 60} MIN`;
                            })()
                          ) : plan.isLifetime ? (lang === 'fr' ? 'À vie' : 'Lifetime') : (billingCycle === 'monthly' ? (lang === 'fr' ? 'Mois' : 'Month') : (lang === 'fr' ? 'An' : 'Year'))}
                        </span>
                      </div>

                      {/* Site count limit badge */}
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-2 px-2.5 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full">
                        {plan.site_limit} {plan.site_limit > 1 ? 'SITES' : 'SITE'}
                      </span>
                    </div>

                    {plan.isLaunchPack && (
                      <div className="w-full my-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-1.5 text-center">
                        <div className="flex justify-between items-center text-[7.5px] font-black uppercase tracking-wider text-amber-500">
                          <span>{lang === 'fr' ? 'Inscrits de Lancement' : 'Launch Sales'}</span>
                          <span>{plan.launchStockSold} / {plan.launchStockLimit}</span>
                        </div>
                        <div className="h-1 bg-gray-950 rounded-full w-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, (plan.launchStockSold / plan.launchStockLimit) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[7.5px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                          {lang === 'fr' ? `Uniquement ${Math.max(0, plan.launchStockLimit - plan.launchStockSold)} restants !` : `Only ${Math.max(0, plan.launchStockLimit - plan.launchStockSold)} remaining!`}
                        </p>
                      </div>
                    )}

                    {/* Features List */}
                    <div className="w-full space-y-2.5 my-6">
                      {plan.features?.slice(0, 5).map((feat: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-950/60 rounded-xl border border-gray-900 text-left">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-300 truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => onSelectPlan(plan.id)}
                      className={cn(
                        "w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 mt-auto",
                        isFeatured 
                           ? "bg-white text-black shadow-lg shadow-white/5 active:scale-[0.98]" 
                           : plan.isLaunchPack
                             ? "bg-amber-500 hover:bg-amber-400 text-black font-black hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.98]"
                             : "bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98]"
                      )}
                    >
                      {isTrial ? (lang === 'fr' ? 'Activer Essai Gratuit' : 'Start Free Trial') : (lang === 'fr' ? 'Sélectionner ce Pack' : 'Select Plan')}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX ARCHITECTURE */}
      <section id="comparison" className="py-24 bg-[#02050e] border-t border-gray-850 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3 shadow-sm text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
              {t('matrix_title', 'Matrice de Privilèges : Comparatif Détaillé')}
            </h2>
            <div className="w-20 h-1 bg-indigo-500 mx-auto rounded-full mt-4" />
          </div>
          
          <ComparisonTable config={matrixConfig} selectedCurrency={selectedCurrency} />
        </div>
      </section>

          </motion.div>
        )}
      </AnimatePresence>

      {/* PIED DE PAGE (Footer) */}
      <footer className="border-t border-gray-800 bg-[#02050f] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-4 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Nexus WP AI</span>
              </div>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed max-w-sm mb-6">
                {t('foot_tagline', "La plateforme d'automatisation e-commerce sémantique de nouvelle génération. Développée pour libérer le potentiel SEO de WooCommerce.")}
              </p>
              <div className="mt-6">
                <a 
                  href="https://www.producthunt.com/products/nexus-wp-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-nexus-wp-ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-105 duration-200"
                >
                  <img 
                    alt="Nexus WP AI - Unify, automate & control WordPress with autonomous AI | Product Hunt" 
                    width="250" 
                    height="54" 
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1173219&theme=neutral&t=1781615139390" 
                  />
                </a>
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 font-mono">{lang === 'fr' ? 'Plan du site' : 'Sitemap'}</h4>
                <div className="flex flex-col gap-3">
                  <a href="#radar" className="text-xs text-gray-500 hover:text-white transition-colors">{t('nav_radar', 'Radar Live')}</a>
                  <a href="#ai-automation" className="text-xs text-gray-500 hover:text-white transition-colors">{t('nav_ai', "L'IA Autonome")}</a>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 font-mono">{lang === 'fr' ? 'Communauté' : 'Community'}</h4>
                <div className="flex flex-col gap-3">
                  <a href="https://www.youtube.com/@NEXUSWPAI" target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-red-500 transition-colors">YouTube</a>
                  <a href="https://www.tiktok.com/@nexus4291" target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-indigo-400 transition-colors">TikTok</a>
                  <a href="https://x.com/NEXUS_WP_IA" target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-sky-400 transition-colors">Twitter / X</a>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 font-mono">{lang === 'fr' ? 'Légalités' : 'Legal'}</h4>
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setCurrentView('privacy'); window.scrollTo(0,0); }} className="text-xs text-gray-500 hover:text-white transition-colors text-left">{lang === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}</button>
                  <button onClick={() => { setCurrentView('terms'); window.scrollTo(0,0); }} className="text-xs text-gray-500 hover:text-white transition-colors text-left">{lang === 'fr' ? "Conditions d'Utilisation" : 'Terms of Service'}</button>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 font-mono">{lang === 'fr' ? 'CTA Action' : 'Call to Action'}</h4>
                <div className="flex flex-col gap-3">
                  <button onClick={() => onSelectPlan('none')} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">{lang === 'fr' ? 'Accéder App' : 'Access App'}</button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.3em]">
              © 2026 Nexus WP AI — TOUS DROITS RÉSERVÉS. INTEGRATED SECURITY.
            </p>
            <div className="flex gap-4">
              <span className="px-4 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-[8px] font-mono text-gray-500 uppercase">SERVER STATE: HYPER-STABLE</span>
              <span className="px-4 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-[8px] font-mono text-gray-500 uppercase">TELEMETRY SECURED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
