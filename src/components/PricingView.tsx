import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Zap, 
  Check, 
  Crown, 
  Sparkles, 
  Shield, 
  Layers, 
  ShoppingBag, 
  Loader2, 
  AlertCircle, 
  Database, 
  Tag, 
  Users,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { cn, safeJsonParse } from '../lib/utils';
import { useAuth } from '../providers/FirebaseProvider';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import ComparisonTable from './ComparisonTable';
import { DEFAULT_NEXUS_CONFIG, mergeRegistryConfig } from '../constants';

const VALID_COUPONS: Record<string, number> = {
  "WELCOME50": 0.50, // -50% discount
  "LAUNCH30": 0.30   // -30% discount
};

const showCouponField = true;

interface PricingViewProps {
  currentSub?: any;
  settings?: any;
  onPurchased?: () => void;
  setActiveTab?: (tab: string) => void;
}

export default function PricingView({ currentSub, settings, onPurchased, setActiveTab }: PricingViewProps) {
  const { i18n, t } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paypalClientId, setPaypalClientId] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [annualDiscount, setAnnualDiscount] = useState(20);
  const { user } = useAuth();
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [matrixConfig, setMatrixConfig] = useState<any>(DEFAULT_NEXUS_CONFIG);
  
  // Coupon State
  const [promoCode, setPromoCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState(0);
  const [couponError, setCouponError] = useState(false);

  // Currency Converter State & Helper
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR');
  
  const getConvertedPrice = (priceInEur: number) => {
    if (selectedCurrency === 'EUR') {
      return { value: priceInEur, symbol: '€', code: 'EUR' };
    } else {
      return { value: Math.round(priceInEur * 1.08), symbol: '$', code: 'USD' };
    }
  };

  const getFeaturesForPack = (matrix: any, packId: string, defaultFeatures: string[]) => {
    if (!matrix?.packs?.[packId]) return defaultFeatures;
    const activeIds = matrix.packs[packId].activeFeatures || [];
    if (!Array.isArray(activeIds) || activeIds.length === 0) return defaultFeatures;
    
    const mapped = activeIds.map((id: string) => {
      // Look through all categories to find the feature label
      let featureLabel = id;
      matrix.categories?.some((cat: any) => {
        const feat = cat.features?.find((f: any) => f.id === id);
        if (feat) {
          featureLabel = feat.label;
          return true;
        }
        return false;
      });
      return featureLabel;
    }).filter(Boolean);

    return mapped.length > 0 ? mapped : defaultFeatures;
  };

  const getComputedPlans = (matrix: any, dbPlans?: any[]) => {
    const list = [
      {
        id: 'trial',
        defaultName: 'TEST VISION',
        defaultPrice: 0,
        defaultSiteLimit: 1,
        defaultFeatures: [
          'Tableau de Bord',
          'Bouclier de Sécurité',
          'Gestion Clientèle WP',
          'Multi-Pixel Publicitaire',
          'Nexus Social',
          'Flux Smart Shopping',
          'Intelligence Marché',
          'Analyse Stocks',
          'Nexus Forecast',
          'Audit SEO',
          'Machine à Contenu',
          'Auto-Pilote',
          'Maillage Interne',
          'Hub de Communication',
          'Commandes WooCommerce',
          'Manager Produits',
          'Catégories & Tags',
          'Maintenance',
          'Paramètres',
          'Invitations & Équipe',
          'Affiliation'
        ]
      },
      {
        id: 'starter',
        defaultName: 'STARTER PROTOCOL',
        defaultPrice: 29,
        defaultSiteLimit: 1,
        defaultFeatures: [
          'Manager Produits, Catégories & Tags',
          'Audit SEO (Analyses de base)',
          'Maintenance & Paramètres',
          'Comm Hub (Read-Only Mode)'
        ]
      },
      {
        id: 'pro',
        defaultName: 'PRO NEXUS',
        defaultPrice: 89,
        defaultSiteLimit: 5,
        is_popular: true,
        defaultFeatures: [
          'Machine à Contenu & Maillage',
          'Nexus Social & Smart Shopping',
          'Comm Hub Core SMTP Engine'
        ]
      },
      {
        id: 'elite',
        defaultName: 'ELITE VISION',
        defaultPrice: 249,
        defaultSiteLimit: 12,
        defaultFeatures: [
          'Tableau de Bord',
          'Bouclier de Sécurité',
          'Gestion Clientèle WP',
          'Multi-Pixel Publicitaire',
          'Nexus Social',
          'Flux Smart Shopping',
          'Intelligence Marché',
          'Analyse Stocks',
          'Nexus Forecast',
          'Audit SEO',
          'Machine à Contenu',
          'Auto-Pilote',
          'Maillage Interne',
          'Hub de Communication',
          'Commandes WooCommerce',
          'Manager Produits',
          'Catégories & Tags',
          'Maintenance',
          'Paramètres',
          'Invitations & Équipe',
          'Affiliation'
        ]
      },
      {
        id: 'launch',
        defaultName: 'LANCEMENT UNIQUE',
        defaultPrice: 199,
        defaultSiteLimit: 3,
        defaultFeatures: [
          'Tableau de Bord',
          'Bouclier de Sécurité',
          'Gestion Clientèle WP',
          'Multi-Pixel Publicitaire',
          'Nexus Social',
          'Flux Smart Shopping',
          'Intelligence Marché',
          'Analyse Stocks',
          'Nexus Forecast',
          'Audit SEO',
          'Machine à Contenu',
          'Auto-Pilote',
          'Maillage Interne',
          'Hub de Communication',
          'Commandes WooCommerce',
          'Manager Produits',
          'Catégories & Tags',
          'Maintenance',
          'Paramètres',
          'Invitations & Équipe',
          'Affiliation'
        ]
      }
    ];

    return list.map(item => {
      const pack = matrix?.packs?.[item.id];
      const name = pack?.name || item.defaultName;
      const rawPrice = pack?.price !== undefined ? pack.price : String(item.defaultPrice);
      const price = parseInt(String(rawPrice).replace(/[^0-9]/g, '')) || 0;
      
      const siteLimit = pack?.siteLimit !== undefined ? pack.siteLimit : (pack?.site_limit !== undefined ? pack.site_limit : item.defaultSiteLimit);
      const isLifetime = pack?.isLifetime !== undefined ? !!pack.isLifetime : (item.id === 'launch');
      const isLaunchPack = pack?.isLaunchPack !== undefined ? !!pack.isLaunchPack : (item.id === 'launch');
      const launchStockLimit = pack?.launchStockLimit !== undefined ? pack.launchStockLimit : 100;
      const launchStockSold = pack?.launchStockSold !== undefined ? pack.launchStockSold : 42;
      const isActive = pack?.isActive !== undefined ? pack.isActive : true;

      const trialDbPlan = dbPlans?.find((p: any) => p.id === 'trial');
      const trialDuration = trialDbPlan?.duration_hours !== undefined ? Number(trialDbPlan.duration_hours) : 24;

      return {
        id: item.id,
        name,
        price,
        site_limit: siteLimit,
        is_popular: item.is_popular || false,
        features: getFeaturesForPack(matrix, item.id, item.defaultFeatures),
        isLifetime,
        isLaunchPack,
        launchStockLimit,
        launchStockSold,
        isActive,
        duration_hours: item.id === 'trial' ? trialDuration : undefined
      };
    }).filter(plan => plan.isActive);
  };

  useEffect(() => {
    const initData = async () => {
      try {
        if (!settings || Object.keys(settings).length === 0) {
          setLoading(true);
        }

        const [cid, settingsData, dbPlans] = await Promise.all([
          firebaseService.getPaypalClientId(),
          settings && Object.keys(settings).length > 0 ? Promise.resolve(settings) : firebaseService.getSettings(),
          firebaseService.getPlans()
        ]);

        const currentSettings = (settings && Object.keys(settings).length > 0) ? settings : settingsData;
        const configRaw = currentSettings?.['nexus_matrix_config'];
        let matrixData = configRaw 
          ? mergeRegistryConfig(typeof configRaw === 'string' ? safeJsonParse(configRaw, DEFAULT_NEXUS_CONFIG) : configRaw) 
          : DEFAULT_NEXUS_CONFIG;

        setMatrixConfig(matrixData);
        setPlans(getComputedPlans(matrixData, dbPlans));
        setPaypalClientId(cid);
        
        if (currentSettings?.['annual_discount_percentage']) {
          setAnnualDiscount(Number(currentSettings['annual_discount_percentage']));
        }
      } catch (err) {
        console.error('Failed to init Pricing', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [settings]);

  const handleApplyCoupon = () => {
    const code = promoCode.toUpperCase();
    if (VALID_COUPONS[code]) {
      setActiveDiscount(VALID_COUPONS[code]);
      setCouponError(false);
    } else {
      setActiveDiscount(0);
      setCouponError(true);
      setTimeout(() => setCouponError(false), 2000);
    }
  };

  const handlePurchaseSuccess = async (plan: any, details: any) => {
    try {
      await firebaseService.subscribe(
        user!.email!, 
        plan.id, 
        details.id, 
        plan.price
      );

      // Trigger Google Ads conversion event
      try {
        if (typeof window !== 'undefined' && 'gtag_report_conversion' in window) {
          (window as any).gtag_report_conversion();
          console.log("[Google Ads] Suivi de conversion déclenché avec succès pour l'achat !");
        }
      } catch (e) {
        console.error("[Google Ads] Erreur d'injection de conversion :", e);
      }

      setStatus({ type: 'success', message: `Nexus Activé : Bienvenue au Pack ${plan.name} !` });
      if (onPurchased) onPurchased();
    } catch (err) {
      setStatus({ type: 'error', message: "Erreur lors de l'activation de votre abonnement." });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Ouverture du Portail NEXUS...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center px-6">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-slate-500">
           <Database className="w-10 h-10 opacity-20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white italic uppercase">Boutique Nexus fermée</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-xs">Contactez l'administration pour configurer les offres de service.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-6">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-500 text-[9px] font-black uppercase tracking-widest"
        >
           <Crown className="w-3 h-3" />
           Nexus Phase III Protocol
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
          {isEn ? 'ACCESS THE VISION' : 'ACCÉDEZ À LA VISION'}
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">{isEn ? 'Multisite Optimization by Artificial Intelligence' : 'Optimisation multisite par Intelligence Artificielle'}</p>
      </div>

      {/* Billing Selector & Coupon */}
      <div className="flex flex-col items-center gap-8">
        {/* Currency Switcher (EUR / USD Converter) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.25em]">
            {isEn ? 'Billing Currency / Currency Converter' : 'Devise de Facturation / Currency Converter'}
          </span>
          <div className="bg-[#0c0e14]/65 border border-slate-900 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setSelectedCurrency('EUR')}
              className={cn(
                "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                selectedCurrency === 'EUR' ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/25" : "text-slate-600 hover:text-slate-400"
              )}
            >
              {isEn ? 'Euro (€) [DEFAULT]' : 'Euro (€) [DÉFAUT]'}
            </button>
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={cn(
                "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                selectedCurrency === 'USD' ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/25" : "text-slate-600 hover:text-slate-400"
              )}
            >
              {isEn ? 'Dollar ($) [AI CONVERT]' : 'Dollar ($) [IA CONVERT]'}
            </button>
          </div>
        </div>

        <div className="bg-[#0c0e14] border border-slate-800 p-1.5 rounded-3xl flex items-center relative gap-1 shadow-2xl">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "relative z-10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              billingCycle === 'monthly' ? "text-white" : "text-slate-500 hover:text-slate-400"
            )}
          >
            {isEn ? 'Monthly' : 'Mensuel'}
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              "relative z-10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              billingCycle === 'yearly' ? "text-white" : "text-slate-500 hover:text-slate-400"
            )}
          >
            {isEn ? 'Yearly' : 'Annuel'}
            <span className="bg-amber-600/20 text-amber-500 px-2 py-0.5 rounded-lg text-[8px]">-{annualDiscount}%</span>
          </button>
          
          <motion.div 
            className="absolute h-[calc(100%-12px)] bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40"
            initial={false}
            animate={{
              left: billingCycle === 'monthly' ? 6 : '50%',
              width: 'calc(50% - 9px)'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {showCouponField && (
           <div className="w-full max-w-sm">
              <div className={cn(
                "group bg-black/40 border rounded-[2rem] p-1.5 flex transition-all duration-500",
                activeDiscount > 0 ? "border-emerald-500/50 shadow-lg shadow-emerald-900/10" : couponError ? "border-red-500/50 animate-shake" : "border-white/5 hover:border-white/10"
              )}>
                 <div className="flex-1 flex items-center px-6 gap-3">
                    <Ticket className={cn("w-4 h-4", activeDiscount > 0 ? "text-emerald-500" : "text-slate-600")} />
                    <input 
                      type="text"
                      placeholder={isEn ? "PROMO CODE / OFFER" : "CODE PROMO / OFFRE"}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-700 w-full"
                    />
                 </div>
                 <button 
                   onClick={handleApplyCoupon}
                   className={cn(
                     "px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
                     activeDiscount > 0 ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                   )}
                 >
                   {activeDiscount > 0 ? (isEn ? 'APPLIED' : 'APPLIQUÉ') : (isEn ? 'VERIFY' : 'VÉRIFIER')}
                 </button>
              </div>
              {activeDiscount > 0 && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-3"
                >
                  {isEn ? `OFFER ACTIVATED: -${activeDiscount * 100}% DEDUCTED` : `OFFRE ACTIVÉE : -${activeDiscount * 100}% DÉDUITS`}
                </motion.p>
              )}
           </div>
        )}
      </div>

      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "p-6 rounded-[2rem] border flex items-center gap-4 max-w-2xl mx-auto",
              status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
            )}
          >
            {status.type === 'success' ? <Shield className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <p className="text-xs font-black uppercase tracking-widest flex-1">{status.message}</p>
            <button onClick={() => setStatus(null)} className="text-[10px] opacity-50 hover:opacity-100 font-black uppercase">Fermer</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlight Pack de Lancement (Horizontal, Espace Interne) */}
      {(() => {
        const launchPlan = plans.find(p => p.isLaunchPack || p.id === 'launch');
        if (!launchPlan) return null;
        
        const isCurrent = currentSub?.plan_id === launchPlan.id && currentSub?.status === 'active';
        const isTrial = launchPlan.id === 'trial';
        
        const monthlyPrice = (launchPlan.is_promo && launchPlan.promo_price) ? launchPlan.promo_price : launchPlan.price;
        
        const baseDisplayPrice = launchPlan.isLifetime
          ? launchPlan.price
          : (billingCycle === 'monthly' 
              ? monthlyPrice 
              : Math.floor((monthlyPrice * 12) * (1 - annualDiscount / 100)));
          
        const finalPrice = activeDiscount > 0 && launchPlan.price > 0
          ? Math.floor(baseDisplayPrice * (1 - activeDiscount))
          : baseDisplayPrice;

        const hasDiscount = activeDiscount > 0 && launchPlan.price > 0;

        return (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-12 max-w-7xl mx-auto p-[1.5px] rounded-[3rem] relative overflow-hidden group text-center md:text-left",
              isCurrent 
                ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.25)]" 
                : "bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.25)]"
            )}
          >
            {/* Background ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-600/10 to-amber-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="bg-[#0c0e14] rounded-[2.95rem] p-8 md:p-10 relative z-10 flex flex-col xl:flex-row gap-8 xl:gap-12 items-stretch justify-between">
              {/* Left / Info Part */}
              <div className="flex-1 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="px-4 py-1.5 bg-amber-500 text-black rounded-full text-[9px] font-black uppercase tracking-[0.25em] italic flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                      {isEn ? 'LAUNCH OFFER' : 'OFFRE DE LANCEMENT'}
                    </span>
                    <span className="px-3.5 py-1 bg-purple-500/10 border border-purple-500/35 text-purple-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {isEn ? 'LIFETIME / ONE-TIME' : 'À VIE / UNIQUE'}
                    </span>
                    {isCurrent && (
                      <span className="px-3.5 py-1 bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                        {isEn ? 'ACTIVE / RUNNING PLAN' : 'ACTIF / CONTRAT EN COURS'}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">
                      {launchPlan.name}
                    </h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-2 max-w-xl mx-auto md:mx-0">
                      {launchPlan.description || (isEn ? 'The complete suite with zero monthly subscription fees. Connect to the Nexus infrastructure.' : 'La suite complète sans aucune redevance mensuelle. Rejoignez l\'infrastructure Nexus.')}
                    </p>
                  </div>
                </div>

                {/* Privileges Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 p-5 rounded-2xl border border-slate-900/60 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isEn ? 'LIFETIME PRIVILEGES' : 'PRIVILÈGES À VIE'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                      {isEn ? 'Zero subscription. Lock in this price forever and keep your active lifetime access.' : 'Zéro abonnement. Évitez les augmentations de prix futures et gardez votre accès actif à vie.'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isEn ? 'ALL FUTURE UPGRADES' : 'ÉVOLUTIONS & MODULES FUTURS'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                      {isEn ? 'Automatically benefit from all coming AI modules, framework improvements, and future extensions.' : 'Profitez automatiquement de tous les nouveaux modules IA, mises à jour architecturales et extensions futures.'}
                    </p>
                  </div>
                </div>

                {/* Price and Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 xl:gap-8 bg-black/40 p-6 rounded-3xl border border-slate-900">
                  <div className="flex items-baseline justify-center gap-1.5">
                    {hasDiscount && (
                      <span className="text-sm font-black text-slate-600 line-through decoration-red-500/50 mr-2">
                        {getConvertedPrice(baseDisplayPrice).value} {getConvertedPrice(baseDisplayPrice).symbol}
                      </span>
                    )}
                    <span className={cn(
                      "text-4xl sm:text-6xl font-extrabold tracking-tight italic",
                      hasDiscount ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" : "text-white"
                    )}>
                      {getConvertedPrice(finalPrice).value}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-gray-500">
                      {getConvertedPrice(finalPrice).symbol}
                    </span>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest ml-2 px-2.5 py-1 bg-amber-500/5 border border-amber-500/15 rounded-full">
                      {isEn ? 'ONE-TIME PAYMENT' : 'PAIEMENT UNIQUE'}
                    </span>
                  </div>

                  <div className="h-px sm:h-12 w-full sm:w-px bg-slate-800" />

                  {/* Site Limit */}
                  <div className="flex flex-col justify-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{isEn ? 'Authorized Sites' : 'Sites Autorisés'}</span>
                    <span className="text-lg sm:text-xl font-black text-blue-400 uppercase tracking-wide">
                      {launchPlan.site_limit} {launchPlan.site_limit > 1 ? (isEn ? 'SITES' : 'SITES') : (isEn ? 'SITE' : 'SITE')}
                    </span>
                  </div>

                  <div className="h-px sm:h-12 w-full sm:w-px bg-slate-800" />

                  {/* Launch stock bar */}
                  <div className="flex-1 space-y-1.5 min-w-[200px]">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-amber-500">
                      <span>{isEn ? 'Launch Registrants' : 'Inscrits de Lancement'}</span>
                      <span>{launchPlan.launchStockSold} / {launchPlan.launchStockLimit}</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full w-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (launchPlan.launchStockSold / launchPlan.launchStockLimit) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                      {isEn ? `Only ${Math.max(0, launchPlan.launchStockLimit - launchPlan.launchStockSold)} packs left!` : `Il reste uniquement ${Math.max(0, launchPlan.launchStockLimit - launchPlan.launchStockSold)} packs disponibles !`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right / Features Part */}
              <div className="flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 text-center md:text-left">
                    {isEn ? 'ALL FULL MODULES INCLUDED:' : 'TOUS LES MODULES COMPLETS INCLUS :'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {launchPlan.features?.map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-3 px-4 py-3 bg-black/40 rounded-2xl border border-slate-900 text-left hover:border-amber-500/20 transition-all">
                        <Zap className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-300">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  {isCurrent ? (
                    <div className="w-full py-4 bg-slate-900 border border-white/5 text-slate-500 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <Layers className="w-4 h-4 opacity-50" />
                      Protocol Enabled
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {isTrial || launchPlan.price === 0 ? (
                        <button 
                          onClick={async () => {
                            if (!user) {
                              alert("Veuillez vous connecter.");
                              return;
                            }
                            await firebaseService.subscribe(user.email!, launchPlan.id);
                            setStatus({ type: 'success', message: 'Nexus Trial Activé !' });
                            if (onPurchased) onPurchased();
                          }}
                          className="w-full py-4 bg-white text-black hover:bg-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                           {isEn ? 'Activate Test Launch Pack' : 'Activer Pack de Lancement Test'}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          {paypalClientId && (
                            <div className="relative z-[0]">
                              <PayPalScriptProvider options={{ clientId: paypalClientId, currency: selectedCurrency }}>
                                <PayPalButtons 
                                   style={{ layout: "vertical", shape: "rect", label: "pay", color: "blue", height: 48 }}
                                   createOrder={(data, actions) => {
                                     return actions.order.create({
                                       purchase_units: [
                                         {
                                           amount: {
                                             currency_code: selectedCurrency,
                                             value: getConvertedPrice(finalPrice).value.toString(),
                                           },
                                           description: `Pack NEXUS PHASE III - ${launchPlan.name} (PAIEMENT UNIQUE À VIE) ${activeDiscount > 0 ? '[VOUCHER APPLIED]' : ''}`
                                         },
                                       ],
                                       intent: 'CAPTURE'
                                     });
                                   }}
                                   onApprove={async (data, actions) => {
                                      const details = await actions.order?.capture();
                                      handlePurchaseSuccess(launchPlan, details);
                                   }}
                                />
                              </PayPalScriptProvider>
                            </div>
                          )}

                          {settings?.['paypal_test_mode'] === 'true' && (
                            <div className="pt-1">
                              <button 
                                onClick={async () => {
                                  if (!user) {
                                    alert("Veuillez vous connecter pour tester le paiement.");
                                    return;
                                  }
                                  const mockTxId = 'TEST-TRX-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                                  const mockDetails = { id: mockTxId };
                                  await handlePurchaseSuccess(launchPlan, mockDetails);
                                }}
                                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20 active:scale-95"
                              >
                                {isEn ? '🧪 Simulate Lifetime One-Time Payment (test mode)' : '🧪 Simuler le paiement Lancement Unique (mode test)'}
                              </button>
                              <p className="text-[7.5px] text-amber-500 font-black uppercase text-center tracking-widest mt-1.5 animate-pulse">
                                {isEn ? 'Payment simulator mode active (launch)' : 'Mode simulateur de paiement actif (lancement)'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {plans.filter(p => !p.isLaunchPack && p.id !== 'launch').map((plan, i) => {
          const isCurrent = currentSub?.plan_id === plan.id && currentSub?.status === 'active';
          const isTrial = plan.id === 'trial';
          
          const monthlyPrice = (plan.is_promo && plan.promo_price) ? plan.promo_price : plan.price;
          
          // Original Display Price
          const baseDisplayPrice = plan.isLifetime
            ? plan.price
            : (billingCycle === 'monthly' 
                ? monthlyPrice 
                : Math.floor((monthlyPrice * 12) * (1 - annualDiscount / 100)));
            
          // Discounted Display Price
          const finalPrice = activeDiscount > 0 && plan.price > 0
            ? Math.floor(baseDisplayPrice * (1 - activeDiscount))
            : baseDisplayPrice;

          const hasDiscount = activeDiscount > 0 && plan.price > 0;
          
          const isPopular = plan.is_popular;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative group flex flex-col p-10 rounded-[3rem] border transition-all duration-500 h-full overflow-hidden",
                isPopular 
                  ? "bg-slate-950 border-transparent shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)]/50" 
                  : isCurrent 
                    ? "bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-900/20" 
                    : "bg-[#0c0e14] border-slate-800 hover:border-slate-700"
              )}
            >
              {isPopular && (
                <div className="absolute inset-0 rounded-[3rem] p-[2px] bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] -z-10 animate-pulse-slow">
                  <div className="absolute inset-0 bg-slate-950 rounded-[calc(3rem-2px)]" />
                </div>
              )}
              {isPopular && (
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                   <Crown className="w-40 h-40 text-blue-500" />
                </div>
              )}

              {isPopular && (
                <div className="absolute top-6 right-8 px-4 py-1.5 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/40 italic flex items-center gap-1.5">
                  <Crown className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              {plan.isLaunchPack && (
                <div className="absolute top-6 right-8 px-4 py-1.5 bg-amber-500 text-black rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-950/20 italic flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3 h-3 text-current" />
                  {isEn ? 'LAUNCH' : 'LANCEMENT'}
                </div>
              )}

              {isCurrent && !isPopular && !plan.isLaunchPack && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40">
                  {isEn ? 'Active Plan' : 'Plan Actuel'}
                </div>
              )}

              <div className="space-y-6 flex-1 relative z-10">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{plan.name}</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <div className="flex flex-col">
                        {hasDiscount && (
                          <span className="text-sm font-black text-slate-600 line-through decoration-red-500/50 mb-[-4px]">
                            {isTrial ? 0 : getConvertedPrice(baseDisplayPrice).value} {isTrial ? '' : getConvertedPrice(baseDisplayPrice).symbol}
                          </span>
                        )}
                        <span className={cn(
                          "text-3xl font-black transition-all duration-500 italic",
                          hasDiscount ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] scale-110" : "text-white"
                        )}>
                          {isTrial ? 0 : getConvertedPrice(finalPrice).value} {isTrial ? '' : getConvertedPrice(finalPrice).symbol}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                        / {isTrial ? (
                          (plan.duration_hours % 24 === 0)
                            ? `${plan.duration_hours / 24} ${isEn ? `DAY${(plan.duration_hours / 24) > 1 ? 'S' : ''}` : `JOUR${(plan.duration_hours / 24) > 1 ? 'S' : ''}`}`
                            : (plan.duration_hours >= 1) 
                              ? `${plan.duration_hours} ${isEn ? `HOUR${plan.duration_hours > 1 ? 'S' : ''}` : `HEURE${plan.duration_hours > 1 ? 'S' : ''}`}` 
                              : `${(plan.duration_hours || 1) * 60} MIN`
                        ) : plan.isLifetime ? (
                          isEn ? "One-Time" : "Unique"
                        ) : (billingCycle === 'monthly' ? (isEn ? 'Month' : 'Mois') : (isEn ? 'Year' : 'An'))}
                      </span>
                    </div>
                  </div>
                </div>

                {plan.isLaunchPack && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-amber-500">
                      <span>{isEn ? 'Launch Registrants' : 'Inscrits de Lancement'}</span>
                      <span>{plan.launchStockSold} / {plan.launchStockLimit}</span>
                    </div>
                    <div className="h-1 text-slate-900 rounded-full w-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (plan.launchStockSold / plan.launchStockLimit) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest leading-none text-center">
                      {isEn ? `Only ${Math.max(0, plan.launchStockLimit - plan.launchStockSold)} packs left!` : `Il reste uniquement ${Math.max(0, plan.launchStockLimit - plan.launchStockSold)} packs disponibles !`}
                    </p>
                  </div>
                )}

                <div className="h-[1px] bg-white/5 w-full" />

                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <div className="w-5 h-5 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                      <Layers className="w-3 h-3 text-blue-500" />
                    </div>
                    {plan.site_limit} {isEn ? `Site${plan.site_limit > 1 ? 's' : ''} Connected` : `Site${plan.site_limit > 1 ? 's' : ''} Connecté${plan.site_limit > 1 ? 's' : ''}`}
                  </li>
                  {Array.isArray(plan.features) ? plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <div className="w-5 h-5 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                        <Zap className="w-3 h-3 text-blue-500" />
                      </div>
                      {feature}
                    </li>
                  )) : (
                    <>
                      <li className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <div className="w-5 h-5 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                          <Zap className="w-3 h-3 text-blue-500" />
                        </div>
                        {isEn ? 'Automatic 24/7 Sync' : 'Sync Automatique 24/7'}
                      </li>
                      <li className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <div className="w-5 h-5 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                          <Shield className="w-3 h-3 text-blue-500" />
                        </div>
                        Nexus AI Security Audit
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="mt-12 pt-6">
                {isCurrent ? (
                  <div className="w-full py-4 bg-slate-900 border border-white/5 text-slate-500 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <Layers className="w-4 h-4 opacity-50" />
                    Protocol Enabled
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!paypalClientId && !isTrial && (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-[9px] font-black text-yellow-500/60 uppercase tracking-widest text-center">
                          {isEn ? 'Gateway not configured' : 'Passerelle non configurée'}
                      </div>
                    )}

                    {isTrial || plan.price === 0 ? (
                      <button 
                        onClick={async () => {
                          if (!user) {
                            alert(isEn ? "Please log in." : "Veuillez vous connecter.");
                            return;
                          }
                          await firebaseService.subscribe(user.email!, plan.id);
                          try {
                            if (typeof window !== 'undefined' && 'gtag_report_conversion' in window) {
                              (window as any).gtag_report_conversion();
                              console.log("[Google Ads] Suivi de conversion déclenché avec succès pour l'essai gratuit !");
                            }
                          } catch (e) {
                            console.error("[Google Ads] Erreur d'injection de conversion :", e);
                          }
                          setStatus({ type: 'success', message: isEn ? 'Nexus Trial Activated!' : 'Nexus Trial Activé !' });
                          if (onPurchased) onPurchased();
                        }}
                        className="w-full py-4 bg-white text-black hover:bg-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                         {isEn ? 'Activate Trial' : 'Activer Trial'}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {paypalClientId && (
                          <div className="relative z-[0]">
                            <PayPalScriptProvider options={{ clientId: paypalClientId, currency: selectedCurrency }}>
                              <PayPalButtons 
                                 style={{ layout: "vertical", shape: "rect", label: "pay", color: "blue", height: 48 }}
                                 createOrder={(data, actions) => {
                                   return actions.order.create({
                                     purchase_units: [
                                       {
                                         amount: {
                                           currency_code: selectedCurrency,
                                           value: getConvertedPrice(finalPrice).value.toString(),
                                         },
                                         description: `Pack NEXUS PHASE III - ${plan.name} (${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}) ${activeDiscount > 0 ? '[VOUCHER APPLIED]' : ''}`
                                       },
                                     ],
                                     intent: 'CAPTURE'
                                   });
                                 }}
                                 onApprove={async (data, actions) => {
                                    const details = await actions.order?.capture();
                                    handlePurchaseSuccess(plan, details);
                                 }}
                              />
                            </PayPalScriptProvider>
                          </div>
                        )}

                        {settings?.['paypal_test_mode'] === 'true' && (
                          <div className="pt-1">
                            <button 
                              onClick={async () => {
                                if (!user) {
                                  alert(isEn ? "Please log in to test the payment." : "Veuillez vous connecter pour tester le paiement.");
                                  return;
                                }
                                const mockTxId = 'TEST-TRX-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                                const mockDetails = { id: mockTxId };
                                await handlePurchaseSuccess(plan, mockDetails);
                              }}
                              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20 active:scale-95"
                            >
                              {isEn ? '🧪 Simulate payment (test mode)' : '🧪 Simuler le paiement (mode test)'}
                            </button>
                            <p className="text-[7.5px] text-emerald-500 font-black uppercase text-center tracking-widest mt-1.5 animate-pulse">
                              {isEn ? 'Payment simulator mode active' : 'Mode simulateur de paiement actif'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <section className="py-24 bg-[#0a0a0f]/50 border border-white/5 rounded-[4rem] px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-4">
             {isEn ? 'DETAILED COMPARISON' : 'GRILLE COMPARATIVE'} <span className="text-blue-500">NEXUS</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
            {isEn ? 'Detailed analysis of SaaS protocols' : 'Analyse détaillée des protocoles SaaS'}
          </p>
        </div>
        <ComparisonTable config={matrixConfig || DEFAULT_NEXUS_CONFIG} selectedCurrency={selectedCurrency} />
      </section>

      {/* Affiliate Program Promotion */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border border-blue-500/20 rounded-[3rem] p-12 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[8px] font-black uppercase tracking-widest">
              <Users className="w-3 h-3" />
              {isEn ? 'Partner Program' : 'Programme Partenaires'}
            </div>
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight">
              {isEn ? 'BECOME A NEXUS PARTNER & EARN UP TO ' : "DEVENEZ PARTENAIRE NEXUS & TOUCHEZ JUSQU'À "}<span className="text-blue-500">30%</span>{isEn ? ' COMMISSION' : ' DE COMMISSION'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              {isEn ? 'Recommend Nexus intelligence to your network and earn passive income. Automatic updates and payouts via PayPal once $50 is reached.' : "Recommandez l'intelligence Nexus à votre réseau et générez des revenus passifs. Paiements automatiques via PayPal dès 50$ de gains."}
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="grid grid-cols-3 gap-3">
              {[5, 15, 30].map(pct => (
                <div key={pct} className="px-4 py-3 bg-black/40 border border-slate-800 rounded-2xl text-center">
                  <div className="text-xl font-black text-blue-500 italic">{pct}%</div>
                  <div className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">{isEn ? 'Commission' : 'Commission'}</div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab?.('affiliates')}
              className="w-full px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
            >
              {isEn ? 'JOIN THE PARTNER NETWORK' : 'REJOINDRE LE RÉSEAU PARTENAIRE'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-12 bg-slate-900/20 border border-slate-800 rounded-[3rem] text-center space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/20">
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">NEXUS MULTI-VERSE</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xl mx-auto leading-loose">
            {isEn ? 'Massive management of WordPress fleets (100+ sites). Exclusive access to NEXUS Beta APIs.' : 'Gestion massive de flottes WordPress (100+ sites). Accès exclusif aux API Beta NEXUS.'}
          </p>
          <button 
            onClick={() => window.location.href = `mailto:contact@nexuswp.pro?subject=Commande Nexus Multi-verse&body=Bonjour, je souhaite commander un pack Vision Custom pour ma flotte de sites.`}
            className="px-8 py-3 border border-white/5 text-[10px] font-black text-white hover:bg-white/5 rounded-full uppercase tracking-[0.3em] transition-all"
          >
            {isEn ? 'ORDER CUSTOM VISION →' : 'COMMANDER VISION CUSTOM →'}
          </button>
        </div>
      </div>

      {/* Dynamic Security & Compliance Row under the Pricing options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pb-4">
        <div className="bg-[#050608] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
             <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
             <p className="text-[9px] font-black text-white uppercase tracking-wider mb-0.5">{isEn ? 'SECURED SSL' : 'SSL SÉCURISÉ'}</p>
             <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest leading-none">{isEn ? '256-bit Encryption' : 'Chiffrement 256 bits'}</p>
          </div>
        </div>
        <div className="bg-[#050608] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center shrink-0">
             <Check className="w-5 h-5 text-blue-400" />
          </div>
          <div>
             <p className="text-[9px] font-black text-white uppercase tracking-wider mb-0.5">{isEn ? 'PURCHASE GUARANTEE' : 'GARANTIE ACHAT'}</p>
             <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest leading-none">{isEn ? 'Full Refund' : 'Remboursement Intégral'}</p>
          </div>
        </div>
        <div className="bg-[#050608] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center shrink-0">
             <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
             <p className="text-[9px] font-black text-white uppercase tracking-wider mb-0.5">2FA PROTECTION</p>
             <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest leading-none">{isEn ? 'Session protection' : 'Protection de session'}</p>
          </div>
        </div>
        <div className="bg-[#050608] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
             <p className="text-[9px] font-black text-white uppercase tracking-wider mb-0.5">{isEn ? 'GDPR COMPLIANT' : 'SÉCURITÉ RGPD'}</p>
             <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest leading-none">{isEn ? 'Maximum Privacy' : 'Confidentialité Maximale'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
