import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Music2, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  ShoppingBag,
  Zap,
  ArrowRight,
  Monitor,
  Filter,
  Tags,
  ChevronDown,
  FileVideo,
  Database,
  Send,
  Sliders,
  Volume2,
  Trash2,
  Play,
  Pause,
  Share2,
  Lock,
  Smartphone,
  SmartphoneIcon,
  Sparkles,
  Download
} from 'lucide-react';
import { wpFetch } from '../lib/wordpress';
import { WPConfig, WPProduct, WPCategory } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function SocialAutomatorView({ config }: { config: WPConfig }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  // WooCommerce state
  const [products, setProducts] = useState<WPProduct[]>([]);
  const [categories, setCategories] = useState<WPCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<WPProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

  // Social Stats state
  const [stats, setStats] = useState<{
    comments: any[];
    videos: any[];
    tokens: any[];
    queue: { length: number; activeWorkers: number };
  } | null>(null);

  const [loadingStats, setLoadingStats] = useState(false);

  // Video generator state
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState<string>('');
  const [progressBar, setProgressBar] = useState<number>(0);
  const [videoResult, setVideoResult] = useState<any>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Bella (Sultry Energetic)');
  const [playingVideo, setPlayingVideo] = useState(false);
  const [showSpec, setShowSpec] = useState(false);
  const [videoHasError, setVideoHasError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [renderMode, setRenderMode] = useState<'video' | 'canvas'>('canvas');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Webhook Tester state
  const [simPlatform, setSimPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [simUser, setSimUser] = useState<string>('melina_luxury');
  const [simComment, setSimComment] = useState<string>('Est-ce que l\'ensemble est de retour en stock en taille M ? Combien coute-t-il ?');
  const [isInjectingWebhook, setIsInjectingWebhook] = useState(false);
  const [webhookAck, setWebhookAck] = useState<any>(null);

  // Access Token connector simulation
  const [tokenPlatform, setTokenPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [tokenUser, setTokenUser] = useState<string>('piecesdames_chic');
  const [tokenVal, setTokenVal] = useState<string>('ig_live_access_tok_4992');
  const [isSavingToken, setIsSavingToken] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);

  // Live video Blob caching to bypass platform container Cookie Security screen redirect (11 KB error)
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);

  useEffect(() => {
    // Cleanup previous object URL
    if (videoBlobUrl && videoBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoBlobUrl);
    }
    setVideoBlobUrl(null);
    setVideoHasError(false);

    if (videoResult?.media?.video_url) {
      let isSubscribed = true;
      setIsDownloadingVideo(true);
      const url = videoResult.media.video_url;
      const proxyUrl = `/api/social/download?url=${encodeURIComponent(url)}`;
      
      console.log("[Blob Cache] Pulling video bytes programmatically via proxy path...");
      fetch(proxyUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Invalid status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          if (!isSubscribed) return;
          
          // Check for security sandbox cookie-warning barrier HTML content (always ~11 KB)
          if (blob.size < 15000) {
            console.warn(`[Blob Cache] Downloaded blob size ${blob.size} is too small. Suspecting sandbox security redirect page. Falling back to direct live play.`);
            setVideoBlobUrl(url); // Direct GCS fallback
            setIsDownloadingVideo(false);
            return;
          }
          
          const localUrl = URL.createObjectURL(blob);
          setVideoBlobUrl(localUrl);
          setIsDownloadingVideo(false);
          console.log(`[Blob Cache] Successfully created safe local video URL: ${localUrl} (${blob.size} bytes)`);
        })
        .catch(err => {
          console.warn("[Blob Cache] Fetch failed, falling back to direct stream URL:", err.message);
          if (isSubscribed) {
            setVideoBlobUrl(url);
            setIsDownloadingVideo(false);
          }
        });

      return () => {
        isSubscribed = false;
      };
    }
  }, [videoResult]);

  const handleDownloadVideo = async () => {
    const originalUrl = videoResult?.media?.video_url;
    const defaultFilename = `${(selectedProduct?.name || 'promo_video').replace(/\s+/g, '_')}_promo.mp4`;
    
    if (videoBlobUrl && videoBlobUrl.startsWith('blob:')) {
      console.log("[Downloader] Downloading cached local blob.");
      showToast(isEn ? "Downloading your promo video..." : "Téléchargement de votre vidéo promotionnelle...", "success");
      const link = document.createElement('a');
      link.href = videoBlobUrl;
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Force pull in real-time as a fallback
    showToast(isEn ? "Fetching video file securely..." : "Récupération sécurisée du fichier vidéo...", "info");
    try {
      const url = originalUrl || 'https://vjs.zencdn.net/v/oceans.mp4';
      const proxyUrl = `/api/social/download?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Could not fetch video data stream");
      const blob = await response.blob();
      
      if (blob.size < 15000) {
        throw new Error("Proxy returned the platform security cookie validation warning page. Size is abnormally small.");
      }
      
      const bUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = bUrl;
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(bUrl);
      showToast(isEn ? "Download complete!" : "Téléchargement terminé !", "success");
    } catch (err: any) {
      console.warn("[Downloader] Client-side fetch failed:", err);
      showToast(isEn ? "Please open the application in a new tab to download." : "Veuillez ouvrir l'application dans un nouvel onglet pour télécharger.", "error");
      
      // Secondary fallback utilizing blank window
      window.open(`/api/social/download?url=${encodeURIComponent(originalUrl || '')}&filename=${encodeURIComponent(defaultFilename)}`, '_blank');
    }
  };

  // Synchronize defaults when language changes
  useEffect(() => {
    setSimComment(isEn 
      ? "Is the set back in stock in size M? How much does it cost?"
      : "Est-ce que l'ensemble est de retour en stock en taille M ? Combien coute-t-il ?"
    );
    setTokenUser(isEn ? "ladiesbeauty_chic" : "piecesdames_chic");
  }, [isEn]);

  const productImages = selectedProduct?.images && selectedProduct.images.length > 0
    ? selectedProduct.images.map(img => img.src)
    : [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80"
      ];

  // Carousel slider effect in action mode
  useEffect(() => {
    let interval: any;
    if (playingVideo && renderMode === 'canvas') {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 2500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [playingVideo, renderMode, productImages.length]);

  // Synchronized Play/Pause handler
  const handleTogglePlayPause = () => {
    if (!videoResult) return;
    const nextPlaying = !playingVideo;
    setPlayingVideo(nextPlaying);

    if (nextPlaying) {
      setIsAudioPlaying(true);
      fallbackSpeech(videoResult?.script?.body || '');
      
      const vid = document.getElementById('renderedVidPlayer') as HTMLVideoElement;
      if (vid && renderMode === 'video') {
        vid.play().catch(e => {
          console.warn("Direct mp4 video playback restricted by browser context. Falling back to active dynamic Canvas.", e instanceof Error ? e.message : String(e));
          setVideoHasError(true);
          setRenderMode('canvas');
        });
      }
    } else {
      stopAllAudio();
      const vid = document.getElementById('renderedVidPlayer') as HTMLVideoElement;
      if (vid && renderMode === 'video') {
        vid.pause();
      }
    }
  };

  // Audio Playback Engine with SpeechSynthesis fallback
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const stopAllAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch (err) {}
      audioRef.current = null;
    }
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
    setIsAudioPlaying(false);
  };

  const playVoiceOver = (voiceOverUrl: string, textToSpeak: string) => {
    if (isAudioPlaying) {
      stopAllAudio();
      return;
    }

    setIsAudioPlaying(true);
    fallbackSpeech(textToSpeak);
  };

  const fallbackSpeech = (textToSpeak: string) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setIsAudioPlaying(false);
        return;
      }
      window.speechSynthesis.cancel();
      
      const cleanText = textToSpeak.replace(/\[[^\]]*\]/g, '').replace(/:\s*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = isEn ? 'en-US' : 'fr-FR';

      // Advanced audio profile tuning matched to the selection
      let targetGender: 'male' | 'female' = 'female';
      let pitchVal = 1.0;
      let rateVal = 1.05;

      const voiceLower = selectedVoice.toLowerCase();
      const isAntoni = voiceLower.includes('antoni');
      const isRachel = voiceLower.includes('rachel');
      const isBella = voiceLower.includes('bella');

      if (isAntoni) {
        targetGender = 'male';
        pitchVal = 0.78; // Deep, reassuring, highly masculine authority tone
        rateVal = 0.92;  // Slow, poised, premium delivery
      } else if (isBella) {
        targetGender = 'female';
        pitchVal = 1.22; // High-pitched, sunny, very enthusiastic, friendly tone
        rateVal = 1.16;  // Upbeat, fast, solar and active commercial delivery
      } else if (isRachel) {
        targetGender = 'female';
        pitchVal = 0.95; // Lower, professional, crisp, punchy corporate delivery
        rateVal = 1.02;  // Convincing, business-oriented sales presentation speed
      }

      utterance.pitch = pitchVal;
      utterance.rate = rateVal;

      utterance.onend = () => {
        setIsAudioPlaying(false);
        setPlayingVideo(false);
        try {
          const vid = document.getElementById('renderedVidPlayer') as HTMLVideoElement;
          if (vid) vid.pause();
        } catch (e) {}
      };
      utterance.onerror = () => {
        setIsAudioPlaying(false);
        setPlayingVideo(false);
        try {
          const vid = document.getElementById('renderedVidPlayer') as HTMLVideoElement;
          if (vid) vid.pause();
        } catch (e) {}
      };

      // Select dynamic localized system voice that best fits the gender & target
      if (window.speechSynthesis.getVoices) {
        const voices = window.speechSynthesis.getVoices();
        const langCode = isEn ? 'en' : 'fr';
        const langVoices = voices.filter(v => v.lang.toLowerCase().includes(langCode));

        if (langVoices.length > 0) {
          let bestVoice: SpeechSynthesisVoice | null = null;
          
          if (targetGender === 'male') {
            // Priority matches for known masculine systems voice names
            const maleIdentifiers = ['paul', 'gilles', 'thomas', 'daniel', 'david', 'male', 'man', 'guy', 'boy', 'george', 'stefan', 'calm'];
            bestVoice = langVoices.find(v => 
              maleIdentifiers.some(id => v.name.toLowerCase().includes(id))
            ) || null;
            
            // If no explicit male match, try second index or any voice that doesn't sound like standard female Samantha
            if (!bestVoice && langVoices.length > 1) {
              bestVoice = langVoices.find(v => !v.name.toLowerCase().includes('samantha') && !v.name.toLowerCase().includes('zira') && !v.name.toLowerCase().includes('hortense')) || langVoices[1];
            }
          } else {
            // We want Bella and Rachel to sound distinct.
            // Let's filter the voices to find all usable feminine candidates (avoiding masculine matches)
            const femaleVoices = langVoices.filter(v => {
              const nameLower = v.name.toLowerCase();
              const maleIdentifiers = ['paul', 'gilles', 'thomas', 'daniel', 'david', 'male', 'man', 'guy', 'boy', 'george', 'stefan', 'calm'];
              return !maleIdentifiers.some(id => nameLower.includes(id));
            });

            if (isBella) {
              // Bella: Solar and active. Let's target Marie, Samantha, Amélie or the first available female voice.
              const bellaIdentifiers = ['marie', 'amelie', 'samantha', 'google', 'voice 1', 'en-us-samantha'];
              bestVoice = femaleVoices.find(v => 
                bellaIdentifiers.some(id => v.name.toLowerCase().includes(id))
              ) || (femaleVoices.length > 0 ? femaleVoices[0] : null);
            } else {
              // Rachel: Professional and corporate. Suggest Hortense, Julie, Zira, Hazel, or pick the second female voice.
              const rachelIdentifiers = ['hortense', 'julie', 'zira', 'hazel', 'microsoft', 'voice 2', 'google-french', 'google'];
              bestVoice = femaleVoices.find(v => 
                rachelIdentifiers.some(id => v.name.toLowerCase().includes(id))
              ) || null;

              if (!bestVoice) {
                // If there are multiple female voices, assign the second one for Rachel so they are different.
                if (femaleVoices.length > 1) {
                  bestVoice = femaleVoices[1];
                } else if (femaleVoices.length > 0) {
                  bestVoice = femaleVoices[0];
                }
              }
            }
          }

          if (!bestVoice) {
            bestVoice = langVoices[0];
          }

          if (bestVoice) {
            utterance.voice = bestVoice;
          }
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      setIsAudioPlaying(false);
    }
  };

  // Live swap speaker profile while reading
  useEffect(() => {
    if (isAudioPlaying && videoResult?.script?.body) {
      fallbackSpeech(videoResult.script.body);
    }
  }, [selectedVoice]);

  // Stop running audio on route unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Fetch WooCommerce products categories
  const fetchCategories = async () => {
    try {
      const data = await wpFetch(config, '/wc/v3/products/categories', 'GET', null, { per_page: 100, hide_empty: true });
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (e) {
      console.error("fetchCategories error:", e instanceof Error ? e.message : String(e));
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 15, orderby: 'date', order: 'desc' };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const data = await wpFetch(config, '/wc/v3/products', 'GET', null, params);
      if (Array.isArray(data)) {
        setProducts(data);
        if (data.length > 0 && !selectedProduct) setSelectedProduct(data[0]);
      }
    } catch (e) {
      console.error("fetchProducts error:", e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  // Fetch SQLite stats
  const fetchSocialStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/social/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn('Failed to retrieve social metrics (transient network or server restart):', e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingStats(false);
    }
  };

  // Clear SQLite automation metrics
  const handleClearLogs = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }

    setConfirmDelete(false);
    try {
      const res = await fetch('/api/social/clear-logs', { method: 'POST' });
      if (res.ok) {
        showToast(
          isEn 
            ? "Automation logs and database files reset successfully." 
            : "Historique et logs d'automation réinitialisés avec succès.",
          "success"
        );
        fetchSocialStats();
      } else {
        showToast(
          isEn ? "Failed to clear logs." : "Échec de la réinitialisation des logs.",
          "error"
        );
      }
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      showToast(
        isEn ? "An error occurred." : "Une erreur est survenue.",
        "error"
      );
    }
  };

  // Save social tokens
  const handleConnectToken = async () => {
    setIsSavingToken(true);
    try {
      const res = await fetch('/api/social/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: tokenPlatform,
          access_token: tokenVal,
          username: tokenUser,
          scopes: tokenPlatform === 'instagram' 
            ? 'instagram_basic,instagram_manage_comments,instagram_manage_messages' 
            : 'video.publish,comment.list,comment.reply'
        })
      });

      if (res.ok) {
        setTokenVal('');
        fetchSocialStats();
        showToast(
          isEn 
            ? `Account @${tokenUser} successfully connected on ${tokenPlatform}.` 
            : `Compte @${tokenUser} connecté avec succès sur ${tokenPlatform}.`,
          "success"
        );
      }
    } catch (e) {
      console.error("handleConnectToken error:", e instanceof Error ? e.message : String(e));
    } finally {
      setIsSavingToken(false);
    }
  };

  // Trigger AIDA vertical video generator
  const handleGenerateVideo = async () => {
    if (!selectedProduct) return;
    setIsGeneratingVideo(true);
    setVideoResult(null);
    setPlayingVideo(false);
    setVideoHasError(false);
    setCurrentImageIndex(0);
    
    const steps = [
      { text: 'Analyse des métadonnées du produit & extraction des visuels...', progress: 15 },
      { text: 'Initialisation du client Gemini 3.5 & cadrage sémantique...', progress: 40 },
      { text: 'Génération du script publicitaire AIDA (Attention, Intérêt, Désir, Action)...', progress: 65 },
      { text: 'Synthèse de la voix-off publicitaire via l\'API ElevenLabs...', progress: 85 },
      { text: 'Compilation de la timeline d\'assemblage 1080p (9:16)... Prêt !', progress: 100 }
    ];

    for (const step of steps) {
      setVideoProgress(step.text);
      setProgressBar(step.progress);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const res = await fetch('/api/social/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          productDescription: selectedProduct.description,
          productPrice: `${selectedProduct.price} ${config.currency || '€'}`,
          voiceName: selectedVoice
        })
      });

      if (res.ok) {
        const data = await res.json();
        setVideoResult(data);
        fetchSocialStats();
      }
    } catch (e) {
      console.error("handleGenerateVideo error:", e instanceof Error ? e.message : String(e));
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Simulate comment webhook ingester
  const handleSimulateWebhook = async () => {
    setIsInjectingWebhook(true);
    setWebhookAck(null);

    try {
      const randomIds = Math.floor(Math.random() * 90000) + 10000;
      const res = await fetch('/api/social/comment-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: simPlatform,
          post_id: `media_${simPlatform === 'instagram' ? 'ig' : 'tt'}_${randomIds}`,
          comment_id: `comm_${simPlatform === 'instagram' ? 'ig' : 'tt'}_${randomIds}`,
          username: simUser,
          comment_text: simComment
        })
      });

      if (res.ok) {
        const data = await res.json();
        setWebhookAck(data);
        // Refresh periodically (after 2 seconds) when the worker complete
        setTimeout(() => {
          fetchSocialStats();
        }, 2500);
      }
    } catch (e) {
      console.error("handleSimulateWebhook error:", e instanceof Error ? e.message : String(e));
    } finally {
      setIsInjectingWebhook(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [config.url]);

  useEffect(() => {
    fetchProducts();
  }, [config.url, selectedCategory]);

  useEffect(() => {
    fetchSocialStats();
    // Poll queue status every 4 seconds to show live updates
    const interval = setInterval(fetchSocialStats, 4000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const isPlatformConnected = (plat: string) => {
    return stats?.tokens?.some(t => t.platform === plat);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 bg-slate-950 p-1 md:p-4 rounded-[2rem] relative">
      {/* Premium Floating Toasts Banner Container */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -25, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -25, x: "-50%", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full border text-[9px] font-black uppercase tracking-wider overflow-hidden shadow-2xl flex items-center gap-2.5 backdrop-blur-md",
              toast.type === 'success' && "bg-slate-950/95 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10",
              toast.type === 'error' && "bg-slate-950/95 border-rose-500/30 text-rose-400 shadow-rose-500/10",
              toast.type === 'info' && "bg-slate-950/95 border-indigo-500/30 text-indigo-400 shadow-indigo-500/10"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              toast.type === 'success' && "bg-[#00ff66] animate-pulse",
              toast.type === 'error' && "bg-rose-400 animate-ping",
              toast.type === 'info' && "bg-indigo-400 animate-pulse"
            )} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="bg-[#030712] border border-emerald-500/10 p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-gradient-to-l from-emerald-500/5 to-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-6 z-10">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Share2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">Nexus Social Automation</h1>
              <span className="px-2 py-1 bg-violet-600/20 border border-violet-500/30 text-[8px] font-black tracking-widest text-violet-400 rounded-full uppercase">
                Premium
              </span>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-1">
              <Monitor className="w-3.5 h-3.5 text-emerald-400" /> {isEn ? "Organic Virality, AIDA Video Loops & Comment Selling Agent" : "Viralité Organique, AIDA Video Loops & Comment Selling Agent"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button 
            type="button"
            onClick={() => {
              fetchSocialStats();
              showToast(
                isEn 
                  ? "Database statistics synchronized in real-time." 
                  : "Statistiques de la base de données synchronisées.", 
                "info"
              );
            }}
            disabled={loadingStats}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2"
            title={isEn ? "Refresh stats" : "Actualiser les statiques"}
          >
            <RefreshCw className={cn("w-4 h-4", loadingStats && "animate-spin text-[#00ff66]")} />
          </button>
          <button 
            type="button"
            onClick={handleClearLogs}
            className={cn(
              "p-3 rounded-xl transition-all duration-300 flex items-center gap-2 border font-black text-[9px] uppercase tracking-wider relative",
              confirmDelete 
                ? "bg-red-600/20 text-red-500 border-red-500 shadow-md shadow-red-500/10 animate-pulse px-4" 
                : "bg-red-950/20 hover:bg-red-900/30 border-red-500/20 text-red-400 hover:text-red-300"
            )}
            title={isEn ? "Reset queue database logs" : "Réinitialiser log de la file d'attente"}
          >
            {confirmDelete ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                {isEn ? "Confirme?" : "Confirmer ?"}
              </span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* THREE INTERACTIVE COLUMN METRIC PILLS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#030712] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isEn ? "Active System Queue" : "File d'attente active"}</p>
            <h4 className="text-xl font-bold font-mono text-emerald-400 mt-2">
              {stats?.queue?.length ?? 0} {isEn ? "pending" : "en attente"}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
            <div className={cn("w-3 h-3 rounded-full bg-emerald-400", stats?.queue?.length ? "animate-ping" : "")} />
          </div>
        </div>

        <div className="bg-[#030712] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isEn ? "In-Memory Thread Workers" : "Threads actifs en mémoire"}</p>
            <h4 className="text-xl font-bold font-mono text-violet-400 mt-2">
              {stats?.queue?.activeWorkers ?? 0} / 2 {isEn ? "active" : "actifs"}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/5 border border-violet-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-violet-400 font-mono">200 OK</span>
          </div>
        </div>

        <div className="bg-[#030712] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isEn ? "Growth Interceptions" : "Interceptions croissance"}</p>
            <h4 className="text-xl font-bold font-mono text-slate-100 mt-2">
              {stats?.comments?.length ?? 0} {isEn ? "replies" : "réponses"}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Database className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="bg-[#030712] border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isEn ? "Vertical AIDA Video Clips" : "Clips vidéo verticaux AIDA"}</p>
            <h4 className="text-xl font-bold font-mono text-white mt-2">
              {stats?.videos?.length ?? 0} {isEn ? "compiled" : "compilés"}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <FileVideo className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (WooCommerce catalogs selector & Social Channel Connector) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Channel Connector box */}
          <div className="bg-[#030712] border border-slate-800 p-6 rounded-[2rem] space-y-5 shadow-xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> {isEn ? "Connected Social Profiles" : "Profils Sociaux Connectés"}
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff66]" />
            </div>

            {/* Current profiles display */}
            <div className="grid grid-cols-2 gap-3">
              <div className={cn(
                "p-3 rounded-xl border text-center transition-all relative flex flex-col items-center justify-center gap-1 bg-slate-950",
                isPlatformConnected('instagram') 
                  ? "border-emerald-500/40 text-white" 
                  : "border-slate-900 text-slate-600"
              )}>
                <Instagram className={cn("w-6 h-6 mb-1", isPlatformConnected('instagram') ? "text-pink-500" : "text-slate-700")} />
                <span className="text-[9px] font-black uppercase tracking-tight">Instagram</span>
                <span className="text-[7px] font-mono opacity-80">
                  {isPlatformConnected('instagram') ? '@' + stats?.tokens?.find(t => t.platform === 'instagram')?.username : (isEn ? "Not connected" : "Non connecté")}
                </span>
                <span className={cn(
                  "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                  isPlatformConnected('instagram') ? "bg-emerald-400" : "bg-red-500"
                )} />
              </div>

              <div className={cn(
                "p-3 rounded-xl border text-center transition-all relative flex flex-col items-center justify-center gap-1 bg-slate-950",
                isPlatformConnected('tiktok') 
                  ? "border-emerald-500/40 text-white" 
                  : "border-slate-900 text-slate-600"
              )}>
                <Music2 className={cn("w-6 h-6 mb-1", isPlatformConnected('tiktok') ? "text-cyan-400" : "text-slate-700")} />
                <span className="text-[9px] font-black uppercase tracking-tight">TikTok</span>
                <span className="text-[7px] font-mono opacity-80">
                  {isPlatformConnected('tiktok') ? '@' + stats?.tokens?.find(t => t.platform === 'tiktok')?.username : (isEn ? "Not connected" : "Non connecté")}
                </span>
                <span className={cn(
                  "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                  isPlatformConnected('tiktok') ? "bg-emerald-400" : "bg-red-500"
                )} />
              </div>
            </div>

            {/* Connect Token simulator form */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl space-y-3">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isEn ? "Graph API Access Connector" : "Connecteur d'accès Graph API"}</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setTokenPlatform('instagram')}
                  className={cn(
                    "py-1.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all",
                    tokenPlatform === 'instagram' ? "bg-pink-600/20 border-pink-500 text-pink-400" : "border-slate-800 text-slate-500 hover:text-white"
                  )}
                >
                  Instagram
                </button>
                <button 
                  type="button"
                  onClick={() => setTokenPlatform('tiktok')}
                  className={cn(
                    "py-1.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all",
                    tokenPlatform === 'tiktok' ? "bg-cyan-600/20 border-cyan-500 text-cyan-400" : "border-slate-800 text-slate-500 hover:text-white"
                  )}
                >
                  TikTok
                </button>
              </div>

              <div className="space-y-2">
                <input 
                  type="text" 
                  value={tokenUser} 
                  onChange={(e) => setTokenUser(e.target.value)}
                  placeholder={isEn ? "Username (e.g. ladiesbeauty)" : "Nom d'utilisateur (ex: piecesdames)"} 
                  className="w-full bg-[#030712] border border-slate-800 rounded-lg px-3 py-2 text-[9px] font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="password" 
                  value={tokenVal} 
                  onChange={(e) => setTokenVal(e.target.value)}
                  placeholder={isEn ? "Enter Access Token" : "Saisir Token d'accès"} 
                  className="w-full bg-[#030712] border border-slate-800 rounded-lg px-3 py-2 text-[9px] font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button 
                onClick={handleConnectToken}
                disabled={isSavingToken || !tokenVal}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-black uppercase text-[8px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSavingToken ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3 h-3" />}
                {isEn ? "CONNECT THIS ACCOUNT" : "CONNECTER CE COMPTE"}
              </button>
            </div>
          </div>

          {/* Catalog selection Box */}
          <div className="bg-[#030712] border border-slate-800 rounded-[2.5rem] p-6 flex flex-col h-[600px] shadow-2xl">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 shrink-0">
              <ShoppingBag className="w-4 h-4 text-emerald-400" /> {isEn ? "1. Select a Product" : "1. Sélectionner un Produit"}
            </h3>

            {/* Category Filter */}
            <div className="mb-4 space-y-2 shrink-0">
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    setSelectedCategory(val);
                    setProducts([]); 
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-300 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 transition-all pr-10"
                >
                  <option value="all">{isEn ? "All categories" : "Toutes les catégories"}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.count})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-slate-400 transition-colors">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>
            
            {/* Products container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-2 custom-scrollbar">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-950/20 border border-slate-905 p-3 rounded-xl animate-pulse">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-slate-900 rounded w-24" />
                      <div className="h-2 bg-slate-900 rounded w-12" />
                    </div>
                  </div>
                ))
              ) : products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950 border border-dashed border-slate-800 rounded-2xl">
                  <Tags className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-[9px] font-black text-slate-500 uppercase">{isEn ? "No products found" : "Aucun produit"}</p>
                </div>
              ) : products.map((p) => (
                <button
                   key={p.id}
                  onClick={() => { setSelectedProduct(p); setVideoResult(null); }}
                  className={cn(
                    "w-full p-3 rounded-xl border text-left transition-all duration-300 group flex items-center gap-3",
                    selectedProduct?.id === p.id 
                      ? "bg-slate-900 border-emerald-500 shadow-md shadow-emerald-900/10" 
                      : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                    {p.images?.[0] ? (
                      <img referrerPolicy="no-referrer" src={p.images[0].src} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                        <ShoppingBag className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-tight truncate",
                      selectedProduct?.id === p.id ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                    )}>{p.name}</p>
                    <p className={cn(
                      "text-[8px] font-mono",
                      selectedProduct?.id === p.id ? "text-white" : "text-slate-500"
                    )}>{p.price} €</p>
                  </div>
                  <ArrowRight className={cn(
                    "w-3.5 h-3.5 shrink-0 transition-transform",
                    selectedProduct?.id === p.id ? "text-emerald-400" : "text-slate-800 group-hover:translate-x-1"
                  )} />
                </button>
              ))}
            </div>
            
            <div className="pt-2 border-t border-slate-900 shrink-0">
              <span className="text-[7.5px] font-black tracking-widest text-[#00ff66] uppercase">{isEn ? "Selected product" : "Produit sélectionné"}</span>
              <p className="text-[10px] font-bold text-white truncate max-w-[240px] mt-0.5">
                {selectedProduct ? selectedProduct.name : (isEn ? "No product selected" : "Aucun produit sélectionné")}
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN (Intelligent AIDA Video Studio) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-[#030712] border border-slate-800 rounded-[2.5rem] p-6 flex flex-col h-full shadow-2xl relative">
            <span className="absolute top-4 right-4 text-[7px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
              AIDA Format
            </span>

            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 shrink-0">
              <FileVideo className="w-4 h-4 text-emerald-400" /> {isEn ? "2. AIDA Video Synthesizer" : "2. Synthétiseur Vidéo AIDA"}
            </h3>

            {/* Config panel options */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl mb-4 space-y-3 shrink-0 text-left">
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                  {isEn ? "ElevenLabs Sales Voiceover Engine" : "Moteur voix-off sales d'ElevenLabs"}
                </label>
                <select 
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-900 text-[9px] font-bold text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="Bella (Sultry Energetic)">{isEn ? "Bella (Sultry Energetic Female - France)" : "Bella (Voix Féminine Solaire - France)"}</option>
                  <option value="Antoni (Deep Reassuring)">{isEn ? "Antoni (Deep Reassuring Male - Europe)" : "Antoni (Voix Masculine Posée - Europe)"}</option>
                  <option value="Rachel (Confident Sales)">{isEn ? "Rachel (Confident Sales Female - US)" : "Rachel (Voix Féminine Dynamique - US)"}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[7px] font-black text-slate-500 uppercase block">{isEn ? "Final Render" : "Rendu Final"}</span>
                  <span className="text-[9px] font-mono text-white mt-0.5 block">1080p MP4 (9:16)</span>
                </div>
                <div>
                  <span className="text-[7px] font-black text-slate-500 uppercase block">{isEn ? "Audio Overlay" : "Overlay Audio"}</span>
                  <span className="text-[9px] font-mono text-white mt-0.5 block">{isEn ? "TTS 24KHz (Serenade)" : "TTS 24KHz (Sérénade)"}</span>
                </div>
              </div>
            </div>

            {/* Video compile button */}
            <button 
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !selectedProduct}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/10 shrink-0"
            >
              {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin text-emerald-300" /> : <Zap className="w-4 h-4" />}
              {isGeneratingVideo ? "GÉNÉRATION COMPILATION EN COURS..." : "GÉNÉRER LE PROMO VERTICAL VIDEO"}
            </button>

            {/* Video Rendering Step tracking logs list */}
            {isGeneratingVideo && (
              <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-indigo-500/10 flex-1 flex flex-col justify-center text-center animate-pulse">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">E-Commerce Video Studio</p>
                <p className="text-xs font-bold text-white mb-4 italic">"{videoProgress}"</p>
                
                <div className="w-full bg-[#030712] h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-violet-500 transition-all duration-300" 
                    style={{ width: `${progressBar}%` }}
                  />
                </div>
                <span className="text-[8px] font-mono text-slate-500 mt-2">{progressBar}% completé</span>
              </div>
            )}

            {/* Compiled visual and script result panel */}
            {!isGeneratingVideo && videoResult && (
              <div className="mt-4 flex-1 flex flex-col min-h-0 text-left">
                {/* Simulated Phone player frame */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl flex flex-col flex-1 min-h-0 space-y-3">
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{isEn ? "Real Render Preview (9:16)" : "Aperçu Réel Rendu (9:16)"}</span>
                      <button 
                        onClick={() => setShowSpec(!showSpec)}
                        className="text-[8px] font-mono text-slate-500 hover:text-white underline uppercase"
                      >
                        {showSpec ? (isEn ? 'Hide Payloads' : 'Masquer Payloads') : (isEn ? 'Inspect Payload Graphs' : 'Inspecter Payload Graphes')}
                      </button>
                    </div>

                    {/* rendering Mode Selector tabs */}
                    {!showSpec && (
                      <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800/80 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRenderMode('canvas');
                            setVideoHasError(false);
                          }}
                          className={cn(
                            "flex-1 py-1 px-2 rounded-md text-[7px] font-black transition-all uppercase tracking-wider text-center",
                            renderMode === 'canvas' 
                              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black" 
                              : "text-slate-400 hover:text-slate-200"
                          )}
                        >
                          ✨ {isEn ? "Active Canvas (Stable)" : "Animation Active (Stable)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRenderMode('video');
                            setVideoHasError(false);
                          }}
                          className={cn(
                            "flex-1 py-1 px-2 rounded-md text-[7px] font-black transition-all uppercase tracking-wider text-center",
                            renderMode === 'video' 
                              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black" 
                              : "text-slate-400 hover:text-slate-200"
                          )}
                        >
                          📹 {isEn ? "Raw MP4 Video" : "Fichier MP4 Brut"}
                        </button>
                      </div>
                    )}
                  </div>

                  {!showSpec ? (
                    <div className="flex flex-col md:flex-row gap-4 items-center flex-1 min-h-0">
                      
                      {/* Phone frame mock */}
                      <div className="w-[120px] h-[190px] rounded-[1.5rem] bg-black border-2 border-slate-800 overflow-hidden relative shadow-2xl shrink-0 group select-none">
                        
                        {renderMode === 'video' ? (
                          <div className="w-full h-full relative">
                            <video 
                              src={videoBlobUrl || ''} 
                              className="w-full h-full object-cover cursor-pointer bg-black" 
                              loop 
                              muted 
                              autoPlay
                              playsInline
                              preload="auto"
                              id="renderedVidPlayer"
                              onPlay={() => setPlayingVideo(true)}
                              onPause={() => setPlayingVideo(false)}
                              onError={() => {
                                console.warn("Video load error event fired (possibly delayed buffering or iframe policy limitations).");
                                setVideoHasError(true);
                              }}
                              onClick={handleTogglePlayPause}
                            />
                            {videoHasError && (
                              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-3 text-center z-10">
                                <FileVideo className="w-6 h-6 text-emerald-400 mb-1.5 animate-pulse" />
                                <span className="text-[7px] font-black text-rose-500 uppercase block mb-1">
                                  {isEn ? "Iframe Restrictions" : "Restrictions d'Iframe"}
                                </span>
                                <p className="text-[6px] text-slate-400 leading-normal mb-2.5 max-w-[100px]">
                                  {isEn 
                                    ? "Your browser blocks direct MP4 streaming inside this sandboxed iFrame preview." 
                                    : "Votre navigateur bloque le flux MP4 direct dans cet iframe sécurisé."}
                                </p>
                                <div className="flex flex-col gap-1.5 w-full px-2">
                                  <button
                                    type="button"
                                    className="py-1 px-2.5 bg-[#00ff66] text-black text-[6px] font-black rounded uppercase tracking-wider hover:scale-105 transition-all text-center block w-full"
                                    onClick={handleDownloadVideo}
                                  >
                                    ⬇️ {isEn ? "Direct Download Video" : "FORCER LE TÉLÉCHARGEMENT"}
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRenderMode('canvas');
                                      setVideoHasError(false);
                                    }}
                                    className="py-1 px-2.5 bg-slate-800 text-slate-300 text-[6px] font-black rounded uppercase tracking-wider hover:scale-105 transition-all"
                                  >
                                    {isEn ? "Back to Active Canvas" : "Retour à l'Animation"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* High-fidelity interactive animated canvas fallback slideshow using product images */
                          <div 
                            className="w-full h-full relative overflow-hidden bg-slate-900 cursor-pointer"
                            onClick={handleTogglePlayPause}
                          >
                            {productImages.map((imgSrc, idx) => (
                              <div
                                key={imgSrc + idx}
                                className={cn(
                                  "absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out",
                                  idx === currentImageIndex ? "opacity-100 scale-105 animate-[pulse_8s_infinite]" : "opacity-0 scale-100 pointer-events-none"
                                )}
                                style={{
                                  backgroundImage: `url(${imgSrc})`,
                                  transform: idx === currentImageIndex && playingVideo 
                                    ? 'scale(1.14) translateY(1px)' 
                                    : 'scale(1.02)'
                                }}
                              />
                            ))}

                            {/* Equalizer animations during play */}
                            {playingVideo && (
                              <div className="absolute right-2 top-8 flex items-end gap-0.5 h-5 opacity-75 pointer-events-none">
                                <div className="w-0.5 bg-emerald-400 rounded-full h-3 animate-pulse" />
                                <div className="w-0.5 bg-emerald-400 rounded-full h-4 animate-bounce" />
                                <div className="w-0.5 bg-emerald-400 rounded-full h-2 animate-ping" />
                              </div>
                            )}

                            {/* Atmospheric overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 pointer-events-none" />
                          </div>
                        )}

                        <div 
                          className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-2 pointer-events-none"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[5px] text-white font-mono bg-red-600 px-1 py-0.5 rounded uppercase tracking-wider font-extrabold">LIVE</span>
                            <Instagram className="w-2.5 h-2.5 text-white" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="py-0.5 px-1 bg-[#00ff66] text-[5px] font-black text-black leading-tight rounded">
                              {videoResult.script?.hook}
                            </div>
                            <p className="text-[5px] text-slate-200 line-clamp-3 leading-snug font-medium">
                              {videoResult.script?.body}
                            </p>
                          </div>
                        </div>
                        
                        {/* Play/pause overlay trigger overlaying the center of the video */}
                        <button 
                          onClick={handleTogglePlayPause}
                          className={cn(
                            "absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black/20 cursor-pointer",
                            playingVideo ? "opacity-0 hover:opacity-100" : "opacity-100"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white transition-all transform duration-300",
                            playingVideo ? "bg-black/60 scale-90" : "bg-[#00ff66] text-black scale-100 shadow-lg shadow-emerald-500/40 hover:scale-105"
                          )}>
                            {playingVideo ? (
                              <Pause className="w-4 h-4 fill-current text-white" />
                            ) : (
                              <Play className="w-4 h-4 fill-current text-black ml-0.5" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Copyscript and generated info panel */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2">
                        <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                          <span className="text-[7.5px] font-black text-indigo-400 tracking-wider uppercase">{isEn ? "AIDA Sales Script" : "Scénario de Vente AIDA"}</span>
                          <p className="text-[9px] text-slate-300 font-bold whitespace-pre-wrap leading-relaxed">
                            {videoResult.script?.body}
                          </p>
                        </div>
                        
                        {/* Audio guidance mock trigger & secure download actions */}
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <button 
                            type="button" 
                            onClick={() => {
                              playVoiceOver(videoResult.media?.voice_over_url, videoResult.script?.body || '');
                            }}
                            className={cn(
                              "flex-1 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border",
                              isAudioPlaying 
                                ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 animate-pulse" 
                                : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                            )}
                          >
                            <Volume2 className={cn("w-3.5 h-3.5", isAudioPlaying ? "text-emerald-400 animate-bounce" : "text-emerald-400")} /> 
                            {isAudioPlaying ? (isEn ? "STOP AUDIO" : "ARRÊTER L'AUDIO") : (isEn ? "LISTEN TO SALES SCRIPT" : "ÉCOUTER LE SCÉNARIO")}
                          </button>

                          <button
                            type="button"
                            onClick={handleDownloadVideo}
                            className="flex-1 py-2.5 bg-[#00ff66] hover:bg-emerald-400 text-black font-black uppercase text-[8px] tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.02] text-center"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {isEn ? "DOWNLOAD MP4 VIDEO" : "TÉLÉCHARGER LE MP4"}
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Shotstack rendering schema nested JSON log */
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-slate-950 border border-slate-900 rounded-xl max-h-[170px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[7px] font-mono text-yellow-400 uppercase">{isEn ? "Shotstack Packaging Payload Schema" : "Schéma du Payload de Rendu Shotstack"}</span>
                        <button 
                          onClick={() => copyToClipboard(JSON.stringify(videoResult.payload_render_shotstack, null, 2), 'shotstack')}
                          className="text-slate-500 hover:text-white"
                        >
                          {copied === 'shotstack' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="text-[7px] font-mono text-slate-400 whitespace-pre">
                        {JSON.stringify(videoResult.payload_render_shotstack, null, 2)}
                      </pre>
                    </div>
                  )}

                </div>
              </div>
            )}

            {!isGeneratingVideo && !videoResult && (
              <div className="flex-1 bg-slate-950/20 border border-dashed border-slate-900 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center text-slate-600 mt-4">
                <FileVideo className="w-10 h-10 mb-2 opacity-15" />
                <p className="text-[10px] font-black uppercase tracking-wider max-w-[200px]">
                  {isEn ? "Select an item from the list and compile a 15-second AIDA promo spot" : "Sélectionnez un article de la liste et compilez un spot publicitaire AIDA de 15 secondes"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Real-Time comment queue intercepted, automated replies, Webhook simulator terminal) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          <div className="bg-[#030712] border border-slate-800 rounded-[2.5rem] p-6 flex flex-col h-full shadow-2xl relative min-h-[600px]">
            <span className="absolute top-4 right-4 text-[7px] font-mono text-[#00ff66] border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
              {isEn ? "Live Simulator" : "Simulateur Live"}
            </span>

            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400" /> {isEn ? "3. Live Growth Webhook Simulator" : "3. Simulateur de Webhook de Croissance Live"}
            </h3>

            {/* Simulated Live Webhook poster input form */}
            <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl mb-4 space-y-3 shrink-0 text-left">
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block">
                {isEn ? "Graph API Stream Webhook Simulator (Instagram & TikTok)" : "Simulateur de Webhook Flux Graph API (Instagram & TikTok)"}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[7px] font-black text-slate-500 uppercase">{isEn ? "Source Platform" : "Plateforme Source"}</label>
                  <select 
                    value={simPlatform} 
                    onChange={(e) => setSimPlatform(e.target.value as any)}
                    className="w-full bg-[#030712] border border-slate-800 text-[9px] text-white rounded-lg p-1.5 focus:outline-none"
                  >
                    <option value="instagram">{isEn ? "Instagram Comment" : "Commentaire Instagram"}</option>
                    <option value="tiktok">{isEn ? "TikTok Comment" : "Commentaire TikTok"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[7px] font-black text-slate-500 uppercase">{isEn ? "Subscriber Username" : "Abonné Client"}</label>
                  <input 
                    type="text" 
                    value={simUser} 
                    onChange={(e) => setSimUser(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 text-[9px] text-white font-[#030712] rounded-lg p-1.5 focus:outline-none"
                    placeholder="e.g. sophie.mod_paris"
                  />
                </div>
              </div>

              <div>
                <label className="text-[7px] font-black text-slate-500 uppercase">{isEn ? "Captured Question / Comment" : "Question / Commentaire Capturé"}</label>
                <textarea 
                  value={simComment}
                  onChange={(e) => setSimComment(e.target.value)}
                  rows={2}
                  className="w-full bg-[#030712] border border-slate-800 text-[9px] text-white rounded-lg p-2 focus:outline-none focus:border-emerald-500 custom-scrollbar"
                  placeholder={isEn ? "Ask a question about stock, size, price, or shipping..." : "Posez une question sur le stock, la taille, le tarif ou l'envoi..."}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleSimulateWebhook}
                  disabled={isInjectingWebhook || !simComment}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-black uppercase text-[9px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/10"
                >
                  {isInjectingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3 h-3" />}
                  {isEn ? "SIMULATE VIRAL WEBHOOK STREAM" : "SIMULER FLUX VIRAL WEBHOOK"}
                </button>
              </div>

              {/* Webhook captured acknowledgment terminal log */}
              {webhookAck && (
                <div className="p-2 bg-slate-900 rounded-lg text-[6.5px] font-mono text-emerald-400 break-words leading-tight flex flex-col border border-emerald-500/10">
                  <span className="text-white font-black uppercase">HTTP 200 OK ({isEn ? "Instant Response" : "Réponse Instantanée"})</span>
                  <p className="mt-0.5 text-slate-400">{isEn ? "Queue Status" : "Statut File"}: {webhookAck.status} | {isEn ? "Enqueued ID" : "ID Mis En File"}: {webhookAck.job_id}</p>
                  <p className="text-[6.5px] text-indigo-400 mt-1">✓ {isEn ? "Asynchronous processing enqueued in the background to save bandwidth." : "Traitement asynchrone déchargé en tâche de fond pour économiser la bande passante."}</p>
                </div>
              )}
            </div>

            {/* Growth Queue replies intercepted activity logs feed list */}
            <div className="flex-1 flex flex-col min-h-0 text-left">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2 shrink-0">
                {isEn ? "Background comments & replies interception logs" : "Log d'interceptions comment & replies en tâche de fond"}
              </span>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 max-h-[350px]">
                {stats?.comments && stats.comments.length > 0 ? (
                  stats.comments.map((log: any) => (
                    <div 
                      key={log.id} 
                      className="p-3 bg-slate-950 border border-slate-900 rounded-2xl space-y-2 text-left relative overflow-hidden transition-all hover:border-slate-800"
                    >
                      {/* Badge Platform */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {log.platform === 'instagram' ? (
                            <Instagram className="w-3.5 h-3.5 text-pink-500" />
                          ) : (
                            <Music2 className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span className="text-[9px] font-black text-slate-300 font-mono">@{log.username}</span>
                        </div>
                        <span className="text-[7px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase">
                          {isEn ? "Dispatched AI Reply" : "Réponse IA Envoyée"}
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#030712] rounded-xl border border-slate-900">
                        <span className="text-[6px] font-black text-slate-500 uppercase">{isEn ? "User comment" : "Commentaire utilisateur"}</span>
                        <p className="text-[9px] text-slate-300 leading-normal mt-0.5 font-bold italic">
                          "{log.comment_text}"
                        </p>
                      </div>

                      <div className="p-2.5 bg-emerald-950/10 rounded-xl border border-emerald-900/20 relative">
                        <span className="text-[6px] font-black text-emerald-400 uppercase tracking-wide">{isEn ? "INTELLIGENT COMPACT NEXUS REPLY" : "RÉPONSE NÉXUS COMPACT INTELLIGENTE"}</span>
                        <p className="text-[9px] text-white leading-relaxed mt-0.5 font-medium">
                          {log.ai_reply_text}
                        </p>
                        
                        {/* Direct copy btn */}
                        <button 
                          onClick={() => copyToClipboard(log.ai_reply_text, `comment_${log.id}`)}
                          className="absolute right-2 top-2 p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400"
                        >
                          {copied === `comment_${log.id}` ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-slate-700 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
                    <Database className="w-8 h-8 mb-2 opacity-10" />
                    <p className="text-[9px] font-black uppercase tracking-wider">{isEn ? "No logs captured" : "Aucun log capturé"}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
