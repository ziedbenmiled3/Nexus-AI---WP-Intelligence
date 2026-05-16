import React from 'react';
import { Check, X, Shield, Zap, Crown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ComparisonTableProps {
  config: {
    categories: Array<{
      id: string;
      label: string;
      features: Array<{ id: string; label: string }>;
    }>;
    packs: Record<string, {
      name: string;
      price: string;
      activeFeatures: string[];
    }>;
  };
}

export default function ComparisonTable({ config }: ComparisonTableProps) {
  // We show Test, Starter, Pro, and Elite in the comparison table
  const displayPacks = ['test', 'starter', 'pro', 'elite'];

  if (!config || !config.categories || !config.packs) {
    return (
      <div className="p-10 border border-red-500/20 bg-red-500/5 rounded-3xl text-center">
        <p className="text-red-500 font-black uppercase tracking-widest text-[10px]">
          Configuration Matrix Fragmentée - Erreur de Protocole
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-4">
          Comparatif <span className="text-purple-500">Nexus Matrix</span>
        </h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
          Architecture des privilèges par protocole SaaS
        </p>
      </div>

      <div className="bg-[#050505] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl shadow-purple-950/10 relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-8 min-w-[300px]">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    Feature Registry
                  </span>
                </th>
                {displayPacks.map((packId) => {
                  const pack = config.packs[packId] || config.packs[packId.toUpperCase()] || config.packs[packId.charAt(0).toUpperCase() + packId.slice(1)];
                  if (!pack) return <th key={packId} className="p-8" />;
                  return (
                    <th key={packId} className="p-8 text-center min-w-[200px]">
                      <div className="space-y-1">
                        <div className="text-sm font-black text-white uppercase italic tracking-tighter">
                          {pack.name}
                        </div>
                        <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">
                          {pack.price}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {config.categories.map((category) => (
                <React.Fragment key={category.id}>
                  {/* Category Header */}
                  <tr className="bg-purple-600/[0.03]">
                    <td 
                      colSpan={displayPacks.length + 1} 
                      className="px-8 py-4 text-[9px] font-black text-purple-400 uppercase tracking-[0.4em] border-b border-white/5 italic"
                    >
                      {category.label}
                    </td>
                  </tr>
                  
                  {/* Category Features */}
                  {category.features?.map((feature, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      key={feature.id} 
                      className="group hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-tight">
                            {feature.label}
                          </span>
                          <span className="text-[8px] font-mono text-slate-700 uppercase mt-0.5">{feature.id}</span>
                        </div>
                      </td>
                      {displayPacks.map((packId) => {
                        const pack = config.packs[packId] || config.packs[packId.toUpperCase()] || config.packs[packId.charAt(0).toUpperCase() + packId.slice(1)];
                        const isActive = pack?.activeFeatures?.includes(feature.id);
                        return (
                          <td key={packId} className="p-8 text-center">
                            <div className="flex justify-center items-center">
                              {isActive ? (
                                <motion.div 
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  whileInView={{ scale: 1, opacity: 1 }}
                                  className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                >
                                  <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                                </motion.div>
                              ) : (
                                <X className="w-4 h-4 text-slate-900" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-10 opacity-30 mt-12">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-purple-500" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Security protocol v4.0</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-emerald-500" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Zero-latency architecture</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-3 h-3 text-amber-500" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Elite access verified</span>
        </div>
      </div>
    </div>
  );
}
