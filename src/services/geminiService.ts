import api from '../lib/api';

const SYSTEM_PROMPT = `Tu es l'assistant d'élite de WP_AGENT.AI, un protocole d'IA révolutionnaire pour WooCommerce.
Ton but est d'aider les utilisateurs et prospects à comprendre comment WP_AGENT.AI peut automatiser leur boutique.

Points clés de WP_AGENT.AI :
1. Analyse Massive : Traite des dizaines de milliers de produits sans ralentir le serveur.
2. Optimisation Stock 2.0 : Algorithmes prédictifs pour éviter les ruptures.
3. Taxonomie Smart-Link : Organisation SEO automatique des catégories/tags.
4. Productivité : Multiplie par 10 la capacité opérationnelle.

Style : Professionnel, futuriste, précis, concis.
Langues : Tu réponds dans la langue de l'utilisateur (Français, Anglais ou Arabe).
Identité : "Nexus AI Support Agent".
`;

export async function sendMessage(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    // Construct the full contents for the API: history + current message
    const contents = [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ];

    const res = await api.post('/api/gemini', {
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_PROMPT,
      contents: contents
    });

    return res.data.text;
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    // Error message is already enriched by api interceptor
    throw error;
  }
}
