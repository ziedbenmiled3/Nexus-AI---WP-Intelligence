import React, { useState, useEffect } from 'react';
import { Database, Search, Loader2, ArrowRight, Zap, Target, CheckCircle2, ChevronRight, BookOpen, ExternalLink, RefreshCw, FileText, ShoppingBag, Layers, Code, Copy, Save } from 'lucide-react';
import { getPosts, getPages, getProducts, updatePost, updatePage, updateProduct } from '../lib/wordpress';
import { generateSchema } from '../lib/gemini';
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

export default function SchemaEngineView({ config }: { config: WPConfig }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'post' | 'page' | 'product'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<any>(null);
  const [isInjecting, setIsInjecting] = useState(false);
  const [success, setSuccess] = useState(false);
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
          id: p.id, title: p.title.rendered, content: p.content.rendered, link: p.link, type: 'post' as const,
          image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url
        })) : []),
        ...(Array.isArray(pages) ? pages.map(p => ({ 
          id: p.id, title: p.title.rendered, content: p.content.rendered, link: p.link, type: 'page' as const,
          image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url
        })) : []),
        ...(Array.isArray(products) ? products.map(p => ({ 
          id: p.id, title: p.name, content: p.description, link: p.permalink, type: 'product' as const,
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

  const analyzeSchema = async (item: ContentItem) => {
    setSelectedItem(item);
    setIsAnalyzing(true);
    setGeneratedSchema(null);
    setSuccess(false);
    setError(null);
    
    try {
      const res = await generateSchema(item.title, item.content, item.type, item.link, config.geminiApiKey);
      setGeneratedSchema(res);
    } catch (err: any) {
      console.error('Schema analysis failed', err);
      setError(err.message || 'Une erreur est survenue lors de la génération du schéma.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const injectSchema = async () => {
    if (!selectedItem || !generatedSchema) return;
    
    setIsInjecting(true);
    try {
      const jsonLdScript = `\n\n<script type="application/ld+json">\n${JSON.stringify(generatedSchema.jsonLd, null, 2)}\n</script>`;
      
      // Check if schema already exists (simple string check)
      if (selectedItem.content.includes('application/ld+json')) {
        if (!confirm('Un schéma JSON-LD semble déjà présent dans le contenu. Voulez-vous en ajouter un nouveau ?')) {
           setIsInjecting(false);
           return;
        }
      }

      const newContent = selectedItem.content + jsonLdScript;
      const data = { content: newContent };

      if (selectedItem.type === 'post') await updatePost(config, selectedItem.id, data);
      else if (selectedItem.type === 'page') await updatePage(config, selectedItem.id, data);
      else await updateProduct(config, selectedItem.id, { description: newContent });

      setSuccess(true);
      // Update local state
      setSelectedItem({ ...selectedItem, content: newContent });
      setItems(items.map(i => i.id === selectedItem.id ? { ...i, content: newContent } : i));
    } catch (err) {
      console.error('Injection failed', err);
      alert('Erreur lors de l\'injection du schéma');
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center gap-4">
            SCHEMA <span className="text-emerald-500">ENGINE</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Optimisation des Rich Snippets & Données Structurées</p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
           {[
             { id: 'all', icon: Layers, label: 'TOUT' },
             { id: 'post', icon: FileText, label: 'POSTS' },
             { id: 'page', icon: BookOpen, label: 'PAGES' },
             { id: 'product', icon: ShoppingBag, label: 'SHOP' }
           ].map(t => (
             <button
               key={t.id}
               onClick={() => setFilter(t.id as any)}
               className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                 filter === t.id ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
               )}
             >
               <t.icon className="w-3 h-3" />
               {t.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Repo List */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Content Repository</h3>
                 <button onClick={fetchAllContent} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <RefreshCw className={cn("w-3 h-3 text-slate-500", isLoading && items.length === 0 && "animate-spin")} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {isLoading && items.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  </div>
                ) : filteredItems.map(item => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => analyzeSchema(item)}
                    className={cn(
                      "w-full p-3 rounded-2xl text-left transition-all border group flex gap-4",
                      selectedItem?.id === item.id 
                        ? "bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-900/20" 
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    {item.image && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-900 font-black">
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
                            <span className={cn(
                              "text-[7px] font-black uppercase tracking-widest",
                              selectedItem?.id === item.id ? "text-emerald-100" : "text-slate-500"
                            )}>{item.type}</span>
                         </div>
                         <span className={cn(
                           "text-[7px] font-mono",
                           selectedItem?.id === item.id ? "text-emerald-100" : "text-slate-700"
                         )}>#{item.id}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Engine Panel */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
             {!selectedItem ? (
               <motion.div 
                 key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="h-[600px] border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12"
               >
                 <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6">
                    <Database className="w-10 h-10 text-slate-700" />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 italic">Structured Data Analysis</h3>
                 <p className="text-xs text-slate-500 font-medium italic max-w-xs">Sélectionnez un contenu pour générer un schéma JSON-LD sémantiquement parfait et booster votre visibilité Google.</p>
               </motion.div>
             ) : (
               <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Code className="w-40 h-40 text-emerald-500" />
                     </div>

                     <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-6">
                              {selectedItem.image && (
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-xl">
                                   <img src={selectedItem.image} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="space-y-1">
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Metadata Forge</span>
                                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight max-w-xl">
                                   {selectedItem.title}
                                 </h3>
                              </div>
                           </div>
                           <a href={selectedItem.link} target="_blank" rel="noreferrer" className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-600 transition-all">
                              <ExternalLink className="w-4 h-4 text-slate-500" />
                           </a>
                        </div>

                        {isAnalyzing ? (
                          <div className="py-20 text-center space-y-6">
                             <div className="relative inline-block">
                                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin relative" />
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">Nexus Schema Generation</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Extraction de l'entité sémantique principale...</p>
                             </div>
                          </div>
                         ) : error || (generatedSchema && Object.keys(generatedSchema.jsonLd || {}).length === 0) ? (
                          <div className="py-12 px-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-4">
                             <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-6 h-6 text-red-500" />
                             </div>
                             <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">
                               {error ? "Erreur d'analyse" : "Génération Incomplète"}
                             </h4>
                             <p className="text-xs text-red-200/60 font-medium italic whitespace-pre-wrap">
                               {error || "L'IA a détecté l'entité mais n'a pas pu générer le code complet. Cela arrive parfois avec les quotas gratuits."}
                             </p>
                             <button 
                               onClick={() => analyzeSchema(selectedItem)}
                               className="px-6 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                             >
                                Réessayer la génération
                             </button>
                          </div>
                        ) : generatedSchema ? (
                          <div className="space-y-8">
                             <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                         <Target className="w-4 h-4 text-emerald-500" />
                                      </div>
                                      <div>
                                         <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Entité Détectée</p>
                                         <p className="text-xs font-black text-white uppercase italic tracking-tight">{generatedSchema.schemaType}</p>
                                      </div>
                                   </div>

                                   <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 overflow-hidden relative group">
                                      <div className="absolute top-4 right-4 flex gap-2">
                                         <button 
                                           onClick={() => {
                                             navigator.clipboard.writeText(JSON.stringify(generatedSchema.jsonLd, null, 2));
                                             alert('Copié !');
                                           }}
                                           className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 hover:text-white hover:border-slate-600 transition-all"
                                         >
                                            <Copy className="w-3 h-3" />
                                         </button>
                                      </div>
                                      <pre className="text-[10px] font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-[300px]">
                                        {JSON.stringify(generatedSchema.jsonLd, null, 2)}
                                      </pre>
                                   </div>
                                </div>

                                <div className="md:w-64 space-y-6">
                                   <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                                      <div className="flex items-center gap-3">
                                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                         <span className="text-[9px] font-black text-white uppercase tracking-widest">Injection Directe</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 font-medium italic">Nexus va injecter ce script JSON-LD directement à la fin du contenu pour une indexation immédiate.</p>
                                      
                                      {success ? (
                                        <div className="py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center gap-2">
                                           <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Opération Réussie</span>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={injectSchema}
                                          disabled={isInjecting}
                                          className="w-full py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
                                        >
                                          {isInjecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                          Injecter le Schéma
                                        </button>
                                      )}
                                   </div>

                                   <div className="px-6 py-4 bg-slate-800/10 border border-slate-800 rounded-2xl">
                                      <div className="flex items-center gap-2 mb-2">
                                         <Zap className="w-3 h-3 text-amber-500" />
                                         <span className="text-[8px] font-black text-white uppercase tracking-widest italic">SEO TIP</span>
                                      </div>
                                      <p className="text-[9px] text-slate-600 font-medium leading-relaxed italic">
                                         Les données structurées favorisent les étoiles dans les résultats de recherche, augmentant le CTR de 30% en moyenne.
                                      </p>
                                   </div>
                                </div>
                             </div>
                          </div>
                        ) : null}
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
