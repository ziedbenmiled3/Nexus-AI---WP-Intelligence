import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Loader2,
  Package,
  ShoppingCart,
  DollarSign,
  Activity,
  Plus,
  Edit2,
  Check,
  Percent,
  Play,
  Terminal,
  Calculator,
  Flame,
  HelpCircle,
  Printer,
  Download,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { wpFetch } from '../lib/wordpress';
import { WPConfig } from '../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import axios from 'axios';

interface Props {
  config: WPConfig | null;
}

interface ProductCost {
  product_id: string;
  variation_id: string;
  product_name: string;
  cost_price: number;
  currency: string;
}

interface FinanceStats {
  gross: number;
  net: number;
  fee: number;
  ad: number;
  margin: number;
  grossChangePct: number;
  netChangePct: number;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  status: string;
  orderId: string;
  method: string;
  items: string;
  total: number;
  fee: number;
  cogs: number;
  net: number;
}

export default function FinanceProfitView({ config }: Props) {
  const [activePeriod, setActivePeriod] = useState<'today' | 'month' | 'year' | 'last_year'>('month');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [costs, setCosts] = useState<ProductCost[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Tab within the financial module
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'cogs' | 'webhook'>('dashboard');

  // Print Preview state
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Interactive Recharts view filter (all, net, gross)
  const [chartFilter, setChartFilter] = useState<'all' | 'net' | 'gross'>('all');

  // Ad Spend Editing State
  const [isEditingAdSpend, setIsEditingAdSpend] = useState(false);
  const [adSpendInput, setAdSpendInput] = useState('');
  const [updatingAdSpend, setUpdatingAdSpend] = useState(false);

  // Webhook Simulator State
  const [selectedWebhookPreset, setSelectedWebhookPreset] = useState<'stripe_simple' | 'paypal_multi' | 'custom'>('stripe_simple');
  const [simOrderId, setSimOrderId] = useState(`wc_${Math.floor(100000 + Math.random() * 900000)}`);
  const [simGateway, setSimGateway] = useState<'stripe' | 'paypal'>('stripe');
  const [simTotal, setSimTotal] = useState('79');
  const [simItemName, setSimItemName] = useState('Ensemble Lingerie Dentelle Luxe 2025');
  const [simItemQty, setSimItemQty] = useState(1);
  const [simItemCost, setSimItemCost] = useState('18.50');
  const [triggeringWebhook, setTriggeringWebhook] = useState(false);
  const [webhookTerminalOut, setWebhookTerminalOut] = useState<string[]>([]);

  // Cost Price Editing Form State
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [editingCostVal, setEditingCostVal] = useState('');
  const [savingCost, setSavingCost] = useState(false);

  // Fetch Financial Analytics Summary
  const fetchStats = async (period = activePeriod) => {
    setLoadingStats(true);
    try {
      const response = await axios.get(`/api/financials/stats?period=${period}`);
      if (response.data?.success) {
        setStats(response.data.stats);
        setChartData(response.data.chartData || []);
        if (response.data.webhookLogs) {
          setWebhookLogs(response.data.webhookLogs);
        }
      }
    } catch (err) {
      console.error('[FinanceProfitView] Stats fetch error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Product Costs Mapping & merging with WC Products
  const fetchProductCostsAndCatalog = async () => {
    setLoadingCosts(true);
    try {
      // 1. Fetch our local SQLite cost margins mapping
      const costsRes = await axios.get('/api/financials/costs');
      const costsMap = costsRes.data || [];
      setCosts(costsMap);

      // 2. Try fetching active WooCommerce product list if connected
      if (config) {
        try {
          const wcProducts = await wpFetch(config, '/wc/v3/products', 'GET', null, { per_page: 50 });
          if (Array.isArray(wcProducts)) {
            setProducts(wcProducts);
            
            // Auto-enrich product names in our local Costs DB if missing
            for (const item of wcProducts) {
              const localCost = costsMap.find((c: any) => String(c.product_id) === String(item.id));
              if (!localCost) {
                // Pre-register for easy view with a fallback price estimate
                await axios.post('/api/financials/costs', {
                  product_id: String(item.id),
                  variation_id: '',
                  product_name: item.name,
                  cost_price: parseFloat((parseFloat(item.price || '0') * 0.28).toFixed(2)),
                  currency: 'EUR'
                });
              }
            }
            // Re-fetch costs to align
            const finalCosts = await axios.get('/api/financials/costs');
            setCosts(finalCosts.data || []);
          }
        } catch (wcErr) {
          console.warn('[FinanceProfitView] Failed fetching WooCommerce products live:', wcErr);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('[FinanceProfitView] Costs fetch error:', err);
    } finally {
      setLoadingCosts(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activePeriod]);

  useEffect(() => {
    fetchProductCostsAndCatalog();
  }, [config?.url, activeSubTab]);

  // Adjust ad spend
  const handleSaveAdSpend = async () => {
    if (!adSpendInput || isNaN(parseFloat(adSpendInput))) return;
    setUpdatingAdSpend(true);
    try {
      // Find period key corresponding to current filters 
      const baseToday = '2026-06-05'; // Sync calendar reference
      const periodKey = activePeriod === 'today' ? baseToday : '2026-06';
      
      const res = await axios.post('/api/financials/adspend', {
        period: periodKey,
        amount: parseFloat(adSpendInput)
      });
      if (res.data?.success) {
        setIsEditingAdSpend(false);
        fetchStats();
      }
    } catch (err) {
      console.error('[FinanceProfitView] Failed updating ad spend:', err);
    } finally {
      setUpdatingAdSpend(false);
    }
  };

  // Trigger simulated order webhook
  const handleTriggerWebhook = async () => {
    setTriggeringWebhook(true);
    setWebhookTerminalOut([]);
    
    // Set terminal steps
    const appendLog = (step: string) => {
      setWebhookTerminalOut(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
    };

    appendLog('📡 Initializing WooCommerce `order.created` Webhook simulator...');

    let webhookPayload: any = {};

    if (selectedWebhookPreset === 'stripe_simple') {
      webhookPayload = {
        id: simOrderId,
        total: "79.00",
        payment_method: "stripe",
        created_at: "2026-06-05T05:30:00Z",
        line_items: [
          {
            product_id: "231",
            variation_id: "",
            name: "Ensemble Lingerie Dentelle Luxe 2025",
            quantity: 1,
            subtotal: "79.00"
          }
        ]
      };
    } else if (selectedWebhookPreset === 'paypal_multi') {
      webhookPayload = {
        id: simOrderId,
        total: "178.00",
        payment_method: "paypal",
        created_at: "2026-06-05T05:30:00Z",
        line_items: [
          {
            product_id: "243",
            variation_id: "",
            name: "Lisseur Céramique à vapeur 100W",
            quantity: 1,
            subtotal: "120.00"
          },
          {
            product_id: "244",
            variation_id: "",
            name: "Sérum Visage Anti-Âge Acide Hyaluronique",
            quantity: 2,
            subtotal: "58.00"
          }
        ]
      };
    } else {
      webhookPayload = {
        id: simOrderId,
        total: parseFloat(simTotal).toFixed(2),
        payment_method: simGateway,
        created_at: "2026-06-05T05:30:00Z",
        line_items: [
          {
            product_id: "custom_99",
            variation_id: "",
            name: simItemName,
            quantity: simItemQty,
            subtotal: (parseFloat(simTotal) / simItemQty).toFixed(2)
          }
        ]
      };
      
      // Save the custom product price mapping into SQLite first to test dynamic lookup
      try {
        await axios.post('/api/financials/costs', {
          product_id: 'custom_99',
          variation_id: '',
          product_name: simItemName,
          cost_price: parseFloat(simItemCost),
          currency: 'EUR'
        });
      } catch (e) {}
    }

    setTimeout(async () => {
      appendLog(`📦 Packed order load: ID: ${webhookPayload.id}, Total: ${webhookPayload.total}€, Gateway: ${webhookPayload.payment_method.toUpperCase()}`);
      
      setTimeout(async () => {
        appendLog(`🚀 Shipping webhook POST trigger → /api/financials/webhook`);
        
        try {
          const res = await axios.post('/api/financials/webhook', webhookPayload);
          if (res.data?.success) {
            const calc = res.data.calculation;
            setTimeout(() => {
              appendLog(`✓ Server response accepted (HTTP 200)`);
              appendLog(`⚡ CLOUD COMPUTATIONS COMPLETE:`);
              appendLog(`  - Gateway: ${calc.method} Fee deducted (-${calc.fee}€)`);
              appendLog(`  - Product Cost unlisted COGS mapped (-${calc.cogs}€)`);
              appendLog(`  - Real-Time Net profit allocated: (+${calc.net}€)`);
              appendLog(`🗄️ Financial Snapshots synchronized in single ACID transaction.`);
              
              setSimOrderId(`wc_${Math.floor(100000 + Math.random() * 900000)}`);
              fetchStats();
              setTriggeringWebhook(false);
            }, 600);
          }
        } catch (err: any) {
          appendLog(`❌ SERVER CALCULATION ERROR: ${err.response?.data?.error || err.message}`);
          setTriggeringWebhook(false);
        }
      }, 700);
    }, 500);
  };

  // Save product cost
  const handleSaveCost = async (prodId: string, varId: string, prodName: string) => {
    if (!editingCostVal || isNaN(parseFloat(editingCostVal))) return;
    setSavingCost(true);
    try {
      const res = await axios.post('/api/financials/costs', {
        product_id: prodId,
        variation_id: varId,
        product_name: prodName,
        cost_price: parseFloat(editingCostVal),
        currency: 'EUR'
      });
      if (res.data?.success) {
        setEditingCostId(null);
        setEditingCostVal('');
        fetchProductCostsAndCatalog();
        fetchStats();
      }
    } catch (err) {
      console.error('[FinanceProfitView] Failed saving cost:', err);
    } finally {
      setSavingCost(false);
    }
  };

  // Offline display template catalog Fallback
  const displayCosts = costs.length > 0 ? costs : [
    { product_id: '231', variation_id: '', product_name: 'Ensemble Lingerie Dentelle Luxe 2025', cost_price: 18.50, currency: 'EUR', price: 79.00 },
    { product_id: '232', variation_id: '', product_name: 'Soutien-Gorge en Dentelle Transparente', cost_price: 12.00, currency: 'EUR', price: 49.00 },
    { product_id: '233', variation_id: '', product_name: 'Ensemble Lingerie Sexy Dentelle 3 Pièces', cost_price: 22.40, currency: 'EUR', price: 89.00 },
    { product_id: '234', variation_id: '', product_name: 'Collants Résille Vintage à Motifs Géométriques', cost_price: 4.50, currency: 'EUR', price: 19.00 },
    { product_id: '235', variation_id: '', product_name: 'Robe Maxi Transparente en Dentelle Florale', cost_price: 24.50, currency: 'EUR', price: 99.00 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Panel */}
      <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-950/10">
            <Coins className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Finance & Profits</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Moteur de Profitabilité Réelle & Analytiques Multi-Périodes
            </p>
          </div>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex bg-[#121620] border border-slate-800/40 p-1.5 rounded-2x border-slate-800 rounded-2xl gap-2">
          <button 
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'dashboard' ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveSubTab('cogs')}
            className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'cogs' ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            Coûts COGS
          </button>
          <button 
            onClick={() => setActiveSubTab('webhook')}
            className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'webhook' ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            Simulateur Webhook
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: Main Profitability Dashboard */}
        {activeSubTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Range Filters and AdSpend Modifier */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0c10] border border-slate-800/60 p-6 rounded-3xl">
              <div className="flex items-center gap-2.5">
                {[
                  { id: 'today', label: 'Aujourd\'hui' },
                  { id: 'month', label: 'Ce Mois-ci' },
                  { id: 'year', label: 'Cette Année' },
                  { id: 'last_year', label: 'Année 2025' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePeriod(p.id as any)}
                    className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activePeriod === p.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-[#151924] text-slate-400 hover:text-slate-200 border border-slate-800/60'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Ad spend update field */}
              <div className="flex items-center gap-3">
                {isEditingAdSpend ? (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">€</span>
                      <input 
                        type="text" 
                        placeholder="Ex: 150"
                        value={adSpendInput}
                        onChange={(e) => setAdSpendInput(e.target.value)}
                        className="w-28 pl-7 pr-3 py-2 bg-[#121622] border border-indigo-500/40 text-white rounded-xl text-xs font-black tracking-widest focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleSaveAdSpend}
                      disabled={updatingAdSpend}
                      className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all"
                    >
                      {updatingAdSpend ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => setIsEditingAdSpend(false)}
                      className="p-2.5 bg-[#1a1f30] hover:bg-[#252c44] text-slate-400 hover:text-slate-200 rounded-xl transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 rotate-45" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setAdSpendInput(stats ? String(stats.ad) : '0');
                      setIsEditingAdSpend(true);
                    }}
                    className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                  >
                    <Flame className="w-3.5 h-3.5" /> Ajuster Ad Spend Ads
                  </button>
                )}
                
                <button 
                  onClick={() => fetchStats()}
                  className="p-3 bg-[#121622] hover:bg-[#1a2032] border border-slate-800/40 hover:border-slate-700/60 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
                  title="Rafraîchir les données"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button 
                  onClick={() => setShowPrintPreview(true)}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-95"
                  title="Générer un rapport financier imprimable en PDF"
                >
                  <Printer className="w-3.5 h-3.5" /> Exporter en PDF
                </button>
              </div>
            </div>

            {/* Scorecard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Gross Revenue Card */}
              <div className="bg-[#0a0c10] border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Revenue / CA</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                {loadingStats ? (
                  <div className="h-10 mt-2 bg-[#121622]/40 rounded-xl animate-pulse" />
                ) : (
                  <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight">{stats?.gross.toLocaleString()} €</h3>
                    <div className="flex items-center gap-1.5 mt-2">
                      {stats && stats.grossChangePct >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={`text-[10px] font-black ${stats && stats.grossChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stats ? Math.abs(stats.grossChangePct) : 0}%
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">vs Précédent</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Net Profit Card */}
              <div className="bg-[#0a0c10] border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bénéfice Net Réel</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                {loadingStats ? (
                  <div className="h-10 mt-2 bg-[#121622]/40 rounded-xl animate-pulse" />
                ) : (
                  <div>
                    <h3 className={`text-2xl font-black italic tracking-tight ${stats && stats.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats && stats.net >= 0 ? '+' : ''}{stats?.net.toLocaleString()} €
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2">
                      {stats && stats.netChangePct >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={`text-[10px] font-black ${stats && stats.netChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stats ? Math.abs(stats.netChangePct) : 0}%
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">vs Précédent</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Net Profit Margin Card */}
              <div className="bg-[#0a0c10] border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marge Net Globale</span>
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                {loadingStats ? (
                  <div className="h-10 mt-2 bg-[#121622]/40 rounded-xl animate-pulse" />
                ) : (
                  <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight">{stats?.margin}%</h3>
                    <div className="mt-2.5 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, Math.max(0, stats?.margin || 0))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Gateway Fees Card */}
              <div className="bg-[#0a0c10] border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-fuchsia-500/5 rounded-full blur-2xl group-hover:bg-fuchsia-500/10 transition-all duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Frais de Passerelle</span>
                  <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-fuchsia-400" />
                  </div>
                </div>
                {loadingStats ? (
                  <div className="h-10 mt-2 bg-[#121622]/40 rounded-xl animate-pulse" />
                ) : (
                  <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight">-{stats?.fee.toLocaleString()} €</h3>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 block">
                      Stripe (1.4% + 0.25€) • PayPal Auto
                    </span>
                  </div>
                )}
              </div>

              {/* Paid Ads Spend Card */}
              <div className="bg-[#0a0c10] border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dépenses Ad Spend</span>
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                {loadingStats ? (
                  <div className="h-10 mt-2 bg-[#121622]/40 rounded-xl animate-pulse" />
                ) : (
                  <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight">-{stats?.ad.toLocaleString()} €</h3>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 block">
                      Google • FB Ads • TikTok
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* double Area Recharts visual graph trend line */}
            <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-indigo-400" /> Courbes d'Évolution Analytiques & Rentabilité
                  </h2>
                  <p className="text-slate-500 text-[10px] font-medium mt-1">
                    Modélisation de la profitabilité réelle nette après déduction des charges transactionnelles et COGS
                  </p>
                </div>
                
                {/* Interactive Chart Focus Filters */}
                <div className="flex bg-[#121622] border border-slate-800 p-1 rounded-xl gap-1">
                  <button 
                    onClick={() => setChartFilter('all')}
                    className={`px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${chartFilter === 'all' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md font-black' : 'text-slate-500 hover:text-slate-400'}`}
                  >
                    Vue Globale (CA + Profit)
                  </button>
                  <button 
                    onClick={() => setChartFilter('net')}
                    className={`px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${chartFilter === 'net' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md font-black' : 'text-slate-500 hover:text-emerald-400'}`}
                  >
                    Bénéfice Net
                  </button>
                  <button 
                    onClick={() => setChartFilter('gross')}
                    className={`px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${chartFilter === 'gross' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md font-black' : 'text-slate-500 hover:text-indigo-400'}`}
                  >
                    Chiffre d'Affaires
                  </button>
                </div>
              </div>

              {loadingStats ? (
                <div className="h-96 w-full bg-[#121622]/40 rounded-2xl animate-pulse flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.25} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#4b5563" 
                        fontSize={9} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={9} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => `${v}€`} 
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const grossVal = data.gross ?? 0;
                            const netVal = data.net ?? 0;
                            const feeVal = data.fees ?? 0;
                            const adVal = data.ad ?? 0;
                            const rawCogsVal = Math.max(0, grossVal - netVal - feeVal - adVal);
                            const marginRate = grossVal > 0 ? ((netVal / grossVal) * 100).toFixed(1) : '0';

                            return (
                              <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-2xl shadow-2xl min-w-[240px] font-mono text-[11px] text-slate-300 space-y-3">
                                <div className="border-b border-slate-800 pb-2 flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                                  <span>Date / Période</span>
                                  <span className="text-white bg-slate-900 px-2 py-0.5 rounded">{label}</span>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Total Ventes (Brut) :</span>
                                    <span className="text-indigo-400 font-bold">{grossVal.toLocaleString()} €</span>
                                  </div>
                                  <div className="flex justify-between items-center text-red-400/90">
                                    <span>↳ Frais Passerelle :</span>
                                    <span>-{feeVal.toLocaleString()} €</span>
                                  </div>
                                  <div className="flex justify-between items-center text-amber-500/90">
                                    <span>↳ Coût COGS Estimé :</span>
                                    <span>-{parseFloat(rawCogsVal.toFixed(2)).toLocaleString()} €</span>
                                  </div>
                                  <div className="flex justify-between items-center text-rose-500/90">
                                    <span>↳ Budget Ads / Pub :</span>
                                    <span>-{adVal.toLocaleString()} €</span>
                                  </div>
                                  <div className="border-t border-slate-800 my-2 pt-2 flex justify-between items-center">
                                    <span className="text-white font-bold">Bénéfice Net :</span>
                                    <span className={`font-black tracking-wide ${netVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {netVal >= 0 ? '+' : ''}{netVal.toLocaleString()} €
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold text-[10px] uppercase">Rendement :</span>
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${netVal >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                      {marginRate}% marge net
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Horizontal dashed reference line indicating breakeven (Y=0) */}
                      <ReferenceLine y={0} stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                      
                      {/* Conditional Area Rendering based on selected filter */}
                      {(chartFilter === 'all' || chartFilter === 'gross') && (
                        <Area 
                          type="monotone" 
                          dataKey="gross" 
                          stroke="#6366f1" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#grossGradient)" 
                        />
                      )}
                      {(chartFilter === 'all' || chartFilter === 'net') && (
                        <Area 
                          type="monotone" 
                          dataKey="net" 
                          stroke="#10b981" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#netGradient)" 
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Cloud Real-Time Calculations Table */}
            <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[2.5rem]">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                <Terminal className="w-4 h-4 text-emerald-400" /> Flux de Calculs Financiers de l'External Profit Engine
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                      <th className="py-4 px-2">ID Commande</th>
                      <th className="py-4 px-2">Date/Time</th>
                      <th className="py-4 px-2">Gateway</th>
                      <th className="py-4 px-2">Art. achetés</th>
                      <th className="py-4 px-2 text-right">Revenue Brut</th>
                      <th className="py-4 px-3 text-right">Frais Passerelle</th>
                      <th className="py-4 px-3 text-right">Coût COGS</th>
                      <th className="py-4 px-2 text-right">Earnings Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-xs font-mono">
                    {webhookLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-3 px-2 text-indigo-400 font-bold">{log.orderId}</td>
                        <td className="py-3 px-2 text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${log.method === 'PayPal' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'}`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300 max-w-xs truncate">{log.items}</td>
                        <td className="py-3 px-2 text-right font-bold text-white">{log.total} €</td>
                        <td className="py-3 px-3 text-right text-red-400">-{log.fee} €</td>
                        <td className="py-3 px-3 text-right text-amber-500">-{log.cogs} €</td>
                        <td className="py-3 px-2 text-right font-black text-emerald-400">+{log.net} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: Cost of Goods Sold (COGS) Manager */}
        {activeSubTab === 'cogs' && (
          <motion.div 
            key="cogs"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[2.5rem] space-y-6"
          >
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Package className="w-5 h-5 text-emerald-400" /> Gestion unitaire des Coûts COGS
              </h2>
              <p className="text-slate-500 font-medium text-xs mt-1.5">
                Attribuez un coût unitaire à vos variantes de produits. Le moteur de profit calculera alors la rentabilité à chaque commande reçue.
              </p>
            </div>

            {loadingCosts ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acquisition des informations du catalogue...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                      <th className="py-4 px-4 w-1/12">ID</th>
                      <th className="py-4 px-4 w-6/12">Nom de l'art. ou variation</th>
                      <th className="py-4 px-4 text-center">Currency</th>
                      <th className="py-4 px-4 text-right">Estimé Vente (approx)</th>
                      <th className="py-4 px-4 text-right">Coût unitaire (COGS)</th>
                      <th className="py-4 px-4 text-right">Markup unitaire</th>
                      <th className="py-4 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCosts.map((cost) => {
                      const sellPrice = cost.price || 49.00; // Mock sell price mapping
                      const markup = sellPrice > 0 ? ((sellPrice - cost.cost_price) / sellPrice * 100).toFixed(1) : '0';
                      const isEditing = editingCostId === cost.product_id;

                      return (
                        <tr key={cost.product_id} className="border-b border-slate-900/40 hover:bg-slate-900/10 text-xs font-mono">
                          <td className="py-4 px-4 text-slate-500">#{cost.product_id}</td>
                          <td className="py-4 px-4 font-bold text-white text-sm">{cost.product_name}</td>
                          <td className="py-4 px-4 text-center text-slate-500 uppercase font-black">{cost.currency || 'EUR'}</td>
                          <td className="py-4 px-4 text-right text-slate-300">{sellPrice.toFixed(2)} €</td>
                          <td className="py-4 px-4 text-right text-amber-400 font-bold">
                            {isEditing ? (
                              <div className="flex justify-end items-center gap-1.5">
                                <input 
                                  type="text" 
                                  value={editingCostVal}
                                  onChange={(e) => setEditingCostVal(e.target.value)}
                                  className="w-16 px-1.5 py-1 bg-[#121622] border border-emerald-500/50 text-white rounded text-right text-xs font-black"
                                  placeholder="COGS"
                                />
                                <span className="text-slate-400">€</span>
                              </div>
                            ) : (
                              `${cost.cost_price.toFixed(2)} €`
                            )}
                          </td>
                          <td className="py-4 px-4 text-right text-slate-300">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${parseFloat(markup) > 50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'}`}>
                              {markup}% Marge
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {isEditing ? (
                              <button 
                                onClick={() => handleSaveCost(cost.product_id, cost.variation_id, cost.product_name)}
                                disabled={savingCost}
                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 mx-auto"
                              >
                                {savingCost ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Valider
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setEditingCostId(cost.product_id);
                                  setEditingCostVal(String(cost.cost_price));
                                }}
                                className="px-3 py-1 bg-[#121622] hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 mx-auto transition-all"
                              >
                                <Edit2 className="w-2.5 h-2.5" /> Modifier
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: Interactive WooCommerce Webhook Simulator */}
        {activeSubTab === 'webhook' && (
          <motion.div 
            key="webhook"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Input Configurator Card */}
            <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[2.5rem] space-y-6">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-indigo-400" /> Simulateur de Transactions WooCommerce
                </h2>
                <p className="text-slate-500 font-medium text-xs mt-1">
                  Déclenchez un webhook WooCommerce simulé pour valider l'exactitude des calculs en cloud de votre module Profit. Les snapshot tables se mettront à jour immédiatement.
                </p>
              </div>

              {/* Webhook templates */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Sélectionnez un preset de simulation</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setSelectedWebhookPreset('stripe_simple');
                      setSimTotal('79');
                      setSimItemName('Ensemble Lingerie Dentelle Luxe 2025');
                      setSimItemCost('18.50');
                    }}
                    className={`p-4 rounded-2xl text-left border text-xs flex flex-col justify-between h-28 transition-all ${selectedWebhookPreset === 'stripe_simple' ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-[#121622] border-slate-900 text-slate-400 hover:border-slate-800'}`}
                  >
                    <span className="font-black">Stripe Direct unitaire</span>
                    <span className="text-[9px] text-slate-500">79€ • COGS: 18.50€ • Stripe: (1.4% + 0.25€)</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedWebhookPreset('paypal_multi');
                    }}
                    className={`p-4 rounded-2xl text-left border text-xs flex flex-col justify-between h-28 transition-all ${selectedWebhookPreset === 'paypal_multi' ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-[#121622] border-slate-900 text-slate-400 hover:border-slate-800'}`}
                  >
                    <span className="font-black">PayPal Multi-articles</span>
                    <span className="text-[9px] text-slate-500">178€ • COGS: 44.90€ • PayPal: (2.9% + 0.35€)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedWebhookPreset('custom');
                    }}
                    className={`p-4 rounded-2xl text-left border text-xs flex flex-col justify-between h-28 transition-all ${selectedWebhookPreset === 'custom' ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-[#121622] border-slate-900 text-slate-400 hover:border-slate-800'}`}
                  >
                    <span className="font-black">Achat sur-mesure (Custom)</span>
                    <span className="text-[9px] text-slate-500">Configurez vos propres lignes un par un</span>
                  </button>
                </div>
              </div>

              {/* Custom Webhook Form fields */}
              {selectedWebhookPreset === 'custom' && (
                <div className="p-5 bg-[#121622]/40 border border-slate-800/40 rounded-2xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Passerelle de Paiement</label>
                      <select 
                        value={simGateway} 
                        onChange={(e) => setSimGateway(e.target.value as any)}
                        className="w-full px-4 py-2 bg-[#121622] border border-slate-800/85 text-white rounded-xl text-xs font-bold focus:outline-none"
                      >
                        <option value="stripe">Stripe (1.4% + 0.25€)</option>
                        <option value="paypal">PayPal Premium (2.9% + 0.35€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Total WooCommerce (€)</label>
                      <input 
                        type="text" 
                        value={simTotal}
                        onChange={(e) => setSimTotal(e.target.value)}
                        className="w-full px-4 py-2 bg-[#121622] border border-slate-800/85 text-white rounded-xl text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Libellé Produit</label>
                      <input 
                        type="text" 
                        value={simItemName}
                        onChange={(e) => setSimItemName(e.target.value)}
                        className="w-full px-4 py-2 bg-[#121622] border border-slate-800/85 text-white rounded-xl text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Cost unitaire (COGS)</label>
                      <input 
                        type="text" 
                        value={simItemCost}
                        onChange={(e) => setSimItemCost(e.target.value)}
                        className="w-full px-4 py-2 bg-[#121622] border border-slate-800/85 text-amber-400 rounded-xl text-xs font-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleTriggerWebhook}
                disabled={triggeringWebhook}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10 hover-scale"
              >
                {triggeringWebhook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Déclencher le Webhook order.created
              </button>
            </div>

            {/* Simulated Server Console */}
            <div className="bg-[#050608] border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between h-[450px]">
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-950">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" /> Terminal d'exécution Cloud Nexus AI
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-red-500/70 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-yellow-500/70 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-emerald-500/70 rounded-full" />
                  </div>
                </div>

                <div className="space-y-4 font-mono text-[11px] leading-relaxed select-text text-emerald-400/90 overflow-y-auto max-h-[300px]">
                  {webhookTerminalOut.length === 0 ? (
                    <div className="text-slate-600 italic">
                      // En attente du déclenchement du webhook WooCommerce...
                      <br />
                      // Sélectionnez un preset à gauche et cliquez sur le bouton vert.
                    </div>
                  ) : (
                    webhookTerminalOut.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest pt-4 border-t border-slate-950 flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5" /> Simulation cloud exécutée sur port :3000
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print Preview Overlay Modal (Dual Screen + PDF Document Simulator) */}
      <AnimatePresence>
        {showPrintPreview && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md flex flex-col no-print">
            {/* Modal Header Controls (Invisible during PDF Generation) */}
            <div className="bg-slate-900/95 border-b border-slate-800/80 p-5 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Générateur de Rapport Financier PDF</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-mono">
                    Aperçu avant impression et export de comptanalyse réelle
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setTimeout(() => {
                      window.print();
                    }, 250);
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-555 hover:to-emerald-555 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 font-mono"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer / Sauvegarder en PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="p-3 bg-slate-850 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                  title="Fermer l'aperçu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Workspace (Simulates real white paper A4 layout) */}
            <div className="flex-1 p-4 md:p-12 flex justify-center bg-slate-950/65">
              <div 
                id="nexus-printable-report" 
                className="w-full max-w-4xl bg-white text-slate-900 p-8 md:p-14 rounded-2xl shadow-2xl space-y-8 font-sans border border-slate-200"
                style={{ minHeight: '29.7cm' }}
              >
                {/* PDF Header Section */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest block mb-1 font-mono">
                      Nexus WP AI • FinTech Strategic Blueprint
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                      Rapport Analytique de Rentabilité
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">
                      Comptabilité et analyse glissante des profits réels
                    </p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-500 space-y-1">
                    <div>Généré le: <span className="font-bold text-slate-900">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div>Boutique: <span className="font-bold text-indigo-600 underline">{config?.url || 'WooCommerce Active Stream'}</span></div>
                    <div>Période auditée: <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-black text-[9px] uppercase">
                      {activePeriod === 'today' && "Aujourd'hui"}
                      {activePeriod === 'month' && "Ce Mois-ci"}
                      {activePeriod === 'year' && "Cette Année"}
                      {activePeriod === 'last_year' && "Année Complète 2025"}
                    </span></div>
                  </div>
                </div>

                {/* Scorecard KPIs Audit Rows */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 text-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">Ventes Brutes</span>
                    <p className="text-base font-bold text-slate-900 font-mono mt-1">{(stats?.gross ?? 0).toLocaleString()} €</p>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 text-center">
                    <span className="text-[8px] font-black text-slate-505 uppercase tracking-widest font-mono">Comm. Passerelles</span>
                    <p className="text-base font-bold text-red-600 font-mono mt-1">-{((stats?.fee ?? 0)).toLocaleString()} €</p>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 text-center">
                    <span className="text-[8px] font-black text-slate-505 uppercase tracking-widest font-mono">Wholesale COGS</span>
                    <p className="text-base font-bold text-amber-600 font-mono mt-1">-{Math.max(0, (stats?.gross ?? 0) - (stats?.net ?? 0) - (stats?.fee ?? 0) - (stats?.ad ?? 0)).toLocaleString()} €</p>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 text-center">
                    <span className="text-[8px] font-black text-slate-505 uppercase tracking-widest font-mono">Acquisition Ads</span>
                    <p className="text-base font-bold text-rose-600 font-mono mt-1">-{((stats?.ad ?? 0)).toLocaleString()} €</p>
                  </div>
                  <div className="border border-slate-250 p-3 rounded-xl bg-emerald-50 text-center border-emerald-200 col-span-1 md:col-span-2 xl:col-span-2">
                    <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest font-mono block">Bénéfice Net Réel ({stats?.margin.toFixed(1)}%)</span>
                    <p className="text-base font-black text-emerald-700 font-mono mt-1">
                      {(stats?.net ?? 0) >= 0 ? '+' : ''}{(stats?.net ?? 0).toLocaleString()} €
                    </p>
                  </div>
                </div>

                {/* Print Chart Representation */}
                <div className="border border-slate-200 p-6 rounded-2xl bg-white print-avoid-break">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono block mb-3">
                    Évolution Analytique (Courbe de Rentabilité)
                  </span>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="printGrossGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="printNetGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#4b5563" 
                          style={{ fontSize: '10px', fontFamily: 'monospace' }} 
                        />
                        <YAxis 
                          stroke="#4b5563" 
                          style={{ fontSize: '10px', fontFamily: 'monospace' }} 
                          tickFormatter={(v) => `${v}€`} 
                        />
                        <Tooltip />
                        {/* Always include breakeven Y=0 red line */}
                        <ReferenceLine y={0} stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" />
                        
                        <Area 
                          type="monotone" 
                          dataKey="gross" 
                          stroke="#4f46e5" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#printGrossGradient)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="net" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#printNetGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ledger Detailed Summary Data Table */}
                <div className="space-y-3 print-avoid-break">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                    Tableau Récapitulatif Hebdomadaire & Journalier
                  </span>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-[10px] font-mono">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[8.5px]">
                          <th className="py-2.5 px-4">Date / Node</th>
                          <th className="py-2.5 px-4 text-right">CA Brut</th>
                          <th className="py-2.5 px-4 text-right">Frais Gateways</th>
                          <th className="py-2.5 px-4 text-right">Achat COGS</th>
                          <th className="py-2.5 px-4 text-right">Budget Pub Ads</th>
                          <th className="py-2.5 px-4 text-right">Earnings Net</th>
                          <th className="py-2.5 px-4 text-center">Marge Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {chartData.map((row) => {
                          const grossV = row.gross ?? 0;
                          const netV = row.net ?? 0;
                          const feeV = row.fees ?? row.fee ?? 0;
                          const adV = row.ad ?? 0;
                          const cogsV = Math.max(0, grossV - netV - feeV - adV);
                          const marginRate = grossV > 0 ? ((netV / grossV) * 100).toFixed(1) : '0';

                          return (
                            <tr key={row.name} className="hover:bg-slate-50 text-slate-800">
                              <td className="py-2 px-4 font-bold text-slate-900">{row.name}</td>
                              <td className="py-2 px-4 text-right">{grossV.toLocaleString()} €</td>
                              <td className="py-2 px-4 text-right text-red-600">-{feeV.toLocaleString()} €</td>
                              <td className="py-2 px-4 text-right text-amber-600">-{parseFloat(cogsV.toFixed(2)).toLocaleString()} €</td>
                              <td className="py-2 px-4 text-right text-rose-600">-{adV.toLocaleString()} €</td>
                              <td className="py-2 px-4 text-right font-black text-emerald-600 bg-emerald-50/20">
                                {netV >= 0 ? '+' : ''}{netV.toLocaleString()} €
                              </td>
                              <td className={`py-2 px-4 text-center font-bold font-sans text-[9px] ${netV >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {marginRate}%
                              </td>
                            </tr>
                          );
                        })}

                        {/* Summary total footer */}
                        {(() => {
                          const tGross = chartData.reduce((acc, r) => acc + (r.gross ?? 0), 0);
                          const tFees = chartData.reduce((acc, r) => acc + (r.fees ?? r.fee ?? 0), 0);
                          const tAds = chartData.reduce((acc, r) => acc + (r.ad ?? 0), 0);
                          const tNet = chartData.reduce((acc, r) => acc + (r.net ?? 0), 0);
                          const tCogs = Math.max(0, tGross - tNet - tFees - tAds);
                          const tAvgMargin = tGross > 0 ? ((tNet / tGross) * 100).toFixed(1) : '0';

                          return (
                            <tr className="bg-slate-100 border-t-2 border-slate-200 text-slate-900 font-extrabold text-[10px]">
                              <td className="py-3 px-4 uppercase text-slate-600 font-black">Totaux cumulés</td>
                              <td className="py-3 px-4 text-right">{tGross.toLocaleString()} €</td>
                              <td className="py-3 px-4 text-right text-red-700">-{tFees.toLocaleString()} €</td>
                              <td className="py-3 px-4 text-right text-amber-700">-{parseFloat(tCogs.toFixed(2)).toLocaleString()} €</td>
                              <td className="py-3 px-4 text-right text-rose-700">-{tAds.toLocaleString()} €</td>
                              <td className="py-3 px-4 text-right font-black text-emerald-700 bg-emerald-100/30 text-xs">
                                {tNet >= 0 ? '+' : ''}{tNet.toLocaleString()} €
                              </td>
                              <td className="py-3 px-4 text-center text-emerald-800 bg-emerald-50/40 text-xs font-black font-sans">
                                {tAvgMargin}%
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit bottom stamp notice */}
                <div className="border-t border-slate-200 pt-6 text-[8px] leading-relaxed text-slate-400 font-medium font-sans">
                  PROPRIÉTÉ SYSTEM CONFIDENTIELLE • NEXUS FINANCIAL CONTROL PANEL • TOUS DROITS RÉSERVÉS <br />
                  Le présent rapport récapitule les flux WooCommerce réels relevés au niveau du serveur avec les déductions paramétrées de coût de revient (COGS) et d'acquisition publicitaire. Les calculs sont synchronisés en temps réel via des déclencheurs transactionnels SQLite Cloud localisables.
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded print system media query variables to handle pure canvas extraction */}
      <style key="nexus-finance-print-engine">{`
        @media print {
          /* Enforce pure light background colors for clear PDF/paper output */
          html, body {
            background-color: #ffffff !important;
            background-image: none !important;
            color: #000000 !important;
          }

          /* Hide other page elements */
          body * {
            visibility: hidden;
          }

          /* Render only the printable sheet modal */
          #nexus-printable-report, #nexus-printable-report * {
            visibility: visible;
          }

          #nexus-printable-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 1cm !important;
            background: white !important;
            color: black !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
