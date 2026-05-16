import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Instagram, 
  Music2, 
  Pin, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  ShoppingBag,
  Zap,
  ArrowRight,
  Monitor,
  Filter,
  Tags,
  ChevronDown
} from 'lucide-react';
import { wpFetch } from '../lib/wordpress';
import { WPConfig, WPProduct, WPCategory } from '../types';
import { generateSocialPosts } from '../lib/gemini';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function SocialAutomatorView({ config }: { config: WPConfig }) {
  const [products, setProducts] = useState<WPProduct[]>([]);
  const [categories, setCategories] = useState<WPCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<WPProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState<any | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const data = await wpFetch(config, '/wc/v3/products/categories', 'GET', null, { per_page: 100, hide_empty: true });
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 20, orderby: 'date', order: 'desc' };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const data = await wpFetch(config, '/wc/v3/products', 'GET', null, params);
      if (Array.isArray(data)) {
        setProducts(data);
        if (data.length > 0 && !selectedProduct) setSelectedProduct(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [config.url]);

  useEffect(() => {
    fetchProducts();
  }, [config.url, selectedCategory]);

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setIsGenerating(true);
    try {
      const res = await generateSocialPosts({
        name: selectedProduct.name,
        description: selectedProduct.description.replace(/<[^>]*>/g, ''),
        price: `${selectedProduct.price} ${config.currency || '€'}`
      }, config.geminiApiKey);
      setPosts(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[3rem] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center shadow-xl shadow-indigo-900/10">
            <Share2 className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Nexus Social Automator</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Monitor className="w-3 h-3 text-indigo-400" /> Viralité Organique & Multi-Channel
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Product Selector */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col h-[700px]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Sélectionner un Produit
            </h3>

            {/* Category Filter */}
            <div className="mb-6 space-y-3 shrink-0">
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1">
                <Filter className="w-3 h-3" /> Filtrer par catégorie
              </div>
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    setSelectedCategory(val);
                    setProducts([]); // Clear list for visual feedback
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold text-slate-300 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 transition-all pr-10"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.count})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-slate-400 transition-colors">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-8">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-950/20 border border-slate-900 p-4 rounded-2xl animate-pulse">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-slate-900 rounded w-24" />
                      <div className="h-2 bg-slate-900 rounded w-12" />
                    </div>
                  </div>
                ))
              ) : products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl">
                  <Tags className="w-8 h-8 text-slate-700 mb-3" />
                  <p className="text-[9px] font-black text-slate-600 uppercase">Aucun produit trouvé</p>
                  <button 
                    onClick={fetchProducts}
                    className="mt-4 text-[8px] font-black italic text-indigo-400 uppercase tracking-widest hover:text-indigo-300"
                  >
                    Réessayer
                  </button>
                </div>
              ) : products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProduct(p); setPosts(null); }}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left transition-all group flex items-center gap-4",
                    selectedProduct?.id === p.id 
                      ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/20" 
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-600"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0].src} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-tight truncate",
                      selectedProduct?.id === p.id ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    )}>{p.name}</p>
                    <p className={cn(
                      "text-[8px] font-bold uppercase",
                      selectedProduct?.id === p.id ? "text-indigo-200" : "text-slate-500"
                    )}>{p.price} {config.currency}</p>
                  </div>
                  <ArrowRight className={cn(
                    "w-4 h-4 shrink-0 transition-transform",
                    selectedProduct?.id === p.id ? "text-white" : "text-slate-800 group-hover:translate-x-1"
                  )} />
                </button>
              ))}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!selectedProduct || isGenerating}
              className="w-full mt-8 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isGenerating ? "Transformation IA..." : "GÉNÉRER LES POSTS"}
            </button>
          </div>
        </div>

        {/* Right: Posts Preview */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           <AnimatePresence mode="wait">
             {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                     <Share2 className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Recalibrage Sémantique</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[15rem]">
                    Nexus analyse le produit pour extraire les hooks viraux adaptés à chaque plateforme...
                  </p>
                </motion.div>
             ) : posts ? (
               <motion.div 
                 key="results"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="grid grid-cols-1 gap-6"
               >
                 {/* Instagram */}
                 <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-8 group">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500 rounded-xl">
                             <Instagram className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">Post Instagram</h4>
                       </div>
                       <button 
                         onClick={() => copyToClipboard(`${posts.instagram.caption}\n\n${posts.instagram.hashtags.join(' ')}`, 'ig')}
                         className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"
                       >
                         {copied === 'ig' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                       </button>
                    </div>
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
                       <p className="text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">{posts.instagram.caption}</p>
                       <div className="flex flex-wrap gap-2">
                          {posts.instagram.hashtags.map((h: string, i: number) => (
                            <span key={i} className="text-[10px] font-black text-indigo-400">{h}</span>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TikTok */}
                    <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-8">
                       <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                             <div className="p-3 bg-black border border-slate-800 rounded-xl">
                                <Music2 className="w-5 h-5 text-white" />
                             </div>
                             <h4 className="text-xs font-black text-white uppercase tracking-widest">TikTok Script</h4>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(`Hook: ${posts.tiktok.hook}\nScript: ${posts.tiktok.script}`, 'tk')}
                            className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"
                          >
                            {copied === 'tk' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                       </div>
                       <div className="space-y-4">
                          <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                             <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Démarrage (Hook)</p>
                             <p className="text-xs font-black text-white tracking-tight uppercase italic">"{posts.tiktok.hook}"</p>
                          </div>
                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                             <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Script</p>
                             <p className="text-xs text-slate-400 leading-relaxed">{posts.tiktok.script}</p>
                          </div>
                       </div>
                    </div>

                    {/* Pinterest */}
                    <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-8">
                       <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                             <div className="p-3 bg-red-600 rounded-xl">
                                <Pin className="w-5 h-5 text-white" />
                             </div>
                             <h4 className="text-xs font-black text-white uppercase tracking-widest">Pinterest Pin</h4>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(`Title: ${posts.pinterest.title}\nDesc: ${posts.pinterest.description}`, 'pin')}
                            className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"
                          >
                            {copied === 'pin' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                       </div>
                       <div className="space-y-4">
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                             <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Titre Opti SEO</p>
                             <p className="text-sm font-black text-white uppercase tracking-tighter">{posts.pinterest.title}</p>
                          </div>
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                             <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Description Epic</p>
                             <p className="text-xs text-slate-400 leading-relaxed italic">"{posts.pinterest.description}"</p>
                          </div>
                       </div>
                    </div>
                 </div>
               </motion.div>
             ) : (
                <div className="flex-1 bg-slate-900/10 border border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center text-slate-600">
                  <Share2 className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Sélectionnez un produit et lancez Nexus pour générer le contenu social</p>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
