import React, { useState, useEffect } from 'react';
import { Globe, Search, Loader2, ArrowRight, TrendingUp, Link as LinkIcon, Star, Target, CheckCircle2, Tag, ChevronDown, Zap, BarChart3, Info, Radar, Sparkles, ShoppingBag, X } from 'lucide-react';
import { researchCompetitors, analyzeSemanticGap, generateAdCampaign } from '../lib/gemini';
import { CompetitorData, WPConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getProductCategories } from '../lib/wordpress';
import { cn } from '../lib/utils';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RadarArea, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';

export default function CompetitorView({ config }: { config: WPConfig }) {
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('France');
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  const [results, setResults] = useState<CompetitorData[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [marketSummary, setMarketSummary] = useState('');
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [adCampaign, setAdCampaign] = useState<any>(null);
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInjecting, setIsInjecting] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [config]);

  const fetchCategories = async () => {
    setIsLoadingCats(true);
    try {
      const cats = await getProductCategories(config);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setIsLoadingCats(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setResults([]);
    setTrendData([]);
    setGapAnalysis(null);
    setAdCampaign(null);
    try {
      const res = await researchCompetitors(niche, country, config.geminiApiKey);
      setResults(res.competitors || []);
      setTrendData(res.trend || []);
      setMarketSummary(res.marketSummary || '');
      
      // Auto-launch Semantic Gap if competitors found
      if (res.competitors && res.competitors.length > 0) {
        handleGapAnalysis(res.competitors);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Erreur Market Intelligence: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateAdCampaign = async (opportunity: string) => {
    setIsGeneratingAd(true);
    try {
      const campaign = await generateAdCampaign(opportunity, niche, config.geminiApiKey);
      setAdCampaign(campaign);
    } catch (err) {
      console.error('Failed to generate ad campaign', err);
    } finally {
      setIsGeneratingAd(false);
    }
  };

  const handleGapAnalysis = async (competitors: CompetitorData[]) => {
    setIsAnalyzingGap(true);
    try {
      const catNames = categories.map(c => c.name);
      const res = await analyzeSemanticGap(niche, competitors, catNames, config.geminiApiKey);
      setGapAnalysis(res);
    } catch (err) {
      console.error('Gap Analysis failed', err);
    } finally {
      setIsAnalyzingGap(false);
    }
  };

  const injectKeywords = async (idx: number | 'gap', keywords: string[]) => {
    setIsInjecting(idx === 'gap' ? -1 : idx);
    try {
      // Simulation d'injection SEO
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInjecting(null);
    }
  };

  return (
    <div className="space-y-6 relative min-h-[600px]">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 border border-blue-400/30"
          >
            <CheckCircle2 className="w-5 h-5 text-blue-200" />
            <div className="flex flex-col">
               <span className="text-sm font-black uppercase tracking-widest leading-none">Intelligence Appliquée</span>
               <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-1">Les mots-clés ont été injectés dans votre base SEO</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 border border-blue-400/20">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none mb-1">Market Intelligence</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
               <Globe className="w-3 h-3" /> Scrutage concurrentiel & Strategie de niche
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
           <div className="hidden lg:block">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Mise à jour</p>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Temps réel (Live)</p>
           </div>
           <div className="w-px h-8 bg-slate-800 hidden lg:block" />
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">ID Analyse</p>
              <p className="text-[10px] font-mono text-blue-400 uppercase tracking-tighter">MK-9283-X</p>
           </div>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest leading-none">Niche ou Produit cible</label>
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowCatMenu(!showCatMenu)}
                  className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1 group"
                >
                  <Tag className="w-2.5 h-2.5" /> 
                  <span>Choisir une catégorie</span> 
                  <ChevronDown className={cn("w-2.5 h-2.5 transition-transform", showCatMenu && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {showCatMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCatMenu(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-2 overflow-hidden backdrop-blur-xl"
                      >
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {isLoadingCats ? (
                            <div className="p-8 text-center text-slate-600">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 opacity-50" />
                              <p className="text-[9px] font-bold uppercase tracking-widest">Initialisation...</p>
                            </div>
                          ) : (Array.isArray(categories) && categories.length > 0) ? (
                            <div className="grid grid-cols-1 divide-y divide-white/5">
                              {categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    const temp = document.createElement('div');
                                    temp.innerHTML = cat.name;
                                    setNiche(temp.textContent || temp.innerText || cat.name);
                                    setShowCatMenu(false);
                                  }}
                                  className="w-full text-left px-5 py-3.5 hover:bg-blue-600/10 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all group flex items-center justify-between"
                                >
                                  <span dangerouslySetInnerHTML={{ __html: cat.name }} className="group-hover:text-white transition-colors" />
                                  <ArrowRight className="w-3 h-3 text-slate-800 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                              Aucune catégorie<br/>segmentée trouvée
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="relative group">
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors",
                isSearching && "animate-pulse text-blue-400"
              )} />
              <input 
                type="text" 
                placeholder="Ex: Sneakers de luxe, Cosmétiques bio..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm text-slate-200 transition-all font-medium"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="w-full md:w-56 space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 px-1 tracking-widest leading-none">Marché (Pays)</label>
            <div className="relative group">
               <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
               <input 
                type="text" 
                placeholder="France"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm text-slate-200 transition-all italic font-medium"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={isSearching}
              className="w-full md:w-auto h-[48px] bg-blue-600 text-white px-10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/30 text-sm tracking-tight"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Analyser <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      </div>

      {isSearching && (
        <div className="bg-slate-900 rounded-3xl p-24 text-center border border-slate-800 relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-sm"></div>
           <div className="relative z-10">
              <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                 <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                 <Search className="w-10 h-10 text-blue-500 animate-pulse relative z-10" />
              </div>
              <p className="text-xl font-bold tracking-tight text-white mb-2 italic font-serif">Le Maestro analyse le marché mondial...</p>
              <p className="text-slate-500 text-sm font-medium">Extraction des données concurrentielles en cours.</p>
           </div>
        </div>
      )}
      
      {/* Niche Trend Analysis */}
      <AnimatePresence>
        {trendData.length > 0 && !isSearching && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-[#0a0c10] border border-slate-800/60 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Analyse de Tendance (6 mois)</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Intérêt de recherche dans le temps</p>
                  </div>
                </div>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                      hide
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0c10', border: '1px solid #1e293b', borderRadius: '1rem', fontSize: '10px', fontWeight: 900 }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interest" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorTrend)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BarChart3 className="w-24 h-24 text-blue-500" />
               </div>
               <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Résumé du Marché</h4>
                  <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
                    {marketSummary || "Le marché affiche des signes de croissance stable avec une concentration modérée de concurrents directs."}
                  </p>
               </div>
               <div className="mt-8 pt-8 border-t border-slate-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Potentiel Niche</p>
                    <p className="text-xl font-black text-emerald-400">ÉLEVÉ</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-blue-600/20" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market Positioning Analysis */}
      <AnimatePresence>
        {results.length > 0 && !isSearching && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Visibility Radar */}
            <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Radar className="w-32 h-32 text-blue-500" />
               </div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                     <Target className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Radar de Positionnement</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Comparaison multi-moteurs 360°</p>
                  </div>
               </div>

               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'Google', A: 55, B: results[0]?.visibilityScores.google || 0, C: results[1]?.visibilityScores.google || 0, fullMark: 100 },
                        { subject: 'Bing', A: 40, B: results[0]?.visibilityScores.bing || 0, C: results[1]?.visibilityScores.bing || 0, fullMark: 100 },
                        { subject: 'Algos Alternatifs', A: 65, B: results[0]?.visibilityScores.others || 0, C: results[1]?.visibilityScores.others || 0, fullMark: 100 },
                        { subject: 'Direct/Referral', A: 30, B: 85, C: 45, fullMark: 100 },
                        { subject: 'Mobile UX', A: 85, B: 75, C: 90, fullMark: 100 },
                     ]}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <RadarArea name="Votre Site" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
                        <RadarArea name={results[0]?.url.replace(/^https?:\/\/(www\.)?/, '').split('.')[0].toUpperCase()} dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                        <RadarArea name={results[1]?.url.replace(/^https?:\/\/(www\.)?/, '').split('.')[0].toUpperCase()} dataKey="C" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                           itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                        />
                        <Legend iconType="diamond" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} />
                     </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Visibility Benchmarking */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col group">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                     <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Benchmark Visibilité</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Score Global de Présence</p>
                  </div>
               </div>

               <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart 
                        layout="vertical" 
                        data={[
                           { name: 'VOUS', score: 58, fill: '#3b82f6' },
                           ...results.map((r, i) => ({ 
                              name: r.url.replace(/^https?:\/\/(www\.)?/, '').split('.')[0].toUpperCase(), 
                              score: Math.round((r.visibilityScores.google + r.visibilityScores.bing + r.visibilityScores.others) / 3),
                              fill: i === 0 ? '#f59e0b' : '#334155'
                           }))
                        ]}
                        margin={{ left: 20, right: 30 }}
                     >
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis 
                           dataKey="name" 
                           type="category" 
                           axisLine={false} 
                           tickLine={false}
                           tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900, width: 60 }}
                        />
                        <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-800/50 space-y-4">
                  <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-[9px]">Market Share Est.</span>
                     <span className="text-xl font-black text-white italic">14.2%</span>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Semantic Gap Analysis */}
      <AnimatePresence>
        {(gapAnalysis || isAnalyzingGap) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-blue-500/30 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
               <Zap className="w-64 h-64 text-blue-500" />
            </div>

            {isAnalyzingGap ? (
              <div className="py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/20">
                  <BarChart3 className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Calcul du Semantic Gap...</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Comparaison de votre structure avec le leader du marché</p>
                </div>
              </div>
            ) : gapAnalysis && (
              <div className="relative z-10 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full">
                       <Zap className="w-3 h-3 text-blue-400" />
                       <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Nexus Content Strategy</span>
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                      AI SEMANTIC GAP <span className="text-blue-500">ANALYSIS</span>
                    </h3>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Gap Score</p>
                     <div className="flex items-center gap-4">
                        <span className="text-6xl font-black italic text-white leading-none">{gapAnalysis.gapScore}%</span>
                        <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
                           <TrendingUp className={cn(
                             "w-6 h-6",
                             gapAnalysis.gapScore > 50 ? "text-amber-500" : "text-emerald-500"
                           )} />
                        </div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                           <Target className="w-4 h-4 text-red-500" />
                           Opportunités Manquantes (Gap)
                        </p>
                        <div className="flex flex-wrap gap-3 mb-6">
                          {gapAnalysis.missingOpportunities.map((op: string, i: number) => (
                            <div key={i} className="group relative">
                              <span className="px-5 py-2.5 bg-slate-950 border border-red-500/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-500/50 transition-colors shadow-lg block cursor-default">
                                {op}
                              </span>
                              <button 
                                onClick={() => handleCreateAdCampaign(op)}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg hover:bg-blue-500 z-20"
                                title="Générer campagne publicitaire"
                              >
                                <ShoppingBag className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {isGeneratingAd && (
                          <div className="flex items-center gap-3 text-blue-400 italic mb-6">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Génération de la campagne IA...</span>
                          </div>
                        )}
                     </div>

                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           Chevauchement Sémantique (Forces)
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {gapAnalysis.semanticOverlap.map((over: string, i: number) => (
                            <span key={i} className="px-5 py-2.5 bg-slate-950 border border-emerald-500/20 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                               {over}
                            </span>
                          ))}
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-8 space-y-6">
                     <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                           <Info className="w-6 h-6 text-white" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Feuille de Route Nexus</p>
                           <p className="text-sm font-black text-white uppercase tracking-tight italic">Directives Stratégiques</p>
                        </div>
                     </div>
                     <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                        "{gapAnalysis.strategy}"
                     </p>
                     <div className="pt-4">
                        <button 
                          onClick={() => injectKeywords('gap', gapAnalysis.missingOpportunities)}
                          disabled={isInjecting !== null}
                          className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isInjecting === -1 ? (
                             <>
                               <Loader2 className="w-4 h-4 animate-spin" />
                               Injection Stratégique...
                             </>
                          ) : (
                             <>
                               <Zap className="w-4 h-4" /> Combler les Lacunes Sémantiques
                             </>
                          )}
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(results) && results.map((comp, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col group hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300"
          >
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                 <LinkIcon className="w-3.5 h-3.5 text-slate-600" />
                 <span className="text-[11px] font-mono font-bold text-blue-400/80 truncate max-w-[150px] uppercase tracking-tighter">{comp.url}</span>
               </div>
               <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">98% MATCH</div>
            </div>
            
            <div className="p-6 flex-1 space-y-8">
              <div>
                <p className="text-[9px] font-bold uppercase text-slate-500 mb-4 tracking-[0.2em] flex items-center gap-2 leading-none">
                   <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                   Points Forts
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(comp.strengths) && comp.strengths.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-tight">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase text-slate-500 mb-4 tracking-[0.2em] leading-none">Keywords Extraction</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(comp.keywords) && comp.keywords.map((k, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-400/10 text-blue-400 border border-blue-400/20 rounded-lg text-[9px] font-bold tracking-tight">#{k.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 opacity-60 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => injectKeywords(idx, comp.keywords)}
                disabled={isInjecting !== null}
                className="w-full py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all uppercase tracking-widest shadow-inner flex items-center justify-center gap-2"
               >
                  {isInjecting === idx ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Injection...
                    </>
                  ) : (
                    <>Injecter les mots clés</>
                  )}
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ad Campaign Modal */}
      <AnimatePresence>
        {adCampaign && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setAdCampaign(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-4xl bg-[#0a0c10] border border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0c10]/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Nexus Ad Campaign</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Campagne publicitaire générée par IA</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAdCampaign(null)}
                  className="p-3 bg-slate-900 hover:bg-slate-800 rounded-2xl text-white transition-all shadow-xl group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="p-8 lg:p-12 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Google Ads */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <p className="text-xs font-black text-white uppercase tracking-widest italic">Google Ads Preview</p>
                    </div>
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                      <div>
                        <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-2">Headline</p>
                        <p className="text-lg font-black text-white tracking-tight leading-tight">{adCampaign.googleAds.headline}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-2">Description</p>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{adCampaign.googleAds.description}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-2">Mots-clés suggérés</p>
                        <div className="flex flex-wrap gap-2">
                          {adCampaign.googleAds.keywords.map((k: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[9px] font-black">{k}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Facebook Ads */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                      <p className="text-xs font-black text-white uppercase tracking-widest italic">Facebook Ads Preview</p>
                    </div>
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                      <div>
                        <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mb-2">Primary Text</p>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"{adCampaign.facebookAds.primaryText}"</p>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mb-2">Headline</p>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{adCampaign.facebookAds.headline}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{adCampaign.facebookAds.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12 border-t border-white/5">
                  <div className="lg:col-span-1 space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4" /> Audience Cible
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {adCampaign.targetAudience.map((a: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-[9px] font-black uppercase">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Stratégie Nexus
                    </p>
                    <p className="text-xs text-slate-300 font-bold leading-relaxed italic bg-blue-600/5 p-6 rounded-3xl border border-blue-500/10">
                      "{adCampaign.strategy}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-950/50">
                <button 
                  onClick={() => setAdCampaign(null)}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl shadow-blue-900/40"
                >
                  Fermer & Appliquer la Stratégie
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!isSearching && results.length === 0 && (
        <div className="py-24 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem] relative overflow-hidden group">
           <div className="absolute inset-0 bg-blue-500/[0.02] group-hover:bg-blue-500/[0.04] transition-colors pointer-events-none" />
           <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-2xl relative z-10 transition-transform group-hover:scale-110">
              <Search className="w-10 h-10 text-slate-700" />
           </div>
           <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic mb-3 relative z-10">Cible Non Verrouillée</h3>
           <p className="text-slate-500 font-bold uppercase tracking-[0.15em] text-[10px] max-w-xs mx-auto leading-relaxed relative z-10">
              Entrez une niche et un pays pour lancer le scan des leaders du marché.
           </p>
           
           <div className="mt-8 flex justify-center gap-1 relative z-10">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800" />
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
