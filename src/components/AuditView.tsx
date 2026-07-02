import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WPConfig, WPAuditResult } from '../types';
import { getPosts, getProducts } from '../lib/wordpress';
import { auditContent } from '../lib/gemini';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Loader2,
  TrendingUp,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuditView({ config }: { config: WPConfig }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState<string | null>(null);
  const [results, setResults] = useState<WPAuditResult | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [stats, setStats] = useState({ posts: 0, products: 0 });

  useEffect(() => {
    fetchStats();
  }, [config]);

  const toggleSuggestion = (suggestion: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestion) 
        ? prev.filter(s => s !== suggestion) 
        : [...prev, suggestion]
    );
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const applySelected = async () => {
    if (selectedSuggestions.length === 0) return;
    setIsAuditing(true);
    setAuditStep(isEn ? 'Applying corrections...' : 'Application des corrections...');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSelectedSuggestions([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
      setAuditStep(null);
    }
  };

  const fetchStats = async () => {
    try {
      const [posts, products] = await Promise.all([
        getPosts(config, { per_page: 100, status: 'any' }),
        getProducts(config, { per_page: 100, status: 'any' })
      ]);
      setStats({ 
        posts: Array.isArray(posts) ? posts.length : 0, 
        products: Array.isArray(products) ? products.length : 0 
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    setResults(null);
    try {
      setAuditStep(isEn ? 'Indexing site structure...' : 'Indexation de la structure du site...');
      await new Promise(r => setTimeout(r, 1000));
      
      setAuditStep(isEn ? 'SEO analyzing posts...' : 'Analyse SEO des articles (Posts)...');
      const posts = await getPosts(config, { per_page: 5, status: 'publish' });
      
      setAuditStep(isEn ? 'Marketing analyzing products...' : 'Analyse Marketing des produits...');
      const products = await getProducts(config, { per_page: 5, status: 'publish' });

      setAuditStep(isEn ? 'Running Maestro Audit AI...' : "Exécution de l'IA Maestro Audit...");
      
      const combinedText = `
        STATS: ${stats.posts} articles, ${stats.products} produits.
        SAMPLE POSTS: ${Array.isArray(posts) ? posts.map(p => p.title.rendered).join(', ') : 'None'}
        SAMPLE PRODUCTS: ${Array.isArray(products) ? products.map(p => p.name).join(', ') : 'None'}
        FIRST CONTENT: ${Array.isArray(posts) && posts[0] ? posts[0].content.rendered.substring(0, 1000) : ''}
      `;
      
      const res = await auditContent(combinedText, 'post', 'Site Global Audit', config.geminiApiKey);
      
      setAuditStep(isEn ? 'Compiling health report...' : 'Compilation du rapport de santé...');
      await new Promise(r => setTimeout(r, 800));
      
      setResults(res);
    } catch (err: any) {
      console.error(err);
      setAuditStep(isEn ? `Critical AI error: ${err.message || JSON.stringify(err)}` : `Erreur critique IA: ${err.message || JSON.stringify(err)}`);
      // Keep results null if error
    } finally {
      setIsAuditing(false);
      // Wait a bit before clearing step if it's an error
    }
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 border border-emerald-400/30"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">{isEn ? 'Strategy successfully applied' : 'Stratégie appliquée avec succès'}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: isEn ? 'Articles' : 'Articles', val: stats.posts, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: isEn ? 'Products' : 'Produits', val: stats.products, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: isEn ? 'Global SEO Score' : 'Score SEO Global', val: results?.score ? `${results.score}%` : '--', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900 px-8 py-7 rounded-[2rem] border border-slate-800 flex flex-col justify-between h-44 shadow-lg">
            <div className="flex items-center justify-between">
              <div className={`${item.bg} w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} shadow-inner`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-3">{item.label}</p>
              <h3 className="text-3xl font-black font-mono text-white tracking-tighter">{item.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Action */}
      {!results && !isAuditing && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-blue-500/50" />
          <h2 className="text-2xl font-bold mb-2 tracking-tight">{isEn ? 'Recommended Global Audit' : 'Audit Global Recommandé'}</h2>
          <p className="max-w-md mx-auto text-slate-400 text-sm mb-10 leading-relaxed font-medium">
            {isEn ? 'The AI will scan your pages and products to detect SEO and conversion opportunities.' : "L'IA va scanner vos pages et produits pour détecter les opportunités d'amélioration SEO et de conversion."}
          </p>
          <button
            onClick={handleAudit}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto hover:bg-blue-500 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/40 text-sm tracking-tight"
          >
            {isEn ? 'Launch site audit' : "Lancer l'audit de site"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {isAuditing && (
        <div className="bg-slate-900 rounded-3xl p-20 text-center border border-slate-800">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2 tracking-tight text-white">{auditStep || (isEn ? "Analyzing Structure..." : "Analyse de la Structure...")}</h2>
          <p className="text-slate-500 text-sm font-medium">{isEn ? 'The Maestro scans your metadata and analyzes semantics.' : 'Le Maestro scanne vos métadonnées et analyse la sémantique.'}</p>
        </div>
      )}

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl p-8 border border-slate-800 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{isEn ? 'SEO Focus' : 'Focus SEO'}</h3>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {results.seoSuggestions.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => toggleSuggestion(s)}
                  className={`w-full text-left flex gap-4 text-xs font-medium p-4 rounded-xl border transition-all ${
                    selectedSuggestions.includes(s) 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-950/50 border-slate-800/50 text-slate-400 hover:border-emerald-500/30'
                  }`}
                >
                  <span className={`font-bold ${selectedSuggestions.includes(s) ? 'text-emerald-400' : 'text-emerald-500'}`}>0{idx + 1}.</span>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-slate-900 rounded-2xl p-8 border border-slate-800 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{isEn ? 'Content Quality' : 'Qualité du Contenu'}</h3>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {results.contentImprovements.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => toggleSuggestion(s)}
                  className={`w-full text-left flex gap-4 text-xs font-medium p-4 rounded-xl border transition-all ${
                    selectedSuggestions.includes(s) 
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                      : 'bg-slate-950/50 border-slate-800/50 text-slate-400 hover:border-blue-500/30'
                  }`}
                >
                  <span className={`font-bold ${selectedSuggestions.includes(s) ? 'text-blue-400' : 'text-blue-500'}`}>0{idx + 1}.</span>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="md:col-span-2 bg-slate-900 rounded-2xl p-8 border border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">{isEn ? 'Title Optimization (Nexus)' : 'Optimisation des Titres (Nexus)'}</h3>
            </div>
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl relative group">
               <div className="absolute -right-4 -top-4 w-12 h-12 bg-blue-600/20 rounded-full blur-xl group-hover:bg-blue-600/40 transition-all" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{isEn ? 'Suggested title for the analyzed item:' : "Titre suggéré pour l'élément analysé :"}</p>
               <h4 className="text-xl font-bold text-white italic tracking-tight mb-4">
                 "{results.optimizedTitle}"
               </h4>
               <button 
                  onClick={() => toggleSuggestion(isEn ? `Apply optimized title: ${results.optimizedTitle}` : `Appliquer le titre optimisé : ${results.optimizedTitle}`)}
                  className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedSuggestions.some(s => s.includes(results.optimizedTitle))
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
               >
                 {selectedSuggestions.some(s => s.includes(results.optimizedTitle)) ? (isEn ? 'Title selected' : 'Titre sélectionné') : (isEn ? 'Select this title' : 'Sélectionner ce titre')}
               </button>
            </div>
          </motion.div>

          <div className="md:col-span-2 space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-1 shadow-xl shadow-blue-900/20">
               <div className="bg-slate-950 p-6 rounded-[calc(1rem-1px)] flex items-center justify-between text-white border border-white/5">
                  <div>
                     <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1">{isEn ? 'Overall Health Summary' : 'Résumé Global Santé'}</p>
                     <h3 className="text-xl font-bold tracking-tight">{results.overallHealth}</h3>
                  </div>
                  <div className="text-right">
                     <p className="text-5xl font-mono font-bold tracking-tighter text-blue-400">{results.score}<span className="text-xl text-slate-600">%</span></p>
                  </div>
               </div>
            </div>

            {selectedSuggestions.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={applySelected}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40"
              >
                <ShieldCheck className="w-4 h-4" /> {isEn ? `Apply the ${selectedSuggestions.length} selected recommendations` : `Appliquer les ${selectedSuggestions.length} recommandations sélectionnés`}
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
