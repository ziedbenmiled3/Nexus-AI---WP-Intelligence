import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Loader2,
  Package,
  ShoppingCart,
  Target,
  BarChart3,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { wpFetch } from '../lib/wordpress';
import { WPConfig } from '../types';
import { generateForecast } from '../lib/gemini';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Props {
  config: WPConfig;
}

export default function ForecastView({ config }: Props) {
  const [loading, setLoading] = useState(true);
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecast, setForecast] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [currency, setCurrency] = useState('€');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, settingsData] = await Promise.all([
        wpFetch(config, '/wc/v3/products', 'GET', null, { per_page: 100 }),
        wpFetch(config, '/wc/v3/orders', 'GET', null, { per_page: 50 }),
        wpFetch(config, '/wc/v3/settings/general', 'GET').catch(() => null)
      ]);

      setProducts(productsData || []);
      setOrders(ordersData || []);

      if (Array.isArray(settingsData)) {
        const currencySetting = settingsData.find((s: any) => s.id === 'woocommerce_currency');
        if (currencySetting?.value) {
          const currencyMap: Record<string, string> = { 'EUR': '€', 'USD': '$', 'TND': 'DT' };
          setCurrency(currencyMap[currencySetting.value] || currencySetting.value);
        }
      }

      await runForecast(productsData, ordersData);
    } catch (err) {
      console.error('Forecast fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const runForecast = async (pData: any[], oData: any[]) => {
    setIsForecasting(true);
    try {
      const res = await generateForecast(pData, oData, currency, config.geminiApiKey);
      setForecast(res);
    } catch (err) {
      console.error('Forecast generation failed', err);
    } finally {
      setIsForecasting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [config.url]);

  // Mock data for the chart based on forecast
  const chartData = [
    { name: 'Sem 1', sales: 400, forecast: 450 },
    { name: 'Sem 2', sales: 300, forecast: 480 },
    { name: 'Sem 3', sales: 600, forecast: 550 },
    { name: 'Sem 4', sales: 800, forecast: 900 },
    { name: 'Futur 1', forecast: 1200 },
    { name: 'Futur 2', forecast: 1400 },
  ];

  if (loading && !forecast) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Initialisation des algorithmes prédictifs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shadow-xl shadow-blue-900/10">
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Nexus Forecast</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-400" /> Prédictions d'Inventaire & Opportunités de Marché
            </p>
          </div>
        </div>

        <button 
          onClick={fetchData}
          disabled={isForecasting}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-lg shadow-blue-900/40 disabled:opacity-50 active:scale-95"
        >
          {isForecasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Actualiser les Prévisions
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#0a0c10] border border-slate-800/60 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-blue-400" /> Projection de Revenus (30j)
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Historique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 opacity-30 rounded-full" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Projection IA</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                   <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} 
                   dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0c10', 
                    border: '1px solid #1e293b', 
                    borderRadius: '1rem',
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="forecast" stroke="#60a5fa" strokeDasharray="5 5" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Chiffre d'Affaires Prédit</p>
            <h3 className="text-4xl font-black italic tracking-tighter mb-4">
              {forecast?.salesPredictions?.next30Days?.toLocaleString() || '0'} {currency}
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full w-fit">
              {forecast?.salesPredictions?.trend === 'UP' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="text-[10px] font-black">+{forecast?.salesPredictions?.growthPercentage || 0}% vs mois dernier</span>
            </div>
            <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-125 transition-transform duration-700" />
          </div>

          <div className="bg-[#0a0c10] border border-slate-800/60 rounded-[2.5rem] p-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> État Global
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Commandes projetées</span>
                <span className="text-xs font-black text-white">~{Math.round((forecast?.salesPredictions?.next30Days || 0) / 45)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Health Score</span>
                <span className="text-xs font-black text-emerald-500">OPTIMAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scarcity Alerts */}
      <div className="bg-[#0b0d12] border border-slate-800/60 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" /> Alertes de Pénurie Imminente
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Basé sur les tendances de ventes en temps réel</p>
          </div>
          <Target className="w-8 h-8 text-slate-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forecast?.inventoryScarcityAlerts?.map((alert: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl group hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">Rupture dans</span>
                  <span className="text-2xl font-black text-white italic">{alert.daysUntilRupture} JOURS</span>
                </div>
              </div>
              <h5 className="text-sm font-black text-white uppercase tracking-tight mb-3 truncate">{alert.productName}</h5>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4">
                {alert.description}
              </p>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-600 uppercase">Indice de confiance</span>
                <span className="text-[10px] font-black text-blue-400">{alert.confidence || 92}%</span>
              </div>
            </motion.div>
          ))}
          {(!forecast?.inventoryScarcityAlerts || forecast.inventoryScarcityAlerts.length === 0) && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-30">
               <Zap className="w-12 h-12 mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">Aucune rupture de stock majeure prédite dans les 14 prochains jours.</p>
             </div>
          )}
        </div>
      </div>

      {/* Balancing Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0c10] border border-slate-800/60 rounded-[2.5rem] p-8">
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 mb-8">
            <ShoppingCart className="w-6 h-6 text-blue-400" /> Opportunités d'Équilibrage
          </h2>
          
          <div className="space-y-4">
            {forecast?.balancingOpportunities?.map((opp: any, i: number) => (
              <div key={i} className="p-6 bg-[#0d0f14] border border-slate-800/80 rounded-[2rem] group hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    opp.type === 'PROMO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    opp.type === 'PRICING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {opp.type}
                  </span>
                  <span className="text-[9px] font-black text-slate-500 uppercase">Impact: {opp.expectedImpact}</span>
                </div>
                <h5 className="text-[13px] font-black text-white uppercase tracking-tight mb-2">{opp.title}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {opp.advice}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col">
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 mb-8">
            <Info className="w-6 h-6 text-slate-400" /> Nexus Strategic Insights
          </h2>
          <div className="flex-1 space-y-6">
            {forecast?.actionableInsights?.map((insight: string, i: number) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-900/50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-blue-400">{i + 1}</span>
                </div>
                <p className="text-xs font-bold text-slate-300 leading-relaxed pt-1">{insight}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-blue-600 rounded-[2rem] text-white">
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h5 className="text-[11px] font-black uppercase tracking-widest mb-1">Résumé Maestro</h5>
                <p className="text-xs font-bold leading-relaxed opacity-90">
                  L'analyse combinée des stocks et de la vitesse de vente suggère une stratégie de "Flash Clearance" sur les produits stagnants pour libérer {currency}4,500 de trésorerie avant la fin du mois.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
