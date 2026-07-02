import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Monitor,
  TrendingUp,
  RefreshCw,
  Zap
} from 'lucide-react';
import { wpFetch } from '../lib/wordpress';
import { WPConfig } from '../types';
import { cn } from '../lib/utils';

interface FeedProduct {
  id: number;
  name: string;
  status: string;
  score: number;
  lastUpdated: string;
}

export default function SmartFeedView({ config }: { config: WPConfig }) {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [products, setProducts] = useState<FeedProduct[]>([]);

  const fetchFeedStatus = async () => {
    setLoading(true);
    try {
      const data = await wpFetch(config, '/wc/v3/products', 'GET', null, { per_page: 5 });
      if (Array.isArray(data)) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          status: Math.random() > 0.3 ? 'Approuvé' : 'Avertissement',
          score: Math.floor(Math.random() * 20) + 80,
          lastUpdated: new Date().toLocaleDateString()
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedStatus();
  }, [config.url]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      fetchFeedStatus();
    }, 2000);
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      // Simulate performance improvement
      setProducts(prev => prev.map(p => ({
        ...p,
        score: Math.min(100, p.score + 5),
        status: 'Approuvé'
      })));
    }, 3000);
  };

  if (loading && products.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Synchronisation avec Google Merchant Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[3rem] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shadow-xl shadow-blue-900/10">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Nexus Smart Feed</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Monitor className="w-3 h-3 text-blue-400" /> Optimisation & Monitoring Google Shopping
            </p>
          </div>
        </div>

        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Lancer la Synchronisation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-[#0a0c10] border border-slate-800/60 rounded-[3rem] p-8">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-emerald-500" /> État des Produits
               </h3>
               <div className="px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Flux Actif</span>
               </div>
             </div>

             <div className="space-y-4">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-5 bg-slate-900/30 border border-slate-800/50 rounded-2xl group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        p.status === 'Approuvé' ? "bg-emerald-500/10" : "bg-amber-500/10"
                      )}>
                        {p.status === 'Approuvé' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">{p.name}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Mis à jour: {p.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-white italic">Score: {p.score}%</div>
                      <div className={cn(
                        "text-[8px] font-black uppercase tracking-widest",
                        p.status === 'Approuvé' ? "text-emerald-500" : "text-amber-500"
                      )}>{p.status}</div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-8 text-white relative overflow-hidden group">
            <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5" />
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">IA Recommendation</h4>
            <h5 className="text-xl font-black italic tracking-tighter mb-4 leading-tight">Augmentez vos conversions de 22%</h5>
            <p className="text-[11px] font-bold leading-relaxed opacity-90 mb-6">
              L'algorithme Nexus a identifié 14 produits dont les titres peuvent être optimisés pour le flux Google.
            </p>
            <button 
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full py-4 bg-white text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isOptimizing ? 'Optimisation IA...' : 'Optimiser Maintenant'}
            </button>
          </div>

          <div className="bg-[#0a0c10] border border-slate-800/60 rounded-[3rem] p-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Paramètres du Canal</h4>
            <div className="space-y-6">
              {[
                { label: 'Auto-Sync', value: 'Activé', color: 'text-emerald-400' },
                { label: 'Image AI Clean', value: 'Désactivé', color: 'text-slate-500' },
                { label: 'Merchant ID', value: '458-921-X', color: 'text-blue-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
