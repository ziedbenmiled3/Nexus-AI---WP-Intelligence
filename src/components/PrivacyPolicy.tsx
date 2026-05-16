import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, FileText, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-indigo-500/30 font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#02040a]/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            RETOUR
          </button>
          <span className="text-sm font-display font-black italic uppercase tracking-tighter">WP_AGENT.AI // SECURITY</span>
        </div>
      </nav>

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-8">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter mb-6">
              POLITIQUE DE <span className="text-indigo-500">CONFIDENTIALITÉ</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">DERNIÈRE MISE À JOUR : 02 MAI 2026</p>
          </motion.div>

          <div className="space-y-12 text-slate-400 text-lg leading-relaxed font-medium">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Lock className="w-5 h-5 text-indigo-500" />
                01. PROTECTION DES DONNÉES
              </h2>
              <p>
                Chez WP_AGENT.AI, la sécurité est notre priorité absolue. Nous collectons uniquement les données strictement nécessaires au fonctionnement de nos services d'IA et à l'optimisation de vos boutiques WooCommerce.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Eye className="w-5 h-5 text-indigo-500" />
                02. COLLECTE D'INFORMATIONS
              </h2>
              <p>
                Nous collectons des informations lorsque vous vous connectez via Google Auth, configurez vos tokens WooCommerce, ou utilisez nos outils d'analyse. Ces données incluent votre email professionnel et les métadonnées de vos produits (titres, stocks, descriptions).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Globe className="w-5 h-5 text-indigo-500" />
                03. COOKIES & TRACKING
              </h2>
              <p>
                Nous utilisons des cookies techniques essentiels pour maintenir votre session active. Aucun tracking publicitaire tiers n'est autorisé sur notre plateforme.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-500" />
                04. VOS DROITS
              </h2>
              <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits à tout moment depuis votre tableau de bord ou en contactant notre support.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
