# Résumé du Projet : Nexus AI Dashboard

Ce document résume l'architecture, les fonctionnalités et l'utilité de chaque section de l'application Nexus AI.

## 1. Architecture Globale
L'application est construite sur une architecture **Full-stack (Express + Vite)**. 
- **Frontend :** React 18 avec Tailwind CSS et Motion pour une interface fluide et moderne.
- **Backend :** Express.js servant d'intermédiaire (proxy) pour contourner les limitations CORS et sécuriser les clés API.
- **Base de données & Auth :** Intégration complète avec Firebase (Authentication et Firestore) pour la gestion multi-utilisateurs et la persistance des sites.

## 2. Système de Proxy Gemini AI (Cœur de l'application)
Une implémentation robuste pour communiquer avec l'API Google Gemini.
- **Multi-modèles :** Supporte nativement Gemini 1.5 Flash (standard), 1.5 Pro, et 2.0 Flash.
- **Retry Logic :** En cas d'échec d'un modèle ou d'une version d'API (v1 vs v1beta), le serveur bascule automatiquement sur les alternatives disponibles.
- **BYOK (Bring Your Own Key) :** Permet à chaque utilisateur d'utiliser sa propre clé API tout en offrant une clé système (Nexus) aux administrateurs.

## 3. Gestion Multi-Sites WordPress
Section permettant de connecter plusieurs sites WordPress à un seul tableau de bord.
- **Authentification :** Support des "Mots de passe d'application" (Application Passwords) et des clés WooCommerce.
- **Proxy WordPress :** Un tunnel sécurisé permettant de lire et modifier le contenu WordPress directement depuis Nexus sans erreurs CORS.
- **Synchronisation Cloud :** Les configurations sont sauvegardées de manière sécurisée dans Firestore.

## 4. Audit & Optimisation SEO
Outil central pour améliorer le contenu existant.
- **Scoring :** Analyse le contenu et attribue un score sur 100.
- **Suggestions :** Liste des améliorations sémantiques et techniques.
- **Optimisation IA :** Génère une version améliorée du titre et du contenu tout en préservant les médias (images/iframes).

## 5. Maillage Interne (Internal Linking)
Analyse sémantique pour lier les articles entre eux.
- **Identification :** L'IA scanne le site pour trouver les meilleures opportunités de liens naturels.
- **Contexte :** Génère le texte d'ancre et le contexte exact pour une intégration fluide.

## 6. Moteur de Schémas (Schema Engine)
Génération automatique de données structurées JSON-LD.
- **Multi-types :** Article, Product, FAQ, HowTo, etc.
- **Validation :** Produit un code prêt à être inséré dans WordPress pour maximiser les Rich Snippets Google.

## 7. Analyse Concurrentielle (Competitor View)
Recherche et analyse de niche.
- **Benchmarking :** Identifie les top concurrents dans une niche donnée.
- **Mots-clés :** Extrait les stratégies de mots-clés et estime le score de visibilité.

## 8. AutoPilot & Stratégie
- **Recherche de mots-clés :** Génération de listes de mots-clés stratégiques.
- **Rédaction Automatique :** (En cours de déploiement) Planification et rédaction de contenu par lots.

## 9. Gestion des Médias & Vidéos
- **Scripts Vidéo Promo :** Génère des scénarios complets pour des vidéos promotionnelles (scènes, audio, overlays).
- **Optimisation d'Images :** Nettoyage et amélioration des prompts pour les visuels de produits.

## 11. Guide de Dépannage (Troubleshoot)
### Erreur de Clé API Gemini (400/404/403)
Si une nouvelle clé échoue au test :
1. **Délai de propagation :** Une nouvelle clé peut mettre 1 à 3 minutes à devenir active sur les serveurs de Google.
2. **Support de modèle :** Nexus essaye automatiquement les versions Stable (`v1`) et Beta (`v1beta`) pour garantir la compatibilité.
3. **Zone Géographique :** Si vous recevez une erreur de localisation, Google restreint peut-être votre compte. Essayez de créer la clé depuis une autre région ou vérifiez les restrictions de votre compte Google Cloud.
## 12. Exportation des documents
### Comment générer un PDF de ce document ?
1. Dans le code, ouvrez `PROJECT_SUMMARY.md`.
2. Copiez tout le texte.
3. Utilisez un convertisseur Markdown en PDF en ligne (ex: Dillinger.io, StackEdit.io) ou collez dans Word/Google Docs et "Enregistrer sous PDF".
4. Vous pouvez aussi imprimer la page "Settings" de Nexus qui contient une vue d'ensemble du système.

## 13. Déploiement & Mises à Jour
### Mon application sur Vercel ne fonctionne pas comme sur AI Studio ?
Si vous avez déployé Nexus sur votre propre hébergement (Vercel, Railway, etc.), les corrections effectuées ici ne s'appliquent pas automatiquement.
1. **Poussez vos modifications :** Vous devez faire un nouveau `git push` ou re-déployer manuellement votre projet sur votre hébergement pour que le nouveau code du "Proxy Gemini" (qui gère mieux les régions et les versions d'API) soit actif.
2. **Configuration IP/Région :** Si votre hébergement est dans une région non supportée (ex: certains serveurs Vercel en Europe), l'API Gemini peut retourner des erreurs 400/403. Nexus essaye maintenant de détecter cela et de vous en informer.
