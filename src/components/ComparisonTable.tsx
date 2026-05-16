import React from 'react';
import { Check, X, Shield, Zap, Crown, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ComparisonTableProps {
  config: any;
}

export default function ComparisonTable({ config }: ComparisonTableProps) {
  if (!config) return null;

  const categories = Array.from(new Set(config.features.map((f: any) => f.category)));
  const packs = Object.entries(config.packs).filter(([id]) => id !== 'none');

  return (
    <div className="w-full mt-20 space-y-10">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Matrice <span className="text-blue-500">Comparative</span></h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Analyse détaillée des privilèges par protocole</p>
      </div>

      <div className="overflow-x-auto rounded-[2.5rem] border border-white/5 bg-[#050505]/50 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-widest min-w-[300px]">Capabilities</th>
              {packs.map(([id, pack]: [string, any]) => (
                <th key={id} className="p-8 text-center min-w-[160px]">
                  <div className="space-y-1">
                    <div className={cn(
                      "text-[12px] font-black italic uppercase tracking-tighter",
                      id === 'pro' ? "text-purple-500" : "text-white"
                    )}>
                      {pack.name}
                    </div>
                    <div className="text-xl font-black text-white">{pack.price}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((cat: any) => (
              <React.Fragment key={cat}>
                <tr className="bg-blue-600/[0.03]">
                  <td colSpan={5} className="px-8 py-4 text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] italic">
                    {cat}
                  </td>
                </tr>
                {config.features.filter((f: any) => f.category === cat).map((feature: any) => (
                  <tr key={feature.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white uppercase tracking-tight group-hover:translate-x-1 transition-transform">{feature.label}</span>
                        <span className="text-[8px] font-mono text-slate-600 uppercase mt-1">{feature.id}</span>
                      </div>
                    </td>
                    {packs.map(([packId, pack]: [string, any]) => {
                      const isActive = pack.activeFeatures.includes(feature.id);
                      return (
                        <td key={packId} className="p-8 text-center">
                          <div className="flex justify-center">
                            {isActive ? (
                              <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                              >
                                <Check className="w-4 h-4" strokeWidth={3} />
                              </motion.div>
                            ) : (
                              <X className="w-4 h-4 text-slate-800" strokeWidth={1.5} />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Glossy overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent" />
      </div>

      <div className="flex items-center justify-center gap-10 opacity-30 mt-10">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-blue-500" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Enterprise Security</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-purple-500" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Extreme Speed</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-3 h-3 text-amber-500" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Premium IA Core</span>
        </div>
      </div>
    </div>
  );
}
