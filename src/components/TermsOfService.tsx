import React from 'react';
import { FileText, ArrowLeft, Scale, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface TermsOfServiceProps {
  onBack: () => void;
  lang?: 'fr' | 'en';
}

export default function TermsOfService({ onBack, lang = 'fr' }: TermsOfServiceProps) {
  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-indigo-500/30 font-sans" id="terms-of-service-view">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#02040a]/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={onBack}
            id="terms-back-btn"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {isEn ? 'BACK' : 'RETOUR'}
          </button>
          <span className="text-sm font-display font-black italic uppercase tracking-tighter">WP_AGENT.AI // LEGAL</span>
        </div>
      </nav>

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 animate-fade-in"
          >
            <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-8">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter mb-6">
              {isEn ? (
                <>
                  TERMS OF <span className="text-purple-500">SERVICE</span>
                </>
              ) : (
                <>
                  CONDITIONS <span className="text-purple-500">GÉNÉRALES</span>
                </>
              )}
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
              {isEn ? 'LAST UPDATE: MAY 02, 2026' : 'DERNIÈRE MISE À JOUR : 02 MAI 2026'}
            </p>
          </motion.div>

          <div className="space-y-12 text-slate-400 text-lg leading-relaxed font-medium text-left">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Scale className="w-5 h-5 text-purple-500" />
                {isEn ? '01. TERMS ACCEPTANCE' : '01. ACCEPTATION DES CONDITIONS'}
              </h2>
              <p>
                {isEn
                  ? 'By utilizing WP_AGENT.AI, you agree to comply with and be bound by these terms. Our software represents an automated AI companion suite designed for professional store owners using WordPress and WooCommerce.'
                  : 'En utilisant WP_AGENT.AI, vous acceptez d\'être lié par les présentes conditions. Notre service est un outil d\'assistance par IA conçu pour les professionnels du e-commerce utilisant WordPress et WooCommerce.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-500" />
                {isEn ? '02. PLANS & BILLING' : '02. ABONNEMENTS ET PAIEMENTS'}
              </h2>
              <p>
                {isEn
                  ? 'Nexus plans are billed recurringly or once for lifetime accesses. Regular monthly sub charges are processed securely via PayPal. You can cancel your subscription at any target moment. Core active access remains operational until your current billing period ends.'
                  : 'Les abonnements Nexus sont facturés mensuellement via PayPal. Vous pouvez annuler votre abonnement à tout moment. En cas d\'annulation, l\'accès aux services premium restera actif jusqu\'à la fin de la période de facturation en cours.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500" />
                {isEn ? '03. RESPONSIBILITY CLAUSE' : '03. RESPONSABILITÉ DE L\'AGENT IA'}
              </h2>
              <p>
                {isEn
                  ? 'While our forecasting and repricing modules maintain robust accuracies, any modification made on your WooCommerce database via the WP script is approved on your final operational liability. We strongly advise taking scheduled backups of your platform structure.'
                  : 'Bien que nos algorithmes soient extrêmement précis, les modifications apportées à votre site WordPress via l\'Agent sont sous votre responsabilité finale. Nous recommandons toujours d\'effectuer des sauvegardes régulières de votre base de données WooCommerce.'}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-purple-500" />
                {isEn ? '04. ABUSE & PENALTIES' : '04. USAGE ABUSIF'}
              </h2>
              <p>
                {isEn
                  ? 'Any structural abuse, excessive API query floods or attempts to reverse-engineer our proprietary AI models will lead to immediate account termination without refund rights.'
                  : 'Tout usage détourné de nos API ou tentative de reverse-engineering de nos modèles d\'IA entraînera la suspension immédiate du compte sans remboursement possible.'}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
