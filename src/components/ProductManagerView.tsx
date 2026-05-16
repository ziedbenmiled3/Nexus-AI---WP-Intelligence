import React, { useState, useEffect, useMemo } from 'react';
import { 
   Search, 
   Filter, 
   RefreshCw, 
   Loader2, 
   Plus, 
   Tag, 
   Zap, 
   BrainCircuit, 
   Sparkles, 
   AlertCircle, 
   MoreHorizontal, 
   ChevronDown,
   Package,
   Eye,
   Edit3,
   Trash2,
   TrendingUp,
   Percent,
   BarChart3,
   Flame,
   X,
   ExternalLink,
   ShieldCheck,
   Calculator,
   Dices,
   Calendar,
   XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
   AreaChart, 
   Area, 
   XAxis, 
   YAxis, 
   Tooltip, 
   ResponsiveContainer, 
   CartesianGrid 
} from 'recharts';
import { WPConfig } from '../types';
import { wpFetch } from '../lib/wordpress';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';

interface Props {
  config: WPConfig;
}

export default function ProductManagerView({ config }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currency, setCurrency] = useState(() => localStorage.getItem('app_currency') || '€');
  const [orders, setOrders] = useState<any[]>([]);
  const [promoStats, setPromoStats] = useState({
    totalRevenue: 0,
    promoRevenue: 0,
    totalOrders: 0,
    discountApplied: 0,
    chartData: [] as any[]
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatus, setStockStatus] = useState<string>('all');
  const [promoFilter, setPromoFilter] = useState<'all' | 'on_sale'>('all');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [status, setStatusState] = useState<{
    updatingId: number | null;
    isDeleting: number | null;
    variationsMap: Record<number, any[]>;
    expandedVariationId: number | null;
    variationUpdatingId: number | null;
  }>({
    updatingId: null,
    isDeleting: null,
    variationsMap: {},
    expandedVariationId: null,
    variationUpdatingId: null
  });
  
  const { updatingId, isDeleting, variationsMap, expandedVariationId, variationUpdatingId } = status;

  const setStatus = (newStatus: Partial<typeof status>) => {
    setStatusState(prev => ({ ...prev, ...newStatus }));
  };
  
  // Promotion Manual State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoProduct, setPromoProduct] = useState<any | null>(null);
  const [promoType, setPromoType] = useState<'percent' | 'fixed'>('percent');
  const [promoValue, setPromoValue] = useState<string>("");
  const [promoDateStart, setPromoDateStart] = useState("");
  const [promoDateEnd, setPromoDateEnd] = useState("");

  // AI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Bulk Promotion State
  const [isBulkPromoModalOpen, setIsBulkPromoModalOpen] = useState(false);
  const [bulkPromoType, setBulkPromoType] = useState<'percent' | 'fixed'>('percent');
  const [bulkPromoValue, setBulkPromoValue] = useState("");
  const [bulkDateStart, setBulkDateStart] = useState("");
  const [bulkDateEnd, setBulkDateEnd] = useState("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmRemovePromoId, setConfirmRemovePromoId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setProducts([]);
    setOrders([]);
    
    try {
      // Sequential fetching to avoid overloading the site
      const productsData = await wpFetch(config, '/wc/v3/products', 'GET', null, { per_page: 100, status: 'any' });
      const categoriesData = await wpFetch(config, '/wc/v3/products/categories', 'GET', null, { per_page: 100 }).catch(() => []);
      const settingsData = await wpFetch(config, '/wc/v3/settings/general', 'GET').catch(() => null);
      const ordersData = await wpFetch(config, '/wc/v3/orders', 'GET', null, { per_page: 50 }).catch(() => []);
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      // Calculate Stats
      if (Array.isArray(ordersData)) {
        let totalRev = 0;
        let promoRev = 0;
        let discountTotal = 0;
        
        ordersData.forEach((order: any) => {
          const total = parseFloat(order.total);
          totalRev += total;
          
          order.line_items.forEach((item: any) => {
            if (item.subtotal !== item.total) { // Item has a discount
               promoRev += parseFloat(item.total);
               discountTotal += (parseFloat(item.subtotal) - parseFloat(item.total));
            }
          });
        });

        // Generate semi-real chart data for the last 7 days
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const chartData = days.map((day, i) => {
          const daySales = (totalRev / 7) * (0.8 + Math.random() * 0.4);
          return {
            name: day,
            sales: Math.round(daySales),
            isFlash: i % 3 === 0
          };
        });

        setPromoStats({
          totalRevenue: totalRev,
          promoRevenue: promoRev,
          totalOrders: ordersData.length,
          discountApplied: discountTotal,
          chartData: chartData
        });
      }

      if (Array.isArray(settingsData)) {
        const currencySetting = settingsData.find(s => s.id === 'woocommerce_currency');
        if (currencySetting?.value) {
          const currencyMap: Record<string, string> = { 'TND': 'DT', 'EUR': '€', 'USD': '$' };
          setCurrency(currencyMap[currencySetting.value] || currencySetting.value);
        }
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Product manager fetch failed:", err);
      setError("Délai de synchronisation dépassé. Veuillez réessayer dans quelques instants.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [config.url]);

  const loadVariations = async (productId: number) => {
    if (variationsMap[productId]) {
      setStatus({ expandedVariationId: expandedVariationId === productId ? null : productId });
      return;
    }

    setStatus({ variationUpdatingId: productId });
    try {
      const data = await wpFetch(config, `/wc/v3/products/${productId}/variations`, 'GET', null, { per_page: 100 });
      setStatus({ 
        variationsMap: { ...status.variationsMap, [productId]: Array.isArray(data) ? data : [] },
        expandedVariationId: productId,
        variationUpdatingId: null
      });
    } catch (err) {
      console.error("Error loading variations:", err);
      setStatus({ variationUpdatingId: null });
    }
  };

  const handleUpdateVariationStock = async (productId: number, variationId: number, newStock: number) => {
    setStatus({ variationUpdatingId: variationId });
    try {
      await wpFetch(config, `/wc/v3/products/${productId}/variations/${variationId}`, 'PUT', {
        stock_quantity: newStock,
        manage_stock: true
      });
      
      // Update local variations map
      const updatedVariations = variationsMap[productId].map((v: any) => 
        v.id === variationId ? { ...v, stock_quantity: newStock, stock_status: newStock > 0 ? 'instock' : 'outofstock' } : v
      );
      
      // Calculate new total stock for parent
      const totalStock = updatedVariations.reduce((sum, v) => sum + (parseInt(v.stock_quantity) || 0), 0);
      
      setStatus({ 
        variationsMap: { ...variationsMap, [productId]: updatedVariations },
        variationUpdatingId: null
      });

      // Update parent level in local products
      setProducts(prev => prev.map(p => 
        p.id === productId ? { 
          ...p, 
          stock_quantity: totalStock,
          stock_status: totalStock > 0 ? 'instock' : 'outofstock'
        } : p
      ));
    } catch (err: any) {
      console.error("Error updating variation stock:", err);
      setError(`Erreur stock : ${err.message || "Action impossible"}`);
      setTimeout(() => setError(null), 5000);
      setStatus({ variationUpdatingId: null });
    }
  };
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())));
    }
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categories?.some((c: any) => c.slug === selectedCategory));
    }
    if (stockStatus !== 'all') {
      result = result.filter(p => p.stock_status === stockStatus);
    }
    if (promoFilter === 'on_sale') {
      result = result.filter(p => p.on_sale);
    }
    return result;
  }, [products, search, selectedCategory, stockStatus, promoFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAiAdvice = async (type: 'flash' | 'auto' | 'advice') => {
    setIsGenerating(true);
    setShowAiModal(true);
    setAiResponse("");

    try {
      const productData = products.slice(0, 30).map(p => ({
        name: p.name,
        price: p.price,
        sales: p.total_sales,
        stock: p.stock_quantity,
        status: p.stock_status
      }));

      let prompt = "";
      if (type === 'flash') {
        prompt = `Analyse mes produits et suggère 3 "Ventes Flash" percutantes pour booster le cash-flow aujourd'hui. Choisis des produits avec du stock mais peu de ventes. Propose un % de remise et une accroche marketing. Monnaie du site: ${currency}. Data: ${JSON.stringify(productData)}`;
      } else if (type === 'auto') {
        prompt = `Génère une stratégie de promotion automatique pour les 7 prochains jours. Quels produits mettre en avant ? Quelle remise ? Pourquoi ? Monnaie du site: ${currency}. Data: ${JSON.stringify(productData)}`;
      } else {
        prompt = `Analyse globale de mon catalogue produits. Quels sont les points faibles ? Comment améliorer la conversion sur mes fiches produits ? Monnaie du site: ${currency}. Data: ${JSON.stringify(productData)}`;
      }

      const res = await api.post('/api/gemini', {
        model: "gemini-flash-latest",
        prompt,
        systemInstruction: "Tu es un expert Growth Hacker e-commerce."
      });

      setAiResponse(res.data.text || "Désolé, je sèche...");
    } catch (err: any) {
      console.error("AI Error:", err);
      setAiResponse(`Erreur AI: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyWhatIf = async (product: any) => {
    if (!product) return;
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const prompt = `
        PRODUIT : ${product.name}
        PRIX ACTUEL : ${product.price} ${currency}
        STOCK : ${product.stock_quantity || 0}
        VENTES TOTALES : ${product.total_sales || 0}
        CATÉGORIES : ${product.categories?.map((c: any) => c.name).join(', ')}

        Analyze en tant qu'expert Pricing Strategy & Revenue Management.
        Génère 2 scénarios prédictifs "What-If" :
        
        ### Scénario 1 : Optimisation de la Conversion (Baisse de prix -15%)
        - Calcule l'augmentation probable du volume de ventes (Elasticité prix).
        - Estime l'impact sur la marge brute.
        - Donne un score Nexus de faisabilité (0-100).

        ### Scénario 2 : Augmentation du Panier Moyen (Offre Bundle)
        - Propose une offre type "3 pour le prix de 2" ou bundle complémentaire.
        - Estime l'augmentation du AOV (Average Order Value).

        Réponds avec un ton professionnel, analytique mais percutant. 
        Format : Markdown élégant. 
        Langue : Français.
        Inclus une section finale "RECOMMANDATION NEXUS" très claire.
      `;

      const res = await api.post('/api/gemini', {
        model: "gemini-flash-latest",
        prompt,
        systemInstruction: "Tu es un expert en stratégie de prix e-commerce."
      });

      setSimulationResult(res.data.text || "Erreur de simulation");
    } catch (err: any) {
      console.error("AI Simulation Error:", err);
      setSimulationResult(`Erreur Simulation: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRemovePromotion = async (product: any) => {
    setStatus({ updatingId: product.id });
    
    try {
      // Pour annuler une promo, on remet le prix promo à vide et on vide les dates.
      await wpFetch(config, `/wc/v3/products/${product.id}`, 'PUT', {
        sale_price: "",
        date_on_sale_from: null,
        date_on_sale_to: null,
        regular_price: product.regular_price
      });
      
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { 
          ...p, 
          sale_price: "", 
          on_sale: false, 
          price: p.regular_price,
          date_on_sale_from: null,
          date_on_sale_to: null
        } : p
      ));
    } catch (err: any) {
      console.error("Remove promotion error:", err);
      const msg = err.response?.data?.message || err.message || "Erreur inconnue";
      setError(`Erreur promo: ${msg}`);
      setTimeout(() => setError(null), 8000);
    } finally {
      setStatus({ updatingId: null });
    }
  };

  const handleDeleteProduct = async (product: any) => {
    if (!confirm(`Voulez-vous vraiment supprimer le produit "${product.name}" ? Cette action est irréversible.`)) {
      return;
    }

    setStatus({ isDeleting: product.id });
    try {
      await wpFetch(config, `/wc/v3/products/${product.id}`, 'DELETE', null, { force: true });
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err: any) {
      console.error("Delete product error:", err);
      const msg = err.response?.data?.message || err.message || "Erreur inconnue";
      setError(`Erreur suppression: ${msg}`);
      setTimeout(() => setError(null), 8000);
    } finally {
      setStatus({ isDeleting: null });
    }
  };

  const handleApplyPromotion = async () => {
    if (!promoProduct || !promoValue) return;
    
    const value = parseFloat(promoValue);
    if (isNaN(value) || value <= 0) {
      setError("Veuillez entrer un montant ou pourcentage valide.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    const regularPrice = parseFloat(promoProduct.regular_price);
    let salePrice = 0;

    if (promoType === 'percent') {
      salePrice = regularPrice * (1 - value / 100);
    } else {
      salePrice = regularPrice - value;
    }

    if (salePrice <= 0) {
      setError("Le prix soldé ne peut pas être inférieur ou égal à 0.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Round to 2 decimals
    const finalSalePrice = Math.round(salePrice * 100) / 100;

    setStatus({ updatingId: promoProduct.id });
    try {
      await wpFetch(config, `/wc/v3/products/${promoProduct.id}`, 'PUT', {
        sale_price: finalSalePrice.toString(),
        date_on_sale_from: promoDateStart ? `${promoDateStart}T00:00:00` : null,
        date_on_sale_to: promoDateEnd ? `${promoDateEnd}T23:59:59` : null
      });
      
      setProducts(prev => prev.map(p => 
        p.id === promoProduct.id ? { 
          ...p, 
          sale_price: finalSalePrice.toString(), 
          on_sale: true, 
          price: finalSalePrice.toString(),
          date_on_sale_from: promoDateStart || null,
          date_on_sale_to: promoDateEnd || null
        } : p
      ));
      setIsPromoModalOpen(false);
      setPromoValue("");
      setPromoDateStart("");
      setPromoDateEnd("");
    } catch (err: any) {
      console.error("Apply promotion error:", err);
      setError(`Erreur promo: ${err.message || 'Échec de la mise à jour'}`);
      setTimeout(() => setError(null), 8000);
    } finally {
      setStatus({ updatingId: null });
    }
  };

  const handleApplyBulkPromotion = async () => {
    if (!bulkPromoValue || selectedIds.length === 0) return;
    
    const value = parseFloat(bulkPromoValue);
    if (isNaN(value) || value <= 0) {
      setError("Veuillez entrer une valeur de promotion valide.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setIsBulkUpdating(true);
    let successCount = 0;
    
    try {
      for (const id of selectedIds) {
        const product = products.find(p => p.id === id);
        if (!product) continue;

        const regularPrice = parseFloat(product.regular_price);
        if (isNaN(regularPrice)) continue;

        let salePrice = 0;
        if (bulkPromoType === 'percent') {
          salePrice = regularPrice * (1 - value / 100);
        } else {
          salePrice = regularPrice - value;
        }

        if (salePrice <= 0) continue;
        const finalSalePrice = (Math.round(salePrice * 100) / 100).toString();

        await wpFetch(config, `/wc/v3/products/${id}`, 'PUT', {
          sale_price: finalSalePrice,
          date_on_sale_from: bulkDateStart ? `${bulkDateStart}T00:00:00` : null,
          date_on_sale_to: bulkDateEnd ? `${bulkDateEnd}T23:59:59` : null
        });
        successCount++;
      }
      
      setError(`${successCount} produits mis à jour avec succès.`);
      setTimeout(() => setError(null), 5000);
      setIsBulkPromoModalOpen(false);
      setSelectedIds([]);
      fetchData(); // Refresh all
    } catch (err: any) {
      setError(`Erreur lors de la mise à jour groupée : ${err.message || "Partielle failure"}`);
      setTimeout(() => setError(null), 8000);
      fetchData();
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Voulez-vous supprimer les ${selectedIds.length} produits sélectionnés ?`)) return;
    
    setLoading(true);
    try {
      // In a real app we'd use batch, but for now sequential is safer with proxy
      for (const id of selectedIds) {
        await wpFetch(config, `/wc/v3/products/${id}`, 'DELETE', null, { force: true });
      }
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err: any) {
      setError(`Erreur lors de la suppression groupée : ${err.message || "Échec"}`);
      setTimeout(() => setError(null), 8000);
      fetchData(); // Refresh to be safe
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-xs font-black text-red-500 uppercase tracking-widest">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[3rem]">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
               <Tag className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
               <h1 className="text-3xl font-black text-white tracking-tight uppercase">Gestion des Produits</h1>
               <p className="text-slate-500 font-medium text-xs tracking-[0.2em] uppercase">Gérez vos prix, stocks et stratégies de vente par IA</p>
            </div>
         </div>
         
         <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => handleAiAdvice('flash')}
              className="px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
               <Zap className="w-4 h-4" />
               Flash Sales (IA)
            </button>
            <button 
              onClick={() => handleAiAdvice('auto')}
              className="px-5 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-purple-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
               <Sparkles className="w-4 h-4" />
               Auto-Promos (IA)
            </button>
            <button 
              onClick={() => handleAiAdvice('advice')}
              className="px-5 py-3 bg-blue-500/10 hover:bg-blue-600/10 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
               <BrainCircuit className="w-4 h-4" />
               Conseils IA
            </button>
         </div>
      </div>

      {/* Performance Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[3rem] relative overflow-hidden group min-h-[400px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                     <TrendingUp className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                     <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Revenue Performance</h2>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest uppercase tracking-widest">Variation des ventes suite aux promotions</p>
                  </div>
               </div>
               
               <div className="text-right">
                  <span className="text-3xl font-black text-white tracking-tighter">{promoStats.totalRevenue.toLocaleString()} {currency}</span>
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Latest Batch</p>
               </div>
            </div>

            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={promoStats.chartData.length > 0 ? promoStats.chartData : [
                     { name: 'Lun', sales: 0 },
                     { name: 'Mar', sales: 0 },
                     { name: 'Mer', sales: 0 },
                     { name: 'Jeu', sales: 0 },
                     { name: 'Ven', sales: 0 },
                     { name: 'Sam', sales: 0 },
                     { name: 'Dim', sales: 0 },
                  ]}>
                     <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                        dy={10}
                     />
                     <Tooltip 
                        contentStyle={{ 
                           backgroundColor: '#0f172a', 
                           border: '1px solid #1e293b', 
                           borderRadius: '12px',
                           fontSize: '10px',
                           fontWeight: 'bold',
                           color: '#fff'
                        }}
                        itemStyle={{ color: '#818cf8' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#6366f1" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        animationDuration={2000}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[3rem] flex flex-col justify-between group overflow-hidden relative">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-emerald-400" />
               </div>
               <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Promo Impact</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Conversion Insights</p>
               </div>
            </div>
            
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                     <span>Total Orders</span>
                     <span>{promoStats.totalOrders}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((promoStats.totalOrders / 100) * 100, 100)}%` }}
                        className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                     />
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                     <span>Sale Discounts Applied</span>
                     <span className="text-amber-500">{promoStats.discountApplied.toLocaleString()} {currency}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((promoStats.discountApplied / 1000) * 100, 100)}%` }}
                        className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                     />
                  </div>
               </div>

               <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                     Pro Tip: Promotions currently represent approx. <span className="text-white font-black">{promoStats.totalRevenue > 0 ? ((promoStats.promoRevenue / promoStats.totalRevenue) * 100).toFixed(1) : 0}%</span> of your total revenue.
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <div className="bg-[#0a0c10] border border-slate-800/60 p-8 rounded-[3rem]">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-400" />
               </div>
               <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Best Selling Products</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Leaderboard</p>
               </div>
            </div>

            {loading ? (
               <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
               </div>
            ) : orders.length === 0 ? (
               <div className="py-12 text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No sales data recorded for the selected period</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Extract best sellers from orders */}
                  {(() => {
                     const itemCounts: Record<string, { count: number, name: string, total: number }> = {};
                     orders.forEach(o => o.line_items.forEach((li: any) => {
                        if (!itemCounts[li.product_id]) {
                           itemCounts[li.product_id] = { count: 0, name: li.name, total: 0 };
                        }
                        itemCounts[li.product_id].count += li.quantity;
                        itemCounts[li.product_id].total += parseFloat(li.total);
                     }));
                     
                     return Object.entries(itemCounts)
                        .sort((a, b) => b[1].count - a[1].count)
                        .slice(0, 6)
                        .map(([id, data]) => (
                           <div key={id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600">
                                    #{id.slice(-2)}
                                 </div>
                                 <div>
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider truncate max-w-[120px]">{data.name}</h4>
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{data.count} Ventes</span>
                                 </div>
                              </div>
                              <span className="text-xs font-black text-white">{data.total.toLocaleString()} {currency}</span>
                           </div>
                        ));
                  })()}
               </div>
            )}
         </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#0d0f14] border border-slate-800/60 rounded-[3rem] overflow-hidden flex flex-col">
         {/* Filter Bar */}
         <div className="p-6 border-b border-slate-800/80 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[250px] relative">
               <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
               <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un produit..." 
                  className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 transition-all"
               />
            </div>
            
            <div className="relative">
               <Filter className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
               <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-slate-900/40 border border-slate-800/80 rounded-2xl py-4 pl-14 pr-12 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/30 transition-all cursor-pointer min-w-[200px]"
               >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(cat => (
                     <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
               </select>
               <ChevronDown className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative">
               <Package className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
               <select 
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="appearance-none bg-slate-900/40 border border-slate-800/80 rounded-2xl py-4 pl-14 pr-12 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/30 transition-all cursor-pointer min-w-[180px]"
               >
                  <option value="all">Tous les stocks</option>
                  <option value="instock">En stock</option>
                  <option value="outofstock">En rupture</option>
                  <option value="onbackorder">En réappro</option>
               </select>
               <ChevronDown className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative">
               <Percent className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
               <select 
                  value={promoFilter}
                  onChange={(e) => setPromoFilter(e.target.value as any)}
                  className="appearance-none bg-slate-900/40 border border-slate-800/80 rounded-2xl py-4 pl-14 pr-12 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/30 transition-all cursor-pointer min-w-[150px]"
               >
                  <option value="all">Tous les prix</option>
                  <option value="on_sale">En promotion</option>
               </select>
               <ChevronDown className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4">
               {filteredProducts.length} PRODUITS
            </div>
         </div>

         {/* Product Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/10">
                     <th className="px-8 py-6 w-12">
                        <input 
                           type="checkbox" 
                           checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                           onChange={toggleSelectAll}
                           className="w-4 h-4 rounded-lg bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                        />
                     </th>
                     <th className="px-6 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Produit</th>
                     <th className="px-6 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Catégorie</th>
                     <th className="px-6 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">État du Stock</th>
                     <th className="px-6 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">Prix Régulier</th>
                     <th className="px-6 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">En Promo</th>
                     <th className="px-6 py-6 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/40">
                  {loading ? (
                     <tr>
                        <td colSpan={7} className="py-20 text-center">
                           <div className="flex flex-col items-center gap-4">
                              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Récupération du catalogue...</p>
                           </div>
                        </td>
                     </tr>
                  ) : filteredProducts.length === 0 ? (
                     <tr>
                        <td colSpan={7} className="py-20 text-center">
                           <div className="flex flex-col items-center gap-6">
                              <Search className="w-16 h-16 text-slate-800" />
                              <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Aucun produit ne correspond à votre recherche ou catégorie.</p>
                           </div>
                        </td>
                     </tr>
                  ) : filteredProducts.map((product) => (
                     <React.Fragment key={product.id}>
                        <tr className="hover:bg-slate-800/20 transition-all group">
                        <td className="px-8 py-5">
                           <input 
                              type="checkbox" 
                              checked={selectedIds.includes(product.id)}
                              onChange={() => toggleSelect(product.id)}
                              className="w-4 h-4 rounded-lg bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                           />
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4 min-w-[200px]">
                              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 group-hover:border-indigo-500/30 transition-colors">
                                 {product.images?.[0]?.src ? (
                                    <img src={product.images[0].src} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                       <Package className="w-5 h-5" />
                                    </div>
                                 )}
                              </div>
                              <div className="min-w-0">
                                 <h4 className="text-sm font-black text-white uppercase tracking-wider truncate mb-1">{product.name}</h4>
                                 <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">SKU: {product.sku || '---'}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-wrap gap-1">
                              {product.categories?.slice(0, 2).map((c: any) => (
                                 <span key={c.id} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-black text-slate-500 uppercase">{c.name}</span>
                              ))}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              product.stock_status === 'instock' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                           }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                 product.stock_status === 'instock' ? 'bg-emerald-500' : 'bg-red-500'
                              }`} />
                              {product.type === 'variable' ? (
                                 <button 
                                   onClick={() => loadVariations(product.id)}
                                   className="flex items-center gap-2 hover:text-white transition-colors"
                                 >
                                   <span>VARIABLE</span>
                                   {variationUpdatingId === product.id ? (
                                     <Loader2 className="w-3 h-3 animate-spin" />
                                   ) : (
                                     <ChevronDown className={`w-3 h-3 transition-transform ${expandedVariationId === product.id ? 'rotate-180' : ''}`} />
                                   )}
                                 </button>
                              ) : product.manage_stock === false ? (
                                 'STOCK OK'
                              ) : (
                                 product.stock_status === 'instock' ? `${product.stock_quantity ?? 0} EN STOCK` : 'RUPTURE'
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-xs font-black text-white">
                              {product.price ? `${product.price} ${currency}` : (product.regular_price ? `${product.regular_price} ${currency}` : '---')}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                           {product.on_sale && product.sale_price ? (
                              <div className="inline-flex items-center gap-1.5 text-amber-400 font-black text-xs">
                                 <Percent className="w-3.5 h-3.5" />
                                 {product.sale_price} {currency}
                              </div>
                           ) : (
                              <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">Non</span>
                           )}
                        </td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                 onClick={() => {
                                    setSelectedProduct(product);
                                    handleApplyWhatIf(product);
                                 }}
                                 disabled={isSimulating && selectedProduct?.id === product.id}
                                 title="Simulation What-If (IA)"
                                 className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all active:scale-95 disabled:opacity-50"
                              >
                                 {isSimulating && selectedProduct?.id === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                              </button>
                              <button 
                                 onClick={() => setSelectedProduct(product)}
                                 title="Visualiser"
                                 className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-95"
                              >
                                 <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                 title="Modifier dans WooCommerce"
                                 onClick={() => window.open(product.permalink, '_blank')}
                                 className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95"
                              >
                                 <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                 onClick={() => {
                                    setPromoProduct(product);
                                    setIsPromoModalOpen(true);
                                  }}
                                 title="Ajouter une promotion"
                                 className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all active:scale-95"
                              >
                                 <Plus className="w-4 h-4" />
                              </button>
                              <button 
                                 onClick={() => handleRemovePromotion(product)}
                                 disabled={updatingId === product.id || !(product.on_sale && product.sale_price)}
                                 title="Supprimer la promotion"
                                 className={`p-2.5 rounded-xl border transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed ${
                                    (product.on_sale && product.sale_price)
                                       ? 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-amber-500 hover:border-amber-500/30' 
                                       : 'bg-slate-900/10 border-transparent text-slate-800/40 opacity-30 shadow-none pointer-events-none'
                                 }`}
                              >
                                 {updatingId === product.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                 ) : (
                                    <XCircle className="w-4 h-4" />
                                 )}
                              </button>
                              <button 
                                 onClick={() => handleDeleteProduct(product)}
                                 disabled={isDeleting === product.id}
                                 title="Supprimer le produit"
                                 className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-95 disabled:opacity-50"
                              >
                                 {isDeleting === product.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                 ) : (
                                    <Trash2 className="w-4 h-4" />
                                 )}
                              </button>
                           </div>
                        </td>
                     </tr>
                     
                     <AnimatePresence>
                        {expandedVariationId === product.id && variationsMap[product.id] && (
                           <motion.tr 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             exit={{ opacity: 0, height: 0 }}
                             className="bg-slate-900/10"
                           >
                             <td colSpan={7} className="px-8 py-0">
                                <div className="py-6 space-y-4">
                                   <div className="flex items-center gap-2 mb-4">
                                      <div className="h-px flex-1 bg-slate-800" />
                                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest px-4">Gestion des Variantes</span>
                                      <div className="h-px flex-1 bg-slate-800" />
                                   </div>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {variationsMap[product.id].map((variation: any) => (
                                         <div key={variation.id} className="p-4 bg-[#0a0c10] border border-slate-800 rounded-2xl flex items-center justify-between group/var hover:border-indigo-500/30 transition-all">
                                            <div className="flex items-center gap-3">
                                               <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                                                  {variation.image?.src ? (
                                                     <img src={variation.image.src} alt="" className="w-full h-full object-cover" />
                                                  ) : (
                                                     <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                        <Package className="w-4 h-4" />
                                                     </div>
                                                  )}
                                               </div>
                                               <div>
                                                  <h5 className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">
                                                     {variation.attributes?.map((a: any) => a.option).join(' / ') || 'Variante'}
                                                  </h5>
                                                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">SKU: {variation.sku || '---'}</span>
                                               </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                               <div className="flex flex-col items-end">
                                                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Stock</span>
                                                  <div className="flex items-center gap-2">
                                                     <input 
                                                        type="number" 
                                                        defaultValue={variation.stock_quantity || 0}
                                                        onBlur={(e) => {
                                                          const val = parseInt(e.target.value);
                                                          if (val !== variation.stock_quantity) {
                                                            handleUpdateVariationStock(product.id, variation.id, val);
                                                          }
                                                        }}
                                                        className="w-16 bg-slate-900/50 border border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold text-white text-center focus:outline-none focus:border-indigo-500/50 transition-all"
                                                     />
                                                     {variationUpdatingId === variation.id && (
                                                       <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                                                     )}
                                                  </div>
                                               </div>
                                               <div className="flex flex-col items-end">
                                                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Prix</span>
                                                  <span className="text-[10px] font-black text-white">{variation.price} {currency}</span>
                                               </div>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             </td>
                           </motion.tr>
                        )}
                     </AnimatePresence>
                  </React.Fragment>
               ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
         {selectedIds.length > 0 && (
            <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 50, opacity: 0 }}
               className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] bg-indigo-600 border border-indigo-500 shadow-[0_20px_50px_rgba(79,70,229,0.4)] px-10 py-6 rounded-[2.5rem] flex items-center gap-10"
            >
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">Sélection</span>
                  <span className="text-xl font-black text-white leading-none">{selectedIds.length} <span className="text-indigo-200 text-sm">Produits</span></span>
               </div>
               <div className="h-10 w-px bg-indigo-500/50" />
               <div className="flex items-center gap-3">
                  <button 
                     onClick={() => setIsBulkPromoModalOpen(true)}
                     className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-amber-500/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10"
                  >
                     <Percent className="w-4 h-4" />
                     Promo
                  </button>
                  <button 
                     onClick={handleBulkDelete}
                     className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-red-500/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10"
                  >
                     <Trash2 className="w-4 h-4" />
                     Supprimer
                  </button>
                  <button 
                     onClick={() => setSelectedIds([])}
                     className="px-6 py-3 bg-indigo-700/50 hover:bg-indigo-700 text-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                     Annuler
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Detail Sidebar */}
      <AnimatePresence>
         {selectedProduct && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                     setSelectedProduct(null);
                     setSimulationResult(null);
                  }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210]"
               />
               <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0a0c10] border-l border-slate-800 z-[211] shadow-2xl overflow-hidden flex flex-col"
               >
                  {/* Header */}
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                           <Eye className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                           <h2 className="text-sm font-black text-white uppercase tracking-widest">Détails Produit</h2>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fiche Catalogue</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => {
                           setSelectedProduct(null);
                           setSimulationResult(null);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                     {/* Image & Main Info */}
                     <div className="flex gap-8">
                        <div className="w-48 h-48 rounded-[2rem] bg-slate-800 border border-slate-700 overflow-hidden shadow-inner flex-shrink-0">
                           {selectedProduct.images?.[0]?.src ? (
                              <img src={selectedProduct.images[0].src} alt="" className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                 <Package className="w-12 h-12" />
                              </div>
                           )}
                        </div>
                        <div className="flex flex-col justify-center">
                           <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight mb-2">{selectedProduct.name}</h3>
                           <p className="text-xs font-mono text-indigo-400 mb-4">{selectedProduct.sku || 'SANS SKU'}</p>
                           <div className="flex flex-wrap gap-2">
                              {selectedProduct.categories?.map((cat: any) => (
                                 <span key={cat.id} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.name}</span>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Stats Row */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Statut Stock</p>
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${selectedProduct.stock_status === 'instock' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                              <span className="text-xs font-black text-white uppercase">{selectedProduct.stock_status === 'instock' ? 'En Stock' : 'Rupture'}</span>
                           </div>
                        </div>
                        <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Quantité Réelle</p>
                           <span className="text-2xl font-black text-white">{selectedProduct.stock_quantity || 0}</span>
                        </div>
                     </div>

                     {/* Detailed Info */}
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <TrendingUp className="w-4 h-4 text-indigo-400" />
                           <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Performances & Seuil</p>
                        </div>
                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-500 uppercase tracking-widest">Prix de vente</span>
                              <span className="text-white">
                                 {selectedProduct.price ? `${selectedProduct.price} ${currency}` : (selectedProduct.regular_price ? `${selectedProduct.regular_price} ${currency}` : '---')}
                              </span>
                           </div>
                           <div className="h-px bg-slate-800" />
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-500 uppercase tracking-widest">Seuil Alerte (Low Stock)</span>
                              <span className="text-amber-400 font-black">{selectedProduct.low_stock_amount || 5} UNITÉS</span>
                           </div>
                           <div className="h-px bg-slate-800" />
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-500 uppercase tracking-widest">Ventes (Mois)</span>
                              <span className="text-indigo-400 font-black">{selectedProduct.total_sales || 0} UNITÉS</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <ShieldCheck className="w-4 h-4 text-emerald-400" />
                           <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Actions d'administration</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                           <a 
                              href={selectedProduct.permalink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-600/20 transition-all group"
                           >
                              <div className="flex items-center gap-3">
                                 <ExternalLink className="w-4 h-4 text-indigo-400" />
                                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Voir en boutique</span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-indigo-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                           </a>

                           <button 
                              onClick={() => handleApplyWhatIf(selectedProduct)}
                              disabled={isSimulating}
                              className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl hover:bg-amber-500/20 transition-all group mt-3"
                           >
                              <div className="flex items-center gap-3">
                                 {isSimulating ? (
                                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                 ) : (
                                    <Calculator className="w-4 h-4 text-amber-500" />
                                 )}
                                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Scénario What-If (IA)</span>
                              </div>
                              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                           </button>

                           <AnimatePresence>
                              {simulationResult && (
                                 <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-6 bg-[#0a0c10] border-2 border-amber-500/30 rounded-[2rem] mt-4 relative overflow-hidden shadow-2xl"
                                 >
                                    <div className="flex items-center gap-3 mb-6">
                                       <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                          <Sparkles className="w-4 h-4 text-amber-500" />
                                       </div>
                                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Analyse Prédictive Nexus</h4>
                                    </div>

                                    <div className="absolute top-0 right-0 p-4">
                                       <button onClick={() => setSimulationResult(null)}>
                                          <X className="w-4 h-4 text-slate-500 hover:text-white" />
                                       </button>
                                    </div>
                                    <div className="markdown-body prose prose-invert prose-xs max-w-none">
                                       <ReactMarkdown
                                          components={{
                                            h3: ({ children }) => <h3 className="text-sm font-black text-white uppercase tracking-tight mt-6 mb-3">{children}</h3>,
                                            p: ({ children }) => <p className="mb-4 text-slate-400 font-medium leading-relaxed">{children}</p>,
                                            ul: ({ children }) => <ul className="space-y-3 mb-4">{children}</ul>,
                                            li: ({ children }) => <li className="flex items-start gap-3 text-[11px] leading-relaxed text-slate-300 before:content-['▸'] before:text-amber-500 before:font-bold">{children}</li>,
                                            strong: ({ children }) => <strong className="font-black text-amber-500/90">{children}</strong>
                                          }}
                                        >
                                          {simulationResult}
                                        </ReactMarkdown>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                                       <button 
                                         onClick={() => {
                                           setSimulationResult(null);
                                           handleApplyWhatIf(selectedProduct);
                                         }}
                                         className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all hover:bg-slate-800"
                                       >
                                         Régénérer
                                       </button>
                                       <button 
                                         onClick={() => {
                                            setPromoProduct(selectedProduct);
                                            setIsPromoModalOpen(true);
                                         }}
                                         className="flex-[2] py-4 bg-amber-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(217,119,6,0.2)]"
                                       >
                                         <Percent className="w-4 h-4" />
                                         Lancer cette Promotion
                                       </button>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      {/* Bulk Promotion Management Modal */}
      <AnimatePresence>
         {isBulkPromoModalOpen && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsBulkPromoModalOpen(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-xl bg-[#0d0f14] border border-slate-800 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col"
               >
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                           <Flame className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-lg font-black text-white uppercase tracking-widest leading-none mb-1">Promotion Groupée</h2>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedIds.length} Produits Sélectionnés</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setIsBulkPromoModalOpen(false)}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de réduction</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                              onClick={() => setBulkPromoType('percent')}
                              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                 bulkPromoType === 'percent' 
                                 ? 'bg-amber-600 border-amber-500 text-white shadow-[0_10px_30px_rgba(245,158,11,0.3)]' 
                                 : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                              }`}
                           >
                              Pourcentage (%)
                           </button>
                           <button 
                              onClick={() => setBulkPromoType('fixed')}
                              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                 bulkPromoType === 'fixed' 
                                 ? 'bg-amber-600 border-amber-500 text-white shadow-[0_10px_30px_rgba(245,158,11,0.3)]' 
                                 : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                              }`}
                           >
                              Montant Fixe ({currency})
                           </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valeur de la réduction</label>
                        <div className="relative">
                           <input 
                              type="number"
                              value={bulkPromoValue}
                              onChange={(e) => setBulkPromoValue(e.target.value)}
                              placeholder={bulkPromoType === 'percent' ? "Ex: 25" : `Ex: 15 ${currency}`}
                              className="w-full bg-slate-900 border border-slate-800 rounded-3xl py-6 px-8 text-xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50 transition-all"
                           />
                           <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 font-black">
                              {bulkPromoType === 'percent' ? '%' : currency}
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              Date de début
                           </label>
                           <input 
                              type="date"
                              value={bulkDateStart}
                              onChange={(e) => setBulkDateStart(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              Date de fin
                           </label>
                           <input 
                              type="date"
                              value={bulkDateEnd}
                              onChange={(e) => setBulkDateEnd(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                           />
                        </div>
                     </div>

                     <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                           Nexus appliquera cette promotion sur le <span className="text-white">Prix Régulier</span> de chaque produit sélectionné. Les prix finaux seront arrondis à deux décimales.
                        </p>
                     </div>
                  </div>

                  <div className="p-8 border-t border-slate-800 bg-slate-900/5 flex gap-3">
                     <button 
                        onClick={() => setIsBulkPromoModalOpen(false)}
                        className="flex-1 py-5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-slate-800 transition-all"
                     >
                        Annuler
                     </button>
                     <button 
                        onClick={handleApplyBulkPromotion}
                        disabled={isBulkUpdating || !bulkPromoValue}
                        className="flex-[2] py-5 bg-amber-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(245,158,11,0.3)]"
                     >
                        {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Lancer la Promotion Groupée
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Promotion Management Modal */}
      <AnimatePresence>
         {isPromoModalOpen && promoProduct && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsPromoModalOpen(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-lg bg-[#0d0f14] border border-slate-800 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col"
               >
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                           <Percent className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-lg font-black text-white uppercase tracking-widest leading-none mb-1">Gérer la Promotion</h2>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manuel: {promoProduct.name}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setIsPromoModalOpen(false)}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-10 space-y-8">
                     <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Prix Actuel</span>
                           <span className="text-xl font-black text-white">{promoProduct.regular_price} {currency}</span>
                        </div>
                        <div className="h-10 w-px bg-slate-800" />
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-right">Sur le site</span>
                           <span className="text-sm font-bold text-slate-400">{promoProduct.on_sale ? "DÉJÀ EN PROMO" : "PRIX RÉGULIER"}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              Date de début
                           </label>
                           <input 
                              type="date"
                              value={promoDateStart}
                              onChange={(e) => setPromoDateStart(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              Date de fin
                           </label>
                           <input 
                              type="date"
                              value={promoDateEnd}
                              onChange={(e) => setPromoDateEnd(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de réduction</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                              onClick={() => setPromoType('percent')}
                              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                 promoType === 'percent' 
                                 ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]' 
                                 : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                              }`}
                           >
                              Pourcentage (%)
                           </button>
                           <button 
                              onClick={() => setPromoType('fixed')}
                              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                 promoType === 'fixed' 
                                 ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]' 
                                 : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                              }`}
                           >
                              Montant Fixe ({currency})
                           </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valeur de la réduction</label>
                        <div className="relative">
                           <input 
                              type="number"
                              value={promoValue}
                              onChange={(e) => setPromoValue(e.target.value)}
                              placeholder={promoType === 'percent' ? "Ex: 20" : `Ex: 10 ${currency}`}
                              className="w-full bg-slate-900 border border-slate-800 rounded-3xl py-6 px-8 text-xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                           />
                           <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 font-black">
                              {promoType === 'percent' ? '%' : currency}
                           </div>
                        </div>
                     </div>

                     {promoValue && !isNaN(parseFloat(promoValue)) && (
                        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Nouveau Prix Calculé</span>
                           <span className="text-lg font-black text-emerald-400">
                              {(() => {
                                 const reg = parseFloat(promoProduct.regular_price);
                                 const val = parseFloat(promoValue);
                                 let res = promoType === 'percent' ? reg * (1 - val / 100) : reg - val;
                                 return (Math.round(res * 100) / 100).toFixed(2);
                              })()} {currency}
                           </span>
                        </div>
                     )}
                  </div>

                  <div className="p-8 border-t border-slate-800 bg-slate-900/5 flex gap-3">
                     <button 
                        onClick={() => setIsPromoModalOpen(false)}
                        className="flex-1 py-5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-slate-800 transition-all"
                     >
                        Annuler
                     </button>
                     <button 
                        onClick={handleApplyPromotion}
                        disabled={updatingId === promoProduct.id || !promoValue}
                        className="flex-[2] py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                     >
                        {updatingId === promoProduct.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Appliquer la Promotion
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
      <AnimatePresence>
         {showAiModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAiModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-3xl max-h-[85vh] bg-[#0d0f14] border border-slate-800 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col"
               >
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                           <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                           <h2 className="text-lg font-black text-white uppercase tracking-widest leading-none mb-1">NEXUS AI GROWTH ENGINE</h2>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stratégies de Conversion Automatisées</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setShowAiModal(false)}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"
                     >
                        Fermer
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                     {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-8">
                           <div className="relative">
                              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                              <div className="absolute inset-0 blur-2xl bg-indigo-500/20 animate-pulse" />
                           </div>
                           <div className="text-center space-y-3">
                              <p className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Analyse des opportunités...</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nexus scanne votre catalogue et vos performances de vente</p>
                           </div>
                        </div>
                     ) : (
                        <div className="markdown-body prose prose-invert prose-indigo max-w-none text-slate-300">
                           <ReactMarkdown
                              components={{
                                 h1: ({ children }) => <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-10 mb-6 flex items-center gap-3"><Zap className="w-6 h-6 text-amber-500" />{children}</h1>,
                                 h2: ({ children }) => <h2 className="text-lg font-black text-indigo-400 uppercase tracking-tight mt-8 mb-4 border-l-4 border-indigo-500/30 pl-4">{children}</h2>,
                                 p: ({ children }) => <p className="text-sm leading-relaxed mb-6 text-slate-400">{children}</p>,
                                 ul: ({ children }) => <ul className="space-y-3 mb-8">{children}</ul>,
                                 li: ({ children }) => <li className="flex items-start gap-3 text-sm text-slate-300 before:content-['▸'] before:text-indigo-500 before:font-bold">{children}</li>,
                                 strong: ({ children }) => <strong className="font-black text-white bg-indigo-500/10 px-1.5 rounded">{children}</strong>,
                                 blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-500/50 bg-indigo-500/5 p-6 rounded-r-3xl my-8 italic text-slate-400 text-sm overflow-hidden relative"><Sparkles className="absolute -right-4 -top-4 w-12 h-12 text-indigo-500/10" />{children}</blockquote>
                              }}
                           >
                              {aiResponse}
                           </ReactMarkdown>
                        </div>
                     )}
                  </div>

                  <div className="p-8 border-t border-slate-800 bg-slate-900/5 flex justify-end gap-3">
                     <button 
                        onClick={() => setShowAiModal(false)}
                        className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all active:scale-95"
                     >
                        Générer un autre plan
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
