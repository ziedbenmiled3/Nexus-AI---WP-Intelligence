/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { WPConfig, WPPost, WPProduct } from './types';
import { testWPConnection, getPosts, getProducts } from './lib/wordpress';
import { cn, safeJsonParse } from './lib/utils';
import { useAuth } from './providers/FirebaseProvider';
import { firebaseService } from './services/firebaseService';
import { seedFirebaseDefaults } from './lib/seedFirebase';
import { DEFAULT_NEXUS_CONFIG } from './constants';

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
import TaxonomyManagerView from './components/TaxonomyManagerView';
import MaintenanceView from './components/MaintenanceView';
import AutoPilotView from './components/AutoPilotView';
import InternalLinkView from './components/InternalLinkView';
import SmartFeedView from './components/SmartFeedView';
import SettingsView from './components/SettingsView';
import PricingView from './components/PricingView';
import AffiliateView from './components/AffiliateView';
import CommunicationHubView from './components/CommunicationHubView';
import SitesView from './components/SitesView';
import SuperAdminView from './components/SuperAdminView';
import LandingPage from './components/LandingPage';
import SignUpScreen from './components/SignUpScreen';
import PaymentScreen from './components/PaymentScreen';
import RegistrationSuccess from './components/RegistrationSuccess';
import InvitePage from './components/InvitePage';
import AIChatSupport from './components/AIChatSupport';
import { EbookPromotion } from './components/EbookPromotion';
import MandatoryProfileForm from './components/MandatoryProfileForm';

