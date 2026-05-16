import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Crown, 
  Star, 
  MessageSquare,
  ChevronRight,
  Globe,
  Lock,
  Sparkles,
  MousePointer2,
  Cpu,
  Layers,
  Fingerprint
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Capture referral code from URL and save for later
  useEffect(() => {
    const referralCode = new URLSearchParams(window.location.search).get('ref');
    if (referralCode) {
      localStorage.setItem('nexus_ref_code', referralCode);
      console.log('Saved referral code:', referralCode);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSuccess(true);
      const referralCode = localStorage.getItem('nexus_ref_code');
      // In a real app we'd send this to a DB along with referralCode
      console.log('Registering with ref:', referralCode);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans">
      {/* High-End Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Dynamic Mesh Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/15 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full animate-pulse delay-1000" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-8 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-30 animate-pulse" />
            <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
          </div>
          <div>
            <span className="text-xs font-black tracking-[0.4em] uppercase block leading-none">WP_AGENT.AI</span>
            <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-[0.3em]">PROTOCOLE NEXUS-X</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">SERVEUR SÉCURISÉ ACTIF</span>
          </div>
          <button className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors">
            CONNEXION
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-10"
          >
            <Crown className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">INVITATION VIP EXCLUSIVE</span>
          </motion.div>

          {/* Master Headline */}
          <div className="relative mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-7xl md:text-[8rem] lg:text-[10rem] font-display font-black italic uppercase tracking-tighter leading-[0.8] mb-8"
            >
              RÉIMAGINEZ <br />
              LE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-purple-500">POSSIBLE.</span>
            </motion.h1>
            
            {/* Floating Element Around Headline */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 right-[10%] hidden lg:block"
            >
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl rotate-12">
                 <Fingerprint className="w-8 h-8 text-indigo-400" />
              </div>
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-16 italic font-display"
          >
            "WP_AGENT.AI n'est pas un outil, c'est votre nouveau standard. Automatisez votre WooCommerce avec une intelligence brute."
          </motion.p>

          {/* High-End Opt-in Form */}
          <div className="max-w-xl mx-auto mb-20">
            {!success ? (
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onSubmit={handleSubmit}
                className="relative p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col sm:flex-row gap-2 group focus-within:border-indigo-500/50 transition-all duration-500"
              >
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-6 flex items-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder="VOTRE EMAIL PROFESSIONNEL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-5 pl-14 pr-6 text-xs font-black uppercase tracking-[0.2em] outline-none placeholder:text-slate-600"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-white text-black py-4 px-10 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  RÉCLAMER L'ACCÈS
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-indigo-600/10 backdrop-blur-3xl border border-indigo-500/30 p-10 rounded-[2.5rem] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none" />
                <ShieldCheck className="w-14 h-14 text-indigo-400 mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-[0.2em] mb-3">ACCÈS VALIDÉ</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.35em] leading-relaxed">
                  Vérifiez vos emails. Votre profil Nexus est en cours de création.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative z-10 px-8 pb-40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Main Feature - Large */}
            <motion.div 
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
              className="md:col-span-8 p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] relative overflow-hidden group hover:bg-white/[0.07] transition-all duration-500"
            >
               <div className="relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                   <Cpu className="w-7 h-7 text-white" />
                 </div>
                 <h3 className="text-4xl font-display font-black italic uppercase tracking-tighter mb-6 leading-none">Cerveau Artificiel <br /> Natif WooCommerce.</h3>
                 <p className="text-slate-400 font-medium uppercase tracking-tight text-sm leading-relaxed max-w-md">
                   Notre moteur IA analyse chaque transaction et chaque interaction client pour optimiser vos stocks et vos prix en temps réel, sans aucune intervention humaine.
                 </p>
               </div>
               {/* Decorative Element */}
               <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden hidden lg:block opacity-20 group-hover:opacity-40 transition-opacity">
                  <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 border-[20px] border-indigo-500/20 rounded-full" />
                  <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-80 h-80 border-[20px] border-indigo-500/20 rounded-full scale-125" />
               </div>
            </motion.div>

            {/* Small Card 1 */}
            <motion.div 
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              className="md:col-span-4 p-8 bg-white/5 border border-white/10 rounded-[3rem] group hover:bg-indigo-500/5 transition-all duration-500 text-center flex flex-col items-center justify-center"
            >
               <Layers className="w-10 h-10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-black uppercase tracking-widest mb-4 italic text-white/90">PRÉDICTION 2.0</h3>
               <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-loose max-w-[200px]">
                 Anticipez la demande avant même qu'elle n'existe.
               </p>
            </motion.div>

            {/* Small Card 2 */}
            <motion.div className="md:col-span-4 p-8 bg-indigo-600 rounded-[3rem] text-white flex flex-col justify-between group hover:rotate-2 transition-transform duration-500">
               <div className="flex justify-between items-start">
                  <Star className="w-8 h-8 fill-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">ELITE ONLY</span>
               </div>
               <div>
                  <p className="text-[4rem] font-display font-black italic tracking-tighter leading-none mb-2">99.8%</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">FIABILITÉ PROTOCOLE</p>
               </div>
            </motion.div>

            {/* Card 3 - Medium */}
            <motion.div className="md:col-span-8 p-12 bg-white/5 border border-white/10 rounded-[3rem] relative overflow-hidden flex items-center gap-12 group">
                <div className="flex-1 relative z-10">
                   <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-4 leading-none">Sécurité <br /> de Grade Militaire.</h3>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                     Vos données WooCommerce sont chiffrées de bout en bout via le protocole Nexus. Personne, pas même nous, ne peut y accéder.
                   </p>
                </div>
                <div className="w-1/3 hidden sm:block">
                   <div className="aspect-square bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center p-8 group-hover:border-indigo-500/50 transition-colors">
                      <Lock className="w-20 h-20 text-indigo-500 opacity-20" />
                   </div>
                </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Social Trust Marquee - Stylized */}
      <section className="relative z-10 py-16 bg-white overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-slower">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex items-center gap-10 mx-10">
               <span className="text-6xl font-display font-black italic uppercase tracking-tighter text-black opacity-10">NEXUS_PROTOCOL</span>
               <div className="w-4 h-4 bg-indigo-600 rounded-full" />
               <span className="text-6xl font-display font-black italic uppercase tracking-tighter text-black">EXCLUSIVE</span>
               <div className="w-4 h-4 bg-indigo-600 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA / Quote */}
      <section className="relative z-10 py-40 px-8 text-center bg-black">
        <div className="max-w-3xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="w-20 h-20 bg-indigo-600/20 border border-indigo-500/30 rounded-3xl mx-auto mb-12 flex items-center justify-center"
           >
              <MousePointer2 className="w-8 h-8 text-indigo-400" />
           </motion.div>
           <h2 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter leading-[0.9] mb-12 text-white">
             SOYEZ LE <br />
             <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">PREMIER</span> À <br />
             POSSÉDER L'AVENIR.
           </h2>
           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 hover:text-white transition-colors"
           >
             RETOURNER AU PROTOCOLE ↑
           </button>
        </div>
      </section>

      {/* High-End Footer */}
      <footer className="relative z-10 py-20 px-8 bg-[#020203] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-2">
               <Zap className="w-4 h-4 text-white fill-white" />
               <span className="text-xs font-black tracking-[0.5em] uppercase">WP_AGENT.AI</span>
             </div>
             <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">ALL RIGHTS RESERVED © 2026</p>
          </div>
          
          <div className="flex gap-12 text-white">
             <div className="flex flex-col gap-4 text-center md:text-left">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">PROTOCOLE</span>
                <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">SÉCURITÉ</a>
                <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">API</a>
             </div>
             <div className="flex flex-col gap-4 text-center md:text-left">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">RÉSEAUX</span>
                <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">X / TWITTER</a>
                <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">DISCORD</a>
             </div>
          </div>
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-slower {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-slower {
          animation: marquee-slower 40s linear infinite;
        }
      `}} />
    </div>
  );
}
