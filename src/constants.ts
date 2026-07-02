export const DEFAULT_NEXUS_CONFIG = {
  categories: [
    {
      id: "marketing_ventes",
      label: "Marketing & Ventes",
      features: [
        { id: "wp-crm", label: "Gestion Clientèle WP" },
        { id: "social", label: "Nexus Social" },
        { id: "pixels", label: "Multi-Pixel Publicitaire" },
        { id: "smart-feed", label: "Flux Smart Shopping" },
        { id: "market", label: "Intelligence Marché" },
        { id: "affiliates", label: "Affiliation" }
      ]
    },
    {
      id: "stocks_logistique",
      label: "Stocks & Logistique",
      features: [
        { id: "stock", label: "Analyse Stocks" },
        { id: "forecast", label: "Nexus Forecast" }
      ]
    },
    {
      id: "seo_contenu",
      label: "SEO & Contenu",
      features: [
        { id: "audit", label: "Audit SEO" },
        { id: "content", label: "Machine à Contenu" },
        { id: "autopilot", label: "Auto-Pilote" },
        { id: "internal-links", label: "Maillage Interne" },
        { id: "comm-hub", label: "Hub de Communication" }
      ]
    },
    {
      id: "catalogue_admin",
      label: "Catalogue & Admin",
      features: [
        { id: "dashboard", label: "Tableau de Bord" },
        { id: "woo-manager", label: "Commandes WooCommerce" },
        { id: "products", label: "Manager Produits" },
        { id: "categories", label: "Catégories & Tags" },
        { id: "security", label: "Bouclier de Sécurité" },
        { id: "maintenance", label: "Maintenance" },
        { id: "settings", label: "Paramètres" },
        { id: "collab", label: "Invitations & Équipe" }
      ]
    }
  ],
  packs: {
    test: {
      name: "TEST VISION",
      price: "0 €",
      duration: "1440 min",
      siteLimit: 1,
      isLifetime: false,
      isLaunchPack: false,
      launchStockLimit: 0,
      launchStockSold: 0,
      isActive: true,
      activeFeatures: ["dashboard", "security", "wp-crm", "pixels", "social", "smart-feed", "market", "stock", "forecast", "audit", "content", "autopilot", "internal-links", "comm-hub", "woo-manager", "products", "categories", "maintenance", "settings", "collab", "affiliates"]
    },
    starter: {
      name: "STARTER PROTOCOL",
      price: "29 €",
      duration: "mois",
      siteLimit: 1,
      isLifetime: false,
      isLaunchPack: false,
      launchStockLimit: 0,
      launchStockSold: 0,
      isActive: true,
      activeFeatures: ["audit", "woo-manager", "products", "categories", "security", "maintenance", "settings", "comm-hub", "wp-crm", "pixels"]
    },
    pro: {
      name: "PRO NEXUS",
      price: "89 €",
      duration: "mois",
      siteLimit: 5,
      isLifetime: false,
      isLaunchPack: false,
      launchStockLimit: 0,
      launchStockSold: 0,
      isActive: true,
      activeFeatures: ["audit", "woo-manager", "products", "categories", "security", "maintenance", "settings", "comm-hub", "social", "smart-feed", "content", "internal-links", "wp-crm", "collab", "pixels"]
    },
    elite: {
      name: "ELITE VISION",
      price: "249 €",
      duration: "mois",
      siteLimit: 12,
      isLifetime: false,
      isLaunchPack: false,
      launchStockLimit: 0,
      launchStockSold: 0,
      isActive: true,
      activeFeatures: ["dashboard", "security", "wp-crm", "pixels", "social", "smart-feed", "market", "stock", "forecast", "audit", "content", "autopilot", "internal-links", "comm-hub", "woo-manager", "products", "categories", "maintenance", "settings", "collab", "affiliates"]
    },
    launch: {
      name: "LANCEMENT UNIQUE",
      price: "199 €",
      duration: "à vie",
      siteLimit: 3,
      isLifetime: true,
      isLaunchPack: true,
      launchStockLimit: 100,
      launchStockSold: 42,
      isActive: true,
      activeFeatures: ["dashboard", "security", "wp-crm", "pixels", "social", "smart-feed", "market", "stock", "forecast", "audit", "content", "autopilot", "internal-links", "comm-hub", "woo-manager", "products", "categories", "maintenance", "settings", "collab", "affiliates"]
    }
  }
};

