import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as LinkIcon, Search, Loader2, ArrowRight, Zap, Target, CheckCircle2, ChevronRight, BookOpen, ExternalLink, RefreshCw, FileText, ShoppingBag, Layers } from 'lucide-react';
import { getPosts, getPages, getProducts, updatePost, updatePage, updateProduct } from '../lib/wordpress';
import { suggestInternalLinks } from '../lib/gemini';
import { WPConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ContentItem {
  id: number;
  title: string;
  content: string;
  link: string;
  type: 'post' | 'page' | 'product';
  image?: string;
}

interface Suggestion {
  targetId: number;
  anchorText: string;
  contextSentence: string;
  reason: string;
  relevanceScore?: number;
}

export default function InternalLinkView({ config }: { config: WPConfig }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'post' | 'page' | 'product'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isApplying, setIsApplying] = useState<number | null>(null);
  const [status, setStatus] = useState<{ id: number, success: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllContent();
  }, [config.url]);

  const fetchAllContent = async () => {
    setIsLoading(true);
    try {
      const [posts, pages, products] = await Promise.all([
        getPosts(config, { per_page: 100, _embed: true }),
        getPages(config, { per_page: 50, _embed: true }),
        getProducts(config, { per_page: 100 })
      ]);

      const allContent: ContentItem[] = [
        ...(Array.isArray(posts) ? posts.map(p => ({ 
          id: p.id, 
          title: p.title.rendered, 
          content: p.content.rendered, 
          link: p.link, 
          type: 'post' as const,
          image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url
        })) : []),
        ...(Array.isArray(pages) ? pages.map(p => ({ 
          id: p.id, 
          title: p.title.rendered, 
          content: p.content.rendered, 
          link: p.link, 
          type: 'page' as const,
          image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url
        })) : []),
        ...(Array.isArray(products) ? products.map(p => ({ 
          id: p.id, 
          title: p.name, 
          content: p.description, 
          link: p.permalink, 
          type: 'product' as const,
          image: p.images?.[0]?.src
        })) : [])
      ];

      setItems(allContent);
    } catch (err) {
      console.error('Failed to fetch content', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(i => filter === 'all' || i.type === filter);

  const analyzeLinks = async (item: ContentItem) => {
    setSelectedItem(item);
    setIsAnalyzing(true);
    setSuggestions([]);
    setError(null);
    
    try {
      const potentialTargets = items
        .filter(p => p.id !== item.id)
        .map(p => ({
          id: p.id,
          title: p.title,
          url: p.link
        }))
        .slice(0, 50); // Limit to 50 best potential targets for Gemini window

      const res = await suggestInternalLinks(
        { title: item.title, content: item.content },
        potentialTargets,
        config.geminiApiKey
      );
      setSuggestions(res || []);
    } catch (err: any) {
      console.error('Analysis failed', err);
      setError(err.message || (isEn ? 'An error occurred during link analysis.' : 'Une erreur est survenue lors de l\'analyse du maillage.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyLink = async (suggestion: Suggestion) => {
    if (!selectedItem) return;
    
    setIsApplying(suggestion.targetId);
    try {
      const targetItem = items.find(p => p.id === suggestion.targetId);
      if (!targetItem) throw new Error(isEn ? 'Target not found' : 'Cible introuvable');

      const linkHtml = `<a href="${targetItem.link}">${suggestion.anchorText}</a>`;
      const newContent = selectedItem.content.replace(
        suggestion.anchorText,
        linkHtml
      );

      const data = { content: newContent };
      if (selectedItem.type === 'post') await updatePost(config, selectedItem.id, data);
      else if (selectedItem.type === 'page') await updatePage(config, selectedItem.id, data);
      else await updateProduct(config, selectedItem.id, { description: newContent });
      
      setStatus(prev => [...prev, { id: suggestion.targetId, success: true }]);
      
      // Update local state
      setSelectedItem({
        ...selectedItem,
        content: newContent
      });
      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, content: newContent } : i));
      
    } catch (err) {
      console.error('Failed to apply link', err);
      setStatus(prev => [...prev, { id: suggestion.targetId, success: false }]);
    } finally {
      setIsApplying(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center gap-4">
            INTERNAL LINK <span className="text-blue-500">ENGINE</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">{isEn ? 'Architecture & Semantic Link Juice Optimization' : "Optimisation de l'Architecture Sémantique & Jus SEO"}</p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
           {[
             { id: 'all', icon: Layers, label: isEn ? 'ALL' : 'TOUT' },
             { id: 'post', icon: FileText, label: 'POSTS' },
             { id: 'page', icon: BookOpen, label: 'PAGES' },
             { id: 'product', icon: ShoppingBag, label: 'SHOP' }
           ].map(t => (
             <button
               key={t.id}
               onClick={() => setFilter(t.id as any)}
               className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                 filter === t.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
               )}
             >
               <t.icon className="w-3 h-3" />
               {t.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Post Selection List */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Nexus Repository</h3>
                 </div>
                 <button onClick={fetchAllContent} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <RefreshCw className={cn("w-3 h-3 text-slate-500", isLoading && "animate-spin")} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {isLoading && items.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => analyzeLinks(item)}
                      className={cn(
                        "w-full p-3 rounded-2xl text-left transition-all border group flex gap-4",
                        selectedItem?.id === item.id 
                          ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/20" 
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      {item.image && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                           <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "text-[10px] font-black uppercase tracking-tight line-clamp-2 leading-tight",
                          selectedItem?.id === item.id ? "text-white" : "text-slate-300 group-hover:text-white"
                        )}>
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center gap-1.5">
                              {item.type === 'product' ? <ShoppingBag className="w-2 h-2" /> : item.type === 'page' ? <BookOpen className="w-2 h-2" /> : <FileText className="w-2 h-2" />}
                              <span className={cn(
                                "text-[7px] font-black uppercase tracking-[0.1em]",
                                selectedItem?.id === item.id ? "text-blue-100" : "text-slate-500"
                              )}>{item.type}</span>
                           </div>
                           <span className={cn(
                             "text-[7px] font-mono",
                             selectedItem?.id === item.id ? "text-blue-100" : "text-slate-700"
                           )}>#{item.id}</span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <p className="text-[10px] font-black uppercase tracking-widest italic">{isEn ? 'No content found' : 'Aucune donnée trouvée'}</p>
                  </div>
                )}
              </div>
           </div>
         </div>

         {/* Analysis Panel */}
         <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {!selectedItem ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[600px] border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6">
                     <LinkIcon className="w-10 h-10 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 italic">Select for Deep Analysis</h3>
                  <p className="text-xs text-slate-500 font-medium italic max-w-xs">{isEn ? 'Choose content for Nexus AI to analyze cross-linking opportunities throughout your site.' : "Choisissez un contenu pour que l'IA Nexus analyse les opportunités de maillage stratégique transversales."}</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                   <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                         <Zap className="w-40 h-40 text-blue-500" />
                      </div>
                      
                      <div className="relative z-10 space-y-8">
                         <div className="flex justify-between items-start gap-6">
                            <div className="flex items-center gap-6">
                               {selectedItem.image && (
                                 <div className="w-20 h-20 rounded-3xl overflow-hidden shrink-0 border-2 border-white/10 shadow-2xl">
                                    <img src={selectedItem.image} alt="" className="w-full h-full object-cover" />
                                 </div>
                               )}
                               <div className="space-y-2">
                                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{isEn ? `Mutation Source: ${selectedItem.type}` : `Source de Mutation: ${selectedItem.type}`}</span>
                                  <h3 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight max-w-2xl">
                                    {selectedItem.title}
                                  </h3>
                               </div>
                            </div>
                            <a href={selectedItem.link} target="_blank" rel="noreferrer" className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-600 transition-all font-black text-[9px] text-slate-500 flex items-center gap-2">
                               VIEW <ExternalLink className="w-3 h-3" />
                            </a>
                         </div>

                         {isAnalyzing ? (
                           <div className="py-20 text-center space-y-6">
                              <div className="relative inline-block">
                                 <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
                                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative" />
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">Nexus Cross-Link Analysis</h4>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">{isEn ? 'Multi-dimensional repository exploration...' : 'Exploration multi-dimensionnelle de votre base...'}</p>
                              </div>
                           </div>
                          ) : error ? (
                           <div className="py-12 px-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-4">
                              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                 <Zap className="w-6 h-6 text-red-500" />
                              </div>
                              <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{isEn ? 'Analysis Error' : "Erreur d'analyse"}</h4>
                              <p className="text-xs text-red-200/60 font-medium italic whitespace-pre-wrap">{error}</p>
                              <button 
                                onClick={() => analyzeLinks(selectedItem)}
                                className="px-6 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                              >
                                 {isEn ? 'Retry' : 'Réessayer'}
                              </button>
                           </div>
                         ) : suggestions.length > 0 ? (
                           <div className="space-y-4">
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <Target className="w-5 h-5" />
                                 </div>
                                 <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{isEn ? `${suggestions.length} Cross-Link Opportunities Detected` : `${suggestions.length} Opportunités Cross-Link Détectées`}</h4>
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                 {suggestions.map((s, idx) => {
                                   const isDone = status.find(st => st.id === s.targetId)?.success;
                                   const isErr = status.find(st => st.id === s.targetId)?.success === false;
                                   const targetItem = items.find(p => p.id === s.targetId);

                                   return (
                                     <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all group/card shadow-lg shadow-black">
                                       <div className="flex flex-col lg:flex-row gap-6">
                                          <div className="flex-1 space-y-4">
                                             <div className="flex items-start gap-4">
                                                {targetItem?.image && (
                                                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                                                     <img src={targetItem.image} alt="" className="w-full h-full object-cover" />
                                                  </div>
                                                )}
                                                <div className="space-y-1 min-w-0">
                                                   <p className="text-[10px] font-black text-slate-200 uppercase tracking-tight italic truncate">{targetItem?.title || `ID ${s.targetId}`}</p>
                                                   <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{targetItem?.type}</p>
                                                   <p className="text-[10px] font-medium italic text-slate-500 mt-2">"{s.reason}"</p>
                                                </div>
                                             </div>

                                             <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800/50">
                                                <p className="text-xs font-medium leading-relaxed text-slate-300">
                                                  {s.contextSentence.split(s.anchorText).map((part, i, arr) => (
                                                    <React.Fragment key={i}>
                                                      {part}
                                                      {i < arr.length - 1 && (
                                                        <span className="bg-blue-600/30 text-blue-400 px-1 rounded font-black border border-blue-500/30">
                                                          {s.anchorText}
                                                        </span>
                                                      )}
                                                    </React.Fragment>
                                                  ))}
                                                </p>
                                             </div>
                                          </div>

                                          <div className="lg:w-48 shrink-0 flex flex-col justify-center">
                                             {isDone ? (
                                               <div className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{isEn ? 'Link Injected Successfully' : 'Mutation Appliquée'}</span>
                                               </div>
                                             ) : (
                                               <button
                                                 onClick={() => applyLink(s)}
                                                 disabled={isApplying === s.targetId || isErr}
                                                 className={cn(
                                                   "w-full py-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                                   isErr 
                                                     ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                                     : "bg-white text-black hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                                                 )}
                                               >
                                                 {isApplying === s.targetId ? (
                                                   <Loader2 className="w-4 h-4 animate-spin" />
                                                 ) : isErr ? (
                                                   isEn ? 'Error' : 'Erreur'
                                                 ) : (
                                                   <>
                                                     {isEn ? 'Inject Link' : 'Injecter le Lien'} <ChevronRight className="w-3 h-3" />
                                                   </>
                                                 )}
                                               </button>
                                             )}
                                          </div>
                                       </div>
                                     </div>
                                   );
                                 })}
                              </div>
                           </div>
                         ) : (
                           <div className="py-20 text-center space-y-4">
                              <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                                 <Search className="w-8 h-8 text-white" />
                              </div>
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{isEn ? 'No clear cross-link opportunities detected for this resource.' : "Aucune opportunité cross-link évidente détectée pour cette ressource."}</p>
                           </div>
                         )}
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
