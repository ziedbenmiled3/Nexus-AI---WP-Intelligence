import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Check, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw,
  Layout,
  Briefcase,
  PieChart,
  Target,
  Database,
  Lock,
  Unlock,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { cn } from '../lib/utils';

export const DEFAULT_NEXUS_CONFIG = {
  features: [
    { id: "dashboard", label: "Tableau de Bord", category: "Aperçu" },
    { id: "social", label: "Nexus Social", category: "Marketing & Ventes" },
    { id: "smart-feed", label: "Flux Smart Shopping", category: "Marketing & Ventes" },
    { id: "market", label: "Intelligence Marché", category: "Marketing & Ventes" },
    { id: "stock", label: "Analyse Stocks", category: "Stocks & Logistique" },
    { id: "forecast", label: "Nexus Forecast", category: "Stocks & Logistique" },
    { id: "audit", label: "Audit SEO", category: "SEO & Contenu" },
    { id: "content", label: "Machine à Contenu", category: "SEO & Contenu" },
    { id: "autopilot", label: "Auto-Pilote", category: "SEO & Contenu" },
    { id: "internal-links", label: "Maillage Interne", category: "SEO & Contenu" },
    { id: "comm-hub", label: "Communication Hub", category: "SEO & Contenu" },
    { id: "products", label: "Manager Produits", category: "Catalogue & Admin" },
    { id: "categories", label: "Catégories & Tags", category: "Catalogue & Admin" },
    { id: "maintenance", label: "Maintenance", category: "Catalogue & Admin" },
    { id: "settings", label: "Paramètres", category: "Catalogue & Admin" }
  ],
  packs: {
    test: { name: "TEST VISION", price: "0$", duration: "1440 MIN", activeFeatures: ["dashboard", "social", "smart-feed", "market", "stock", "forecast", "audit", "content", "autopilot", "internal-links", "comm-hub", "products", "categories", "maintenance", "settings"] },
    starter: { name: "STARTER PROTOCOL", price: "29$", duration: "mois", activeFeatures: ["dashboard", "audit", "products", "categories", "maintenance", "settings"] },
    pro: { name: "PRO NEXUS", price: "89$", duration: "mois", activeFeatures: ["dashboard", "audit", "products", "categories", "maintenance", "settings", "social", "smart-feed", "content", "internal-links", "comm-hub"] },
    elite: { name: "ELITE VISION", price: "249$", duration: "mois", activeFeatures: ["dashboard", "audit", "products", "categories", "maintenance", "settings", "social", "smart-feed", "content", "internal-links", "comm-hub", "market", "stock", "forecast", "autopilot"] }
  }
};

export default function MatrixController() {
  const [config, setConfig] = useState(DEFAULT_NEXUS_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const settings = await firebaseService.getSettings();
      if (settings['nexus_matrix_config']) {
        const saved = JSON.parse(settings['nexus_matrix_config']);
        setConfig(saved);
      }
    } catch (err) {
      console.error('Error loading config:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus(null);
    try {
      await firebaseService.updateSetting('nexus_matrix_config', JSON.stringify(config));
      setStatus({ type: 'success', message: 'NEXUS ARCHITECTURAL MATRIX SYNCHRONISÉE' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: 'ÉCHEC DE LA SYNCHRONISATION' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFeature = (packId: string, featureId: string) => {
    const updatedPacks = { ...config.packs };
    const pack = updatedPacks[packId as keyof typeof updatedPacks];
    
    if (pack.activeFeatures.includes(featureId)) {
      pack.activeFeatures = pack.activeFeatures.filter(id => id !== featureId);
    } else {
      pack.activeFeatures.push(featureId);
    }

    setConfig({ ...config, packs: updatedPacks });
  };

  const updatePrice = (packId: string, newPrice: string) => {
    const updatedPacks = { ...config.packs };
    updatedPacks[packId as keyof typeof updatedPacks].price = newPrice;
    setConfig({ ...config, packs: updatedPacks });
  };

  const categories = Array.from(new Set(config.features.map(f => f.category)));

  return (
    <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Nexus Architectural Matrix</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pilotage centralisé des privilèges et tarifs</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
            status?.type === 'success' 
              ? "bg-emerald-600 text-white" 
              : "bg-purple-600 text-white hover:bg-purple-500 shadow-xl shadow-purple-900/20"
          )}
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {status?.type === 'success' ? 'DÉPLOYÉ' : 'SAUVEGARDER CONFIG'}
        </button>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mb-8 p-4 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest",
            status.type === 'success' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border border-red-500/20 text-red-500"
          )}
        >
          {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.message}
        </motion.div>
      )}

      <div className="overflow-x-auto relative z-10 bg-slate-950/20 rounded-[2rem] border border-slate-800/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-widest min-w-[280px]">Mouvement / Features</th>
              {Object.entries(config.packs).map(([id, pack]) => (
                <th key={id} className="p-8 min-w-[180px]">
                  <div className="space-y-4">
                    <div className="text-[12px] font-black text-white uppercase italic tracking-tighter">{pack.name}</div>
                    <div className="relative group">
                       <input 
                         type="text"
                         value={pack.price}
                         onChange={(e) => updatePrice(id, e.target.value)}
                         className="w-full bg-[#050505] border border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-white focus:border-purple-500 outline-none transition-all focus:shadow-[0_0_20px_-10px_rgba(168,85,247,0.5)]"
                         placeholder="0$"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-700 uppercase tracking-widest">{pack.duration}</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((cat) => (
              <React.Fragment key={cat}>
                <tr className="bg-white/[0.02]">
                  <td colSpan={5} className="px-8 py-3 text-[8px] font-black text-purple-400 uppercase tracking-[0.4em]">{cat}</td>
                </tr>
                {config.features.filter(f => f.category === cat).map((feature) => (
                  <tr key={feature.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-8">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white uppercase tracking-tight">{feature.label}</span>
                          <span className="text-[8px] font-mono text-slate-600 uppercase mt-0.5">{feature.id}</span>
                       </div>
                    </td>
                    {Object.keys(config.packs).map((packId) => {
                      const isActive = config.packs[packId as keyof typeof config.packs].activeFeatures.includes(feature.id);
                      return (
                        <td key={packId} className="p-8 text-center">
                          <button 
                            onClick={() => toggleFeature(packId, feature.id)}
                            className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-105",
                              isActive 
                                ? "bg-emerald-500/10 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-emerald-500" 
                                : "bg-slate-900/50 border border-slate-800 text-slate-700 hover:border-slate-700 hover:text-slate-500"
                            )}
                          >
                            {isActive ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 p-8 bg-purple-500/5 border border-purple-500/10 rounded-[2rem] relative z-10">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
          <span className="text-purple-400 font-black">NOTE DE L'ARCHITECTE :</span> TOUTE MODIFICATION DE LA MATRICE EST IMMÉDIATE. 
          LE SIDEBAR ET LA GRILLE DE PRIX SERONT SYNCHRONISÉS AUTOMATIQUEMENT AVEC LES NOUVEAUX DROITS D'ACCÈS.
        </p>
      </div>

      {/* Abstract Background */}
      <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
    </div>
  );
}