export function mergeRegistryConfig(saved: any): typeof DEFAULT_NEXUS_CONFIG {
  if (!saved || typeof saved !== 'object') {
    return JSON.parse(JSON.stringify(DEFAULT_NEXUS_CONFIG));
  }

  const merged = JSON.parse(JSON.stringify(DEFAULT_NEXUS_CONFIG));

  // Gather all feature IDs that actually existed in the saved configuration's categories
  const savedFeatureIds = new Set<string>();
  if (Array.isArray(saved.categories)) {
    saved.categories.forEach((cat: any) => {
      if (cat && Array.isArray(cat.features)) {
        cat.features.forEach((feat: any) => {
          if (feat && feat.id) {
            savedFeatureIds.add(feat.id);
          }
        });
      }
    });
  }

  // Merge packs safely
  if (saved.packs && typeof saved.packs === 'object') {
    Object.keys(merged.packs).forEach((key) => {
      const defaultPack = merged.packs[key as keyof typeof merged.packs];
      const savedPack = saved.packs[key];

      if (savedPack && typeof savedPack === 'object') {
        if (typeof savedPack.name === 'string' && savedPack.name) {
          defaultPack.name = savedPack.name;
        }
        if (typeof savedPack.price === 'string') {
          defaultPack.price = savedPack.price.replace('$', ' €').replace(/\s+/g, ' ').trim();
        }
        if (typeof savedPack.duration === 'string') {
          defaultPack.duration = savedPack.duration;
        }
        if (typeof savedPack.siteLimit === 'number') {
          defaultPack.siteLimit = savedPack.siteLimit;
        } else if (typeof savedPack.site_limit === 'number') {
          defaultPack.siteLimit = savedPack.site_limit;
        }
        if (typeof savedPack.isLifetime === 'boolean') {
          defaultPack.isLifetime = savedPack.isLifetime;
        }
        if (typeof savedPack.isLaunchPack === 'boolean') {
          defaultPack.isLaunchPack = savedPack.isLaunchPack;
        }
        if (typeof savedPack.launchStockLimit === 'number') {
          defaultPack.launchStockLimit = savedPack.launchStockLimit;
        }
        if (typeof savedPack.launchStockSold === 'number') {
          defaultPack.launchStockSold = savedPack.launchStockSold;
        }
        if (typeof savedPack.isActive === 'boolean') {
          defaultPack.isActive = savedPack.isActive;
        }

        // Build activeFeatures list
        if (key === 'test' || key === 'trial') {
          // Force all available feature IDs
          const allFeatures: string[] = [];
          merged.categories.forEach((cat: any) => {
            if (cat && Array.isArray(cat.features)) {
              cat.features.forEach((feat: any) => {
                if (feat && feat.id) {
                  allFeatures.push(feat.id);
                }
              });
            }
          });
          defaultPack.activeFeatures = allFeatures;
        } else if (Array.isArray(savedPack.activeFeatures)) {
          const activeSet = new Set<string>();
          
          // Process each default feature
          merged.categories.forEach((cat: any) => {
            cat.features.forEach((feat: any) => {
              const fid = feat.id;
              
              // If it's the brand new 'pixels' feature and defaultPack has it, force-enable it
              if (fid === 'pixels' && defaultPack.activeFeatures.includes('pixels')) {
                activeSet.add(fid);
                return;
              }

              if (savedFeatureIds.has(fid)) {
                // Existed in old config: use saved state
                if (savedPack.activeFeatures.includes(fid)) {
                  activeSet.add(fid);
                }
              } else {
                // NEW feature in code defaults: fall back to default active state
                if (defaultPack.activeFeatures.includes(fid)) {
                  activeSet.add(fid);
                }
              }
            });
          });

          defaultPack.activeFeatures = Array.from(activeSet);
        }
      }
    });
  }

  // Safeguard: Ensure ALL available features are in the activeFeatures of 'test', 'elite', and 'launch'
  const targetPacks = ['test', 'elite', 'launch'];
  const allFeatures: string[] = [];
  merged.categories.forEach((cat: any) => {
    if (cat && Array.isArray(cat.features)) {
      cat.features.forEach((feat: any) => {
        if (feat && feat.id) {
          allFeatures.push(feat.id);
        }
      });
    }
  });

  targetPacks.forEach((pKey) => {
    const pack = merged.packs[pKey as keyof typeof merged.packs];
    if (pack) {
      pack.activeFeatures = [...allFeatures];
    }
  });

  return merged;
}
