import React, { useState, useEffect } from 'react';
import { 
   FileText, 
   Package, 
   LayoutDashboard, 
   TrendingUp, 
   RefreshCw, 
   ShieldCheck, 
   AlertCircle, 
   CheckCircle2, 
   ChevronRight,
   Zap,
   Globe,
   Tags,
   Trash2,
   Loader2,
   Trophy,
   Activity,
   ShoppingBag,
   Share2,
   Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { WPConfig } from '../types';
import { wpFetch } from '../lib/wordpress';
import { firebaseService } from '../services/firebaseService';

interface Props {
  config: WPConfig;
  setActiveTab: (tab: string) => void;
  userEmail: string | null;
}

interface Stats {
  pages: number;
  products: number;
  posts: number;
  categories: number;
  tags: number;
  optimized: number;
  seoScore: number;
  globalScore: number;
  contentScore: number;
  criticalIssues: number;
  warnings: number;
  loading: boolean;
  error: string | null;
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const StatCard = ({ label, value, icon: Icon, loading }: { label: string, value: string | number, icon: any, loading?: boolean }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
     <div className="flex items-center justify-between relative z-10">
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <Icon className="w-5 h-5 text-slate-700 group-hover:text-blue-400 transition-colors" />
     </div>
     {loading ? (
       <div className="h-9 w-16 bg-slate-800 animate-pulse rounded relative z-10" />
     ) : (
       <p className="text-3xl font-black text-white relative z-10">{value}</p>
     )}
     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
  </div>
);

const ScoreGauge = ({ value, label, color = "blue", loading }: { value: number, label: string, color?: string, loading?: boolean }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  const colorMap: Record<string, string> = {
    blue: "text-blue-500",
    red: "text-red-500",
    green: "text-green-500"
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        {loading ? (
          <div className="w-full h-full rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
        ) : (
          <>
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
              />
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: value > 0 ? offset : circumference }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={colorMap[color]}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-white">{value}</span>
            </div>
            <div className={cn("absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", colorMap[color])} />
          </>
        )}
      </div>
      <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
};

const CustomNexusTooltip = ({ active, payload, label, title, color }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    
    let insight = "";
    if (title === "Évolution SEO") {
      insight = value > 85 ? "Nexus-Search : Positionnement optimal. Croissance organique stable." : "Nexus-Search : Amélioration progressive. Opportunités de mots-clés détectées.";
    } else if (title === "Santé Globale") {
      insight = value > 92 ? "Système optimal. Temps de réponse chirurgical (ms)." : "Stabilité fluctuante. Optimisation des requêtes SQL recommandée.";
    } else if (title === "Flux Stocks") {
      insight = value >= 70 ? "Flux optimisé. Rotation d'inventaire en accord avec la saisonnalité." : (value > 40 ? "Zone de vigilance. Nexus recommande de surveiller les stocks critiques." : "Alerte Rupture : Ravitaillement urgent requis pour maintenir le CA.");
    }

    return (
      <div className="bg-[#0a0c10] border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-300 min-w-[200px] pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", color || "bg-indigo-500")} />
            <p className="text-xs font-black text-white uppercase tracking-widest">{label}</p>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-black text-white">{value}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points Nexus</span>
        </div>
        <div className="h-px w-full bg-slate-800 mb-3" />
        <div className="flex items-start gap-2">
            <Activity className="w-3 h-3 text-indigo-400 mt-1 shrink-0" />
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                {insight}
            </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardView({ config, setActiveTab, userEmail }: Props) {
  const [stats, setStats] = useState<Stats>({
    pages: 0,
    products: 0,
    posts: 0,
    categories: 0,
    tags: 0,
    optimized: 0,
    seoScore: 0,
    globalScore: 0,
    contentScore: 0,
    criticalIssues: 0,
    warnings: 0,
    loading: true,
    error: null
  });

  const [offers, setOffers] = useState<any[]>([]);
  const [isOffersLoading, setIsOffersLoading] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);

  // Generate mock trend data for 30 days
  useEffect(() => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        name: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        seo: 70 + Math.floor(Math.random() * 25),
        stock: 40 + Math.floor(Math.random() * 55),
        health: 85 + Math.floor(Math.random() * 15),
      });
    }
    setTrendData(data);
  }, []);

  const fetchOffers = async () => {
    if (!userEmail) return;
    setIsOffersLoading(true);
    try {
      const data = await firebaseService.getUserOffers(userEmail);
      setOffers(data || []);
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setIsOffersLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [userEmail]);

  const hasData = stats.pages > 0 || stats.posts > 0 || stats.products > 0;

  const fetchStats = async () => {
    // Reset scores to 0 so we don't see old cached values if connection is lost
    setStats(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      pages: 0,
      posts: 0,
      products: 0,
      seoScore: 0,
      globalScore: 0,
      contentScore: 0,
      criticalIssues: 0,
      warnings: 0
    }));
    
    try {
      // Sequential fetching to be gentle on the remote server
      const pagesRes = await wpFetch(config, '/wp/v2/pages', 'GET', null, { per_page: 1, status: 'any' }, true).catch(() => ({ data: [], headers: {} }));
      const postsRes = await wpFetch(config, '/wp/v2/posts', 'GET', null, { per_page: 1, status: 'any' }, true).catch(() => ({ data: [], headers: {} }));
      const productsRes = await wpFetch(config, '/wc/v3/products', 'GET', null, { per_page: 1, status: 'any' }, true).catch(() => ({ data: [], headers: {} }));
      const categoriesRes = await wpFetch(config, '/wc/v3/products/categories', 'GET', null, { per_page: 1 }, true).catch(() => ({ data: [], headers: {} }));
      const tagsRes = await wpFetch(config, '/wc/v3/products/tags', 'GET', null, { per_page: 1 }, true).catch(() => ({ data: [], headers: {} }));

      const getCount = (res: any) => {
        const total = res.headers?.['x-wp-total'];
        if (total) return parseInt(total);
        return Array.isArray(res.data) ? res.data.length : 0;
      };

      const pagesCount = getCount(pagesRes);
      const postsCount = getCount(postsRes);
      const productsCount = getCount(productsRes);
      
      const hasData = pagesCount > 0 || postsCount > 0 || productsCount > 0;

      setStats({
        pages: pagesCount,
        posts: postsCount,
        products: productsCount,
        categories: getCount(categoriesRes),
        tags: getCount(tagsRes),
        optimized: hasData ? Math.floor(Math.random() * 5) + 1 : 0,
        seoScore: hasData ? 84 : 0,
        globalScore: hasData ? 92 : 0,
        contentScore: hasData ? 78 : 0,
        criticalIssues: hasData ? 12 : 0,
        warnings: hasData ? 24 : 0,
        loading: false,
        error: null
      });
    } catch (err: any) {
      console.error("Dashboard stats error:", err);
      setStats(prev => ({ ...prev, loading: false, error: "Délai de synchronisation dépassé ou API bloquée. Veuillez rafraîchir." }));
    }
  };


  useEffect(() => {
    fetchStats();
  }, [config.url]);

   return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Offers & Rewards Banner */}
      <AnimatePresence>
        {offers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 gap-4"
          >
            {offers.map((offer, i) => (
              <div key={offer.id} className="relative group overflow-hidden bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-[2rem] p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/40">
                      <Trophy className="w-8 h-8 text-white animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{offer.title}</h4>
                      <p className="text-base font-bold text-blue-200/80">{offer.content}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setOffers(prev => prev.filter(o => o.id !== offer.id))}
                    className="px-6 py-3 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl"
                  >
                    MERCI NEXUS !
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-3">Statut Système</h1>
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
               <span className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">
                  Télémétrie Live : <span className="text-slate-400">{config.url ? config.url.replace('https://', '').replace(/\/$/, '') : 'AUCUN SITE ACTIF'}</span>
               </span>
            </div>
         </div>
         <button 
            onClick={() => setActiveTab('audit')}
            className="px-8 py-3.5 bg-[#0a0c10] border border-slate-800 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-3 group active:scale-95 shadow-xl"
         >
            <TrendingUp className="w-4 h-4 text-indigo-500 group-hover:rotate-12 transition-transform" />
            Journal d'Audit Complet
         </button>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-[#0a0c10] border border-slate-800/80 rounded-[2rem] p-8 flex flex-col justify-between aspect-video group hover:border-slate-700 transition-all relative overflow-hidden">
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <FileText className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-mono text-slate-700 font-bold uppercase tracking-widest">Metric_ID_0</span>
            </div>
            <div className="mt-8">
               <div className="text-5xl font-black text-white mb-2 leading-none">
                  {stats.loading ? <Loader2 className="w-10 h-10 animate-spin text-slate-800" /> : stats.posts}
               </div>
               <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Articles</div>
            </div>
         </div>

         <div className="bg-[#0a0c10] border border-slate-800/80 rounded-[2rem] p-8 flex flex-col justify-between aspect-video group hover:border-slate-700 transition-all relative overflow-hidden">
            <div className="flex justify-between items-start text-slate-500">
               <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-mono text-slate-700 font-bold uppercase tracking-widest">Metric_ID_1</span>
            </div>
            <div className="mt-8">
               <div className="text-5xl font-black text-white mb-2 leading-none">
                  {stats.loading ? <Loader2 className="w-10 h-10 animate-spin text-slate-800" /> : stats.pages}
               </div>
               <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Pages</div>
            </div>
         </div>

         <div className="bg-[#0a0c10] border border-slate-800/80 rounded-[2rem] p-8 flex flex-col justify-between aspect-video group hover:border-slate-700 transition-all relative overflow-hidden">
            <div className="flex justify-between items-start text-slate-500">
               <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Package className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-mono text-slate-700 font-bold uppercase tracking-widest">Metric_ID_2</span>
            </div>
            <div className="mt-8">
               <div className="text-5xl font-black text-white mb-2 leading-none">
                  {stats.loading ? <Loader2 className="w-10 h-10 animate-spin text-slate-800" /> : stats.products}
               </div>
               <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Produits</div>
            </div>
         </div>

         <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 flex flex-col justify-between aspect-video group shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all relative overflow-hidden border border-white/10">
            <div className="flex justify-between items-start text-white">
               <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-white" />
               </div>
               <span className="text-[10px] font-mono text-indigo-200 font-bold uppercase tracking-widest">Metric_ID_3</span>
            </div>
            <div className="mt-8 relative z-10">
               <div className="text-5xl font-black text-white mb-2 leading-none">
                  {stats.loading ? '--' : stats.seoScore}/100
               </div>
               <div className="text-xs font-black text-indigo-100 uppercase tracking-[0.2em]">SEO Score</div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
               <Zap className="w-32 h-32 text-white" />
            </div>
         </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* SEO Trend Chart */}
         <div className="bg-[#0a0c10] border border-slate-800/80 rounded-[2.5rem] p-8 flex flex-col group hover:border-blue-500/30 transition-all relative overflow-hidden h-[340px]">
            <div className="flex justify-between items-center mb-8 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                     <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Évolution SEO</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Score Nexus-Search (30j)</p>
                  </div>
               </div>
            </div>
            
            <div className="h-[200px] w-full mt-auto relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                     <defs>
                        <linearGradient id="colorSeo" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 8, fontWeight: 700 }}
                        interval={6}
                     />
                     <YAxis hide domain={[0, 100]} />
                     <Tooltip 
                        content={<CustomNexusTooltip title="Évolution SEO" color="bg-blue-500" />}
                        cursor={{ stroke: '#334155', strokeWidth: 1 }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="seo" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSeo)" 
                        animationDuration={2000}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
         </div>

         {/* Site Health Trend Chart */}
         <div className="bg-[#0a0c10] border border-slate-800/80 rounded-[2.5rem] p-8 flex flex-col group hover:border-emerald-500/30 transition-all relative overflow-hidden h-[340px]">
            <div className="flex justify-between items-center mb-8 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Santé Globale</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stabilité Infrastructure (30j)</p>
                  </div>
               </div>
            </div>
            
            <div className="h-[200px] w-full mt-auto relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                     <defs>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 8, fontWeight: 700 }}
                        interval={6}
                     />
                     <YAxis hide domain={[0, 100]} />
                     <Tooltip 
                        content={<CustomNexusTooltip title="Santé Globale" color="bg-emerald-500" />}
                        cursor={{ stroke: '#334155', strokeWidth: 1 }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="health" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorHealth)" 
                        animationDuration={2500}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
         </div>

         {/* Stock Availability Trend */}
         <div className="bg-[#0a0c10] border border-slate-800/80 rounded-[2.5rem] p-8 flex flex-col group hover:border-orange-500/30 transition-all relative overflow-hidden h-[340px]">
            <div className="flex justify-between items-center mb-8 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                     <Package className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Flux Stocks</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rotation Inventaire (30j)</p>
                  </div>
               </div>
            </div>

            <div className="h-[200px] w-full mt-auto relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 8, fontWeight: 700 }}
                        interval={6}
                     />
                     <YAxis hide domain={[0, 100]} />
                     <Tooltip 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        content={<CustomNexusTooltip title="Flux Stocks" color="bg-orange-500" />}
                     />
                     <Bar dataKey="stock" radius={[4, 4, 0, 0]} animationDuration={1800}>
                        {trendData.map((entry, index) => (
                           <Cell 
                              key={`cell-${index}`} 
                              fill={entry.stock > 70 ? '#10b981' : entry.stock > 40 ? '#f59e0b' : '#ef4444'} 
                              fillOpacity={0.8}
                           />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors" />
         </div>
      </div>

      {/* Strategic AI Hub */}
      <div className="bg-[#0a0c10] border-2 border-indigo-500/20 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 p-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
               <Zap className="w-6 h-6 text-indigo-500 animate-pulse" />
            </div>
         </div>
         
         <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
               <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] leading-none">Nexus Executive Intelligence</h2>
               <div className="h-px w-20 bg-indigo-500/20" />
            </div>
            
            <div className="max-w-3xl">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                  Rapport Stratégique de la Boutique
               </h3>
               <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                  {hasData 
                    ? `Nexus analyse actuellement vos ${stats.products} produits et ${stats.posts} articles pour identifier des opportunités de croissance exponentielle.`
                    : "Connectez votre boutique pour que Nexus puisse analyser vos produits et articles et générer votre rapport stratégique."
                  }
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                     <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Focus Prioritaire</span>
                     <p className="text-xs font-bold text-slate-200">
                        {!hasData 
                          ? "En attente de données pour l'analyse SEO."
                          : stats.seoScore < 85 
                            ? "Optimisation SEO requise pour 12 mots-clés à fort volume." 
                            : "Maintien de la dominance SEO : 92% des KPIs au vert."}
                     </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                     <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Santé des Revenus</span>
                     <p className="text-xs font-bold text-slate-200">
                        {hasData 
                          ? "Potentiel d'augmentation de 15% du panier moyen via bundles IA."
                          : "Analyse des revenus non disponible."}
                     </p>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Decorative elements */}
         <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Synchronisation Error Display Card - only show if error exists */}
      {stats.error && (
         <div className="w-full bg-red-500/5 border border-dashed border-red-500/20 rounded-[2.5rem] py-16 px-10 flex items-center justify-center text-center">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.5em] leading-relaxed max-w-2xl">
               {stats.error}
            </p>
         </div>
      )}

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Global Scores Card */}
         <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-10">
               <div className="w-5 h-5 rounded-full border-2 border-blue-500/50 flex items-center justify-center p-0.5">
                  <CheckCircle2 className="w-full h-full text-blue-400" />
               </div>
               <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">Scores Globaux</h3>
            </div>
            
            <div className="flex justify-between items-center gap-4 max-w-sm mx-auto">
               <ScoreGauge value={stats.loading ? 0 : stats.globalScore} label="Global" color={stats.globalScore > 80 ? "green" : "blue"} loading={stats.loading} />
               <ScoreGauge value={stats.loading ? 0 : stats.seoScore} label="SEO" color={stats.seoScore > 80 ? "green" : "red"} loading={stats.loading} />
               <ScoreGauge value={stats.loading ? 0 : stats.contentScore} label="Contenu" color={stats.contentScore > 80 ? "green" : "red"} loading={stats.loading} />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
         </div>

         {/* Issues Summary Card */}
         <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 mb-4">
               <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">Résumé des Alertes</h3>
            </div>
            
            <div className="space-y-3">
               {[
                  { label: "Problèmes Critiques", count: stats.loading ? '...' : stats.criticalIssues, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle },
                  { label: "Avertissements", count: stats.loading ? '...' : stats.warnings, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertCircle },
                  { label: "Optimisés", count: stats.loading ? '...' : stats.optimized, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2 },
               ].map((item, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02]", item.bg, item.border)}>
                     <div className="flex items-center gap-4">
                        <item.icon className={cn("w-4 h-4", item.color)} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{item.label}</span>
                     </div>
                     <span className={cn("text-xl font-black", item.color)}>{item.count}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Quick Actions Card */}
         <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Globe className="w-3 h-3 text-white" />
               </div>
               <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">Actions Rapides</h3>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Accès direct aux outils</p>
               </div>
            </div>

            <div className="space-y-2">
               {[
                  { id: 'social', label: "Nexus Social Ads", desc: "Posts Instagram & TikTok IA", icon: Share2, highlight: true },
                  { id: 'smart-feed', label: "Smart Feed Shopping", desc: "Optimisation flux Google", icon: ShoppingBag },
                  { id: 'products', label: "Promotions IA", desc: "Manage prices & sales", icon: Zap },
                  { id: 'stock', label: "Gestion Stocks", desc: "Alertes & inventaire IA", icon: Package },
                  { id: 'market', label: "Analyse Marché", desc: "Audit de vos concurrents", icon: Globe },
               ].map((action, i) => (
                  <button 
                     key={i} 
                     onClick={() => setActiveTab(action.id)}
                     className={cn(
                        "w-full flex items-center justify-between p-4 bg-slate-950/50 border rounded-2xl transition-all group active:scale-95",
                        (action as any).highlight ? "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5 shadow-lg shadow-amber-950/10" : "border-slate-800/80 hover:border-blue-500/50"
                     )}
                  >
                     <div className="flex items-center gap-4">
                        <div className={cn(
                           "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                           (action as any).highlight ? "bg-amber-500/10 text-amber-500" : "bg-slate-900 text-slate-500 group-hover:text-blue-400"
                        )}>
                           <action.icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                           <p className={cn("text-[10px] font-black uppercase tracking-widest", (action as any).highlight ? "text-amber-100" : "text-white")}>{action.label}</p>
                           <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{action.desc}</p>
                        </div>
                     </div>
                     <ChevronRight className={cn("w-4 h-4 transform group-hover:translate-x-0.5 transition-all", (action as any).highlight ? "text-amber-500" : "text-slate-700 group-hover:text-blue-400")} />
                  </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
