import React, { useState } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Cpu, 
  MousePointer, 
  RefreshCw, 
  Flame, 
  Sparkles,
  Award,
  DollarSign,
  Compass,
  Timer
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TRANSLATIONS_LOCAL } from './LandingPageTranslations';

interface AdvantagesShowcaseProps {
  lang: 'fr' | 'en';
  onGetStarted: () => void;
  onGoToPricing: () => void;
}

export default function AdvantagesShowcase({ lang, onGetStarted, onGoToPricing }: AdvantagesShowcaseProps) {
  const dict = TRANSLATIONS_LOCAL[lang];

  // Section 1: ROI States
  const [traffic, setTraffic] = useState(5000);
  const [basket, setBasket] = useState(65);
  const [convRate, setConvRate] = useState(1.5);

  const calculateROI = () => {
    const rawRevenue = Math.round((traffic * (convRate / 100)) * basket);
    // Nexus boost is e.g., conservative +1.8% on raw conversion rate
    const optimizedConvRate = convRate + 1.8;
    const optimizedRevenue = Math.round((traffic * (optimizedConvRate / 100)) * basket);
    const addedRevenue = Math.max(0, optimizedRevenue - rawRevenue);
    return {
      rawRevenue,
      optimizedRevenue,
      addedRevenue
    };
  };

  const { rawRevenue, optimizedRevenue, addedRevenue } = calculateROI();

  // Section 2: Conversions SEO States
  const [activeSEOProduct, setActiveSEOProduct] = useState<'cosmetics' | 'sport' | 'tech'>('cosmetics');

  const seoProductData = {
    cosmetics: {
      before: {
        title: "Huile de Coco bio pour peau",
        desc: "Une huile de coco naturelle utile pour hydrater le visage, le corps et les cheveux. Flacon de 100ml. Pratique pour l'été. Bon produit de qualité."
      },
      after: {
        title: "🥥 Sérum d'Huile de Coco Bio Pressée à Froid — Formule Ultra-Hydratante Céleste (100ml)",
        desc: "Régénérez intensément vos cellules grâce à notre précieuse Huile de Coco 100% Biologique Certifiée. Extraite doucement à froid par pression mécanique pour conserver l'intégralité des vitamines E et lipides actifs. Un élixir de beauté holistique universel conçu pour infuser une douceur soyeuse au corps, calmer les tiraillements de la peau et polir les cheveux secs.\n\n✨ RÉSULTATS GARANTIS :\n• Barrière lipidique fortifiée en 3 applications.\n• Teint lumineux sans résidu gras.\n• Éco-emballage en verre recyclable anti-UV.",
        features: ["100% Bio Certifiée", "Pressage à Froid", "Anti-Comédogène", "Vitamines complexes E + F"]
      },
      tags: ["Huile coco bio visage", "Hydratation naturelle bio", "Soin corps vegan", "Élixir coco cheveux"]
    },
    sport: {
      before: {
        title: "Poudre protéine vanille 1kg",
        desc: "Shaker proteiné goût vanille pour la musculation et le sport. Contient des acides aminés. Prendre après l'entraînement. Pot plastique facile."
      },
      after: {
        title: "💪 Isolat de Protéine Active Whey Gold — Élite Muscle Formula (Vanille Madagascar - 1kg)",
        desc: "Maximisez votre reconstruction musculaire avec l'Isolat de Whey le plus pur du marché, dosé à 90% de protéines de haute conductivité. Enrichi naturellement en acides aminés à chaîne ramifiée (BCAA 2:1:1 raccordés) pour déclencher directement la synthèse de glycogène musculaire et accélérer la réparation post-entraînement.\n\n⚡️ PERFORMANCES DU PROTOCOLE :\n• Absorption ultra-rapide (20 minutes trans-pylorique).\n• Zéro sucre ajouté, formule purifiée sans lactose.\n• Solubilité absolue au shaker sans le moindre grumeau.",
        features: ["26g Isolat par dose", "6.2g BCAA branchés", "Zéro Lactose", "Arôme Naturel Premium"]
      },
      tags: ["Whey isolat musculation", "Meilleure protéine sèche", "Whey goût vanille pure", "Muscle sec BCAA"]
    },
    tech: {
      before: {
        title: "Repose poignet ergonomique bureau",
        desc: "Coussin pour poser le poignet devant votre clavier d'ordinateur. Évite la fatigue pendant le travail. Dessus en tissu noir standard."
      },
      after: {
        title: "⌨️ Support de Poignet Ergonomique ErgoCloud™ — Mousse à Mémoire de Forme Ultra-Densité",
        desc: "Libérez vos poignets des tensions chroniques et du syndrome du canal carpien avec notre support anatomique ErgoCloud™. Injecté avec une mousse de polymère viscoélastique haut de gamme qui épouse l'angulation de votre canal radial, redistribuant uniformément l'appui articulaire lors des séances prolongées d'édition de code ou de traitement de données.\n\n⚙️ SPÉCIFICATIONS TECHNIQUES :\n• Revêtement en fibre lycra thermorégulatrice micro-perforée.\n• Base caoutchoutée antidérapante de forte adhérence.\n• Alignement physiologique neutre garanti à 15°.",
        features: ["Mousse Ergonomique", "Micro-Fissures Ventile", "Base Grip Antidérapante", "Physiologie 15° Neutre"]
      },
      tags: ["Repose poignet ergonomique", "Canal carpien clavier protection", "Accessoire bureau ergonomique"]
    }
  };

  // Section 3: Smart Pricing Strategy Simulation States
  const [pricingStrategy, setPricingStrategy] = useState<'idle' | 'peak' | 'low_market' | 'high_market'>('idle');
  const [simulatedPrice, setSimulatedPrice] = useState(79);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const runPricingSimulation = (scenario: 'peak' | 'low_market' | 'high_market') => {
    setPricingStrategy(scenario);
    const logs: string[] = [];
    if (scenario === 'peak') {
      setSimulatedPrice(92);
      logs.push(lang === 'fr' 
        ? "⚡ Télémétrie : 3 paniers chauds initiés en moins de 45 secondes sur l'article." 
        : "⚡ Telemetry: 3 hot shopping carts opened within 45 seconds on this exact item.");
      logs.push(lang === 'fr'
        ? "🤖 Algorithme Smart Pricer : Demande en hausse. Ajustement du prix cible à +16% (92 €)."
        : "🤖 Smart Pricer Algorithm: Demand spikes. Target price set to +16% ($92).");
      logs.push(lang === 'fr'
        ? "📈 Résultat : Marges accrues en direct de 13 € sans impact sur la courbe d'achats."
        : "📈 Verdict: Direct margins increased by $13 without hurting checkout curve.");
    } else if (scenario === 'low_market') {
      setSimulatedPrice(69);
      logs.push(lang === 'fr'
        ? "⚠️ Scraper : 2 concurrents directs baissent leurs tarifs sur Google Shopping à 64 €."
        : "⚠️ Scraper: 2 direct competitors dropped prices down to $64 on Yahoo/Google.");
      logs.push(lang === 'fr'
        ? "🤖 Smart Pricer : Ajustement réactif à 69 € avec coupon d'urgence affiché 'Offre exclusive' pour préserver le volume."
        : "🤖 Smart Pricer: Reactive drop to $69 coupled with an automated 'Exclusive discount' badge to capture sales.");
      logs.push(lang === 'fr'
        ? "✅ Résultat : Volume de ventes préservé à 100% sans s'écrouler de façon abusive."
        : "✅ Verdict: Sales volume 100% shielded from competitor aggressive dump.");
    } else if (scenario === 'high_market') {
      setSimulatedPrice(88);
      logs.push(lang === 'fr'
        ? "💎 Inspecteur Concurrentiel : Rupture de stock signalée chez vos 3 concurrents."
        : "💎 Competitor Watch: Global stock-out recorded across 3 direct competitor web stores.");
      logs.push(lang === 'fr'
        ? "🤖 Smart Pricer : Indexation d'opportunité exclusive. Hausse intelligente à 88 € (+11.4%)."
        : "🤖 Smart Pricer: Exclussive supply opportunity. Safe price bump to $88 (+11.4%).");
      logs.push(lang === 'fr'
        ? "💰 Résultat : Profit maximal capté instantanément sur l'approvisionnement restant."
        : "💰 Verdict: Peak profitability captured instantly based on inventory scarcity.");
    }
    setSimLogs(logs);
  };

  const resetPricingSim = () => {
    setPricingStrategy('idle');
    setSimulatedPrice(79);
    setSimLogs([]);
  };

  // Section 4: Heatmap Attention States
  const [heatmapPoints, setHeatmapPoints] = useState<{ x: number; y: number; val: number }[]>([]);
  const [frictionAlert, setFrictionAlert] = useState(false);

  const handleHeatmapMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    // Add point dynamically
    if (heatmapPoints.length < 30) {
      setHeatmapPoints(prev => [...prev, { x, y, val: Math.floor(Math.random() * 100) + 50 }]);
    }

    // Trigger random friction warning
    if (heatmapPoints.length > 20 && !frictionAlert && Math.random() > 0.85) {
      setFrictionAlert(true);
    }
  };

  const resetHeatmap = () => {
    setHeatmapPoints([]);
    setFrictionAlert(false);
  };

  return (
    <div id="ai-advantages-page" className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Intros Header Showcase */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
          <Award className="w-4 h-4 text-blue-400" />
          <span>{dict.showcase_badge_main}</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          {dict.showcase_title}
        </h1>
        
        <p className="text-base sm:text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
          {dict.showcase_subtitle}
        </p>

        {/* Anchor Action */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button 
            onClick={onGetStarted}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-white hover:to-white hover:text-black text-white font-black uppercase text-xs tracking-wider shadow-2xl shadow-blue-500/10 transition-all duration-300 active:scale-[0.98] flex items-center gap-2"
          >
            {dict.showcase_cta_primary} <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={onGoToPricing}
            className="px-8 py-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 hover:bg-gray-900 text-gray-300 font-bold uppercase text-xs tracking-wider transition-all"
          >
            {dict.showcase_cta_secondary}
          </button>
        </div>
      </div>

      {/* Grid of 4 magnificent interactive showcases */}
      <div className="space-y-24">

        {/* 1. SIMULATEUR ROI GÉANT */}
        <section className="bg-gray-950/40 border border-gray-800/80 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Control Form */}
            <div className="lg:col-span-6 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase font-extrabold mb-4">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span>{lang === 'fr' ? "RACCORD DE PROFIT & VALEUR" : "VALUE & REVENUE CONECTOR"}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-6">
                  {dict.roi_heading}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mb-8 leading-relaxed">
                  {dict.roi_desc}
                </p>
              </div>

              {/* Sliders Container */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-gray-400 font-bold uppercase">{dict.roi_label_traffic}</span>
                    <span className="text-white font-black">{traffic.toLocaleString()} / {lang === 'fr' ? 'mois' : 'mo'}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="50000" 
                    step="500"
                    value={traffic} 
                    onChange={(e) => setTraffic(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-gray-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-1">
                    <span>1 000</span>
                    <span>25 000</span>
                    <span>50 000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-gray-400 font-bold uppercase">{dict.roi_label_basket}</span>
                    <span className="text-white font-black">{basket} €</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="300" 
                    step="5"
                    value={basket} 
                    onChange={(e) => setBasket(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-gray-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-1">
                    <span>15 €</span>
                    <span>160 €</span>
                    <span>300 €</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-gray-400 font-bold uppercase">{dict.roi_label_conv}</span>
                    <span className="text-white font-black">{convRate.toFixed(1)} %</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="5.0" 
                    step="0.1"
                    value={convRate} 
                    onChange={(e) => setConvRate(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-gray-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-1">
                    <span>0.5%</span>
                    <span>2.5%</span>
                    <span>5.0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live Output Panel */}
            <div className="lg:col-span-6 bg-gray-950 border border-gray-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <TrendingUp className="w-32 h-32 text-blue-500" />
              </div>

              <div>
                <p className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase mb-6 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 max-w-fit">
                  {dict.roi_result_title}
                </p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-4">
                    <span className="text-xs text-gray-500 uppercase font-mono font-bold">{dict.roi_res_normal_rev}</span>
                    <span className="text-xl font-bold font-mono text-gray-400">{rawRevenue.toLocaleString()} €</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-900 pb-4">
                    <div>
                      <span className="text-xs text-blue-400 uppercase font-mono font-black">{dict.roi_res_optimized_rev}</span>
                      <span className="block text-[9px] text-gray-500 uppercase font-bold tracking-wide mt-0.5">({(convRate + 1.8).toFixed(1)}% Conversion rate)</span>
                    </div>
                    <span className="text-2xl font-black font-mono text-white">{optimizedRevenue.toLocaleString()} €</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs text-white uppercase font-black">{dict.roi_res_rev_lift}</span>
                      <span className="block text-[8px] text-gray-400 font-mono uppercase mt-1">{dict.roi_lift_explain}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono shadow-sm bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 block">
                        +{addedRevenue.toLocaleString()} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  {lang === 'fr' 
                    ? "REVENUS MENSUELS RÉELS INTÉGRABLES DIRECTEMENT" 
                    : "COMPREHENSIVE MULTI-METRIC PERFORMANCE LIFT GENERATED"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DYNAMIC BEFORE/AFTER SEO CONVERTER */}
        <section className="bg-gray-950/40 border border-gray-800/80 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden backdrop-blur-md text-left">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="text-center lg:text-left mb-12">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-purple-400 font-mono text-xs uppercase font-extrabold mb-4">
              <Search className="w-4 h-4" />
              <span>{lang === 'fr' ? "TRANSFORMATION DE CONTENU SEMANTIQUE" : "SEMANTIC NLP OVERHAUL ENGINE"}</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              {dict.content_heading}
            </h2>
            
            <p className="text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed">
              {dict.content_desc}
            </p>
          </div>

          {/* Product Select Tabs */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            <button 
              onClick={() => setActiveSEOProduct('cosmetics')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeSEOProduct === 'cosmetics' ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-500 hover:text-gray-300"
              )}
            >
              {dict.content_toggle_cosm}
            </button>
            <button 
              onClick={() => setActiveSEOProduct('sport')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeSEOProduct === 'sport' ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-500 hover:text-gray-300"
              )}
            >
              {dict.content_toggle_fit}
            </button>
            <button 
              onClick={() => setActiveSEOProduct('tech')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeSEOProduct === 'tech' ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-500 hover:text-gray-300"
              )}
            >
              {dict.content_toggle_tech}
            </button>
          </div>

          {/* Before & After Interactive Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Before Card */}
            <div className="bg-gray-950 p-6 sm:p-8 rounded-3xl border border-red-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono text-red-400 font-extrabold uppercase px-2 py-1 bg-red-400/5 rounded border border-red-500/10">
                    {dict.content_card_before}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-red-400/80 font-mono font-bold">
                    <span>{dict.content_seo_score}</span>
                    <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] font-extrabold border border-red-500/25">34 / 100</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-300 mb-2 truncate">
                  {seoProductData[activeSEOProduct].before.title}
                </h3>
                
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  "{seoProductData[activeSEOProduct].before.desc}"
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-900">
                <span className="text-[8px] font-mono text-gray-600 uppercase font-black">
                  {lang === 'fr' ? "STRUCTURE ANALYTIQUE : PAUVRE" : "SEO STRUCTURE STATUS: WEAK"}
                </span>
              </div>
            </div>

            {/* After Card (Nexus AI) */}
            <div className="bg-[#040817] p-6 sm:p-8 rounded-3xl border border-purple-500/30 flex flex-col justify-between shadow-[0_10px_35px_rgba(139,92,246,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                Nexus AI Generated
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono text-purple-400 font-extrabold uppercase px-2 py-1 bg-purple-400/10 rounded border border-purple-500/20">
                    {dict.content_card_after}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                    <span>{dict.content_seo_score}</span>
                    <motion.span 
                      key={activeSEOProduct}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-500/25 block shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                    >
                      96 / 100
                    </motion.span>
                  </div>
                </div>

                <motion.h3 
                  key={`title_${activeSEOProduct}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-base font-black text-white mb-3"
                >
                  {seoProductData[activeSEOProduct].after.title}
                </motion.h3>
                
                <motion.p 
                  key={`desc_${activeSEOProduct}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-300 leading-relaxed whitespace-pre-line"
                >
                  {seoProductData[activeSEOProduct].after.desc}
                </motion.p>

                {/* Features Badges */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {seoProductData[activeSEOProduct].after.features.map((feat, fId) => (
                    <span key={fId} className="px-2 py-1 bg-gray-900 border border-gray-800 text-gray-400 rounded text-[9px] font-bold uppercase tracking-wider">
                      • {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags suggestion indexer */}
              <div className="mt-8 pt-4 border-t border-gray-900">
                <span className="text-[9px] font-mono text-indigo-400 uppercase font-black block mb-2">
                  {lang === 'fr' ? "🏷️ MOTS CLÉS DE CIBLAGE SUGGÉRÉS :" : "🏷️ TARGET KEYWORDS MAP INJECTED:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {seoProductData[activeSEOProduct].tags.map((tag, tId) => (
                    <span key={tId} className="px-2 py-0.5 bg-indigo-500/5 border border-indigo-500/10 text-indigo-300/80 rounded-md text-[8px] font-mono font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE SMART DYNAMIC PRICER SCENARIOS */}
        <section className="bg-gray-950/40 border border-gray-850 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden backdrop-blur-md text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Text description */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-extrabold mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>{lang === 'fr' ? "AJUSTEUR TARIFAIRE AUTONOME" : "AUTONOMOUS REPRICING ENGINE"}</span>
                </div>
                
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
                  {dict.pricing_heading}
                </h2>
                
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-8">
                  {dict.pricing_desc}
                </p>
              </div>

              {/* Scenarios triggers */}
              <div className="space-y-3">
                <button 
                  onClick={() => runPricingSimulation('peak')}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left flex items-center justify-between text-xs font-black uppercase tracking-wider transition-all duration-300 hover:translate-x-1",
                    pricingStrategy === 'peak' ? "bg-blue-600/10 border-blue-500/40 text-blue-400 shadow-md" : "bg-gray-900/60 border-transparent text-gray-400 hover:border-gray-800"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    {dict.pricing_btn_peak}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => runPricingSimulation('low_market')}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left flex items-center justify-between text-xs font-black uppercase tracking-wider transition-all duration-300 hover:translate-x-1",
                    pricingStrategy === 'low_market' ? "bg-amber-600/10 border-amber-500/40 text-amber-400 shadow-md" : "bg-gray-900/60 border-transparent text-gray-400 hover:border-gray-800"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-400" />
                    {dict.pricing_btn_comp_low}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => runPricingSimulation('high_market')}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left flex items-center justify-between text-xs font-black uppercase tracking-wider transition-all duration-300 hover:translate-x-1",
                    pricingStrategy === 'high_market' ? "bg-purple-600/10 border-purple-500/40 text-purple-400 shadow-md" : "bg-gray-900/60 border-transparent text-gray-400 hover:border-gray-800"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    {dict.pricing_btn_comp_high}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price Visualization Output */}
            <div className="lg:col-span-7 bg-gray-950 border border-gray-850 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-6">
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-gray-500 uppercase">
                      SMART_PRICER::DECISION_VISUALIZER
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white mt-1">
                      {lang === 'fr' ? "PRODUIT : CASQUE ERGO-TECH COMFORT" : "ITEM: COMFORT ERGO-TECH HEADSETS"}
                    </h3>
                  </div>

                  <button 
                    onClick={resetPricingSim}
                    className="px-3 py-1 bg-gray-900 border border-gray-850 rounded-xl text-[9px] font-mono text-gray-400 hover:text-white"
                  >
                    Reset Sim
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 justify-around my-8">
                  {/* Base Price Display */}
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">
                      {lang === 'fr' ? "PRIX INITIAL CATALOGUE" : "DEFAULT RETAIL PRICE"}
                    </span>
                    <p className="text-4xl font-extrabold text-gray-400 font-mono mt-1">
                      79 €
                    </p>
                  </div>

                  {/* Operational Arrow */}
                  <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center relative shrink-0">
                    <RefreshCw className={cn("w-5 h-5 text-indigo-400 shrink-0", pricingStrategy !== 'idle' && "animate-spin")} />
                  </div>

                  {/* Calculated Smart Price Display */}
                  <div className="text-center relative">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black block">
                      {lang === 'fr' ? "🎯 PRIX OPTIMISÉ PAR IA" : "🎯 AI ADJUSTED TARGET"}
                    </span>
                    <motion.p 
                      key={simulatedPrice}
                      initial={{ scale: 0.8, y: -5 }}
                      animate={{ scale: 1, y: 0 }}
                      className="text-5xl font-black text-white font-mono mt-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      {simulatedPrice} €
                    </motion.p>
                  </div>
                </div>

                {/* Scenario Strategy Logs */}
                <div className="bg-[#030611] border border-gray-900 p-4 rounded-xl min-h-[100px]">
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-black block mb-2">
                    {dict.pricing_sim_status}
                  </span>

                  {simLogs.length === 0 ? (
                    <p className="text-xs text-gray-600 italic font-mono mt-2">
                      {lang === 'fr' 
                        ? "// Cliquez sur un scénario d'événements à gauche pour engager les actuateurs d'IA..." 
                        : "// Click on a market event scenario on the left to fire the simulated AI decision loop..."}
                    </p>
                  ) : (
                    <div className="space-y-1 text-[11px] font-mono leading-relaxed">
                      {simLogs.map((log, idx) => (
                        <p key={idx} className={idx === 1 ? "text-indigo-400" : idx === 2 ? "text-emerald-400 font-bold" : "text-gray-400"}>
                          {log}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-900">
                <span className="text-[8px] font-mono text-gray-600 uppercase font-black">
                  {lang === 'fr' ? "TÉLÉMÉTRIE D'ALGORITHMES DE THÉORIE DES JEUX" : "TLS 1.3 SECURE CALCULUS AND GAME THEORY ROUTING"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. REALTIME INTERACTIVE MOCKUP HEATMAP INTERFACES */}
        <section className="bg-gray-950/40 border border-gray-800/80 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden backdrop-blur-md text-left">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="text-center lg:text-left mb-12">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-indigo-400 font-mono text-xs uppercase font-extrabold mb-4">
              <MousePointer className="w-4 h-4 animate-bounce" />
              <span>{lang === 'fr' ? "DÉTECTEUR DE FRICTION COMPORTEMENTAL" : "LIVE ATTENTION PATH & FRICTION LOGS"}</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              {dict.heatmap_heading}
            </h2>
            
            <p className="text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed">
              {dict.heatmap_desc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Interactive Mock Canvas Card */}
            <div 
              onMouseMove={handleHeatmapMove}
              className="lg:col-span-7 bg-[#050917] border border-gray-800 rounded-3xl p-6 relative overflow-hidden cursor-crosshair select-none min-h-[350px] flex flex-col justify-between"
            >
              {/* Telemetry Dots canvas overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {heatmapPoints.map((point, id) => (
                  <span 
                    key={id}
                    className="absolute w-6 h-6 -ml-3 -mt-3 bg-red-500/10 border border-red-500/30 rounded-full animate-ping pointer-events-none"
                    style={{ left: point.x, top: point.y }}
                  />
                ))}
                {heatmapPoints.map((point, id) => (
                  <span 
                    key={`dot_${id}`}
                    className="absolute w-2 h-2 -ml-1 -mt-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none"
                    style={{ left: point.x, top: point.y }}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center relative z-10">
                <span className="text-[8px] font-mono text-slate-500 font-extrabold tracking-widest bg-gray-900 border border-gray-800 px-2 py-1 rounded">
                  CLIENT_RADAR::ACTIVE_HOVER_STAGE
                </span>
                <span className="text-[8px] font-mono text-emerald-400 uppercase font-black">
                  Hover to map attention
                </span>
              </div>

              {/* Product Visual Layout Mock */}
              <div className="my-8 text-center relative z-10 pointer-events-none">
                <span className="text-4xl">🧘‍♀️</span>
                <h3 className="text-sm font-black uppercase text-white mt-3">{lang === 'fr' ? 'Sutra Yoga Tapis' : 'Sutra Yoga Mat'}</h3>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: #prod_10283 • {lang === 'fr' ? 'Prix' : 'Price'}: 49.00 €</p>
                <div className="mt-4 inline-block px-8 py-3 bg-blue-600 rounded-2xl text-[10px] font-mono text-white font-extrabold uppercase">
                  {lang === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART'}
                </div>
              </div>

              {/* Reset Control indicator inner */}
              <div className="flex justify-between items-center bg-black/40 border border-gray-850 p-2 rounded-xl relative z-10">
                <span className="text-[8px] font-mono text-gray-500">
                  Total trackpoints: {heatmapPoints.length}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); resetHeatmap(); }}
                  className="px-2 py-1 bg-gray-900 text-slate-400 hover:text-white rounded text-[8px] font-mono border border-gray-800"
                >
                  {dict.heatmap_reset}
                </button>
              </div>
            </div>

            {/* Friction Logs Display lists */}
            <div className="lg:col-span-5 bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase mb-4 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 max-w-fit block">
                  {dict.heatmap_active_points}
                </span>

                <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
                  {heatmapPoints.length === 0 ? (
                    <p className="text-xs text-gray-600 italic font-mono p-4 bg-gray-900/45 rounded-xl border border-gray-900">
                      {lang === 'fr' 
                        ? "// Passez la souris sur le cadre de gauche pour générer de la donnée..." 
                        : "// Move cursor over the radar element to feed attention data..."}
                    </p>
                  ) : (
                    heatmapPoints.slice(-5).map((point, id) => (
                      <div key={id} className="p-2 bg-gray-900 border border-gray-850 rounded-xl flex items-center justify-between font-mono text-[9px]">
                        <span className="text-gray-400">Position Event : x:{point.x} y:{point.y}</span>
                        <span className="text-blue-400 font-bold">Focus: {point.val}ms</span>
                      </div>
                    ))
                  )}
                </div>

                <AnimatePresence>
                  {frictionAlert && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs mt-6 flex items-start gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping mt-1 shrink-0" />
                      <div>
                        <p className="font-extrabold uppercase text-[10px] tracking-wider mb-0.5">{dict.heatmap_friction_detected}</p>
                        <p className="text-[9px] text-gray-500 font-mono leading-relaxed mt-1">
                          {lang === 'fr' 
                            ? "L'acheteur défile lentement près de l'actionneur de panier. Smart rules : Engagement automatique d'un coupon !" 
                            : "Prospect moves slowly near shopping trigger. Smart rules activates an automated discount trigger!"}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-900">
                <span className="text-[8px] font-mono text-gray-600 uppercase font-black block">
                  {lang === 'fr' 
                    ? "PRÉVENTION ET MODÉLISATION DE BOUNCE DE CONVERSION" 
                    : "ACTIVE DRAIN DECAY MODEL COMPATIBILITY"}
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
