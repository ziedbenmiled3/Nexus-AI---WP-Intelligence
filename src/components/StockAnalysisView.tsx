import React, { useState, useEffect, useMemo } from "react";
import {
  Zap,
  Package,
  Search,
  RefreshCw,
  Loader2,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Edit3,
  Eye,
  AlertCircle,
  PackageX,
  Plus,
  Minus,
  X,
  ExternalLink,
  TrendingUp,
  ShieldCheck,
  BrainCircuit,
  Trash2,
  DollarSign,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WPConfig } from "../types";
import { wpFetch } from "../lib/wordpress";
import { geminiQuery, suggestStockActions } from "../lib/gemini";
import ReactMarkdown from "react-markdown";

interface Props {
  config: WPConfig;
}

type StockFilter = "TOUS" | "RUPTURE" | "BAS";
type SortOrder = "A-Z" | "MIN STOCK" | "MAX STOCK";

export default function StockAnalysisView({ config }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("app_currency") || "€",
  );

  // AI Advice States
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [showAdviceModal, setShowAdviceModal] = useState(false);

  // AI Stock Actions States
  const [showAiActionsModal, setShowAiActionsModal] = useState(false);
  const [aiActionsProduct, setAiActionsProduct] = useState<any | null>(null);
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);
  const [aiActions, setAiActions] = useState<any[]>([]);
  const [aiActionsSummary, setAiActionsSummary] = useState("");
  const [executingActionId, setExecutingActionId] = useState<string | null>(
    null,
  );
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StockFilter>("TOUS");
  const [sortOrder, setSortOrder] = useState<SortOrder>("A-Z");

  const [editingStock, setEditingStock] = useState<Record<number, number>>({});
  const [variationsMap, setVariationsMap] = useState<Record<number, any[]>>({});
  const [expandedVariationId, setExpandedVariationId] = useState<number | null>(
    null,
  );
  const [variationUpdatingId, setVariationUpdatingId] = useState<number | null>(
    null,
  );

  const loadVariations = async (productId: number) => {
    if (variationsMap[productId]) {
      setExpandedVariationId(
        expandedVariationId === productId ? null : productId,
      );
      return;
    }

    setVariationUpdatingId(productId);
    try {
      const data = await wpFetch(
        config,
        `/wc/v3/products/${productId}/variations`,
        "GET",
        null,
        { per_page: 100 },
      );
      setVariationsMap((prev) => ({
        ...prev,
        [productId]: Array.isArray(data) ? data : [],
      }));
      setExpandedVariationId(productId);
      setVariationUpdatingId(null);
    } catch (err) {
      console.error("Error loading variations:", err);
      setVariationUpdatingId(null);
    }
  };

  const handleUpdateVariationStock = async (
    productId: number,
    variationId: number,
    newStock: number,
  ) => {
    setVariationUpdatingId(variationId);
    try {
      await wpFetch(
        config,
        `/wc/v3/products/${productId}/variations/${variationId}`,
        "PUT",
        {
          manage_stock: true,
          stock_quantity: newStock,
        },
      );
      setVariationsMap((prev) => {
        const updatedVariations = (prev[productId] || []).map((v: any) =>
          v.id === variationId
            ? {
                ...v,
                stock_quantity: newStock,
                stock_status: newStock > 0 ? "instock" : "outofstock",
              }
            : v,
        );
        return { ...prev, [productId]: updatedVariations };
      });
      setVariationUpdatingId(null);
    } catch (err) {
      console.error("Error updating variation stock:", err);
      setVariationUpdatingId(null);
    }
  };

  const handleManualStockChange = (productId: number, val: number) => {
    setEditingStock((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleManualSave = async (product: any) => {
    const newQuantity = editingStock[product.id] ?? product.stock_quantity ?? 0;
    setUpdatingId(product.id);

    try {
      await wpFetch(config, `/wc/v3/products/${product.id}`, "PUT", {
        stock_quantity: newQuantity,
        manage_stock: true,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                stock_quantity: newQuantity,
                stock_status: newQuantity > 0 ? "instock" : "outofstock",
              }
            : p,
        ),
      );

      // Clear editing state for this product
      const nextEditing = { ...editingStock };
      delete nextEditing[product.id];
      setEditingStock(nextEditing);
    } catch (err: any) {
      console.error("Failed to save stock:", err);
      alert("Erreur lors de la sauvegarde du stock.");
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setProducts([]);
    setRecentOrders([]);

    try {
      // Sequential fetches to be stable
      const productsData = await wpFetch(
        config,
        "/wc/v3/products",
        "GET",
        null,
        { per_page: 100, status: "any" },
      );
      const categoriesData = await wpFetch(
        config,
        "/wc/v3/products/categories",
        "GET",
        null,
        { per_page: 100 },
      ).catch(() => []);
      const settingsData = await wpFetch(
        config,
        "/wc/v3/settings/general",
        "GET",
      ).catch(() => null);
      const ordersData = await wpFetch(config, "/wc/v3/orders", "GET", null, {
        per_page: 50,
      }).catch(() => []);

      if (Array.isArray(productsData)) {
        // Load local custom / simulated products
        const localProductsStr = localStorage.getItem(
          `nexus_local_products_${config.url}`,
        );
        let localProducts: any[] = [];
        if (localProductsStr) {
          try {
            localProducts = JSON.parse(localProductsStr) || [];
            if (!Array.isArray(localProducts)) localProducts = [];
          } catch {}
        }

        const fetched = Array.isArray(productsData) ? productsData : [];
        const filteredLocalList = localProducts.filter((lp: any) => {
          return !fetched.some(
            (fp: any) =>
              fp.id === lp.id ||
              (fp.sku &&
                lp.sku &&
                fp.sku.toLowerCase() === lp.sku.toLowerCase()) ||
              (fp.name &&
                lp.name &&
                fp.name.toLowerCase() === lp.name.toLowerCase()),
          );
        });

        setProducts([...filteredLocalList, ...fetched]);
      }
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      }
      if (Array.isArray(ordersData)) {
        setRecentOrders(ordersData);
      }
      if (Array.isArray(settingsData)) {
        const currencySetting = settingsData.find(
          (s) => s.id === "woocommerce_currency",
        );
        if (currencySetting?.value) {
          const currencyMap: Record<string, string> = {
            TND: "DT",
            EUR: "€",
            USD: "$",
          };
          setCurrency(
            currencyMap[currencySetting.value] || currencySetting.value,
          );
        }
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Stock fetch failed:", err);
      const status = err.response?.status;
      const proxyError = err.response?.data?.error;

      if (status === 404 || proxyError === "HTML_RESPONSE") {
        setError(
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 text-red-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-black uppercase tracking-widest">
                Accès WooCommerce Bloqué
              </p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-[2rem] space-y-3">
              <p className="text-[11px] text-slate-300 font-medium">
                Votre WordPress refuse l'accès aux données de stock (Retour
                HTML). Voici comment corriger :
              </p>
              <ul className="list-disc ml-5 text-[10px] text-slate-400 space-y-2 normal-case tracking-normal">
                <li>
                  <strong className="text-white italic">Permaliens :</strong>{" "}
                  Allez dans{" "}
                  <span className="text-white">Réglages &gt; Permaliens</span>,
                  choisissez "Nom de l'article" et cliquez sur "Enregistrer".
                </li>
                <li>
                  <strong className="text-white italic">
                    Pare-feu / Plugins :
                  </strong>{" "}
                  Désactivez temporairement les plugins de sécurité (Wordfence,
                  iThemes) pour tester.
                </li>
                <li>
                  <strong className="text-white italic">Basic Auth :</strong>{" "}
                  Assurez-vous que l'authentification Basic est autorisée sur
                  votre serveur Apache/Nginx.
                </li>
              </ul>
            </div>
            <button
              onClick={fetchData}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all border border-white/5"
            >
              Réessayer la Synchronisation
            </button>
          </div>,
        );
      } else {
        const detail = err.response?.data?.message || err.message;
        setError(
          `Erreur [${status || 500}]: ${detail}. Le serveur est peut-être trop lent.`,
        );
      }
      setLoading(false);
    }
  };

  const handleQuickStockUpdate = async (product: any, amount: number) => {
    setUpdatingId(product.id);

    try {
      if (product.type === "variable") {
        // Fetch variations if not already loaded
        let variationsToUpdate = variationsMap[product.id] || [];
        if (variationsToUpdate.length === 0) {
          const data = await wpFetch(
            config,
            `/wc/v3/products/${product.id}/variations`,
            "GET",
            null,
            { per_page: 100 },
          );
          if (Array.isArray(data)) {
            variationsToUpdate = data;
          }
        }

        if (variationsToUpdate.length === 0) {
          alert("Aucune variation trouvée pour ce produit.");
          return false;
        }

        // Update each variation
        const updatedVariations = await Promise.all(
          variationsToUpdate.map(async (v: any) => {
            const currentVQty =
              typeof v.stock_quantity === "number"
                ? v.stock_quantity
                : parseInt(String(v.stock_quantity)) || 0;
            const newVQty = currentVQty + amount;
            try {
              await wpFetch(
                config,
                `/wc/v3/products/${product.id}/variations/${v.id}`,
                "PUT",
                {
                  manage_stock: true,
                  stock_quantity: newVQty,
                },
              );
              return {
                ...v,
                stock_quantity: newVQty,
                stock_status: newVQty > 0 ? "instock" : "outofstock",
              };
            } catch (err) {
              console.error(`Failed to update variation ${v.id}:`, err);
              return v;
            }
          }),
        );

        // Save updated variations locally
        setVariationsMap((prev) => ({
          ...prev,
          [product.id]: updatedVariations,
        }));

        // Sum variation stock to display at parent level
        const totalStock = updatedVariations.reduce(
          (acc, curr) =>
            acc +
            (typeof curr.stock_quantity === "number"
              ? curr.stock_quantity
              : parseInt(String(curr.stock_quantity)) || 0),
          0,
        );
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  stock_quantity: totalStock,
                  stock_status: totalStock > 0 ? "instock" : "outofstock",
                }
              : p,
          ),
        );
        return true;
      } else {
        const currentQty =
          typeof product.stock_quantity === "number"
            ? product.stock_quantity
            : parseInt(String(product.stock_quantity)) || 0;
        const newQuantity = currentQty + amount;
        await wpFetch(config, `/wc/v3/products/${product.id}`, "PUT", {
          stock_quantity: newQuantity,
          manage_stock: true,
        });

        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  stock_quantity: newQuantity,
                  stock_status: newQuantity > 0 ? "instock" : "outofstock",
                }
              : p,
          ),
        );
        return true;
      }
    } catch (err: any) {
      console.error("Failed to update stock:", err);
      alert("Erreur lors de la mise à jour du stock.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStockStatusClick = async (product: any) => {
    setAiActionsProduct(product);
    setShowAiActionsModal(true);
    setIsGeneratingActions(true);
    setAiActions([]);
    setAiActionsSummary("");

    try {
      const result = await suggestStockActions(
        product,
        currency,
        config.geminiApiKey,
      );
      setAiActions(result.suggestions || []);
      setAiActionsSummary(result.analysisSummary || "");
    } catch (err) {
      console.error("AI Actions Error:", err);
      setAiActionsSummary(
        "Impossible de générer des suggestions pour le moment.",
      );
    } finally {
      setIsGeneratingActions(false);
    }
  };

  const executeAiAction = async (action: any) => {
    if (!aiActionsProduct) return;
    setExecutingActionId(action.label);

    try {
      if (action.type === "RESTOCK") {
        const success = await handleQuickStockUpdate(
          aiActionsProduct,
          action.value || 50,
        );
        if (success) {
          alert(`Succès : ${action.label} appliqué !`);
          setShowAiActionsModal(false);
        }
      } else if (action.type === "SALE" || action.type === "PRICE_ADJUST") {
        setUpdatingId(aiActionsProduct.id);
        const regularPrice = parseFloat(
          aiActionsProduct.regular_price || aiActionsProduct.price,
        );
        let salePrice = regularPrice;

        if (action.type === "SALE") {
          // Assuming value is percentage discount
          salePrice = regularPrice * (1 - (action.value || 15) / 100);
        } else {
          // Adjust price directly
          salePrice = action.value || regularPrice;
        }

        const finalSalePrice = Math.round(salePrice * 100) / 100;

        await wpFetch(config, `/wc/v3/products/${aiActionsProduct.id}`, "PUT", {
          sale_price: finalSalePrice.toString(),
          on_sale: true,
        });

        setProducts((prev) =>
          prev.map((p) =>
            p.id === aiActionsProduct.id
              ? {
                  ...p,
                  sale_price: finalSalePrice.toString(),
                  price: finalSalePrice.toString(),
                  on_sale: true,
                }
              : p,
          ),
        );

        alert(`Succès : ${action.label} appliqué !`);
        setShowAiActionsModal(false);
      } else {
        alert(
          "Action complexe : Veuillez l'appliquer manuellement dans WooCommerce.",
        );
      }
    } catch (err) {
      console.error("Execute AI Action Error:", err);
      alert("Échec de l'action AI.");
    } finally {
      setExecutingActionId(null);
      setUpdatingId(null);
    }
  };

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
  };

  const executeDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(productToDelete.id);
    try {
      await wpFetch(config, `/wc/v3/products/${productToDelete.id}`, "DELETE", null, {
        force: true,
      });

      // Also delete from sync local products cache
      try {
        const localProductsStr = localStorage.getItem(
          `nexus_local_products_${config.url}`,
        );
        if (localProductsStr) {
          const localProducts = JSON.parse(localProductsStr) || [];
          if (Array.isArray(localProducts)) {
            const updated = localProducts.filter(
              (lp: any) => lp.id !== productToDelete.id && lp.sku !== productToDelete.sku,
            );
            localStorage.setItem(
              `nexus_local_products_${config.url}`,
              JSON.stringify(updated),
            );
          }
        }
      } catch (e) {
        console.error(e);
      }

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      if (selectedProduct?.id === productToDelete.id) setSelectedProduct(null);
      setProductToDelete(null);
    } catch (err: any) {
      console.error(err);
      
      const isNotFoundError = err.response?.status === 404 || 
                            err.response?.data?.status === 404 ||
                            err.response?.data?.code?.includes('invalid_id') ||
                            err.response?.data?.code?.includes('not_found') ||
                            err.response?.data?.message?.toLowerCase().includes('not found') ||
                            err.response?.data?.message?.toLowerCase().includes('introuvable') ||
                            err.response?.data?.message?.toLowerCase().includes("n'existe pas") ||
                            err.message?.toLowerCase().includes('not found') ||
                            err.message?.toLowerCase().includes('404');

      if (isNotFoundError) {
        // Clear locally since it is already gone on Wordpress
        try {
          const localProductsStr = localStorage.getItem(
            `nexus_local_products_${config.url}`,
          );
          if (localProductsStr) {
            const localProducts = JSON.parse(localProductsStr) || [];
            if (Array.isArray(localProducts)) {
              const updated = localProducts.filter(
                (lp: any) => lp.id !== productToDelete.id && lp.sku !== productToDelete.sku,
              );
              localStorage.setItem(
                `nexus_local_products_${config.url}`,
                JSON.stringify(updated),
              );
            }
          }
        } catch (e) {
          console.error(e);
        }
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        if (selectedProduct?.id === productToDelete.id) setSelectedProduct(null);
        setProductToDelete(null);
        alert("Note: Ce produit n'existait plus sur WordPress (déjà supprimé là-bas). Retiré de Nexus avec succès !");
      } else {
        alert("Erreur lors de la suppression du produit.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const generateAIAdvice = async () => {
    if (products.length === 0) return;

    setIsGeneratingAdvice(true);
    setShowAdviceModal(true);
    setAiAdvice("");

    try {
      // Filter interesting data to keep context small and relevant
      const stockSummary = products
        .map((p) => ({
          name: p.name,
          sku: p.sku,
          stock: p.stock_quantity,
          status: p.stock_status,
          sales: p.total_sales,
          price: p.price,
          low_stock: p.low_stock_amount || 5,
        }))
        .filter(
          (p) =>
            p.status !== "instock" ||
            (p.stock !== null && p.stock <= p.low_stock) ||
            (p.sales && p.sales > 0),
        );

      const prompt = `En tant qu'expert en gestion de stocks et logistique pour e-commerce (WooCommerce), analyse l'état actuel de mon inventaire et donne-moi des conseils stratégiques concrets. Monnaie du site: ${currency}.
      
Objectifs :
1. Identifier les produits critiques (en rupture ou stock bas) qui sont des best-sellers.
2. Suggérer des quantités de réapprovisionnement basées sur la vitesse de vente.
3. Proposer des actions marketing (promotions, bundles) pour les produits qui ne tournent pas assez.
4. Donner une vision globale de la santé du stock (surplus vs pénurie).

Données de l'inventaire actuel (échantillon pertinent) :
${JSON.stringify(stockSummary.slice(0, 40), null, 2)}

Réponds en français, avec un ton professionnel, analytique et encourageant. Utilise un format Markdown élégant avec des titres et des listes.`;

      const res = await geminiQuery(
        {
          model: "gemini-3-flash-preview",
          prompt,
          systemInstruction:
            "Tu es un expert en gestion de stocks et logistique e-commerce.",
        },
        config.geminiApiKey,
      );

      setAiAdvice(
        res.data.text ||
          "Désolé, je n'ai pas pu générer de conseils pour le moment.",
      );
    } catch (err: any) {
      console.error("Gemini Error:", err);
      setAiAdvice(`Erreur AI: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [config.url]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.sku && p.sku.toLowerCase().includes(s)),
      );
    }

    // Category
    if (selectedCategory !== "all") {
      result = result.filter((p) =>
        p.categories?.some(
          (c: any) =>
            c.slug === selectedCategory || c.id.toString() === selectedCategory,
        ),
      );
    }

    // Status
    if (statusFilter === "RUPTURE") {
      result = result.filter((p) => p.stock_status === "outofstock");
    } else if (statusFilter === "BAS") {
      result = result.filter(
        (p) =>
          p.stock_status === "instock" &&
          p.stock_quantity !== null &&
          p.stock_quantity <= (p.low_stock_amount || 5),
      );
    }

    // Sort
    if (sortOrder === "A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "MIN STOCK") {
      result.sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0));
    } else if (sortOrder === "MAX STOCK") {
      result.sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0));
    }

    return result;
  }, [products, search, selectedCategory, statusFilter, sortOrder]);

  const marketIntelligence = useMemo(() => {
    // 1. Total Stock Value
    const totalValue = products.reduce((acc, p) => {
      const price = parseFloat(p.price || "0");
      const qty = p.stock_quantity || 0;
      return acc + price * qty;
    }, 0);

    // 2. Products on Promotion
    const promoCount = products.filter((p) => p.on_sale).length;

    // 3. Average Basket (AOV)
    // From recent orders
    const completedOrders = recentOrders.filter(
      (o) => o.status !== "cancelled" && o.status !== "failed",
    );
    const totalOrderedAmount = completedOrders.reduce(
      (acc, o) => acc + parseFloat(o.total || "0"),
      0,
    );
    const aov =
      completedOrders.length > 0
        ? totalOrderedAmount / completedOrders.length
        : 0;

    return {
      totalValue,
      promoCount,
      aov,
    };
  }, [products, recentOrders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Card */}
      <div className="bg-[#0a0c10] border border-slate-800/60 p-6 rounded-[2.5rem] flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Package className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              Gestion des Stocks
            </h1>
            <p className="text-slate-500 font-medium text-xs tracking-wide">
              Contrôle rapide des inventaires & réapprovisionnement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateAIAdvice}
            disabled={loading || isGeneratingAdvice}
            className="flex items-center gap-2.5 px-6 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-blue-500/20 active:scale-95 group disabled:opacity-50"
          >
            {isGeneratingAdvice ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            )}
            AI Advice
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Intelligence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0c10] border border-slate-800/60 p-6 rounded-[2rem] flex items-center gap-5 group hover:border-blue-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <DollarSign className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Valeur Totale du Stock
            </p>
            <h3 className="text-2xl font-black text-white italic tracking-tighter">
              {loading
                ? "---"
                : `${marketIntelligence.totalValue.toLocaleString()} ${currency}`}
            </h3>
          </div>
        </div>

        <div className="bg-[#0a0c10] border border-slate-800/60 p-6 rounded-[2rem] flex items-center gap-5 group hover:border-blue-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Tag className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Produits en Promotion
            </p>
            <h3 className="text-2xl font-black text-white italic tracking-tighter">
              {loading ? "---" : `${marketIntelligence.promoCount} ACTIFS`}
            </h3>
          </div>
        </div>

        <div className="bg-[#0a0c10] border border-slate-800/60 p-6 rounded-[2rem] flex items-center gap-5 group hover:border-blue-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Panier Moyen (AOV)
            </p>
            <h3 className="text-2xl font-black text-white italic tracking-tighter">
              {loading
                ? "---"
                : `${marketIntelligence.aov.toFixed(2)} ${currency}`}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[300px] relative">
          <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou SKU..."
            className="w-full bg-[#0d0f14] border border-slate-800/80 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/30 focus:bg-slate-900/50 transition-all"
          />
        </div>

        {/* Category Select */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-[#0d0f14] border border-slate-800/80 rounded-2xl py-4 pl-6 pr-12 text-xs font-bold text-white focus:outline-none focus:border-blue-500/30 transition-all cursor-pointer min-w-[200px]"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-slate-800" />
        </div>

        {/* Status Toggles */}
        <div className="bg-[#0d0f14] border border-slate-800/80 p-1.5 rounded-2xl flex">
          {(["TOUS", "RUPTURE", "BAS"] as StockFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === filter
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort Toggles */}
        <div className="bg-[#0d0f14] border border-slate-800/80 p-1.5 rounded-2xl flex">
          {(["A-Z", "MIN STOCK", "MAX STOCK"] as SortOrder[]).map((order) => (
            <button
              key={order}
              onClick={() => setSortOrder(order)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                sortOrder === order
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {order}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0d0f14] border border-slate-800/60 rounded-[3rem] overflow-hidden min-h-[600px] flex flex-col relative">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-slate-800/80 bg-slate-900/10">
          <div className="col-span-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
            Produit
          </div>
          <div className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
            SKU
          </div>
          <div className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
            Inventaire
          </div>
          <div className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
            Actions Rapides
          </div>
          <div className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
            Mise à jour Manuel
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 relative custom-scrollbar overflow-y-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d0f14]"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  Synchronisation de l'entrepôt...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
              >
                <AlertCircle className="w-16 h-16 text-red-500/40 mb-2" />
                <p className="text-sm font-bold text-red-400 uppercase tracking-widest">
                  {error}
                </p>
                <button
                  onClick={fetchData}
                  className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline"
                >
                  Réessayer
                </button>
              </motion.div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-6"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-slate-900/50 border border-slate-800 flex items-center justify-center">
                  <PackageX className="w-10 h-10 text-slate-700" />
                </div>
                <p className="text-xl font-black text-slate-700 uppercase tracking-widest">
                  Aucun produit trouvé avec ces critères
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="divide-y divide-slate-800/40"
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="divide-y divide-slate-800/20 bg-slate-900/5"
                  >
                    <div className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-slate-800/20 transition-all group">
                    {/* Product */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 group-hover:border-blue-500/30 transition-colors">
                        {product.images?.[0]?.src ? (
                          <img
                            src={product.images[0].src}
                            alt=""
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[12px] font-black text-white uppercase tracking-wider truncate mb-1">
                          {product.name}
                        </h4>
                        <div className="flex gap-2">
                          {product.categories?.slice(0, 2).map((c: any) => (
                            <span
                              key={c.id}
                              className="text-[7px] font-black text-slate-600 uppercase tracking-widest"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SKU */}
                    <div className="col-span-2">
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-400 transition-colors">
                        {product.sku || "---"}
                      </span>
                    </div>

                    {/* Inventory */}
                    <div className="col-span-2 px-1">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-end">
                          {product.type === "variable" ? (
                            <button
                              onClick={() => loadVariations(product.id)}
                              className="text-[11px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all duration-150"
                            >
                              <span>VARIABLE</span>
                              {variationUpdatingId === product.id ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <ChevronDown
                                  className={`w-2.5 h-2.5 transition-transform ${expandedVariationId === product.id ? "rotate-180" : ""}`}
                                />
                              )}
                            </button>
                          ) : product.manage_stock === false ? (
                            <button
                              disabled={updatingId === product.id}
                              onClick={async () => {
                                setUpdatingId(product.id);
                                try {
                                  await wpFetch(config, `/wc/v3/products/${product.id}`, "PUT", { manage_stock: true });
                                  setProducts((prev) =>
                                    prev.map((p) => (p.id === product.id ? { ...p, manage_stock: true } : p))
                                  );
                                } catch (e) {
                                  alert("Impossible d'activer la gestion de stock.");
                                } finally {
                                  setUpdatingId(null);
                                }
                              }}
                              className="text-[9px] font-black px-2 py-0.5 rounded-lg text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all uppercase flex items-center gap-1 disabled:opacity-50"
                              title="Cliquer pour activer la gestion de stock WooCommerce pour ce produit"
                            >
                              {updatingId === product.id ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                "GÉRÉ PAR WP"
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStockStatusClick(product)}
                              className={`text-[11px] font-black px-2 py-0.5 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                                product.stock_status === "outofstock"
                                  ? "text-red-500 bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                  : product.stock_quantity <=
                                      (product.low_stock_amount || 5)
                                    ? "text-amber-500 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                    : "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40"
                              }`}
                            >
                              {product.stock_status === "outofstock"
                                ? "Rupture AI"
                                : `${product.stock_quantity ?? 0} UNITS (AI)`}
                            </button>
                          )}
                          <span className="text-[8px] font-black text-slate-600 uppercase">
                            Min: {product.low_stock_amount || 5}
                          </span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              product.type === "variable"
                                ? "bg-blue-500 w-full opacity-30"
                                : product.manage_stock === false
                                  ? "bg-emerald-500 w-full opacity-50"
                                  : product.stock_status === "outofstock"
                                    ? "bg-red-500 w-0"
                                    : product.stock_quantity <=
                                        (product.low_stock_amount || 5)
                                      ? "bg-amber-500 w-1/4"
                                      : "bg-emerald-500 w-3/4"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions Rapides */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          title="Visualiser"
                          className="p-2.5 rounded-xl bg-[#0d0f14] border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all group/btn active:scale-90"
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>

                        <button
                          onClick={() => handleQuickStockUpdate(product, 10)}
                          disabled={updatingId === product.id}
                          title={
                            product.type === "variable"
                              ? "Ajouter +10 à toutes les variations"
                              : "Ajouter +10"
                          }
                          className="px-3 h-9 rounded-xl bg-[#0d0f14] border border-slate-800 text-[10px] font-black text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all active:scale-95 disabled:opacity-30"
                        >
                          {updatingId === product.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "+10"
                          )}
                        </button>

                        <button
                          onClick={() => handleQuickStockUpdate(product, 50)}
                          disabled={updatingId === product.id}
                          title={
                            product.type === "variable"
                              ? "Ajouter +50 à toutes les variations"
                              : "Ajouter +50"
                          }
                          className="px-3 h-9 rounded-xl bg-[#0d0f14] border border-slate-800 text-[10px] font-black text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all active:scale-95 disabled:opacity-30"
                        >
                          {updatingId === product.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "+50"
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product)}
                          disabled={isDeleting === product.id}
                          title="Supprimer le produit"
                          className="p-2.5 rounded-xl bg-[#0d0f14] border border-slate-800 text-slate-600 hover:text-red-500 hover:border-red-500/30 transition-all group/btn active:scale-90 disabled:opacity-50"
                        >
                          {isDeleting === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Manual update */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex bg-slate-950 rounded-xl border border-slate-800/60 overflow-hidden ${product.type === "variable" ? "opacity-30 pointer-events-none" : ""}`}
                        >
                          <button
                            onClick={() =>
                              handleManualStockChange(
                                product.id,
                                (editingStock[product.id] ??
                                  (product.stock_quantity || 0)) - 1,
                              )
                            }
                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-900 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            readOnly={product.type === "variable"}
                            value={
                              editingStock[product.id] ??
                              (product.stock_quantity || 0)
                            }
                            onChange={(e) =>
                              handleManualStockChange(
                                product.id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-12 bg-transparent text-center text-[10px] font-black text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() =>
                              handleManualStockChange(
                                product.id,
                                (editingStock[product.id] ??
                                  (product.stock_quantity || 0)) + 1,
                              )
                            }
                            className="p-2 text-slate-600 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {editingStock[product.id] !== undefined && (
                          <button
                            onClick={() => handleManualSave(product)}
                            disabled={updatingId === product.id}
                            className="text-[8px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1"
                          >
                            {updatingId === product.id ? (
                              <Loader2 className="w-2 h-2 animate-spin" />
                            ) : (
                              "SAVE"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Variations Section */}
                  {expandedVariationId === product.id &&
                    variationsMap[product.id] && (
                      <div className="px-8 py-5 bg-[#0a0c10]/40 border-t border-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Variations de Stock pour {product.name}
                          </div>
                          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                            Mise à jour directe instantanée
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {variationsMap[product.id].map((variation: any) => (
                            <div
                              key={variation.id}
                              className="p-3.5 bg-[#0d0f14] border border-slate-800/80 rounded-2xl flex items-center justify-between group/var hover:border-blue-500/30 transition-all"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="text-[10px] font-black text-white uppercase tracking-wider block truncate">
                                  {variation.attributes
                                    ?.map((a: any) => a.option)
                                    .join(" / ") || "Variante"}
                                </span>
                                <span className="text-[8px] font-mono text-slate-500 block truncate">
                                  SKU: {variation.sku || "---"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex bg-[#05070a] rounded-lg border border-slate-800 overflow-hidden">
                                  <button
                                    onClick={() =>
                                      handleUpdateVariationStock(
                                        product.id,
                                        variation.id,
                                        (variation.stock_quantity || 0) - 1,
                                      )
                                    }
                                    disabled={
                                      variationUpdatingId === variation.id
                                    }
                                    className="p-1 px-2 text-slate-600 hover:text-red-400 hover:bg-[#0a0c10] transition-colors disabled:opacity-30"
                                  >
                                    <Minus className="w-2.5 h-2.5" />
                                  </button>
                                  <input
                                    type="number"
                                    disabled={
                                      variationUpdatingId === variation.id
                                    }
                                    value={variation.stock_quantity || 0}
                                    onChange={(e) => {
                                      const val =
                                        parseInt(e.target.value) || 0;
                                      handleUpdateVariationStock(
                                        product.id,
                                        variation.id,
                                        val,
                                      );
                                    }}
                                    className="w-10 bg-transparent text-center text-[10px] font-black text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button
                                    onClick={() =>
                                      handleUpdateVariationStock(
                                        product.id,
                                        variation.id,
                                        (variation.stock_quantity || 0) + 1,
                                      )
                                    }
                                    disabled={
                                      variationUpdatingId === variation.id
                                    }
                                    className="p-1 px-2 text-slate-600 hover:text-emerald-400 hover:bg-[#0a0c10] transition-colors disabled:opacity-30"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                {variationUpdatingId === variation.id && (
                                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {expandedVariationId === product.id &&
                    (!variationsMap[product.id] ||
                      variationsMap[product.id].length === 0) && (
                      <div className="px-8 py-4 bg-slate-900/50 border-t border-slate-800/40 text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          Aucune variation disponible pour ce produit.
                        </p>
                      </div>
                    )}
                </div>
              ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product View Sidebar */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0a0c10] border-l border-slate-800 z-[101] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">
                      Détails Produit
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      NEXUS Insight x86
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                {/* Image & Main Info */}
                <div className="flex gap-8">
                  <div className="w-48 h-48 rounded-[2rem] bg-slate-800 border border-slate-700 overflow-hidden shadow-inner flex-shrink-0">
                    {selectedProduct.images?.[0]?.src ? (
                      <img
                        src={selectedProduct.images[0].src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight mb-2">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-xs font-mono text-blue-400 mb-4">
                      {selectedProduct.sku || "SANS SKU"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.categories?.map((cat: any) => (
                        <span
                          key={cat.id}
                          className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                      Statut Stock
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${selectedProduct.stock_status === "instock" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`}
                      />
                      <span className="text-xs font-black text-white uppercase">
                        {selectedProduct.stock_status === "instock"
                          ? "En Stock"
                          : "Rupture"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                      Quantité Réelle
                    </p>
                    <span className="text-2xl font-black text-white">
                      {selectedProduct.stock_quantity || 0}
                    </span>
                  </div>
                </div>

                {/* Detailed Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                      Performances & Seuil
                    </p>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 uppercase tracking-widest">
                        Prix de vente
                      </span>
                      <span className="text-white">
                        {selectedProduct.price
                          ? `${selectedProduct.price} ${currency}`
                          : selectedProduct.regular_price
                            ? `${selectedProduct.regular_price} ${currency}`
                            : "---"}
                      </span>
                    </div>
                    <div className="h-px bg-slate-800" />
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 uppercase tracking-widest">
                        Seuil Alerte (Low Stock)
                      </span>
                      <span className="text-amber-400 font-black">
                        {selectedProduct.low_stock_amount || 5} UNITÉS
                      </span>
                    </div>
                    <div className="h-px bg-slate-800" />
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 uppercase tracking-widest">
                        Ventes (Mois)
                      </span>
                      <span className="text-blue-400 font-black">
                        {selectedProduct.total_sales || 0} UNITÉS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                      Actions d'administration
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <a
                      href={selectedProduct.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl hover:bg-blue-600/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                          Voir en boutique
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-blue-400 -rotate-90 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Stock Actions Modal */}
      <AnimatePresence>
        {showAiActionsModal && aiActionsProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAiActionsModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[85vh] bg-[#0d0f14] border border-slate-800 z-[121] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">
                      NEXUS Stock Optimizer
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Actions IA : {aiActionsProduct.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiActionsModal(false)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {isGeneratingActions ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                      <Sparkles className="w-4 h-4 text-indigo-400 absolute top-0 right-0 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xs font-black text-white uppercase tracking-widest animate-pulse">
                        Génération de stratégies IA...
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed px-12">
                        Analyse de la vitesse de vente, du stock résiduel et de
                        l'élasticité prix
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {aiActionsSummary && (
                      <div className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-[2rem]">
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic">
                          "{aiActionsSummary}"
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                      {aiActions.map((action, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all"
                        >
                          <div className="flex-1 pr-4">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                              {action.type === "RESTOCK" && (
                                <Package className="w-3.5 h-3.5 text-blue-400" />
                              )}
                              {action.type === "SALE" && (
                                <Tag className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              {action.type === "PRICE_ADJUST" && (
                                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              {action.type === "BUNDLE" && (
                                <Plus className="w-3.5 h-3.5 text-purple-400" />
                              )}
                              {action.label}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                          <button
                            onClick={() => executeAiAction(action)}
                            disabled={!!executingActionId}
                            className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                              executingActionId === action.label
                                ? "bg-slate-800 text-slate-500"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 active:scale-95"
                            }`}
                          >
                            {executingActionId === action.label ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                            {executingActionId === action.label
                              ? "Exécution..."
                              : "Appliquer"}
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest text-center max-w-xs">
                        Nexus AI utilise des modèles prédictifs. Vérifiez
                        toujours les marges avant d'appliquer une promotion
                        massive.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Advice Modal */}
      <AnimatePresence>
        {showAdviceModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdviceModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] bg-[#0d0f14] border border-slate-800 z-[111] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">
                      NEXUS AI ADVISOR
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Optimisation stratégique des stocks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdviceModal(false)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {isGeneratingAdvice ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                      <Sparkles className="w-4 h-4 text-blue-400 absolute top-0 right-0 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xs font-black text-white uppercase tracking-widest animate-pulse">
                        Analyse de l'inventaire en cours...
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        Le moteur Nexus traite vos données de vente et de stock
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="markdown-body prose prose-invert prose-blue max-w-none text-slate-300">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-black text-white uppercase tracking-tight mt-6 mb-4">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-black text-blue-400 uppercase tracking-tight mt-6 mb-3">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest mt-4 mb-2">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-sm leading-relaxed mb-4">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-2 mb-4 text-sm marker:text-blue-500">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="pl-2">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-black text-white">
                            {children}
                          </strong>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500/50 bg-blue-500/5 p-4 rounded-r-xl my-6 italic text-slate-400">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {aiAdvice}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-900/5 flex justify-end">
                <button
                  onClick={() => setShowAdviceModal(false)}
                  className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all active:scale-95"
                >
                  Fermer Nexus
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal for Product Deletion */}
      <AnimatePresence>
        {productToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (isDeleting === null) setProductToDelete(null);
              }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0d0f14] border border-red-500/20 z-[201] shadow-2xl rounded-[2.5rem] overflow-hidden p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />
              </div>

              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">
                Suppression Définitive
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3 px-4">
                Êtes-vous sûr de vouloir supprimer définitivement <span className="font-bold text-white">"{productToDelete.name}"</span> ?
              </p>

              <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-500/10 rounded-xl py-2 px-4 mb-8">
                Cette action est totalement irréversible dans WooCommerce.
              </p>

              <div className="flex items-center gap-4 w-full">
                <button
                  type="button"
                  disabled={isDeleting !== null}
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-4 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-30"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isDeleting !== null}
                  onClick={executeDeleteProduct}
                  className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-red-950/40 transition-all disabled:opacity-50 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {isDeleting !== null ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Suppression...</span>
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
