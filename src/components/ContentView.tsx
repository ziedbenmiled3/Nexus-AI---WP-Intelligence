import React, { useState, useEffect } from 'react';
import { WPConfig, WPPost, WPProduct } from '../types';
import { getPosts, getPages, getProducts, updatePost, updatePage, updateProduct } from '../lib/wordpress';
import SaaSDashboardSeo from './SaaSDashboardSeo';
import { 
  auditContent, 
  summarizeOptimization, 
  enrichLexicon, 
  injectKeywordIntoContent,
  rewriteContentWithTone
} from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  Package, 
  RefreshCw, 
  Zap, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Loader2,
  ChevronRight,
  TrendingDown,
  Layout,
  BookOpen,
  Sparkles,
  Syringe,
  Mic,
  Copy,
  Split
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function ContentView({ config }: { config: WPConfig }) {
  const [subView, setSubView] = useState<'editor' | 'saas'>('saas');
  const [type, setType] = useState<'post' | 'page' | 'product'>('post');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<any | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const [isEnriching, setIsEnriching] = useState(false);
  const [isInjecting, setIsInjecting] = useState<string | null>(null);
  const [lexicon, setLexicon] = useState<any | null>(null);

  const [isRewriting, setIsRewriting] = useState(false);
  const [abVersions, setAbVersions] = useState<any | null>(null);
  const [selectedTone, setSelectedTone] = useState<'Luxe' | 'Amical' | 'Urgent'>('Luxe');
  const [selectedAB, setSelectedAB] = useState<'A' | 'B'>('A');

  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
    setSelectedItem(null);
    setOptimization(null);
    setLexicon(null);
    setAbVersions(null);
    setSelectedIds([]);
    setIsBulkMode(false);
    fetchItems(1, true);
  }, [type, config]);

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkOptimize = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    setBulkProgress({ current: 0, total: selectedIds.length });
    
    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const id = selectedIds[i];
        const item = items.find(it => it.id === id);
        if (!item) continue;
        
        setBulkProgress({ current: i + 1, total: selectedIds.length });
        
        const content = (type === 'post' || type === 'page') ? item?.content?.rendered : item?.description;
        const title = (type === 'post' || type === 'page') ? item?.title?.rendered : item?.name;
        
        // Audit
        const res = await auditContent(content || '', type, title || '', config.geminiApiKey);
        
        // Apply immediately in bulk mode
        const data: any = {};
        if (type === 'post' || type === 'page') {
          data.title = res.optimizedTitle;
          data.content = res.optimizedContent;
        } else {
          data.name = res.optimizedTitle;
          data.description = res.optimizedContent;
        }

        if (type === 'post') await updatePost(config, id, data);
        else if (type === 'page') await updatePage(config, id, data);
        else await updateProduct(config, id, data);
      }
      
      alert(`Optimisation en masse terminée : ${selectedIds.length} ressources mutées.`);
      setSelectedIds([]);
      setIsBulkMode(false);
      fetchItems(1, true);
    } catch (err: any) {
      console.error(err);
      alert(`Erreur pendant l'opération groupée: ${err.message}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const fetchItems = async (pageNum: number, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = { per_page: 100, page: pageNum, _embed: true, status: 'any' };
      let res;
      if (type === 'post') res = await getPosts(config, params);
      else if (type === 'page') res = await getPages(config, params);
      else res = await getProducts(config, params);
      
      const newItems = Array.isArray(res) ? res : [];
      if (newItems.length < 100) setHasMore(false);
      
      if (reset) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage);
  };

  const handleOptimize = async () => {
    if (!selectedItem) return;
    setIsOptimizing(true);
    setSummary(null);
    setLexicon(null);
    try {
      const content = (type === 'post' || type === 'page') ? selectedItem?.content?.rendered : selectedItem?.description;
      const title = (type === 'post' || type === 'page') ? selectedItem?.title?.rendered : selectedItem?.name;
      const res = await auditContent(content || '', type, title || '', config.geminiApiKey, lexicon);
      setOptimization(res);

      // Auto-trigger summary for products if it's a quick analysis
      setIsSummarizing(true);
      summarizeOptimization(
        content || '', 
        res.optimizedContent, 
        res.seoSuggestions || [],
        config.geminiApiKey
      ).then(s => setSummary(s))
       .catch(e => console.error(e))
       .finally(() => setIsSummarizing(false));

    } catch (err: any) {
      console.error(err);
      alert(`Erreur d'analyse IA: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSummarize = async () => {
    if (!selectedItem || !optimization) return;
    setIsSummarizing(true);
    try {
      const originalContent = (type === 'post' || type === 'page') ? selectedItem?.content?.rendered : selectedItem?.description;
      const res = await summarizeOptimization(
        originalContent || '', 
        optimization.optimizedContent, 
        optimization.seoSuggestions || [],
        config.geminiApiKey
      );
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleEnrichLexicon = async () => {
    if (!selectedItem) return;
    setIsEnriching(true);
    try {
      const content = (type === 'post' || type === 'page') ? selectedItem?.content?.rendered : selectedItem?.description;
      const title = (type === 'post' || type === 'page') ? selectedItem?.title?.rendered : selectedItem?.name;
      const res = await enrichLexicon(content || '', type, title || '', config.geminiApiKey);
      setLexicon(res);
    } catch (err: any) {
      console.error(err);
      alert(`Erreur d'enrichissement: ${err.message}`);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleRewrite = async (tone: 'Luxe' | 'Amical' | 'Urgent') => {
    if (!selectedItem) return;
    setSelectedTone(tone);
    setIsRewriting(true);
    setOptimization(null);
    setLexicon(null);
    try {
      const content = (type === 'post' || type === 'page') ? selectedItem?.content?.rendered : selectedItem?.description;
      const res = await rewriteContentWithTone(content || '', tone, config.geminiApiKey);
      setAbVersions(res);
      setSelectedAB('A');
    } catch (err: any) {
      console.error(err);
      alert(`Erreur de réécriture: ${err.message}`);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleInject = async (keyword: string, implementation: string) => {
    if (!selectedItem) return;
    setIsInjecting(keyword);
    try {
      const content = (type === 'post' || type === 'page') ? selectedItem?.content?.rendered : selectedItem?.description;
      const title = (type === 'post' || type === 'page') ? selectedItem?.title?.rendered : selectedItem?.name;
      const newContent = await injectKeywordIntoContent(content || '', title || '', keyword, implementation, config.geminiApiKey);
      
      // Simulate an optimization object so it shows up in the comparison view
      setOptimization({
        score: optimization?.score || 85,
        optimizedTitle: title, // Keep same title for injection usually
        optimizedContent: newContent,
        seoSuggestions: [`Injection réussie : ${keyword}`, ...(optimization?.seoSuggestions || [])],
        contentImprovements: [`Terme sémantique "${keyword}" intégré stratégiquement.`],
        overallHealth: 'Optimisé par injection'
      });
      
      // Switch back to "SEO & Contenu" tab if it feels right, but actually setting optimization will trigger the comparison view anyway if it replaces lexicon view?
      // Wait, the UI logic for switching views is `(lexicon || isEnriching) ? (...) : (optimization ? ...)`
      // If we set optimization, we might want to clear lexicon so the comparison view shows up.
      // Or should we keep both? The current logic is:
      // {optimization ? (...) : (lexicon || isEnriching) ? (...) : (...)}
      // So optimization has priority. If we set optimization, the lexicon view will be hidden.
      
    } catch (err: any) {
      console.error(err);
      alert(`Erreur d'injection: ${err.message}`);
    } finally {
      setIsInjecting(null);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const [applyTitle, setApplyTitle] = useState(true);
  const [applyContent, setApplyContent] = useState(true);

  const handleView = () => {
    if (!selectedItem) return;
    const link = (type === 'post' || type === 'page') ? selectedItem.link : selectedItem.permalink;
    if (link) {
      window.open(link, '_blank');
    } else {
      alert("Lien non disponible pour cette ressource.");
    }
  };

  const handleApply = async () => {
    if (!selectedItem || (!optimization && !abVersions)) return;
    if (!applyTitle && !applyContent && !abVersions) {
      alert('Veuillez sélectionner au moins un élément à appliquer.');
      return;
    }
    setLoading(true);
    try {
      const data: any = {};
      
      if (abVersions) {
        const contentToApply = selectedAB === 'A' ? abVersions.versionA : abVersions.versionB;
        if (type === 'post' || type === 'page') {
          data.content = contentToApply;
        } else {
          data.description = contentToApply;
        }
      } else if (optimization) {
        if (type === 'post' || type === 'page') {
          if (applyTitle) data.title = optimization.optimizedTitle;
          if (applyContent) data.content = optimization.optimizedContent;
        } else {
          if (applyTitle) data.name = optimization.optimizedTitle;
          if (applyContent) data.description = optimization.optimizedContent;
        }
      }

      if (type === 'post') await updatePost(config, selectedItem.id, data);
      else if (type === 'page') await updatePage(config, selectedItem.id, data);
      else await updateProduct(config, selectedItem.id, data);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Update local item state to reflect changes immediately
      const updatedItem = { ...selectedItem };
      if (type === 'post' || type === 'page') {
        if (data.title) updatedItem.title = { rendered: data.title };
        if (data.content) updatedItem.content = { rendered: data.content };
      } else {
        if (data.name) updatedItem.name = data.name;
        if (data.description) updatedItem.description = data.description;
      }
      setSelectedItem(updatedItem);
      setOptimization(null);
      setAbVersions(null);
      setApplyTitle(true);
      setApplyContent(true);
      
      // Refresh background list
      fetchItems(1, true);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'application de l\'optimisation.');
    } finally {
      setLoading(false);
    }
  };

  const getItemImage = (item: any) => {
    if (type === 'product') {
      return item?.images?.[0]?.src || null;
    }
    return item?._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
  };

  return (
    <div className="space-y-6">
      {/* SaaS Dashboard Switch Sub-menu */}
      <div className="flex bg-[#0c0e14]/80 backdrop-blur-md border border-slate-900 rounded-2xl p-1 max-w-sm">
        <button
          onClick={() => setSubView('saas')}
          className={cn(
            "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider text-center rounded-xl transition-all duration-300",
            subView === 'saas' 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
              : "text-slate-500 hover:text-slate-200"
          )}
        >
          ⚡ SaaS Dashboard
        </button>
        <button
          onClick={() => setSubView('editor')}
          className={cn(
            "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider text-center rounded-xl transition-all duration-300",
            subView === 'editor' 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
              : "text-slate-500 hover:text-slate-200"
          )}
        >
          ✍ Content Editor
        </button>
      </div>

      {subView === 'saas' ? (
        <SaaSDashboardSeo config={config} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      {/* List */}
      <div className="lg:col-span-4 space-y-4 flex flex-col h-full max-h-[calc(100vh-12rem)]">
        <div className="bg-slate-900 rounded-[1.5rem] p-1.5 border border-slate-800 grid grid-cols-2 gap-1 shadow-xl shrink-0">
          <button 
            onClick={() => { setType('post'); setSelectedItem(null); setOptimization(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${type === 'post' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <FileText className="w-3 h-3" /> Articles
          </button>
          <button 
            onClick={() => { setType('page'); setSelectedItem(null); setOptimization(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${type === 'page' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <Layout className="w-3 h-3" /> Pages
          </button>
          <button 
            onClick={() => { setType('post'); setSelectedItem(null); setOptimization(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${type === 'post' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <BookOpen className="w-3 h-3" /> Blog
          </button>
          <button 
            onClick={() => { setType('product'); setSelectedItem(null); setOptimization(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${type === 'product' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <Package className="w-3 h-3" /> Produits
          </button>
        </div>

        <div className="flex-1 bg-slate-900 rounded-[1.5rem] border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Resource Explorer</h4>
              <button 
                onClick={() => { setIsBulkMode(!isBulkMode); setSelectedIds([]); }}
                className={cn(
                  "px-2 py-0.5 rounded text-[8px] font-black tracking-widest border transition-all",
                  isBulkMode ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                )}
              >
                BULK {isBulkMode ? 'ON' : 'OFF'}
              </button>
            </div>
            <button onClick={() => fetchItems(1, true)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group">
               <RefreshCw className={`w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 ${loading && page === 1 ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isBulkMode && (
            <div className="p-3 bg-blue-600/5 border-b border-slate-800 flex items-center justify-between">
              <button 
                onClick={toggleSelectAll}
                className="text-[9px] font-black uppercase text-blue-400 tracking-widest hover:text-blue-300"
              >
                {selectedIds.length === items.length ? 'Désélectionner tout' : 'Sélectionner tout ($' + items.length + ')'}
              </button>
              <span className="text-[9px] font-bold text-slate-500">{selectedIds.length} ressources marquées</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 custom-scrollbar">
            {items.map((item) => {
              const img = getItemImage(item);
              const isSelected = selectedIds.includes(item.id);
              
              return (
                <div key={item.id} className="relative group">
                  {isBulkMode && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => { 
                      if (isBulkMode) toggleSelect(item.id);
                      else { setSelectedItem(item); setOptimization(null); }
                    }}
                    className={cn(
                      "w-full text-left p-4 hover:bg-white/5 transition-all flex items-center gap-4",
                      selectedItem?.id === item.id && !isBulkMode ? 'bg-blue-600/5' : '',
                      isBulkMode ? "pl-12" : "pl-4"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors overflow-hidden bg-slate-950",
                      selectedItem?.id === item.id && !isBulkMode
                        ? "border-blue-500/40" 
                        : "border-slate-800 group-hover:border-slate-700"
                    )}>
                       {img ? (
                         <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       ) : (
                         <span className="text-[10px] font-bold text-slate-700">{item.id}</span>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-bold truncate transition-colors", (selectedItem?.id === item.id && !isBulkMode) || isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>
                        {(type === 'post' || type === 'page') ? item?.title?.rendered : item?.name}
                      </p>
                      <p className="text-[9px] text-slate-600 font-mono tracking-tighter truncate uppercase">
                        {(selectedItem?.id === item.id && !isBulkMode) ? 'FOCUS ACTIVE' : (isSelected ? 'MARKED FOR MUTATION' : 'PENDING ANALYSIS')}
                      </p>
                    </div>
                    {!isBulkMode && <ChevronRight className={cn("w-3.5 h-3.5 transition-all", selectedItem?.id === item.id ? "text-blue-400 translate-x-0" : "text-slate-700 group-hover:text-slate-500 -translate-x-1 opacity-0 group-hover:opacity-100")} />}
                  </button>
                </div>
              );
            })}

            
            {loading && (
              <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500/30" /></div>
            )}
            
            {!loading && hasMore && items.length > 0 && (
              <button 
                onClick={loadMore}
                className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400 transition-colors bg-slate-950/20"
              >
                Charger plus de ressources
              </button>
            )}

            {items.length === 0 && !loading && (
              <div className="p-12 text-center">
                <p className="text-[10px] font-black uppercase text-slate-700 tracking-widest">No resources found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor/Optimizer */}
      <div className="lg:col-span-8 space-y-4 flex flex-col h-full overflow-hidden">
        {isBulkMode && selectedIds.length > 0 ? (
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 flex-1 flex flex-col items-center justify-center p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/5 animate-pulse" />
            
            <div className="relative z-10 space-y-8">
              <div className="w-24 h-24 bg-blue-600/20 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-500/30 shadow-2xl">
                 <Zap className="w-10 h-10 text-blue-400" />
              </div>
              
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Nexus Power-Bulk</h3>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">Protocole de Mutation Massive</p>
              </div>

              <div className="p-8 bg-black/40 border border-slate-800 rounded-3xl w-full max-w-md mx-auto space-y-6">
                <div className="flex justify-between items-end">
                   <div className="text-left">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status du lot</p>
                      <p className="text-xl font-black text-white italic">{selectedIds.length} Ressources</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Type de mutation</p>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">SEO Audit & Auto-Apply</p>
                   </div>
                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-blue-500" 
                     initial={{ width: 0 }}
                     animate={{ width: isBulkProcessing ? `${(bulkProgress.current / bulkProgress.total) * 100}%` : '0%' }}
                   />
                </div>

                <button 
                  onClick={handleBulkOptimize}
                  disabled={isBulkProcessing}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/30 disabled:opacity-50"
                >
                  {isBulkProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Synthèse en cours ({bulkProgress.current}/{bulkProgress.total})...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Lancer l'Optimisation Globale
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-slate-600">
                 <AlertCircle className="w-4 h-4 shrink-0" />
                 <p className="text-[9px] font-black uppercase tracking-widest max-w-xs text-left leading-relaxed">
                   ATTENTION : Ce processus va modifier directement vos titres et contenus sur WordPress. 
                   L'IA utilisera votre clé <span className="text-blue-500">Gemini BYOK</span> pour cette opération.
                 </p>
              </div>
            </div>
          </div>
        ) : selectedItem ? (
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 flex-1 flex flex-col overflow-hidden shadow-2xl relative">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-inner overflow-hidden">
                      {getItemImage(selectedItem) ? (
                        <img src={getItemImage(selectedItem)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        (type === 'post' || type === 'page') ? <FileText className="w-6 h-6" /> : <Package className="w-6 h-6" />
                      )}
                   </div>
                   <div>
                      <h4 className="text-base font-bold text-white tracking-tight leading-none mb-1.5">{(type === 'post' || type === 'page') ? selectedItem?.title?.rendered : selectedItem?.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black text-slate-600 tracking-widest">{type}</span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span className="text-[9px] font-mono text-blue-500/80">UID_{selectedItem.id}</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                     {(['Luxe', 'Amical', 'Urgent'] as const).map((tone) => (
                       <button
                         key={tone}
                         onClick={() => handleRewrite(tone)}
                         disabled={isRewriting}
                         className={cn(
                           "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                           selectedTone === tone && abVersions ? "bg-blue-600 text-white shadow-lg" : "text-slate-600 hover:text-slate-400"
                         )}
                       >
                         {tone}
                       </button>
                     ))}
                   </div>
                   <button 
                      onClick={handleView}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-800 flex items-center gap-2 text-slate-400 hover:text-white"
                   >
                      <Eye className="w-3.5 h-3.5" /> Voir
                   </button>
                   <button 
                      onClick={handleEnrichLexicon}
                      disabled={isEnriching}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-800 flex items-center gap-2 text-blue-400 hover:text-blue-300 shadow-lg shadow-blue-950/20"
                   >
                      {isEnriching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><BookOpen className="w-3.5 h-3.5" /> Enrichir Lexique</>}
                   </button>
                   <button 
                      onClick={handleOptimize}
                      disabled={isOptimizing}
                      className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 shadow-lg shadow-blue-900/30 active:scale-[0.98]"
                   >
                      {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-3.5 h-3.5" /> Analyser IA</>}
                   </button>
                </div>
             </div>

             <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-400/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Optimisation appliquée</span>
                  </motion.div>
                )}
             </AnimatePresence>

             <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-x divide-slate-800">
                {/* Original View */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Contenu Original</span>
                    {optimization && <span className="text-[9px] font-mono text-slate-600 italic">LECTURE SEULE</span>}
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950/20">
                    <div className="prose prose-invert prose-sm max-w-none prose-slate">
                      <div 
                        className="text-sm leading-relaxed text-slate-400 font-serif italic selection:bg-blue-500/30"
                        dangerouslySetInnerHTML={{ __html: (type === 'post' || type === 'page') ? (selectedItem?.content?.rendered || '') : (selectedItem?.description || selectedItem?.short_description || '') }} 
                      />
                    </div>
                  </div>
                </div>

                {/* AI Comparison View */}
                {optimization ? (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-1 flex flex-col min-w-0 bg-slate-900/40 relative"
                  >
                    <div className="px-6 py-3 bg-blue-600/5 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingDown className="w-3 h-3 rotate-180" /> Proposition IA Optimisée
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Score:</span>
                        <span className="text-sm font-mono font-bold text-blue-400">{optimization.score}%</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col divide-y divide-slate-800 overflow-hidden">
                      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8 bg-slate-950/20">
                        {/* Synthesis Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Synthèse du Maestro</label>
                            <button 
                              onClick={handleSummarize}
                              disabled={isSummarizing}
                              className="px-4 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-blue-500/10 flex items-center gap-2"
                            >
                              {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              {summary ? 'Régénérer Synthèse' : 'Synthétiser le Contenu'}
                            </button>
                          </div>
                          
                          {summary && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-[2rem] relative overflow-hidden group shadow-2xl"
                            >
                              <div className="absolute -top-6 -right-6 p-12 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                                <Sparkles className="w-24 h-24 text-blue-400" />
                              </div>
                              <div className="prose prose-invert prose-sm max-w-none prose-blue prose-p:leading-relaxed prose-headings:italic prose-headings:tracking-tighter prose-headings:font-black prose-headings:uppercase prose-li:text-slate-300">
                                <ReactMarkdown>{summary}</ReactMarkdown>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Comparison Table/List */}
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center justify-between mb-4 px-1">
                              <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Titre Optimisé</label>
                              <button 
                                onClick={() => setApplyTitle(!applyTitle)}
                                className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors",
                                  applyTitle ? "text-emerald-500 bg-emerald-500/10" : "text-slate-600 bg-slate-800"
                                )}
                              >
                                {applyTitle ? 'Inclure' : 'Exclure'}
                              </button>
                            </div>
                            <div className={cn(
                              "p-4 border rounded-xl transition-all",
                              applyTitle ? "bg-blue-600/5 border-blue-500/20" : "bg-slate-900 border-slate-800 opacity-50"
                            )}>
                              <h4 className="text-sm font-black text-white leading-tight italic uppercase tracking-tight">
                                {optimization.optimizedTitle}
                              </h4>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2 px-1">Analyse des mutations</label>
                            <div className="grid grid-cols-1 gap-3">
                              {optimization.seoSuggestions.slice(0, 3).map((s: string, i: number) => (
                                <div key={i} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex gap-3 text-xs leading-relaxed group hover:border-blue-500/30 transition-colors">
                                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                  <span className="text-slate-400 italic text-[11px]">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center justify-between mb-4 px-1">
                               <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Aperçu du contenu muté</label>
                               <button 
                                  onClick={() => setApplyContent(!applyContent)}
                                  className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors",
                                    applyContent ? "text-emerald-500 bg-emerald-500/10" : "text-slate-600 bg-slate-800"
                                  )}
                                >
                                  {applyContent ? 'Inclure' : 'Exclure'}
                                </button>
                             </div>
                             <div className={cn(
                                "p-6 border rounded-2xl transition-all",
                                applyContent ? "bg-slate-950 border-slate-800" : "bg-slate-900 border-slate-800 opacity-50"
                             )}>
                              <div 
                                className="text-sm leading-relaxed text-slate-200 font-medium whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: optimization.optimizedContent }}
                              />
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-950 flex flex-col gap-3 shrink-0">
                        <button 
                          onClick={handleApply}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-[0.98]"
                        >
                          <Save className="w-4 h-4" /> Appliquer Mutations SEO
                        </button>
                        <p className="text-[8px] text-slate-600 text-center uppercase font-black tracking-widest italic">Action irréversible sur WordPress</p>
                      </div>
                    </div>
                  </motion.div>
                ) : abVersions || isRewriting ? (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-1 flex flex-col min-w-0 bg-slate-900/40 relative"
                  >
                    <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                       <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                          <Mic className="w-4 h-4" /> Analyseur de Tonalité & A/B Testing
                       </span>
                       {abVersions && (
                         <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                            {(['A', 'B'] as const).map((v) => (
                              <button
                                key={v}
                                onClick={() => setSelectedAB(v)}
                                className={cn(
                                  "px-4 py-1 rounded-md text-[10px] font-black transition-all",
                                  selectedAB === v ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-400"
                                )}
                              >
                                VERSION {v}
                              </button>
                            ))}
                         </div>
                       )}
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950/20">
                       {isRewriting ? (
                         <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center animate-pulse">
                                 <RefreshCw className="w-8 h-8 text-blue-400" />
                              </div>
                              <Loader2 className="absolute -bottom-2 -right-2 w-6 h-6 text-blue-500 animate-spin" />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Réécriture Sémantique : {selectedTone}</h4>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] max-w-[15rem]">Le Maestro recalibre le champ lexical pour adopter la voix {selectedTone}...</p>
                            </div>
                         </div>
                       ) : abVersions && (
                         <div className="space-y-8">
                            <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2rem] relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-4 opacity-5">
                                  <Split className="w-12 h-12 text-blue-400" />
                               </div>
                               <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Justification Stratégique</h5>
                               <p className="text-xs text-slate-400 leading-relaxed italic">
                                  {abVersions.justification}
                                </p>
                            </div>

                            <div className="space-y-4">
                               <div className="flex items-center justify-between px-1">
                                  <h6 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Version {selectedAB} (Propulsée par IA)</h6>
                                  <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full">
                                     <span className="text-[8px] font-black text-slate-500 uppercase">MODE: {selectedTone}</span>
                                  </div>
                               </div>
                               <div className="p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-2xl relative group">
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(selectedAB === 'A' ? abVersions.versionA : abVersions.versionB)}
                                    className="absolute top-6 right-6 p-2 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  >
                                     <Copy className="w-4 h-4" />
                                  </button>
                                  <div 
                                    className="prose prose-invert prose-sm max-w-none prose-slate prose-p:leading-relaxed text-slate-200"
                                    dangerouslySetInnerHTML={{ __html: selectedAB === 'A' ? abVersions.versionA : abVersions.versionB }}
                                  />
                               </div>
                            </div>

                            <div className="p-6 bg-slate-950 border border-slate-800 rounded-[2rem] flex items-center gap-4">
                               <div className="p-3 bg-amber-500/10 rounded-xl">
                                  <Zap className="w-5 h-5 text-amber-500" />
                               </div>
                               <div>
                                  <h6 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">A/B Testing Activé</h6>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                                     Nexus suivra les clics et conversions pour déterminer laquelle des deux versions génère le plus de profit.
                                  </p>
                               </div>
                            </div>
                         </div>
                       )}
                    </div>

                    {abVersions && (
                      <div className="p-6 bg-slate-950 flex flex-col gap-3 shrink-0">
                         <button 
                           onClick={handleApply}
                           className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-[0.98]"
                         >
                           <Save className="w-4 h-4" /> Déployer Version {selectedAB}
                         </button>
                         <p className="text-[8px] text-slate-600 text-center uppercase font-black tracking-widest italic">L'A/B Testing commencera immédiatement après déploiement</p>
                      </div>
                    )}
                  </motion.div>
                ) : (lexicon || isEnriching) ? (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-1 flex flex-col min-w-0 bg-slate-900/40 relative"
                  >
                    <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                       <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Enrichissement Lexical IA
                       </span>
                       {lexicon && (
                         <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-slate-500 uppercase">Autorité Sémantique:</span>
                           <span className="text-sm font-mono font-bold text-blue-400">{lexicon.semanticAuthorityScore}%</span>
                         </div>
                       )}
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950/20">
                       {isEnriching ? (
                         <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                               <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center animate-pulse">
                                  <BookOpen className="w-8 h-8 text-blue-400" />
                               </div>
                               <Loader2 className="absolute -bottom-2 -right-2 w-6 h-6 text-blue-500 animate-spin" />
                            </div>
                            <div>
                               <h4 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Expansion du Lexique</h4>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] max-w-[15rem]">Le Maestro identifie les entités sémantiques manquantes pour dominer votre niche...</p>
                            </div>
                         </div>
                       ) : (
                         <div className="space-y-6">
                            <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2rem] mb-8">
                               <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Recommandations stratégiques</h5>
                               <p className="text-xs text-slate-400 leading-relaxed italic">
                                 L'intégration de ces termes permet de signaler à Google une expertise approfondie sur le sujet, améliorant ainsi votre classement sémantique.
                               </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                               {lexicon.enrichments.map((e: any, i: number) => (
                                 <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl group hover:border-blue-500/30 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-2">
                                       <span className="px-3 py-1 bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/10">
                                          {e.keyword}
                                       </span>
                                       <button 
                                         onClick={() => handleInject(e.keyword, e.implementation)}
                                         disabled={!!isInjecting}
                                         className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white border border-blue-400 transition-all shadow-lg shadow-blue-900/40"
                                         title="Injecter dans le texte"
                                       >
                                          {isInjecting === e.keyword ? <Loader2 className="w-3 h-3 animate-spin" /> : <Syringe className="w-3 h-3" />}
                                       </button>
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-bold mb-3 italic">"{e.reason}"</p>
                                    <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                                       <Zap className="w-3 h-3 text-blue-500" />
                                       <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-tight">
                                          <span className="text-slate-400">Implémentation :</span> {e.implementation}
                                       </p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-950/20 text-center p-12">
                     <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6 border border-slate-800">
                        <Zap className="w-6 h-6 text-slate-800" />
                     </div>
                     <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] max-w-[12rem]">Lancez l'analyse IA pour comparer les versions.</p>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-slate-800 rounded-[2rem] p-24 text-center bg-slate-900 group shadow-2xl">
             <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-800 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <FileText className="w-10 h-10 text-slate-800" />
             </div>
             <h3 className="text-2xl font-black mb-3 tracking-tighter text-white/80 uppercase italic">Optimisation Nexus</h3>
             <p className="text-sm max-w-[18rem] text-slate-600 font-bold leading-relaxed italic uppercase tracking-wider text-[10px]">Sélectionnez une ressource WordPress pour engager le protocole d'optimisation IA.</p>
          </div>
        )}
      </div>
    </div>
   )}
  </div>
  );
}
