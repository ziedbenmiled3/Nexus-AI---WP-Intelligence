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
        { id: "products", label: "Manager Produits" },
        { id: "categories", label: "Catégories & Tags" },
        { id: "maintenance", label: "Maintenance" },
        { id: "settings", label: "Paramètres" }
      ]
    }
  ],
  packs: {
    test: { name: "TEST VISION", price: "0$", duration: "1440 MIN", activeFeatures: ["audit"] },
    starter: { name: "STARTER PROTOCOL", price: "29$", duration: "mois", activeFeatures: ["audit", "products", "categories", "maintenance", "settings", "comm-hub"] },
    pro: { name: "PRO NEXUS", price: "89$", duration: "mois", activeFeatures: ["audit", "products", "categories", "maintenance", "settings", "comm-hub", "social", "smart-feed", "content", "internal-links"] },
    elite: { name: "ELITE VISION", price: "249$", duration: "mois", activeFeatures: ["audit", "products", "categories", "maintenance", "settings", "comm-hub", "social", "smart-feed", "content", "internal-links", "market", "stock", "forecast", "autopilot"] }
  }
};
