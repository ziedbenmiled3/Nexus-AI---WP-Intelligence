export const DEFAULT_NEXUS_CONFIG = {
  categories: [
    {
      id: "marketing_ventes",
      label: "Marketing & Ventes",
      features: [
        { id: "social", label: "Nexus Social" },
        { id: "smart-feed", label: "Flux Smart Shopping" },
        { id: "market", label: "Intelligence Marché" }
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
        { id: "comm-hub", label: "Communication Hub" }
      ]
    },
    {
      id: "catalogue_admin",
      label: "Catalogue & Admin",
      features: [
        { id: "woo-manager", label: "Commandes & Clients" },
        { id: "products", label: "Manager Produits" },
        { id: "categories", label: "Catégories & Tags" },
        { id: "maintenance", label: "Maintenance" },
        { id: "settings", label: "Paramètres" }
      ]
    }
  ],
  packs: {
    test: { name: "TEST VISION", price: "0$", duration: "1440 MIN", activeFeatures: ["audit"] },
    starter: { name: "STARTER PROTOCOL", price: "29$", duration: "mois", activeFeatures: ["audit", "woo-manager", "products", "categories", "maintenance", "settings", "comm-hub"] },
    pro: { name: "PRO NEXUS", price: "89$", duration: "mois", activeFeatures: ["audit", "woo-manager", "products", "categories", "maintenance", "settings", "comm-hub", "social", "smart-feed", "content", "internal-links"] },
    elite: { name: "ELITE VISION", price: "249$", duration: "mois", activeFeatures: ["audit", "woo-manager", "products", "categories", "maintenance", "settings", "comm-hub", "social", "smart-feed", "content", "internal-links", "market", "stock", "forecast", "autopilot"] }
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
          defaultPack.price = savedPack.price;
        }
        if (typeof savedPack.duration === 'string') {
          defaultPack.duration = savedPack.duration;
        }

        // Build activeFeatures list
        if (Array.isArray(savedPack.activeFeatures)) {
          const activeSet = new Set<string>();
          
          // Process each default feature
          merged.categories.forEach((cat: any) => {
            cat.features.forEach((feat: any) => {
              const fid = feat.id;
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

  return merged;
}
