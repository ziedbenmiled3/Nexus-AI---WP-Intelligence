import React, { useState } from 'react';
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
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      id: 'social',
      title: 'NEXUS SOCIAL',
      category: 'Marketing & Ventes',
      shortDesc: "Générez et automatisez des partages engageants de vos produits vers vos réseaux sociaux.",
      icon: Share2,
      badges: ['Automatisation', 'Omnicanal', 'Campagne'],
      purpose: {
        fr: "Convertir automatiquement les nouveautés ou articles WordPress en publications optimisées pour Facebook, Instagram, LinkedIn et X (Twitter) afin d'attirer du trafic qualifié.",
        en: "Automatically convert WordPress updates or products into optimized posts for Facebook, Instagram, LinkedIn, and X (Twitter) to drive qualified social traffic."
      },
      components: [
        { name: "Rédacteur d'Accroches IA", role: "Générateur créatif", description: "Analyse votre produit pour rédiger jusqu'à 5 variantes originales de posts intégrant des émojis et hashtags pertinents." },
        { name: "Sélecteur de Réseaux", role: "Filtre d'audience", description: "Boutons permettant d'activer ou désactiver des templates spécifiques selon le canal ciblé (le pro pour LinkedIn, le visuel pour Instagram)." },
        { name: "Campagne Active Builder", role: "Gestionnaire", description: "Planifie l'ordre de diffusion et configure l'intervalle de temps entre chaque partage pour éviter les spams perçus par les réseaux." }
      ],
      steps: [
        "Sélectionnez un article ou produit dans le menu déroulant central.",
        "Cliquez sur 'Générer avec Nexus AI' pour laisser notre moteur formuler vos textes.",
        "Ajustez les hashtags suggérés et cliquez sur 'Publier'."
      ],
      tips: "Intégrez des questions ouvertes dans les accroches générées pour doubler naturellement le taux d'engagement organique sur Facebook.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">Live Simulation</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : Nexus Social Publisher</h4>
          
          {/* Post box wireframe */}
          <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[8px] text-blue-400">N</div>
              <div>
                <p className="text-[9px] font-black text-white leading-none">Nexus AI Autoposter</p>
                <p className="text-[7px] text-slate-500 leading-none mt-1">Sponsorisé • Option active</p>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl mb-3 text-[10px] text-slate-300 font-mono leading-relaxed">
              ✨ Découvrez notre incroyable <span className="text-blue-400">#Ebook</span> sur les secrets du SEO en 2026 ! Optimisez votre WooCommerce en 3 étapes clefs... <span className="text-slate-500">https://nexus-seo.io/opt</span>
            </div>
            
            <div className="flex gap-2 justify-end">
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">#Ecommerce</span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">#SEO</span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">#Growth</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button className="bg-blue-600/10 border border-blue-500/30 p-2 rounded-xl flex flex-col items-center justify-center">
              <Share2 className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-[7px] font-black text-white font-mono uppercase">Générer</span>
            </button>
            <button className="bg-emerald-600/10 border border-emerald-500/30 p-2 rounded-xl flex flex-col items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[7px] font-black text-white font-mono uppercase">Planifier</span>
            </button>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center justify-center">
              <span className="text-[8px] text-slate-500 font-black uppercase text-center font-mono">4 canaux active</span>
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
      shortDesc: "Gérez vos serveurs SMTP/IMAP, créez des templates d'emails personnalisés et automatisez vos envois.",
      icon: Mail,
      badges: ['Emailing', 'SMTP Securisé', 'Automation Rules'],
      purpose: {
        fr: "Centraliser l'envoi d'e-mails professionnels (comme les newsletters et communications d'achats) en utilisant vos propres serveurs de messagerie avec des modèles 100% personnalisables aux couleurs de votre marque.",
        en: "Centralize professional email sends (such as newsletters and transactional notifications) using your own messaging servers with templates customized to your brand colors."
      },
      components: [
        { name: "Serveur SMTP / IMAP Configurator", role: "Connexion", description: "Formulaire sécurisé pour lier vos serveurs Host, Port, Utilisateur, Mot de passe et tester la connexion en temps réel." },
        { name: "Template Builder IA v2", role: "Conception", description: "Éditeur HTML visuel avec personnalisation intelligente de la couleur primaire et de la couleur accentuée de votre logo." },
        { name: "Automation Rules Core", role: "Régulation", description: "Déclenche l'envoi d'un template spécifique dès qu'un achat WooCommerce est fait par un client avec des tags dynamiques (ex: {{USER_NAME}})." }
      ],
      steps: [
        "Accédez à l'onglet 'Réglages SMTP/IMAP' pour y renseigner vos codes d'accès mail d'entreprise.",
        "Testez la connexion grâce aux boutons de diagnostic.",
        "Construisez un Template HTML harmonieux en ajustant l'anneau de couleur de marque.",
        "Associez ce template à une règle automatique dans l'onglet 'Communication Hub Rules'."
      ],
      tips: "Insérez le tag dynamique {{user_name}} ou {{prenom}} au début de vos e-mails de relance ; les messages adressés personnellement observent un taux de lecture supérieur de 40%.",
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
      shortDesc: "Consultez l'historique complet de vos transactions et gardez un œil sur vos clients.",
      icon: ShoppingCart,
      badges: ['Commandes', 'WooCommerce', 'Timeline'],
      purpose: {
        fr: "Fournir un panneau de gestion globale de vos commandes, permettant de vérifier le statut de paiement, de consulter les paniers et de générer directement un e-mail de suivi unitaire pour un acheteur donné.",
        en: "Provide a global order tracking panel, allowing checkout verification, cart item details, and manual customer feedback emails."
      },
      components: [
        { name: "Order Core Database Table", role: "Tableau de bord logistique", description: "Contient toutes les infos WooCommerce : ID commande, nom complet de l'acheteur, prix total, pays d'expédition, et statut." },
        { name: "Dynamic Interaction Timeline", role: "Dossier relationnel", description: "Affiche dans un fil temporel dynamique tous les messages rédigés ou envoyés au client pour suivre l'historique de son support mail." },
        { name: "Direct Template Communicator", role: "Raccourci relationnel", description: "Bouton d'action permettant de générer automatiquement un mail d'excuses en cas de retard sur une commande spécifique." }
      ],
      steps: [
        "Filtrez vos ventes WooCommerce d'un coup d'œil d'après leur couleur de statut (Payé, En attente, Échoué).",
        "Cliquez sur l'une des commandes pour ouvrir le tiroir des détails spécifiques.",
        "Consultez les articles choisis et contactez le client grâce au module de messagerie direct du Hub."
      ],
      tips: "Si un client laisse une transaction en 'Attente de paiement', envoyez un e-mail avec un code promotionnel de 5% pour l'inciter à valider son panier.",
      visualMockup: () => (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden font-sans">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono">Live Checkout Console</span>
          </div>
          
          <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Vue Illustrée : WooCommerce Order Drawer</h4>
          
          <div className="bg-black/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
              <span className="text-[10px] font-black text-white font-mono">Commande #4820</span>
              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded font-black">PAYÉ (CONFIRMÉ)</span>
            </div>
            
            <div className="space-y-1.5 mb-3 text-[9px]">
              <div className="flex justify-between text-slate-400">
                <span>Client :</span>
                <span className="text-white font-bold">Jean Dupont (j.dupont@gmail.com)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Contenu :</span>
                <span className="text-white">1x Ebook SEO + 1x Support Custom</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total :</span>
                <span className="text-emerald-400 font-bold font-mono">119.00 EUR</span>
              </div>
            </div>

            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono font-black uppercase text-[8px] rounded-xl transition-all tracking-widest">
              Générer Mail de relance d'expédition
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
    }
  ];

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sec.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sec.shortDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSec = sections.find(s => s.id === activeDocId) || sections[0];

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
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] font-mono leading-none bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">Guide Utilisateur Officiel</span>
              <span className="text-[8px] font-black text-yellow-400 uppercase tracking-[0.4em] font-mono leading-none bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">Interactive v3</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-3 uppercase tracking-tight">MANUEL DE RÉFÉRENCE NEXUS AI</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
              Explorez en profondeur les entrailles de l'intelligence artificielle la plus robuste automatisant vos boutiques WooCommerce. Découvrez le rôle de chaque actionneur, de chaque paramètre et visualisez les tableaux de bord interactifs pour piloter vos revenus sur le web.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Table of contents (TOC) with search filter */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
          <div className="mb-6">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Rechercher</span>
            <div className="relative mt-2">
              <input 
                type="text" 
                placeholder="Ex : SEO, Autopilote, Stock..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-all font-mono"
              />
              <Sliders className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Sections de l'application</span>
            
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
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 font-mono">🏁 Quel est son but ?</h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedSec.purpose.fr}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 font-mono">🎮 Composants Clifs & Boutons</h4>
                    <div className="space-y-3">
                      {selectedSec.components.map((comp, idx) => (
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
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 font-mono">📺 Aperçu de l'interface</h4>
                    {selectedSec.visualMockup()}
                  </div>

                  <div className="bg-blue-950/20 border border-blue-500/10 rounded-2xl p-4">
                    <h5 className="text-[8.5px] font-black uppercase text-blue-400 tracking-[0.15em] mb-2 flex items-center gap-1.5 font-mono">
                      <Zap className="w-3.5 h-3.5" />
                      Conseil d'exploitation expert :
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
                  Guide étape par étape (Step-by-Step Tutorial)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedSec.steps.map((step, idx) => (
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

    </div>
  );
}
