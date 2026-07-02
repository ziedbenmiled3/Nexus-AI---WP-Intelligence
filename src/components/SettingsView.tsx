import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  LogOut, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  Coins,
  Zap,
  Loader2,
  RefreshCw,
  User,
  Target,
  Tag,
  Code2,
  Trash2,
  Plus,
  Download,
  FileSpreadsheet,
  Database,
  Shield,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as OTPAuth from 'otpauth';
import { WPConfig } from '../types';
import { cn } from '../lib/utils';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../providers/FirebaseProvider';
import api from '../lib/api';
import { testGeminiConnection } from '../lib/gemini';
import { DEFAULT_MARKETING_KEYWORDS, MARKETING_CATEGORIES } from '../constants/marketingKeywords';

// Comprehensive list of world currencies
const WORLD_CURRENCIES = [
  { code: 'AFN', name: 'Afghani afghan', symbol: 'Af' },
  { code: 'ALL', name: 'Lek albanais', symbol: 'L' },
  { code: 'DZD', name: 'Dinar algérien', symbol: 'DA' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar américain', symbol: '$' },
  { code: 'AOA', name: 'Kwanza angolais', symbol: 'Kz' },
  { code: 'ARS', name: 'Peso argentin', symbol: '$' },
  { code: 'AMD', name: 'Dram arménien', symbol: '֏' },
  { code: 'AUD', name: 'Dollar australien', symbol: 'A$' },
  { code: 'AZN', name: 'Manat azerbaïdjanais', symbol: '₼' },
  { code: 'BHD', name: 'Dinar bahreïni', symbol: 'BD' },
  { code: 'BDT', name: 'Taka bangladais', symbol: '৳' },
  { code: 'BBD', name: 'Dollar barbadien', symbol: 'Bds$' },
  { code: 'BZD', name: 'Dollar bélizien', symbol: 'BZ$' },
  { code: 'BMD', name: 'Dollar bermudien', symbol: 'BD$' },
  { code: 'BTN', name: 'Ngultrum bouthanais', symbol: 'Nu.' },
  { code: 'BYN', name: 'Rouble biélorusse', symbol: 'Br' },
  { code: 'BOB', name: 'Boliviano bolivien', symbol: 'Bs.' },
  { code: 'BAM', name: 'Mark convertible', symbol: 'KM' },
  { code: 'BWP', name: 'Pula botswanais', symbol: 'P' },
  { code: 'BRL', name: 'Réal brésilien', symbol: 'R$' },
  { code: 'GBP', name: 'Livre sterling', symbol: '£' },
  { code: 'BND', name: 'Dollar de Brunei', symbol: 'B$' },
  { code: 'BGN', name: 'Lev bulgare', symbol: 'лв' },
  { code: 'BIF', name: 'Franc burundais', symbol: 'FBu' },
  { code: 'KHR', name: 'Riel cambodgien', symbol: '៛' },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'C$' },
  { code: 'CVE', name: 'Escudo cap-verdien', symbol: 'Esc' },
  { code: 'KYD', name: 'Dollar des îles Caïmans', symbol: 'CI$' },
  { code: 'XAF', name: 'Franc CFA (BEAC)', symbol: 'FCFA' },
  { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'CFA' },
  { code: 'XPF', name: 'Franc CFP', symbol: '₣' },
  { code: 'CLP', name: 'Peso chilien', symbol: '$' },
  { code: 'CNY', name: 'Yuan chinois', symbol: '¥' },
  { code: 'COP', name: 'Peso colombien', symbol: '$' },
  { code: 'KMF', name: 'Franc comorien', symbol: 'CF' },
  { code: 'CDF', name: 'Franc congolais', symbol: 'FC' },
  { code: 'CRC', name: 'Colón costaricain', symbol: '₡' },
  { code: 'HRK', name: 'Kuna croate', symbol: 'kn' },
  { code: 'CUP', name: 'Peso cubain', symbol: '$' },
  { code: 'CZK', name: 'Couronne tchèque', symbol: 'Kč' },
  { code: 'DKK', name: 'Couronne danoise', symbol: 'kr' },
  { code: 'DJF', name: 'Franc djiboutien', symbol: 'Fdj' },
  { code: 'DOP', name: 'Peso dominicain', symbol: 'RD$' },
  { code: 'ECS', name: 'Sucre équatorien', symbol: '$' },
  { code: 'EGP', name: 'Livre égyptienne', symbol: 'E£' },
  { code: 'SVC', name: 'Colón salvadorien', symbol: '$' },
  { code: 'ERN', name: 'Nakfa érythréen', symbol: 'Nfk' },
  { code: 'ETB', name: 'Birr éthiopien', symbol: 'Br' },
  { code: 'FJD', name: 'Dollar fidjien', symbol: 'FJ$' },
  { code: 'GMD', name: 'Dalasi gambien', symbol: 'D' },
  { code: 'GEL', name: 'Lari géorgien', symbol: '₾' },
  { code: 'GHS', name: 'Cedi ghanéen', symbol: 'GH₵' },
  { code: 'GIP', name: 'Livre de Gibraltar', symbol: '£' },
  { code: 'GTQ', name: 'Quetzal guatémaltèque', symbol: 'Q' },
  { code: 'GNF', name: 'Franc guinéen', symbol: 'FG' },
  { code: 'GYD', name: 'Dollar guyanien', symbol: 'G$' },
  { code: 'HTG', name: 'Gourde haïtienne', symbol: 'G' },
  { code: 'HNL', name: 'Lempira hondurien', symbol: 'L' },
  { code: 'HKD', name: 'Dollar de Hong Kong', symbol: 'HK$' },
  { code: 'HUF', name: 'Forint hongrois', symbol: 'Ft' },
  { code: 'ISK', name: 'Couronne islandaise', symbol: 'kr' },
  { code: 'INR', name: 'Roupie indienne', symbol: '₹' },
  { code: 'IDR', name: 'Roupie indonésienne', symbol: 'Rp' },
  { code: 'IRR', name: 'Rial iranien', symbol: '﷼' },
  { code: 'IQD', name: 'Dinar irakien', symbol: 'ID' },
  { code: 'ILS', name: 'Nouveau shekel israélien', symbol: '₪' },
  { code: 'JMD', name: 'Dollar jamaïcain', symbol: 'J$' },
  { code: 'JPY', name: 'Yen japonais', symbol: '¥' },
  { code: 'JOD', name: 'Dinar jordanien', symbol: 'JD' },
  { code: 'KZT', name: 'Tenge kazakh', symbol: '₸' },
  { code: 'KES', name: 'Shilling kényan', symbol: 'KSh' },
  { code: 'KWD', name: 'Dinar koweïtien', symbol: 'KD' },
  { code: 'KGS', name: 'Som kirghize', symbol: 'лв' },
  { code: 'LAK', name: 'Kip laotien', symbol: '₭' },
  { code: 'LBP', name: 'Livre libanaise', symbol: 'L£' },
  { code: 'LSL', name: 'Loti lesothan', symbol: 'L' },
  { code: 'LRD', name: 'Dollar libérien', symbol: 'L$' },
  { code: 'LYD', name: 'Dinar libyen', symbol: 'LD' },
  { code: 'MOP', name: 'Pataca macanaise', symbol: 'MOP$' },
  { code: 'MKD', name: 'Denar macédonien', symbol: 'ден' },
  { code: 'MGA', name: 'Ariary malgache', symbol: 'Ar' },
  { code: 'MWK', name: 'Kwacha malawite', symbol: 'MK' },
  { code: 'MYR', name: 'Ringgit malaisien', symbol: 'RM' },
  { code: 'MVR', name: 'Rufiyaa maldivienne', symbol: 'Rf' },
  { code: 'MUR', name: 'Roupie mauricienne', symbol: 'Rs' },
  { code: 'MXN', name: 'Peso mexicain', symbol: '$' },
  { code: 'MDL', name: 'Leu moldave', symbol: 'L' },
  { code: 'MNT', name: 'Tugrik mongol', symbol: '₮' },
  { code: 'MAD', name: 'Dirham marocain', symbol: 'DH' },
  { code: 'MZN', name: 'Metical mozambicain', symbol: 'MT' },
  { code: 'MMK', name: 'Kyat birman', symbol: 'K' },
  { code: 'NAD', name: 'Dollar namibien', symbol: 'N$' },
  { code: 'NPR', name: 'Roupie népalaise', symbol: 'Rs' },
  { code: 'ANG', name: 'Florin des Antilles néerlandaises', symbol: 'ƒ' },
  { code: 'NZD', name: 'Dollar néo-zélandais', symbol: 'NZ$' },
  { code: 'NIO', name: 'Córdoba nicaraguayen', symbol: 'C$' },
  { code: 'NGN', name: 'Naira nigérian', symbol: '₦' },
  { code: 'NOK', name: 'Couronne norvégienne', symbol: 'kr' },
  { code: 'OMR', name: 'Rial omanais', symbol: 'RO' },
  { code: 'PKR', name: 'Roupie pakistanaise', symbol: 'Rs' },
  { code: 'PAB', name: 'Balboa panaméen', symbol: 'B/.' },
  { code: 'PGK', name: 'Kina papouan-néo-guinéen', symbol: 'K' },
  { code: 'PYG', name: 'Guaraní paraguayen', symbol: '₲' },
  { code: 'PEN', name: 'Sol péruvien', symbol: 'S/.' },
  { code: 'PHP', name: 'Peso philippin', symbol: '₱' },
  { code: 'PLN', name: 'Zloty polonais', symbol: 'zł' },
  { code: 'QAR', name: 'Riyal qatari', symbol: 'QR' },
  { code: 'RON', name: 'Leu roumain', symbol: 'lei' },
  { code: 'RUB', name: 'Rouble russe', symbol: '₽' },
  { code: 'RWF', name: 'Franc rwandais', symbol: 'RF' },
  { code: 'WST', name: 'Tala samoan', symbol: 'WS$' },
  { code: 'SAR', name: 'Riyal saoudien', symbol: 'SR' },
  { code: 'RSD', name: 'Dinar serbe', symbol: 'din' },
  { code: 'SCR', name: 'Roupie seychelloise', symbol: 'SR' },
  { code: 'SLL', name: 'Leone léonais', symbol: 'Le' },
  { code: 'SGD', name: 'Dollar de Singapour', symbol: 'S$' },
  { code: 'SBD', name: 'Dollar des îles Salomon', symbol: 'SI$' },
  { code: 'SOS', name: 'Shilling somalien', symbol: 'S' },
  { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R' },
  { code: 'KRW', name: 'Won sud-coréen', symbol: '₩' },
  { code: 'LKR', name: 'Roupie srilankaise', symbol: 'Rs' },
  { code: 'SDG', name: 'Livre soudanaise', symbol: '£' },
  { code: 'SRD', name: 'Dollar surinamais', symbol: '$' },
  { code: 'SZL', name: 'Lilangeni swazi', symbol: 'L' },
  { code: 'SEK', name: 'Couronne suédoise', symbol: 'kr' },
  { code: 'CHF', name: 'Franc suisse', symbol: 'CHF' },
  { code: 'SYP', name: 'Livre syrienne', symbol: 'LS' },
  { code: 'TWD', name: 'Nouveau dollar de Taïwan', symbol: 'NT$' },
  { code: 'TJS', name: 'Somoni tadjik', symbol: 'SM' },
  { code: 'TZS', name: 'Shilling tanzanien', symbol: 'TSh' },
  { code: 'THB', name: 'Baht thaïlandais', symbol: '฿' },
  { code: 'TOP', name: 'Pa’anga tongan', symbol: 'T$' },
  { code: 'TTD', name: 'Dollar de Trinité-et-Tobago', symbol: 'TT$' },
  { code: 'TND', name: 'Dinar tunisien', symbol: 'DT' },
  { code: 'TRY', name: 'Livre turque', symbol: '₺' },
  { code: 'TMT', name: 'Manat turkmène', symbol: 'T' },
  { code: 'AED', name: 'Dirham des Émirats arabes unis', symbol: 'Dh' },
  { code: 'UGX', name: 'Shilling ougandais', symbol: 'USh' },
  { code: 'UAH', name: 'Hryvnia ukrainienne', symbol: '₴' },
  { code: 'UYU', name: 'Peso uruguayen', symbol: '$' },
  { code: 'UZS', name: 'Sum ouzbek', symbol: 'so’m' },
  { code: 'VUV', name: 'Vatu vanuatais', symbol: 'Vt' },
  { code: 'VEF', name: 'Bolívar vénézuélien', symbol: 'Bs' },
  { code: 'VND', name: 'Dong vietnamien', symbol: '₫' },
  { code: 'YER', name: 'Rial yéménite', symbol: '﷼' },
  { code: 'ZMW', name: 'Kwacha zambien', symbol: 'ZK' },
  { code: 'ZWL', name: 'Dollar zimbabwéen', symbol: 'Z$' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function SettingsView({ config }: { config: WPConfig }) {
  const { user, logout } = useAuth();
  const [currency, setCurrency] = useState(() => localStorage.getItem('app_currency') || 'TND');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Profile information states
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // Google Tag (Ads & Analytics) integration states
  const [googleTagId, setGoogleTagId] = useState('');
  const [googleTagScript, setGoogleTagScript] = useState('');
  const [isSavingGoogleTag, setIsSavingGoogleTag] = useState(false);
  const [googleTagSavedMsg, setGoogleTagSavedMsg] = useState<string | null>(null);
  const [googleTagErrorMsg, setGoogleTagErrorMsg] = useState<string | null>(null);

  // Marketing & SEO keywords states
  const [keywords, setKeywords] = useState<any[]>([]);
  const [keywordCategories, setKeywordCategories] = useState<Record<string, string>>({});
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [selectedKwCategory, setSelectedKwCategory] = useState<string>('all');
  const [kwSearchQuery, setKwSearchQuery] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newKwCategory, setNewKwCategory] = useState('stocks');
  const [newKwMatchType, setNewKwMatchType] = useState<'phrase' | 'exact' | 'negative'>('phrase');
  const [kwErrorMsg, setKwErrorMsg] = useState<string | null>(null);
  const [kwSuccessMsg, setKwSuccessMsg] = useState<string | null>(null);
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);

  // Robust 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorSetupSecret, setTwoFactorSetupSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false);
  const [twoFactorSetupError, setTwoFactorSetupError] = useState<string | null>(null);
  const [twoFactorSetupSuccess, setTwoFactorSetupSuccess] = useState<string | null>(null);
  const [show2FASetup, setShow2FASetup] = useState(false);

  const fetchKeywords = async () => {
    setLoadingKeywords(true);
    try {
      const response = await fetch('/api/marketing/keywords');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && (data.keywords || data.categories)) {
        setKeywords(data.keywords || DEFAULT_MARKETING_KEYWORDS);
        setKeywordCategories(data.categories || MARKETING_CATEGORIES);
      } else {
        setKeywords(DEFAULT_MARKETING_KEYWORDS);
        setKeywordCategories(MARKETING_CATEGORIES);
      }
    } catch (err) {
      console.warn('Error fetching marketing keywords, falling back to local defaults:', err);
      setKeywords(DEFAULT_MARKETING_KEYWORDS);
      setKeywordCategories(MARKETING_CATEGORIES);
    } finally {
      setLoadingKeywords(false);
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setKwErrorMsg(null);
    setKwSuccessMsg(null);
    if (!newKeyword.trim()) {
      setKwErrorMsg("Le mot-clé ne peut pas être vide.");
      return;
    }
    
    setIsAddingKeyword(true);
    try {
      const response = await fetch('/api/marketing/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          category: newKwCategory,
          match_type: newKwMatchType
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite lors de la création.");
      }
      setKwSuccessMsg(`"${newKeyword.trim()}" a été ajouté.`);
      setNewKeyword('');
      fetchKeywords();
    } catch (err: any) {
      setKwErrorMsg(err.message);
    } finally {
      setIsAddingKeyword(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce mot-clé ?")) return;
    setKwErrorMsg(null);
    setKwSuccessMsg(null);
    try {
      const response = await fetch(`/api/marketing/keywords/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur de suppression.");
      }
      setKwSuccessMsg("Mot-clé retiré.");
      fetchKeywords();
    } catch (err: any) {
      setKwErrorMsg(err.message);
    }
  };

  const handleExportGoogleAds = () => {
    try {
      let csvContent = "\uFEFF"; // BOM for Excel encoding
      csvContent += "Keyword,Match Type,Campaign Category,Google Ads Line\n";
      
      const filteredKeywords = keywords.filter(kw => {
        if (selectedKwCategory !== 'all' && kw.category !== selectedKwCategory) return false;
        if (kwSearchQuery.trim()) {
          const s = kwSearchQuery.toLowerCase();
          return kw.keyword.toLowerCase().includes(s) || (keywordCategories[kw.category] || '').toLowerCase().includes(s);
        }
        return true;
      });

      filteredKeywords.forEach(kw => {
        const matchTypeStr = kw.match_type.toUpperCase();
        const cleanKw = kw.keyword.replace(/"/g, '""');
        const cleanCat = (keywordCategories[kw.category] || kw.category).replace(/"/g, '""');
        const cleanFormatted = kw.formatted_keyword.replace(/"/g, '""');
        
        csvContent += `"${cleanKw}","${matchTypeStr}","${cleanCat}","${cleanFormatted}"\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const catSuffix = selectedKwCategory !== 'all' ? `_${selectedKwCategory}` : '_complet';
      link.setAttribute("download", `nexus_google_ads_keywords${catSuffix}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating Google Ads export CSV:', err);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      setLoadingProfile(true);
      firebaseService.getUserProfile(user.uid).then((p) => {
        const uProfile = p as any;
        if (uProfile) {
          setProfile(uProfile);
          setUsername(uProfile.username || '');
          setFirstName(uProfile.first_name || '');
          setLastName(uProfile.last_name || '');
          setBirthDate(uProfile.birth_date || '');
          setAddress(uProfile.address || '');
          setZipCode(uProfile.zip_code || '');
          setCountry(uProfile.country || '');
          setPhone(uProfile.phone || '');
          setCompany(uProfile.company || '');
          setGoogleTagId(uProfile.google_tag_id || '');
          setGoogleTagScript(uProfile.google_tag_script || '');
          setTwoFactorEnabled(uProfile.two_factor_enabled || false);
          setTwoFactorSecret(uProfile.two_factor_secret || '');
        }
        setLoadingProfile(false);
      });
    }
  }, [user]);

  const handleUpdateGoogleTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleTagSavedMsg(null);
    setGoogleTagErrorMsg(null);
    if (!user?.uid) return;

    setIsSavingGoogleTag(true);
    try {
      const updated = {
        google_tag_id: googleTagId.trim(),
        google_tag_script: googleTagScript,
        updated_at: new Date().toISOString()
      };
      await firebaseService.updateUserProfile(user.uid, updated);
      
      // Update local storage or live app state by reloading page, or updating parent state.
      // But since we are directly modifying Firestore, let's trigger reloading or message:
      setGoogleTagSavedMsg("La balise Google a été enregistrée avec succès ! La balise est maintenant active dans votre session.");
      setTimeout(() => setGoogleTagSavedMsg(null), 8000);
      
      // Attempt to immediately inject the tag into parent frame if possible
      if (typeof window !== 'undefined' && googleTagId.trim()) {
        const tagId = googleTagId.trim();
        // Clear previous scripts
        const existingScripts = document.querySelectorAll(`script[src*="googletagmanager.com/gtag/js"]`);
        existingScripts.forEach(el => el.remove());
        const existingInline = document.querySelectorAll(`script[id="gtag-init"]`);
        existingInline.forEach(el => el.remove());

        // Create Script 1
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
        document.head.appendChild(script);

        // Create Script 2
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
    } catch (err: any) {
      console.error("Failed to update Google Tag", err);
      setGoogleTagErrorMsg("Erreur lors de l'enregistrement de la balise Google.");
    } finally {
      setIsSavingGoogleTag(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(null);
    setProfileErrorMsg(null);
    if (!user?.uid) return;

    if (!username.trim() || !firstName.trim() || !lastName.trim() || !birthDate.trim() || !address.trim() || !zipCode.trim() || !country.trim() || !phone.trim() || !company.trim()) {
      setProfileErrorMsg("Veuillez remplir l'intégralité des coordonnées obligatoires.");
      return;
    }

    try {
      const updated = {
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: `${firstName.trim()} ${lastName.trim()}`,
        birth_date: birthDate,
        address: address.trim(),
        zip_code: zipCode.trim(),
        country: country.trim(),
        phone: phone.trim(),
        company: company.trim(),
        profile_completed: true,
        updated_at: new Date().toISOString()
      };
      await firebaseService.updateUserProfile(user.uid, updated);
      setProfileSavedMsg("Vos coordonnées ont été enregistrées avec succès dans la plateforme !");
      setTimeout(() => setProfileSavedMsg(null), 4000);
    } catch (err: any) {
      console.error("Failed to update profile", err);
      setProfileErrorMsg("Erreur lors de l'enregistrement de votre profil.");
    }
  };
  
  // Diagnostic AI
  const [testingAPI, setTestingAPI] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error' | 'exception', message: string, detail?: string } | null>(null);
  
  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  const testGeminiAPI = async () => {
    setTestingAPI(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection(config.geminiApiKey || '');
      setTestResult({
        status: 'success',
        message: 'Connexion à l\'API Gemini établie avec succès.',
        detail: `Réponse: ${res.data.text}`
      } as any);
    } catch (error: any) {
      console.error('Gemini test failed:', error);
      setTestResult({
        status: 'error',
        message: 'Erreur lors du test de l\'API',
        detail: error.message
      } as any);
    } finally {
      setTestingAPI(false);
    }
  };

  const filteredCurrencies = WORLD_CURRENCIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('app_currency');
    window.location.href = '/';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Paramètres Globaux</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Configurez les préférences d'affichage de votre boutique</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gemini API Diagnostic */}
        <div className="bg-[#0b0d12] border border-slate-800/80 rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Diagnostic Nexus AI</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vérifiez la validité de votre clé API Gemini</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="p-6 bg-slate-950/80 border border-slate-800/50 rounded-2xl">
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-4">Statut de la clé Secret `GEMINI_API_KEY`</p>
               
               {testResult ? (
                  <div className={cn(
                    "mb-6 p-4 rounded-xl border flex items-start gap-4",
                    testResult.status === 'success' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                  )}>
                    {testResult.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className={cn("text-xs font-black uppercase tracking-widest mb-1", testResult.status === 'success' ? "text-emerald-400" : "text-red-400")}>
                        {testResult.status === 'success' ? "API Validée" : "Erreur de Validation"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                        {testResult.message}
                        {testResult.detail && <span className="block mt-1 text-slate-500 italic opacity-80">{testResult.detail}</span>}
                      </p>
                    </div>
                  </div>
               ) : (
                  <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4 opacity-40">
                    <RefreshCw className="w-5 h-5 text-slate-600" />
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">En attente du test de diagnostic...</p>
                  </div>
               )}

               <button 
                 onClick={testGeminiAPI}
                 disabled={testingAPI}
                 className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/20 group/btn"
               >
                 {testingAPI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />}
                 {testingAPI ? "Vérification en cours..." : "Tester la Clé API"}
               </button>
            </div>

            <div className="flex items-start gap-3 px-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[8px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                Indice : Si votre site affiche "Quota atteint", assurez-vous que la clé insérée dans les secrets de l'applet n'est pas expirée ou restreinte.
              </p>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
        </div>

        {/* Currency Config */}
        <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Configuration de la Monnaie</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Symbole utilisé pour l'affichage des prix</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1">Symbole de la monnaie (Ex: TND, DT, €, $)</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-sm font-black text-white focus:border-indigo-500 transition-all outline-none"
                    placeholder="TND"
                  />
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-all"
                  >
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showDropdown && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-900">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                            <input 
                              type="text"
                              placeholder="Chercher une monnaie..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-[10px] font-bold text-slate-300 outline-none focus:border-indigo-500 transition-all"
                              value={searchQuery || ''}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {filteredCurrencies.map((c) => (
                            <button 
                              key={c.code}
                              onClick={() => {
                                setCurrency(c.code);
                                setShowDropdown(false);
                              }}
                              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-indigo-600/10 text-left transition-all border-b border-white/5 last:border-0 group"
                            >
                              <div className="flex flex-col">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", currency === c.code ? "text-indigo-400" : "text-slate-400 group-hover:text-white")}>
                                  {c.name}
                                </span>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{c.code}</span>
                              </div>
                              <span className="text-sm font-black text-slate-700 group-hover:text-indigo-400">{c.symbol}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2">
                   {['TND', 'DT', 'EUR', 'USD'].map((sym) => (
                      <button 
                        key={sym}
                        onClick={() => setCurrency(sym)}
                        className={cn(
                          "px-4 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all border",
                          currency === sym 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40" 
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700"
                        )}
                      >
                        {sym}
                      </button>
                   ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
        </div>

        {/* AI Quota Info */}
        <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
              <Coins className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">État des Quotas IA</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gérez vos limites de génération</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Vitesse Limite (RPM)</span>
                <span className="text-amber-500">15 Requêtes / Min</span>
              </div>
              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full w-full bg-amber-500 opacity-20" />
              </div>
              <p className="text-[8px] text-slate-600 font-medium leading-relaxed">
                Le système Nexus utilise un quota gratuit partagé avec une limite de 15 requêtes par minute (RPM). Si vous voyez une erreur "Quota dépassé" au réveil, c'est que la limite par minute est saturée par l'activité globale. Attendez simplement 60 secondes ou utilisez votre propre clé API pour un accès prioritaire.
              </p>
            </div>
            
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
               <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-blue-300 font-bold leading-relaxed uppercase tracking-wide">
                    Note : Pour une utilisation intensive (optimisation en masse), nous recommandons vivement l'utilisation d'une clé API personnelle paramétrée dans les réglages de votre navigateur.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 group-hover:scale-110 transition-transform">
            <LogOut className="w-8 h-8 text-red-500" />
          </div>
          
          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">Déconnexion Finale</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8 max-w-[200px]">Quitter votre session plateforme complète</p>
          
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-4 bg-red-600/5 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-[0.98]"
            type="button"
          >
            Terminer la session
          </button>

          <AnimatePresence>
            {showLogoutConfirm && (
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
              >
                 <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl"
                 >
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic text-center mb-2">Confirmer Déconnexion ?</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center mb-8 leading-relaxed">
                       Voulez-vous vraiment quitter Nexus Phase III ? Vous devrez vous reconnecter.
                    </p>
                    <div className="flex gap-4">
                       <button 
                         onClick={() => setShowLogoutConfirm(false)}
                         className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                         type="button"
                       >
                         Annuler
                       </button>
                       <button 
                         onClick={handleLogout}
                         className="flex-1 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40 hover:bg-red-500 transition-all"
                         type="button"
                       >
                         Déconnexion
                       </button>
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-2/3 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        </div>

        {/* Coordonnées de Profil Obligatoires */}
        <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group lg:col-span-2">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Coordonnées de Profil Obligatoires</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gérez vos informations personnelles requises</p>
            </div>
          </div>

          {loadingProfile ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
              {profileSavedMsg && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center">
                  {profileSavedMsg}
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                  {profileErrorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Nom d'utilisateur</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Ex: zied_admin"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Numéro de téléphone</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Ex: +216 xx xxx xxx"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Prénom</label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Nom de famille</label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Votre nom de famille"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Date de naissance</label>
                  <input 
                    type="date" 
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white outline-none focus:border-blue-500/50 [color-scheme:dark] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Entreprise / Société</label>
                  <input 
                    type="text" 
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Adresse Postale Complète</label>
                  <input 
                    type="text" 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Ex: Rue 14 Janvier, Tunis, Tunisie"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Code Postal (Zip Code)</label>
                  <input 
                    type="text" 
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Ex: 2037"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Pays</label>
                  <input 
                    type="text" 
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Ex: Tunisie, France..."
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20"
                >
                  DÉPOSER ET ENREGISTRER LES COORDONNÉES
                </button>
              </div>
            </form>
          )}

          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-all" />
        </div>

        {/* Double Authentification (2FA) */}
        <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group lg:col-span-2">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              twoFactorEnabled 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-amber-500/10 border-amber-500/20"
            }`}>
              <Shield className={`w-6 h-6 ${twoFactorEnabled ? "text-emerald-400" : "text-amber-400"}`} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Authentification à Double Facteur (2FA)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sécuriser l'accès et les paiements contre les intrusions</p>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            {twoFactorSetupSuccess && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                {twoFactorSetupSuccess}
              </div>
            )}

            {/* Current status display */}
            {twoFactorEnabled ? (
              <div className="p-6 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                    PROTECTION ACTIVE • COMPTE SÉCURISÉ
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-300 font-medium leading-relaxed">
                  L'authentification à double facteur (2FA) est active sur votre compte. Lors de chaque nouvelle tentative de connexion, un code à usage unique issu de votre application d'authentification (Google Authenticator, Microsoft Authenticator, etc.) vous sera demandé.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Voulez-vous vraiment désactiver l'authentification à double facteur (2FA) ?")) {
                        try {
                          await firebaseService.updateUserProfile(user.uid, {
                            two_factor_enabled: false,
                            two_factor_secret: ""
                          });
                          setTwoFactorEnabled(false);
                          setTwoFactorSecret("");
                          setTwoFactorSetupSuccess("La double authentification a été désactivée avec succès.");
                        } catch (err) {
                          setTwoFactorSetupError("Erreur lors de la désactivation.");
                        }
                      }
                    }}
                    className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/15 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    DÉSACTIVER LE 2FA (FACULTATIF)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[8px] font-extrabold uppercase tracking-widest animate-pulse">
                    ⚠️ SÉCURITÉ CONSEILLÉE (2FA RECOMMANDÉ)
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-450 font-medium leading-relaxed">
                  Ajoutez une couche de protection absolue contre les intrusions et sécurisez votre accès ainsi que vos paiements en activant l'identifiant à deux facteurs. Cette option est entièrement <strong className="text-slate-300">facultative</strong>.
                </p>

                {!show2FASetup && (
                  <button
                    type="button"
                    onClick={() => {
                      // Generate a new 16-char base32 secret
                      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
                      let generated = '';
                      for (let i = 0; i < 16; i++) {
                        generated += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setTwoFactorSetupSecret(generated);
                      setTwoFactorCode('');
                      setTwoFactorSetupError(null);
                      setTwoFactorSetupSuccess(null);
                      setShow2FASetup(true);
                    }}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 cursor-pointer"
                  >
                    ACTIVER LA DOUBLE AUTHENTIFICATION
                  </button>
                )}
              </div>
            )}

            {/* 2FA Setup Flow */}
            {show2FASetup && !twoFactorEnabled && (
              <div className="p-8 bg-black/40 border border-slate-900 rounded-[2rem] space-y-6">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Configurer votre application d'authentification (Google, Microsoft...)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Scannez le code QR ci-dessous avec votre application d'authentification mobile (Google Authenticator, Microsoft Authenticator, Authy, etc.). Si vous préférez, vous pouvez aussi entrer la clé de sécurité secrète manuellement.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-t border-slate-900/60 pt-6">
                  {/* QR Code Column */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center bg-white p-3.5 rounded-3xl w-44 h-44 mx-auto border border-slate-800">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        `otpauth://totp/NEXUS:${user?.email || 'user'}?secret=${twoFactorSetupSecret}&issuer=NEXUS&algorithm=SHA1&digits=6&period=30`
                      )}`}
                      alt="Code QR TOTP" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Settings / Manual code Column */}
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-0.5">Clé Secrète de Secours (Saisie Manuelle)</span>
                      <code className="block w-full px-4 py-3 bg-[#050608] border border-slate-850 rounded-xl text-xs font-mono font-black text-indigo-400 select-all text-center tracking-widest">
                        {twoFactorSetupSecret}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[8px] font-black text-slate-450 uppercase tracking-widest px-0.5">Saisir le Code de Validation à 6 chiffres :</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full text-center px-4 py-3 bg-[#050608] border border-slate-850 rounded-xl text-lg font-black font-mono text-white tracking-[0.5em] focus:border-indigo-500 outline-none"
                      />
                    </div>

                    {twoFactorSetupError && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 text-center bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                        {twoFactorSetupError}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShow2FASetup(false);
                          setTwoFactorSetupError(null);
                        }}
                        className="flex-1 py-3 bg-[#0e1015] hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                      >
                        ANNULER
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setTwoFactorSetupError(null);
                          if (twoFactorCode.length !== 6) {
                            setTwoFactorSetupError("Le code doit comporter 6 chiffres.");
                            return;
                          }

                          setIsVerifyingTwoFactor(true);
                          try {
                            const totpInstance = new OTPAuth.TOTP({
                              issuer: 'NEXUS',
                              label: user?.email || '',
                              algorithm: 'SHA1',
                              digits: 6,
                              period: 30,
                              secret: twoFactorSetupSecret,
                            });

                            const delta = totpInstance.validate({
                              token: twoFactorCode,
                              window: 1
                            });

                            if (delta !== null) {
                              await firebaseService.updateUserProfile(user.uid, {
                                two_factor_enabled: true,
                                two_factor_secret: twoFactorSetupSecret
                              });
                              setTwoFactorEnabled(true);
                              setTwoFactorSecret(twoFactorSetupSecret);
                              setTwoFactorSetupSuccess("Félicitations, la double authentification de secours est maintenant active sur votre compte !");
                              setShow2FASetup(false);
                            } else {
                              setTwoFactorSetupError("Code invalide ou expiré. Veuillez vérifier que votre téléphone est à l'heure exacte.");
                            }
                          } catch (err: any) {
                            setTwoFactorSetupError("Erreur de validation: " + err.message);
                          } finally {
                            setIsVerifyingTwoFactor(false);
                          }
                        }}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-990/30 cursor-pointer"
                      >
                        {isVerifyingTwoFactor ? "CONTRÔLE..." : "VALIDER ET ACTIVER"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
        </div>

        {/* Configuration de Suivi Publicitaire (Google Tag / Google Ads) */}
        <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group lg:col-span-2">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              <Target className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Suivi Publicitaire & Balise Google</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gérez vos pixels et tags Google Ads ou Google Analytics</p>
            </div>
          </div>

          <form onSubmit={handleUpdateGoogleTag} className="space-y-6 relative z-10">
            {googleTagSavedMsg && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center">
                {googleTagSavedMsg}
              </div>
            )}

            {googleTagErrorMsg && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                {googleTagErrorMsg}
              </div>
            )}

            <div className="p-6 bg-slate-950/90 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-block px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[8px] font-extrabold uppercase tracking-widest">
                  ✅ CONFIGURATION ACTIVE POUR NEXUS AI
                </span>
                <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-extrabold uppercase tracking-widest">
                  BALISE INSTALLÉE ET VERIFIÉE
                </span>
              </div>
              <p className="text-[11.5px] text-slate-300 font-medium leading-relaxed">
                Votre balise Google Ads (<strong className="text-white">AW-18166935696</strong>) a été insérée de manière globale et définitive à la racine de l'application <strong className="text-indigo-400 font-bold">NEXUS AI</strong> dans le code HTML d'en-tête (<code className="text-slate-200 font-mono">&lt;head&gt;</code>).
              </p>
              
              <div className="border-t border-slate-800/80 pt-4 mt-2 space-y-3">
                <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Pourquoi c'est idéal pour votre campagne de promotion de l'application :</h4>
                <ul className="text-[10.5px] text-slate-400 space-y-3.5 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong className="text-slate-200">Disponibilité immédiate :</strong> La balise est chargée automatiquement pour tous les visiteurs du site, y compris les prospects non connectés arrivant sur l'application, les pages d'inscription et de tarification.
                  </li>
                  <li>
                    <strong className="text-slate-200">Détection par les robots Google Ads :</strong> Lorsque les robots de validation de Google scannent votre application <strong className="text-indigo-400 font-bold">NEXUS</strong>, le script publicitaire officiel s'exécute instantanément, certifiant immédiatement votre tracking de conversions.
                  </li>
                  <li>
                    <strong className="text-slate-200">Prêt à l'emploi :</strong> Aucune manipulation supplémentaire n'est requise. Vous pouvez cliquer sur "Retester" ou lancer la vérification sur l'interface de Google Ads pour valider votre campagne !
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
                  ID de Balise Google (gtag ID)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={googleTagId}
                    onChange={(e) => setGoogleTagId(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    className="w-full pl-12 pr-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-mono font-bold text-white placeholder:text-slate-700 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="Ex: AW-123456789 ou G-XXXXXXX"
                  />
                </div>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wide mt-2.5 px-2">
                  Format recommandé : AW-XXXXXXXXX ou G-XXXXXXXXX
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
                  Script de Conversion d'Événement Additionnel (Optionnel)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-4 text-slate-500">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <textarea 
                    value={googleTagScript}
                    onChange={(e) => setGoogleTagScript(e.target.value)}
                    rows={4}
                    className="w-full pl-12 pr-6 py-4 bg-black border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 placeholder:text-slate-700 focus:border-indigo-500/50 outline-none transition-all h-[92px] resize-none"
                    placeholder="<!-- Ex: gtag('event', 'conversion', { ... }); -->"
                  />
                </div>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wide mt-1 px-2">
                  Utile pour ajouter un événement d'achat Google Ads ou des scripts de conversion d'opportunités.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSavingGoogleTag}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/40"
              >
                {isSavingGoogleTag ? "ENREGISTREMENT ET INJECTION ACTIVE..." : "ENREGISTRER LA BALISE & ACTIVER LE SUIVI"}
              </button>
            </div>
          </form>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-2/3 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        </div>

        {/* Base Sémantique & Intelligence Mots-clés */}
        <div className="bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-slate-900 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Intelligence Sémantique & Mots-clés SEO</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base de recherche ciblée Nexus pour campagnes Google Ads & diagnostic d'intégration</p>
              </div>
            </div>

            <button
              onClick={handleExportGoogleAds}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-lg shadow-emerald-950/50 self-start md:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter pour Google Ads (CSV)
            </button>
          </div>

          {/* Formulaire d'ajout rapide */}
          <form onSubmit={handleAddKeyword} className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-2xl space-y-4 relative z-10">
            <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Ajouter un nouveau mot-clé sémantique</h4>
            
            {kwSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[9px] font-black uppercase tracking-widest text-center">
                {kwSuccessMsg}
              </div>
            )}
            {kwErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-100 text-[9px] font-black uppercase tracking-widest text-center">
                {kwErrorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Mot-clé (sans syntaxe Google Ads)</label>
                <input 
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Ex: automatiser stock dropshipping"
                  className="w-full px-4 py-3 bg-black border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Catégorie cible</label>
                <select
                  value={newKwCategory}
                  onChange={(e) => setNewKwCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all appearance-none"
                >
                  {Object.entries(keywordCategories).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Type de ciblage</label>
                <select
                  value={newKwMatchType}
                  onChange={(e) => setNewKwMatchType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-black border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-emerald-500/50 outline-none transition-all appearance-none"
                >
                  <option value="phrase">Expression (" ")</option>
                  <option value="exact">Exact ([ ])</option>
                  <option value="negative">Exclure (-)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isAddingKeyword}
                  className="w-full py-3.5 bg-slate-900 border border-slate-800 font-black text-[9px] text-white uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                  Insérer
                </button>
              </div>
            </div>
          </form>

          {/* Filtres de recherche */}
          <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between bg-black/40 p-4 border border-slate-900 rounded-2xl">
            {/* Onglets de catégorie */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setSelectedKwCategory('all')}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  selectedKwCategory === 'all' 
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                    : "bg-slate-950/40 border border-slate-900 text-slate-500 hover:text-slate-300"
                )}
              >
                Tous
              </button>
              {Object.entries(keywordCategories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedKwCategory(key)}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                    selectedKwCategory === key 
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                      : "bg-slate-950/40 border border-slate-900 text-slate-500 hover:text-slate-300"
                  )}
                >
                  {label.split(',')[0].split(' & ')[0]}
                </button>
              ))}
            </div>

            {/* Barre de filtre recherche */}
            <div className="relative w-full md:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Filtrer les mots-clés..."
                value={kwSearchQuery}
                onChange={(e) => setKwSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-black border border-slate-900 rounded-xl text-xs text-white placeholder:text-slate-700 focus:border-slate-850 outline-none transition-all placeholder:uppercase placeholder:text-[9px] placeholder:tracking-widest"
              />
            </div>
          </div>

          {/* Liste des mots-clés */}
          <div className="relative z-10 overflow-hidden border border-slate-900 rounded-2xl bg-black/20">
            {loadingKeywords ? (
              <div className="p-12 text-center opacity-60 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chargement des sémantiques...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-black/40">
                      <th className="px-6 py-4 text-[8px] font-black text-slate-500 uppercase tracking-widest">Mot-clé d'origine</th>
                      <th className="px-6 py-4 text-[8px] font-black text-slate-500 uppercase tracking-widest">Format Google Ads</th>
                      <th className="px-5 py-4 text-[8px] font-black text-slate-500 uppercase tracking-widest">Correspondance</th>
                      <th className="px-6 py-4 text-[8px] font-black text-slate-500 uppercase tracking-widest">Sous-Système</th>
                      <th className="px-6 py-4 text-[8px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {keywords
                      .filter(kw => {
                        if (selectedKwCategory !== 'all' && kw.category !== selectedKwCategory) return false;
                        if (kwSearchQuery.trim()) {
                          const s = kwSearchQuery.toLowerCase();
                          return kw.keyword.toLowerCase().includes(s) || (keywordCategories[kw.category] || '').toLowerCase().includes(s);
                        }
                        return true;
                      })
                      .map((kw, idx) => (
                        <tr key={kw.id || idx} className="hover:bg-slate-950/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-200 block">{kw.keyword}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] font-black">
                            <span className={cn(
                              kw.match_type === 'phrase' && "text-amber-400/95",
                              kw.match_type === 'exact' && "text-blue-400/95",
                              kw.match_type === 'negative' && "text-red-400/90 font-extrabold"
                            )}>
                              {kw.formatted_keyword}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                              kw.match_type === 'phrase' && "bg-amber-500/5 text-amber-400/80 border border-amber-500/10",
                              kw.match_type === 'exact' && "bg-blue-500/5 text-blue-400/80 border border-blue-500/10",
                              kw.match_type === 'negative' && "bg-red-500/5 text-red-500/80 border border-red-500/10"
                            )}>
                              {kw.match_type === 'phrase' ? 'Expression' : kw.match_type === 'exact' ? 'Exact' : 'Exclusion'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                              {keywordCategories[kw.category] || kw.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteKeyword(kw.id)}
                              className="p-2 bg-red-500/5 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                              title="Supprimer ce mot-clé"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                    {keywords.filter(kw => {
                      if (selectedKwCategory !== 'all' && kw.category !== selectedKwCategory) return false;
                      if (kwSearchQuery.trim()) {
                        const s = kwSearchQuery.toLowerCase();
                        return kw.keyword.toLowerCase().includes(s) || (keywordCategories[kw.category] || '').toLowerCase().includes(s);
                      }
                      return true;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-10 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                          Aucun mot-clé ne correspond à votre filtre.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-2/3 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
