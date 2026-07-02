import React, { useState, useEffect } from 'react';
import { ExternalLink, BookOpen, Sparkles, ArrowRight, Languages, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

export const EbookPromotion = ({ variant = 'sidebar' }: { variant?: 'sidebar' | 'dashboard' }) => {
  const { t, i18n } = useTranslation();
  
  // Track selected language of the E-book edition (defaulting to current translation language)
  const [selectedLang, setSelectedLang] = useState<'fr' | 'en'>('fr');
  
  // State to track if the sidebar promo card has been dismissed by the user
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (i18n.language) {
      setSelectedLang(i18n.language.startsWith('en') ? 'en' : 'fr');
    }
    // Check if dismissed previously
    const dismissed = localStorage.getItem('nexus_ebook_sidebar_dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
    }
  }, [i18n.language]);

  // Premium landing page URLs for both languages
  const landingUrl = selectedLang === 'en' 
    ? "https://e-book-ia-e-commerce-1026936535114.europe-west2.run.app/?lang=en"
    : "https://e-book-ia-e-commerce-1026936535114.europe-west2.run.app/";

  // Dual-language ebook text mapping fallback
  const texts = {
    fr: {
      badge: t('ebook.badgeDashboard', 'Ressource Stratégique Recommandée'),
      badgePromo: t('ebook.badgeSidebar', 'Exclusivité Nexus'),
      coverTitle: 'IA +',
      coverSubTitle: 'Dropshipping\n& E-commerce',
      title: 'Dominez le Marché de demain ',
      titleColored: 'grâce à l\'IA',
      desc: 'Découvrez les protocoles d’automatisation utilisés par les top 1% des e-commerçants pour scaler sans limites. Un guide pratique de 150+ pages pour transformer votre business.',
      button: 'Accéder au Guide Complet',
      buttonSidebar: 'Télécharger le Guide',
      readers: '1 200+ Lecteurs Satisfaits',
      sidebarDesc: 'Le guide stratégique complet pour dominer le marché en 2026.',
      edition: 'Édition 2026'
    },
    en: {
      badge: t('ebook.badgeDashboard', 'Recommended Strategic Resource'),
      badgePromo: t('ebook.badgeSidebar', 'Nexus Exclusive'),
      coverTitle: 'AI +',
      coverSubTitle: 'Dropshipping\n& E-Commerce',
      title: 'Dominate Tomorrow\'s Market ',
      titleColored: 'with AI Power',
      desc: 'Discover the cutting-edge AI automation concepts utilized by the top 1% of digital entrepreneurs to scale limitlessly. A 150+ page blueprint to transform your business today.',
      button: 'Access the Full Blueprint',
      buttonSidebar: 'Download Blueprint',
      readers: '1,200+ Satisfied Readers',
      sidebarDesc: 'The definitive strategic blueprint to dominate the market in 2026.',
      edition: '2026 Edition'
    }
  };

  const currentText = texts[selectedLang];

  if (isDismissed && variant === 'sidebar') {
    return null;
  }

  if (variant === 'dashboard') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group overflow-hidden bg-gradient-to-br from-[#0a0c10] to-[#12161d] border border-indigo-500/30 rounded-[3rem] p-10 shadow-2xl flex flex-col lg:flex-row items-center gap-10"
      >
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-indigo-600/15 transition-all duration-1000" />
        
        {/* Book Component */}
        <div className="w-56 h-80 bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-900 rounded-[2rem] flex flex-col justify-between p-8 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
           {/* High-tech details */}
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)]" />
           <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.1)_50%,transparent_55%)] bg-[length:200%_200%] animate-pulse" />
           
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span className="text-[8px] font-black text-indigo-300 px-2 py-0.5 bg-white/10 rounded-full tracking-wider uppercase">{selectedLang === 'en' ? 'EN' : 'FR'}</span>
              </div>
              <h3 className="text-2xl font-black text-white italic leading-tight uppercase tracking-tighter">
                {currentText.coverTitle}<br/>
                {currentText.coverSubTitle.split('\n').map((line, idx) => (
                  <span key={idx} className="block">{line}</span>
                ))}
              </h3>
           </div>
           
           <div className="relative z-10 mt-auto">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{currentText.edition}</p>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
              </div>
           </div>
           
           {/* Spine shadow */}
           <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/30 to-transparent" />
        </div>

        <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
          {/* Language Switch */}
          <div className="flex items-center gap-2 justify-center lg:justify-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mr-2">
              <Languages className="w-3.5 h-3.5 text-indigo-400" /> Edition eBook :
            </span>
            <button
               onClick={() => setSelectedLang('fr')}
               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                 selectedLang === 'fr' 
                   ? 'bg-indigo-600 border-indigo-500 text-white font-black' 
                   : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
               }`}
            >
              🇫🇷 Français
            </button>
            <button
               onClick={() => setSelectedLang('en')}
               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                 selectedLang === 'en' 
                   ? 'bg-indigo-600 border-indigo-500 text-white font-black' 
                   : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
               }`}
            >
              🇬🇧 English
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">{currentText.badge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight">
              {currentText.title} <span className="text-indigo-500">{currentText.titleColored}</span>
            </h2>
            <p className="text-slate-400 text-base font-semibold leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {currentText.desc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-2">
             <a 
                href={landingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-900/30 flex items-center gap-3.5 group/btn active:scale-[0.98]"
             >
                {currentText.button}
                <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
             </a>
             <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0c10] bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">
                        {String.fromCharCode(64 + i)}
                     </div>
                   ))}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentText.readers}</span>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group overflow-hidden bg-[#0a0c10] border border-blue-500/20 rounded-[2rem] p-5 shadow-2xl mt-4 animate-fade-in"
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-2.5 py-0.5 bg-blue-600/10 border border-blue-500/20 rounded-full">
            <Sparkles className="w-2.5 h-2.5 text-blue-400" />
            <span className="text-[7.5px] font-black text-blue-400 uppercase tracking-[0.2em]">{currentText.badgePromo}</span>
          </div>
          
          {/* Header controls block (Language + Dismiss) */}
          <div className="flex items-center gap-1.5">
            {/* Localized Mini Switch */}
            <div className="flex p-0.5 bg-black/60 rounded-lg border border-slate-800">
              <button 
                onClick={() => setSelectedLang('fr')}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${selectedLang === 'fr' ? 'bg-blue-600 text-white font-black' : 'text-slate-500 hover:text-slate-300'}`}
              >
                FR
              </button>
              <button 
                onClick={() => setSelectedLang('en')}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${selectedLang === 'en' ? 'bg-blue-600 text-white font-black' : 'text-slate-500 hover:text-slate-300'}`}
              >
                EN
              </button>
            </div>

            {/* Dismiss Cross Button */}
            <button
              onClick={() => {
                localStorage.setItem('nexus_ebook_sidebar_dismissed', 'true');
                setIsDismissed(true);
              }}
              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
              title="Masquer cette offre de la barre latérale"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Virtual Book Mockup/Cover Placeholder */}
          <div className="w-18 h-26 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-lg flex flex-col justify-between p-2 shadow-2xl relative overflow-hidden shrink-0">
             {/* Diagonal stripes */}
             <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,white_10px,white_11px)]" />
             
             <div className="relative z-10">
                <div className="w-3.5 h-3.5 bg-white/20 rounded mb-1 flex items-center justify-center text-[7px]">📚</div>
                <p className="text-[6px] font-black text-white/90 leading-tight uppercase">
                  {selectedLang === 'en' ? 'AI +' : 'IA +'} <br />SHOP
                </p>
             </div>
             
             <div className="relative z-10 mt-auto">
                <p className="text-[5px] font-bold text-white/60 uppercase tracking-tighter">{currentText.edition}</p>
             </div>
             
             {/* Binding line */}
             <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-black/20" />
          </div>

          <div className="flex flex-col justify-center">
            <h4 className="text-[10px] font-black text-white italic uppercase tracking-tighter leading-tight mb-1.5">
              {selectedLang === 'en' ? 'AI + Dropshipping' : 'IA + Dropshipping'} <br/>& E-commerce
            </h4>
            <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              {currentText.sidebarDesc}
            </p>
          </div>
        </div>

        <a 
          href={landingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-9 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-between px-3 text-[8.5px] font-black text-white uppercase tracking-widest transition-all group/btn shadow-lg shadow-blue-900/20 active:scale-[0.98]"
        >
          <span>{currentText.buttonSidebar}</span>
          <ExternalLink className="w-2.5 h-2.5 transform group-hover/btn:translate-x-0.5 transition-all" />
        </a>
      </div>
      
      {/* Decorative border bottom */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </motion.div>
  );
};
