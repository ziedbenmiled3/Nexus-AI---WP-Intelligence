import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      nav: {
        dashboard: 'Tableau de Bord',
        sites: 'Sites WordPress',
        autopilot: 'Auto-Pilote',
        audit: 'Audit SEO',
        content: 'Machine à Contenu',
        affiliate: 'Affiliation',
        settings: 'Paramètres',
        superAdmin: 'Super Admin'
      },
      common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        test: 'Tester',
        delete: 'Supprimer',
        pay: 'Payer',
        active: 'Actif',
        status: 'Statut',
        amount: 'Montant',
        date: 'Date',
        name: 'Nom',
        email: 'Email',
        loading: 'Chargement...',
        success: 'Succès',
        error: 'Erreur'
      },
      affiliate: {
        title: 'PARTENAIRE HUB',
        subtitle: 'Croissance de l\'Ecosystème AI • Suivi des Revenus • Règlements Instants',
        console: 'CONSOLE PARTENAIRE',
        adminView: 'VUE SUPER-ADMIN',
        totalRevenue: 'REVENU TOTAL GÉNÉRÉ',
        balance: 'SOLDE DISPONIBLE',
        referrals: 'CLIENTS RÉFÉRÉS',
        payouts: 'DEMANDES DE PAIEMENT',
        requestPayment: 'DEMANDER UN PAIEMENT',
        payNow: 'PAYER MAINTENANT',
        referralLink: 'VOTRE LIEN D\'AFFILIÉ',
        copy: 'Copier',
        activeRequests: 'Demandes de Paiement Actives'
      },
      superAdmin: {
        masterKeyTitle: 'CLÉ AI GEMINI MASTER',
        masterKeySubtitle: 'Moteur AI global pour tous les sites sans clé personnelle',
        detected: 'DÉTECTÉE',
        testKey: 'TESTER LA CLÉ',
        saveKey: 'ENREGISTRER',
        keyValid: 'CLÉ VALIDE',
        modelsFound: 'MODÈLES TROUVÉS',
        pinging: 'Ping API Google Gemini...'
      },
      ebook: {
        badgeSidebar: 'Exclusivité Nexus',
        badgeDashboard: 'Ressource Stratégique Recommandée',
        bookTitle: 'IA + Dropshipping & E-commerce',
        subtitle: 'Dominez le Marché de demain grâce à l\'IA',
        description: 'Découvrez les protocoles d\'automatisation utilisés par les top 1% des e-commerçants pour scaler sans limites. Un guide pratique de 150+ pages pour transformer votre business.',
        buttonDownload: 'Accéder au Guide Complet',
        buttonAction: 'Télécharger le Guide',
        readers: '1 200+ Lecteurs Satisfaits',
        sidebarSub: 'Le guide stratégique complet pour dominer le marché en 2026.'
      }
    }
  },
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        sites: 'WordPress Sites',
        autopilot: 'Auto-Pilot',
        audit: 'SEO Audit',
        content: 'Content Machine',
        affiliate: 'Affiliate',
        settings: 'Settings',
        superAdmin: 'Super Admin'
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        test: 'Test',
        delete: 'Delete',
        pay: 'Pay',
        active: 'Active',
        status: 'Status',
        amount: 'Amount',
        date: 'Date',
        name: 'Name',
        email: 'Email',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error'
      },
      affiliate: {
        title: 'PARTNER HUB',
        subtitle: 'AI Ecosystem Growth • Revenue Tracking • Instant Settlements',
        console: 'PARTNER CONSOLE',
        adminView: 'SUPER-ADMIN VIEW',
        totalRevenue: 'TOTAL REVENUE GENERATED',
        balance: 'AVAILABLE BALANCE',
        referrals: 'REFERRED CLIENTS',
        payouts: 'PAYOUT REQUESTS',
        requestPayment: 'REQUEST PAYMENT',
        payNow: 'PAY NOW',
        referralLink: 'YOUR AFFILIATE LINK',
        copy: 'Copy',
        activeRequests: 'Active Payout Requests'
      },
      superAdmin: {
        masterKeyTitle: 'GEMINI MASTER AI KEY',
        masterKeySubtitle: 'Global AI engine for all sites without personal keys',
        detected: 'DETECTED',
        testKey: 'TEST KEY',
        saveKey: 'SAVE',
        keyValid: 'KEY VALID',
        modelsFound: 'MODELS FOUND',
        pinging: 'Pinging Google Gemini API...'
      },
      ebook: {
        badgeSidebar: 'Nexus Exclusive',
        badgeDashboard: 'Recommended Strategic Resource',
        bookTitle: 'AI + Dropshipping & E-Commerce',
        subtitle: 'Dominate Tomorrow’s Market with AI',
        description: 'Discover the automation protocols used by the top 1% of e-merchants to scale limitlessly. A 150+ page practical guide to transform your business.',
        buttonDownload: 'Access the Full Guide',
        buttonAction: 'Download Guide',
        readers: '1,200+ Satisfied Readers',
        sidebarSub: 'The complete strategic guide to dominating the market in 2026.'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
