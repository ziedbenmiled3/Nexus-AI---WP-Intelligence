export interface MarketingKeyword {
  keyword: string;
  category: string;
  match_type: 'phrase' | 'exact' | 'negative';
  formatted_keyword: string;
}

export const MARKETING_CATEGORIES = {
  'stocks': 'Gestion des Stocks & Logistique',
  'pricing': 'Prix Intelligent & Revenue Management',
  'crm': 'CRM, Emailing & Listes de Diffusion',
  'automation': 'Automatisation IA & SEO (Générique)',
  'brand': 'Protection de Marque',
  'negative': 'Mots-clés Négatifs (Incompatibles)'
};

export const DEFAULT_MARKETING_KEYWORDS: MarketingKeyword[] = [
  // 1. Gestion des Stocks & Logistique
  {
    keyword: 'gestion de stock woocommerce',
    category: 'stocks',
    match_type: 'phrase',
    formatted_keyword: '"gestion de stock woocommerce"'
  },
  {
    keyword: 'optimisation stock e-commerce',
    category: 'stocks',
    match_type: 'phrase',
    formatted_keyword: '"optimisation stock e-commerce"'
  },
  {
    keyword: 'plugin gestion stock woocommerce',
    category: 'stocks',
    match_type: 'phrase',
    formatted_keyword: '"plugin gestion stock woocommerce"'
  },
  {
    keyword: 'automatiser stock dropshipping',
    category: 'stocks',
    match_type: 'phrase',
    formatted_keyword: '"automatiser stock dropshipping"'
  },
  {
    keyword: 'gestionnaire de stock virtuel',
    category: 'stocks',
    match_type: 'exact',
    formatted_keyword: '[gestionnaire de stock virtuel]'
  },
  {
    keyword: 'alertes rupture de stock woocommerce',
    category: 'stocks',
    match_type: 'phrase',
    formatted_keyword: '"alertes rupture de stock woocommerce"'
  },

  // 2. Prix Intelligent & Revenue Management
  {
    keyword: 'tarification dynamique e-commerce',
    category: 'pricing',
    match_type: 'phrase',
    formatted_keyword: '"tarification dynamique e-commerce"'
  },
  {
    keyword: 'optimisation des prix woocommerce',
    category: 'pricing',
    match_type: 'phrase',
    formatted_keyword: '"optimisation des prix woocommerce"'
  },
  {
    keyword: 'repricing automatique woocommerce',
    category: 'pricing',
    match_type: 'phrase',
    formatted_keyword: '"repricing automatique woocommerce"'
  },
  {
    keyword: 'analyse concurrentielle prix e-commerce',
    category: 'pricing',
    match_type: 'phrase',
    formatted_keyword: '"analyse concurrentielle prix e-commerce"'
  },
  {
    keyword: 'outil suivi prix concurrents',
    category: 'pricing',
    match_type: 'phrase',
    formatted_keyword: '"outil suivi prix concurrents"'
  },

  // 3. CRM, Emailing & Listes de Diffusion
  {
    keyword: 'crm pour woocommerce',
    category: 'crm',
    match_type: 'phrase',
    formatted_keyword: '"crm pour woocommerce"'
  },
  {
    keyword: 'emailing automatique woocommerce',
    category: 'crm',
    match_type: 'phrase',
    formatted_keyword: '"emailing automatique woocommerce"'
  },
  {
    keyword: 'extraire clients woocommerce',
    category: 'crm',
    match_type: 'phrase',
    formatted_keyword: '"extraire clients woocommerce"'
  },
  {
    keyword: 'publipostage automatique e-commerce',
    category: 'crm',
    match_type: 'phrase',
    formatted_keyword: '"publipostage automatique e-commerce"'
  },
  {
    keyword: 'segmentation clients woocommerce',
    category: 'crm',
    match_type: 'phrase',
    formatted_keyword: '"segmentation clients woocommerce"'
  },
  {
    keyword: 'gestion des commandes woocommerce crm',
    category: 'crm',
    match_type: 'phrase',
    formatted_keyword: '"gestion des commandes woocommerce crm"'
  },

  // 4. Automatisation IA & SEO (Générique)
  {
    keyword: 'intelligence artificielle pour woocommerce',
    category: 'automation',
    match_type: 'phrase',
    formatted_keyword: '"intelligence artificielle pour woocommerce"'
  },
  {
    keyword: 'automatisation e-commerce ia',
    category: 'automation',
    match_type: 'phrase',
    formatted_keyword: '"automatisation e-commerce ia"'
  },
  {
    keyword: 'ia dropshipping boutique',
    category: 'automation',
    match_type: 'phrase',
    formatted_keyword: '"ia dropshipping boutique"'
  },
  {
    keyword: 'maillage interne automatique wordpress',
    category: 'automation',
    match_type: 'phrase',
    formatted_keyword: '"maillage interne automatique wordpress"'
  },
  {
    keyword: 'analyse sémantique seo e-commerce',
    category: 'automation',
    match_type: 'phrase',
    formatted_keyword: '"analyse sémantique seo e-commerce"'
  },

  // 5. Protection de Marque
  {
    keyword: 'nexus ai',
    category: 'brand',
    match_type: 'phrase',
    formatted_keyword: '"nexus ai"'
  },
  {
    keyword: 'nexus woocommerce',
    category: 'brand',
    match_type: 'phrase',
    formatted_keyword: '"nexus woocommerce"'
  },
  {
    keyword: 'nexus auto pilot',
    category: 'brand',
    match_type: 'phrase',
    formatted_keyword: '"nexus auto pilot"'
  },
  {
    keyword: 'nexus intelligence boutique',
    category: 'brand',
    match_type: 'phrase',
    formatted_keyword: '"nexus intelligence boutique"'
  },

  // 6. Mots-clés négatifs
  {
    keyword: 'gratuit',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-gratuit'
  },
  {
    keyword: 'gratuite',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-gratuite'
  },
  {
    keyword: 'formation',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-formation'
  },
  {
    keyword: 'cours',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-cours'
  },
  {
    keyword: 'tuto',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-tuto'
  },
  {
    keyword: 'pdf',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-pdf'
  },
  {
    keyword: 'recrutement',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-recrutement'
  },
  {
    keyword: 'emploi',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-emploi'
  },
  {
    keyword: 'stage',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-stage'
  },
  {
    keyword: 'code source',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-"code source"'
  },
  {
    keyword: 'null',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-null'
  },
  {
    keyword: 'crack',
    category: 'negative',
    match_type: 'negative',
    formatted_keyword: '-crack'
  }
];
