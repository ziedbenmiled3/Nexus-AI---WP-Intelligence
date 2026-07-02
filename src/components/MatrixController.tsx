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
import { DEFAULT_NEXUS_CONFIG, mergeRegistryConfig } from '../constants';

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
        const saved = typeof settings['nexus_matrix_config'] === 'string' 
          ? JSON.parse(settings['nexus_matrix_config']) 
          : settings['nexus_matrix_config'];
        
        if (saved) {
           setConfig(mergeRegistryConfig(saved));
        }
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

  const updatePackProperty = (packId: string, property: string, value: any) => {
    const updatedPacks = { ...config.packs };
    const pack = updatedPacks[packId as keyof typeof updatedPacks];
    if (pack) {
      (pack as any)[property] = value;
      setConfig({ ...config, packs: updatedPacks });
    }
  };

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
        <table className="w-full text-left border-collapse min-w-[1220px]">
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
                         placeholder="0 €"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-700 uppercase tracking-widest">{pack.duration}</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {config.categories.map((category) => (
              <React.Fragment key={category.id}>
                <tr className="bg-white/[0.02]">
                  <td colSpan={Object.keys(config.packs).length + 1} className="px-8 py-3 text-[8px] font-black text-purple-400 uppercase tracking-[0.4em]">{category.label}</td>
                </tr>
                {category.features.map((feature) => (
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

      {/* Advanced pack settings */}
      <div className="mt-12 space-y-8 relative z-10">
        <div className="border-t border-slate-800/65 pt-8">
          <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            Paramètres et Droits Avancés des Packs
          </h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Définissez la visibilité, type de paiement, limites de sites, et restrictions de stock de lancement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(config.packs).map(([id, pack]) => {
            const castPack = pack as any;
            return (
              <div key={id} className="bg-[#05060a] border border-slate-800/80 rounded-[2rem] p-6 space-y-5 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider">ID: {id}</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                    castPack.isActive !== false ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"
                  )}>
                    {castPack.isActive !== false ? 'ACTIF SUR LA BOUTIQUE' : 'DESACTIVÉ'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Pack Name Field */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nom Public du Pack</label>
                    <input 
                      type="text"
                      value={castPack.name || ''}
                      onChange={(e) => updatePackProperty(id, 'name', e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-purple-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Price and Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tarif (€ / $)</label>
                      <input 
                        type="text"
                        value={castPack.price || ''}
                        onChange={(e) => updatePackProperty(id, 'price', e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-purple-500 outline-none transition-colors"
                        placeholder="e.g. 59 €"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mention Durée</label>
                      <input 
                        type="text"
                        value={castPack.duration || ''}
                        onChange={(e) => updatePackProperty(id, 'duration', e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-purple-500 outline-none transition-colors"
                        placeholder="e.g. mois, an, unique"
                      />
                    </div>
                  </div>

                  {/* Site Limit & Visibility Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sites Autorisés</label>
                      <input 
                        type="number"
                        value={castPack.siteLimit !== undefined ? castPack.siteLimit : 1}
                        onChange={(e) => updatePackProperty(id, 'siteLimit', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-purple-500 outline-none transition-colors"
                        min={1}
                      />
                    </div>
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <button
                        onClick={() => updatePackProperty(id, 'isActive', castPack.isActive === false ? true : false)}
                        className={cn(
                          "w-full py-2.5 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors text-center",
                          castPack.isActive !== false ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                        )}
                      >
                        {castPack.isActive !== false ? 'Boutique Actif' : 'Boutique Caché'}
                      </button>
                    </div>
                  </div>

                  {/* Lifetime Payment Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/85 rounded-xl">
                    <div>
                      <p className="text-[9.5px] font-bold text-white uppercase tracking-tight">Paiement Unique (À vie)</p>
                      <p className="text-[7.5px] text-slate-500 uppercase tracking-wider mt-0.5">Aucun renouvellement</p>
                    </div>
                    <button
                      onClick={() => {
                        const prevLifetime = !!castPack.isLifetime;
                        updatePackProperty(id, 'isLifetime', !prevLifetime);
                        if (!prevLifetime) {
                          updatePackProperty(id, 'duration', 'à vie');
                        } else {
                          updatePackProperty(id, 'duration', 'mois');
                        }
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[7.5px] font-black uppercase tracking-widest transition-all",
                        castPack.isLifetime 
                          ? "bg-purple-600 text-white shadow-md shadow-purple-900/30" 
                          : "bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400"
                      )}
                    >
                      {castPack.isLifetime ? 'À VIE ACTIVÉ' : 'MENSUEL'}
                    </button>
                  </div>

                  {/* Special Launch Offer Counter */}
                  <div className="space-y-3 p-3 bg-slate-950/40 border border-slate-800/85 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9.5px] font-bold text-white uppercase tracking-tight">Pack Lancement Restreint</p>
                        <p className="text-[7.5px] text-slate-500 uppercase tracking-wider mt-0.5">Limite de ventes maximum</p>
                      </div>
                      <button
                        onClick={() => updatePackProperty(id, 'isLaunchPack', !castPack.isLaunchPack)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[7.5px] font-black uppercase tracking-widest transition-all",
                          castPack.isLaunchPack 
                            ? "bg-amber-600 text-white shadow-md shadow-amber-900/30" 
                            : "bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400"
                        )}
                      >
                        {castPack.isLaunchPack ? 'RESTREINT' : 'SANS LIMITE'}
                      </button>
                    </div>

                    {castPack.isLaunchPack && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 animate-fade-in">
                        <div className="space-y-1">
                          <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">Total Ventes Max</span>
                          <input 
                            type="number"
                            value={castPack.launchStockLimit !== undefined ? castPack.launchStockLimit : 100}
                            onChange={(e) => updatePackProperty(id, 'launchStockLimit', parseInt(e.target.value) || 0)}
                            className="w-full bg-[#050505] border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-amber-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">Ventes Effectuées</span>
                          <input 
                            type="number"
                            value={castPack.launchStockSold !== undefined ? castPack.launchStockSold : 42}
                            onChange={(e) => updatePackProperty(id, 'launchStockSold', parseInt(e.target.value) || 0)}
                            className="w-full bg-[#050505] border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-amber-500 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
