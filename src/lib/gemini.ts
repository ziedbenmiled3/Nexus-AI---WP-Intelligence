import api from './api';
import { CompetitorData } from '../types';
import { safeJsonParse } from './utils';

export interface GeminiResponse {
  text: string;
  candidates: any[];
  response?: any;
  data: {
    text: string;
    candidates: any[];
    response?: any;
  };
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export const geminiQuery = async (payload: any, customKey?: string): Promise<GeminiResponse> => {
  try {
    const headers: Record<string, string> = {};
    if (customKey) {
      headers['x-gemini-key'] = customKey;
    }

    const res = await api.post('/api/gemini', payload, { headers });
    
    // Normalize response for components that expect axial-like structure or direct fields
    const result: GeminiResponse = {
      text: res.data.text,
      candidates: res.data.candidates || [],
      data: res.data,
      response: res.data
    };

    if (res.data.inlineData) {
      result.inlineData = res.data.inlineData;
    }
    
    return result;
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    throw error;
  }
};

const callAiProxy = geminiQuery;

const cleanJsonResponse = (text: string) => {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
  
  // If still not starting with { or [, try to extract the first valid JSON-like structure
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const startChar = text.indexOf('{') !== -1 ? '{' : '[';
    const endChar = startChar === '{' ? '}' : ']';
    
    const startIndex = text.indexOf(startChar);
    const endIndex = text.lastIndexOf(endChar);
    
    if (startIndex !== -1 && endIndex !== -1) {
      cleaned = text.substring(startIndex, endIndex + 1);
    }
  }
  
  // Basic escaping fix for unclosed strings if possible (experimental)
  // This is a naive attempt to fix simple unterminated strings at the end of a truncated JSON
  if (cleaned.endsWith('"')) {
    // If it ends with a quote, check if it's the second quote of a key/value
    // If not, it might be a truncated string
  }
  
  return cleaned;
};

