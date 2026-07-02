/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  collection,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './lib/firebase';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Package, 
  Image as ImageIcon, 
  Video, 
  ShieldCheck, 
  LogOut,
  Settings,
  ChevronRight,
  TrendingUp,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  Tags,
  Users,
  ShoppingBag,
  Share2,
  Monitor,
  Trophy,
  Shield,
  RotateCw,
  ChevronLeft,
  Lock,
  Mail,
  Link as LinkIcon,
  Database,
  BarChart3,
  Layers,
  Menu,
  X,
  ShoppingCart,
  BookOpen,
  LifeBuoy,
  Radio,
  CreditCard,
  Coins,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import * as OTPAuth from 'otpauth';
import { WPConfig, WPPost, WPProduct } from './types';
import SupportTicketsView from './components/SupportTicketsView';
import { testWPConnection, getPosts, getProducts } from './lib/wordpress';
import { cn, safeJsonParse } from './lib/utils';
import { useAuth } from './providers/FirebaseProvider';
import { firebaseService } from './services/firebaseService';
import { seedFirebaseDefaults } from './lib/seedFirebase';
import { DEFAULT_NEXUS_CONFIG, mergeRegistryConfig } from './constants';

// Components
import AuditView from './components/AuditView';
import CompetitorView from './components/CompetitorView';
import ContentView from './components/ContentView';
import MediaView from './components/MediaView';
import DashboardView from './components/DashboardView';
import StockAnalysisView from './components/StockAnalysisView';
import ForecastView from './components/ForecastView';
import ProductManagerView from './components/ProductManagerView';
import SocialAutomatorView from './components/SocialAutomatorView';
import FinanceProfitView from './components/FinanceProfitView';
import TaxonomyManagerView from './components/TaxonomyManagerView';
import MaintenanceView from './components/MaintenanceView';
import AutoPilotView from './components/AutoPilotView';
import InternalLinkView from './components/InternalLinkView';
import SmartFeedView from './components/SmartFeedView';
import SettingsView from './components/SettingsView';
import PricingView from './components/PricingView';
import AffiliateView from './components/AffiliateView';
import WooCommerceManagerView from './components/WooCommerceManagerView';
import NexusCrmView from './components/NexusCrmView';
import WpCrmView from './components/WpCrmView';
import CommunicationHubView from './components/CommunicationHubView';
import SitesView from './components/SitesView';
import SuperAdminView from './components/SuperAdminView';
import SecOpsDashboardView from './components/SecOpsDashboardView';
import CollaborationView from './components/CollaborationView';
import PaypalConfigView from './components/PaypalConfigView';
import LandingPage from './components/LandingPage';
import SignUpScreen from './components/SignUpScreen';
import PaymentScreen from './components/PaymentScreen';
import RegistrationSuccess from './components/RegistrationSuccess';
import InvitePage from './components/InvitePage';
import AIChatSupport from './components/AIChatSupport';
import { EbookPromotion } from './components/EbookPromotion';
import MandatoryProfileForm from './components/MandatoryProfileForm';
import UserManualView from './components/UserManualView';
import SecurityShieldView from './components/SecurityShieldView';
import MarketingHubView from './components/MarketingHubView';
import MultiPixelDashboardView from './components/MultiPixelDashboardView';

