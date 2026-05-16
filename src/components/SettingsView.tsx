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
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WPConfig } from '../types';
import { cn } from '../lib/utils';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../providers/FirebaseProvider';
import api from '../lib/api';

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
      const response = await api.get('/api/gemini-debug');
      setTestResult(response.data);
    } catch (error: any) {
      console.error('Gemini test failed:', error);
      setTestResult({
        status: 'error',
        message: 'Erreur lors du test de l\'API',
        detail: error.response?.data?.detail || error.message
      });
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
                              value={searchQuery}
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
                       >
                         Annuler
                       </button>
                       <button 
                         onClick={handleLogout}
                         className="flex-1 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40 hover:bg-red-500 transition-all"
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
      </div>
    </div>
  );
}