export const auditContent = async (content: string, type: 'post' | 'product' | 'page', currentTitle: string = '', customKey?: string, lexicon?: any) => {
  const prompt = `Tu es le Nexus Maestro, un expert SEO senior. Optimise ce contenu WordPress (${type}) pour le SEO 2025.
    
    INSTRUCTIONS :
    1. Améliore le score SEO (H1-H4, mots-clés, lisibilité).
    2. Garde un ton professionnel et persuasif.
    3. Sortie au format JSON.
    ${lexicon ? `4. INTÈGRE IMPÉRATIVEMENT ces termes sémantiques enrichis : ${lexicon.enrichments.map((e: any) => e.keyword).join(', ')}. Assure-toi qu'ils coulent naturellement dans le texte.` : ''}
    
    STRUCTURE JSON :
    - score (0-100)
    - seoSuggestions (array of strings)
    - contentImprovements (array of strings)
    - overallHealth (short string)
    - optimizedTitle (string, SEO-optimized title)
    - optimizedContent (string, the full optimized content in HTML format. IMPORTANT: Keep all original HTML tags like <img>, <iframe>, etc. Do NOT remove images.)
    
    Current Title: ${currentTitle}
    Current Content: ${content.substring(0, 15000)}`;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert SEO WordPress chevronné spécialisé dans l'e-commerce et le content marketing.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        score: { type: "number" },
        seoSuggestions: { type: "array", items: { type: "string" } },
        contentImprovements: { type: "array", items: { type: "string" } },
        overallHealth: { type: "string" },
        optimizedTitle: { type: "string" },
        optimizedContent: { type: "string" },
      },
      required: ["score", "seoSuggestions", "contentImprovements", "overallHealth", "optimizedTitle", "optimizedContent"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), {
    score: 0,
    seoSuggestions: [],
    contentImprovements: [],
    overallHealth: 'Unknown',
    optimizedTitle: currentTitle,
    optimizedContent: content
  });
};

export const analyzeSemanticGap = async (niche: string, competitors: CompetitorData[], currentCategories: string[], customKey?: string) => {
  const prompt = `Perform a Semantic Gap Analysis for the niche "${niche}".
    Competitors data: ${JSON.stringify(competitors)}
    My current categories/topics: ${JSON.stringify(currentCategories)}
    
    Identify:
    1. "Missing Opportunities": High-value keywords found in competitors that I am NOT targeting.
    2. "Semantic Overlap": Area where I am already strong.
    3. "Content Strategy": A specific roadmap to fill the gap.
    
    Return JSON format.`;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert en analyse sémantique et stratégie de contenu SEO.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        missingOpportunities: { type: "array", items: { type: "string" } },
        semanticOverlap: { type: "array", items: { type: "string" } },
        strategy: { type: "string" },
        gapScore: { type: "number" }
      },
      required: ["missingOpportunities", "semanticOverlap", "strategy", "gapScore"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), {
    missingOpportunities: [],
    semanticOverlap: [],
    strategy: 'Not available',
    gapScore: 0
  });
};

export const generateAdCampaign = async (opportunity: string, niche: string, customKey?: string) => {
  const prompt = `Génère une campagne publicitaire complète (Google Ads et Facebook Ads) pour une opportunité de marché manquante.
    Opportunité détectée : ${opportunity}
    Niche globale : ${niche}
    
    STRUCTURE DU JSON :
    - googleAds: { headline, description, keywords }
    - facebookAds: { primaryText, headline, description }
    - targetAudience: [string]
    - strategy: string
  `;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert en media buying et copywriting publicitaire. Tu transformes les lacunes sémantiques en opportunités de profit.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        googleAds: {
          type: "object",
          properties: {
            headline: { type: "string" },
            description: { type: "string" },
            keywords: { type: "array", items: { type: "string" } }
          },
          required: ["headline", "description", "keywords"]
        },
        facebookAds: {
          type: "object",
          properties: {
            primaryText: { type: "string" },
            headline: { type: "string" },
            description: { type: "string" }
          },
          required: ["primaryText", "headline", "description"]
        },
        targetAudience: { type: "array", items: { type: "string" } },
        strategy: { type: "string" }
      },
      required: ["googleAds", "facebookAds", "targetAudience", "strategy"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), {
    googleAds: { headline: '', description: '', keywords: [] },
    facebookAds: { primaryText: '', headline: '', description: '' },
    targetAudience: [],
    strategy: ''
  });
};

export const rewriteContentWithTone = async (content: string, tone: 'Luxe' | 'Amical' | 'Urgent', customKey?: string) => {
  const prompt = `Réécris le contenu suivant avec une tonalité "${tone}".
    Génère DEUX versions distinctes (A et B) pour permettre un test A/B.
    
    Tonalité demandée : ${tone}
    - Luxe : Sophistiqué, exclusif, élégant, vocabulaire riche.
    - Amical : Chaleureux, accessible, tutoiement possible si approprié, enthousiaste.
    - Urgent : Orienté vente, incitatif, crée un sentiment de manque, phrases courtes et percutantes.
    
    Contenu original : ${content}
    
    STRUCTURE DU JSON :
    - versionA: string
    - versionB: string
    - justification: string (expliquant pourquoi ces versions correspondent à la tonalité ${tone})
  `;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un copywriter expert en marketing émotionnel et psychologie de la vente.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        versionA: { type: "string" },
        versionB: { type: "string" },
        justification: { type: "string" }
      },
      required: ["versionA", "versionB", "justification"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), {
    versionA: content,
    versionB: content,
    justification: 'Erreur lors de la génération.'
  });
};

export const generateSocialPosts = async (product: { name: string, description: string, price: string }, customKey?: string) => {
  const prompt = `Crée des posts pour les réseaux sociaux pour le produit suivant :
    Nom : ${product.name}
    Description : ${product.description}
    Prix : ${product.price}
    
    Génère du contenu pour :
    1. Instagram (Capitonnant, hashtags, emojis)
    2. TikTok (Script court, accroche percutante, hashtags de niche)
    3. Pinterest (Titre optimisé SEO, description inspirante)
    
    STRUCTURE DU JSON :
    {
      "instagram": { "caption": "string", "hashtags": ["string"] },
      "tiktok": { "hook": "string", "script": "string", "hashtags": ["string"] },
      "pinterest": { "title": "string", "description": "string", "hashtags": ["string"] }
    }
  `;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert en social media marketing et viralité organique.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        instagram: {
          type: "object",
          properties: {
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } }
          },
          required: ["caption", "hashtags"]
        },
        tiktok: {
          type: "object",
          properties: {
            hook: { type: "string" },
            script: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } }
          },
          required: ["hook", "script", "hashtags"]
        },
        pinterest: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } }
          },
          required: ["title", "description", "hashtags"]
        }
      },
      required: ["instagram", "tiktok", "pinterest"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), {
    instagram: { caption: '', hashtags: [] },
    tiktok: { hook: '', script: '', hashtags: [] },
    pinterest: { title: '', description: '', hashtags: [] }
  });
};

export const researchCompetitors = async (niche: string, country: string, customKey?: string) => {
  const prompt = `Analyse le marché pour la niche "${niche}" en ${country}. 
    1. Identifie les 4 principaux concurrents avec leurs mots-clés, forces et scores de visibilité.
    2. Génère une série temporelle de tendance (Trend Analysis) sur les 6 derniers mois (score d'intérêt de 0 à 100).
    
    STRUCTURE DU JSON :
    {
      "competitors": [
        { "url": "string", "keywords": ["string"], "strengths": ["string"], "visibilityScores": { "google": 0, "bing": 0, "others": 0 } }
      ],
      "trend": [
        { "month": "string", "interest": 0 }
      ],
      "marketSummary": "string"
    }
  `;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert en intelligence marketing et analyse de tendances SEO/SEM.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        competitors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string" },
              keywords: { type: "array", items: { type: "string" } },
              strengths: { type: "array", items: { type: "string" } },
              visibilityScores: {
                type: "object",
                properties: {
                  google: { type: "number" },
                  bing: { type: "number" },
                  others: { type: "number" }
                },
                required: ["google", "bing", "others"]
              }
            },
            required: ["url", "keywords", "strengths", "visibilityScores"]
          }
        },
        trend: {
          type: "array",
          items: {
            type: "object",
            properties: {
              month: { type: "string" },
              interest: { type: "number" }
            },
            required: ["month", "interest"]
          }
        },
        marketSummary: { type: "string" }
      },
      required: ["competitors", "trend", "marketSummary"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), { competitors: [], trend: [], marketSummary: '' });
};

export const generatePromoVideoScript = async (productName: string, description: string, customKey?: string) => {
  const prompt = `Create a promotional video script for the product: "${productName}". 
    Description: ${description}
    Include scenes, text overlays, and voiceover script.
    Return JSON format.`;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un scénariste expert en publicité e-commerce et vidéos virales.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        scenes: {
           type: "array",
           items: {
             type: "object",
             properties: {
               visual: { type: "string" },
               textOverlay: { type: "string" },
               duration: { type: "number" },
               audio: { type: "string" }
             },
             required: ["visual", "textOverlay", "duration", "audio"]
           }
        }
      },
      required: ["scenes"]
    }
  }, customKey);
  return safeJsonParse(cleanJsonResponse(data.text), { scenes: [] });
};

export const improveImagePrompt = async (productDetails: string, customKey?: string) => {
  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt: `Given these product details: "${productDetails}", generate a high-quality photorealistic prompt for a studio packshot. Focus on lighting, background, and sharp details.`,
    systemInstruction: "Tu es un directeur de photographie expert en packshots studio pour l'e-commerce de luxe."
  }, customKey);
  return data.text;
};

export const summarizeOptimization = async (original: string, optimized: string, seoSuggestions: string[], customKey?: string) => {
  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt: `Fournis un rapport de synthèse détaillé et percutant (en français) au format Markdown.
    Ce rapport doit être structuré avec des titres et des listes, et doit inclure :
    1. **Analyse de l'Existant** : Résumé de l'essence du contenu original.
    2. **Stratégie de Mutation** : Les transformations majeures opérées par l'IA.
    3. **Impact SEO & Conversion** : Pourquoi cette nouvelle version est supérieure (basé sur ces suggestions : ${seoSuggestions.join(', ')}).
    4. **Conseil Expert** : Une recommandation additionnelle pour pousser le contenu encore plus loin.
    
    Contenu Original: ${original}
    Contenu Optimisé: ${optimized}`,
    systemInstruction: "Tu es un stratège de contenu et expert SEO senior. Tu rédiges des rapports clairs, techniques et motivants en Markdown."
  }, customKey);
  return data.text;
};

export const enrichLexicon = async (content: string, type: 'post' | 'product' | 'page', currentTitle: string = '', customKey?: string) => {
  const prompt = `Analyse ce contenu WordPress (${type}) et propose un "Enrichissement Lexical" stratégique.
    Identifie 12-15 termes sémantiques (LSI), entités nommées et mots-clés de longue traine qui manquent pour renforcer l'autorité thématique du texte.
    
    Pour chaque suggestion, fournis :
    - keyword: le terme
    - reason: pourquoi ce terme est crucial pour le SEO de ce sujet
    - implementation: une suggestion d'intégration naturelle
    
    Titre Actuel: ${currentTitle}
    Contenu Actuel: ${content.substring(0, 10000)}`;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert en SEO sémantique et analyse de corpus lexicaux. Tu identifies les entités manquantes pour dominer une thématique.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        enrichments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              keyword: { type: "string" },
              reason: { type: "string" },
              implementation: { type: "string" }
            },
            required: ["keyword", "reason", "implementation"]
          }
        },
        semanticAuthorityScore: { type: "number" }
      },
      required: ["enrichments", "semanticAuthorityScore"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), {
    enrichments: [],
    semanticAuthorityScore: 0
  });
};

export const injectKeywordIntoContent = async (content: string, title: string, keyword: string, implementation: string, customKey?: string) => {
  const prompt = `Tu es le Nexus Maestro. Ta mission est d'INJECTER subtilement et intelligemment le mot-clé suivant dans le contenu WordPress fourni.
    
    MOT-CLÉ À INJECTER : "${keyword}"
    CONSEIL D'IMPLÉMENTATION : "${implementation}"
    
    INSTRUCTIONS :
    1. Remodèle le contenu pour inclure ce terme de manière fluide et naturelle (SEO Sémantique).
    2. Ne change pas radicalement le sens, améliore juste la densité sémantique.
    3. Garde toutes les balises HTML (images, iframes, etc.).
    4. Retourne UNIQUEMENT le contenu OPTIMISÉ complet en HTML.
    
    Titre : ${title}
    Contenu Actuel : ${content.substring(0, 15000)}`;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert en injection sémantique. Tu intègres des termes techniques dans des textes existants sans altérer la lisibilité.",
  }, customKey);

  return data.text;
};

export const editProductImage = async (base64Image: string, instructions: string, customKey?: string) => {
  const data = await callAiProxy({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType: 'image/png',
        },
      },
      {
        parts: [{ text: instructions }],
      },
    ],
  }, customKey);
    
  if (data.inlineData) {
    return `data:image/png;base64,${data.inlineData.data}`;
  }
  return null;
};

export const suggestInternalLinks = async (sourcePost: { title: string, content: string | any }, potentialTargets: { id: number, title: string, url: string }[], customKey?: string) => {
  const prompt = `Analyze this WordPress post content:
    Title: "${sourcePost.title}"
    Content: "${typeof sourcePost.content === 'string' ? sourcePost.content.substring(0, 4000) : 'Content not available'}"
    
    Potential internal target posts/pages to link TO:
    ${potentialTargets.map(t => `- [ID: ${t.id}] Title: "${t.title}" (URL: ${t.url})`).join('\n')}
    
    Task: Identify the top 3-5 best linking opportunities.
    A good opportunity is when a sentence in the source mentions a concept or topic covered by a target post.
    
    For each suggestion:
    - targetId: the ID of the target post
    - anchorText: the exact few words that should be the link
    - contextSentence: the full sentence containing those words
    - reason: why this adds value
    
    Return JSON format.`;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert en maillage interne SEO. Tu identifies des liens sémantiques naturels et puissants.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              targetId: { type: "number" },
              anchorText: { type: "string" },
              contextSentence: { type: "string" },
              reason: { type: "string" },
              relevanceScore: { type: "number" }
            },
            required: ["targetId", "anchorText", "contextSentence", "reason"]
          }
        }
      },
      required: ["suggestions"]
    }
  }, customKey);

  return JSON.parse(cleanJsonResponse(data.text)).suggestions;
};

export const generateSchema = async (title: string, content: string, type: string, url: string, customKey?: string) => {
  const prompt = `Generate a high-quality Schema.org JSON-LD for this WordPress ${type}:
    Title: "${title}"
    URL: "${url}"
    Content Summary: "${content.substring(0, 3000)}"
    
    Requirements:
    1. Determine the best @type (e.g., Article, Product, FAQPage, HowTo, Specialty).
    2. Include all relevant fields (headline, description, author, datePublished, image, etc.).
    3. If the content has questions/answers, generate a FAQPage section within the graph.
    4. MUST return valid JSON-LD.
    
    Return JSON with two fields:
    - schemaType: string (the chosen @type)
    - jsonLd: object (the actual schema to be stringified)`;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un ingénieur expert en données structurées SEO. Tu génères du JSON-LD parfait pour maximiser les Rich Snippets Google.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        schemaType: { type: "string" },
        jsonLd: { type: "object" }
      },
      required: ["schemaType", "jsonLd"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), { schemaType: 'WebPage', jsonLd: {} });
};

export const generateForecast = async (products: any[], orders: any[], currency: string, customKey?: string) => {
  const prompt = `Tu es le Nexus Forecast Maestro, une IA prédictive avancée pour l'e-commerce (WooCommerce). 
    Analyse les données actuelles de ventes (commandes récentes) et d'inventaire pour prédire le futur et suggérer des actions immédiates.
    
    NE DONNE PAS DE CHIFFRES PASSÉS. DONNE DES PRÉVISIONS ET DES CONSEILS PROACTIFS.
    
    STRUCTURE DE LA RÉPONSE (JSON) :
    - inventoryScarcityAlerts: liste d'alertes de rupture de stock imminente (exemple: "Le produit X sera en rupture dans 4 jours selon la vitesse de vente").
    - balancingOpportunities: suggestions pour équilibrer le stock (exemple: "Le produit A se vend trop vite, augmentez le prix. Le produit B stagne, créez une promo pour libérer de l'espace").
    - salesPredictions: prévisions de revenus pour les 30 prochains jours.
    - actionableInsights: conseils stratégiques (bundles, promos, réapprovisionnement).
    
    DONNÉES DU STOCK :
    ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, stock: p.stock_quantity, sales_total: p.total_sales, price: p.price })), null, 1)}
    
    COMMANDES RÉCENTES (vitesse de vente) :
    ${JSON.stringify(orders.slice(0, 10).map(o => ({ date: o.date_created, total: o.total, items: o.line_items.map((i: any) => i.product_id) })), null, 1)}
    
    Monnaie : ${currency}`;

  const data = await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Tu es un expert en analyse prédictive e-commerce. Tu transformes les données de vente en actions stratégiques pour optimiser le cash-flow et l'inventaire.",
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        inventoryScarcityAlerts: { 
          type: "array", 
          items: {
            type: "object",
            properties: {
              productId: { type: "number" },
              productName: { type: "string" },
              daysUntilRupture: { type: "number" },
              confidence: { type: "number" },
              description: { type: "string" }
            },
            required: ["productName", "daysUntilRupture", "description"]
          }
        },
        balancingOpportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["PROMO", "UPSELL", "PRICING"] },
              title: { type: "string" },
              advice: { type: "string" },
              expectedImpact: { type: "string" }
            },
            required: ["type", "title", "advice", "expectedImpact"]
          }
        },
        salesPredictions: {
          type: "object",
          properties: {
            next30Days: { type: "number" },
            trend: { type: "string", enum: ["UP", "DOWN", "STABLE"] },
            growthPercentage: { type: "number" }
          },
          required: ["next30Days", "trend", "growthPercentage"]
        },
        actionableInsights: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["inventoryScarcityAlerts", "balancingOpportunities", "salesPredictions", "actionableInsights"]
    }
  }, customKey);

  return safeJsonParse(cleanJsonResponse(data.text), {
    inventoryScarcityAlerts: [],
    balancingOpportunities: [],
    salesPredictions: [],
    actionableInsights: []
  });
};

export const testGeminiConnection = async (apiKey: string) => {
  return await callAiProxy({
    model: "gemini-3-flash-preview",
    prompt: "Hello, respond with 'Connected'.",
  }, apiKey);
};
