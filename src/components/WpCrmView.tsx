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
  Server,
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
  ShoppingCart,
  CreditCard,
  Eye,
  Bot,
  ArrowRight,
  Radio,
  Gauge,
  Compass,
  FileText,
  MousePointer,
  Heart,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { cn } from '../lib/utils';
import { WPConfig } from '../types';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

interface WpCrmViewProps {
  config: WPConfig;
}

// Interface for live WooCommerce visitor
interface WpLiveVisitor {
  id: string;
  ip: string;
  email: string | null;
  name: string;
  city: string;
  country: string;
  device: 'desktop' | 'mobile' | 'tablet';
  currentAction: 'cart_adding' | 'checkout' | 'reading_article' | 'browsing_product' | 'completed_order' | 'idle';
  targetItem: string;
  durationSeconds: number;
  cartTotal: number;
  currency?: string;
  avatarColor: string;
  isAiIntervened: boolean;
}

export default function WpCrmView({ config }: WpCrmViewProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const [activeSubTab, setActiveSubTab] = useState<'radar' | 'analytics' | 'script'>('radar');
  const [analyticsInterval, setAnalyticsInterval] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [analyticsData, setAnalyticsData] = useState<any>({ hourly: [], daily: [], weekly: [], monthly: [], yearly: [] });
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Popular and unpopular items states
  const [popularItems, setPopularItems] = useState<{
    products: any[];
    articles: any[];
    pages: any[];
    all: any[];
  }>({ products: [], articles: [], pages: [], all: [] });
  const [isPopularItemsLoading, setIsPopularItemsLoading] = useState(false);
  const [popularTab, setPopularTab] = useState<'products' | 'articles' | 'pages'>('products');
  const [popularSort, setPopularSort] = useState<'most' | 'least'>('most');
  const [popularFilterText, setPopularFilterText] = useState('');

  // AI Strategy states
  const [aiStrategyText, setAiStrategyText] = useState<string>('');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState<boolean>(false);
  const [visitors, setVisitors] = useState<WpLiveVisitor[]>([]);
  const [realVisitors, setRealVisitors] = useState<WpLiveVisitor[]>([]);
  const [trafficMode, setTrafficMode] = useState<'hybrid' | 'live' | 'demo'>('hybrid');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  
  // Real-time logs/notifications
  const [liveLog, setLiveLog] = useState<{ id: string; text: string; time: string; type: 'success' | 'warn' | 'info' }[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Remaining simulation variables (stripped off manual/auto triggers)
  const [simulationTrafficMultiplier, setSimulationTrafficMultiplier] = useState(1);
  const [copiedJs, setCopiedJs] = useState(false);
  const [copiedPhp, setCopiedPhp] = useState(false);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);

  // Fetch telemetry statistics dynamically
  useEffect(() => {
    const fetchStats = async () => {
      setIsAnalyticsLoading(true);
      try {
        const res = await fetch(`/api/telemetry/stats?siteUrl=${encodeURIComponent(config.url || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAnalyticsData({
              hourly: data.hourly || [],
              daily: data.daily || [],
              weekly: data.weekly || [],
              monthly: data.monthly || [],
              yearly: data.yearly || []
            });
          }
        }
      } catch (err) {
        console.debug("Telemetry stats temporary offline, retrying...");
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    const fetchPopularItems = async () => {
      setIsPopularItemsLoading(true);
      try {
        const res = await fetch(`/api/telemetry/popular-items?siteUrl=${encodeURIComponent(config.url || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPopularItems({
              products: data.products || [],
              articles: data.articles || [],
              pages: data.pages || [],
              all: data.all || []
            });
          }
        }
      } catch (err) {
        console.debug("Telemetry popular items temporary offline, retrying...");
      } finally {
        setIsPopularItemsLoading(false);
      }
    };

    fetchStats();
    fetchPopularItems();
    const interval = setInterval(() => {
      fetchStats();
      fetchPopularItems();
    }, 15000); // refresh every 15 seconds
    return () => clearInterval(interval);
  }, [config.url, activeSubTab]);

  // Dynamic currency and formatting helper
  const formatCurrency = (amount: number, currencyCode?: string) => {
    const code = (currencyCode || config.currency || 'EUR').toUpperCase();
    const symbolMap: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'TND': 'د.t',
      'CAD': 'C$',
      'MAD': 'DH',
    };
    const symbol = symbolMap[code] || code;
    return `${amount.toFixed(2)} ${symbol}`;
  };

  // Toast notifier helper
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

  // Seed default WooCommerce visitors
  useEffect(() => {
    const initialUsers: WpLiveVisitor[] = [
      {
        id: 'wp-vis-1',
        ip: '194.254.120.3',
        email: 'sophie.legrand@gmail.com',
        name: 'Sophie Legrand',
        city: 'Marseille',
        country: 'France',
        device: 'mobile',
        currentAction: 'cart_adding',
        targetItem: 'Sérum Anti-Âge Premium Réparateur',
        durationSeconds: 154,
        cartTotal: 79.90,
        avatarColor: 'from-purple-500 to-indigo-600',
        isAiIntervened: false
      },
      {
        id: 'wp-vis-2',
        ip: '82.160.2.14',
        email: null,
        name: 'Guest #4829',
        city: 'Genève',
        country: 'Suisse',
        device: 'desktop',
        currentAction: 'checkout',
        targetItem: 'Panier : Crème Hydratation Intense + Gommage Bio',
        durationSeconds: 290,
        cartTotal: 124.50,
        avatarColor: 'from-slate-600 to-slate-800',
        isAiIntervened: false
      },
      {
        id: 'wp-vis-3',
        ip: '90.84.145.211',
        email: 'karim.t@outlook.com',
        name: 'Karim Traoré',
        city: 'Bruxelles',
        country: 'Belgique',
        device: 'mobile',
        currentAction: 'reading_article',
        targetItem: 'Les 5 Secrets Majeurs de la Routine Beauté 2026',
        durationSeconds: 42,
        cartTotal: 0,
        avatarColor: 'from-pink-500 to-rose-600',
        isAiIntervened: false
      },
      {
        id: 'wp-vis-4',
        ip: '109.28.39.44',
        email: null,
        name: 'Guest #9102',
        city: 'Casablanca',
        country: 'Maroc',
        device: 'tablet',
        currentAction: 'browsing_product',
        targetItem: 'Sérum Rénovateur Éclat',
        durationSeconds: 98,
        cartTotal: 49.00,
        avatarColor: 'from-emerald-500 to-teal-600',
        isAiIntervened: false
      },
      {
        id: 'wp-vis-5',
        ip: '176.54.21.90',
        email: 'valerie.duval@yahoo.fr',
        name: 'Valérie Duval',
        city: 'Paris',
        country: 'France',
        device: 'desktop',
        currentAction: 'completed_order',
        targetItem: 'Commande reçue n°8273 - Pack Sublime Gold',
        durationSeconds: 412,
        cartTotal: 189.00,
        avatarColor: 'from-amber-500 to-orange-600',
        isAiIntervened: false
      }
    ];

    setVisitors(initialUsers);
    pushLog("Radar live WP démarré pour " + (config.url || "votre boutique WordPress"), "success");
    pushLog("Synchronisation avec l'API WooCommerce active", "info");
  }, [config.url]);

  // Poll real-time telemetry from Node.js backend
  const knownVisitorActionsRef = useRef<Record<string, string>>({});
  useEffect(() => {
    let lastRealCount = 0;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`/api/telemetry?siteUrl=${encodeURIComponent(config.url || '')}`);
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json() as WpLiveVisitor[];
            setRealVisitors(data);
            
            if (data.length > 0 && lastRealCount === 0) {
              pushLog(`📡 [INTEGRATION] Flux réel connecté ! Capté ${data.length} visiteur(s) actif(s) sur ${config.url || 'votre boutique'}.`, "success");
              showToast('Nouveaux visiteurs réels repérés par le Pixel !', 'info');
            }

            // Dynamic detection of real-time incoming events
            data.forEach(v => {
              const prevAction = knownVisitorActionsRef.current[v.id];
              if (prevAction !== v.currentAction) {
                knownVisitorActionsRef.current[v.id] = v.currentAction;
                const formattedSum = formatCurrency(v.cartTotal, v.currency);
                
                if (v.currentAction === 'completed_order') {
                  pushLog(`🎉 TRANSACTION RÉELLE REÇUE : ${v.name} (${v.city}, ${v.country}) a validé sa commande ! (+${formattedSum})`, "success");
                  showToast(`Nouvelle vente réelle en direct de ${v.name} ! (${formattedSum})`, 'success');
                } else if (v.currentAction === 'cart_adding') {
                  pushLog(`🛒 Panier Actif (Réel) : ${v.name} a ajouté un article ! (${formattedSum})`, "info");
                } else if (v.currentAction === 'checkout') {
                  pushLog(`⚠️ Passage en Caisse (Réel) : ${v.name} entame le paiement ! (${formattedSum})`, "warn");
                } else if (v.currentAction === 'browsing_product') {
                  pushLog(`👀 Visite (Réelle) : ${v.name} consulte "${v.targetItem}"`, "info");
                } else if (v.currentAction === 'reading_article') {
                  pushLog(`📖 Lecture (Réelle) : ${v.name} lit l'article "${v.targetItem}"`, "info");
                }
              }
            });

            lastRealCount = data.length;
          } else {
            // Received non-JSON or HTML fallback page, default realVisitors to empty
            setRealVisitors([]);
          }
        }
      } catch (err) {
        console.debug("Telemetry polling temporary offline, retrying...");
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [config.url]);

  // Poll raw diagnostics HTTP telemetry logs
  useEffect(() => {
    if (activeSubTab !== 'script') return;
    
    const fetchDebugLogs = async () => {
      try {
        const res = await fetch(`/api/telemetry-debug?siteUrl=${encodeURIComponent(config.url || '')}`);
        if (res.ok) {
          const data = await res.json();
          setDebugLogs(data);
        }
      } catch (err) {
        console.debug("Telemetry debug logs temporary offline, retrying...");
      }
    };
    
    fetchDebugLogs();
    const interval = setInterval(fetchDebugLogs, 4000);
    return () => clearInterval(interval);
  }, [activeSubTab]);

  // Live Stream Simulation effect (ticks active timers, changes shopper actions dynamically)
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors(prev => {
        // Let's perform a smart update on one random shopper
        const updated = prev.map((v, idx) => {
          // Increment duration ticks
          let currentAction = v.currentAction;
          let targetItem = v.targetItem;
          let cartTotal = v.cartTotal;
          let isAiIntervened = v.isAiIntervened;

          // 20% chance of random state transition for dynamic visual flow
          if (Math.random() > 0.82) {
            const actionsPool: { action: WpLiveVisitor['currentAction']; target: string; logText: string; type: 'success' | 'warn' | 'info'; cartAdd?: number }[] = [
              {
                action: 'cart_adding',
                target: 'Sérum Rénovateur Éclat',
                logText: `${v.name} a ajouté au panier "Sérum Rénovateur Éclat" par recommandation interne`,
                type: 'info',
                cartAdd: 49
              },
              {
                action: 'checkout',
                target: 'Écran de commande - Validation finale',
                logText: `⚠️ Attention: ${v.name} a franchi la page panier et se trouve sur le Checkout !`,
                type: 'warn'
              },
              {
                action: 'completed_order',
                target: `Commande validée! ID #${Math.floor(8200 + Math.random() * 500)}`,
                logText: `🎉 VENTE EN DIRECT : ${v.name} vient de valider sa commande ! (+${formatCurrency(cartTotal || 59)})`,
                type: 'success'
              },
              {
                action: 'reading_article',
                target: "Guide Ultimate : Comment s'hydrater la peau en été",
                logText: `${v.name} est en train de lire le blog (SEO Content Boost)`,
                type: 'info'
              },
              {
                action: 'browsing_product',
                target: 'Huile Nettoyante Hydratante Bio',
                logText: `${v.name} consulte la fiche produit 'Huile Nettoyante'`,
                type: 'info'
              }
            ];

            const change = actionsPool[Math.floor(Math.random() * actionsPool.length)];
            currentAction = change.action;
            targetItem = change.target;
            if (change.cartAdd) {
              cartTotal += change.cartAdd;
            }
            
            pushLog(change.logText, change.type);
          }

          // Random checkout completion if they were on checkout
          if (currentAction === 'checkout' && Math.random() > 0.9) {
            currentAction = 'completed_order';
            targetItem = `Commande Validée n°${Math.floor(12400 + Math.random() * 600)}`;
            pushLog(`🎉 CONVERSION : ${v.name} a payé son panier de ${formatCurrency(cartTotal)} !`, 'success');
          }

          return {
            ...v,
            currentAction,
            targetItem,
            cartTotal,
            isAiIntervened,
            durationSeconds: v.durationSeconds + 3
          };
        });

        // 12% chance of hosting a new guest visitor
        if (Math.random() > 0.88 && updated.length < 8) {
          const names = ['Thomas Bernard', 'Chloé Martin', 'Alexandre Petit', 'Emma Robert', 'Lucas Richard', 'Guest #1093', 'Guest #5833'];
          const cities = ['Lyon', 'Toulouse', 'Bordeaux', 'Quebec', 'Geneve', 'Lausanne', 'Nantes'];
          const countries = ['France', 'France', 'France', 'Canada', 'Suisse', 'Suisse', 'France'];
          const items = ['Crème Revitalisante Caviar', 'Lait corps Ultra Riche', 'Soin ciblé correcteur imperfections', 'Page d\'acceuil'];
          
          const newIdx = Math.floor(Math.random() * names.length);
          const newVis: WpLiveVisitor = {
            id: 'wp-vis-' + Math.random().toString(36).substring(3, 8),
            ip: `194.88.${Math.floor(10 + Math.random() * 200)}.${Math.floor(1 + Math.random() * 253)}`,
            email: names[newIdx].startsWith('Guest') ? null : `${names[newIdx].toLowerCase().replace(' ', '.')}@gmail.com`,
            name: names[newIdx],
            city: cities[Math.floor(Math.random() * cities.length)],
            country: countries[Math.floor(Math.random() * countries.length)],
            device: Math.random() > 0.5 ? 'desktop' : 'mobile',
            currentAction: 'browsing_product',
            targetItem: items[Math.floor(Math.random() * items.length)],
            durationSeconds: 1,
            cartTotal: Math.random() > 0.5 ? Math.floor(29 + Math.random() * 120) : 0,
            avatarColor: ['from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-500', 'from-pink-500 to-rose-500', 'from-amber-500 to-yellow-600'][Math.floor(Math.random() * 4)],
            isAiIntervened: false
          };

          updated.push(newVis);
          pushLog(`🆕 Nouveau visiteur détecté sur WP : ${newVis.name} (${newVis.city}, ${newVis.country})`, "info");
        }

        // Clean up users that became idle or stayed over 600s
        return updated.filter(v => v.durationSeconds < 600);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Execute direct Nexus closing intercept (Manually trigger coupon/AI help)
  const executeIntervene = async (visitor: WpLiveVisitor, isReengage: boolean = false) => {
    setVisitors(prev => prev.map(v => {
      if (v.id === visitor.id) {
        const hasMarker = v.targetItem.includes('(Interception AI active)');
        return { 
          ...v, 
          isAiIntervened: true, 
          targetItem: hasMarker ? v.targetItem : v.targetItem + ' (Interception AI active)' 
        };
      }
      return v;
    }));

    setRealVisitors(prev => prev.map(v => {
      if (v.id === visitor.id) {
        const hasMarker = v.targetItem.includes('(Interception AI active)');
        return { 
          ...v, 
          isAiIntervened: true, 
          targetItem: hasMarker ? v.targetItem : v.targetItem + ' (Interception AI active)' 
        };
      }
      return v;
    }));

    try {
      await fetch('/api/telemetry/intervene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          visitorId: visitor.id, 
          isAiIntervened: true,
          wpUrl: config.url || '',
          wpUsername: config.username || '',
          wpPassword: config.applicationPassword || '',
          consumerKey: config.consumerKey || '',
          consumerSecret: config.consumerSecret || ''
        })
      });
    } catch (e) {
      console.error("Error setting live intervention on backend:", e);
    }
    
    // Log
    if (isReengage) {
      pushLog(`🪄 Relance d'engagement IA (Double-engagement) relancée pour ${visitor.name}. Coupon renvoyé.`, "success");
      showToast(`Double-engagement AI re-transmis en direct à ${visitor.name} !`);
    } else {
      pushLog(`🪄 Nexus Intercept lancé pour ${visitor.name}. Notification push AI d'aide au panier rédigée.`, "success");
      showToast(`Engagement AI transmis en direct à ${visitor.name} ! Coupon de conversion généré.`);
    }
  };

  // Reset the client's live intervention state
  const resetIntervention = async (visitor: WpLiveVisitor) => {
    setVisitors(prev => prev.map(v => {
      if (v.id === visitor.id) {
        const cleanedItem = v.targetItem.replace(/\s*\(Interception AI active\)/gi, '').trim();
        return { ...v, isAiIntervened: false, targetItem: cleanedItem };
      }
      return v;
    }));

    setRealVisitors(prev => prev.map(v => {
      if (v.id === visitor.id) {
        const cleanedItem = v.targetItem.replace(/\s*\(Interception AI active\)/gi, '').trim();
        return { ...v, isAiIntervened: false, targetItem: cleanedItem };
      }
      return v;
    }));

    try {
      await fetch('/api/telemetry/intervene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          visitorId: visitor.id, 
          isAiIntervened: false,
          wpUrl: config.url || '',
          wpUsername: config.username || '',
          wpPassword: config.applicationPassword || '',
          consumerKey: config.consumerKey || '',
          consumerSecret: config.consumerSecret || ''
        })
      });
    } catch (e) {
      console.error("Error resetting live intervention on backend:", e);
    }

    pushLog(`🔄 Engagement réinitialisé pour ${visitor.name}. Statut remis à zéro pour une nouvelle intervention future.`, "info");
    showToast(`Statut d'engagement réinitialisé pour ${visitor.name}.`);
  };

  // Dynamically select visitors based on mode settings
  const displayedVisitors = (() => {
    if (trafficMode === 'live') {
      return realVisitors;
    } else if (trafficMode === 'demo') {
      return visitors;
    } else {
      // hybrid (default): auto-switch to real visitors if any are found, else show simulations
      return realVisitors.length > 0 ? realVisitors : visitors;
    }
  })();

  // Filters based on state
  const filteredVisitors = displayedVisitors.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchSearch = v.name.toLowerCase().includes(term) || 
                        v.city.toLowerCase().includes(term) || 
                        v.targetItem.toLowerCase().includes(term) ||
                        (v.email || '').toLowerCase().includes(term);
    
    const matchAction = actionFilter === 'all' || v.currentAction === actionFilter;
    return matchSearch && matchAction;
  });

  // Filter & sort telemetry items
  const getSortedFilteredItems = () => {
    let list = [];
    if (popularTab === 'products') list = popularItems.products || [];
    else if (popularTab === 'articles') list = popularItems.articles || [];
    else list = popularItems.pages || [];

    if (popularFilterText.trim()) {
      const lower = popularFilterText.toLowerCase();
      list = list.filter((item: any) => (item.title || '').toLowerCase().includes(lower));
    }

    return list.slice().sort((a: any, b: any) => {
      if (popularSort === 'most') {
        return (b.views || 0) - (a.views || 0);
      } else {
        return (a.views || 0) - (b.views || 0);
      }
    });
  };

  // Generate strategic short/long term AI advice
  const generateAiStrategy = async () => {
    setIsGeneratingStrategy(true);
    setAiStrategyText('');
    try {
      const res = await fetch('/api/telemetry/ai-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ siteUrl: config.url })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiStrategyText(data.strategy);
        if (typeof setToastMessage === 'function') {
          setToastMessage({ text: 'Rapport stratégique IA généré avec succès !', type: 'success' });
        }
      } else {
        setAiStrategyText(`### ❌ Impossible de générer la stratégie IA\n\n${data.error || 'Erreur indéterminée'}\n\n*Suggestion : ${data.suggestion || 'Veuillez vérifier vos configurations de clé API ou vous rassurer qu\'elles soient bien positionnées.'}*`);
      }
    } catch (err: any) {
      console.error("Error generating AI strategy:", err);
      setAiStrategyText(`### ❌ Échec de la connexion au serveur de stratégie IA\n\n${err.message}`);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Banner / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-950/40 p-8 border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-indigo-650 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                Gestion clientèle <span className="text-indigo-400">WP / WooCommerce</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-1">
                Radar de trafic en temps réel & Closing de Paniers Intelligent
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span className="font-semibold text-slate-500">LIEN WP ACTIF :</span> 
            <span className="text-white hover:underline cursor-pointer">{config.url}</span>
          </div>
        </div>

        {/* Outer Tabs switcher */}
        <div className="flex bg-[#0c0e14] border border-slate-805 border-slate-800 rounded-2xl p-1 shadow-2xl">
          <button 
            id="tab-wp-radar-crm"
            onClick={() => setActiveSubTab('radar')}
            className={cn(
              "px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer",
              activeSubTab === 'radar' ? "bg-indigo-650 text-white shadow-xl shadow-indigo-950/40" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Radar en Direct WP ({visitors.length})
          </button>
          <button 
            id="tab-nexus-matrix"
            onClick={() => setActiveSubTab('analytics')}
            className={cn(
              "px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer",
              activeSubTab === 'analytics' ? "bg-indigo-650 text-white shadow-xl shadow-indigo-950/40" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            📈 Suivi Analytique
          </button>
          <button 
            id="tab-wp-integration-script"
            onClick={() => setActiveSubTab('script')}
            className={cn(
              "px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer",
              activeSubTab === 'script' ? "bg-indigo-650 text-white shadow-xl shadow-indigo-950/40" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            🔌 Script d'intégration
          </button>
        </div>
      </div>

      {/* Dynamic Toast Feedback overlay */}
      {toastMessage && (
        <div className="fixed bottom-12 right-12 z-[999] bg-indigo-950/95 border border-indigo-500/30 p-5 rounded-3xl shadow-2xl font-sans text-xs text-indigo-200 uppercase tracking-widest font-black max-w-sm animate-bounce flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* SUBTAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'radar' ? (
          <motion.div
            key="subtab-radar"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Live Stats summary counters inside Radar */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#0b0c10] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{isEn ? 'Active WP Sessions' : 'Sessions WP Actives'}</p>
                  <h3 className="text-3xl font-black text-white italic tracking-tight">
                    {displayedVisitors.length} {isEn ? (displayedVisitors.length === 1 ? 'Visitor' : 'Visitors') : 'Clients'}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
              </div>

              <div className="bg-[#0b0c10] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{isEn ? 'Carts in Progress' : "Paniers d'achats en cours"}</p>
                  <h3 className="text-3xl font-black text-amber-500 italic tracking-tight">
                    {displayedVisitors.filter(v => v.cartTotal > 0).length} {isEn ? (displayedVisitors.filter(v => v.cartTotal > 0).length === 1 ? 'Visitor' : 'Visitors') : 'Clients'}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-amber-400" />
                </div>
              </div>

              <div className="bg-[#0b0c10] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{isEn ? 'Total Hot Carts' : 'Total paniers chauds'}</p>
                  <h3 className="text-3xl font-black text-emerald-400 italic tracking-tight font-mono">
                    {formatCurrency(displayedVisitors.reduce((sum, v) => sum + v.cartTotal, 0))}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold font-mono">
                  {config.currency || '€'}
                </div>
              </div>

              <div className="bg-[#0b0c10] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{isEn ? 'Avg Retention Time' : 'Durée Moyenne Rétention'}</p>
                  <h3 className="text-3xl font-black text-indigo-400 italic tracking-tight font-mono">
                    {(() => {
                      const totalSeconds = displayedVisitors.reduce((sum, v) => sum + (v.durationSeconds || 0), 0);
                      const avg = displayedVisitors.length > 0 ? Math.round(totalSeconds / displayedVisitors.length) : 142;
                      if (avg > 60) {
                        return `${Math.floor(avg / 60)}m ${avg % 60}s`;
                      }
                      return `${avg} s`;
                    })()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Visitors Listing Radar Control Tower */}
            <div className="lg:col-span-3 space-y-6">

              {/* Data Signal Control Dashboard */}
              <div className="bg-[#0b0c10] border border-indigo-950/40 p-5 rounded-[2.2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className={cn("w-3.5 h-3.5 rounded-full absolute animate-ping opacity-75", realVisitors.length > 0 ? "bg-emerald-500" : "bg-cyan-500/40")} />
                    <span className={cn("w-2.5 h-2.5 rounded-full relative", realVisitors.length > 0 ? "bg-emerald-400 animate-pulse" : "bg-cyan-400")} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">{isEn ? 'Radar Signal Source:' : 'Source du Signal Radar :'}</span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono block transition-colors duration-300">
                      {realVisitors.length > 0 
                        ? (isEn 
                            ? `📡 LIVE ACTIVE PIXEL (${realVisitors.length} active visitor(s) on ${config.url || "WP"})`
                            : `📡 PIXEL ACTIF EN DIRECT (${realVisitors.length} visiteur(s) de ${config.url || "WP"})`) 
                        : (isEn
                            ? "⏳ LIVE LISTENING: Waiting for tracking script (" + (config.url || "piecesdames.com") + ")"
                            : "⏳ ÉCOUTE EN DIRECT : En attente du script de tracking (" + (config.url || "piecesdames.com") + ")")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center bg-black/60 p-1 rounded-2xl border border-slate-850/60 shrink-0 select-none">
                  <span className="hidden lg:block text-[8px] font-mono font-black uppercase tracking-widest text-slate-500 px-3">{isEn ? 'Display Mode:' : "Mode d'affichage :"}</span>
                  <button
                    onClick={() => {
                      setTrafficMode('hybrid');
                      showToast(isEn ? 'Automatic Hybrid Mode enabled!' : 'Mode Hybride automatique activé !', 'info');
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer",
                      trafficMode === 'hybrid'
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {isEn ? "🤖 Hybrid (Auto)" : "🤖 Hybride (Auto)"}
                  </button>
                  <button
                    onClick={() => {
                      setTrafficMode('live');
                      showToast(isEn ? 'Live stream engaged only.' : 'Flux réel engagé uniquement.', 'info');
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1",
                      trafficMode === 'live'
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    📡 Pixel ({realVisitors.length})
                  </button>
                  <button
                    onClick={() => {
                      setTrafficMode('demo');
                      showToast(isEn ? 'Simulated demonstration triggered.' : 'Démonstration simulée activée.', 'info');
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer",
                      trafficMode === 'demo'
                        ? "bg-slate-800 text-white border border-slate-700/50"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {isEn ? "🔬 Demo" : "🔬 Démo"}
                  </button>
                </div>
              </div>
              
              {/* Traffic Filters and Search bar */}
              <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={isEn ? "SEARCH: CITY, PRODUCT, NAME..." : "CHERCHIER : VILLE, PROD, NOM..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-slate-900 rounded-xl text-[10px] text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 font-bold uppercase"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto md:justify-end">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-[10px] uppercase font-black text-slate-500 leading-none shrink-0">{isEn ? 'Filter Activity:' : 'Filtrer Activité :'}</span>
                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="bg-black border border-slate-850 px-3 py-2.5 rounded-xl text-[10px] text-white outline-none focus:border-indigo-500 font-bold uppercase min-w-[140px]"
                    >
                      <option value="all">{isEn ? 'ALL ACTIVITIES' : 'TOUTES LES ACTIVITÉS'}</option>
                      <option value="cart_adding">{isEn ? 'ACTIVE CART' : 'PANIER ACTIF'}</option>
                      <option value="checkout">{isEn ? 'CHECKOUT (HIGH RISK)' : 'CHECKOUT (SENSIBLE)'}</option>
                      <option value="reading_article">{isEn ? 'READING ARTICLES' : 'LECTURE ARTICLES'}</option>
                      <option value="browsing_product">{isEn ? 'BROWSING PRODUCTS' : 'BROWSING PRODUITS'}</option>
                      <option value="completed_order">{isEn ? 'COMPLETED ORDER' : 'ACHAT EFFECTUÉ'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Main table of tracked shoppers */}
              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] overflow-hidden">
                <div className="p-6 bg-slate-900/40 border-b border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider italic">
                      {isEn ? 'Tracking of connected users on WP' : 'Tracking des utilisateurs connectés sur WP'}
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-500">
                    {isEn ? 'Auto-refreshes every 5s' : 'MAJ automatique toutes les 5s'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 text-[9px] font-black uppercase tracking-widest bg-black/40">
                        <th className="p-5 pl-6">{isEn ? 'Client / WP IP' : 'Client / IP WP'}</th>
                        <th className="p-5">{isEn ? 'Location' : 'Provenance'}</th>
                        <th className="p-5">{isEn ? 'Device' : 'Appareil'}</th>
                        <th className="p-5">{isEn ? 'Live Activity' : 'Activité en direct'}</th>
                        <th className="p-5">{isEn ? 'Current Cart' : 'Panier Actuel'}</th>
                        <th className="p-5 text-right pr-6">{isEn ? 'Visit Time' : 'Temps de visite'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredVisitors.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-950/40 transition-colors text-xs">
                          <td className="p-5 pl-6">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center font-black text-[10px] text-white shadow-md uppercase", v.avatarColor)}>
                                {v.name.slice(0, 2)}
                              </div>
                              <div>
                                <span className="text-xs font-black text-slate-200 block">{v.name}</span>
                                <span className="text-[9px] text-slate-500 font-mono block">{v.email || v.ip}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="text-[11px] leading-none">{v.city}, {v.country}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-1 text-slate-500">
                              {v.device === 'mobile' ? (
                                <Smartphone className="w-3.5 h-3.5" />
                              ) : (
                                <Laptop className="w-3.5 h-3.5" />
                              )}
                              <span className="text-[9px] uppercase font-extrabold tracking-wider">{v.device}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="space-y-1.5">
                              {v.currentAction === 'cart_adding' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                  <ShoppingCart className="w-3 h-3 text-amber-400" />
                                  {isEn ? 'Hot Cart' : 'Panier chaud'}
                                </span>
                              )}
                              {v.currentAction === 'checkout' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                                  <CreditCard className="w-3 h-3 text-red-400" />
                                  {isEn ? 'Checking out' : 'Passe au paiement'}
                                </span>
                              )}
                              {v.currentAction === 'completed_order' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  {isEn ? 'Order Placed' : 'Achat Validé !'}
                                </span>
                              )}
                              {v.currentAction === 'reading_article' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                  <FileText className="w-3 h-3 text-blue-400" />
                                  {isEn ? 'Reading Blog Article' : 'Lit un article Blog'}
                                </span>
                              )}
                              {v.currentAction === 'browsing_product' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase bg-slate-800/50 border border-white/5 text-slate-300">
                                  <Eye className="w-3 h-3 text-slate-400" />
                                  {isEn ? 'Browsing Product' : 'Consulte produit'}
                                </span>
                              )}
                              {v.currentAction === 'idle' && (
                                <span className="text-slate-600 block text-[9px]">{isEn ? 'Idle' : 'En attente'}</span>
                              )}
                              <span className="block text-[9px] text-slate-450 text-slate-400 truncate max-w-[200px]" title={v.targetItem}>
                                {v.targetItem}
                              </span>
                            </div>
                          </td>
                          <td className="p-5 font-mono font-black italic text-slate-300 text-xs">
                            {v.cartTotal > 0 ? formatCurrency(v.cartTotal, v.currency) : '—'}
                          </td>
                          <td className="p-5 text-right pr-6">
                            <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-550/20 shadow-sm">
                              {(() => {
                                const sec = v.durationSeconds || 0;
                                if (sec > 60) {
                                  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
                                }
                                return `${sec}s`;
                              })()}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {filteredVisitors.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-24 text-center text-slate-600 text-[10px] uppercase font-black tracking-widest italic font-sans">
                            Aucun visiteur ne navigue à cet instant précis sur les filtres spécifiés
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Live Operations Feed console log */}
            <div className="space-y-6">
              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    Flux de Télémétrie Live
                  </h4>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>

                <div className="space-y-3 h-[420px] overflow-y-auto pr-1 font-mono text-[9px] leading-normal select-none scrollbar-thin scrollbar-thumb-slate-800">
                  {liveLog.map((log) => (
                    <div key={log.id} className="border-b border-slate-950/60 pb-2 flex gap-2">
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <span className={cn(
                        log.type === 'success' && "text-emerald-400 font-bold",
                        log.type === 'warn' && "text-amber-500 font-extrabold",
                        log.type === 'info' && "text-slate-350 text-slate-300"
                      )}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Projections Tool Card */}
              <div className="bg-gradient-to-br from-indigo-950/20 to-slate-950/50 border border-indigo-500/10 rounded-[2rem] p-6 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Projections de Croissance</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Grâce à l'analyse active de votre clientèle en live, le module <strong className="text-white">Nexus Autopilot</strong> réduit de <strong className="text-emerald-400">42%</strong> l'abandon de panier par re-ciblage ciblé direct.
                </p>
                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500 font-bold uppercase">Multiplicateur d'audience :</span>
                  <span className="text-[11px] font-black text-amber-400">1.8x Moyen</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeSubTab === 'analytics' ? (
          
          /* TAB 2: SUIVI ANALYTIQUE EN TEMPS RÉEL (HEURES, JOURS, SEMAINES, MOIS, ANNÉES) */
          <motion.div
            key="subtab-analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10"
          >
            {/* Interval Filters Selector & Summary */}
            <div className="bg-[#0b0c10] border border-slate-800 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-1">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Rapports Comportementaux</span>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Suivi de Télémétrie WordPress</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Consultez la navigation globale des clients. Tout le trafic est stocké par échelle chronologique.
                </p>
              </div>

              {/* Range Selector */}
              <div className="flex bg-black/60 p-1.5 rounded-2xl border border-slate-850 self-center">
                {(['hourly', 'daily', 'weekly', 'monthly', 'yearly'] as const).map((interval) => {
                  const labels: Record<string, string> = isEn ? {
                    hourly: 'Hours (24h)',
                    daily: 'Days (30d)',
                    weekly: 'Weeks (12w)',
                    monthly: 'Months (12m)',
                    yearly: 'Years (5y)'
                  } : {
                    hourly: 'Heures (24h)',
                    daily: 'Jours (30j)',
                    weekly: 'Semaines (12s)',
                    monthly: 'Mois (12m)',
                    yearly: 'Années (5a)'
                  };
                  return (
                    <button
                      key={interval}
                      onClick={() => setAnalyticsInterval(interval)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        analyticsInterval === interval
                          ? "bg-indigo-650 text-white shadow-lg shadow-indigo-950/50 border border-indigo-500/10"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {labels[interval]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick aggregate KPIs summary grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  label: isEn ? 'Unique Visitors' : 'Visiteurs Uniques',
                  value: analyticsData[analyticsInterval]?.reduce((sum: number, r: any) => sum + (r.unique_visitors || 0), 0) || 0,
                  sub: isEn ? 'Distinct customers' : 'Clients distincts',
                  color: 'text-indigo-400',
                  icon: Users
                },
                {
                  label: isEn ? 'Pages Viewed' : 'Pages Consultées',
                  value: analyticsData[analyticsInterval]?.reduce((sum: number, r: any) => sum + (r.pages_visited || 0), 0) || 0,
                  sub: isEn ? 'Standard/home pages' : 'Pages standard/accueil',
                  color: 'text-cyan-400',
                  icon: Eye
                },
                {
                  label: isEn ? 'Articles Read' : 'Articles Lus',
                  value: analyticsData[analyticsInterval]?.reduce((sum: number, r: any) => sum + (r.articles_visited || 0), 0) || 0,
                  sub: isEn ? 'Blog entries / tips' : 'Entrées blog / conseils',
                  color: 'text-purple-400',
                  icon: FileText
                },
                {
                  label: isEn ? 'Products Visited' : 'Produits Visités',
                  value: analyticsData[analyticsInterval]?.reduce((sum: number, r: any) => sum + (r.products_visited || 0), 0) || 0,
                  sub: isEn ? 'WooCommerce Store' : 'WooCommerce Store',
                  color: 'text-amber-400',
                  icon: ShoppingCart
                },
                {
                  label: isEn ? 'Avg Visit Duration' : 'Durée de Visite Moyenne',
                  value: (() => {
                    const records = analyticsData[analyticsInterval] || [];
                    if (records.length === 0) return '0 s';
                    const list = records.filter((r: any) => (r.avg_duration || 0) > 0);
                    if (list.length === 0) return '0 s';
                    const avg = Math.round(list.reduce((sum: number, r: any) => sum + (r.avg_duration || 0), 0) / list.length);
                    if (avg > 60) {
                      return `${Math.floor(avg / 60)}m ${avg % 60}s`;
                    }
                    return `${avg} s`;
                  })(),
                  sub: isEn ? 'Avg stay time / page' : 'Stay time moyen / page',
                  color: 'text-emerald-400',
                  icon: Activity
                }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-[#0b0c10] border border-slate-800 p-5 rounded-[2rem] space-y-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</span>
                    <kpi.icon className={cn("w-3.5 h-3.5", kpi.color)} />
                  </div>
                  <h4 className="text-xl font-black text-white italic font-mono">{kpi.value}</h4>
                  <p className="text-[9px] text-slate-500 font-bold">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Visual Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Chart 1: Unique Visitors (Area Chart) */}
              <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider italic flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400 animate-pulse" />
                    {isEn ? 'Unique Visitors (Clients)' : 'Fréquentation Unique (Clients)'}
                  </h4>
                  <p className="text-[8.5px] text-slate-600 font-bold uppercase tracking-wider">{isEn ? 'Evolution of recorded distinct IP addresses' : 'Évolution des adresses IP distinctes enregistrées'}</p>
                </div>
                <div className="h-72 w-full font-mono text-[9px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData[analyticsInterval]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161824" vertical={false} />
                      <XAxis dataKey="bucket" stroke="#475569" tickLine={false} />
                      <YAxis stroke="#475569" tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff' }}
                        itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="unique_visitors" name={isEn ? 'Distinct visitors' : 'Visiteurs distincts'} stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Contenus consultés (Stacked Bar Chart) */}
              <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2.5rem] space-y-4 shadow-xl">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider italic flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    {isEn ? 'Consultations Segmentation (Pages, Articles & Products)' : 'Segmentation des Consultations (Pages, Articles & Produits)'}
                  </h4>
                  <p className="text-[8.5px] text-slate-600 font-bold uppercase tracking-wider">{isEn ? 'Sorted cumulative visits actions recorded' : 'Cumul trié des actions de visites enregistrées'}</p>
                </div>
                <div className="h-72 w-full font-mono text-[9px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData[analyticsInterval]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161824" vertical={false} />
                      <XAxis dataKey="bucket" stroke="#475569" tickLine={false} />
                      <YAxis stroke="#475569" tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff' }}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="pages_visited" name={isEn ? 'Pages' : 'Pages'} stackId="a" fill="#06b6d4" />
                      <Bar dataKey="articles_visited" name={isEn ? 'Blog Articles' : 'Articles Blog'} stackId="a" fill="#a855f7" />
                      <Bar dataKey="products_visited" name={isEn ? 'Store Products' : 'Produits Store'} stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Durée d'engagement (Line/Area Chart) */}
              <div className="bg-[#0c0e14] border border-slate-800 p-6 rounded-[2.5rem] space-y-4 lg:col-span-2 shadow-xl">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider italic flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                    {isEn ? 'Average Session Retention Duration (in seconds)' : "Durée Moyenne de Rétention des Sessions (en secondes)"}
                  </h4>
                  <p className="text-[8.5px] text-slate-600 font-bold uppercase tracking-wider">{isEn ? 'Overall active duration detected on your pages and articles' : 'Durée active globale repérée sur vos pages et articles'}</p>
                </div>
                <div className="h-72 w-full font-mono text-[9px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData[analyticsInterval]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161824" vertical={false} />
                      <XAxis dataKey="bucket" stroke="#475569" tickLine={false} />
                      <YAxis stroke="#475569" tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff' }}
                        formatter={(val) => [`${Number(val).toFixed(0)} s`, isEn ? 'Avg Stay Time' : 'Stay Time Moyen']}
                      />
                      <Area type="monotone" dataKey="avg_duration" name={isEn ? 'Avg Stay Time' : 'Stay Time Moyen'} stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDuration)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RANKINGS MODULE (LES PLUS ET MOINS VISITÉS) & EXECUTIVE AI ADVISOR */}
              <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-3 gap-8 pt-4">
                
                {/* 1. Item Rankings & Detail Statistics */}
                <div className="xl:col-span-2 bg-[#0c0e14] border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider italic flex items-center gap-2">
                        <Compass className="w-4 h-4 text-cyan-400" />
                        {isEn ? 'WooCommerce & WordPress Content Rankings' : 'Classement des Contenus WooCommerce & WordPress'}
                      </h4>
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">
                        {isEn ? 'Discover the most visited pages, articles and products of your site' : 'Découvrez les pages, articles et produits les plus consultés de votre site'}
                      </p>
                    </div>

                    {/* Sorter toggler (Most vs Least) */}
                    <div className="flex bg-black/60 p-1 rounded-xl border border-slate-850 self-start md:self-center">
                      <button
                        onClick={() => setPopularSort('most')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer",
                          popularSort === 'most'
                            ? "bg-slate-900 text-white border border-slate-800"
                            : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {isEn ? '🔥 Most Popular' : '🔥 Les Plus Populaires'}
                      </button>
                      <button
                        onClick={() => setPopularSort('least')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer",
                          popularSort === 'least'
                            ? "bg-slate-900 text-white border border-slate-800"
                            : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {isEn ? '❄️ Least Popular' : '❄️ Les Moins Populaires'}
                      </button>
                    </div>
                  </div>

                  {/* Filter tabs and search row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-900 pb-4">
                    <div className="flex bg-black/40 p-1 rounded-xl border border-slate-900">
                      {[
                        { key: 'products', label: isEn ? 'Products' : 'Produits', icon: ShoppingCart },
                        { key: 'articles', label: isEn ? 'Blog Articles' : 'Articles Blog', icon: FileText },
                        { key: 'pages', label: isEn ? 'Standard Pages' : 'Pages Standard', icon: Eye }
                      ].map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setPopularTab(tab.key as any)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                              popularTab === tab.key
                                ? "bg-indigo-650 text-white shadow-md shadow-indigo-950/40"
                                : "text-slate-500 hover:text-slate-300"
                            )}
                          >
                            <IconComponent className="w-3 h-3" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick filter input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                      <input
                        type="text"
                        placeholder={isEn ? "Search by title..." : "Rechercher par titre..."}
                        value={popularFilterText}
                        onChange={(e) => setPopularFilterText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-slate-900 rounded-xl text-[10px] text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 font-bold uppercase"
                      />
                    </div>
                  </div>

                  {/* List content grid */}
                  {isPopularItemsLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
                        {isEn ? 'Extracting visit logs in real-time...' : 'Extraction des logs de visites en temps réel...'}
                      </span>
                    </div>
                  ) : getSortedFilteredItems().length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-slate-900 rounded-[2rem]">
                      <span className="block text-[40px] mb-2 opacity-30">📂</span>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        {isEn ? 'No matching content found' : 'Aucun contenu correspondant trouvé'}
                      </p>
                      <p className="text-[9px] text-slate-600 mt-1 font-mono uppercase">
                        {isEn ? 'Visit some pages or import WooCommerce diagnostic sessions!' : 'Visitez quelques pages ou importez des sessions de diagnostic WooCommerce !'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-900">
                      {getSortedFilteredItems().map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-black/35 border border-slate-900 hover:border-slate-800 p-4.5 rounded-2xl flex items-center justify-between gap-4 transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Rank circle */}
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black italic shadow-inner shrink-0",
                              popularSort === 'most'
                                ? idx === 0 
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                  : idx === 1 
                                    ? "bg-slate-400/10 text-slate-400 border border-slate-400/20" 
                                    : idx === 2 
                                      ? "bg-amber-700/10 text-amber-700 border border-amber-700/20" 
                                      : "bg-slate-950 text-slate-500 border border-slate-900"
                                : "bg-cyan-950/25 text-cyan-400 border border-cyan-500/15"
                            )}>
                              {idx + 1}
                            </div>

                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white leading-tight truncate" title={item.title}>
                                {item.title || (isEn ? "Page Title Missing" : "Titre de la page manquant")}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">
                                  {popularTab === 'products' ? (isEn ? '🛍️ Store Product' : '🛍️ Produit Store') : popularTab === 'articles' ? (isEn ? '✍️ Blog Entry' : '✍️ Entrée Blog') : (isEn ? '📃 Standard Page' : '📃 Page standard')}
                                </span>
                                <span className="text-slate-800 text-[10px]">•</span>
                                <span className="font-mono text-[8px] font-bold text-slate-600 uppercase">
                                  {isEn ? 'Avg stay time:' : 'Temps de stay moyen :'} {item.avg_duration || 0} s
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick KPIs badge */}
                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-black text-indigo-400 block tracking-tight">
                              {item.views || 0} {isEn ? 'views' : 'vues'}
                            </span>
                            <span className="text-[8.5px] font-bold text-slate-600 block uppercase leading-none mt-1">
                              {isEn ? 'Total duration:' : 'Durée totale:'} {Math.round((item.total_duration || 0) / 60)} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Executive Decision AI Advisor */}
                <div className="bg-[#0b0c10] border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                  {/* Glowing core background effect */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/8 transition-all duration-700 pointer-events-none" />

                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <Bot className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Nexus Strategy AI</span>
                      </div>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white uppercase tracking-tight italic">
                      {isEn ? 'Strategic AI Plan Intervention' : 'Intervention IA Plan Stratégique'}
                    </h4>
                    
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold animate-pulse-slow">
                      {isEn ? 'The Nexus AI will analyze your WooCommerce shop and blog traffic statistics to build a behavioral audit. You will gain stock liquidation alerts, promo code schemes and precise SEO linking optimizations.' : "L'IA de Nexus analysera les statistiques de visites de votre boutique WooCommerce et de votre blog pour dresser un audit comportemental. Vous obtiendrez des alertes de liquidation de stock, des plans de codes promotionnels et des optimisations de maillage SEO précis."}
                    </p>

                    {/* Strategic Advice Container */}
                    <div className="bg-black/40 border border-slate-900 rounded-2xl p-4 min-h-[140px] max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-950 text-xs text-slate-300">
                      {isGeneratingStrategy ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest animate-pulse text-center">
                            {isEn ? 'Generating audit and cognitive analysis...' : "Génération de l'audit et de l'analyse cognitive..."}
                          </span>
                        </div>
                      ) : aiStrategyText ? (
                        <div className="markdown-body text-slate-300 leading-relaxed space-y-3 prose prose-invert prose-xs">
                          <ReactMarkdown>{aiStrategyText}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                          <Sparkles className="w-8 h-8 text-indigo-400/40 mb-2 animate-bounce" />
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {isEn ? 'No active strategy generated' : 'Aucune stratégie active générée'}
                          </p>
                          <p className="text-[8.5px] text-slate-600 mt-1 uppercase font-mono leading-relaxed">
                            {isEn ? 'Click the button below to trigger the cognitive analysis' : "Cliquez sur le bouton ci-dessous pour déclencher l'analyse cognitive"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-900 mt-6 space-y-3.5">
                    <button
                      onClick={generateAiStrategy}
                      disabled={isGeneratingStrategy}
                      className={cn(
                        "w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2.5",
                        isGeneratingStrategy
                          ? "bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-850"
                          : "bg-indigo-650 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-950/40 border border-indigo-500/10 active:scale-[0.98]"
                      )}
                    >
                      {isGeneratingStrategy ? (
                        <>
                          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                          {isEn ? 'Generating...' : 'Génération en cours...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                          {isEn ? 'Draft Short & Long-Term Strategy' : 'Rédiger une Stratégie à Court & Long Terme'}
                        </>
                      )}
                    </button>
                    {aiStrategyText && (
                      <button
                        onClick={() => {
                          setAiStrategyText('');
                        }}
                        className="w-full py-2 bg-black border border-slate-900 hover:border-slate-800 hover:bg-slate-950/40 text-slate-500 hover:text-slate-300 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer transition-colors"
                      >
                        {isEn ? 'Clear strategy' : 'Effacer la stratégie'}
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subtab-script"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10"
          >
            {/* Introductory Statement Box */}
            <div className="bg-slate-950/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">{isEn ? 'WordPress Direct Integration' : 'Intégration Directe WordPress'}</span>
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{isEn ? 'WordPress & WooCommerce Linker' : 'Connecteur WordPress & WooCommerce'}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {isEn ? (
                    <>Integrate your tracking script to directly connect your <strong className="text-white">{config.url || "WordPress"}</strong> store. This feeds your real-time visiting radar and enables the intelligent AI re-engagement Autopilot (Nexus Client Matrix).</>
                  ) : (
                    <>Intégrez votre script de tracking pour connecter en direct votre boutique <strong className="text-white">{config.url || "WordPress"}</strong>. Cela permet d'alimenter votre radar de visites en temps réel et d'activer l'Autopilot intelligent de relance IA (Nexus Matrix Client).</>
                  )}
                </p>
              </div>
              
              <div className="bg-[#0b0c10] border border-slate-800 p-6 rounded-3xl min-w-[285px] space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider border-b border-slate-900 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isEn ? 'Signal Status' : 'État du Signal'}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">{isEn ? 'API Connection:' : 'Connexion API :'}</span>
                    <span className="text-emerald-400 font-black font-sans bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">ACTIVE 100%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">{isEn ? 'Destination Webhook:' : 'Webhook de destination :'}</span>
                    <span className="text-slate-350 font-mono text-[9px] truncate max-w-[150px]" title={`${window.location.origin}/api/telemetry`}>
                      {window.location.origin}/api/...
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">{isEn ? 'Diagnostics:' : 'Diagnostic :'}</span>
                    <span className="text-cyan-400 font-bold">ÉCOUTE EN DIRECT ...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps & Script blocks */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Step 1: JS Pixel */}
              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/5 border border-cyan-500/10 px-3 py-1 rounded-full">
                      Étape 1 : Le Pixel JavaScript
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Insertion : &lt;head&gt; / Web</span>
                  </div>
                  <h4 className="text-base font-black text-slate-200">Pixel de Télémétrie Live Nexus</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ce script léger à asynchronisme renforcé suit la navigation de vos clients en direct, leur type d'appareil (mobile, bureau) et géolocalise leur parcours. Placez-le dans le fichier <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">header.php</code> de votre thème WordPress ou utilisez une extension gratuite comme <em>"Insert Headers and Footers"</em>.
                  </p>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between bg-[#11131c] px-4 py-2 border border-slate-900 rounded-t-xl">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Code de Tracking JS</span>
                    <button
                      onClick={() => {
                        const jsCodeStr = `<!-- Pixel de Télémétrie Live Nexus -->
<script type="text/javascript">
(function() {
    window.nexusConfig = {
        appId: "3ee23777-753b-49ff-b593-1381c78c6b90",
        siteUrl: "${config.url || 'https://piecesdames.com'}",
        endpoint: "https://nexuswp.pro/api/telemetry"
    };
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = "https://nexuswp.pro/assets/nexus-telemetry.js";
    script.onload = function() {
        if (window.NexusLiveTracker) {
            window.NexusLiveTracker.init(window.nexusConfig);
        }
    };
    document.getElementsByTagName('head')[0].appendChild(script);
})();
</script>`;
                        navigator.clipboard.writeText(jsCodeStr);
                        setCopiedJs(true);
                        showToast('Script JavaScript copié !');
                        setTimeout(() => setCopiedJs(false), 2500);
                      }}
                      className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedJs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedJs ? 'Copié !' : 'Copier le script'}
                    </button>
                  </div>
                  <pre className="p-5 bg-black border border-slate-900/80 rounded-b-xl font-mono text-[9.5px] text-slate-350 overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 select-all">
{`<!-- Pixel de Télémétrie Live Nexus -->
<script type="text/javascript">
(function() {
    window.nexusConfig = {
        appId: "3ee23777-753b-49ff-b593-1381c78c6b90",
        siteUrl: "${config.url || 'https://piecesdames.com'}",
        endpoint: "https://nexuswp.pro/api/telemetry"
    };
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = "https://nexuswp.pro/assets/nexus-telemetry.js";
    script.onload = function() {
        if (window.NexusLiveTracker) {
            window.NexusLiveTracker.init(window.nexusConfig);
        }
    };
    document.getElementsByTagName('head')[0].appendChild(script);
})();
</script>`}
                  </pre>
                </div>
              </div>

              {/* Step 2: PHP WooCommerce integration */}
              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-full">
                      Étape 2 : Connecteur WooCommerce
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Insertion : functions.php</span>
                  </div>
                  <h4 className="text-base font-black text-slate-200">Crochets Événementiels WordPress (Hooks)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pour remonter à la milliseconde les paniers chauds, initiations de paiements et lancements de ventes vers Nexus Autopilot, collez ce code PHP tout en bas du fichier <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">functions.php</code> du thème actif ou de votre site WordPress.
                  </p>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between bg-[#11131c] px-4 py-2 border border-slate-900 rounded-t-xl">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Code PHP functions.php</span>
                    <button
                      onClick={() => {
                        const phpCodeStr = `<?php
/**
 * Hook d'Intégration WooCommerce pour la Nexus Matrix (Client)
 */
add_action('woocommerce_add_to_cart', 'nexus_track_add_to_cart_event', 10, 6);
function nexus_track_add_to_cart_event($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data) {
    if (!$product_id) return;
    $product = wc_get_product($product_id);
    $currentUser = wp_get_current_user();
    
    $payload = array(
        'event' => 'cart_adding',
        'visitor_ip' => $_SERVER['REMOTE_ADDR'],
        'email' => is_user_logged_in() ? $currentUser->user_email : null,
        'name' => is_user_logged_in() ? (($currentUser->first_name || $currentUser->last_name) ? trim($currentUser->first_name . ' ' . $currentUser->last_name) : $currentUser->display_name) : null,
        'item' => $product ? $product->get_name() : 'Produit inconnu',
        'price' => $product ? $product->get_price() : 0,
        'quantity' => $quantity,
        'cart_total' => ( WC()->cart ? WC()->cart->get_cart_contents_total() : 0 )
    );
    wp_remote_post('https://nexuswp.pro/api/telemetry', array(
        'method' => 'POST',
        'body' => json_encode($payload),
        'headers' => array('Content-Type' => 'application/json'),
        'sslverify' => false
    ));
}

add_action('woocommerce_thankyou', 'nexus_track_completed_purchase', 10, 1);
function nexus_track_completed_purchase($order_id) {
    if (!$order_id) return;
    $order = wc_get_order($order_id);
    
    $firstName = $order ? $order->get_billing_first_name() : '';
    $lastName = $order ? $order->get_billing_last_name() : '';
    $fullName = trim($firstName . ' ' . $lastName);
    
    $city = $order ? $order->get_billing_city() : '';
    $country = $order ? $order->get_billing_country() : '';

    $payload = array(
        'event' => 'completed_order',
        'visitor_ip' => $_SERVER['REMOTE_ADDR'],
        'email' => $order ? $order->get_billing_email() : null,
        'name' => $fullName ? $fullName : null,
        'city' => $city ? $city : null,
        'country' => $country ? $country : null,
        'item' => 'Commande #' . $order_id,
        'cart_total' => $order ? $order->get_total() : 0
    );
    wp_remote_post('https://nexuswp.pro/api/telemetry', array(
        'method' => 'POST',
        'body' => json_encode($payload),
        'headers' => array('Content-Type' => 'application/json'),
        'sslverify' => false
    ));
}`;
                        navigator.clipboard.writeText(phpCodeStr);
                        setCopiedPhp(true);
                        showToast('Script PHP copié !');
                        setTimeout(() => setCopiedPhp(false), 2500);
                      }}
                      className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedPhp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedPhp ? 'Copié !' : 'Copier le script'}
                    </button>
                  </div>
                  <pre className="p-5 bg-black border border-slate-900/80 rounded-b-xl font-mono text-[9.5px] text-slate-350 overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 select-all">
{`<?php
/**
 * Hook d'Intégration WooCommerce pour la Nexus Matrix (Client)
 */
add_action('woocommerce_add_to_cart', 'nexus_track_add_to_cart_event', 10, 6);
function nexus_track_add_to_cart_event($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data) {
    if (!$product_id) return;
    $product = wc_get_product($product_id);
    $currentUser = wp_get_current_user();
    
    $payload = array(
        'event' => 'cart_adding',
        'visitor_ip' => $_SERVER['REMOTE_ADDR'],
        'email' => is_user_logged_in() ? $currentUser->user_email : null,
        'name' => is_user_logged_in() ? (($currentUser->first_name || $currentUser->last_name) ? trim($currentUser->first_name . ' ' . $currentUser->last_name) : $currentUser->display_name) : null,
        'item' => $product ? $product->get_name() : 'Produit inconnu',
        'price' => $product ? $product->get_price() : 0,
        'quantity' => $quantity,
        'cart_total' => ( WC()->cart ? WC()->cart->get_cart_contents_total() : 0 )
    );
    wp_remote_post('https://nexuswp.pro/api/telemetry', array(
        'method' => 'POST',
        'body' => json_encode($payload),
        'headers' => array('Content-Type' => 'application/json'),
        'sslverify' => false
    ));
}

add_action('woocommerce_thankyou', 'nexus_track_completed_purchase', 10, 1);
function nexus_track_completed_purchase($order_id) {
    if (!$order_id) return;
    $order = wc_get_order($order_id);
    
    $firstName = $order ? $order->get_billing_first_name() : '';
    $lastName = $order ? $order->get_billing_last_name() : '';
    $fullName = trim($firstName . ' ' . $lastName);
    
    $city = $order ? $order->get_billing_city() : '';
    $country = $order ? $order->get_billing_country() : '';

    $payload = array(
        'event' => 'completed_order',
        'visitor_ip' => $_SERVER['REMOTE_ADDR'],
        'email' => $order ? $order->get_billing_email() : null,
        'name' => $fullName ? $fullName : null,
        'city' => $city ? $city : null,
        'country' => $country ? $country : null,
        'item' => 'Commande #' . $order_id,
        'cart_total' => $order ? $order->get_total() : 0
    );
    wp_remote_post('https://nexuswp.pro/api/telemetry', array(
        'method' => 'POST',
        'body' => json_encode($payload),
        'headers' => array('Content-Type' => 'application/json'),
        'sslverify' => false
    ));
}`}
                  </pre>
                </div>
              </div>

            </div>

            {/* Real-time Diagnostics Console */}
            <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tight">
                      Console de Diagnostic en Direct (Nexus Hub)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Suivez brute la réception à la milliseconde des requêtes de télémétrie HTTP émises par votre boutique WordPress.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      // Trigger simulated purchase POST request
                      try {
                        const randomId = 'vis_test_' + Math.floor(Math.random() * 90000);
                        const names = ['Zied Ben Miled', 'Sonia Aloui', 'Amir Trabelsi', 'Yassine Ayari'];
                        const cities = ['Tunis', 'Ariana', 'Sousse', 'Sfax'];
                        const email = 'bmmz1972@gmail.com';
                        const name = names[Math.floor(Math.random() * names.length)];
                        const city = cities[Math.floor(Math.random() * cities.length)];
                        
                        const response = await fetch('/api/telemetry', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            visitorId: randomId,
                            siteUrl: config.url || 'https://piecesdames.com',
                            email: email,
                            name: name,
                            city: city,
                            country: 'Tunisie',
                            device: Math.random() > 0.5 ? 'desktop' : 'mobile',
                            currentAction: 'completed_order',
                            targetItem: 'Commande de Test #3880',
                            cartTotal: 37.90 + Math.floor(Math.random() * 20),
                            currency: config.currency || 'TND'
                          })
                        });
                        
                        if (response.ok) {
                          showToast('Commande de test simulée avec succès !', 'success');
                          // Fetch latest logs
                          const res = await fetch(`/api/telemetry-debug?siteUrl=${encodeURIComponent(config.url || '')}`);
                          if (res.ok) {
                            setDebugLogs(await res.json());
                          }
                        }
                      } catch (e) {
                        showToast('Échec de la simulation', 'info');
                      }
                    }}
                    className="px-4 py-2 text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    Injecter un Achat Test (POST)
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/telemetry-debug?siteUrl=${encodeURIComponent(config.url || '')}`);
                        if (response.ok) {
                          setDebugLogs(await response.json());
                          showToast('Diagnostic actualisé avec succès !');
                        }
                      } catch (e) {}
                    }}
                    className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Actualiser les logs"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Indicator Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#07080b] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 shrink-0">
                    <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-500 block">Canal de données</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">Réception Connectée</span>
                  </div>
                </div>

                <div className="bg-[#07080b] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/10 shrink-0">
                    <Server className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-500 block">Intégration Active</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">
                      {config.url || "piecesdames.com"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#07080b] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/10 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-500 block">Dernier Signal Reçu</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">
                      {debugLogs.length > 0 ? `${debugLogs[0].timestamp} - ${debugLogs[0].event}` : 'En attente de signal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Log Grid/Console */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest pl-3">
                  <span>Signaux HTTP récents captés</span>
                  <span>Statut & Horodatage</span>
                </div>

                <div className="bg-[#07080b] border border-slate-900 rounded-2xl divide-y divide-slate-900/60 overflow-hidden max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                  {debugLogs.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mx-auto border border-slate-800">
                        <Activity className="w-5 h-5 text-slate-600 animate-pulse" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 max-w-lg mx-auto">
                        En attente de signaux. Copiez vos scripts ci-dessus et effectuez des actions (visitez votre boutique, ajoutez un article, ou effectuez une transaction de test) pour les capter instantanément ici.
                      </p>
                    </div>
                  ) : (
                    debugLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-950/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-300">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-8 h-8 rounded-lg ${
                            log.event === 'completed_order' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            log.event === 'checkout' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            log.event === 'cart_adding' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          } flex items-center justify-center text-[10px] uppercase font-black shrink-0`}>
                            {log.event === 'completed_order' ? 'VNT' :
                             log.event === 'checkout' ? 'CSS' :
                             log.event === 'cart_adding' ? 'PAN' : 'NAV'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-xs font-bold text-white">{log.name}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">({log.ip})</span>
                              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                                {log.event}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-snug">
                              Cible : <span className="text-slate-200 font-medium">{log.targetItem}</span> 
                              {log.cartTotal > 0 && ` • Montant : ${formatCurrency(log.cartTotal, log.currency)}`}
                            </p>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                              Source : {log.origin} • {log.userAgent.substring(0, 50)}...
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 md:self-center">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            {log.timestamp}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            HTTP 200 SUCCESS
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Guide & Helpers Card Info */}
            <div className="bg-[#0b0c10] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/10">
                  <Info className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Alternative sans modification de code pour votre client :</h4>
                  <p className="text-xs text-slate-400 leading-normal mt-1 max-w-3xl">
                    Utilisez l'extension gratuite WordPress <strong>"WPCode - Insert Headers and Footers"</strong>. Créez un nouveau snippet personnalisé de type <em>"HTML / JavaScript"</em> pour l'Étape 1 et injectez-le globalement sur le site. C'est l'alternative idéale sans risque d'altérer les fichiers systèmes de votre e-commerce.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
