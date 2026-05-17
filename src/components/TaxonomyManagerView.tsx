import React, { useState, useEffect } from 'react';
import { 
   Tags as TagsIcon, 
   Plus, 
   Search, 
   Loader2, 
   ChevronDown, 
   Trash2, 
   Edit3, 
   Eye, 
   BrainCircuit, 
   X,
   CheckCircle2,
   AlertCircle,
   Package,
   Layers,
   Hash,
   Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WPConfig } from '../types';
import { wpFetch } from '../lib/wordpress';
import ReactMarkdown from 'react-markdown';
import { geminiQuery } from '../lib/gemini';

interface TaxonomyItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent?: number;
}

interface TaxonomyManagerViewProps {
  config: WPConfig;
}

export default function TaxonomyManagerView({ config }: TaxonomyManagerViewProps) {
  const [activeType, setActiveType] = useState<'category' | 'tag'>('category');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<React.ReactNode | null>(null);
  
  // Selection & Actions
  const [selectedItem, setSelectedItem] = useState<TaxonomyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Create Form State
  const [newTax, setNewTax] = useState({ name: '', description: '', parent: 0 });
  const [createLoading, setCreateLoading] = useState(false);

  // AI States
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState({ current: 0, total: 0, label: '' });
  const [showAiModal, setShowAiModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeType === 'category' ? '/wc/v3/products/categories' : '/wc/v3/products/tags';
      const data = await wpFetch(config, endpoint, 'GET', null, { per_page: 100 });
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Taxonomy fetch failed:", err);
      const status = err.response?.status;
      const proxyError = err.response?.data?.error;
      
      if (status === 404 || (proxyError && proxyError.includes('HTML instead of JSON'))) {
          setError(
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-red-400 mb-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-black uppercase tracking-widest">Liaison WooCommerce Interrompue</p>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-[2rem] space-y-3">
                <p className="text-[11px] text-slate-300 font-medium italic">Nexus n'arrive pas à lire vos catégories.</p>
                <ul className="list-disc ml-5 text-[10px] text-slate-400 space-y-2 normal-case tracking-normal">
                  <li><strong className="text-white italic">Réglages :</strong> Allez dans <span className="text-white font-bold">Réglages &gt; Permaliens</span> et cliquez sur "Enregistrer", même sans rien changer.</li>
                  <li><strong className="text-white italic">WooCommerce :</strong> Vérifiez dans <span className="text-white font-bold">WooCommerce &gt; Réglages &gt; Avancé</span> que l'API est bien active.</li>
                </ul>
              </div>
            </div>
          );
      } else {
        setError(`Erreur [${status || 500}]: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeType]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTax.name) return;

    setCreateLoading(true);
    try {
      const endpoint = activeType === 'category' ? '/wc/v3/products/categories' : '/wc/v3/products/tags';
      const payload: any = {
        name: newTax.name,
        description: newTax.description
      };
      if (activeType === 'category' && newTax.parent > 0) {
        payload.parent = newTax.parent;
      }

      await wpFetch(config, endpoint, 'POST', payload);
      setNewTax({ name: '', description: '', parent: 0 });
      setIsCreating(false);
      fetchData();
    } catch (err: any) {
      setError(`Erreur lors de la création : ${err.message || 'Impossible'}`);
      setTimeout(() => setError(null), 6000);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedItem.name) return;

    console.log('[Taxonomy] Updating:', selectedItem.id, selectedItem.name);
    setUpdateLoading(true);
    try {
      const endpoint = activeType === 'category' 
        ? `/wc/v3/products/categories/${selectedItem.id}` 
        : `/wc/v3/products/tags/${selectedItem.id}`;
      
      const payload: any = {
        name: selectedItem.name,
        description: selectedItem.description
      };
      
      if (activeType === 'category' && typeof selectedItem.parent === 'number') {
        payload.parent = selectedItem.parent;
      }

      const res = await wpFetch(config, endpoint, 'PUT', payload);
      console.log('[Taxonomy] Update Success:', res);
      setSelectedItem(null);
      fetchData();
    } catch (err: any) {
      console.error('[Taxonomy] Update Error:', err.response?.data || err.message);
      setError(`Erreur de mise à jour : ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 6000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    
    setIsDeleting(id);
    try {
      const endpoint = activeType === 'category' ? `/wc/v3/products/categories/${id}` : `/wc/v3/products/tags/${id}`;
      await wpFetch(config, endpoint, 'DELETE', null, { force: true });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      setError(`Erreur lors de la suppression : ${err.message || 'Action impossible'}`);
      setTimeout(() => setError(null), 6000);
    } finally {
      setIsDeleting(null);
    }
  };

  const generateAIAdvice = async () => {
    if (items.length === 0) return;
    
    setIsGenerating(true);
    setShowAiModal(true);
    setAiAdvice("");
    setPendingActions([]);
    
    try {
      const taxonomyData = items.map(i => ({ 
        id: i.id, 
        name: i.name, 
        count: i.count, 
        description: i.description,
        parent: i.parent
      }));
      const typeLabel = activeType === 'category' ? 'Catégories' : 'Tags (Étiquettes)';
      
      const prompt = `En tant qu'expert SEO et UX pour e-commerce (WooCommerce), analyse ma liste de ${typeLabel} actuelle.
      
Objectifs :
1. Détecter les doublons ou synonymes qui nuisent au référencement.
2. Suggérer de nouveaux noms plus porteurs (SEO).
3. Identifier les structures orphelines (peu de produits).
4. Proposer une meilleure hiérarchie si nécessaire.

IMPORTANT : Ta réponse doit contenir deux parties :
1. Une analyse Markdown détaillée et pédagogique pour l'utilisateur.
2. Un bloc de code JSON à la toute fin, délimité par \`\`\`json et \`\`\`, contenant un tableau d'actions structurées que je peux appliquer via l'API WooCommerce. 

Exemple de format JSON attendu :
\`\`\`json
{
  "actions": [
    { "type": "update", "id": 12, "name": "Nouveau Nom", "parent": 0 },
    { "type": "delete", "id": 15 },
    { "type": "create", "name": "Nouvelle Catégorie", "parent": 10 }
  ]
}
\`\`\`

Utilise strictement les IDs fournis dans les données suivantes pour tes actions.
Data: ${JSON.stringify(taxonomyData)}`;

      const res = await geminiQuery({
        model: "gemini-3-flash-preview", 
        prompt,
        systemInstruction: "Tu es un expert SEO et UX e-commerce. Tu fournis des analyses précises et des actions concrètes au format JSON."
      }, config.geminiApiKey);

      const text = res.data.text || "";
      
      // Extraction du JSON plus robuste
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const jsonContent = JSON.parse(jsonMatch[1].trim());
          if (jsonContent.actions && Array.isArray(jsonContent.actions)) {
            setPendingActions(jsonContent.actions);
          }
          // Nettoyer l'affichage pour ne pas montrer le JSON brut à l'utilisateur
          setAiAdvice(text.replace(jsonMatch[0], "").trim());
        } catch (e) {
          console.error("Failed to parse AI JSON:", e);
          setAiAdvice(text);
        }
      } else {
        // Fallback: search for something that looks like JSON if no code blocks
        const fallbackMatch = text.match(/\{\s*"actions"[\s\S]*?\]\s*\}/);
        if (fallbackMatch) {
            try {
                const jsonContent = JSON.parse(fallbackMatch[0]);
                if (jsonContent.actions && Array.isArray(jsonContent.actions)) {
                    setPendingActions(jsonContent.actions);
                }
                setAiAdvice(text.replace(fallbackMatch[0], "").trim());
            } catch (e) {
                setAiAdvice(text);
            }
        } else {
            setAiAdvice(text || "Désolé, je n'ai pas pu générer d'analyse pour le moment.");
        }
      }
    } catch (err: any) {
      console.error("AI Error:", err);
      setAiAdvice(`Erreur AI: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAiRecommendations = async () => {
    if (pendingActions.length === 0) {
      alert("Nexus n'a pas détecté d'actions automatiques sûres pour cette analyse. Veuillez suivre les recommandations manuellement.");
      setShowAiModal(false);
      return;
    }

    if (!confirm(`Nexus va tenter d'appliquer ${pendingActions.length} modifications sur votre boutique WooCommerce. Voulez-vous continuer ?`)) return;

    setIsApplying(true);
    setApplyProgress({ current: 0, total: pendingActions.length, label: 'Initialisation...' });
    
    let successCount = 0;
    let failCount = 0;

    try {
      const endpoint_base = activeType === 'category' ? '/wc/v3/products/categories' : '/wc/v3/products/tags';
      
      for (let i = 0; i < pendingActions.length; i++) {
        const action = pendingActions[i];
        const actionName = action.name || (action.id ? `ID #${action.id}` : 'élément');
        setApplyProgress({ 
            current: i + 1, 
            total: pendingActions.length, 
            label: `${action.type === 'update' ? 'Mise à jour' : action.type === 'create' ? 'Création' : 'Suppression'} de ${actionName}` 
        });

        try {
          if (action.type === 'update' && action.id) {
            const payload: any = {};
            if (action.name) payload.name = action.name;
            if (action.description) payload.description = action.description;
            if (activeType === 'category' && typeof action.parent === 'number') payload.parent = action.parent;
            
            await wpFetch(config, `${endpoint_base}/${action.id}`, 'PUT', payload);
          } else if (action.type === 'delete' && action.id) {
            await wpFetch(config, `${endpoint_base}/${action.id}`, 'DELETE', null, { force: true });
          } else if (action.type === 'create' && action.name) {
            const payload: any = { name: action.name };
            if (action.description) payload.description = action.description;
            if (activeType === 'category' && typeof action.parent === 'number') payload.parent = action.parent;
            
            await wpFetch(config, endpoint_base, 'POST', payload);
          }
          successCount++;
        } catch (err) {
          console.error("Action item failed:", action, err);
          failCount++;
        }
      }

      alert(`${successCount} actions appliquées avec succès.${failCount > 0 ? ` ${failCount} échecs.` : ''}`);
      setShowAiModal(false);
      fetchData();
    } catch (err: any) {
      alert(`Erreur système : ${err.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-indigo-900 border border-indigo-500/30 flex items-center justify-center shadow-2xl shadow-indigo-900/20">
               <TagsIcon className="w-7 h-7 text-white fill-white shadow-sm" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">Gestion des Taxonomies</h1>
               <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                     <CheckCircle2 className="w-3 h-3" />
                     {items.length} {activeType === 'category' ? 'Catégories' : 'Tags'} synchronisés
                  </span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button 
               onClick={generateAIAdvice}
               className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 hover:text-white transition-all flex items-center gap-2 group"
            >
               <BrainCircuit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
               Nexus Intelligence
            </button>
            <button 
               onClick={() => setIsCreating(true)}
               className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
               <Plus className="w-4 h-4" />
               Nouvel Élément
            </button>
         </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex p-1.5 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit">
            <button 
               onClick={() => setActiveType('category')}
               className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'category' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Catégories
            </button>
            <button 
               onClick={() => setActiveType('tag')}
               className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'tag' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Tags
            </button>
         </div>

         <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
               type="text" 
               placeholder={`Chercher par nom ou slug...`}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-[#0a0c10] border border-slate-800/60 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
            />
         </div>
      </div>

      {/* Content Grid */}
      {loading ? (
         <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Chargement Nexus Taxonomies...</p>
         </div>
      ) : error ? (
         <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
               <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
               <p className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">Erreur de Synchronisation</p>
               <p className="text-[10px] text-red-500/60 font-bold uppercase tracking-widest">{error}</p>
            </div>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
               {filteredItems.map((item, idx) => (
                  <motion.div 
                     layout
                     key={item.id}
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ delay: idx * 0.03 }}
                     className="bg-[#0a0c10] border border-slate-800/60 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                  >
                     <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeType === 'category' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                           {activeType === 'category' ? <Layers className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
                        </div>
                        <div className="flex items-center gap-1">
                           <button 
                              onClick={() => handleDelete(item.id)}
                              disabled={isDeleting === item.id}
                              className="p-2 text-slate-600 hover:text-red-500 transition-colors disabled:opacity-50"
                           >
                              {isDeleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                           </button>
                        </div>
                     </div>

                     <div className="relative z-10 mb-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate mb-1">{item.name}</h3>
                        <p className="text-[10px] font-mono text-slate-500">/{item.slug}</p>
                     </div>

                     <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-900/50 relative z-10">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Produits</span>
                           <span className="text-xs font-black text-indigo-400">{item.count}</span>
                        </div>
                        <button 
                           type="button"
                           onClick={() => {
                              console.log('[Taxonomy] Opening Edit Modal for:', item.id);
                              setSelectedItem(item);
                           }}
                           className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all z-20"
                        >
                           <Edit3 className="w-3.5 h-3.5" />
                        </button>
                     </div>

                     {/* Background Pattern */}
                     <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        {activeType === 'category' ? <Layers className="w-24 h-24" /> : <Hash className="w-24 h-24" />}
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>
            
            {filteredItems.length === 0 && (
               <div className="col-span-full py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-6">
                     <Search className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Aucun résultat trouvé</h3>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest max-w-[200px]">Essaye d'ajuster tes termes de recherche ou de changer de tab.</p>
               </div>
            )}
         </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
         {isCreating && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCreating(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div 
                  key="create-modal-container"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-lg bg-[#0d0f14] border border-slate-800 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col"
               >
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                           <Plus className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-lg font-black text-white uppercase tracking-widest leading-none mb-1">Nouveau Nexus</h2>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Type: {activeType === 'category' ? 'Catégorie' : 'Tag'}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setIsCreating(false)}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <form onSubmit={handleCreate}>
                     <div className="p-10 space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de l'élément</label>
                           <input 
                              autoFocus
                              required
                              type="text" 
                              value={newTax.name}
                              onChange={(e) => setNewTax({...newTax, name: e.target.value})}
                              placeholder="Ex: Nouveautés, Promos..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-right">Description (Optionnel)</label>
                           <textarea 
                              rows={3}
                              value={newTax.description}
                              onChange={(e) => setNewTax({...newTax, description: e.target.value})}
                              placeholder="Décrivez cet élément pour le SEO..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                           />
                        </div>

                        {activeType === 'category' && items.length > 0 && (
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie Parente</label>
                              <select 
                                 value={newTax.parent}
                                 onChange={(e) => setNewTax({...newTax, parent: parseInt(e.target.value)})}
                                 className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                              >
                                 <option value={0}>Aucune (Parent Principal)</option>
                                 {items.filter(i => i.id !== selectedItem?.id).map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                 ))}
                              </select>
                           </div>
                        )}
                     </div>

                     <div className="p-8 border-t border-slate-800 bg-slate-900/5 flex gap-3">
                        <button 
                           type="button"
                           onClick={() => setIsCreating(false)}
                           className="flex-1 py-5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-slate-800 transition-all"
                        >
                           Annuler
                        </button>
                        <button 
                           type="submit"
                           disabled={createLoading}
                           className="flex-[2] py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                           {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                           Créer {activeType === 'category' ? 'Catégorie' : 'Tag'}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
         {selectedItem && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedItem(null)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div 
                  key={`edit-modal-${selectedItem.id}`}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-lg bg-[#0d0f14] border border-slate-800 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col"
               >
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                           <Edit3 className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-lg font-black text-white uppercase tracking-widest leading-none mb-1">Modifier Nexus</h2>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {selectedItem.id} | {activeType === 'category' ? 'Catégorie' : 'Tag'}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setSelectedItem(null)}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <form onSubmit={handleUpdate}>
                     <div className="p-10 space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de l'élément</label>
                           <input 
                              autoFocus
                              required
                              type="text" 
                              value={selectedItem.name}
                              onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                              placeholder="Ex: Nouveautés, Promos..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-right">Description (Optionnel)</label>
                           <textarea 
                              rows={3}
                              value={selectedItem.description}
                              onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})}
                              placeholder="Décrivez cet élément pour le SEO..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                           />
                        </div>

                        {activeType === 'category' && items.length > 0 && (
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie Parente</label>
                              <select 
                                 value={selectedItem.parent}
                                 onChange={(e) => setSelectedItem({...selectedItem, parent: parseInt(e.target.value)})}
                                 className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                              >
                                 <option value={0}>Aucune (Parent Principal)</option>
                                 {items.filter(i => i.id !== selectedItem?.id).map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                 ))}
                              </select>
                           </div>
                        )}
                     </div>

                     <div className="p-8 border-t border-slate-800 bg-slate-900/5 flex gap-3">
                        <button 
                           type="button"
                           onClick={() => setSelectedItem(null)}
                           className="flex-1 py-5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-slate-800 transition-all"
                        >
                           Annuler
                        </button>
                        <button 
                           type="submit"
                           disabled={updateLoading}
                           className="flex-[2] py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                           {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                           Enregistrer les modifications
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* AI Advice Modal */}
      <AnimatePresence>
         {showAiModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAiModal(false)}
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 30 }}
                  className="relative w-full max-w-2xl bg-[#0d0f14] border border-indigo-500/20 shadow-[0_0_100px_rgba(79,70,229,0.15)] rounded-[3rem] overflow-hidden flex flex-col max-h-[85vh]"
               >
                  <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                           <BrainCircuit className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                           <h2 className="text-lg font-black text-white uppercase tracking-widest leading-none mb-1">Nexus Intelligence</h2>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optimisation Taxonomy & SEO</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setShowAiModal(false)}
                        className="p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all transform hover:rotate-90"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar prose prose-invert prose-slate max-w-none">
                     {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-8">
                           <div className="relative">
                              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                              </div>
                           </div>
                           <div className="text-center space-y-2">
                              <p className="text-xl font-black text-white uppercase tracking-tighter">Analyse en cours...</p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">IA Nexus active sur vos taxonomies</p>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-8">
                           <div className="markdown-body">
                              <ReactMarkdown>{aiAdvice}</ReactMarkdown>
                           </div>

                           {pendingActions.length > 0 && (
                              <div className="mt-8 space-y-4 pt-8 border-t border-white/5">
                                 <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Actions Détectées ({pendingActions.length})
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {pendingActions.slice(0, 10).map((action, i) => (
                                       <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black ${
                                                action.type === 'update' ? 'bg-amber-500/10 text-amber-500' :
                                                action.type === 'create' ? 'bg-emerald-500/10 text-emerald-500' :
                                                'bg-red-500/10 text-red-500'
                                             }`}>
                                             {action.type === 'update' ? 'UP' : action.type === 'create' ? 'NEW' : 'DEL'}
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-300 uppercase truncate leading-none">
                                             {action.name || `ID: ${action.id}`}
                                          </span>
                                       </div>
                                    ))}
                                    {pendingActions.length > 10 && (
                                       <div className="p-3 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl flex items-center justify-center">
                                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">+{pendingActions.length - 10} autres actions</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
                  <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                     {isApplying ? (
                        <div className="space-y-4">
                           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-indigo-400">{applyProgress.label}</span>
                              <span className="text-slate-500">{Math.round((applyProgress.current / applyProgress.total) * 100)}%</span>
                           </div>
                           <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(applyProgress.current / applyProgress.total) * 100}%` }}
                                 className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                              />
                           </div>
                        </div>
                     ) : (
                        <button 
                           onClick={applyAiRecommendations}
                           disabled={isGenerating || pendingActions.length === 0}
                           className="w-full py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-indigo-900/10"
                        >
                           <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />
                           Appliquer les {pendingActions.length} recommandations
                        </button>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
