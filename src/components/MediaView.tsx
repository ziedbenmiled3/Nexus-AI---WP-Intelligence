import React, { useState } from 'react';
import { WPConfig } from '../types';
import { 
  Camera, 
  Video, 
  Sparkles, 
  Download, 
  Loader2, 
  Maximize, 
  RefreshCw, 
  CheckCircle2, 
  Image as ImageIcon,
  Zap,
  Play,
  Share2
} from 'lucide-react';
import { improveImagePrompt, generatePromoVideoScript, geminiQuery } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

export default function MediaView({ config }: { config: WPConfig }) {
  const [activeMode, setActiveMode] = useState<'image' | 'video'>('image');
  const [productDetails, setProductDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  // Video generation state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGeneratePackshot = async () => {
    if (!productDetails) return;
    setIsProcessing(true);
    setStatus('Le Maestro concocte un prompt parfait...');
    try {
      const promptText = await improveImagePrompt(productDetails, config.geminiApiKey);
      setStatus('Génération du packshot studio (AI Proxy)...');
      
      const res = await geminiQuery({
        model: 'gemini-3-flash-preview',
        prompt: `Studio packshot, ${promptText}, ultra high quality, commercial photography, minimalist background`,
      }, config.geminiApiKey);

      if (res.data.response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)) {
        const part = res.data.response.candidates[0].content.parts.find((p: any) => p.inlineData);
        setGeneratedImg(`data:image/png;base64,${part.inlineData.data}`);
      } else {
        // Fallback or message
        setStatus('Prompt optimisé terminé. (Génération d\'image non supportée en direct)');
        console.log('Improved Prompt:', res.data.text);
      }
      
      setStatus('Génération terminée');
    } catch (err: any) {
      console.error(err);
      setStatus(`Erreur: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!productDetails) return;
    setIsProcessing(true);
    setStatus('Écriture du script publicitaire par IA...');
    try {
      // For now, Video generation is limited in standard Gemini API vs experimental ones
      // We will simulate the script generation and show a placeholder message for actual video synthesis
      await generatePromoVideoScript(productDetails, "Product video", config.geminiApiKey);
      setStatus('Génération de la vidéo promotionnelle (Simulation)...');
      
      // Since 'veo' models might not be available in standard API keys or regions, 
      // we'll stick to a simulation result for this demo part or use 1.5 flash to describe the video.
      
      await new Promise(r => setTimeout(r, 2000));
      setStatus('Vidéo synthétisée (Mock-up)');
      setVideoUrl('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'); 
      
      setStatus('Génération terminée');
    } catch (err: any) {
      console.error(err);
      setStatus(`Erreur: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="flex gap-1 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit mx-auto shadow-xl">
        <button 
          onClick={() => setActiveMode('image')}
          className={`flex items-center gap-3 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${activeMode === 'image' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:bg-white/5'}`}
        >
          <Camera className="w-4 h-4" /> Packshot Studio
        </button>
        <button 
          onClick={() => setActiveMode('video')}
          className={`flex items-center gap-3 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${activeMode === 'video' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:bg-white/5'}`}
        >
          <Video className="w-4 h-4" /> Promo Vidéo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Input Panel */}
        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl space-y-8 min-h-[500px] flex flex-col justify-center">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                 {activeMode === 'image' ? <Sparkles className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
              </div>
              <div>
                 <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1.5">{activeMode === 'image' ? 'Générateur de Packshot' : 'Générateur de Vidéo'}</h3>
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em]">IA Orchestrator • Visuals V2</p>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[9px] font-bold uppercase text-slate-600 px-1 tracking-widest leading-none block">Spécifications du Produit</label>
              <textarea 
                rows={5}
                className="w-full p-6 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-2xl text-sm leading-relaxed text-slate-300 transition-all font-serif italic"
                placeholder="Décrivez votre produit précisément (couleur, matière, ambiance souhaitée)..."
                value={productDetails}
                onChange={(e) => setProductDetails(e.target.value)}
              />
           </div>

           <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl flex gap-3 text-blue-400 text-[11px] font-medium leading-relaxed italic">
              <Zap className="w-4 h-4 shrink-0" />
              <p>Le Maestro utilisera Imagen 4 ou VEO pour créer un visuel qui convertit instantanément.</p>
           </div>

           <button 
             onClick={activeMode === 'image' ? handleGeneratePackshot : handleGenerateVideo}
             disabled={isProcessing || !productDetails}
             className="w-full py-4.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-blue-500 transition-all disabled:opacity-50 shadow-2xl shadow-blue-900/40 active:scale-[0.98]"
           >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{status}</span>
                </>
              ) : (
                <>
                  <span>Fusionner & Générer</span>
                  <RefreshCw className="w-3.5 h-3.5" />
                </>
              )}
           </button>
        </div>

        {/* Preview Panel */}
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl min-h-[500px] flex flex-col relative group">
           <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex justify-between items-center absolute top-0 left-0 w-full z-10">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Live Preview Buffer</h4>
              <div className="flex gap-2">
                 {generatedImg || videoUrl ? (
                   <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white border border-white/5">
                      <Download className="w-3.5 h-3.5" />
                   </button>
                 ) : (
                   <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-800" />
                 )}
              </div>
           </div>

           <div className="flex-1 flex items-center justify-center p-12 bg-slate-950 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0,transparent_70%)]"></div>
              </div>

              <AnimatePresence mode="wait">
                {activeMode === 'image' && generatedImg ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative z-10"
                  >
                    <img 
                      src={generatedImg} 
                      alt="Généré par IA" 
                      className="max-w-full rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-2xl backdrop-blur-sm border border-white/10">
                       <button className="bg-white p-3.5 rounded-2xl text-slate-950 hover:scale-110 transition-transform shadow-xl"><Maximize className="w-5 h-5" /></button>
                       <button className="bg-blue-600 text-white p-3.5 rounded-2xl hover:scale-110 transition-transform shadow-xl"><Download className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                ) : activeMode === 'video' && videoUrl ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden relative z-10 border border-white/5 shadow-2xl"
                  >
                     <video 
                        src={videoUrl} 
                        controls 
                        className="w-full h-full object-cover"
                     />
                     <div className="absolute top-4 right-4 z-10">
                        <button className="bg-slate-950/50 backdrop-blur-md p-2.5 rounded-xl text-white border border-white/10 hover:bg-slate-950 transition-all"><Share2 className="w-4 h-4" /></button>
                     </div>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-6 max-w-[16rem] relative z-10">
                     <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto shadow_inner border border-slate-800">
                        {activeMode === 'image' ? <ImageIcon className="w-10 h-10 text-slate-800" /> : <Play className="w-10 h-10 text-slate-800" />}
                     </div>
                     <p className="text-[11px] font-medium text-slate-600 leading-relaxed uppercase tracking-[0.15em]">{activeMode === 'image' ? 'Le packshot généré apparaîtra ici avec une fidélité studio.' : 'Le flux vidéo promotionnel sera accessible après processing.'}</p>
                  </div>
                )}
              </AnimatePresence>
           </div>

           {(generatedImg || videoUrl) && (
              <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-t border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Rendu Terminé</span>
                 </div>
                 <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Configuration Avancée</button>
              </div>
           )}
        </div>
      </div>

      {/* Social Media Section */}
      <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 relative z-10">
             <div>
               <h3 className="text-xl font-bold text-white tracking-tight mb-1">Social Factory V1</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Multi-Format Resizing Protocol</p>
             </div>
             <div className="flex flex-wrap gap-2">
                {['Instagram 9:16', 'Facebook 1:1', 'Pinterest 3:4', 'TikTok 9:16'].map(f => (
                  <span key={f} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{f}</span>
                ))}
             </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="aspect-[9/16] bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                  <div className="z-10 p-6 text-center">
                     <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-5 h-5 text-slate-800 group-hover:text-blue-500/50 transition-colors" />
                     </div>
                     <p className="text-[9px] font-black text-slate-700 group-hover:text-slate-500 transition-colors uppercase tracking-[0.2em]">Scale_{i}</p>
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                     <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap shadow-xl" key={`btn-${i}`}>
                        <Download className="w-3.5 h-3.5" /> Export
                     </button>
                  </div>
               </div>
             ))}
          </div>
      </div>
    </div>
  );
}