import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, loginWithGoogle, loginWithEmail, logout: firebaseLogout } = useAuth();

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexus_user_email');
    }
    return null;
  });

  const [isRestoringSession, setIsRestoringSession] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('nexus_user_email');
    }
    return false;
  });

  // Auto-recovery of Firebase Auth state for cached email users
  useEffect(() => {
    if (!authLoading && !user && userEmail) {
      console.log('[App] Restoring Firebase Auth session for cached user:', userEmail);
      setIsRestoringSession(true);
      loginWithEmail(userEmail)
        .catch(err => {
          console.error('[App] Failed to auto-restore Firebase Auth session:', err);
        })
        .finally(() => {
          setIsRestoringSession(false);
        });
    } else if (!authLoading) {
      setIsRestoringSession(false);
    }
  }, [authLoading, user, userEmail]);

  const [showLanding, setShowLanding] = useState(() => {
    // Check if we are on the secret lead page route
    if (window.location.pathname === '/invite' || window.location.pathname === '/exclusive') {
      return false;
    }
    // Only show landing if not logged in and no site connected
    const savedUser = localStorage.getItem('nexus_user_email');
    const savedConfig = localStorage.getItem('wp_config');
    return !savedUser && !savedConfig;
  });
  const [isInvitePage, setIsInvitePage] = useState(() => {
    return window.location.pathname === '/invite' || window.location.pathname === '/exclusive';
  });

  const [authStep, setAuthStep] = useState<'none' | 'register' | 'payment' | 'setup' | 'success'>('none');
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    const saved = localStorage.getItem('nexus_super_key');
    return saved === 'nexus_master_2026';
  });
  const [lang, setLang] = useState<'fr' | 'en'>(() => {
    const saved = localStorage.getItem('nexus_lang');
    return (saved === 'en' || saved === 'fr') ? saved : 'fr';
  });

  // Synchronize language state with i18n instance on start or change
  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Intercept AppSumo License Key on page startup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const appsumoLicense = params.get('appsumo_license');
      const signupParam = params.get('signup');
      if (appsumoLicense || signupParam === 'true') {
        setShowLanding(false);
        setAuthStep('register');
        if (appsumoLicense) {
          localStorage.setItem('nexus_appsumo_license', appsumoLicense);
          alert(`✨ Nexus WP : Licence AppSumo détectée ! [${appsumoLicense}]`);
        }
      }
    }
  }, []);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [sites, setSites] = useState<any[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(true);

  // Real-time signup auditory and visual alert state for admins
  const [newSignupToast, setNewSignupToast] = useState<{ id: string; name: string; email: string; timestamp: string } | null>(null);
  const [activeSignupNotification, setActiveSignupNotification] = useState<string | null>(null);
  const originalTitleRef = useRef(document.title || "Nexus WP - Console SaaS");

  // robust 2FA state syncer
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('nexus_user_email');
      if (email) {
        return sessionStorage.getItem(`nexus_2fa_verified_${email.toLowerCase()}`) === 'true';
      }
    }
    return false;
  });

  useEffect(() => {
    if (userProfile?.uid && userProfile?.two_factor_enabled) {
      const email = userProfile.email || user?.email || userEmail;
      if (email) {
        const verified = sessionStorage.getItem(`nexus_2fa_verified_${email.toLowerCase()}`) === 'true';
        setIsTwoFactorVerified(verified);
      }
    } else {
      setIsTwoFactorVerified(false);
    }
  }, [userProfile, user, userEmail]);

  // Real-time plans and settings fetch
  useEffect(() => {
    const unsubPlans = onSnapshot(collection(db, 'plans'), (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = [...p].sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
      setPlans(sorted);
    }, (err) => {
      console.error('[App] Plans sync error:', err);
    });

    const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
      const s: any = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Fallback for different key formats
        if (data.key) s[data.key] = data.value;
        else s[doc.id] = data.value || data;
      });
      setSettings(s);
    }, (err) => {
      console.error('[App] Settings sync error:', err);
    });

    return () => {
      unsubPlans();
      unsubSettings();
    };
  }, []);

  // Real-time listener for new user registrations (auditory + visual alert)
  useEffect(() => {
    if (!db || !user) return;

    const email = (user.email || '').toLowerCase();
    const isAdminUser = isSuperAdmin || email === 'ziedbenmiled3@gmail.com' || email === 'contact@nexuswp.pro';

    if (!isAdminUser) {
      return;
    }

    let isFirstLoad = true;
    const listenerStartTime = Date.now();

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      // The first snapshot contains all pre-existing records in the database.
      // We skip it so that we don't play notifications for historical signups.
      if (isFirstLoad) {
        isFirstLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docId = change.doc.id;
          const notifiedKey = `nexus_notified_user_${docId}`;
          if (localStorage.getItem(notifiedKey)) {
            return;
          }

          const userData = change.doc.data();

          // Safety check: only alert for registrations created after the session started
          let docCreatedAtMs = 0;
          if (userData.created_at) {
            if (typeof userData.created_at.toDate === 'function') {
              docCreatedAtMs = userData.created_at.toDate().getTime();
            } else if (userData.created_at.seconds !== undefined) {
              docCreatedAtMs = userData.created_at.seconds * 1000;
            } else {
              docCreatedAtMs = new Date(userData.created_at).getTime();
            }
          }

          // If the registration is older than the listener active window, skip notifying the admin
          if (docCreatedAtMs && docCreatedAtMs < (listenerStartTime - 30000)) {
            // Also store it so we never evaluate it on reconnection
            localStorage.setItem(notifiedKey, 'true');
            return;
          }

          const name = userData.display_name || userData.name || userData.username || userData.first_name || userData.email || 'Nouveau membre';
          const emailAddr = userData.email || 'Non spécifié';

          // 1. Play beautiful double-note synthesized notification chime via Web Audio API (highly reliable, no external dependencies)
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              const now = ctx.currentTime;

              // Note 1 (Ding)
              const osc1 = ctx.createOscillator();
              const gain1 = ctx.createGain();
              osc1.type = 'sine';
              osc1.frequency.setValueAtTime(880, now); // A5 (Ding)
              osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // Harmonics (E6)
              gain1.gain.setValueAtTime(0.12, now);
              gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
              osc1.connect(gain1);
              gain1.connect(ctx.destination);

              // Note 2 (Dong) slightly delayed
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(1320, now + 0.08); // E6 
              osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.22); // A6
              gain2.gain.setValueAtTime(0, now);
              gain2.gain.setValueAtTime(0.08, now + 0.08);
              gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
              osc2.connect(gain2);
              gain2.connect(ctx.destination);

              osc1.start(now);
              osc1.stop(now + 0.4);
              osc2.start(now + 0.08);
              osc2.stop(now + 0.55);
            }
          } catch (audioErr) {
            console.warn('[Alert Sound] Failsafe: Audio was blocked or is unsupported:', audioErr);
          }

          // 2. Display screen toast
          const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          localStorage.setItem(notifiedKey, 'true'); // Persistently disable repetitions for this browser session
          setNewSignupToast({
            id: change.doc.id,
            name: String(name),
            email: String(emailAddr),
            timestamp
          });

          // 3. Activate Google Chrome window / browser tab flashing alert
          setActiveSignupNotification(String(name));
        }
      });
    }, (err) => {
      console.error('[Admin Registration Alert] Listener sync error:', err);
    });

    return () => {
      unsubUsers();
    };
  }, [user, userEmail, isSuperAdmin]);

  // Flash Google Chrome tab title in parallel
  useEffect(() => {
    if (!activeSignupNotification) {
      document.title = originalTitleRef.current || "Nexus WP - Console SaaS";
      return;
    }

    let alternate = false;
    const intervalId = setInterval(() => {
      document.title = alternate 
        ? `🔔 Inscription : ${activeSignupNotification} !` 
        : `✨ Nouveau Client Inscrit - Nexus`;
      alternate = !alternate;
    }, 1000);

    return () => {
      clearInterval(intervalId);
      document.title = originalTitleRef.current || "Nexus WP - Console SaaS";
    };
  }, [activeSignupNotification]);

  // Global Chrome Extension bridge message listener
  useEffect(() => {
    const handleGlobalExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.from === "NEXUS_EXTENSION") {
        console.log("[Global Bridge] Message intercepted from Chrome Extension:", event.data);
        
        // Save the payload globally so that ProductManagerView can execute it immediately once mounted
        (window as any).lastExtensionPayload = event.data;
        
        // Auto switch tab to products to reveal the slide-over importer
        setActiveTab("products");
      }
    };

    window.addEventListener("message", handleGlobalExtensionMessage);
    return () => {
      window.removeEventListener("message", handleGlobalExtensionMessage);
    };
  }, []);

  // Dynamic Google Tag script injection when user profile contains it
  useEffect(() => {
    if (userProfile?.google_tag_id) {
      const tagId = userProfile.google_tag_id.trim();
      if (!tagId) return;

      console.log(`[Google Tag] Initialisation du tag de suivi : ${tagId}`);
      
      // Prevent duplicating script injections
      const existingScripts = document.querySelectorAll(`script[src*="googletagmanager.com/gtag/js"]`);
      existingScripts.forEach(el => el.remove());
      const existingInline = document.querySelectorAll(`script[id="gtag-init"]`);
      existingInline.forEach(el => el.remove());

      // Create Script 1: gtag library loader
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
      document.head.appendChild(script);

      // Create Script 2: initialization logic
      const inlineScript = document.createElement('script');
      inlineScript.id = "gtag-init";
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${tagId}');
      `;
      document.head.appendChild(inlineScript);
    }
  }, [userProfile?.google_tag_id]);

  // Sync when user becomes available or email is restored from storage
  useEffect(() => {
    if (!user) {
      console.log('[App] No authenticated user yet, skipping sync.');
      return;
    }
    if (user.isAnonymous) {
      console.warn('[App] Authenticated user is anonymous, skipping sync.');
      return;
    }
    const email = user.email?.toLowerCase();
    if (!email) {
      console.warn('[App] Authenticated user has no email, skipping sync.');
      return;
    }

    const isDesignatedAdmin = email === 'ziedbenmiled3@gmail.com' || email === 'contact@nexuswp.pro';
    
    // Prevent data leakage: if new user is different from cached user, clear cache
    const cachedEmail = localStorage.getItem('nexus_user_email');
    if (cachedEmail && cachedEmail.toLowerCase() !== email) {
      console.log('[App] New user detected, clearing local cache');
      localStorage.removeItem('wp_config');
      localStorage.removeItem('nexus_sites_list');
      localStorage.removeItem('nexus_active_tab');
      localStorage.removeItem('nexus_super_key');
      setConfig(null);
      setSites([]);
      setIsSuperAdmin(false);
    }

    if (userEmail !== email) {
      setUserEmail(email);
    }
    localStorage.setItem('nexus_user_email', email);

    // Force clear secret key for non-admin accounts on initial sync
    if (!isDesignatedAdmin) {
      localStorage.removeItem('nexus_super_key');
      setIsSuperAdmin(false);
    } else {
      // Super Admin only: Sync the global site registry with their sites
      firebaseService.syncAllSitesToRegistry(email);
      setIsSuperAdmin(true);
      localStorage.setItem('nexus_super_key', 'nexus_master_2026');
    }

    // Always hide landing if we have a valid user session
    setShowLanding(false);

    // If we were stuck in auth steps, move to dashboard/setup (except if we just reached success)
    if (authStep === 'register') {
      setAuthStep('none');
    }

    const sync = async () => {
      try {
        setIsLoadingSites(true);
        console.log('[App] Starting Cloud Sync for:', email);
        
        // Promote to admin if applicable
        try {
          await seedFirebaseDefaults(user);
        } catch (seedErr) {
          console.warn('[App] Seeding skipped:', seedErr);
        }
        
        // 1. Fetch all sites, subscription, and user profile from cloud
        const [sitesResult, subData, profile] = await Promise.all([
          firebaseService.getSites(email),
          firebaseService.getSubscription(email),
          firebaseService.getUserProfile(user.uid)
        ]);
          
          const userProfileData = profile as any;
          setUserProfile(userProfileData);
          if (userProfileData) {
            const isCompleted = !!(
              userProfileData.username && 
              userProfileData.first_name && 
              userProfileData.last_name && 
              userProfileData.birth_date && 
              userProfileData.address && 
              userProfileData.zip_code && 
              userProfileData.country && 
              userProfileData.phone && 
              userProfileData.company
            );
            setIsProfileComplete(isCompleted);
          } else {
            setIsProfileComplete(false);
          }
          
          let cloudSites: any[] = [];
          
          if (Array.isArray(sitesResult)) {
            cloudSites = sitesResult.map((s: any) => ({
              ...s,
              applicationPassword: s.application_password
            }));
          }

          setSubscription(subData);

          // 2. Check for local sites that might not be in cloud yet
          const localSitesRaw = localStorage.getItem('nexus_sites_list');
          let localSites: any[] = safeJsonParse(localSitesRaw, []);

          // Push local sites to cloud if they don't exist there
          for (const site of localSites) {
            const existsInCloud = cloudSites.some(cs => cs.url === site.url);
            if (!existsInCloud) {
              await firebaseService.saveSite({
                ...site,
                id: site.id || crypto.randomUUID(),
                user_email: email,
                application_password: site.applicationPassword || site.application_password
              });
            }
          }

          // Reload from cloud to be sure
          const finalData = await firebaseService.getSites(email);
          const finalMapped = finalData.map((s: any) => ({
            ...s,
            applicationPassword: s.application_password
          }));

          // Sync state and storage
          setSites(finalMapped);
          localStorage.setItem('nexus_sites_list', JSON.stringify(finalMapped));

          // Ensure Affiliate Profile exists
          axios.get('/api/affiliate/stats', { headers: { 'x-user-email': email } }).catch(() => {});
          
          // CRITICAL: Restore config if null
          const savedConfig = localStorage.getItem('wp_config');
          if (!savedConfig && finalMapped.length > 0) {
            console.log('[App] Restoring last active site from Cloud:', finalMapped[0].url);
            handleSwitchSite(finalMapped[0]);
          } else if (savedConfig) {
            const parsed = safeJsonParse(savedConfig, null);
            if (!parsed) return;
            // Ensure the saved config matches one of the cloud sites or we refresh it
            const matched = finalMapped.find(s => s.url === parsed.url);
            if (matched) {
              handleSwitchSite(matched);
            } else if (finalMapped.length > 0) {
              handleSwitchSite(finalMapped[0]);
            }
          }
        } catch (err) {
          console.error('[App] Cloud Sync Error:', err);
        } finally {
          setIsLoadingSites(false);
        }
      };
      sync();
  }, [user, userEmail, authStep]);

  const [config, setConfig] = useState<WPConfig | null>(() => {
    const saved = localStorage.getItem('wp_config');
    return safeJsonParse(saved, null);
  });

  // Handle plan selection from landing
  const handleLangChange = (newLang: 'fr' | 'en') => {
    setLang(newLang);
    localStorage.setItem('nexus_lang', newLang);
    i18n.changeLanguage(newLang);
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === 'none') {
      setShowLanding(false);
      if (isConnected) {
        setAuthStep('none'); // Already in dashboard
      } else {
        setAuthStep('register');
      }
      return;
    }

    setSelectedPlanId(planId);
    setShowLanding(false);
    
    // Super admin bypass
    if (isSuperAdmin || userEmail === 'ziedbenmiled3@gmail.com') {
      setAuthStep('none');
      setActiveTab('dashboard');
      return;
    }

    // If already registered, go to internal pricing to see details or setup
    if (userEmail) {
      setAuthStep('none');
      setActiveTab('pricing');
    } else {
      setAuthStep('register');
    }
  };

  const handleRegisterSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('nexus_user_email', email);
    
    // Immediate Super Admin bypass
    const isAdmin = email === 'ziedbenmiled3@gmail.com' || email === 'contact@nexuswp.pro';
    setIsSuperAdmin(isAdmin);
    if (isAdmin) {
      setAuthStep('none');
      return;
    }
    
    setAuthStep('success');
  };

  const handleRegistrationContinue = () => {
    setAuthStep('none');
    setShowLanding(false);
    setActiveTab('pricing');
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      const plan = plans.find(p => p.id === selectedPlanId);
      const refCode = localStorage.getItem('nexus_ref_code');
      
      if (userEmail) {
        await firebaseService.subscribe(userEmail, selectedPlanId!, transactionId, plan?.price);
        
        // Register affiliate sale if applicable
        if (refCode) {
          try {
            await axios.post('/api/sales/register', {
              customerEmail: userEmail,
              planName: plan?.name,
              amount: plan?.price,
              referralCode: refCode
            });
            localStorage.removeItem('nexus_ref_code'); // Clean up
          } catch (affErr) {
            console.error('Failed to register affiliate sale:', affErr);
          }
        }
        
        await fetchSubscription(userEmail);
      }
      setAuthStep('none');
      setActiveTab('sites');
    } catch (err) {
      console.error('Subscription failed', err);
    }
  };

  // Toggle landing based on config existence if not manually toggled
  useEffect(() => {
    if (config && showLanding) {
      setShowLanding(false);
    }
  }, [config]);

  const handleSwitchSite = (newConfig: WPConfig | null) => {
    setConfig(newConfig);
    if (newConfig) {
      localStorage.setItem('wp_config', JSON.stringify(newConfig));
      // Auto switch to dashboard after adding/switching
      setActiveTab('dashboard');
    } else {
      localStorage.removeItem('wp_config');
    }
  };
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'print-manual') {
        return 'guide';
      }
      if (params.get('bulk_urls') || params.get('import_url') || params.get('import-url')) {
        return 'products';
      }
    }
    const saved = localStorage.getItem('nexus_active_tab');
    if (saved) return saved;
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('nexus_active_tab', activeTab);
  }, [activeTab]);

  // --- REAL-TIME SAAS TELEMETRY FEED HANGER ---
  useEffect(() => {
    if (!userEmail) return;

    const email = userEmail.toLowerCase();
    const displayName = userProfile?.name || user?.displayName || email.split('@')[0];
    
    // Detect action mapped to activeTab
    let action: 'generating_article' | 'auditing_seo' | 'optimizing_links' | 'managing_stock' | 'idle' = 'idle';
    let activePage = 'Consultation du Dashboard Général';

    switch (activeTab) {
      case 'content':
        action = 'generating_article';
        activePage = 'Rédaction d’article AI de 3000 mots...';
        break;
      case 'audit':
        action = 'auditing_seo';
        activePage = 'Audit Technique SEO en cours...';
        break;
      case 'internal-links':
        action = 'optimizing_links';
        activePage = 'Configuration AutoPilot Maillage Interne...';
        break;
      case 'stock':
        action = 'managing_stock';
        activePage = 'Analyse Prévisionnelle des Stocks...';
        break;
      case 'dashboard':
        action = 'idle';
        activePage = 'Consultation du Dashboard Général';
        break;
      case 'nexus-crm':
        action = 'idle';
        activePage = 'Examen du Command Center CRM';
        break;
      case 'wp-crm':
        action = 'idle';
        activePage = 'Observation du Radar d’activité WP';
        break;
      case 'forecast':
        action = 'idle';
        activePage = 'Simulation Prévisionnelle de Chiffre d’Affaire';
        break;
      case 'guide':
        action = 'idle';
        activePage = 'Lecture intensive du Mode d’emploi';
        break;
      case 'marketing-hub':
        action = 'idle';
        activePage = 'Recherche et Rédaction Script Marketing Hub';
        break;
      default:
        action = 'idle';
        activePage = `Navigation : ${activeTab.toUpperCase()}`;
        break;
    }

    const device = (() => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width <= 1024) return 'tablet';
      return 'desktop';
    })();

    const sendPing = async () => {
      try {
        await axios.post('/api/saas-telemetry', {
          email,
          name: displayName,
          device,
          activePage,
          action,
          city: userProfile?.city || '',
          country: userProfile?.country || ''
        });
      } catch (err) {
        console.warn('[Telemetry API] Unreached heartbeat ping', err);
      }
    };

    // Initial ping on tab / profile load
    sendPing();

    // Heartbeat Interval (10s)
    const timer = setInterval(sendPing, 10000);
    return () => clearInterval(timer);
  }, [userEmail, activeTab, userProfile, user]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const SUPER_ADMIN_EMAIL = 'ziedbenmiled3@gmail.com';

  // Check if first-time user has visited pricing yet (scoped per user profile to prevent cross-account leakage)
  const [hasVisitedPricing, setHasVisitedPricing] = useState(false);

  useEffect(() => {
    const currentEmail = userEmail?.toLowerCase() || localStorage.getItem('nexus_user_email')?.toLowerCase() || 'anonymous';
    const key = `nexus_visited_pricing_${currentEmail}`;
    
    if (activeTab === 'pricing') {
      localStorage.setItem(key, 'true');
      setHasVisitedPricing(true);
    } else {
      setHasVisitedPricing(localStorage.getItem(key) === 'true');
    }
  }, [activeTab, userEmail]);

  // Sync super admin state
  useEffect(() => {
    const email = user?.email?.toLowerCase() || userEmail?.toLowerCase();
    
    // STRICT SECURITY RULE: Only designated primary accounts can be super admin
    if (email === 'ziedbenmiled3@gmail.com' || email === 'contact@nexuswp.pro') {
      setIsSuperAdmin(true);
      localStorage.setItem('nexus_super_key', 'nexus_master_2026');
    } else {
      // Force disable and cleanup for any other user
      setIsSuperAdmin(false);
      localStorage.removeItem('nexus_super_key');
      localStorage.removeItem('admin_clicks');
    }
  }, [user, userEmail]);

  const handleLogoClick = () => {
    // Normal navigation
    setActiveTab(config ? 'dashboard' : 'sites');
    
    // Only allow secret activator for the real owner if they lost it
    const email = user?.email?.toLowerCase() || userEmail?.toLowerCase();
    if (email !== 'ziedbenmiled3@gmail.com' && email !== 'contact@nexuswp.pro') return;

    const clicks = parseInt(localStorage.getItem('admin_clicks') || '0') + 1;
    if (clicks >= 5) {
      localStorage.setItem('nexus_super_key', 'nexus_master_2026');
      setIsSuperAdmin(true);
      localStorage.removeItem('admin_clicks');
    } else {
      localStorage.setItem('admin_clicks', clicks.toString());
      setTimeout(() => localStorage.removeItem('admin_clicks'), 2000);
    }
  };

  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!subscription || !subscription.expires_at) {
      setIsExpired(false);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(subscription.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('EXPIRÉ');
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const totalMinutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % 60000) / 1000);
        
        if (subscription.plan_id === 'trial') {
          setTimeRemaining(`${totalMinutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${days}j ${hours}h`);
        }

        setIsExpiringSoon(days < 5);
        setIsExpired(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [subscription]);

  const fetchSubscription = async (email: string) => {
    try {
      const data = await firebaseService.getSubscription(email);
      setSubscription(data);
    } catch (err) {
      console.error('Failed to fetch subscription', err);
    }
  };

  const handleConnect = async (newConfig: WPConfig) => {
    setIsConnecting(true);
    setError(null);
    try {
      await testWPConnection(newConfig);
      setConfig(newConfig);
      setIsConnected(true);
      localStorage.setItem('wp_config', JSON.stringify(newConfig));
      
      // Also add to multi-site list if not present
      const saved = localStorage.getItem('nexus_sites_list');
      const sites = safeJsonParse(saved, []);
      if (!sites.find((s: any) => s.url === newConfig.url)) {
        const newSite = { ...newConfig, id: crypto.randomUUID() };
        sites.push(newSite);
        localStorage.setItem('nexus_sites_list', JSON.stringify(sites));

        // Save to Firebase - prioritize the actual auth user email
        const email = user?.email?.toLowerCase() || userEmail || newConfig.username;
        if (email) {
          console.log('[Connect] Saving site to cloud for owner:', email);
          await firebaseService.saveSite({
            id: newSite.id,
            user_email: email,
            url: newSite.url,
            username: newSite.username,
            application_password: newSite.applicationPassword
          });
        }
      }

      // If we don't have a subscription yet, and it was a trial, record it
      if (selectedPlanId === 'trial' && (!subscription || subscription.plan_id === 'none')) {
        const email = user?.email?.toLowerCase() || userEmail || newConfig.username;
        if (email) {
          await firebaseService.subscribe(email, 'trial');
          await fetchSubscription(email);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to WordPress. Please check your credentials and URL.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCheckConnection = async (currentConfig: WPConfig) => {
    setIsConnecting(true);
    try {
      await testWPConnection(currentConfig);
      setIsConnected(true);
    } catch (err) {
      console.warn('WordPress connection check failed, keeping config for retry.', err);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const email = user?.email || userEmail;
    if (email) {
      fetchSubscription(email);
    }
  }, [user, userEmail]);

  useEffect(() => {
    if (config) {
      handleCheckConnection(config);
    } else {
      setIsConnected(false);
    }
  }, [config]);

  // Default to Super Admin view if no site connected
  useEffect(() => {
    if (isSuperAdmin && !isConnected && activeTab === 'dashboard') {
      setActiveTab('super');
    }
  }, [isSuperAdmin, isConnected]);

  const isPrintManualAction = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('action') === 'print-manual';
  if (isPrintManualAction) {
    return <UserManualView />;
  }

  if (isInvitePage) {
    return <InvitePage lang={lang} onLangChange={handleLangChange} />;
  }

  if (showLanding) {
    return <LandingPage onSelectPlan={handleSelectPlan} lang={lang} onLangChange={handleLangChange} externalPlans={plans} settings={settings} />;
  }

  if (authStep === 'register') {
    return (
      <SignUpScreen 
        onSuccess={handleRegisterSuccess} 
        onBack={() => {
          setShowLanding(true);
          setTimeout(() => {
            const pricingSection = document.getElementById('pricing');
            if (pricingSection) {
              pricingSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }} 
      />
    );
  }

  if (authStep === 'payment') {
    const plan = plans.find(p => p.id === selectedPlanId);
    return <PaymentScreen plan={plan} email={userEmail!} onSuccess={handlePaymentSuccess} onBack={() => setAuthStep('register')} />;
  }

  if (authStep === 'success') {
    const plan = plans.find(p => p.id === selectedPlanId);
    return <RegistrationSuccess onContinue={handleRegistrationContinue} planName={plan?.name} />;
  }

  const handleLogout = async () => {
    console.log('[App] Handing Logout');
    try {
      // Clear storage first to be responsive
      localStorage.clear();
      
      // Reset states
      setConfig(null);
      setIsConnected(false);
      setAuthStep('none');
      setShowLanding(true);
      setIsSuperAdmin(false);
      setUserEmail(null);
      setSites([]);
      
      await firebaseLogout();
      
      // Final hard reset to clear any dangling memory states
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      // Even on error, try to reset the page
      window.location.href = '/';
    }
  };

  if (authLoading || isRestoringSession || (isLoadingSites && !isConnected && !isSuperAdmin)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
         <Zap className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
         <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">Initialisation du Cloud Nexus...</p>
      </div>
    );
  }

  // Mandatory profile coordinates check if authenticated
  if (user && !isProfileComplete) {
    return (
      <MandatoryProfileForm 
        user={user}
        initialProfile={userProfile}
        onSaved={(updatedProfile) => {
          setUserProfile(updatedProfile);
          setIsProfileComplete(true);
        }}
        onLogout={handleLogout}
      />
    );
  }

  // Optional 2FA Validation lock screen blocker when 2FA is active
  if (user && userProfile?.two_factor_enabled && !isTwoFactorVerified) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient background glow dots */}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl space-y-8"
        >
          <div className="text-center relative z-10 space-y-4">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20 shadow-lg shadow-indigo-950/40">
              <Lock className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">Double Authentification</h2>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.25em]">Protection Anti-Intrusion Activée</p>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide leading-relaxed px-2">
              Saisissez le code de validation à 6 chiffres depuis votre application d'authentification (Google Authenticator) pour déverrouiller votre session.
            </p>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const inputCode = e.currentTarget.code.value.trim();
              if (inputCode.length !== 6) return;

              try {
                // Verify OTP Code
                const totp = new OTPAuth.TOTP({
                  issuer: 'NEXUS',
                  label: user.email || '',
                  algorithm: 'SHA1',
                  digits: 6,
                  period: 30,
                  secret: userProfile.two_factor_secret,
                });

                const delta = totp.validate({
                  token: inputCode,
                  window: 1
                });

                if (delta !== null) {
                  const email = userProfile.email || user.email || userEmail;
                  if (email) {
                    sessionStorage.setItem(`nexus_2fa_verified_${email.toLowerCase()}`, 'true');
                    setIsTwoFactorVerified(true);
                  }
                } else {
                  alert("Code de validation incorrect ou expiré. Veuillez vérifier que l'heure de votre téléphone est synchrone.");
                }
              } catch (err: any) {
                alert("Erreur technique de validation. Veuillez réessayer.");
              }
            }}
            className="space-y-6 relative z-10"
          >
            <div>
              <label htmlFor="code" className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-3 text-center">
                Code d'authentification à 6 chiffres
              </label>
              <input 
                id="code"
                name="code"
                type="text" 
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                className="w-full text-center px-6 py-5 bg-black border border-white/5 rounded-2xl text-2xl font-black font-mono text-white tracking-[0.5em] focus:border-indigo-500/50 outline-none transition-all"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center shadow-lg shadow-indigo-950/40 cursor-pointer animate-pulse"
            >
              VÉRIFIER LE CODE ET FINIR L'ACCÈS
            </button>
          </form>

          <div className="pt-2 text-center relative z-10">
            <button 
              type="button"
              onClick={handleLogout}
              className="text-[9px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Se déconnecter / Quitter
            </button>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        </motion.div>
      </div>
    );
  }

  if (!user && !isSuperAdmin) {
    // If not logged in at all, show landing or login
    if (showLanding) return <LandingPage onSelectPlan={handleSelectPlan} lang={lang} onLangChange={handleLangChange} externalPlans={plans} />;
    return (
      <SignUpScreen 
        onSuccess={handleRegisterSuccess} 
        onBack={() => setShowLanding(true)} 
      />
    );
  }

  const adminTabs = [
    ...(isSuperAdmin ? [
      { id: 'super', label: t('nav.superAdmin'), icon: Shield },
      { id: 'secops', label: 'SecOps & Bilan', icon: ShieldCheck },
      { id: 'nexus-crm', label: t('nav.nexusCrm'), icon: Users },
      { id: 'paypal-config', label: t('nav.paypalConfig'), icon: CreditCard }
    ] : []),
    { id: 'sites', label: t('nav.sites'), icon: Monitor },
    { id: 'marketing-hub', label: t('nav.marketingHub'), icon: Megaphone },
    { id: 'comm-hub', label: t('nav.commHub'), icon: Mail },
    { id: 'pricing', label: t('nav.pricing'), icon: Zap },
    { id: 'affiliates', label: t('nav.affiliate'), icon: Users },
    { id: 'guide', label: t('nav.guide'), icon: BookOpen },
    { id: 'support', label: t('nav.support'), icon: LifeBuoy },
  ];

  const groupedSiteTabs = [
    {
      category: t('nav.categories.overview'),
      items: [
        { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { id: 'security', label: t('nav.security'), icon: Shield },
      ]
    },
    {
      category: t('nav.categories.marketing'),
      items: [
        { id: 'wp-crm', label: t('nav.wpCrm'), icon: Radio },
        { id: 'pixels', label: t('nav.pixels') || 'Pixels de Tracking', icon: Layers },
        { id: 'social', label: t('nav.social'), icon: Share2 },
        { id: 'smart-feed', label: t('nav.smartFeed'), icon: ShoppingBag },
        { id: 'market', label: t('nav.market'), icon: Zap },
      ]
    },
    {
      category: t('nav.categories.inventory'),
      items: [
        { id: 'stock', label: t('nav.stock'), icon: TrendingUp },
        { id: 'forecast', label: t('nav.forecast'), icon: BarChart3 },
        { id: 'finance', label: t('nav.finance'), icon: Coins },
      ]
    },
    {
      category: t('nav.categories.seo'),
      items: [
        { id: 'audit', label: t('nav.audit'), icon: ShieldCheck },
        { id: 'content', label: t('nav.content'), icon: FileText },
        { id: 'autopilot', label: t('nav.autopilot'), icon: RotateCw },
        { id: 'internal-links', label: t('nav.internalLinks'), icon: LinkIcon },
        { id: 'comm-hub', label: t('nav.commHub'), icon: Mail },
      ]
    },
    {
      category: t('nav.categories.catalog'),
      items: [
        { id: 'woo-manager', label: t('nav.wooManager'), icon: ShoppingCart },
        { id: 'products', label: t('nav.products'), icon: Package },
        { id: 'categories', label: t('nav.categoriesTags'), icon: Tags },
        { id: 'maintenance', label: t('nav.maintenance'), icon: Settings },
        { id: 'settings', label: t('nav.settings'), icon: Globe },
        { id: 'collab', label: t('nav.collab'), icon: Users },
      ]
    }
  ];

  // Matrix Filter Logic
  const configRaw = settings?.['nexus_matrix_config'];
  const matrixConfig = configRaw 
    ? mergeRegistryConfig(typeof configRaw === 'string' ? safeJsonParse(configRaw, DEFAULT_NEXUS_CONFIG) : configRaw) 
    : DEFAULT_NEXUS_CONFIG;
  let userPlanId = subscription?.plan_id || 'none';
  if (userPlanId === 'trial') userPlanId = 'test';
  
  const filteredGroupedTabs = groupedSiteTabs.map(group => {
    // If no config or super admin, show everything
    if (!matrixConfig || isSuperAdmin) return group;
    
    // Find matching pack in matrix
    const pack = matrixConfig.packs?.[userPlanId];
    if (!pack) return group;

    return {
      ...group,
      items: group.items.filter(item => {
        // Essential core tools are always visible for UX consistency 
        if (['dashboard', 'security', 'products', 'categories', 'settings'].includes(item.id)) return true;
        
        // Filter others based on the matrix activeFeatures
        return pack.activeFeatures?.includes(item.id);
      })
    };
  }).filter(group => group.items.length > 0);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800 z-[101] lg:hidden flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <button 
                onClick={handleLogoClick}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-blue-950/40">
                  <Zap className="w-6 h-6 text-white fill-white shadow-sm" />
                </div>
                <div>
                  <h1 className="text-sm font-black tracking-[0.15em] text-white uppercase leading-tight">Nexus AI</h1>
                  <p className="text-[8px] font-bold text-blue-400/80 uppercase tracking-widest">WP Intelligence</p>
                </div>
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Reuse the same nav logic but with close on click */}
              <div className="space-y-1">
                <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Nexus Cloud</h3>
                {adminTabs.map((tab) => {
                  const isNoPlan = !subscription || subscription?.plan_id === 'none' || subscription?.status !== 'active';
                  const shouldGlow = tab.id === 'pricing' && activeTab !== 'pricing' && isNoPlan && !isSuperAdmin;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        activeTab === tab.id 
                          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                          : (shouldGlow 
                              ? "animate-glow-pricing border border-blue-500/30 text-white font-black" 
                              : "text-slate-500 hover:bg-slate-900/50")
                      )}
                    >
                      <tab.icon className={cn("w-4 h-4", shouldGlow && "text-blue-400 animate-pulse")} />
                      <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                      {shouldGlow && (
                        <span className="relative flex h-2 w-2 ml-auto shrink-0 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredGroupedTabs.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 opacity-50">{group.category}</h3>
                  {group.items.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
                        activeTab === tab.id ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:bg-slate-900/50"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-4">
               {/* Quick Mobile Security Row */}
               <div className="bg-[#07090d] border border-slate-900 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                     <span className="text-[8.5px] font-black text-slate-300 uppercase tracking-[0.15em] leading-none">NEXUS SÉCURISÉ</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                     <div className="bg-black/30 border border-slate-900/60 rounded-xl p-1.5 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-[7.5px] font-black text-white uppercase tracking-wider">SSL 256</span>
                     </div>
                     <div className="bg-black/30 border border-slate-900/60 rounded-xl p-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-[7.5px] font-black text-white uppercase tracking-wider">2FA Actif</span>
                     </div>
                  </div>
               </div>

               <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-xs">
                  <LogOut className="w-4 h-4" />
                  Sortie
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 hidden lg:flex flex-col">
        <div className="p-6">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 w-full text-left group"
          >
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-blue-950/40 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white fill-white shadow-sm" />
             </div>
             <div>
                <h1 className="text-sm font-black tracking-[0.15em] text-white uppercase leading-tight">Nexus AI</h1>
                <p className="text-[8px] font-bold text-blue-400/80 uppercase tracking-widest">WP Intelligence</p>
             </div>
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Admin Group */}
          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Nexus Cloud</h3>
            {adminTabs.map((tab) => {
              const isNoPlan = !subscription || subscription?.plan_id === 'none' || subscription?.status !== 'active';
              const shouldGlow = tab.id === 'pricing' && activeTab !== 'pricing' && isNoPlan && !isSuperAdmin;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                    activeTab === tab.id 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                      : (shouldGlow 
                          ? "animate-glow-pricing border border-blue-500/30 text-white font-black" 
                          : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-300")
                  )}
                >
                  <tab.icon className={cn(
                    "w-4 h-4 transition-colors", 
                    activeTab === tab.id 
                      ? "text-blue-400" 
                      : (shouldGlow 
                          ? "text-blue-400 animate-pulse" 
                          : "text-slate-600 group-hover:text-slate-400")
                  )} />
                  <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                  {activeTab === tab.id ? (
                    <motion.div layoutId="active-indicator-arrow" className="ml-auto">
                      <ChevronRight className="w-3 h-3 text-blue-400/50" />
                    </motion.div>
                  ) : (shouldGlow && (
                    <span className="relative flex h-2 w-2 ml-auto shrink-0 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  ))}
                </button>
              );
            })}
          </div>

          {/* Site Management Grouped */}
          {filteredGroupedTabs.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 opacity-50">{group.category}</h3>
              {group.items.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group relative",
                    activeTab === tab.id 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                      : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-300"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4 transition-colors", activeTab === tab.id ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400")} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="active-indicator-arrow" className="ml-auto">
                      <ChevronRight className="w-3 h-3 text-blue-400/50" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
           
           {/* Language Switcher */}
           <div className="flex bg-slate-950/80 border border-white/5 rounded-2xl p-1 shadow-2xl relative z-10 backdrop-blur-md">
              <button 
                onClick={() => handleLangChange('fr')}
                className={cn(
                  "flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                  i18n.language?.startsWith('fr') ? "bg-blue-600/90 text-white shadow-lg shadow-blue-900/20" : "text-slate-600 hover:text-slate-400"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                FRANÇAIS
              </button>
              <button 
                onClick={() => handleLangChange('en')}
                className={cn(
                  "flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                  i18n.language?.startsWith('en') ? "bg-blue-600/90 text-white shadow-lg shadow-blue-900/20" : "text-slate-600 hover:text-slate-400"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                ENGLISH
              </button>
           </div>

           <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl group relative overflow-hidden">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-blue-400 text-xs shadow-inner">
                    {userEmail?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'N'}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isSuperAdmin ? 'Super Admin' : 'Utilisateur Nexus'}</p>
                    <p className="text-[10px] font-medium text-slate-200 truncate leading-none">{userEmail || user?.email || 'Chargement...'}</p>
                 </div>
                 <button 
                   type="button"
                   onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     handleLogout();
                   }}
                   className="flex flex-col items-center justify-center p-2 text-red-500 bg-red-600/10 hover:bg-red-600/20 rounded-xl transition-all border border-red-500/20 hover:border-red-500/40 cursor-pointer relative z-[300]"
                   title="Déconnexion"
                 >
                   <LogOut className="w-5 h-5 mb-0.5" />
                   <span className="text-[7px] font-black uppercase tracking-tighter">Sortie</span>
                 </button>
              </div>
              
              {config ? (
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col gap-2">
                   <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0" />
                         <span className="text-[9px] font-black text-green-500 uppercase tracking-widest truncate">{config.url?.replace('https://', '')}</span>
                      </div>
                      <button 
                        onClick={() => handleSwitchSite(null)}
                        className="text-[8px] font-black text-red-400 hover:text-white hover:bg-red-600 transition-all shrink-0 bg-red-600/10 px-2 py-1 rounded border border-red-500/20 cursor-pointer"
                        title="Déconnecter le site pour la sécurité de la session"
                      >
                         DÉCONNECTER
                      </button>
                   </div>
                   <button 
                     onClick={() => setActiveTab('sites')}
                     className="text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-blue-500 transition-colors text-left pl-3"
                   >
                     Gérer les sites
                   </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col gap-2">
                   <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Aucun site connecté</p>
                   <button 
                     onClick={() => setActiveTab('sites')}
                     className="text-[8px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors text-left"
                   >
                     CONNECTER UN SITE →
                   </button>
                </div>
              )}
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
           </div>

           {/* Global Security Badges panel */}
           <div className="bg-[#07090d] border border-slate-900 rounded-2xl p-3 flex flex-col gap-2 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                 <span className="text-[8.5px] font-black text-slate-300 uppercase tracking-[0.15em] leading-none mb-[1px]">NEXUS SÉCURISÉ</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                 <div className="bg-black/30 border border-slate-900/60 rounded-xl p-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                       <p className="text-[7.5px] font-black text-white uppercase tracking-wider leading-none mb-0.5">SSL Active</p>
                       <p className="text-[6px] font-bold text-slate-500 uppercase tracking-widest leading-none truncate">256-Bit</p>
                    </div>
                 </div>
                 <div className="bg-black/30 border border-slate-900/60 rounded-xl p-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div className="min-w-0">
                       <p className="text-[7.5px] font-black text-white uppercase tracking-wider leading-none mb-0.5">Double 2FA</p>
                       <p className="text-[6px] font-bold text-slate-500 uppercase tracking-widest leading-none truncate">Facultatif</p>
                    </div>
                 </div>
              </div>
              <div className="flex items-center justify-between text-[6.5px] text-slate-500 font-extrabold uppercase tracking-widest pt-1 border-t border-slate-900/40">
                 <span>CONFORMITÉ PCI-DSS</span>
                 <span>• RGPD 2026</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col bg-black custom-scrollbar">
        {/* Header Section indicators */}
        <div className="px-4 md:px-8 pt-4 md:pt-8 flex items-center justify-between border-b border-slate-900 pb-4 mx-4 md:mx-8 mt-2 relative z-[60]">
           <div className="flex items-center gap-4 md:gap-12">
              {/* Burger Menu Button */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex flex-col hidden sm:flex">
                 <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Platform Status</span>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Nexus Phase III</span>
                 </div>
              </div>
              
              <div className="flex flex-col">
                 <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">User Token</span>
                 <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-tighter">e6khozvQH6Rd...</span>
              </div>
           </div>

           <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setActiveTab('sites')}
                className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-2.5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all group"
              >
                 <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:animate-ping" />
                 <div className="flex flex-col items-start leading-none max-w-[80px] md:max-w-none">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Site Actif</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{config?.url?.replace('https://', '').replace(/\/$/, '') || 'Nexus'}</span>
                 </div>
                 <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-500 transition-colors ml-1 md:ml-2" />
              </button>
           </div>
        </div>

        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === 'dashboard' && config && <DashboardView key={config.url} config={config} setActiveTab={setActiveTab} userEmail={userEmail} />}
              {activeTab === 'affiliates' && userEmail && <AffiliateView userEmail={userEmail} plans={plans} />}
              {activeTab === 'comm-hub' && <CommunicationHubView config={config} />}
              {activeTab === 'forecast' && config && <ForecastView key={config.url} config={config} />}
              {activeTab === 'finance' && <FinanceProfitView config={config} />}
              {activeTab === 'woo-manager' && config && <WooCommerceManagerView key={config.url} config={config} />}
              {activeTab === 'nexus-crm' && <NexusCrmView />}
              {activeTab === 'wp-crm' && config && <WpCrmView key={config.url} config={config} />}
              {activeTab === 'pixels' && config && <MultiPixelDashboardView config={config} />}
              {(activeTab === 'dashboard' || activeTab === 'security' || activeTab === 'wp-crm' || activeTab === 'pixels' || activeTab === 'forecast' || activeTab === 'stock' || activeTab === 'audit' || activeTab === 'content' || activeTab === 'products' || activeTab === 'categories' || activeTab === 'market' || activeTab === 'internal-links' || activeTab === 'maintenance' || activeTab === 'settings' || activeTab === 'smart-feed' || activeTab === 'woo-manager') && !config && (
                <div className="h-[80vh] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
                    <Zap className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">{lang === 'en' ? "SITE NOT CONNECTED" : "SITE NON CONNECTÉ"}</h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-md mb-8">
                    {lang === 'en' 
                      ? "This feature requires an active connection to a WordPress site. Please select or add one."
                      : "Cette fonctionnalité nécessite une connexion active à un site WordPress. Veuillez en sélectionner un ou en ajouter un nouveau."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={() => setActiveTab('sites')} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all">
                      {lang === 'en' ? "MANAGE MY SITES" : "GÉRER MES SITES"}
                    </button>
                    <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 hover:text-white transition-all animate-glow-pricing">
                      {lang === 'en' ? "VIEW PLANS (STORE)" : "VOIR LES PLANS (BOUTIQUE)"}
                    </button>
                    <button onClick={handleLogout} className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs hover:text-white transition-all">
                      {lang === 'en' ? "LOG OUT COMPTE" : "DÉCONNEXION COMPTE"}
                    </button>
                  </div>
                </div>
              )}
               {activeTab === 'security' && config && <SecurityShieldView key={config.url} config={config} />}
              {activeTab === 'stock' && config && <StockAnalysisView key={config.url} config={config} />}
              {activeTab === 'audit' && config && <AuditView key={config.url} config={config} />}
              {activeTab === 'content' && config && <ContentView key={config.url} config={config} />}
              {activeTab === 'autopilot' && config && <AutoPilotView key={config.url} config={config} />}
              {activeTab === 'smart-feed' && config && <SmartFeedView key={config.url} config={config} />}
              {activeTab === 'social' && config && <SocialAutomatorView key={config.url} config={config} />}
              {activeTab === 'products' && config && <ProductManagerView key={config.url} config={config} />}
              {activeTab === 'categories' && config && <TaxonomyManagerView key={config.url} config={config} />}
              {activeTab === 'market' && config && <CompetitorView key={config.url} config={config} />}
              {activeTab === 'internal-links' && config && <InternalLinkView key={config.url} config={config} />}
              {activeTab === 'maintenance' && config && <MaintenanceView key={config.url} config={config} />}
              {activeTab === 'pricing' && <PricingView currentSub={subscription} settings={settings} onPurchased={() => user?.email && fetchSubscription(user.email)} setActiveTab={setActiveTab} />}
              {activeTab === 'super' && <SuperAdminView setActiveTab={setActiveTab} settings={settings} plans={plans} />}
              {activeTab === 'secops' && <SecOpsDashboardView />}
              {activeTab === 'paypal-config' && <PaypalConfigView />}
              {activeTab === 'vision' && <div className="p-8 text-slate-500 font-black uppercase tracking-widest text-center mt-20">Vision Succès en cours de développement...</div>}
              {activeTab === 'sites' && <SitesView currentConfig={config} onSwitch={handleSwitchSite} currentSub={subscription} sites={sites} setSites={setSites} setActiveTab={setActiveTab} />}
              {activeTab === 'settings' && config && <SettingsView key={config.url} config={config} />}
              {activeTab === 'collab' && <CollaborationView />}
              {activeTab === 'marketing-hub' && <MarketingHubView />}
              {activeTab === 'guide' && <UserManualView />}
              {activeTab === 'support' && <SupportTicketsView activeTab={activeTab} />}
            </motion.div>
          </AnimatePresence>

          {/* Subscription Timer / Indicators */}
          {(isConnected && subscription && subscription.plan_id !== 'none' && !isSuperAdmin) && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="fixed bottom-8 right-28 z-[100] flex flex-col items-end gap-3"
            >
               {isExpiringSoon && !isExpired && (
                 <motion.div 
                   animate={{ scale: [1, 1.05, 1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-red-900/50"
                 >
                   {lang === 'en' ? "Warning: Expiring soon" : "Attention: Expiration proche"}
                 </motion.div>
               )}
               
               <div className={cn(
                 "bg-black/80 backdrop-blur-md border px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl transition-all",
                 isExpiringSoon ? "border-red-500/50 text-red-500 shadow-red-900/20" : "border-white/10 text-white"
               )}>
                  <div className="text-right">
                     <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 opacity-50">
                       {subscription.plan_id === 'trial' 
                         ? (lang === 'en' ? 'NEXUS TRIAL Remaining' : 'TEST NEXUS Restant') 
                         : (lang === 'en' ? 'NEXUS SUBSCRIPTION' : 'ABONNEMENT NEXUS')
                       }
                     </p>
                     <p className={cn("text-xl font-black italic uppercase tracking-tighter leading-none")}>
                        {timeRemaining}
                     </p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900",
                    isExpiringSoon && "bg-red-500/10"
                  )}>
                     <Zap className={cn("w-5 h-5", isExpiringSoon ? "text-red-500" : "text-blue-500")} />
                  </div>
               </div>
            </motion.div>
          )}

          {/* Expired Overlay */}
          <AnimatePresence>
            {isExpired && !isSuperAdmin && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6"
              >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-[#0a0c10] border-2 border-red-500/30 rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl shadow-red-900/20"
                  >
                     <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <Lock className="w-10 h-10 text-red-500" />
                     </div>
                     <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 italic">
                       {lang === 'en' ? "NEXUS ACCESS BLOCKED" : "ACCÈS NEXUS BLOQUÉ"}
                     </h2>
                     <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-10 leading-relaxed">
                        {lang === 'en'
                          ? "Your trial period or active subscription has expired. Please subscribe to continue using Phase III intelligence."
                          : "Votre période d'essai ou votre abonnement a expiré. Pour continuer à profiter de l'intelligence Phase III, veuillez renouveler votre pack."
                        }
                     </p>
                     <div className="space-y-4">
                        <button 
                          onClick={() => {
                            setIsExpired(false); 
                            setActiveTab('pricing');
                          }}
                          className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
                        >
                           {lang === 'en' ? "Choose a pack now" : "Choisir un pack maintenant"}
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                        >
                           {lang === 'en' ? "Sign Out" : "Se déconnecter"}
                        </button>
                     </div>
                  </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Global Signup Alert Toast */}
      <AnimatePresence>
        {newSignupToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-[#0a0c10]/95 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-5 shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col gap-3.5 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ repeat: Infinity, repeatDelay: 1.5, duration: 0.6 }}
                  >
                    <span className="text-xl">🔔</span>
                  </motion.div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Nouvelle inscription</h4>
                  <p className="text-sm font-black text-white leading-tight pr-4">{newSignupToast.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNewSignupToast(null);
                  setActiveSignupNotification(null);
                }}
                className="text-slate-500 hover:text-white transition-colors p-1"
                title="Ignorer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60 font-mono text-xs text-slate-400 flex flex-col gap-1.5 leading-normal">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold">
                <span>E-mail</span>
                <span className="text-indigo-400 font-mono">{newSignupToast.timestamp}</span>
              </div>
              <p className="font-semibold text-slate-200 select-all truncate">{newSignupToast.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewSignupToast(null);
                  setActiveSignupNotification(null);
                  setActiveTab('super'); // Direct access to registry dashboard
                }}
                className="flex-1 py-2.5 px-4 bg-indigo-600 text-white text-center font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-indigo-500 transition-all shadow-md shadow-indigo-900/40"
              >
                Consulter le registre SaaS
              </button>
              <button
                onClick={() => {
                  setNewSignupToast(null);
                  setActiveSignupNotification(null);
                }}
                className="py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-slate-800 hover:text-white transition-all shrink-0"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIChatSupport />
    </div>
  );
}
