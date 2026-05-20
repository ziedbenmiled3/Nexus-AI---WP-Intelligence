import React, { useState, useEffect } from 'react';
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

  const getComputedPlans = (matrix: any) => {
    return [
      {
        id: 'trial',
        name: matrix?.packs?.test?.name || 'TEST VISION',
        price: matrix?.packs?.test?.price ? parseInt(String(matrix.packs.test.price).replace(/[^0-9]/g, '')) : 0,
        duration_hours: 24,
        site_limit: 1,
        features: getFeaturesForPack(matrix, 'test', [
          'Accès Complet IA (1 WordPress)',
          'Support Prioritaire'
        ])
      },
      {
        id: 'starter',
        name: matrix?.packs?.starter?.name || 'STARTER PROTOCOL',
        price: matrix?.packs?.starter?.price ? parseInt(String(matrix.packs.starter.price).replace(/[^0-9]/g, '')) : 29,
        site_limit: 1,
        features: getFeaturesForPack(matrix, 'starter', [
          'Manager Produits, Catégories & Tags',
          'Audit SEO (Analyses de base)',
          'Maintenance & Paramètres',
          'Comm Hub (Read-Only Mode)'
        ])
      },
      {
        id: 'pro',
        name: matrix?.packs?.pro?.name || 'PRO NEXUS',
        price: matrix?.packs?.pro?.price ? parseInt(String(matrix.packs.pro.price).replace(/[^0-9]/g, '')) : 89,
        site_limit: 5,
        is_popular: true,
        features: getFeaturesForPack(matrix, 'pro', [
          'Machine à Contenu & Maillage',
          'Nexus Social & Smart Shopping',
          'Comm Hub Core SMTP Engine'
        ])
      },
      {
        id: 'elite',
        name: matrix?.packs?.elite?.name || 'ELITE VISION',
        price: matrix?.packs?.elite?.price ? parseInt(String(matrix.packs.elite.price).replace(/[^0-9]/g, '')) : 249,
        site_limit: 12,
        features: getFeaturesForPack(matrix, 'elite', [
          'Intelligence Marché & Analyse Stocks',
          'Nexus Forecast (IA Predictive)',
          'Auto-Pilote (Full automated)',
          'Newsletter Blast & AI Recovery'
        ])
      }
    ];
  };

  useEffect(() => {
    const initData = async () => {
      try {
        if (!settings || Object.keys(settings).length === 0) {
          setLoading(true);
        }

        const [cid, settingsData] = await Promise.all([
          firebaseService.getPaypalClientId(),
          settings && Object.keys(settings).length > 0 ? Promise.resolve(settings) : firebaseService.getSettings()
        ]);

        const currentSettings = (settings && Object.keys(settings).length > 0) ? settings : settingsData;
        const configRaw = currentSettings?.['nexus_matrix_config'];
        let matrixData = configRaw 
          ? mergeRegistryConfig(typeof configRaw === 'string' ? safeJsonParse(configRaw, DEFAULT_NEXUS_CONFIG) : configRaw) 
          : DEFAULT_NEXUS_CONFIG;

        setMatrixConfig(matrixData);
        setPlans(getComputedPlans(matrixData));
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
          ACCÉDEZ À LA VISION
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Optimisation multisite par Intelligence Artificielle</p>
      </div>

      {/* Billing Selector & Coupon */}
      <div className="flex flex-col items-center gap-8">
        <div className="bg-[#0c0e14] border border-slate-800 p-1.5 rounded-3xl flex items-center relative gap-1 shadow-2xl">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "relative z-10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              billingCycle === 'monthly' ? "text-white" : "text-slate-500 hover:text-slate-400"
            )}
          >
            Mensuel
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              "relative z-10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              billingCycle === 'yearly' ? "text-white" : "text-slate-500 hover:text-slate-400"
            )}
          >
            Annuel
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
                      placeholder="CODE PROMO / OFFRE"
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
                   {activeDiscount > 0 ? 'APPLIQUÉ' : 'VÉRIFIER'}
                 </button>
              </div>
              {activeDiscount > 0 && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-3"
                >
                  OFFRE ACTIVÉE : -{activeDiscount * 100}% DÉDUITS
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, i) => {
          const isCurrent = currentSub?.plan_id === plan.id && currentSub?.status === 'active';
          const isTrial = plan.id === 'trial';
          
          const monthlyPrice = (plan.is_promo && plan.promo_price) ? plan.promo_price : plan.price;
          
          // Original Display Price
          const baseDisplayPrice = billingCycle === 'monthly' 
            ? monthlyPrice 
            : Math.floor((monthlyPrice * 12) * (1 - annualDiscount / 100));
            
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
                  ? "bg-slate-950 border-transparent shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)]" 
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

              {isCurrent && !isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40">
                  Plan Actuel
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
                            {baseDisplayPrice}$
                          </span>
                        )}
                        <span className={cn(
                          "text-3xl font-black transition-all duration-500 italic",
                          hasDiscount ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] scale-110" : "text-white"
                        )}>
                          {finalPrice}$
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                        / {isTrial ? (
                          (plan.duration_hours >= 1) 
                            ? `${plan.duration_hours} HEURE${plan.duration_hours > 1 ? 'S' : ''}` 
                            : `${(plan.duration_hours || 1) * 60} MIN`
                        ) : (billingCycle === 'monthly' ? 'Mois' : 'An')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-white/5 w-full" />

                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <div className="w-5 h-5 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                      <Layers className="w-3 h-3 text-blue-500" />
                    </div>
                    {plan.site_limit} Site{plan.site_limit > 1 ? 's' : ''} Connecté{plan.site_limit > 1 ? 's' : ''}
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
                        Sync Automatique 24/7
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
                         Passerelle non configurée
                      </div>
                    )}

                    {isTrial || plan.price === 0 ? (
                      <button 
                        onClick={async () => {
                          if (!user) {
                            alert("Veuillez vous connecter.");
                            return;
                          }
                          await firebaseService.subscribe(user.email!, plan.id);
                          setStatus({ type: 'success', message: 'Nexus Trial Activé !' });
                          if (onPurchased) onPurchased();
                        }}
                        className="w-full py-4 bg-white text-black hover:bg-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                         Activer Trial
                      </button>
                    ) : (
                      paypalClientId && (
                        <div className="relative z-[0]">
                          <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
                            <PayPalButtons 
                               style={{ layout: "vertical", shape: "rect", label: "pay", color: "blue", height: 48 }}
                               createOrder={(data, actions) => {
                                 return actions.order.create({
                                   purchase_units: [
                                     {
                                       amount: {
                                         currency_code: 'USD',
                                         value: finalPrice.toString(),
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
                      )
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
             GRILLE COMPARATIVE <span className="text-blue-500">NEXUS</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
            Analyse détaillée des protocoles SaaS
          </p>
        </div>
        <ComparisonTable config={matrixConfig || DEFAULT_NEXUS_CONFIG} />
      </section>

      {/* Affiliate Program Promotion */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border border-blue-500/20 rounded-[3rem] p-12 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[8px] font-black uppercase tracking-widest">
              <Users className="w-3 h-3" />
              Programme Partenaires
            </div>
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight">
              DEVENEZ PARTENAIRE NEXUS & TOUCHEZ JUSQU'À <span className="text-blue-500">30%</span> DE COMMISSION
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              Recommandez l'intelligence Nexus à votre réseau et générez des revenus passifs. 
              Paiements automatiques via PayPal dès 50$ de gains.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="grid grid-cols-3 gap-3">
              {[5, 15, 30].map(pct => (
                <div key={pct} className="px-4 py-3 bg-black/40 border border-slate-800 rounded-2xl text-center">
                  <div className="text-xl font-black text-blue-500 italic">{pct}%</div>
                  <div className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">Commission</div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab?.('affiliates')}
              className="w-full px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
            >
              REJOINDRE LE RÉSEAU PARTENAIRE
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
            Gestion massive de flottes WordPress (100+ sites). Accès exclusif aux API Beta NEXUS.
          </p>
          <button 
            onClick={() => window.location.href = `mailto:vision@nexus.ai?subject=Commande Nexus Multi-verse&body=Bonjour, je souhaite commander un pack Vision Custom pour ma flotte de sites.`}
            className="px-8 py-3 border border-white/5 text-[10px] font-black text-white hover:bg-white/5 rounded-full uppercase tracking-[0.3em] transition-all"
          >
            COMMANDER VISION CUSTOM →
          </button>
        </div>
      </div>
    </div>
  );
}