import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, loginWithGoogle, logout: firebaseLogout } = useAuth();
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
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [sites, setSites] = useState<any[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(true);

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

  // Sync when user becomes available
  useEffect(() => {
    if (user?.email) {
      const email = user.email.toLowerCase();
      
      // Prevent data leakage: if new user is different from cached user, clear cache
      const cachedEmail = localStorage.getItem('nexus_user_email');
      if (cachedEmail && cachedEmail !== email) {
        console.log('[App] New user detected, clearing local cache');
        localStorage.removeItem('wp_config');
        localStorage.removeItem('nexus_sites_list');
        localStorage.removeItem('nexus_active_tab');
        localStorage.removeItem('nexus_super_key');
        setConfig(null);
        setSites([]);
        setIsSuperAdmin(false);
      }

      setUserEmail(email);
      localStorage.setItem('nexus_user_email', email);

      // Force clear secret key for non-admin accounts on initial sync
      if (email !== 'ziedbenmiled3@gmail.com') {
        localStorage.removeItem('nexus_super_key');
        setIsSuperAdmin(false);
      } else {
        // Super Admin only: Sync the global site registry with their sites
        firebaseService.syncAllSitesToRegistry(email);
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
    }
  }, [user, authStep]);

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
    const isAdmin = email === 'ziedbenmiled3@gmail.com';
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

  const handleSwitchSite = (newConfig: WPConfig) => {
    setConfig(newConfig);
    localStorage.setItem('wp_config', JSON.stringify(newConfig));
    // Auto switch to dashboard after adding/switching
    setActiveTab('dashboard');
  };
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('nexus_active_tab');
    if (saved) return saved;
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('nexus_active_tab', activeTab);
  }, [activeTab]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const SUPER_ADMIN_EMAIL = 'ziedbenmiled3@gmail.com';

  // Sync super admin state
  useEffect(() => {
    const email = user?.email?.toLowerCase() || userEmail?.toLowerCase();
    
    // STRICT SECURITY RULE: Only ziedbenmiled3@gmail.com can be super admin
    if (email === 'ziedbenmiled3@gmail.com') {
      setIsSuperAdmin(true);
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
    if (email !== 'ziedbenmiled3@gmail.com') return;

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
    if (user?.email) {
      fetchSubscription(user.email);
    }
  }, [user]);

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

  if (isInvitePage) {
    return <InvitePage />;
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

  if (authLoading || (isLoadingSites && !isConnected && !isSuperAdmin)) {
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

  if (!user && !userEmail && !isSuperAdmin) {
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
    ...(isSuperAdmin ? [{ id: 'super', label: t('nav.superAdmin'), icon: Shield }] : []),
    { id: 'sites', label: t('nav.sites'), icon: Monitor },
    { id: 'comm-hub', label: 'Communication Hub', icon: Mail },
    { id: 'pricing', label: 'Nexus Plans (Boutique)', icon: Zap },
    { id: 'affiliates', label: t('nav.affiliate'), icon: Users },
  ];

  const groupedSiteTabs = [
    {
      category: 'Aperçu',
      items: [
        { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
      ]
    },
    {
      category: 'Marketing & Ventes',
      items: [
        { id: 'social', label: 'NEXUS SOCIAL', icon: Share2 },
        { id: 'smart-feed', label: 'FLUX SMART SHOPPING', icon: ShoppingBag },
        { id: 'market', label: 'Intelligence Marché', icon: Zap },
      ]
    },
    {
      category: 'Stocks & Logistique',
      items: [
        { id: 'stock', label: 'Analyse Stocks', icon: TrendingUp },
        { id: 'forecast', label: 'Nexus Forecast', icon: BarChart3 },
      ]
    },
    {
      category: 'SEO & Contenu',
      items: [
        { id: 'audit', label: t('nav.audit'), icon: ShieldCheck },
        { id: 'content', label: t('nav.content'), icon: FileText },
        { id: 'autopilot', label: t('nav.autopilot'), icon: RotateCw },
        { id: 'internal-links', label: 'Maillage Interne', icon: LinkIcon },
        { id: 'comm-hub', label: 'Communication Hub', icon: Mail },
      ]
    },
    {
      category: 'Catalogue & Admin',
      items: [
        { id: 'products', label: 'Manager Produits', icon: Package },
        { id: 'categories', label: 'Catégories & Tags', icon: Tags },
        { id: 'maintenance', label: 'Maintenance', icon: Settings },
        { id: 'settings', label: t('nav.settings'), icon: Globe },
      ]
    }
  ];

  // Matrix Filter Logic
  const configRaw = settings?.['nexus_matrix_config'];
  const matrixConfig = configRaw ? (typeof configRaw === 'string' ? safeJsonParse(configRaw, DEFAULT_NEXUS_CONFIG) : configRaw) : DEFAULT_NEXUS_CONFIG;
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
        if (['dashboard', 'products', 'categories', 'settings'].includes(item.id)) return true;
        
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
                {adminTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      activeTab === tab.id ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:bg-slate-900/50"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
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

            <div className="px-4 py-2">
               <EbookPromotion />
            </div>

            <div className="p-4 border-t border-white/5">
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
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                  activeTab === tab.id 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                    : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-300"
                )}
              >
                <tab.icon className={cn("w-4 h-4 transition-colors", activeTab === tab.id ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400")} />
                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="active-indicator-arrow" className="ml-auto">
                    <ChevronRight className="w-3 h-3 text-blue-400/50" />
                  </motion.div>
                )}
              </button>
            ))}
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
           <EbookPromotion />
           
           {/* Language Switcher */}
           <div className="flex bg-slate-950/80 border border-white/5 rounded-2xl p-1 shadow-2xl relative z-10 backdrop-blur-md">
              <button 
                onClick={() => handleLangChange('fr')}
                className={cn(
                  "flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                  i18n.language === 'fr' ? "bg-blue-600/90 text-white shadow-lg shadow-blue-900/20" : "text-slate-600 hover:text-slate-400"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                FRANÇAIS
              </button>
              <button 
                onClick={() => handleLangChange('en')}
                className={cn(
                  "flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                  i18n.language === 'en' ? "bg-blue-600/90 text-white shadow-lg shadow-blue-900/20" : "text-slate-600 hover:text-slate-400"
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
              
              <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest truncate">{config?.url}</span>
                 </div>
                 <button 
                   onClick={() => setActiveTab('sites')}
                   className="text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-blue-500 transition-colors text-left pl-3.5"
                 >
                   Gérer les sites
                 </button>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
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
              {activeTab === 'dashboard' && config && <DashboardView config={config} setActiveTab={setActiveTab} userEmail={userEmail} />}
              {activeTab === 'affiliates' && userEmail && <AffiliateView userEmail={userEmail} />}
              {activeTab === 'comm-hub' && <CommunicationHubView />}
              {activeTab === 'forecast' && config && <ForecastView config={config} />}
              {(activeTab === 'dashboard' || activeTab === 'forecast' || activeTab === 'stock' || activeTab === 'audit' || activeTab === 'content' || activeTab === 'products' || activeTab === 'categories' || activeTab === 'market' || activeTab === 'internal-links' || activeTab === 'maintenance' || activeTab === 'settings' || activeTab === 'smart-feed') && !config && (
                <div className="h-[80vh] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
                    <Zap className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">SITE NON CONNECTÉ</h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-md mb-8">
                    Cette fonctionnalité nécessite une connexion active à un site WordPress. 
                    Veuillez en sélectionner un ou en ajouter un nouveau.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={() => setActiveTab('sites')} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all">GÉRER MES SITES</button>
                    <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 hover:text-white transition-all">VOIR LES PLANS (BOUTIQUE)</button>
                    <button onClick={handleLogout} className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs hover:text-white transition-all">DÉCONNEXION COMPTE</button>
                  </div>
                </div>
              )}
              {activeTab === 'stock' && config && <StockAnalysisView config={config} />}
              {activeTab === 'audit' && config && <AuditView config={config} />}
              {activeTab === 'content' && config && <ContentView config={config} />}
              {activeTab === 'autopilot' && config && <AutoPilotView config={config} />}
              {activeTab === 'smart-feed' && config && <SmartFeedView config={config} />}
              {activeTab === 'social' && config && <SocialAutomatorView config={config} />}
              {activeTab === 'products' && config && <ProductManagerView config={config} />}
              {activeTab === 'categories' && config && <TaxonomyManagerView config={config} />}
              {activeTab === 'market' && config && <CompetitorView config={config} />}
              {activeTab === 'internal-links' && config && <InternalLinkView config={config} />}
              {activeTab === 'maintenance' && config && <MaintenanceView config={config} />}
              {activeTab === 'pricing' && <PricingView currentSub={subscription} settings={settings} onPurchased={() => user?.email && fetchSubscription(user.email)} setActiveTab={setActiveTab} />}
              {activeTab === 'super' && <SuperAdminView setActiveTab={setActiveTab} settings={settings} plans={plans} />}
              {activeTab === 'vision' && <div className="p-8 text-slate-500 font-black uppercase tracking-widest text-center mt-20">Vision Succès en cours de développement...</div>}
              {activeTab === 'sites' && <SitesView currentConfig={config} onSwitch={handleSwitchSite} currentSub={subscription} sites={sites} setSites={setSites} />}
              {activeTab === 'settings' && config && <SettingsView config={config} />}
            </motion.div>
          </AnimatePresence>

          {/* Subscription Timer / Indicators */}
          {(isConnected && subscription && subscription.plan_id !== 'none') && (
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
                   Attention: Expiration proche
                 </motion.div>
               )}
               
               <div className={cn(
                 "bg-black/80 backdrop-blur-md border px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl transition-all",
                 isExpiringSoon ? "border-red-500/50 text-red-500 shadow-red-900/20" : "border-white/10 text-white"
               )}>
                  <div className="text-right">
                     <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 opacity-50">
                       {subscription.plan_id === 'trial' ? 'TEST NEXUS Restant' : 'ABONNEMENT NEXUS'}
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
                     <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 italic">ACCÈS NEXUS BLOQUÉ</h2>
                     <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-10 leading-relaxed">
                        Votre période d'essai ou votre abonnement a expiré. Pour continuer à profiter de l'intelligence Phase III, veuillez renouveler votre pack.
                     </p>
                     <div className="space-y-4">
                        <button 
                          onClick={() => {
                            setIsExpired(false); 
                            setActiveTab('pricing');
                          }}
                          className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
                        >
                           Choisir un pack maintenant
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                        >
                           Se déconnecter
                        </button>
                     </div>
                  </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <AIChatSupport />
    </div>
  );
}
