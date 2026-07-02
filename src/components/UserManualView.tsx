import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Share2, 
  ShoppingBag, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  FileText, 
  RotateCw, 
  Link as LinkIcon, 
  Mail, 
  ShoppingCart, 
  Package, 
  Tags, 
  Settings, 
  Globe, 
  Users, 
  Zap, 
  BookOpen, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Eye,
  Sliders,
  Play,
  FileCode,
  Gauge,
  Radio,
  Printer,
  Download,
  Layers,
  X,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { USER_MANUAL_TRANS } from './UserManualTranslations';

interface SectionDoc {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  icon: React.ComponentType<any>;
  badges: string[];
  purpose: {
    fr: string;
    en: string;
  };
  components: {
    name: string;
    description: string;
    role: string;
  }[];
  steps: string[];
  tips: string;
  // Beautiful stylized interactive render logic
  visualMockup: () => React.ReactNode;
}

export default function UserManualView() {
  const [activeDocId, setActiveDocId] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccessKey, setDownloadSuccessKey] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [showStatusPanel, setShowStatusPanel] = useState<boolean>(false);

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'print-manual') {
        setShowPrintPreview(true);
        // Clear the URL parameter so refreshing won't launch print repeatedly
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } catch (e) {
          console.warn('Could not rewrite URL:', e);
        }
        
        // Wait for page component to draw itself before launching print
        const timer = setTimeout(() => {
          try {
            window.print();
          } catch (err) {
            console.error('Auto printing failed:', err);
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const sections: SectionDoc[] = [
    {
      id: 'dashboard',
      title: 'Dashboard de Commande',
      category: 'Aperçu',
      shortDesc: "Le centre de contrôle principal affichant l'activité, les performances IA et la santé structurelle.",
      icon: LayoutDashboard,
      badges: ['Indispensable', 'Statistiques', 'Synchronisation'],
      purpose: {
        fr: "Fournir un instantané global immédiat des opérations WooCommerce, y compris le volume de données indexées, l'efficacité des automatisations et l'état général des synchronisations.",
        en: "Provide an immediate global snapshot of WooCommerce operations, including indexed data volumes, automation efficiency, and overall sync health."
      },
      components: [
        { name: "Kpi Panels", role: "Indicateurs de Performance", description: "Cartes mesurant le nombre de pages indexées, produits synchronisés, posts IA rédigés et catégories actives avec leur pourcentage d'évolution." },
        { name: "Global Sync Node", role: "Actionneur de mise à jour", description: "Bouton magnétique permettant de déclencher manuellement une synchronisation bilatérale lourde entre WordPress et le Cloud Nexus." },
        { name: "Performance Charts", role: "Visualisation", description: "Graphiques D3 affichant la progression journalière des ventes, articles rédigés, et l'impact direct du SEO Nexus sur l'audience." },
        { name: "Système de Tâches Actives", role: "Suivi opérationnel", description: "Liste des derniers travaux exécutés par l'IA (comme la génération d'articles ou la publication d'un flux)." }
      ],
      steps: [
        "Vérifiez l'état de la synchronisation via la puce lumineuse en haut à droite.",
        "Consultez les graphiques d'évolution pour isoler les pics d'activité produits.",
        "Cliquez sur 'Synchroniser' si vous venez d'ajouter de nouveaux produits sur votre WooCommerce d'origine."
      ],
      tips: "Le Dashboard est idéal à laisser ouvert sur un écran secondaire car il s'actualise lors de chaque événement critique généré par l'API.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest font-mono">Live Simulation</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Dashboard Nexus</h4>
          
          {/* Mock KPI Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">Produits Synchro</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-white font-mono">1 420</span>
                <span className="text-[9px] text-green-400 font-bold font-mono">+12%</span>
              </div>
            </div>
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">Rédacteur IA (Posts)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-white font-mono">318</span>
                <span className="text-[9px] text-blue-400 font-bold font-mono">+42</span>
              </div>
            </div>
          </div>

          {/* Mock Chart Area */}
          <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Activité Mensuelle</span>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="h-20 flex items-end justify-between px-2 gap-1 pt-4">
              <div className="w-6 h-[20%] bg-blue-500/20 border-t-2 border-blue-500 rounded-t" />
              <div className="w-6 h-[40%] bg-blue-500/20 border-t-2 border-blue-500 rounded-t" />
              <div className="w-6 h-[35%] bg-blue-500/20 border-t-2 border-blue-500 rounded-t" />
              <div className="w-6 h-[70%] bg-blue-500/20 border-t-2 border-blue-500 rounded-t" />
              <div className="w-6 h-[60%] bg-blue-500/20 border-t-2 border-blue-500 rounded-t" />
              <div className="w-6 h-[90%] bg-blue-600/30 border-t-2 border-blue-400 rounded-t shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-400">Structure WordPress connectée à 100%</span>
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-500">PING: 24ms</span>
          </div>
        </div>
      )
    },
    {
      id: 'pixels',
      title: 'Multi-Pixel Publicitaire',
      category: 'Marketing & Ventes',
      shortDesc: "Gérez, connectez et auditez vos balises publicitaires (Meta, GA4, TikTok et Pinterest) depuis un cockpit unifié.",
      icon: Layers,
      badges: ['Pixels', 'RGPD', 'Conversions API', 'Dédoublonnage'],
      purpose: {
        fr: "Centraliser et simplifier la configuration de vos balises publicitaires sans subir de ralentissement du fil principal d'origine. Notre connecteur asynchrone permet d'injecter et auditer la bonne correlation de vos logs d'événements.",
        en: "Centralize and secure advertising tracking configurations (Meta, GA4, TikTok, Pinterest) with lightweight, deferred async triggers."
      },
      components: [
        { name: "Sélecteur d'Onglets Publicitaires", role: "Interface", description: "Basculez entre les volets de chaque régie (Meta Ads, Google GA4, TikTok, Pinterest) pour ajuster individuellement leurs attributs." },
        { name: "Formulaire d'ID & Interrupteur Activer", role: "Paramétrage", description: "Saisie de votre ID de tracking unique et switch d'activation générale pour le site connecté." },
        { name: "Maillage de Tunnel AIDA (Événements)", role: "Conversion", description: "Cases à cocher pour cibler les moments stratégiques à rapporter : PageView, InitiateCheckout, ou Purchase." },
        { name: "Diagnostic Sandbox G-AI", role: "Contrôleur", description: "Module de scan simulant la validité SSL, la déduplication et les taux d'indice EMQ pour évaluer la propreté d'injection." }
      ],
      steps: [
        "Sélectionnez la plateforme publicitaire de votre choix via les boutons de la console.",
        "Saisissez votre ID unique (ex: ID du pixel Meta ou code GA4 en G-XXXXX).",
        "Décidez d'activer ou d'exclure individuellement le suivi en basculant l'interrupteur.",
        "Cochez ou décochez les événements du tunnel de vente pour n'enregistrer que le trafic désiré.",
        "Cliquez sur 'Scanner' pour exécuter l'audit asynchrone et vérifier la propreté de vos tags."
      ],
      tips: "Utilisez le bouton 'Exporter PHP Script' en haut à droite si vous préférez inscrire manuellement les scripts dans le fichier functions.php de votre WordPress WooCommerce.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">Pixel Monitor</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Nexus Pixel Controller</h4>
          
          <div className="bg-black/60 border border-slate-850 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-white font-mono">META ADS PIXEL</span>
              </div>
              <span className="text-[8px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded font-black font-mono">ACTIF</span>
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-850 pt-2 pb-1 font-mono">
              <span>PageView Event</span>
              <span className="text-blue-400 font-bold">1 240 capturés</span>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
              <span>Purchase Event</span>
              <span className="text-emerald-400 font-bold">92 commandes</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'finance',
      title: "Analyse des Profits & Intelligence Financière",
      category: 'Aperçu',
      shortDesc: "Modélisez, calculez et visualisez à la volée vos marges nettes réelles après déduction des commissions, COGS et budgets pubs.",
      icon: Coins,
      badges: ['Finances', 'Rentabilité', 'Marges Réelles'],
      purpose: {
        fr: "Fournir un cockpit de suivi financier temps réel déduisant dynamiquement le coût de revient (COGS), les frais Stripe/PayPal et le budget publicitaire réglables des ventes WooCommerce brutes.",
        en: "Provide a real-time financial control panel dynamically subtracting COGS, Stripe/PayPal transaction fees, and a customizable Ads budget from raw sales."
      },
      components: [
        { name: "Indicateurs Centraux de Profit", role: "KPIs Comptables", description: "Cartes d'analyse présentant le chiffre d'affaires brut, les frais bancaires de passerelle (ex. Stripe/PayPal), le coût d'achat COGS, le budget ADS publicitaire et le bénéfice net." },
        { name: "Courbes d'Évolution Rapprochées", role: "Modélisation Visuelle", description: "Graphique interactif bicolore affichant la rentabilité brute face au profit réel net, avec curseurs d'isolation exclusifs à la volée." },
        { name: "Ajusteur de Dépenses Pub & COGS", role: "Mise à jour rapide", description: "Saisie directe de votre budget d'acquisition publicitaire (Meta, Google) et réglage des coûts COGS moyens pour recalculer instantanément le bénéfice net." },
        { name: "Webhook Logistique Financière", role: "Intégration", description: "Fournit un point d'entrée API hautement ordonné pour exporter vos statistiques de performance nette vers vos outils comptables tiers." }
      ],
      steps: [
        "Vérifiez vos cartes KPI pour connaître l'évolution immédiate de votre marge bénéficiaire nette.",
        "Utilisez les boutons-filtres interactifs situés au-dessus du graphique pour basculer entre la vue globale, le bénéfice net exclusif ou les ventes brutes.",
        "Survolez les points graphiques pour faire apparaître le détail analytique glissant du jour sélectionné (frais déduits, COGS, coût publicitaire journalier).",
        "Cliquez sur l'icône calendrier ou budget pub dans le panneau pour enregistrer les montants journaliers dépensés sur Meta/Google."
      ],
      tips: "Conservez une marge bénéficiaire nette d'au moins 20% pour couvrir sereinement vos investissements et garantir la pérennité structurelle de votre commerce.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Simulateur Profits</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Profit Analytics</h4>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-black/40 border border-slate-800 p-2.5 rounded-xl text-center">
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">CA Brut</span>
              <p className="text-xs font-bold text-indigo-400 font-mono mt-0.5">14 240 €</p>
            </div>
            <div className="bg-black/40 border border-slate-800 p-2.5 rounded-xl text-center">
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">Dépenses Ads</span>
              <p className="text-xs font-bold text-rose-400 font-mono mt-0.5">2 400 €</p>
            </div>
            <div className="bg-black/40 border border-slate-800 p-2.5 rounded-xl text-center">
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">Bénéfice Net</span>
              <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">+5 820 €</p>
            </div>
          </div>
          
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[8.5px] font-black text-slate-400 uppercase">Marge de Rentabilité Nette</span>
              <span className="text-[9px] font-mono text-emerald-400 font-black">40.8%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 w-[40.8%]" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'social',
      title: 'NEXUS SOCIAL & VIDÉO STUDIO',
      category: 'Marketing & Ventes',
      shortDesc: "Générez des accroches percutantes, créez des vidéos marketing verticales (AIDA), modulez des voix off IA réalistes et téléchargez directement vos fichiers MP4.",
      icon: Share2,
      badges: ['Vidéo Studio', 'IA Synthèse Vocale', 'Force Download', 'Automatisation'],
      purpose: {
        fr: "Convertir intelligemment vos fiches produits WooCommerce en accroches publicitaires multicanaux et en vidéos de vente verticales sonorisées par synthèse vocale (Antoni, Rachel, Bella), prêtes à poster sur TikTok, Reels et Shorts.",
        en: "Intelligently convert your WooCommerce products into multi-channel social hooks and vertical video advertisements with customized AI voice-overs (Antoni, Rachel, Bella) ready for TikTok, Reels, and Shorts."
      },
      components: [
        { name: "Scripteur de Ventes AIDA", role: "Générateur de Script", description: "Construit instantanément un argumentaire commercial structuré (Attention, Intérêt, Désir, Action) adapté au produit sélectionné." },
        { name: "Sélecteur de Profil Vocal", role: "Synthétiseur de Voix", description: "Alterne instantanément entre Antoni (ton grave, posé et autoritaire), Bella (ton enjoué, solaire et enthousiaste) ou Rachel (ton corporate et commercial)." },
        { name: "Compilateur Vidéo Vertical", role: "Rendu Visuel", description: "Génère un diaporama dynamique ou un flux vidéo MP4 de présentation synchronisé avec la lecture audio." },
        { name: "Proxy d'Extraction MP4", role: "Contournement IFrame", description: "Contourne la sécurité d'iframe pour forcer un téléchargement direct et propre du fichier vidéo MP4 sur votre disque." }
      ],
      steps: [
        "Sélectionnez un produit cible dans la liste de votre catalogue WooCommerce.",
        "Cliquez sur 'Générer avec Nexus AI' pour concevoir vos textes accrocheurs et votre script vocal AIDA.",
        "Choisissez l'avatar vocal idéal (Antoni, Bella, Rachel) pour adapter le pitch, le rythme et la sonorité de l'audition.",
        "Générez la vidéo publicitaire, lisez-la sur le canevas en direct, puis cliquez sur 'Télécharger le MP4' pour sauvegarder le fichier sans erreur de navigateur."
      ],
      tips: "Pour de meilleures performances de vente : utilisez Bella pour les produits de mode/loisirs en quête d'énergie, Antoni pour l'image de marque ou l'autorité, et Rachel pour les offres B2B.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest font-mono">Vidéo Active Studio</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Nexus Video Studio & Voice Swapper</h4>
          
          {/* Post box wireframe */}
          <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[8px] text-emerald-400">V</div>
                <div>
                  <p className="text-[9px] font-black text-white leading-none">AIDA Render Manager</p>
                  <p className="text-[7px] text-slate-500 leading-none mt-1">Direct MP4 Engine</p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 text-[6px] rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">1080x1920 HD</span>
            </div>

            {/* Video player canvas preview */}
            <div className="aspect-[9/16] max-w-[120px] mx-auto bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-end p-2 mb-3">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              
              {/* Voice equalizer animation */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-0.5 z-20">
                <span className="w-1 h-4 bg-emerald-500 rounded animate-[pulse_1s_infinite_0.1s]" />
                <span className="w-1 h-8 bg-emerald-400 rounded animate-[pulse_1s_infinite_0.3s]" />
                <span className="w-1 h-6 bg-emerald-500 rounded animate-[pulse_1s_infinite_0.2s]" />
                <span className="w-1 h-2 bg-emerald-600 rounded animate-[pulse_1s_infinite_0.4s]" />
              </div>

              <div className="z-20 text-left">
                <span className="text-[6px] px-1 bg-emerald-500 text-black font-black uppercase tracking-wider rounded">Voix : Bella</span>
                <p className="text-[7px] text-white font-bold leading-tight mt-1">✨ Profitez de cette promotion exclusive aujourd'hui !</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[8px] text-slate-400 font-mono">Bouton de téléchargement direct proxy actif</p>
            </div>
          </div>
 
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-emerald-600/10 border border-emerald-500/30 p-2 rounded-xl flex flex-col items-center justify-center">
              <Share2 className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[7px] font-black text-white font-mono uppercase">Lancer Rendu</span>
            </button>
            <button className="bg-blue-600/10 border border-blue-500/30 p-2 rounded-xl flex flex-col items-center justify-center">
              <Download className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-[7px] font-black text-white font-mono uppercase">Télécharger</span>
            </button>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex flex-col items-center justify-center">
              <span className="text-[7px] text-slate-500 font-black uppercase font-mono text-center">Bypass Sandbox</span>
              <span className="text-[6px] text-emerald-400 font-mono font-bold">Proxy OK</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'smart-feed',
      title: 'FLUX SMART SHOPPING',
      category: 'Marketing & Ventes',
      shortDesc: "Générez et automatisez vos flux de produits XML pour Google Merchant Center, Facebook et WooCommerce.",
      icon: ShoppingBag,
      badges: ['XML', 'Google Shopping', 'Catalogue'],
      purpose: {
        fr: "Créer un fichier de flux synchronisé en temps réel contenant l'intégralité de vos stocks, images, et tarifs pour vos publicités publicitaires (Google Ads, Meta Remarketing).",
        en: "Create a real-time synchronized feed file containing your inventory, images, and pricing for advertising engines (Google Ads, Meta Remarketing)."
      },
      components: [
        { name: "Générateur XML Smart Node", role: "Extracteur de données", description: "Convertit le catalogue produit WooCommerce complexe en code XML hautement structuré que Google et Meta adorent analyser." },
        { name: "Filtres d'export", role: "Convertisseur qualitatif", description: "Permet d'exclure les produits en rupture de stock pour ne pas dépenser inutilement votre budget de publicité." },
        { name: "Smart Tags Indexer", role: "Taxonomie", description: "Attribue les taxonomies officielles Google Shopping (ex: Vêtements -> Vestes) à vos catégories existantes pour de meilleures performances SEO." }
      ],
      steps: [
        "Sélectionnez le groupe de produits à exporter (Tous ou une catégorie ciblée).",
        "Activez l'option d'exclusion des articles en rupture.",
        "Cliquez sur 'Générer le Flux XML'. Vous obtiendrez un lien URL statique (ex: /api/feeds/google-shopping).",
        "Copiez ce lien directement dans votre console Google Merchant Center."
      ],
      tips: "Configurez l'actualisation journalière dans Google Merchant Center ; l'API de Nexus garantira que les variations de prix se mettent à jour automatiquement à minuit.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest font-mono">Live Schema</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Smart Shopping Optimizer</h4>
          
          {/* Feed Generator Visual */}
          <div className="flex items-center gap-4 bg-black/40 border border-slate-800 p-4 rounded-2xl mb-4">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center relative shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="text-[10px] font-black text-emerald-400 font-mono">XML</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[8px] font-black uppercase text-slate-500 font-mono">Flux Stat (Google format)</span>
              <p className="text-[11px] font-bold text-white truncate leading-none mt-1">/api/feeds/merchant_center_feed.xml</p>
              <div className="flex gap-2 items-center mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[7px] text-slate-400 uppercase tracking-widest font-mono font-bold leading-none">100% Validé par Google Bot</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-900 p-3 rounded-2xl font-mono text-[8px] text-slate-400 space-y-1">
            <p className="text-blue-400">&lt;item&gt;</p>
            <p className="pl-4">&lt;g:id&gt;<span className="text-white">nexus_prod_104</span>&lt;/g:id&gt;</p>
            <p className="pl-4">&lt;g:title&gt;<span className="text-yellow-400">Ebook SEO Automatisé v3</span>&lt;/g:title&gt;</p>
            <p className="pl-4">&lt;g:price&gt;<span className="text-green-400">49.00 EUR</span>&lt;/g:price&gt;</p>
            <p className="pl-4">&lt;g:availability&gt;<span className="text-emerald-400">in_stock</span>&lt;/g:availability&gt;</p>
            <p className="text-blue-400">&lt;/item&gt;</p>
          </div>
        </div>
      )
    },
    {
      id: 'market',
      title: 'Intelligence Marché',
      category: 'Marketing & Ventes',
      shortDesc: "Espionnez poliment les prix et les stratégies textuelles de vos concurrents directs.",
      icon: Zap,
      badges: ['SEO Concurrentiel', 'Veille Tarifaire', 'Analyses'],
      purpose: {
        fr: "Scraper et analyser les boutiques concurrentes pour positionner de manière agressive vos prix de vente et récolter les secrets de leur maillage Google.",
        en: "Scrape and analyze competitor stores to dynamically position your prices and map their Google ranking secret keywords."
      },
      components: [
        { name: "Competitor Add Node", role: "Ajouteur de cibles", description: "Permet de renseigner l'URL de n'importe quel site internet concurrent pour l'ajouter à votre radar de veille automatique." },
        { name: "Scraper de Tarifs", role: "Crawler robot", description: "Explore de façon asynchrone le catalogue de votre concurrent, extrait ses prix et calcule l'écart de marge exact avec vos propres articles." },
        { name: "Analyse Sémantique IA", role: "Rapports d'opportunité", description: "Compare les balises H1, Titres et Descriptions du concurrent pour proposer des mots-clés de niche encore inexploités." }
      ],
      steps: [
        "Saisissez l'URL racine de votre concurrent direct dans le module d'espionnage.",
        "Laissez le robot analyser le code source du site cible pendant approximativement 30 secondes.",
        "Consultez le tableau comparatif des écarts de prix pour ajuster vos tarifs."
      ],
      tips: "Si un concurrent vend un produit similaire à plus de 15% plus cher, augmentez légèrement vos prix tout en maintenant une réduction factice de 5% pour stimuler la conversion psychologique.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest font-mono">Live Radar</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Market Spy Engine</h4>
          
          {/* Competitor list mapping */}
          <div className="space-y-2 mb-4">
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-white">competitor-shop.eu</p>
                <p className="text-[7px] text-slate-500 uppercase tracking-widest mt-1">SEO Rank: #4 820 • 24 produits similaires</p>
              </div>
              <span className="text-[8px] font-mono font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">-8% MOINS CHER</span>
            </div>
            
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-white">mega-discount.fr</p>
                <p className="text-[7px] text-slate-500 uppercase tracking-widest mt-1">SEO Rank: #14 310 • 12 produits similaires</p>
              </div>
              <span className="text-[8px] font-mono font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">+15% PLUS CHER</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <p className="text-[8px] font-black uppercase text-indigo-400 mb-1">💡 Opportunité IA de Rédaction</p>
            <p className="text-[10px] text-slate-300">Votre concurrent est mal positionné sur la thématique <span className="text-yellow-400 font-mono font-bold">\"Plugin SEO WooCommerce\"</span>. Rédigez un guide avec Nexus Content pour capter leur trafic !</p>
          </div>
        </div>
      )
    },
    {
      id: 'wp-crm',
      title: 'Gestion Clientèle & Radar WP',
      category: 'Marketing & Ventes',
      shortDesc: "Suivez l'activité des visiteurs de votre boutique WordPress en direct et simulez les gains de conversion.",
      icon: Radio,
      badges: ['Radar Live', 'Analyse Comportementale', 'Outils de Conversion'],
      purpose: {
        fr: "Fournir une interface en temps réel monitorant le trafic de votre WooCommerce, un cockpit d'intégration du script asynchrone, et un simulateur d'opportunité d'optimisation de chiffre d'affaires.",
        en: "Provide a live workflow tracking WooCommerce shopper events, an async script copyboard, and a numerical simulator projecting revenue lifts."
      },
      components: [
        { name: "Live Shopper Radar", role: "Télémétrie Client", description: "Affiche le nom, le panier actif, la page consultée et le canal de provenance de vos paniers chauds en temps réel." },
        { name: "Simulateur de Conversion Matrix", role: "Modulateur Économique", description: "Outil de simulation What-If permettant de faire varier le trafic pour prévisualiser le gain financier d'un taux de conversion optimisé par l'IA." },
        { name: "Script Connector Node", role: "Intégration", description: "Fournit le tag de tracking JavaScript asynchrone ultraléger à coller sur votre site pour initier la télémétrie." }
      ],
      steps: [
        "Copiez le code d'intégration présent sous l'onglet 'Script de Tracking'.",
        "Insérez-le dans le pied de page (footer) ou via un plugin de gestion de scripts sur votre WordPress d'origine.",
        "Observez l'activité s'afficher instantanément sur le tableau de bord du Radar.",
        "Ajustez les curseurs du simulateur pour analyser les gisements de croissance s'offrant à vous."
      ],
      tips: "Associez ce radar à l'Autopilot d'envois d'e-mails pour relancer automatiquement les visiteurs indécis ou paniers abandonnés repérés par le script.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono">Simulateur Actif</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Client Live Radar</h4>
          
          <div className="space-y-2 mb-4">
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex gap-2.5 items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <div>
                  <p className="text-[10px] font-black text-white">Marie D. (Boutique active)</p>
                  <p className="text-[7px] text-slate-500 lowercase tracking-widest mt-0.5">Consultation produit • Tapis Zen Premium</p>
                </div>
              </div>
              <span className="text-[8px] font-mono text-indigo-300 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">Paris, FR</span>
            </div>
          </div>
          
          {/* Matrix simulator wireframe */}
          <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-black uppercase text-slate-400">Taux de Conversion (IA assisté)</span>
              <span className="text-emerald-400 font-mono text-[9px] font-bold">6.4%</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-2/3" />
            </div>
            <p className="text-[8.5px] text-slate-400 font-medium font-sans">Projection de Chiffre d'Affaire Additionnel : <span className="text-amber-400 font-bold font-mono">+1 590 €/mois</span></p>
          </div>
        </div>
      )
    },
    {
      id: 'stock',
      title: 'Analyse Stocks & Logistique',
      category: 'Stocks & Logistique',
      shortDesc: "Gérez intelligemment les niveaux de vos stocks et optimisez la logistique de votre boutique.",
      icon: TrendingUp,
      badges: ['Logistique', 'Rupture', 'KPI Stocks'],
      purpose: {
        fr: "Fournir un rapport complet sur vos performances d'inventaire, identifier les produits dits à 'rotation rapide' (best-sellers) ou à 'rotation lente' (poids morts), et suivre les valeurs d'inventaire.",
        en: "Provide a complete report on inventory performance, identify 'fast-moving' and 'slow-moving' items, and track total asset valuation."
      },
      components: [
        { name: "Dead Stock Tracer", role: "Optimiseur d'actifs", description: "Isoler les références produits stockées depuis plus de 90 jours sans la moindre commande enregistrée." },
        { name: "Fast Stock Identifier", role: "Booster de rentabilité", description: "Classe en temps réel vos best-sellers pour vous s'assurer qu'aucun retard logistique ne bloque leur livraison." },
        { name: "Stock Value Calculator", role: "Comptabilité", description: "Estime la valeur globale financière immobilisée dans votre entrepôt d'après vos coûts d'achats." }
      ],
      steps: [
        "Vérifiez l'indicateur graphique de la valeur totale de votre catalogue stock.",
        "Consultez la liste des articles marqués comme 'Alerte Rupture Immédiate'.",
        "Commandez directement auprès de vos fournisseurs la quantité suggérée en un clic."
      ],
      tips: "Organisez des campagnes de soldes flash ou de cadeaux d'achat pour écouler en un temps record les produits catalogués en tant que 'Poids Lents'.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Live Stocks</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Stock Logistics</h4>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl text-center">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rotation Rapide</span>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">42 réf.</p>
              <p className="text-[7.5px] text-slate-500 uppercase font-mono leading-none mt-1">Sains</p>
            </div>
            
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl text-center">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">A Rotation Lente</span>
              <p className="text-xl font-bold text-red-400 font-mono mt-1">104 réf.</p>
              <p className="text-[7.5px] text-slate-500 uppercase font-mono leading-none mt-1">Stock dormant</p>
            </div>
          </div>

          <div className="p-3 bg-yellow-600/10 border border-yellow-500/20 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white">Tapis Zen Lotus (Pack 3)</p>
              <p className="text-[8px] text-slate-500 font-mono mt-0.5">Reste : 2 unités • Alerte critique</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-mono font-bold text-[8px] border border-yellow-500/20">RUPTURE J-3</span>
          </div>
        </div>
      )
    },
    {
      id: 'forecast',
      title: 'Nexus Forecast',
      category: 'Stocks & Logistique',
      shortDesc: "Prédisez graphiquement les ventes futures et évitez les ruptures de stocks saisonnières.",
      icon: BarChart3,
      badges: ['IA Prédictive', 'Ventes', 'Saisonnalité'],
      purpose: {
        fr: "Utiliser des modèles mathématiques de régression pour calculer la courbe future des ventes d'après vos chiffres historiques, guidant vos approvisionnements.",
        en: "Use mathematical regression models to forecast sales curves based on historical data, guiding your procurement."
      },
      components: [
        { name: "Predictive Vector Curve", role: "Simulation graphique", description: "Une ligne de projection s'étendant sur les 3 prochains mois de ventes, indiquant les limites supérieures et inférieures de confiance." },
        { name: "Seasonality Adjuster", role: "Modulateur contextuel", description: "Curseur permettant d'ajuster l'équation de prédiction selon les fêtes (ex: Noël, Black Friday, Soldes de Juillet)." },
        { name: "Procuration Calculator", role: "Acheteur d'inventaire", description: "Suggère un nombre quantitatif exact d'articles à commander auprès des grossistes pour répondre sereinement à la demande estimée." }
      ],
      steps: [
        "Sélectionnez le produit ou la catégorie phare de votre boutique.",
        "Modifiez le curseur de coefficient d'accélération économique (selon vos prévisions marketing).",
        "Visualisez instantanément la courbe se déformer positivement sur le graphique."
      ],
      tips: "Prévoyez vos stocks d'après la limite haute si vous possédez un bon budget publicitaire ; l'inverse risquerait de frustrer votre trafic qualifié en rupture.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">Live Forecast Tool</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Nexus Sales Projection</h4>
          
          <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 mb-4">
            <div className="h-28 flex items-end justify-between px-2 gap-1 pt-6 relative">
              {/* Grid backdrop */}
              <div className="absolute inset-0 border-b border-dashed border-slate-800/80 pointer-events-none top-1/2" />
              
              <div className="w-4 h-8 bg-slate-800 rounded-t text-center text-[6px] text-white">Mai</div>
              <div className="w-4 h-12 bg-slate-800 rounded-t text-center text-[6px] text-white">Juin</div>
              <div className="w-4 h-14 bg-slate-800 rounded-t text-center text-[6px] text-white">Juil</div>
              {/* Forecast (dotted/neon) */}
              <div className="w-4 h-20 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-t text-center text-[6px] text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]">Août</div>
              <div className="w-4 h-24 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-t text-center text-[6px] text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]">Sept</div>
              <div className="w-4 h-16 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-t text-center text-[6px] text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]">Oct</div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block">Progression Attendue Q3</span>
              <span className="text-xs font-black text-white font-mono mt-1">+34.8% Ventes globales</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <span className="text-[8px] font-black text-blue-400 uppercase font-mono">Modèle : ARIMA v5</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'audit',
      title: 'Audit & Analyse SEO',
      category: 'SEO & Contenu',
      shortDesc: "Vérifiez la structure technique et sémantique de vos pages pour être certain de plaire à Google.",
      icon: ShieldCheck,
      badges: ['Analyse Technique', 'Checklist SEO', 'Sémantique'],
      purpose: {
        fr: "Analyser en profondeur et déceler instantanément les erreurs critiques de balises Hx, description absente, lenteur ou densité anormale de mots-clés sur votre domaine.",
        en: "Deep-dive analyze and instantaneously locate critical errors in heading tags, absent metadata, speed issues, or abnormal keyword density on your domain."
      },
      components: [
        { name: "SEO Score Circular Gauge", role: "KPI Synthétique", description: "Jauge visuelle notée sur 100 estimant l'indexabilité globale de l'URL cible choisie d'après les règles de Core Web Vitals." },
        { name: "Metadata Health Reporter", role: "Détecteur d'anomalies", description: "Analyse en direct les balises : Title trop long, Meta-Description absente, absence de texte alternatif (Alt) sur les images." },
        { name: "Keyword Density Array", role: "Compréhension sémantique", description: "Liste sous forme de tableau les termes les plus souvent répétés sur votre page pour éviter le keyword stuffing (surcharge nuisible)." }
      ],
      steps: [
        "Saisissez l'adresse URL complète de la page à évaluer.",
        "Appuyez sur 'Lancer l'Audit SEO'.",
        "Suivez scrupuleusement la liste des erreurs critiques corrigibles en quelques minutes."
      ],
      tips: "Une vitesse supérieure à 2 secondes rebute Google ; pensez à désactiver vos extensions WordPress inutiles si votre audit affiche un score de vitesse médiocre.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Live Audit Module</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : SEO Audit Engine</h4>
          
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-full border-[6px] border-emerald-600/20 border-t-emerald-500 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="text-lg font-black text-white font-mono leading-none">88</span>
              <span className="text-[7px] text-slate-500 uppercase tracking-widest leading-none font-black mt-1">Sur 100</span>
            </div>
            
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded bg-green-400" />
                <span className="text-[9px] text-slate-300">Balises d'En-têtes H1 : OK</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded bg-yellow-400" />
                <span className="text-[9px] text-slate-300">Meta-Description : Un peu courte</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded bg-red-400" />
                <span className="text-[9px] text-slate-300">6 images sans attribut Alt</span>
              </div>
            </div>
          </div>

          <div className="bg-black/50 border border-slate-800 rounded-2xl p-3 flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-mono">Performance technique</span>
            <span className="font-bold text-green-400 font-mono">92% (Excellent)</span>
          </div>
        </div>
      )
    },
    {
      id: 'content',
      title: 'Rédacteur Intelligent / Assistant IA',
      category: 'SEO & Contenu',
      shortDesc: "Générez des articles de blog optimisés pour le SEO et entièrement structurés par l'IA.",
      icon: FileText,
      badges: ['IA Rédacteur', 'Mots-Clés', 'Boutique WordPress'],
      purpose: {
        fr: "Créer, structurer ou reformuler instantanément des articles de blog et fiches produits WooCommerce, orientés vers l'acquisition de nouveaux mots-clés de recherche.",
        en: "Instantly create, structure, or rephrase blog articles and WooCommerce product descriptions optimized to capture new target search terms."
      },
      components: [
        { name: "Rédacteur Automatique IA", role: "Intelligence", description: "Utilise le moteur de raisonnement Nexus pour rédiger des articles fluides allant du résumé rapide au dossier complet de 2000 mots." },
        { name: "Keyword Target Panel", role: "Sémantique", description: "Saisie de mots-clés prioritaires de recherche pour forcer le rédacteur IA à les intégrer naturellement dans ses balises H2 et H3." },
        { name: "Auto Featured Picture Generator", role: "Média créatif", description: "Initialise l'illustration de vos bannières d'articles à partir de concepts de prompts visuels génératifs." }
      ],
      steps: [
        "Inscrivez la thématique générale de votre article.",
        "Ajoutez vos mots-clés prioritaires séparés par des virgules.",
        "Sélectionnez le ton sémantique recherché (Professionnel, Enjoué, Amical, Brut).",
        "Cliquez sur 'Générer la Structure'. L'IA préparera le squelette, puis remplira les chapitres."
      ],
      tips: "Relisez toujours le premier paragraphe pour y insérer une touche personnelle ou l'histoire humaine de votre marque, car l'authenticité plaît énormément aux lecteurs réels.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest font-mono">Live Editor Preview</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Nexus Copilot Editor</h4>
          
          <div className="bg-black/50 border border-slate-800 rounded-2xl p-4">
            <div className="flex gap-2 mb-3">
              <span className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span className="w-3 h-3 bg-green-400 rounded-full" />
            </div>
            
            <p className="text-xs font-black text-white font-serif mb-2 border-b border-slate-800 pb-2">Les 10 Commandements d'un Shopify Performant</p>
            
            <p className="text-[9.5px] text-slate-400 leading-relaxed font-sans mt-2">
              Le monde de l'e-commerce en 2026 est plus féroce que jamais. Pour sortir du lot face à une concurrence armée d'intelligences artificielles, la clé réside dans <span className="text-yellow-400 underline decoration-yellow-400/50">l'autorité thématique sémantique</span>...
            </p>
            
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[7px] text-slate-500 font-mono">Mots: 450 / 1200 • SEO Score: 94%</span>
              <button className="px-3 py-1 bg-blue-500 text-white font-mono text-[8px] font-black rounded-lg uppercase">Publier sur WP</button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'autopilot',
      title: 'Autopilote Nexus AI',
      category: 'SEO & Contenu',
      shortDesc: "Programmez l'écriture et la publication de contenus en totale autonomie d'après vos créneaux.",
      icon: RotateCw,
      badges: ['Autonomie', 'Indexation Robot', 'Calendrier'],
      purpose: {
        fr: "Créer un calendrier autonome où notre moteur d'IA explore l'actualité de votre niche à intervalle régulier, formule des de nouveaux articles de qualité et les publie sans intervention humaine.",
        en: "Establish an autonomous calendar layout where our AI engine crawls niche trends, drafts fresh updates, and publishes them back-to-back with zero manual work."
      },
      components: [
        { name: "Cron Job Trigger Table", role: "Planificateur de tâches", description: "Définit les heures exactes et la récurrence de génération (ex: Tous les lundis à 08h00)." },
        { name: "Feed Crawler Node", role: "Explorateur de tendances", description: "Scrape des sources de flux RSS ou d'actualités mondiales choisies pour y dégoter des idées d'actualités." },
        { name: "Filtre Sémantique Régulateur", role: "Securité sémantique", description: "Filtre les données douteuses de vos sources pour s'assurer que vos articles sur l'autopilote respectent la charte qualité." }
      ],
      steps: [
        "Sélectionnez le sujet central ('La nutrition sportive', 'Le marketing et l'IA', etc.).",
        "Choisissez la fréquence de rédaction autonome souhaitée.",
        "Connectez vos thématiques spécifiques et activez l'interrupteur 'Autopilote Actif'."
      ],
      tips: "Visitez la section au moins une fois par mois pour affiner les mots-clés négatifs (termes interdits que l'IA doit à tout prix exclure de ses textes automatiques).",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">Live Cockpit</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Nexus Autopilot</h4>
          
          <div className="flex bg-black/40 border border-slate-800 p-4 rounded-2xl items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black text-white">Mode Autopilote Global</p>
              <p className="text-[8px] text-slate-500 uppercase font-mono mt-1">Dernier article : Hier à 14:22</p>
            </div>
            
            <div className="w-12 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 p-1 flex justify-end items-center relative cursor-not-allowed">
              <span className="text-[6px] font-extrabold text-blue-400 uppercase tracking-widest absolute left-2 font-mono">ON</span>
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
            </div>
          </div>

          <div className="bg-black/50 border border-slate-800 rounded-2xl p-3">
            <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block mb-2">Prochaines publications planifiées</span>
            <div className="space-y-1.5 font-mono text-[9px]">
              <div className="flex justify-between items-center text-slate-300">
                <span>🗓️ Lundi, 08:00</span>
                <span className="text-blue-400 text-[8px] font-bold">SEO WordPress Avancé</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>🗓️ Mercredi, 08:00</span>
                <span className="text-blue-400/60 text-[8px] font-bold">Optimisation Cache</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'internal-links',
      title: 'Maillage Interne Automatique',
      category: 'SEO & Contenu',
      shortDesc: "Explorez vos articles WordPress et tissez un réseau de liens sémantiques entre eux.",
      icon: LinkIcon,
      badges: ['Liens Internes', 'Analyse Sémantique', 'SEO Silos'],
      purpose: {
        fr: "Créer un réseau cohérent contenant des ancres sémantiques cliquables pour répartir la popularité (PageRank interne) de vos pages phares vers vos articles profonds.",
        en: "Establish a coherent internal network of clickable, contextual anchors to distribute index popularity (PageRank) from cornerstone to deep pages."
      },
      components: [
        { name: "Anchor Target Selector", role: "Intelligence lexicale", description: "Scanne et identifie les mots-clés présents dans un texte qui correspondent textuellement au titre d'un autre article déjà en ligne." },
        { name: "Recommendation Node Panel", role: "Décideur direct", description: "Affiche sous forme d'une liste interactive les suggestions de liens repérées par l'IA : 'Mot-clé -> Lier vers Article cible'." },
        { name: "Batch Link Injector", role: "Actionneur de masse", description: "Bouton d'action massive permettant d'injecter tous les liens sémantiques repérés sans avoir à ouvrir chaque article individuellement." }
      ],
      steps: [
        "Cliquez sur 'Scanner le site' pour cartographier vos textes de blogs.",
        "Consultez les liaisons recommandées par notre algorithme de proximité sémantique.",
        "Cochez les liaisons qui vous plaisent et validez l'injection définitive."
      ],
      tips: "Privilégiez les liaisons sémantiques issues de la même catégorie thématique de produits pour de meilleures performances sur les algorithmes Google Core Updates.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[8px] font-black text-teal-400 uppercase tracking-widest font-mono">Live Anchors</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Link Mesh Graph</h4>
          
          <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 mb-3">
            <div className="flex items-center justify-between text-[10px] pb-2 border-b border-slate-900">
              <span className="font-extrabold text-blue-400 font-mono">Article Séquence A</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="font-extrabold text-white font-mono">Article Cible B</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-400">Ancre lexical détectée :</p>
                  <p className="text-[10px] text-white font-bold font-mono">\"optimisation des stocks\"</p>
                </div>
                <button className="px-2 py-1 bg-teal-600/20 border border-teal-500/40 text-teal-400 font-mono text-[8px] font-black rounded-lg">INJECTER</button>
              </div>
            </div>
          </div>

          <p className="text-[8px] font-mono font-bold text-slate-500 text-center uppercase tracking-widest">Calculé en temps réel • 154 propositions disponibles</p>
        </div>
      )
    },
    {
      id: 'comm-hub',
      title: 'Communication Hub',
      category: 'SEO & Contenu',
      shortDesc: "Gérez vos serveurs SMTP ou clés API Resend, concevez des templates d'emails élégants et automatisez sa délivrabilité sans ralentissement.",
      icon: Mail,
      badges: ['Emailing / SMTP', 'API HTTP Resend', 'Automation Rules v2'],
      purpose: {
        fr: "Centraliser l'envoi d'e-mails d'affaires (alertes de commandes WooCommerce, newsletters et relances de paniers) via vos serveurs SMTP réguliers ou via la configuration secondaire rapide de l'API HTTP Resend, garantissant une réception à 100%.",
        en: "Centralize professional/transactional emails via custom SMTP relays or secondary high-performance Resend HTTP API token configurations to bypass container port blocks."
      },
      components: [
        { name: "Double Passerelle SMTP & API Resend", role: "Connexion Avancée", description: "Formulaire paramétrable pour basculer en un clic entre un relais SMTP classique (Host, Port, SSL, identifiants) et l'API HTTP ultra-rapide Resend.com." },
        { name: "Template Builder IA v2", role: "Conception", description: "Éditeur HTML visuel avec personnalisation intelligente de la couleur principale de votre logo et de la mise en page." },
        { name: "Automation Rules Core", role: "Régulation Automatique", description: "Déclenche l'expédition d'emails d'après des événements WooCommerce bien précis avec remplacement automatique de balises dynamiques comme {{USER_NAME}} ou {{TOTAL_AMOUNT}}." }
      ],
      steps: [
        "Accédez aux réglages du serveur d'envoi sous l'onglet 'Configuration' ou dans l'espace 'Communication Hub'.",
        "Choisissez votre mode d'émission : Serveur SMTP classique OU la configuration innovante API HTTP Resend.",
        "Pour l'API Resend, basculez l'interrupteur, collez votre clé Secrète (commençant par 're_') générée gratuitement sur Resend.com.",
        "Utilisez le bouton de diagnostic 'Tester la connexion' pour forcer l'expédition d'un e-mail test en temps réel et valider vos privilèges.",
        "Associez vos templates HTML validés à des règles d'automatisation d'achat ou de rappel de panier abandonné."
      ],
      tips: "Astuce Cloud Run : Nous vous conseillons d'utiliser l'API HTTP Resend en configuration secondaire. Les conteneurs cloud bloquent par sécurité les ports SMTP traditionnels (25, 465, 587) sur de nombreux hébergeurs tiers. L'API Resend passe librement par le protocole HTTPS classique sans aucun blocage, améliore la vitesse d'envoi de 45% et son quota de départ est entièrement Gratuit.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">Live Comm Simulator</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Communication Hub</h4>
          
          {/* Custom Styled SMTP Connector */}
          <div className="bg-black/60 border border-slate-800 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">Connecteur Actif</span>
              <span className="text-[8px] font-mono text-emerald-400 font-bold">SMTP CONNECTÉ</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-300">
              <div className="bg-slate-950 p-2 rounded-xl">
                <span className="text-slate-500 block text-[7px] uppercase font-black">Serveur</span>
                smtp.secureserver.net
              </div>
              <div className="bg-slate-950 p-2 rounded-xl">
                <span className="text-slate-500 block text-[7px] uppercase font-black">Port de sortie</span>
                465 (SSL)
              </div>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-[10px] font-black text-white leading-none">Règle active: Commande Client</p>
                <p className="text-[8px] text-slate-400 leading-none mt-1">Envoie \"Template Bienvenue\" lors de l'achat</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold">Actif</span>
          </div>
        </div>
      )
    },
    {
      id: 'woo-manager',
      title: 'Commandes & Clients',
      category: 'Catalogue & Admin',
      shortDesc: "Consultez, modifiez vos commandes WooCommerce en temps réel et appliquez des cadeaux surprise.",
      icon: ShoppingCart,
      badges: ['Commandes & Édition', 'Remises Client', 'Synchro WooCommerce'],
      purpose: {
        fr: "Fournir un cockpit de gestion et d'édition de vos commandes WooCommerce en temps réel, permettant de moduler le panier d'achat, de configurer des remises cadeaux surprises, de suivre le statut et de communiquer par e-mail.",
        en: "Provide a real-time WooCommerce order management cockpit, allowing dynamic cart item modifications, surprise client discount setups, status checks, and customer emails."
      },
      components: [
        { name: "Order Live Editor", role: "Éditeur de commandes", description: "Permet de modifier les articles d'une commande reçue (ajouter un produit, modifier la quantité à la volée, éditer le nom ou réajuster le prix unitaire)." },
        { name: "Sélecteur & Filtrage de Catalogue", role: "Intégration Catalogue", description: "Permet de rechercher un produit WordPress existant ou de le filtrer par catégorie à l'aide d'une liste défilante claire, évitant de ressaisir manuellement les caractéristiques du produit." },
        { name: "Procédure AliExpress Dropship Réelle", role: "Automatisation de Commande", description: "Protocole d'exécution asynchrone pour passer la commande au fournisseur AliExpress d'un simple clic (connexion vendeur, transmission automatique de l'adresse de livraison du client, et validation de paiement de base), générant l'ID de commande AliExpress réel et le code de suivi." },
        { name: "Surprise Gift Discount Engine", role: "Remises Client", description: "Permet d'appliquer directement une remise surprise en pourcentage (ex: 15%) ou à taux fixe (ex: 20 €) pour ravir vos clientèles." },
        { name: "WooCommerce Sync Node", role: "Persistance Directe", description: "Sauvegarde instantanément les modifications apportées aux lignes d'articles et aux montants globaux directement sur votre boutique WordPress." }
      ],
      steps: [
        "Filtrez vos ventes WooCommerce d'un coup d'œil d'après leur couleur de statut (Payé, En attente, Échoué).",
        "Cliquez sur la commande cible pour ouvrir la fiche de transaction détaillée.",
        "Cliquez sur 'Ajouter un Produit' : vous disposez maintenant d'un sélecteur à deux modes (Produit du Catalogue / Saisie Libre).",
        "Pour ajouter un produit existant : sélectionnez sa catégorie dans la liste déroulante ou recherchez-le par son nom. Les informations de prix unitaire et de nom sont chargées instantanément.",
        "Pour exécuter la commande AliExpress réelle (Dropshipping) : repérez l'encadré 'Fournisseur AliExpress' d'un article lié.",
        "Cliquez sur 'Passer la commande AliExpress'. Le moteur se connecte d'abord en toute sécurité au compte vendeur, transmet instantanément l'adresse de facturation/livraison enregistrée de l'acheteur à l'API du fournisseur, puis soumet le paiement.",
        "Dès validation, l'ID de commande AliExpress réel et son code de suivi de colis de type international (ex: LP00...FR) sont générés à la volée.",
        "Cliquez ensuite sur 'Synchro & Valider sur Wordpress' pour pousser automatiquement ces métadonnées d'expédition sur votre boutique WordPress et clore la vente directement au statut 'Terminé' !"
      ],
      tips: "CONSEIL EXCLUSIF : La liaison automatique AliExpress évite toute erreur orthographique de saisie de l'adresse client. Vos commandes sont traitées sans démo ni intermédiaire, ce qui vous garantit des marges optimales et un suivi ultra-rapide !",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono">Live Checkout Console</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : WooCommerce Order Live Editor</h4>
          
          <div className="bg-black/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
              <span className="text-[10px] font-black text-white font-mono">Commande #4820</span>
              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded font-black">TRAITEMENT DIRECT</span>
            </div>
            
            <div className="space-y-1.5 mb-3 text-[9px]">
              <div className="flex justify-between text-slate-400">
                <span>Client :</span>
                <span className="text-white font-bold font-sans">Jean Dupont</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-1">
                <span>Panier :</span>
                <span className="text-slate-350">1x Ebook SEO + <span className="text-purple-400 font-bold">1x Produit Surprise (Ajouté)</span></span>
              </div>
              <div className="flex justify-between text-pink-400 font-bold font-sans pt-1">
                <span>Remise Surprise Client :</span>
                <span>-20% (Cadeau Appliqué)</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1">
                <span>Total recalculé :</span>
                <span className="text-emerald-400 font-bold font-mono">95.20 EUR</span>
              </div>
            </div>

            <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-550 hover:to-indigo-550 text-white font-mono font-black uppercase text-[8px] rounded-xl transition-all tracking-widest">
              Sauvegarder la Commande
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'products',
      title: 'Manager de Produits',
      category: 'Catalogue & Admin',
      shortDesc: "Modifiez l'intégralité de vos prix WooCommerce et optimisez votre catalogue à la volée.",
      icon: Package,
      badges: ['Tarifs', 'Fiches de vente', 'Modifications'],
      purpose: {
        fr: "Mettre à jour rapidement et massivement vos stocks, de redéfinir instantanément vos prix réguliers face à des prix barrés et d'ajouter en un clin d'œil des images alternatives sur votre site d'origine.",
        en: "Quickly and massively update stock levels, define regular/sale pricing parameters, and upload alternative product galleries back into WooCommerce."
      },
      components: [
        { name: "Massive Editing Fields", role: "Modifications de masse", description: "Composants de saisie directe permettant de modifier les prix de vente sans avoir à recharger 10 pages." },
        { name: "Image Library Swapper", role: "Aperçus visuels", description: "Liaison directe avec votre collection d'images WordPress pour faire glisser un visuel propre sur n'importe quel produit." },
        { name: "Stock Altering Panel", role: "Contrôle d'inventaire", description: "Saisie directe des quantités physiques réelles pour ajuster les valeurs de vos entrepôts." }
      ],
      steps: [
        "Isolez le produit cible dans la grille d'inventaire.",
        "Renseignez le 'Nouveau Prix Régulier' ainsi qu'un 'Prix Soldé' si nécessaire.",
        "Validez pour que la base de données WordPress de destination se mette à jour instantanément."
      ],
      tips: "Utilisez un prix barré de finissant par '.99' ou '.90' pour de meilleures conversions psychologiques au moment de valider la commande.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest font-mono">Live Product Mock</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : WooCommerce Product Editor</h4>
          
          <div className="bg-black/60 border border-slate-800 rounded-2xl p-4 flex gap-4">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-[9px] text-slate-500 border border-slate-700">IMAGE</div>
            <div className="flex-1 space-y-2">
              <span className="text-[9px] font-black text-slate-300">Gourde Sport Titane Noire</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-1.5 border border-slate-900 rounded-xl text-[9px] font-mono">
                  <span className="text-[6.5px] text-slate-500 uppercase font-black block">Prix Régulier</span>
                  39.90 EUR
                </div>
                <div className="bg-slate-950 p-1.5 border border-slate-900 rounded-xl text-[9px] font-mono">
                  <span className="text-[6.5px] text-slate-500 uppercase font-black block">Prix Spécial</span>
                  <span className="text-yellow-400 font-bold">29.90 EUR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'nexus-link-importer',
      title: "Pont d'Importation Unifié Nexus & Bulk Extension",
      category: 'Catalogue & Admin',
      shortDesc: "Importez en masse ou à l'unité des fiches produits enrichies directement depuis l'extension Chrome ou par copier-coller d'un lien.",
      icon: LinkIcon,
      badges: ["Extension Chrome", "Import de masse (Bulk)", "Scraping Automatique", "Multiplicateur de Prix"],
      purpose: {
        fr: "Fournir un pont direct bidirectionnel reliant n'importe quel catalogue web (AliExpress, Shopify...) à votre boutique WooCommerce. Grâce à l'extension Chrome intégrée, le pont extrait instantanément les images haute résolution, les titres traduits et les prix d'origine directement depuis votre navigation active, puis lance une importation massive parallélisée avec application automatique d'une marge commerciale.",
        en: "Establish a high-performance direct bridge linking lists or single products to your WooCommerce shop. Powered by the Google Chrome extension, it grabs real-time metadata (HD images, titles, cost prices) straight from active browser tabs and runs bulk imports automatically."
      },
      components: [
        { name: "Extension Chrome Nexus Sourcing", role: "Extracteur Temps Réel", description: "Script intégré au navigateur qui scrape de façon non invasive les fiches produits, prix sous-jacents, et liens d'images d'une page de recherche active sans surcharge de proxy." },
        { name: "Analyseur d'URL Sémantique", role: "Enrichisseur IA", description: "Modèle IA Gemini conçu pour digérer la structure brute d'une URL, reformuler les titres, réécrire les descriptions en français ou anglais et structurer les attributs techniques." },
        { name: "Bulk Import Queue Controller", role: "Orchestrateur Parallélisé", description: "Interface dédiée à l'import de masse permettant d'activer/désactiver par checkboxes, visualiser le statut de traitement (Scraping, Publication, Succès) et de surveiller l'importation." },
        { name: "Coefficient Multiplicateur & Prix", role: "Moteur de Marge", description: "Ajuste automatiquement les prix de vente en appliquant un multiplicateur (ex: 1.5x le prix AliExpress de base) lors de la création WooCommerce." },
        { name: "Local Simulation Failback", role: "Sécurité & Robustesse", description: "Si l'API WooCommerce distante rencontre une erreur d'authentification ou réseau, l'import sauvegarde l'article en simulation locale sécurisée pour éviter toute perte de données." }
      ],
      steps: [
        "Installez ou lancez l'Extension Chrome associée 'Nexus Link Pro' sur votre navigateur.",
        "Rendez-vous sur AliExpress, faites votre recherche et ouvrez l'extension : le catalogue actif de la page y est répertorié avec miniatures, prix et titres en direct.",
        "Cochez les articles désirés puis cliquez sur 'Importer dans la Console Nexus' : l'onglet bascule automatiquement sur votre espace Produits en révélant le Bulk Importer pré-rempli.",
        "Définissez votre coefficient multiplicateur de marge (ex: '1.5' pour 50% de marge brute) et révisez les articles reçus.",
        "Cliquez sur 'Lancer l'importation multiple' : le système va scrapper, enrichir via l'IA et publier vos produits en tâche de fond.",
        "Consultez les badges 'Succès' ou 'Simulé' en temps réel pour confirmer l'ancrage WooCommerce."
      ],
      tips: "CONSEIL PREMIUM : L'importation via l'extension Chrome résout les blocages de sécurité et de captcha fréquents en utilisant l'adresse IP et la session active de votre navigateur pour une efficacité de 100% !",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-405 animate-pulse" />
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono">Pont Extension Chrome</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Bulk Import & Scraping Bridge</h4>
          
          <div className="space-y-3">
            <div className="p-3 bg-black/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[7px] text-slate-500 font-extrabold block mb-1">PONT BRANCHE</span>
                <span className="text-[9px] font-mono text-indigo-400 leading-none">WhatsApp / Chrome Extension Connecté Port 3000</span>
              </div>
              <span className="text-[7.5px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-black">ACTIF</span>
            </div>
            
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-2">
              <div className="flex justify-between items-center text-[7.5px] text-indigo-400 font-extrabold uppercase">
                <span>File d'attente d'import multiple (Coefficient: 1.5x)</span>
                <span className="font-mono text-[9px]">1 / 3 traités</span>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-800 rounded"></div>
                    <span className="text-[8.5px] text-slate-300 truncate max-w-[120px]">Montre Connectée Sport Waterproof</span>
                  </div>
                  <span className="text-[8px] font-bold text-indigo-400 animate-pulse">Enrichissement IA...</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-800 rounded"></div>
                    <span className="text-[8.5px] text-slate-300 truncate max-w-[120px]">Câble Double Chargeur Rapide USB-C</span>
                  </div>
                  <span className="text-[8px] font-bold text-emerald-400">★ Succès (WooCommerce)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Connexion WordPress WooCommerce',
      category: 'Catalogue & Admin',
      shortDesc: "Vérifiez vos identifiants d'API, vos clés de connexion et liez votre site WordPress/WooCommerce en quelques secondes.",
      icon: Settings,
      badges: ['Clés d\'API', 'WooCommerce API', 'Plugins requis'],
      purpose: {
        fr: "Saisir de façon ultra-sécurisée l'adresse URL de votre site, vos clés Consommateurs (CK) ainsi que vos clés Secrètes (CS) nécessaires pour communiquer en direct avec WooCommerce, tout en configurant la triade indispensable d'extensions (RankMath/Yoast, WooCommerce et WP CORS).",
        en: "Safely record and authenticate consumer/secret keys and necessary plugin triad (SEO, WooCommerce, and WP CORS) needed to operate remote WooCommerce database transfers successfully."
      },
      components: [
        { name: "WooCommerce API Keys Form", role: "Sécurité", description: "Contient les champs requis : URL du site, Clé de consommateur, Clé secrète de consommateur et mot de passe d'application WordPress." },
        { name: "Automated Diagnostic Engine", role: "Vérificateur", description: "Vérifie instantanément les clés fournies et allume un voyant d'ancrage vert (Sain) ou rouge (Hors-ligne)." },
        { name: "Triade d'Extensions WordPress", role: "Prérequis", description: "Vérification de l'activation de RankMath SEO / Yoast SEO, WooCommerce, et WP CORS pour gérer le SEO de vos posts et autoriser l'API sans erreurs CORS." }
      ],
      steps: [
        "Inscrivez l'adresse de votre site WordPress (ex: https://monsite.fr).",
        "Assurez-vous que RankMath/Yoast SEO, WooCommerce, et l'extension WP CORS sont actifs sur votre site.",
        "Renseignez votre clé d'API issue des réglages avancés WooCommerce ou votre Mot de passe d'application WordPress.",
        "Sauvegardez l'ancrage. La plateforme initialisera la première synchronisation en tâche de fond."
      ],
      tips: "Le plugin WP CORS est absolument requis sur votre WordPress pour que votre navigateur puisse échanger avec l'API REST de votre WooCommerce sans être bloqué.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest font-mono">Live Keys Config</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Nexus Sync Settings</h4>
          
          <div className="bg-black/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="space-y-1">
              <span className="text-[7px] text-slate-500 uppercase font-black font-mono">URL du site</span>
              <p className="text-[10px] text-white font-mono bg-slate-950 px-3 py-1.5 border border-slate-900 rounded-xl">https://nexus-seo-shop.cloud</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[7px] text-slate-500 uppercase font-black font-mono">Clé Consommateur API (ck)</span>
              <p className="text-[10px] text-blue-400 font-mono bg-slate-950 px-3 py-1.5 border border-slate-900 rounded-xl">ck_f348e29a99ea78fd...</p>
            </div>
            
            <div className="text-[8px] text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              <span>Clés d'API valides. Échanges sécurisés en SSL.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'maintenance',
      title: 'Sécurité & Maintenance',
      category: 'Catalogue & Admin',
      shortDesc: "Videz les caches obsolètes, réorganisez les bases et gardez un site réactif.",
      icon: Globe,
      badges: ['Nettoyage', 'Cache WP', 'Base de données'],
      purpose: {
        fr: "Fournir des raccourcis efficaces pour vider le cache de WordPress à distance, purger les transients obsolètes d'un vieux site WooCommerce et corriger les plantages légers.",
        en: "Provide remote WordPress cache purging, clear database transients from active WooCommerce configurations, and restore system integrity."
      },
      components: [
        { name: "Distant Cache Purger Button", role: "Performance", description: "Bouton d'action transmettant un ordre instantané d'effacement de l'historique de cache de votre hébergeur WordPress d'origine." },
        { name: "Transient Database Sweeper", role: "Entretien", description: "Nettoie en profondeur les fichiers transitoires générés par WooCommerce qui surchargent la rapidité de vos requêtes MySQL." },
        { name: "Task Health Logs", role: "Sécurité", description: "Indicateur consignant les plantages système ou alertes de lenteurs pour anticiper les baisses d'audience." }
      ],
      steps: [
        "Cliquez sur la carte d'entretien concernée : 'Vider le cache WordPress' ou 'Nettoyer WooCommerce'.",
        "Laissez le moteur Nexus interroger le serveur d'hébergement cible.",
        "Vérifiez le gain de vitesse via un nouvel audit SEO."
      ],
      tips: "Un nettoyage mensuel des transients permet de réduire d'environ 15% le poids brut de votre base SQL d'origine.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[8px] font-black text-red-400 uppercase tracking-widest font-mono">Live Sweeper Mod</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Remote Maintenance Board</h4>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors">
              <span className="text-[12px] mb-1">🧹</span>
              <span className="text-[8.5px] font-black text-white uppercase tracking-wider">Vider Caches</span>
              <span className="text-[6.5px] text-green-400 uppercase font-mono mt-0.5">Sain</span>
            </button>
            
            <button className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors">
              <span className="text-[12px] mb-1">🗄️</span>
              <span className="text-[8.5px] font-black text-white uppercase tracking-wider">Purger Transients</span>
              <span className="text-[6.5px] text-slate-500 uppercase font-mono mt-0.5">14 fichiers</span>
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Bouclier de Sécurité',
      category: 'Catalogue & Admin',
      shortDesc: "Protégez vos sites WordPress en temps réel contre les attaques brute-force, injections SQL et scans de vulnérabilités.",
      icon: ShieldCheck,
      badges: ['Pare-feu', 'Sécurité Active', 'Logs Live'],
      purpose: {
        fr: "Fournir un tableau de bord de modération et d'action rapide pour surveiller le trafic suspect, bannir instantanément les adresses IP infectées ou appliquer un verrouillage d'urgence du système WordPress.",
        en: "Provide a real-time monitoring and defense dashboard to track suspicious traffic patterns, ban malicious IPs, and deploy an emergency WordPress system lockdown."
      },
      components: [
        { name: "Verrouillage d'Urgence", role: "Blindage défensif", description: "Bouton magnétique pour interdire l'accès public à l'origin WordPress en le masquant derrière un écran de maintenance." },
        { name: "Modération Active", role: "Modérateur Autonome", description: "Capteur intelligent bannissant instantanément et sans intervention humaine les tentatives d'injections SQL ou Brute Force." },
        { name: "Scannner d'Intégrité", role: "Audit de fichiers", description: "Exécute un audit diagnostique global vérifiant l'intégrité de la table wp_users, du fichier .htaccess, et des signatures des répertoires sensibles." },
        { name: "Installateur de Webhook", role: "Connecteur PHP", description: "Fragment de code PHP asynchrone à insérer dans functions.php pour lier et diffuser vos alertes locales directement au Nexus." },
        { name: "Courbe Brute-Force (7J)", role: "Visualisation d'Anomalies", description: "Graphique d'aire dynamique présentant le volume d'intrusions brute-force bloquées sur une fenêtre glissante de 7 jours, greffé sous le composant de quantité globale." },
        { name: "Seuil de Détection Réglable", role: "Configuration d'Alertes", description: "Curseur interactif permettant de régler le niveau d'intrusions autorisé avant de déclencher une alerte visuelle rouge de crise pulsante." }
      ],
      steps: [
        "Vérifiez l'indice protectif en temps réel sur le tableau de bord global du bouclier.",
        "Suivez l'évolution de la courbe glissante brute-force sur 7 jours pour déceler les campagnes de dictionnaires automatisées.",
        "Ajustez le curseur de seuil entre 2 et 15 tentatives maximum par jour pour tester et personnaliser le déclenchement de l'alerte visuelle protectrice rouge.",
        "Copiez le code du connecteur et insérez-le dans le fichier functions.php de votre thème WordPress d'origine.",
        "En cas d'attaque pèlerine détectée dans l'historique en temps réel ou de dépassement du seuil d'alerte configuré, activez le 'Verrouillage d'Urgence' ou cliquez sur 'BANNIR' pour bloquer définitivement l'adresse IP de l'agresseur."
      ],
      tips: "Ajustez régulièrement le curseur selon les pics d'attaques enregistrés pour éviter la fatigue des indicateurs tout en maintenant une vigilance maximale sans faux positifs.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans text-xs">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest font-mono font-bold">Shield Active</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Nexus Cyber Shield</h4>
          
          <div className="bg-black/60 border border-slate-800 rounded-2xl p-4 space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">État : Protection Active</span>
              <span className="text-[8px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md font-bold">99.9% Sûr</span>
            </div>
            
            <div className="flex gap-2 text-[9px] font-mono">
              <div className="flex-1 bg-slate-950 p-2 border border-slate-900 rounded-xl">
                <span className="text-slate-500 block text-[7px] uppercase font-bold">IPS BANNIES</span>
                <span className="text-white text-base font-black">3</span>
              </div>
              <div className="flex-1 bg-slate-950 p-2 border border-slate-900 rounded-xl">
                <span className="text-slate-500 block text-[7px] uppercase font-bold font-mono">ALERTES LIVE</span>
                <span className="text-red-400 text-base font-black">12</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'categories',
      title: 'Catégories & Tags',
      category: 'Catalogue & Admin',
      shortDesc: "Optimisez et automatisez l'organisation taxonomique de vos produits et articles de blog pour dynamiser votre SEO.",
      icon: Tags,
      badges: ['SEO', 'Structure', 'Auto-Tags', 'Taxonomies'],
      purpose: {
        fr: "Faciliter l'organisation logique et sémantique de votre catalogue WooCommerce en nettoyant les tags en excès et en ordonnant vos taxonomies pour un repérage optimal par les moteurs de recherche.",
        en: "Facilitate the logical and semantic organization of your WooCommerce catalog by cleaning redundant tags and organizing taxonomies for optimal search engine discovery."
      },
      components: [
        { name: "Grille de Management Taxonomique", role: "Éditeur global", description: "Interface centralisée pour éditer en un clin d'œil les noms, slugs et d'éventuels attributs SEO de vos catégories." },
        { name: "Analyseur de Densité de Contenu", role: "Rapport d'équilibre", description: "Vigilance sémantique signalant les catégories vides, les tags orphelins ou les déséquilibres d'affectation de catalogue." },
        { name: "Suggéreur IA de Multi-Tags", role: "Générateur Intelligent", description: "Module intelligent qui s'installe au cœur de vos fiches pour suggérer à la volée des tags chiffrés optimisés." }
      ],
      steps: [
        "Ouvrez la section 'Catégories & Tags' sous le domaine d'administration de catalogue.",
        "Consultez l'état d'équilibre de vos fiches via l'évaluation de densité taxonomique.",
        "Sollicitez le suggeré de tags IA basé sur vos formulations sémantiques.",
        "Propulsez les modifications d'un coup d'actionneur directement vers votre WordPress."
      ],
      tips: "Évitez d'avoir trop de tags ne comportant qu'un seul article. Un maillage tassé dans dix à quinze tags denses améliore significativement l'indexation globale de votre boutique par Google.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest font-mono">Taxonomy Live</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Taxonomy Optimizer</h4>
          
          <div className="space-y-2 mb-3">
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-400">Catégorie Principale</span>
                <p className="text-sm font-bold text-white mt-0.5">Mode & Accessoires</p>
              </div>
              <span className="text-[8px] font-mono bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2.5 py-1 rounded-xl font-bold">42 articles synchro</span>
            </div>
            
            <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[8px] font-mono text-slate-400 block mb-1">Moteur d'Auto-Tags IA :</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] px-2 py-0.5 rounded font-black font-mono font-bold">#T-Shirt_Coton</span>
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] px-2 py-0.5 rounded font-black font-mono font-bold">#Écoresponsable</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] px-2 py-0.5 rounded font-black font-mono font-bold">+ Générer plus</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'collab',
      title: 'Invitations & Équipe',
      category: 'Catalogue & Admin',
      shortDesc: "Déléguez en toute sécurité le pilotage de vos rédactions SEO et de vos automatisations marketing sans risquer vos clés maîtresses.",
      icon: Users,
      badges: ['Sécurité', 'Rôles Fins', 'Délégation', 'Sessions'],
      purpose: {
        fr: "Partager l'accès à votre cockpit d'administration avec des collaborateurs externes (rédacteurs, référenceurs, agences de publicité) en restreignant finement leurs privilèges.",
        en: "Share access to your administration cockpit with outside contractors (content authors, traffic managers, developers) while restricting privileges cleanly."
      },
      components: [
        { name: "Console d'Invitations", role: "Accès Onboarding", description: "Générateur d'invitation avec email destinataire et clé de validation de jeton éphémère d'entrée." },
        { name: "Sélecteur de Rôles & Scopes", role: "Contrôleur de droits", description: "Série d'interrupteurs pour attribuer ou exclure l'accès aux sections (uniquement Rédacteur, Analyste, etc.)." },
        { name: "Rupture de Token Équipe", role: "Révocation instantanée", description: "Bouton pour bannir immédiatement un membre et détruire sa session de navigation active." }
      ],
      steps: [
        "Ouvrez l'outil d'Invitations et Équipe dans le menu de gauche.",
        "Introduisez l'email de votre spécialiste opérationnel.",
        "Décidez de son niveau de privilège (ex : Rédacteur s'il ne doit s'occuper que de la Machine à Contenu).",
        "Cliquez pour expédier l'invitation et observez l'état du jeton passer d'en attente à actif."
      ],
      tips: "Respectez le protocole du moindre privilège militaire : ne donnez jamais le rôle d'administration totale à un freelance engagé pour une rédaction SEO d'une semaine.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest font-mono font-bold">Access Control</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Team Management</h4>
          
          <div className="bg-black/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">JB</div>
                <div>
                  <p className="text-white font-bold font-mono">jean-baptiste@agency.com</p>
                  <p className="text-[8px] text-slate-500">Rôle : Équipier Rédacteur</p>
                </div>
              </div>
              <span className="text-[7.5px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black font-bold">ACTIF</span>
            </div>
            
            <div className="flex gap-2">
              <span className="text-[8px] font-mono text-slate-500">Dernier accès : il y a 8 min (IP: 82.112.x.x)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'affiliates',
      title: 'Affiliation & Partenaires',
      category: 'Marketing & Ventes',
      shortDesc: "Accédez à votre console d'affiliation pour inviter d'autres entrepreneurs, suivre vos clics de parrainage et encaisser des revenus PayPal immédiats.",
      icon: Users,
      badges: ['Revenu Récurrent', 'PayPal Instant', 'Partenaires', 'Lien Unique'],
      purpose: {
        fr: "Percevoir d'importantes commissions directes récurrentes en recommandant la suite d'outils automatisée Nexus à d'autres e-commerçants ou gestionnaires WordPress.",
        en: "Earn significant affiliate commission revenue by recommending the automated Nexus suite of tools to fellow WooCommerce or WordPress owners."
      },
      components: [
        { name: "Générateur de Lien d'Affiliation", role: "Encodeur d'URL", description: "Incrémente automatiquement votre code affilé unique à l'adresse internet de redirection pour réclamer vos commissions." },
        { name: "Suivi des Clics & Commissions", role: "Grand livre financier", description: "Cartes mesurant le nombre de visiteurs parrainés, le montant de vos revenus approuvés et de vos cagnottes actives en attente." },
        { name: "Extracteur de Versement Express", role: "Demande de règlement", description: "Bouton magnétique pour demander le versement de vos fonds approuvés par virement ou PayPal." }
      ],
      steps: [
        "Rendez-vous sur la console d'Affilié Nexus depuis le menu administrateur.",
        "Copiez votre lien personnalisé avec code d'associé.",
        "Incorporez ce lien dans vos vidéos de tests, courriels de promotion, ou offrez-le à vos clients.",
        "Consultez les graphiques de clics et soumettez une demande de paiement dès que votre caisse dépasse le palier minimum."
      ],
      tips: "Présentez Nexus comme l'outil couteau-suisse parfait permettant d'économiser l'achat de 20 abonnements ou extensions WooCommerce lourdes. Le concept de licence à vie est incroyablement persuasif.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono font-bold">Affiliate Core</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Affiliate Hub</h4>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-black/40 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono">CLICS GÉNÉRÉS</span>
              <p className="text-sm font-black text-white mt-0.5 font-mono">1 240</p>
            </div>
            
            <div className="bg-black/40 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono">SOLDE ACQUIS</span>
              <p className="text-sm font-black text-emerald-400 mt-0.5 font-mono">597.00 €</p>
            </div>
          </div>
          
          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors font-mono font-bold">
            ⚡ Demander un Versement Immédiat
          </button>
        </div>
      )
    }
  ];

  const { i18n } = useTranslation();
  
  // Dynamic bilingual toggle
  const appLang = i18n.language?.startsWith('en') ? 'EN' : 'FR';
  const [overrideLang, setOverrideLang] = useState<'FR' | 'EN' | null>(null);
  const activeLang = overrideLang || appLang;

  // Localization mapper function
  const getLocalizedSection = (sec: any) => {
    if (activeLang === 'EN') {
      const tr = USER_MANUAL_TRANS[sec.id];
      if (tr) {
        return {
          ...sec,
          title: tr.title,
          category: tr.category,
          shortDesc: tr.shortDesc,
          purposeText: sec.purpose.en || sec.purpose.fr,
          components: sec.components.map((comp: any, cIdx: number) => {
            const trComp = tr.components?.[cIdx];
            return trComp ? { ...comp, name: trComp.name, role: trComp.role, description: trComp.description } : comp;
          }),
          steps: tr.steps || sec.steps,
          tips: tr.tips || sec.tips
        };
      }
    }
    return {
      ...sec,
      purposeText: sec.purpose.fr
    };
  };

  const localizedSections = sections.map(sec => getLocalizedSection(sec));

  const filteredSections = localizedSections.filter(sec => 
    sec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sec.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sec.shortDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSec = localizedSections.find(s => s.id === activeDocId) || localizedSections[0];

  const generateManualHTML = () => {
    const escapeHtml = (unsafe: string) => {
      return (unsafe || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const tableOfContents = localizedSections.map((sec, idx) => `
      <div class="toc-item">
        <span class="toc-title">${activeLang === 'EN' ? 'Section' : 'Section'} ${idx + 1} : ${escapeHtml(sec.title)} <span class="toc-cat">(${escapeHtml(sec.category)})</span></span>
        <span class="toc-dots"></span>
        <span class="toc-page">Page ${idx + 3}</span>
      </div>
    `).join('');

    const sectionPages = localizedSections.map((sec, idx) => `
      <div class="page-break flex-page">
        <div class="section-header">
          <div>
            <span class="sec-number font-mono">Section ${idx + 1} / ${localizedSections.length}</span>
            <h1 class="sec-title">${escapeHtml(sec.title)}</h1>
          </div>
          <span class="sec-cat-label">${activeLang === 'EN' ? 'Module' : 'Domaine'} : ${escapeHtml(sec.category)}</span>
        </div>

        <div class="sub-block">
          <h3 class="block-heading">${activeLang === 'EN' ? '1. OPERATIONAL PURPOSE :' : '1. BUT OPÉRATIONNEL :'}</h3>
          <p class="purpose-box">${escapeHtml(sec.purposeText)}</p>
        </div>

        <div class="sub-block">
          <h3 class="block-heading">${activeLang === 'EN' ? '2. CONTROLS & ACTION BUTTONS :' : '2. COMMANDES & BOUTONS ACTEURS :'}</h3>
          <table class="cmds-table">
            <thead>
              <tr>
                <th>${activeLang === 'EN' ? 'Action / Button' : 'Actionneur / Bouton'}</th>
                <th>${activeLang === 'EN' ? 'System Role' : 'Rôle Système'}</th>
                <th>${activeLang === 'EN' ? 'Description of Action & Rules' : "Description d'Action & Règle d'Exploitation"}</th>
              </tr>
            </thead>
            <tbody>
              ${sec.components.map((comp: any) => `
                <tr>
                  <td class="td-bold font-mono">${escapeHtml(comp.name)}</td>
                  <td class="td-role font-mono">${escapeHtml(comp.role)}</td>
                  <td class="td-desc">${escapeHtml(comp.description)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="sub-block">
          <h3 class="block-heading">${activeLang === 'EN' ? '3. STEP-BY-STEP OPERATION PROTOCOL :' : '3. PROTOCOLE D\'EXPLOITATION PAR ÉTAPES :'}</h3>
          <div class="steps-list">
            ${sec.steps.map((st: string, sIdx: number) => `
              <div class="step-item">
                <span class="step-num font-mono">${sIdx + 1}.</span>
                <p class="step-text">${escapeHtml(st)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">${activeLang === 'EN' ? '💡 EXPERT REVENUE TIP :' : '💡 CONSEIL DE RENTABILITÉ D\'EXPERT :'}</span>
          <p class="tips-text">"${escapeHtml(sec.tips)}"</p>
        </div>
      </div>
    `).join('');

    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manuel de Référence - Nexus WP AI</title>
  <style>
    body {
      color: #0f172a;
      background-color: #f1f5f9;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .header-controls {
      background-color: #0f172a;
      padding: 16px 24px;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .header-controls h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .header-controls p {
      margin: 4px 0 0 0;
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .btn-print {
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      transition: all 0.2s ease;
    }
    .btn-print:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
    }
    .main-doc {
      max-width: 850px;
      background: #ffffff;
      margin: 30px auto;
      padding: 50px 70px;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
      padding: 30px 0;
      border-bottom: 2px solid #f1f5f9;
      min-height: 900px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page-break:last-child {
      border-bottom: none;
      page-break-after: avoid;
      break-after: avoid;
    }
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 850px;
      padding: 40px 0;
    }
    .cover-top h1 {
      font-size: 38pt;
      font-weight: 900;
      text-transform: uppercase;
      line-height: 1.1;
      margin: 40px 0 10px 0;
      color: #0f172a;
    }
    .cover-top h2 {
      font-size: 16pt;
      font-weight: bold;
      color: #475569;
      margin-top: 10px;
    }
    .accent-bar {
      width: 60px;
      height: 4px;
      background-color: #2563eb;
      margin-bottom: 20px;
    }
    .cover-summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin: 60px 0;
    }
    .cover-summary h3 {
      font-size: 11pt;
      font-weight: 900;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      color: #1e293b;
    }
    .cover-summary p {
      font-size: 10pt;
      color: #475569;
      line-height: 1.6;
      margin: 0;
    }
    .cover-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
    }
    .footer-col p {
      margin: 0;
    }
    .lbl-small {
      font-size: 8pt;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: bold;
    }
    .val-bold {
      font-size: 10pt;
      font-weight: bold;
      color: #0f172a;
      margin-top: 2px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 25px;
    }
    .sec-number {
      font-size: 9pt;
      font-weight: bold;
      color: #2563eb;
      text-transform: uppercase;
    }
    .sec-title {
      font-size: 20pt;
      font-weight: 900;
      text-transform: uppercase;
      margin: 4px 0 0 0;
    }
    .sec-cat-label {
      font-size: 9pt;
      color: #64748b;
      font-weight: bold;
      text-transform: uppercase;
      background-color: #f1f5f9;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .block-heading {
      font-size: 11pt;
      font-weight: bold;
      color: #1e293b;
      text-transform: uppercase;
      margin: 25px 0 10px 0;
    }
    .purpose-box {
      font-size: 10pt;
      color: #334155;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 8px;
      line-height: 1.6;
      margin: 0;
    }
    .cmds-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      border: 1px solid #e2e8f0;
      margin-top: 8px;
    }
    .cmds-table th {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      padding: 10px;
      font-weight: bold;
      color: #475569;
      text-align: left;
      text-transform: uppercase;
      font-size: 8.5pt;
    }
    .cmds-table td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
    }
    .td-bold {
      font-weight: bold;
      color: #0f172a;
      width: 25%;
    }
    .td-role {
      color: #2563eb;
      font-weight: 600;
      width: 25%;
    }
    .td-desc {
      color: #475569;
      width: 50%;
    }
    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .step-item {
      display: flex;
      gap: 10px;
    }
    .step-num {
      font-weight: bold;
      color: #2563eb;
      font-size: 10pt;
    }
    .step-text {
      font-size: 9.5pt;
      color: #334155;
      margin: 0;
      line-height: 1.5;
    }
    .tips-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 14px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .tips-title {
      font-size: 8.5pt;
      font-weight: bold;
      color: #1e40af;
      display: block;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .tips-text {
      margin: 0;
      font-size: 9.5pt;
      color: #1e40af;
      font-style: italic;
    }
    .toc-title-header {
      font-size: 20pt;
      font-weight: 900;
      text-transform: uppercase;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 40px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px dotted #cbd5e1;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }
    .toc-title {
      font-size: 11pt;
      font-weight: bold;
      color: #334155;
    }
    .toc-cat {
      font-size: 9pt;
      color: #94a3b8;
      font-weight: normal;
    }
    .toc-page {
      font-size: 11pt;
      font-weight: bold;
      color: #0f172a;
    }
    
    @media print {
      .header-controls {
        display: none !important;
      }
      body {
        background-color: #ffffff !important;
      }
      .main-doc {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      .page-break {
        page-break-after: always !important;
        break-after: page !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-controls">
    <div>
      <h1>${escapeHtml(activeLang === 'EN' ? 'Official Reference Manual' : 'Manuel de Référence Officiel')}</h1>
      <p>${escapeHtml(activeLang === 'EN' ? 'Nexus Core Intelligence Suite • Interactive Edition v3.4' : 'Nexus Core Intelligence Suite • Version Interactive v3.4')}</p>
    </div>
    <button class="btn-print" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      ${escapeHtml(activeLang === 'EN' ? 'Print / Save as PDF' : 'Imprimer / Sauvegarder en PDF')}
    </button>
  </div>

  <div class="main-doc">
    <!-- Cover page -->
    <div class="page-break cover-page">
      <div class="cover-top">
        <div class="accent-bar"></div>
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b;">${escapeHtml(activeLang === 'EN' ? 'Official Technical Documentation' : 'Documentation Technique Officielle')}</span>
        <h1>${activeLang === 'EN' ? 'NEXUS WP AI <br><span style="color: #2563eb;">REFERENCE MANUAL</span>' : 'MANUEL DE RÉFÉRENCE <br><span style="color: #2563eb;">NEXUS WP AI</span>'}</h1>
        <h2>${escapeHtml(activeLang === 'EN' ? 'Multitask Strategic Cockpit for E-Commerce & WordPress' : 'Cockpit Stratégique Multitâches pour E-commerce & WordPress')}</h2>
      </div>

      <div class="cover-summary">
        <h3>${escapeHtml(activeLang === 'EN' ? 'Manual Objective' : "Objet du Manuel d'utilisation")}</h3>
        <p>${escapeHtml(activeLang === 'EN' 
          ? "This exhaustive technical manual validates and documents the operational mechanics of the 16 major application modules within the Nexus WP AI suite. It strictly describes the roles, purposes, and actions of each control knob, parameter slider, and backend database connector to ensure seamless business management."
          : "Ce manuel technique exhaustif certifie et documente le fonctionnement opérationnel des 16 sections applicatives majeures constituant la suite d'intelligence artificielle Nexus WP AI. Il décrit rigoureusement le rôle, les attributions et l'utilité exacte de chaque bouton d'actionnement, curseur de modulation et connecteurs de données en arrière-plan afin d'accompagner sereinement votre pilotage commercial.")}</p>
      </div>

      <div class="cover-footer">
        <div class="footer-col">
          <p class="lbl-small">${escapeHtml(activeLang === 'EN' ? 'Author & Infrastructure' : 'Auteur & Infrastructure')}</p>
          <p class="val-bold">Nexus Core Intelligence Suite</p>
          <p style="font-size: 8pt; color: #64748b; margin-top:4px;">${escapeHtml(activeLang === 'EN' 
            ? `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` 
            : `Généré le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`)}</p>
        </div>
        <div class="footer-col" style="text-align: right;">
          <p class="lbl-small">${escapeHtml(activeLang === 'EN' ? 'Software Version' : 'Version Logiciel')}</p>
          <p class="val-bold" style="color: #2563eb;">PHASE III • v3.4.1 (STABLE)</p>
        </div>
      </div>
    </div>

    <!-- Table of Contents -->
    <div class="page-break" style="padding: 40px 0;">
      <h2 class="toc-title-header">${escapeHtml(activeLang === 'EN' ? 'Table of Contents' : 'Table des Matières')}</h2>
      <div style="margin-top: 30px;">
        ${tableOfContents}
      </div>
    </div>

    <!-- Details -->
    ${sectionPages}
  </div>
</body>
</html>`;

    return fullHtml;
  };

  const handleDownloadHTML = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccessKey(null);
    setCopiedHtml(false);
    setShowStatusPanel(true);

    try {
      const fullHtml = generateManualHTML();
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const dLink = document.createElement('a');
      dLink.href = url;
      dLink.style.display = 'none';
      dLink.setAttribute('download', activeLang === 'EN' ? 'nexus_ai_reference_manual.html' : 'manuel_reference_nexus_ai.html');
      document.body.appendChild(dLink);
      dLink.click();
      document.body.removeChild(dLink);
      
      // Revoke the object URL after a short timeout to let the download finish
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 500);

      // Set a successful local identification to finalize the modal HUD
      setDownloadSuccessKey('local-instant-download');
    } catch (err: any) {
      console.error(err);
      setDownloadError(err.message || String(err));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyHTMLBackup = async () => {
    try {
      const fullHtml = generateManualHTML();
      await navigator.clipboard.writeText(fullHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 3000);
    } catch (err) {
      console.error('Failed to copy html to clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-1 md:p-6" id="user-manual-root">
      
      {/* Upper Banner introducing manual */}
      <div className="mb-8 bg-gradient-to-r from-blue-900/20 to-indigo-950/20 border border-blue-500/10 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] font-mono leading-none bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">{activeLang === 'EN' ? 'Official User Guide' : 'Guide Utilisateur Officiel'}</span>
              <span className="text-[8px] font-black text-yellow-400 uppercase tracking-[0.4em] font-mono leading-none bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">Interactive v3</span>
              
              {/* Luxury Language Picker Segment Switcher */}
              <div className="flex items-center gap-1 bg-black/45 border border-slate-800/80 p-0.5 rounded-xl ml-auto">
                <button
                  onClick={() => setOverrideLang('FR')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    activeLang === 'FR' 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10 font-black' 
                      : 'text-slate-500 hover:text-slate-300 bg-transparent'
                  }`}
                  id="btn-lang-fr"
                >
                  FR
                </button>
                <button
                  onClick={() => setOverrideLang('EN')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    activeLang === 'EN' 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10 font-black' 
                      : 'text-slate-500 hover:text-slate-300 bg-transparent'
                  }`}
                  id="btn-lang-en"
                >
                  EN
                </button>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-3 uppercase tracking-tight">
              {activeLang === 'EN' ? 'NEXUS AI REFERENCE MANUAL' : 'MANUEL DE RÉFÉRENCE NEXUS AI'}
            </h2>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mt-2">
              <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
                {activeLang === 'EN' 
                  ? "Explore in depth the inner workings of the most robust Artificial Intelligence automating your WooCommerce stores. Discover the exact role of every control button, parameters, and visualize interactive mockups to steer your online revenues successfully."
                  : "Explorez en profondeur les entrailles de l'intelligence artificielle la plus robuste automatisant vos boutiques WooCommerce. Découvrez le rôle de chaque actionneur, de chaque paramètre et visualisez les tableaux de bord interactifs pour piloter vos revenus sur le web."}
              </p>
              <div className="flex flex-wrap items-center gap-3 shrink-0 self-start xl:self-center">
                <button
                  onClick={handleDownloadHTML}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-5 py-3.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all bg-emerald-600 hover:bg-emerald-550 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-emerald-500/10 font-mono"
                  title="Télécharger une version de secours autonome du manuel d'utilisation"
                  id="btn-download-manual"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? (activeLang === 'EN' ? 'Generating...' : 'Génération...') : (activeLang === 'EN' ? 'Download HTML' : 'Télécharger HTML')}</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(true)}
                  className="flex items-center gap-2 px-5 py-3.5 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-550 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-blue-500/10 font-mono"
                  id="btn-print-manual"
                >
                  <Printer className="w-4 h-4" />
                  <span>{activeLang === 'EN' ? 'Preview / Print PDF' : 'Aperçu / Imprimer PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Table of contents (TOC) with search filter */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
          <div className="mb-6">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">
              {activeLang === 'EN' ? 'Search' : 'Rechercher'}
            </span>
            <div className="relative mt-2">
              <input 
                type="text" 
                placeholder={activeLang === 'EN' ? "e.g., SEO, Autopilot, Stock..." : "Ex : SEO, Autopilote, Stock..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-all font-mono"
              />
              <Sliders className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">
              {activeLang === 'EN' ? 'Application Modules' : "Sections de l'application"}
            </span>
            
            <div className="space-y-1.5 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
              {filteredSections.map((sec) => {
                const isSelected = sec.id === activeDocId;
                const SecIcon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveDocId(sec.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${
                      isSelected 
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-md shadow-blue-950/20' 
                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isSelected ? 'bg-blue-600/20 border border-blue-500/20 text-blue-400' : 'bg-slate-950 border border-slate-900 text-slate-500'
                    }`}>
                      <SecIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest">{sec.title}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">{sec.category}</p>
                    </div>
                  </button>
                );
              })}
              {filteredSections.length === 0 && (
                <div className="text-center py-6">
                  <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aucune section trouvée</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Viewporter */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSec.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-8"
            >
              {/* Header inside selected section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-900/10">
                    {React.createElement(selectedSec.icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] font-mono bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">{selectedSec.category}</span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1.5">{selectedSec.title}</h3>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedSec.badges.map((b, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid structured detail info / visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Explanation text */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 font-mono">
                      {activeLang === 'EN' ? '🏁 WHAT IS ITS PURPOSE?' : '🏁 Quel est son but ?'}
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedSec.purposeText}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 font-mono">
                      {activeLang === 'EN' ? '🎮 KEY CONTROLS & BUTTONS' : '🎮 Composants Clefs& Boutons'}
                    </h4>
                    <div className="space-y-3">
                      {selectedSec.components.map((comp: any, idx: number) => (
                        <div key={idx} className="bg-black/40 border border-slate-900/60 rounded-xl p-3">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[9px] font-black text-white uppercase tracking-wider">{comp.name}</span>
                            <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest font-mono bg-blue-500/5 border border-blue-500/10 px-1.5 py-0.5 rounded">{comp.role}</span>
                          </div>
                          <p className="text-slate-400 text-[9.5px] leading-relaxed select-text">{comp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated visual diagram */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 font-mono">
                      {activeLang === 'EN' ? '📺 INTERFACE PREVIEW' : '📺 Aperçu de l\'interface'}
                    </h4>
                    {selectedSec.visualMockup()}
                  </div>

                  <div className="bg-blue-950/20 border border-blue-500/10 rounded-2xl p-4">
                    <h5 className="text-[8.5px] font-black uppercase text-blue-400 tracking-[0.15em] mb-2 flex items-center gap-1.5 font-mono">
                      <Zap className="w-3.5 h-3.5" />
                      {activeLang === 'EN' ? 'Expert operational tip :' : 'Conseil d\'exploitation expert :'}
                    </h5>
                    <p className="text-slate-300 text-[10px] leading-relaxed italic select-text">
                      "{selectedSec.tips}"
                    </p>
                  </div>
                </div>

              </div>

              {/* Steps / Guide block */}
              <div className="bg-black/40 border border-slate-900 rounded-3xl p-6">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {activeLang === 'EN' ? 'Step-by-Step Practical Protocol' : 'Protocole d\'exploitation par étapes'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedSec.steps.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-3 relative">
                      <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-[9px] text-blue-400 font-mono mt-0.5 shrink-0 select-none">
                        {idx + 1}
                      </div>
                      <p className="text-slate-400 text-[10px] leading-relaxed select-text">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Global Quickstart Instructions Box in margins */}
      <div className="mt-8 bg-slate-900/10 border border-slate-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-sm font-black uppercase text-white tracking-widest mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          DÉMARRAGE RAPIDE EN 3 ÉTAPES CLÉS
        </h3>
        <p className="text-slate-400 text-xs mb-6 max-w-3xl leading-relaxed">
          Pour tirer le potentiel maximal de Nexus Phase III dès aujourd'hui, assurez-vous d'avoir configuré ces trois piliers système :
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/30 border border-slate-900 p-4 rounded-2xl space-y-2">
            <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-mono font-black text-blue-400">1</span>
            <p className="text-[11px] font-black uppercase text-white tracking-wider">Connexion WordPress WooCommerce</p>
            <p className="text-[9.5px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">
              Allez dans <span className="text-blue-400 font-bold font-mono">Réglages API</span> et insérez vos clés CK/CS ainsi que votre mot de passe d'application. Veillez à activer <span className="text-amber-400 font-bold">WooCommerce</span>, un plugin de SEO comme <span className="text-purple-400 font-bold">RankMath/Yoast SEO</span>, et le plugin <span className="text-blue-400 font-bold">WP CORS</span> pour autoriser l'API REST.
            </p>
          </div>
          
          <div className="bg-black/30 border border-slate-900 p-4 rounded-2xl space-y-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-mono font-black text-emerald-400">2</span>
            <p className="text-[11px] font-black uppercase text-white tracking-wider">Liaison IMAP/SMTP Courriels</p>
            <p className="text-[9.5px] text-slate-400 leading-relaxed">
              Ouvrez le <span className="text-emerald-400 font-bold font-mono">Communication Hub</span> pour lier l'adresse de messagerie d'expédition de votre domaine. Vos e-mails partiront depuis votre nom réel.
            </p>
          </div>
          
          <div className="bg-black/30 border border-slate-900 p-4 rounded-2xl space-y-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] font-mono font-black text-purple-400">3</span>
            <p className="text-[11px] font-black uppercase text-white tracking-wider">Génération SEO Thématique</p>
            <p className="text-[9.5px] text-slate-400 leading-relaxed">
              Lancez votre premier article sur le <span className="text-purple-400 font-bold font-mono">Rédacteur Intelligent</span> en renseignant des mots-clés volumineux décelés par vos analyses de concurrents.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Print Preview Overlay Modal */}
      <AnimatePresence>
        {showPrintPreview && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/95 backdrop-blur-md flex flex-col no-print">
            {/* Modal Header Controls */}
            <div className="bg-slate-900/95 border-b border-slate-800/80 p-4 sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Générateur de Manuel PDF Officiel</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-mono">
                    Aperçu et export du livre blanc complet de l'application
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-550 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 font-mono"
                  title="Télécharger le manuel autonome au format HTML"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger HTML</span>
                </button>
                <button
                  onClick={() => {
                    try {
                      const fullHtml = generateManualHTML();
                      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const win = window.open(url, '_blank');
                      if (!win) {
                        // Fallback option in case of browser popup blocker inside iframe
                        window.print();
                      }
                    } catch (e) {
                      console.error("Erreur lors de l'ouverture de l'impression, fallback vers impression directe :", e);
                      window.print();
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-505 hover:to-indigo-555 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 font-mono"
                  title="Imprimer ou sauvegarder le manuel en PDF autonome et parfait"
                >
                  <Printer className="w-4 h-4" />
                  <span>Ouvrir / Imprimer PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="p-3 bg-slate-850 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Print Guidance Notice */}
            <div className="max-w-4xl mx-auto w-full px-4 mt-6 space-y-3">
              {isIframe && (
                <div id="iframe-print-warning" className="bg-amber-500/10 border border-amber-500/20 px-5 py-4 text-center md:text-left flex items-start gap-3.5 rounded-2xl">
                  <span className="text-base text-amber-400">⚠️</span>
                  <div className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    <strong className="text-white uppercase tracking-wide">Impression restreinte (Iframe active) :</strong> Les navigateurs bloquent la commande d'impression à l'intérieur des éditeurs intégrés. 
                    <br />
                    <span className="text-amber-400 font-bold">Le bouton bleu "Ouvrir / Imprimer PDF" ci-dessus va ouvrir le système d'impression dans un nouvel onglet autonome (hors de l'éditeur) pour que le PDF soit généré de manière parfaite !</span>
                  </div>
                </div>
              )}
              <div className="bg-blue-500/10 border border-blue-500/20 px-5 py-4 text-center md:text-left flex items-start gap-3.5 rounded-2xl">
                <span className="text-base">💡</span>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  <strong className="text-white uppercase tracking-wide">Astuce d'export PDF optimale :</strong> Dans la fenêtre d'impression de votre navigateur, configurez la <strong className="text-blue-400">Destination</strong> sur <strong className="text-blue-400">"Enregistrer au format PDF"</strong>. Et pensez à <strong className="text-emerald-400">cocher l'option "Graphiques d'arrière-plan"</strong> dans les options de mise en page pour préserver toutes les nuances des tableaux et bordures du manuel.
                </p>
              </div>
            </div>

            {/* Simulated scrollable document tray */}
            <div className="flex-1 p-4 md:p-8 bg-black/60 overflow-y-auto mt-6">
              {/* Document Paper Container */}
              <div className="max-w-[850px] mx-auto bg-white text-black font-sans shadow-2xl p-8 md:p-14 border border-slate-200 rounded-sm">
                
                {/* 1. COVER PAGE OF THE BOOK */}
                <div className="min-h-[1050px] flex flex-col justify-between py-12 border-b-2 border-slate-200">
                  <div className="space-y-6">
                    <div className="w-16 h-1 bg-black" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-mono">
                      {activeLang === 'EN' ? 'Official System Documentation' : 'Documentation Système Officielle'}
                    </span>
                    
                    <h1 className="text-5xl font-extrabold uppercase tracking-tight leading-none text-black font-serif mt-12 pb-4">
                      {activeLang === 'EN' ? (
                        <>
                          NEXUS WP AI <br />
                          <span className="font-sans font-black text-blue-600 tracking-tighter">REFERENCE MANUAL</span>
                        </>
                      ) : (
                        <>
                          MANUEL DE RÉFÉRENCE <br />
                          <span className="font-sans font-black text-blue-600 tracking-tighter">NEXUS WP AI</span>
                        </>
                      )}
                    </h1>
                    
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mt-3 font-mono">
                      {activeLang === 'EN' ? 'Multitask Strategic Cockpit for E-commerce & WordPress' : 'Cockpit Stratégique Multitâches pour E-commerce & WordPress'}
                    </h2>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-4 my-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 font-mono">
                      {activeLang === 'EN' ? 'Manual Objective' : "Objet du Manuel d'utilisation"}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeLang === 'EN' 
                        ? "This exhaustive technical manual validates and documents the operational mechanics of the 16 major application modules within the Nexus WP AI suite. It strictly describes the roles, purposes, and actions of each control knob, parameter slider, and backend database connector to ensure seamless business management."
                        : "Ce manuel technique exhaustif certifie et documente le fonctionnement opérationnel des 16 sections applicatives majeures constituant la suite d'intelligence artificielle Nexus WP AI. Il décrit rigoureusement le rôle, les attributions et l'utilité exacte de chaque bouton d'actionnement, curseur de modulation et connecteurs de données en arrière-plan afin d'accompagner sereinement votre pilotage commercial."}
                    </p>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-200 pt-8 mt-12">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        {activeLang === 'EN' ? 'Author & Infrastructure' : 'Auteur & Infrastructure'}
                      </p>
                      <p className="text-xs font-bold text-slate-800 uppercase">Nexus Core Intelligence Suite</p>
                      <p className="text-[10px] font-mono text-slate-500 font-bold">
                        {activeLang === 'EN' ? 'DIRECTIVE DATE :' : 'DATE DIRECTIVE :'} {activeLang === 'EN' ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        {activeLang === 'EN' ? 'Software Version' : 'Version Logiciel'}
                      </p>
                      <p className="text-xs font-black text-blue-600 uppercase font-mono tracking-wide">PHASE III • v3.4.1 (STABLE)</p>
                    </div>
                  </div>
                </div>

                {/* 2. TABLE OF CONTENTS */}
                <div className="py-12 border-b-2 border-slate-200 min-h-[1050px] flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-[0.15em] text-black border-b border-black pb-4 mb-8 font-serif">
                      {activeLang === 'EN' ? 'Table of Contents' : 'Table des Matières'}
                    </h2>
                    
                    <div className="space-y-4">
                      {localizedSections.map((sec, idx) => (
                        <div key={sec.id} className="flex justify-between items-baseline gap-4 py-1.5 border-b border-dotted border-slate-300 font-sans">
                          <div className="min-w-0 flex-1 font-sans">
                            <span className="text-[11px] font-black uppercase text-slate-900 font-mono">
                              {activeLang === 'EN' ? 'Section' : 'Section'} {String(idx + 1).padStart(2, '0')} : {sec.title}
                            </span>
                            <span className="text-[9px] text-slate-400 uppercase font-bold ml-1.5 font-mono">
                              ({sec.category})
                            </span>
                            <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-0.5">{sec.shortDesc}</p>
                          </div>
                          <span className="text-xs font-black font-mono text-slate-800">
                            {activeLang === 'EN' ? 'Page' : 'Page'} {idx + 3}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <p className="text-[9px] text-slate-500 font-mono text-center">
                      {activeLang === 'EN' ? 'Nexus WP AI Laboratory • All rights reserved © 2026.' : "Nexus WP AI Laboratory • Tous droits d'exploitation réservés © 2026."}
                    </p>
                  </div>
                </div>

                {/* 3. DETAILED SECTIONS */}
                {localizedSections.map((sec, idx) => (
                  <div key={sec.id} className="py-12 border-b-2 border-slate-200 min-h-[1050px] flex flex-col justify-between">
                    <div className="space-y-6">
                      
                      {/* Section Identification Header */}
                      <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                        <div>
                          <span className="text-[10px] font-mono text-blue-600 font-black uppercase tracking-widest bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                            {activeLang === 'EN' ? 'Section' : 'Section'} {idx + 1} / {localizedSections.length}
                          </span>
                          <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-2 font-serif">
                            {sec.title}
                          </h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                            DOMAINE : {sec.category}
                          </p>
                        </div>
                        <span className="text-xs font-black font-mono text-slate-300">NEXUS_DOC_#{idx + 1}</span>
                      </div>

                      {/* 1. Global Purpose Box */}
                      <div>
                        <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2 font-mono">
                          🏁 1. QUEL EST SON BUT OPÉRATIONNEL ?
                        </h3>
                        <p className="text-slate-600 text-[11.5px] leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium font-sans">
                          {sec.purpose.fr}
                        </p>
                      </div>

                      {/* 2. Button and Command Index */}
                      <div>
                        <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider mb-3 font-mono">
                          🎮 2. INDEX RATIONNEL DES COMMANDES & BOUTONS ACTIFS :
                        </h3>
                        
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-3 font-black text-slate-700 w-1/4 uppercase tracking-wider text-[10px]">Actionneur / Bouton</th>
                                <th className="p-3 font-black text-slate-700 w-1/4 uppercase tracking-wider text-[10px]">Rôle Système</th>
                                <th className="p-3 font-black text-slate-700 w-1/2 uppercase tracking-wider text-[10px]">Description & Règle d'Exploitation</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150">
                              {sec.components.map((comp, cIdx) => (
                                <tr key={cIdx} className="hover:bg-slate-55">
                                  <td className="p-3 font-bold text-black border-r border-slate-100 uppercase tracking-wide text-[10px] font-mono">
                                    {comp.name}
                                  </td>
                                  <td className="p-3 text-blue-700 font-mono font-bold border-r border-slate-100 text-[9px] uppercase">
                                    {comp.role}
                                  </td>
                                  <td className="p-3 text-slate-600 text-[10.5px] leading-relaxed">
                                    {comp.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 3. Step by step instructions */}
                      <div className="pt-2">
                        <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider mb-3 font-mono">
                          👟 3. PROTOCOLE ÉTAPE PAR ÉTAPE :
                        </h3>
                        <div className="space-y-3 pl-2">
                          {sec.steps.map((st, sIdx) => (
                            <div key={sIdx} className="flex gap-3">
                              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-[9.5px] font-mono font-bold text-slate-800 flex items-center justify-center shrink-0">
                                {sIdx + 1}
                              </span>
                              <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
                                {st}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* 4. Tips quote */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-8">
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1.5 font-mono">
                        💡 CONSEIL D'EXPERT LOGISTIQUE & DE RENTABILITÉ :
                      </p>
                      <p className="text-slate-700 text-[10.5px] leading-relaxed italic">
                        "{sec.tips}"
                      </p>
                    </div>

                  </div>
                ))}

              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Print-Only Representation for the exact @media print engine */}
      <div id="nexus-printable-manual" className="custom-pdf-document">
        {/* Cover Page */}
        <div className="pdf-page-break" style={{ padding: '3cm' }}>
          <div style={{ borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '40px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#666' }}>Documentation Technique Nexus IP</span>
          </div>
          <h1 style={{ fontSize: '38pt', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1.1', margin: '40px 0 10px 0' }}>
            MANUEL DE RÉFÉRENCE <br />
            <span style={{ color: '#2563eb' }}>NEXUS WP AI</span>
          </h1>
          <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#333', marginTop: '10px' }}>
            Le Guide Complet d'Automatisation de Boutiques, SEO, Stocks & CRM
          </h2>
          <div style={{ margin: '80px 0', border: '1px solid #ddd', padding: '24px', borderRadius: '12px', background: '#fcfcfc' }}>
            <h3 style={{ fontSize: '11pt', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Objet du Rapport</h3>
            <p style={{ fontSize: '10pt', color: '#555', lineHeight: '1.6', margin: 0 }}>
              Ce document de référence décrit la composition technique et logique des 16 sections de l'application Nexus WP AI. Pour chaque composant et actionneur, il détermine le rôle système exact et les actions d'exploitation adaptées afin de maximiser le retour sur investissement e-commerce.
            </p>
          </div>
          <div style={{ marginTop: '160px', borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '8pt', color: '#888', textTransform: 'uppercase', margin: 0 }}>Rédacteurs System</p>
              <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '2px 0 0 0' }}>Nexus Strategic Intelligence Suite</p>
              <p style={{ fontSize: '8pt', color: '#999', margin: '2px 0 0 0' }}>
                {activeLang === 'EN' 
                  ? `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` 
                  : `Généré le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '8pt', color: '#888', textTransform: 'uppercase', margin: 0 }}>
                {activeLang === 'EN' ? 'Software Version' : 'Version logicielle'}
              </p>
              <p style={{ fontSize: '10pt', fontWeight: 'bold', margin: '2px 0 0 0', color: '#2563eb' }}>
                {activeLang === 'EN' ? 'PHASE III • v3.4.1 (Certified Stable)' : 'PHASE III • v3.4.1 (Certifiée Stable)'}
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="pdf-page-break" style={{ padding: '3cm' }}>
          <h2 style={{ fontSize: '20pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid black', paddingBottom: '10px', marginBottom: '30px' }}>
            {activeLang === 'EN' ? 'Table of Contents' : 'Table des Matières'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {localizedSections.map((sec, idx) => (
              <div key={sec.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc', paddingBottom: '5px' }}>
                <span style={{ fontSize: '10.5pt', fontWeight: 'bold' }}>
                  {activeLang === 'EN' ? 'Section' : 'Section'} {idx + 1} : {sec.title} <span style={{ fontSize: '8pt', color: '#777', fontWeight: 'normal' }}>({sec.category})</span>
                </span>
                <span style={{ fontSize: '10.5pt', fontWeight: 'bold' }}>
                  {activeLang === 'EN' ? 'Page' : 'Page'} {idx + 3}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section pages */}
        {localizedSections.map((sec, idx) => (
          <div key={sec.id} className="pdf-page-break" style={{ padding: '3cm' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '25px' }}>
              <div>
                <span style={{ fontSize: '8.5pt', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>
                  {activeLang === 'EN' ? 'Section' : 'Section'} {idx + 1} / {localizedSections.length}
                </span>
                <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '5px 0 0 0', textTransform: 'uppercase' }}>{sec.title}</h1>
              </div>
              <span style={{ fontSize: '9pt', color: '#999', alignSelf: 'flex-end' }}>
                {activeLang === 'EN' ? 'MODULE :' : 'DOMAINE :'} {sec.category}
              </span>
            </div>

            <h3 style={{ fontSize: '10pt', fontWeight: 'bold', color: '#333', textTransform: 'uppercase', margin: '20px 0 8px 0' }}>
              {activeLang === 'EN' ? '1. OPERATIONAL PURPOSE :' : '1. BUT OPÉRATIONNEL :'}
            </h3>
            <p style={{ fontSize: '10pt', color: '#444', background: '#fcfcfc', border: '1px solid #eaeaea', padding: '12px', borderRadius: '8px', lineHeight: '1.5', margin: '0 0 25px 0' }}>
              {sec.purposeText}
            </p>

            <h3 style={{ fontSize: '10pt', fontWeight: 'bold', color: '#333', textTransform: 'uppercase', margin: '20px 0 10px 0' }}>
              {activeLang === 'EN' ? '2. CONTROLS & ACTION BUTTONS :' : '2. COMMANDES & BOUTONS ACTEURS :'}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', border: '1px solid #eee', margin: '0 0 25px 0' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '8px', borderRight: '1px solid #ddd', textAlign: 'left', fontWeight: 'bold', width: '25%' }}>
                    {activeLang === 'EN' ? 'Control' : 'Actionneur'}
                  </th>
                  <th style={{ padding: '8px', borderRight: '1px solid #ddd', textAlign: 'left', fontWeight: 'bold', width: '25%' }}>
                    {activeLang === 'EN' ? 'System Role' : 'Rôle Système'}
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '50%' }}>
                    {activeLang === 'EN' ? 'Description of Action' : "Description d'Action"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sec.components.map((comp: any, cIdx: number) => (
                  <tr key={cIdx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', borderRight: '1px solid #ddd', fontWeight: 'bold', color: '#000' }}>{comp.name}</td>
                    <td style={{ padding: '8px', borderRight: '1px solid #ddd', color: '#2563eb', fontFamily: 'monospace' }}>{comp.role}</td>
                    <td style={{ padding: '8px', color: '#555' }}>{comp.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ fontSize: '10pt', fontWeight: 'bold', color: '#333', textTransform: 'uppercase', margin: '20px 0 10px 0' }}>
              {activeLang === 'EN' ? '3. STEP-BY-STEP OPERATION PROTOCOL :' : "3. PROTOCOLE D'EXPLOITATION PAR ÉTAPES :"}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 25px 0' }}>
              {sec.steps.map((st: string, sIdx: number) => (
                <div key={sIdx} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '9pt', color: '#2563eb' }}>{sIdx + 1}.</span>
                  <p style={{ fontSize: '9.5pt', color: '#444', margin: 0 }}>{st}</p>
                </div>
              ))}
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', marginTop: '40px' }}>
              <span style={{ fontSize: '8pt', fontWeight: 'bold', color: '#1e3a8a', display: 'block', marginBottom: '4px' }}>
                {activeLang === 'EN' ? '💡 EXPERT STRATEGIC RECOMMENDATION :' : "CONSEIL DE RENTABILITÉ D'EXPERT :"}
              </span>
              <p style={{ margin: 0, fontSize: '9pt', color: '#1e40af', fontStyle: 'italic' }}>"{sec.tips}"</p>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded print utility inline styles */}
      <style key="nexus-manual-print">{`
        .custom-pdf-document {
          display: none;
        }
        @media print {
          /* Force standard document rendering backgrounds with visible overflows */
          html, body, #root, #root > div, #user-manual-root {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide live interfaces, headers, and backgrounds by setting visibility to hidden */
          body * {
            visibility: hidden !important;
          }
          /* Present only the print output cleanly */
          .custom-pdf-document,
          .custom-pdf-document * {
            visibility: visible !important;
          }
          .custom-pdf-document {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 9999999 !important;
          }
          .pdf-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          table {
            page-break-inside: avoid !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

    </div>
  );
}
