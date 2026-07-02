import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Share2, 
  ShoppingBag, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Users, 
  Coins, 
  Mail, 
  Radio, 
  Settings, 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Check, 
  Play, 
  RefreshCw, 
  Server, 
  Eye, 
  Activity,
  ArrowRight,
  Database,
  Percent,
  Link,
  Tag,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulatorProps {
  moduleId: string;
}

export default function InteractiveMarketingSimulation({ moduleId }: SimulatorProps) {
  // Shared / General states
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<string>('IDLE');
  
  // 1. Security States
  const [cpuOverhead, setCpuOverhead] = useState<number>(84);
  const [securityLogs, setSecurityLogs] = useState<Array<{ id: number; ip: string; status: string; agent: string; type: string }>>([
    { id: 1, ip: '185.220.101.4', status: 'BANNED', agent: 'Sogou Spider', type: 'Scraping illégitime' },
    { id: 2, ip: '93.174.93.208', status: 'BANNED', agent: 'Go-HTTP-Client', type: 'Tentative SQL Injection' },
    { id: 3, ip: '141.98.81.12', status: 'BANNED', agent: 'Python requests', type: 'Brute-force WP-Login' }
  ]);
  const [shieldActive, setShieldActive] = useState<boolean>(true);

  // 2. Video Studio States
  const [activeVoice, setActiveVoice] = useState<'bella' | 'antoni' | 'rachel'>('bella');
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderState, setRenderState] = useState<'idle' | 'rendering' | 'completed'>('idle');
  const [activeSubLine, setActiveSubLine] = useState<string>("Le volume de vidéos verticales publiées sur TikTok...")

  // 3. Smart Feed States
  const [smartPrices, setSmartPrices] = useState({
    competitorLowest: 54.90,
    ourPrice: 56.50,
    nexusOptimized: 53.40,
    isOptimized: false,
    googleSync: 'OK_ASYNCHRONE'
  });

  // 4. Stock Forecast States
  const [salesSpeed, setSalesSpeed] = useState<number>(1.2);
  const [stockLevel, setStockLevel] = useState<number>(68);
  const [daysToDeplete, setDaysToDeplete] = useState<number>(24);
  const [purchaseOrderTriggered, setPurchaseOrderTriggered] = useState<boolean>(false);

  // 5. SEO Autopilot States
  const [seoScore, setSeoScore] = useState<number>(62);
  const [writingProgress, setWritingProgress] = useState<number>(0);
  const [metaTitle, setMetaTitle] = useState<string>("Meilleures baskets écologiques 2026");
  const [activeKeywords, setActiveKeywords] = useState<string[]>(['Recyclable', 'Confortable', 'Style Urbain', 'Lavage Facile']);
  const [structureCheck, setStructureCheck] = useState({ h1: true, h2: false, interlinks: false });

  // 6. Comment Moderator States
  const [commentFeed, setCommentFeed] = useState([
    { id: 1, user: '@sarah_k', comment: 'Magnifique ! Est-ce que c\'est dispo en 39 et de quelle couleur ?', timestamp: 'Il y a 2 min' },
    { id: 2, user: '@dylan_shoes', comment: 'Livraison gratuite pour la Belgique ??', timestamp: 'Il y a 5 min' },
  ]);
  const [moderatorLogs, setModeratorLogs] = useState<string[]>(['Moteur d\'écoute branché sur TikTok API...']);
  
  // 7. Collab States
  const [permissions, setPermissions] = useState({
    seoWriter: { read: true, writeBlog: true, deleteDb: false },
    stockManager: { read: true, editStock: true, changePrices: false }
  });
  const [collabConsole, setCollabConsole] = useState<string[]>(['Système collaborateur initialisé. Access directs bloqués.']);

  // 8. Finance States
  const [financeInput, setFinanceInput] = useState({
    conversions: 154,
    cogs: 22.50,
    itemPrice: 49.90,
    adsCost: 1520,
    stripeActive: true
  });

  // 9. Comm Hub States
  const [outgoingMailCount, setOutgoingMailCount] = useState<number>(0);
  const [isSendingGroup, setIsSendingGroup] = useState<boolean>(false);
  const [smtpStatus, setSmtpStatus] = useState<'READY' | 'SENDING' | 'SUCCESS'>('READY');

  // 10. Visitor Radar States
  const [visitors, setVisitors] = useState([
    { id: 101, location: 'Paris, FR', timeOnPage: '4m 12s', cartVal: '124.90 €', intent: 'Hésitation Formulaire', pos: { x: 35, y: 55 } },
    { id: 102, location: 'Genève, CH', timeOnPage: '2m 04s', cartVal: '45.00 €', intent: 'Ajout Panier Direct', pos: { x: 75, y: 30 } },
    { id: 103, location: 'Bruxelles, BE', timeOnPage: '6m 45s', cartVal: '189.90 €', intent: 'Regarde CGV', pos: { x: 50, y: 40 } }
  ]);
  const [lastActionLog, setLastActionLog] = useState<string>('Scrutateur de comportement actif (0.2s ping)');

  // 11. Maintenance States
  const [dbSize, setDbSize] = useState<number>(4320); // MB
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [orphansCount, setOrphansCount] = useState<number>(8520);

  // 12. Affiliation States
  const [ambassadorsCount, setAmbassadorsCount] = useState<number>(12);
  const [showCopiedCoupon, setShowCopiedCoupon] = useState<boolean>(false);
  const [customAffiliateLog, setCustomAffiliateLog] = useState<string>('Aucune commission à payer pour l\'instant.');

  // 13. Dashboard States
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState<boolean>(false);
  const [dashSpeed, setDashSpeed] = useState<number>(0.15);
  const [dashActiveSession, setDashActiveSession] = useState<number>(3120);

  // 14. SEO Interlinks States
  const [seoInterlinksGenerated, setSeoInterlinksGenerated] = useState<number>(14);
  const [isGeneratingLinks, setIsGeneratingLinks] = useState<boolean>(false);
  const [linksMapActive, setLinksMapActive] = useState<boolean>(false);

  // 15. WooCommerce Orders Mgr States
  const [bulkOrders, setBulkOrders] = useState([
    { id: '#8943', client: 'Marc B.', status: 'En attente ⏳', total: '89.00€' },
    { id: '#8944', client: 'Sophie L.', status: 'En attente ⏳', total: '142.50€' },
    { id: '#8945', client: 'David P.', status: 'En attente ⏳', total: '34.90€' }
  ]);
  const [isShippingBulk, setIsShippingBulk] = useState<boolean>(false);

  // 16. Product Manager Catalog States
  const [catalogItems, setCatalogItems] = useState([
    { id: 1, name: 'AirMax Extreme v2', price: 120 },
    { id: 2, name: 'Pure Cotton Hoodie', price: 45 },
    { id: 3, name: 'Premium Leather Watch', price: 180 }
  ]);
  const [isMutingCatalog, setIsMutingCatalog] = useState<boolean>(false);

  // 17. Categories & Tags States
  const [duplicateTags, setDuplicateTags] = useState([
    { name: 'basket', count: 14 },
    { name: 'baskets', count: 9 },
    { name: 'basket-sport', count: 5 }
  ]);
  const [isMergingTags, setIsMergingTags] = useState<boolean>(false);
  const [tagsMerged, setTagsMerged] = useState<boolean>(false);

  // Background ticker loops to simulate actions
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRunning) return;

      // 1. Security random attack blockade
      if (moduleId === 'security' && shieldActive) {
        const randomIP = `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`;
        const agentList = ['Scrapy/2.1', 'Nmap Script-Engine', 'Java/1.8.0', 'SemrushBot'];
        const randomAgent = agentList[Math.floor(Math.random() * agentList.length)];
        const threatList = ['Scan de vulnérabilité', 'Injection SQL empêchée', 'Tentative wp-login bloquée'];
        const randomThreat = threatList[Math.floor(Math.random() * threatList.length)];

        setSecurityLogs(prev => [
          { id: Date.now(), ip: randomIP, status: 'BANNED', agent: randomAgent, type: randomThreat },
          ...prev.slice(0, 3)
        ]);
        
        // Stabilize CPU nicely
        setCpuOverhead(prev => {
          const target = shieldActive ? 1.5 : 82;
          return prev > target ? Math.max(target, prev - 1.5) : Math.min(target, prev + 0.5);
        });
      }

      // 4. Forecast auto depletion
      if (moduleId === 'forecast') {
        setStockLevel(prev => {
          const nextVal = prev - (salesSpeed * 0.4);
          if (nextVal <= 30 && !purchaseOrderTriggered) {
            // Under J-45 safety margin, trigger alert or auto PO
            return nextVal;
          }
          if (nextVal < 5) return 85; // replenishment reset
          return nextVal;
        });
      }

      // 10. Radar pings jitter
      if (moduleId === 'wp-crm') {
        setVisitors(prev => prev.map(visitor => ({
          ...visitor,
          pos: {
            x: Math.min(90, Math.max(10, visitor.pos.x + (Math.random() * 4 - 2))),
            y: Math.min(90, Math.max(10, visitor.pos.y + (Math.random() * 4 - 2)))
          }
        })));
      }

    }, 3000);

    return () => clearInterval(interval);
  }, [moduleId, shieldActive, salesSpeed, purchaseOrderTriggered, isRunning]);

  // Adjust sliders & simple calculations
  useEffect(() => {
    if (moduleId === 'forecast') {
      const days = Math.round(stockLevel / (salesSpeed * 0.8));
      setDaysToDeplete(days);
    }
  }, [stockLevel, salesSpeed, moduleId]);

  // 1. Security button reset
  const toggleShield = () => {
    setShieldActive(!shieldActive);
    setCpuOverhead(shieldActive ? 84 : 1.6);
  };

  // 2. Compile MP4 Trigger
  const triggerMP4Compile = () => {
    if (renderState === 'rendering') return;
    setRenderState('rendering');
    setRenderProgress(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += 8;
      if (current >= 100) {
        setRenderProgress(100);
        setRenderState('completed');
        clearInterval(interval);
      } else {
        setRenderProgress(current);
        const subLines = [
          "Analyse de l'image 'Basket Solaire'...",
          "Extraction des mots-clés de vente...",
          "Synthèse vocale d'accroche (" + activeVoice.toUpperCase() + ")...",
          "Calcul du rythme des sous-titres AIDA...",
          "Fusion auditive en arrière-plan cloud...",
          "Rendu du conteneur MP4 ultra-vitesse..."
        ];
        setActiveSubLine(subLines[Math.floor((current / 100) * subLines.length)]);
      }
    }, 150);
  };

  // 3. Competitive Optimization Price
  const triggerAutoPricing = () => {
    setSmartPrices(prev => ({
      ...prev,
      isOptimized: true,
      ourPrice: prev.nexusOptimized
    }));
  };

  // 4. Trigger purchase order
  const triggerPurchaseOrder = () => {
    setPurchaseOrderTriggered(true);
    setStatusText('COMMANDE ENVOYÉE');
    setTimeout(() => {
      setStockLevel(95);
      setPurchaseOrderTriggered(false);
      setStatusText('IDLE');
    }, 1500);
  };

  // 5. SEO Crawler Trigger
  const triggerSEOCrawler = () => {
    setWritingProgress(10);
    const interval = setInterval(() => {
      setWritingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSeoScore(98);
          setStructureCheck({ h1: true, h2: true, interlinks: true });
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  // 6. Moderator buzz simulation
  const addBuzzComment = () => {
    const sampleComments = [
      { id: Date.now(), user: '@charlie_runs', comment: 'Est-ce que ça résiste bien à la pluie battante ??', timestamp: 'À l\'instant' },
      { id: Date.now() + 1, user: '@lea_nature', comment: 'Je veux l\'accès direct, quel est le lien VIP à vie ?', timestamp: 'À l\'instant' },
      { id: Date.now() + 2, user: '@luc_tech', comment: 'Y a un code déduction supplémentaire actif ce soir ?', timestamp: 'À l\'instant' }
    ];
    const picked = sampleComments[Math.floor(Math.random() * sampleComments.length)];
    setCommentFeed(prev => [picked, ...prev]);

    setModeratorLogs(prev => [
      `Message reçu de ${picked.user}.`,
      `Analyse sémantique (Intention d'achat)...`,
      `Génération de réponse avec coupon et lien panier...`,
      ...prev
    ]);
  };

  // 8. Finance Math calculations
  const calculateFinanceProfit = () => {
    const gross = financeInput.conversions * financeInput.itemPrice;
    const itemCOGS = financeInput.conversions * financeInput.cogs;
    const stripeFee = financeInput.stripeActive ? (gross * 0.029) + (financeInput.conversions * 0.3) : 0;
    const ads = financeInput.adsCost;
    const net = gross - itemCOGS - stripeFee - ads;
    return {
      gross: gross.toFixed(2),
      cogsSum: itemCOGS.toFixed(2),
      stripeSum: stripeFee.toFixed(2),
      net: net.toFixed(2),
      roi: net > 0 ? ((net / ads) * 100).toFixed(0) : '0'
    };
  };
  const financeStats = calculateFinanceProfit();

  // 9. Send Bulk Campaigns
  const triggerEmailCampaign = () => {
    if (isSendingGroup) return;
    setIsSendingGroup(true);
    setSmtpStatus('SENDING');
    setOutgoingMailCount(0);

    let count = 0;
    const interval = setInterval(() => {
      count += 250;
      if (count >= 5000) {
        setOutgoingMailCount(5000);
        setIsSendingGroup(false);
        setSmtpStatus('SUCCESS');
        clearInterval(interval);
      } else {
        setOutgoingMailCount(count);
      }
    }, 80);
  };

  // 10. Visitor radar coupon flash
  const triggerCouponRadar = (visitorId: number) => {
    setLastActionLog(`Coupon de 15% envoyé par SMS/WhatsApp au Visiteur #${visitorId} !`);
    setTimeout(() => {
      // simulate checkout
      setVisitors(prev => prev.filter(v => v.id !== visitorId));
      setLastActionLog(`Succès ! Le Visiteur #${visitorId} s'est converti en acheteur.`);
    }, 1200);
  };

  // 11. Vacuum Database
  const triggerDatabaseVacuum = () => {
    if (isCleaning) return;
    setIsCleaning(true);
    setStatusText('COMPACTAGE EN COURS...');
    
    setTimeout(() => {
      setDbSize(812);
      setOrphansCount(0);
      setIsCleaning(false);
      setStatusText('IDLE');
    }, 1800);
  };

  return (
    <div id="nexus-holographic-emulator" className="bg-[#050813] border border-violet-500/15 rounded-[2.5rem] p-6 space-y-4 relative overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.05)]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header telemetry area */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 bg-violet-950/50 border border-violet-500/20 rounded-md text-[9px] font-mono text-violet-400 font-black tracking-widest uppercase">
            SIMULATEUR NEXUS LIVE
          </div>
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" />
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          {moduleId.toUpperCase()} // SYS_OK
        </div>
      </div>

      {/* RENDER ACTIVE EMULATOR CONTENT */}
      <div className="min-h-[220px] flex flex-col justify-between py-2">
        <AnimatePresence mode="wait">
          
          {/* 1. SECURITY MODULE EMULATOR */}
          {moduleId === 'security' && (
            <motion.div 
              key="emu-security"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Telemetry charts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 text-center">
                  <div className="text-[9px] text-slate-500 font-black uppercase">Consommation CPU WordPress</div>
                  <div className={`text-xl font-mono font-black mt-1 ${cpuOverhead > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {cpuOverhead.toFixed(1)}%
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${cpuOverhead > 50 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${cpuOverhead}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 text-center relative overflow-hidden">
                  <div className="text-[9px] text-slate-500 font-black uppercase">Statut Filtrage Proxy Cloud</div>
                  <div className={`text-xs font-black uppercase mt-2.5 ${shieldActive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {shieldActive ? 'BLINDAGE ACTIF' : 'SCAN LOCAL LOURD (OFF)'}
                  </div>
                </div>
              </div>

              {/* Bot detection log stack */}
              <div className="bg-[#03060c] border border-white/5 p-3 rounded-2xl space-y-1.5">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Pare-feu asynchrone (IPs interceptées)</span>
                  <span className="text-[8px] text-emerald-400">Total : {securityLogs.length} bloqués</span>
                </div>
                <div className="space-y-1">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-[10px] bg-slate-950/60 p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span className="font-mono text-slate-400">{log.ip}</span>
                        <span className="text-slate-500">[{log.agent}]</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-400 font-black uppercase text-[8px]">{log.type}</span>
                        <span className="bg-red-500/10 text-red-400 text-[8px] px-1.5 rounded font-black">DROP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <button 
                onClick={toggleShield}
                className={`w-full py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  shieldActive 
                    ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white font-black'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {shieldActive ? 'Désactiver le proxy sémantique' : 'Activer le bouclier asynchrone Nexus'}
              </button>
            </motion.div>
          )}

          {/* 2. SOCIAL STUDIO EMULATOR */}
          {moduleId === 'social' && (
            <motion.div 
              key="emu-social"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Storyboard Render Progress Frame */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                <div className="aspect-video bg-slate-900 rounded-xl relative flex items-center justify-center border border-white/5 overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/40 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400">
                    AIDA_RENDER_FRAME_3.MP4
                  </div>

                  {renderState === 'rendering' ? (
                    <div className="text-center space-y-2 relative z-10 px-4">
                      <RefreshCw className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
                      <p className="text-[10px] text-slate-300 font-bold">{activeSubLine}</p>
                      <p className="text-xs font-mono font-black text-violet-400">{renderProgress}%</p>
                    </div>
                  ) : renderState === 'completed' ? (
                    <div className="text-center space-y-2 relative z-10 px-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] text-emerald-400 font-bold">Vidéo MP4 Générée avec Succès !</p>
                      <p className="text-[9px] text-slate-400 italic">"« Accroche : Arrête de détruire la vitesse... »"</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1.5 relative z-10">
                      <Play className="w-7 h-7 text-white/80 hover:text-white transition-all cursor-pointer mx-auto" onClick={triggerMP4Compile} />
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Prêt à compiler</p>
                    </div>
                  )}

                  {/* Simulated audio waveform */}
                  <div className="absolute bottom-2 right-2 flex items-end gap-0.5 h-6">
                    <div className={`w-1 bg-violet-400 rounded-full h-2 ${renderState === 'rendering' ? 'animate-[bounce_0.8s_infinite]' : ''}`} />
                    <div className={`w-1 bg-violet-400 rounded-full h-4 ${renderState === 'rendering' ? 'animate-[bounce_0.6s_infinite_0.1s]' : ''}`} />
                    <div className={`w-1 bg-violet-400 rounded-full h-5 ${renderState === 'rendering' ? 'animate-[bounce_0.7s_infinite_0.2s]' : ''}`} />
                    <div className={`w-1 bg-violet-400 rounded-full h-3 ${renderState === 'rendering' ? 'animate-[bounce_0.5s_infinite_0.3s]' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Selector voice list */}
              <div className="grid grid-cols-3 gap-2">
                {(['rachel', 'antoni', 'bella'] as const).map((voice) => (
                  <button
                    key={voice}
                    onClick={() => setActiveVoice(voice)}
                    className={`p-2 rounded-xl border text-[9px] font-black uppercase text-center transition-all cursor-pointer ${
                      activeVoice === voice 
                        ? 'bg-violet-500/20 border-violet-500 text-white' 
                        : 'bg-transparent border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Voice: {voice === 'bella' ? '☀️ Bella' : voice === 'rachel' ? '⚡ Rachel' : '👨 Antoni'}
                  </button>
                ))}
              </div>

              {/* Compile MP4 trigger */}
              <button 
                onClick={triggerMP4Compile}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Générer & Exporter la Vidéo AIDA
              </button>
            </motion.div>
          )}

          {/* 3. SMART FEED & MARKET EMULATOR */}
          {moduleId === 'smart-feed' && (
            <motion.div 
              key="emu-smart-feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* XML Feed sync state */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold font-sans">Flux Google Shopping (XML)</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {smartPrices.googleSync}
                </span>
              </div>

              {/* Competitor matrix list */}
              <div className="space-y-2 bg-[#03060c] border border-white/5 p-3 rounded-2xl">
                <div className="text-[9px] text-slate-500 font-black uppercase mb-1">
                  Radar Concurrents de Prix (Baskets Solaire)
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] p-2 bg-slate-950 rounded-xl">
                    <span className="text-slate-300 font-semibold">LeurShop Concurrent 1</span>
                    <span className="font-mono text-red-400 font-black">54.90 €</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 bg-slate-950 rounded-xl">
                    <span className="text-slate-300 font-semibold">DripStore Concurrent 2</span>
                    <span className="font-mono text-red-300 font-black">55.00 €</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 bg-violet-950/20 border border-violet-500/10 rounded-xl">
                    <span className="text-violet-300 font-bold">Votre Prix WooCommerce</span>
                    <span className={`font-mono font-black ${smartPrices.isOptimized ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {smartPrices.ourPrice.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Smart optimization action */}
              <button
                onClick={triggerAutoPricing}
                disabled={smartPrices.isOptimized}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  smartPrices.isOptimized 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed' 
                    : 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                }`}
              >
                {smartPrices.isOptimized ? (
                  <>
                    <Check className="w-4 h-4" />
                    Boutique auto-optimisée (-1.50€ concurrent)
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Forcer Scraper & optimiser le tarif à vie
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* 4. STOCK & FORECAST EMULATOR */}
          {moduleId === 'forecast' && (
            <motion.div 
              key="emu-forecast"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Stock chart visual block */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase font-bold text-[9px]">Simulation Seuil d'approvisionnement (J-45)</span>
                  <span className="text-red-400 font-mono font-bold">{Math.round(stockLevel)} pièces en stock</span>
                </div>
                
                {/* Visual Chart Bars representing deplete */}
                <div className="h-16 flex items-end justify-between px-1 gap-1">
                  {[85, 78, 71, 64, 57, 50, 43, 36, 29, 22, 15, 87].map((h, i) => {
                    const isBelowThreshold = h < 35;
                    const isActiveColumn = Math.floor(stockLevel) <= h;
                    return (
                      <div 
                        key={i} 
                        className={`w-full rounded-t transition-all ${
                          isBelowThreshold 
                            ? 'bg-red-500/40 hover:bg-red-500/70' 
                            : 'bg-amber-400/40 hover:bg-amber-400/70'
                        } ${isActiveColumn ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-950' : ''}`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Adjust sales slider and telemetry */}
              <div className="space-y-2 bg-[#02050b] p-3 rounded-2xl border border-white/5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Accélérer la cadence des ventes :</span>
                  <span className="font-mono text-violet-400">Vitesse: {salesSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.1" 
                  value={salesSpeed}
                  onChange={(e) => setSalesSpeed(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 pointer-events-auto h-1"
                />
                
                <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-300">
                  <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-slate-500 uppercase text-[8px]">Seuil J-45 estimé</p>
                    <p className="text-xs font-mono font-black mt-1 text-amber-400">Dans {daysToDeplete} jours</p>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-slate-500 uppercase text-[8px]">Trésorerie d'achat à bloquer</p>
                    <p className="text-xs font-mono font-black mt-1 text-emerald-400">1 850 € Net</p>
                  </div>
                </div>
              </div>

              {/* Trigger Purchase Order */}
              <button
                onClick={triggerPurchaseOrder}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <BarChart3 className="w-4 h-4" />
                Déclencher l'Auto-Approvisionnement
              </button>
            </motion.div>
          )}

          {/* 5. SEO AUTOPILOT MACHINE EMULATOR */}
          {moduleId === 'content' && (
            <motion.div 
              key="emu-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* SEO Score circle badge */}
              <div className="flex gap-4 items-center bg-slate-950 p-3 rounded-2xl border border-white/5">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-[#03060d] border border-white/5">
                  <p className="font-mono text-xl font-black text-rose-400">{seoScore}/100</p>
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase">Statut Rédaction Autonome SEO</p>
                  <p className="text-xs font-sans text-white font-bold italic">"{metaTitle}"</p>
                  <p className="text-[9px] text-slate-400 font-semibold font-mono">Planificateur synchronisé : +3 articles/semaine</p>
                </div>
              </div>

              {/* Typewriter checklist */}
              <div className="bg-[#03050c] p-3 rounded-2xl border border-white/5 space-y-2 text-[10px] font-sans">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Densité de Mots-Clés injectée</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeKeywords.map((tag) => (
                    <span key={tag} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] px-2 py-0.5 rounded-lg font-semibold">
                      #{tag} (2.4%)
                    </span>
                  ))}
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${structureCheck.h1 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-slate-300">Validation titre principal H1 & Balisage HTML parfait</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${structureCheck.h2 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-slate-300">Maillage d'articles de blog silo WordPress</span>
                  </div>
                </div>
              </div>

              {/* Crawler trigger button */}
              <button
                onClick={triggerSEOCrawler}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Lancer Google Crawler Indexation Sémantique
              </button>
            </motion.div>
          )}

          {/* 6. AI COMMENT MODERATOR EMULATOR */}
          {moduleId === 'moderator' && (
            <motion.div 
              key="emu-moderator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Dynamic comment scroll */}
              <div className="bg-[#03060c] border border-white/5 p-3 rounded-2xl space-y-2">
                <div className="text-[9px] text-slate-500 font-bold uppercase flex justify-between items-center">
                  <span>Flux de commentaires TikTok / Reels</span>
                  <span className="text-[8px] text-emerald-400">Saisie d'intention</span>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-none">
                  {commentFeed.map((f) => (
                    <div key={f.id} className="p-2.5 bg-slate-950 rounded-xl border border-white/5 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-amber-400 font-bold">{f.user}</span>
                        <span className="text-[8px] text-slate-500">{f.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">"{f.comment}"</p>
                      
                      <div className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 text-[9px] text-amber-200">
                        <span className="font-extrabold uppercase text-[8px] text-amber-400 block mb-0.5">RÉPONSE CLOUD DE COMBAT :</span>
                        « Salut ! Oui dispo immédiate en 39. Voici ton lien VIP avec code -10% : nexus.ai/s/basket39 »
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action simulate comment */}
              <button
                onClick={addBuzzComment}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                Simuler un commentaire client (Intérêt Brûlant)
              </button>
            </motion.div>
          )}

          {/* 7. COLLAB HUB EMULATOR */}
          {moduleId === 'collab' && (
            <motion.div 
              key="emu-collab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Visual user grid permissions */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-white/5">
                <div className="space-y-2">
                  <p className="text-[9px] text-slate-500 font-black uppercase">Invitation Rôle : Rédacteur SEO</p>
                  <label className="flex items-center gap-2 text-[10px] text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={permissions.seoWriter.writeBlog} 
                      onChange={() => setPermissions(prev => ({ ...prev, seoWriter: { ...prev.seoWriter, writeBlog: !prev.seoWriter.writeBlog } }))}
                      className="accent-violet-500"
                    />
                    Écrire Articles Blog
                  </label>
                  <label className="flex items-center gap-2 text-[10px] text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={permissions.seoWriter.deleteDb} 
                      disabled
                      className="accent-violet-500"
                    />
                    <span className="text-red-400/80 font-semibold line-through">Supprimer DB WooCommerce</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] text-slate-500 font-black uppercase">Invitation Rôle : Logisticien</p>
                  <label className="flex items-center gap-2 text-[10px] text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={permissions.stockManager.editStock} 
                      onChange={() => setPermissions(prev => ({ ...prev, stockManager: { ...prev.stockManager, editStock: !prev.stockManager.editStock } }))}
                      className="accent-violet-500"
                    />
                    Ajuster Stocks
                  </label>
                  <label className="flex items-center gap-2 text-[10px] text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={permissions.stockManager.changePrices} 
                      disabled
                      className="accent-violet-500"
                    />
                    <span className="text-red-400/80 font-semibold line-through">Modifier Prix Catalogue</span>
                  </label>
                </div>
              </div>

              {/* Isolated container console */}
              <div className="bg-[#02050b] p-3 rounded-2xl border border-white/5 font-mono text-[9px] text-slate-400 text-left space-y-1">
                <p className="text-violet-400 font-extrabold">// CONSOLE DE DÉLÉGATION CASÉE :</p>
                <p className="text-slate-500">SYSTEM : Collaborateur ID_488 s'est connecté.</p>
                <p className="text-emerald-400">ACTION : Tentative d'accès à l'article #12. Validé (Bac à sable déporté).</p>
                <p className="text-red-400">SÉCURITÉ : Tentative de modification des configurations de base. Rejeté automatiquement.</p>
              </div>

              {/* Action trigger invite */}
              <div className="text-[10px] bg-violet-950/20 p-2.5 rounded-xl border border-violet-500/10 text-center font-bold text-violet-300">
                🚀 Multi-comptes illimité sécurisé inclus à vie !
              </div>
            </motion.div>
          )}

          {/* 8. FINANCE EMULATOR */}
          {moduleId === 'finance' && (
            <motion.div 
              key="emu-finance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Math calculation blocks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-black">Chiffre d'Affaires Brut</p>
                  <p className="text-lg font-mono font-black mt-1 text-white">{financeStats.gross} €</p>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/10 p-3 rounded-2xl text-center">
                  <p className="text-[9px] text-emerald-400 uppercase font-black">BÉNÉFICE NET EFFECTIF</p>
                  <p className={`text-lg font-mono font-black mt-1 ${parseFloat(financeStats.net) > 0 ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`}>
                    {financeStats.net} €
                  </p>
                </div>
              </div>

              {/* Finance sliders inputs */}
              <div className="space-y-2 bg-[#02050a] p-3 rounded-2xl border border-white/5 text-[10px] text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Conversions Directes :</span>
                  <span className="font-mono text-violet-400 font-bold">{financeInput.conversions} ventes</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="500" 
                  value={financeInput.conversions} 
                  onChange={(e) => setFinanceInput(prev => ({ ...prev, conversions: parseInt(e.target.value) }))}
                  className="w-full accent-violet-500 h-1"
                />

                <div className="flex justify-between items-center mt-2">
                  <span>Coût Fournisseur (COGS) :</span>
                  <span className="font-mono text-violet-400 font-bold">{financeInput.cogs.toFixed(2)} € /u</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="40" 
                  step="0.5"
                  value={financeInput.cogs} 
                  onChange={(e) => setFinanceInput(prev => ({ ...prev, cogs: parseFloat(e.target.value) }))}
                  className="w-full accent-violet-500 h-1"
                />

                <div className="pt-2 border-t border-white/5 grid grid-cols-2 text-[9px] text-slate-500 leading-tight">
                  <p>Charges Secrétariat Stripe/Paypal : -{financeStats.stripeSum} €</p>
                  <p className="text-right">Achat de base (COGS) : -{financeStats.cogsSum} €</p>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 font-bold text-center">
                Marge calculée à la seconde près sans aucun temps de chargement base de données local.
              </div>
            </motion.div>
          )}

          {/* 9. COMMUNICATION HUB EMULATOR */}
          {moduleId === 'comm-hub' && (
            <motion.div 
              key="emu-comm-hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* SMTP Queue gauge */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-black uppercase">Statut SMTP Cloud Mailer</span>
                  <span className="font-mono text-indigo-400 font-bold">SMTP STATUS: {smtpStatus}</span>
                </div>

                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${(outgoingMailCount / 5000) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Envois complets : {outgoingMailCount} / 5000</span>
                  <span className="text-emerald-400 font-sans font-bold">Taux d'ouverture est. : +45%</span>
                </div>
              </div>

              {/* Delivery rates block */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-sans font-bold bg-[#03060d] p-3 rounded-xl border border-white/5">
                <div className="p-2 bg-slate-950 rounded-lg text-center">
                  <p className="text-slate-500 text-[8px] uppercase">Délivrabilité Principale</p>
                  <p className="text-xs text-emerald-400 font-mono mt-1 font-black">99.2% OK</p>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg text-center">
                  <p className="text-slate-500 text-[8px] uppercase">Taux de Spam IP</p>
                  <p className="text-xs text-indigo-400 font-mono mt-1 font-black">0.01% Réel</p>
                </div>
              </div>

              {/* Trigger dynamic campaign */}
              <button
                onClick={triggerEmailCampaign}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                Lancer une campagne de Newsletters / Paniers
              </button>
            </motion.div>
          )}

          {/* 10. LIVE VISITOR RADAR EMULATOR */}
          {moduleId === 'wp-crm' && (
            <motion.div 
              key="emu-wp-crm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Geographic radar targeting container */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 relative h-36 border border-violet-500/10 overflow-hidden">
                {/* Visual sweep ring */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(139,92,246,0.03)_0%,transparent_70%)] animate-pulse" />
                
                {/* Target visitors */}
                {visitors.map((v) => (
                  <div 
                    key={v.id} 
                    className="absolute cursor-pointer group"
                    style={{ left: `${v.pos.x}%`, top: `${v.pos.y}%` }}
                    onClick={() => triggerCouponRadar(v.id)}
                  >
                    <span className="absolute -inset-1 rounded-full bg-violet-400/20 animate-ping" />
                    <Radio className="w-3.5 h-3.5 text-violet-400" />
                    
                    {/* Hover detail tooltip */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-violet-500/20 px-2 py-1 rounded text-[9px] whitespace-nowrap z-30">
                      <p className="font-extrabold text-white">{v.location} (Panier: {v.cartVal})</p>
                      <p className="text-red-400">{v.intent}</p>
                    </div>
                  </div>
                ))}

                <p className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                  {lastActionLog}
                </p>
              </div>

              {/* Statistics line */}
              <div className="bg-[#03060c] p-2.5 rounded-xl border border-white/5 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Micro-Script passif local : &lt; 1 KB</span>
                <span className="text-emerald-400">Récupération panier : +18%</span>
              </div>

              {/* Hint instructions */}
              <div className="text-[10px] text-slate-500 italic text-center font-medium">
                Passez votre souris sur les points du Radar pour cibler des prospects et leur envoyer de superbes coupons asynchrones instantanément !
              </div>
            </motion.div>
          )}

          {/* 11. BULK EDITOR DB CLEAN EMULATOR */}
          {moduleId === 'maintenance' && (
            <motion.div 
              key="emu-maintenance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Compacting telemetry layout */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-black">Poids Global Base de Données</p>
                  <p className="text-lg font-mono font-black mt-1 text-slate-200">{dbSize} MB</p>
                  {isCleaning && <p className="text-[8px] text-violet-400 animate-pulse font-mono tracking-wider mt-1">// NETTOYAGE EN COURS</p>}
                </div>

                <div className="bg-[#03060d] border border-white/5 p-3 rounded-2xl text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-black">Révisions & données orphelines</p>
                  <p className={`text-lg font-mono font-black mt-1 ${orphansCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {orphansCount} données
                  </p>
                </div>
              </div>

              {/* Maintenance summary explanation widget */}
              <div className="bg-[#03050a] p-3 rounded-2xl border border-white/5 text-left text-[10px] space-y-1.5 leading-relaxed text-slate-400">
                <p className="font-extrabold text-slate-200 uppercase text-[9px] tracking-wider mb-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  Moteur asynchrone hors-site
                </p>
                <p>
                  Lancer des requêtes SQL de masse sur WordPress (réductions de prix globales, restructuration de catalogue) fait crasher la plupart des hébergements mutualisés.
                </p>
                <p className="text-violet-400 font-medium">
                  Le moteur d'arrière-plan de Nexus AI exécute ces routines SQL asynchroniquement par blocs de sécurité sécurisés déportés.
                </p>
              </div>

              {/* Clean up action vacuum */}
              <button
                onClick={triggerDatabaseVacuum}
                disabled={isCleaning || orphansCount === 0}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  isCleaning || orphansCount === 0
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer border border-white/10 shadow-md'
                }`}
              >
                {orphansCount === 0 ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Base de données 100% optimisée à vie
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 text-white animate-spin" />
                    Lancer le Compactage & Nettoyage de la base MySQL
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* 12. AFFILIATION & AMBASSADEURS EMULATOR */}
          {moduleId === 'affiliation' && (
            <motion.div 
              key="emu-affiliation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Dynamic ambassadors widgets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-2.5 rounded-2xl border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Ambassadeurs Actifs</p>
                  <p className="text-lg font-mono font-black mt-1 text-amber-400">{ambassadorsCount}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-2xl border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Ventes Organiques (IA)</p>
                  <p className="text-lg font-mono font-black mt-1 text-emerald-400">+25.8%</p>
                </div>
              </div>

              {/* Status and logs */}
              <div className="bg-[#03060c] p-3 rounded-xl border border-white/5 text-xs text-slate-400 text-left space-y-1">
                <p className="font-bold text-white text-[9px] uppercase tracking-wider">// FLUX D'AFFILIATION ASYNCHRONE</p>
                <p className="text-[10px] font-mono text-slate-400">Log: {customAffiliateLog}</p>
                {showCopiedCoupon && (
                  <p className="text-[10px] text-emerald-400 font-bold animate-pulse">✓ Code promo "NEXUS-AMB-{ambassadorsCount}" généré et copié !</p>
                )}
              </div>

              {/* Action buttons */}
              <button
                onClick={() => {
                  setAmbassadorsCount(prev => prev + 1);
                  setShowCopiedCoupon(true);
                  setCustomAffiliateLog(`Nouvel ambassadeur enregistré ! Commissions passives assignées.`);
                  setTimeout(() => setShowCopiedCoupon(false), 2000);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Percent className="w-4 h-4 text-white animate-pulse" />
                Générer un coupon d'ambassadeur de combat
              </button>
            </motion.div>
          )}

          {/* 13. COCKPIT & HUB CENTRAL ANALYTICS EMULATOR */}
          {moduleId === 'dashboard' && (
            <motion.div 
              key="emu-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Speed latency metric panel */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Rafraîchissement d'administration</span>
                  <span className="text-[9px] text-indigo-400 font-black tracking-widest uppercase">0.1s d'affichage</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: isRefreshingDashboard ? '100%' : '15%' }}
                    transition={{ duration: isRefreshingDashboard ? 0.3 : 0.8 }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                  />
                </div>
              </div>

              {/* Statistical cockpit block */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-slate-950 rounded-xl text-center border border-white/5">
                  <p className="text-[7px] text-slate-500 uppercase font-bold">Sessions Actives</p>
                  <p className="text-xs text-slate-200 font-mono font-black">{dashActiveSession}</p>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl text-center border border-white/5">
                  <p className="text-[7px] text-slate-500 uppercase font-bold">Latence Serveur</p>
                  <p className="text-xs text-cyan-400 font-mono font-black">41ms</p>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl text-center border border-white/5">
                  <p className="text-[7px] text-slate-500 uppercase font-bold">Charge CPU</p>
                  <p className="text-xs text-violet-400 font-mono font-black">1.2%</p>
                </div>
              </div>

              {/* Refresh trigger action */}
              <button
                onClick={() => {
                  if (isRefreshingDashboard) return;
                  setIsRefreshingDashboard(true);
                  setDashActiveSession(prev => prev + Math.floor(Math.random() * 20 - 5));
                  setTimeout(() => {
                    setIsRefreshingDashboard(false);
                  }, 400);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
              >
                <RefreshCw className={`w-4 h-4 text-white ${isRefreshingDashboard ? 'animate-spin' : ''}`} />
                {isRefreshingDashboard ? 'Synchronisation brute...' : 'Rafraîchir Cockpit en 0.1s'}
              </button>
            </motion.div>
          )}

          {/* 14. SEO MAILLAGE INTERNE SEMANTIQUE EMULATOR */}
          {moduleId === 'seo-interlinks' && (
            <motion.div 
              key="emu-seo-interlinks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Graph display */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 text-center relative h-32 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-2 left-2 text-[8px] text-slate-500 uppercase font-mono tracking-widest flex items-center gap-1">
                  <Link className="w-3 h-3 text-rose-500" />
                  Réseau sémantique actif
                </div>
                
                {/* Simulated connection nodes */}
                <div className="flex justify-around items-center h-full mt-2 relative">
                  <div className="p-1 px-2.5 bg-rose-950/20 border border-rose-500/10 rounded-lg text-[9px] font-mono text-slate-300 relative z-10">
                    Blog: "SEO Vitesse"
                  </div>
                  
                  {/* Drawing link SVG line inside container */}
                  <div className="absolute left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse" />
                  
                  <div className="p-1 px-2.5 bg-rose-950/20 border border-rose-500/10 rounded-lg text-[9px] font-mono text-slate-300 relative z-10">
                    Fiche: "Nexus Suite"
                  </div>
                </div>

                <p className="text-[9px] text-emerald-400 font-mono font-bold">
                  {seoInterlinksGenerated} liens hypertextes interconnectés pour Google
                </p>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => {
                  if (isGeneratingLinks) return;
                  setIsGeneratingLinks(true);
                  setTimeout(() => {
                    setSeoInterlinksGenerated(prev => prev + 6);
                    setIsGeneratingLinks(false);
                  }, 1200);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:brightness-110 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className={`w-4 h-4 text-white ${isGeneratingLinks ? 'animate-spin' : ''}`} />
                {isGeneratingLinks ? 'Tissage sémantique IA...' : 'Tisser le maillage sémantique asynchrone'}
              </button>
            </motion.div>
          )}

          {/* 15. WOOCOMMERCE ORDERS MANAGER EMULATOR */}
          {moduleId === 'woo-orders-mgr' && (
            <motion.div 
              key="emu-woo-orders-mgr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Bulk orders tables */}
              <div className="bg-[#030610] p-3 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase border-b border-white/5 pb-1">
                  <span>Commande</span>
                  <span>Client</span>
                  <span>Statut</span>
                </div>
                {bulkOrders.map((ord) => (
                  <div key={ord.id} className="flex justify-between items-center text-[9px] font-mono bg-slate-950/60 p-1.5 px-2.5 rounded-xl border border-white/5">
                    <span className="text-violet-400 font-bold">{ord.id}</span>
                    <span className="text-slate-300">{ord.client}</span>
                    <span className={`font-bold ${ord.status.includes('Expédié') ? 'text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded' : 'text-amber-400'}`}>
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bulk shipment triggers */}
              <button
                onClick={() => {
                  if (isShippingBulk) return;
                  setIsShippingBulk(true);
                  setTimeout(() => {
                    setBulkOrders(prev => prev.map(o => ({ ...o, status: 'Expédié 📦' })));
                    setIsShippingBulk(false);
                  }, 1400);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isShippingBulk ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    Traitement logistique de masse déporté...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    Expédier en lot de masse [3 Commandes]
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* 16. PRODUCT MANAGER CATALOG EMULATOR */}
          {moduleId === 'product-manager' && (
            <motion.div 
              key="emu-product-manager"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Product list with editable fields */}
              <div className="bg-[#030610] p-3 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase border-b border-white/5 pb-1">
                  <span>Référence</span>
                  <span>Prix Simple</span>
                  <span>Ajusté</span>
                </div>
                {catalogItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-[9px] font-mono bg-slate-950/60 p-1.5 px-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-300 font-bold">{item.name}</span>
                    <span className="text-slate-500 line-through font-medium">{item.price}€</span>
                    <span className="text-cyan-400 font-black">{item.price}€</span>
                  </div>
                ))}
              </div>

              {/* Action grid button triggers */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (isMutingCatalog) return;
                    setIsMutingCatalog(true);
                    setTimeout(() => {
                      setCatalogItems(prev => prev.map(i => ({ ...i, price: Math.round(i.price * 1.1) })));
                      setIsMutingCatalog(false);
                    }, 500);
                  }}
                  className="py-1.5 px-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-xl font-bold uppercase text-[8px] tracking-wider transition-all cursor-pointer text-center"
                >
                  Appliquer +10% de masse
                </button>
                <button
                  onClick={() => {
                    setCatalogItems([
                      { id: 1, name: 'AirMax Extreme v2', price: 120 },
                      { id: 2, name: 'Pure Cotton Hoodie', price: 45 },
                      { id: 3, name: 'Premium Leather Watch', price: 180 }
                    ]);
                  }}
                  className="py-1.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold uppercase text-[8px] tracking-wider transition-all cursor-pointer text-center border border-white/5"
                >
                  Réinitialiser
                </button>
              </div>
            </motion.div>
          )}

          {/* 17. CATEGORIES & TAGS TAXONOMY EMULATOR */}
          {moduleId === 'categories-tags' && (
            <motion.div 
              key="emu-categories-tags"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Disorganized lists before merge */}
              <div className="bg-[#030610] p-3 rounded-2xl border border-white/5 space-y-1.5 text-left">
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-wider mb-1">
                  {tagsMerged ? 'Taxonomie Optimisée' : 'Synonymes Identifiés'}
                </p>
                
                {tagsMerged ? (
                  <div className="p-2 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[9px] text-emerald-400 font-mono font-bold flex items-center justify-between">
                    <span>🏷️ baskets (Fusion Unique)</span>
                    <span>28 produits</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {duplicateTags.map((t) => (
                      <div key={t.name} className="flex justify-between items-center text-[9px] font-mono bg-slate-950/60 p-1 px-2 rounded-lg border border-white/5">
                        <span className="text-red-400">🏷️ {t.name} (Synonyme)</span>
                        <span className="text-slate-500">{t.count} produits</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fusion / Clear actions */}
              <button
                onClick={() => {
                  if (tagsMerged || isMergingTags) return;
                  setIsMergingTags(true);
                  setTimeout(() => {
                    setTagsMerged(true);
                    setIsMergingTags(false);
                  }, 1200);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:brightness-110 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isMergingTags ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    Fusion taxinomique de masse...
                  </>
                ) : tagsMerged ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Indexation Google Maximale
                  </>
                ) : (
                  <>
                    <Tag className="w-4 h-4 text-white animate-pulse" />
                    Fusionner les doublons taxonomiques
                  </>
                )}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
