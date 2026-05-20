import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Users, 
  Mail, 
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  Layout, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  RefreshCw, 
  Filter, 
  Sliders,
  DollarSign,
  UserCheck,
  ChevronDown,
  Globe,
  PlusCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { WPConfig, Order, Customer } from '../types';
import { useAuth } from '../providers/FirebaseProvider';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

interface WooCommerceManagerViewProps {
  config: WPConfig;
}

interface MailingList {
  id: string;
  name: string;
  description: string;
  user_email: string;
  contacts: Array<{
    first_name: string;
    last_name: string;
    email: string;
  }>;
  created_at: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body_html: string;
  category: string;
}

export default function WooCommerceManagerView({ config }: WooCommerceManagerViewProps) {
  const { user } = useAuth();
  const userEmail = user?.email || '';

  // View States
  const [activeTab, setActiveTab] = useState<'orders' | 'lists'>('orders');
  
  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'processing' | 'cancelled' | 'completed'>('all');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Mailing Lists State
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);

  // WooCommerce Customers State
  const [wooCustomers, setWooCustomers] = useState<any[]>([]);
  const [wooCustomersLoading, setWooCustomersLoading] = useState(false);
  const [wooCustomersError, setWooCustomersError] = useState<string | null>(null);

  // Email Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  // Modals & Forms State
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [selectedCustomerEmails, setSelectedCustomerEmails] = useState<string[]>([]);
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('');

  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [selectedListForCampaign, setSelectedListForCampaign] = useState<MailingList | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [campaignSending, setCampaignSending] = useState(false);
  const [campaignSuccess, setCampaignSuccess] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  // Headers for backend authentication
  const getBackendHeaders = () => {
    return {
      'x-user-email': userEmail,
      'x-wp-url': config.url || '',
      'x-wp-username': config.username || '',
      'x-wp-password': config.applicationPassword || '',
      'x-woocommerce-ck': config.consumerKey || '',
      'x-woocommerce-cs': config.consumerSecret || ''
    };
  };

  // Fetch WooCommerce Orders
  const fetchOrders = async () => {
    if (!config.url) return;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      console.log('[WooCommerce Frontend] Fetching orders with status:', orderFilter);
      const res = await axios.get('/api/woocommerce/orders', {
        headers: getBackendHeaders(),
        params: { status: orderFilter }
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('[WooCommerce Frontend Error] Failed to fetch orders:', err);
      setOrdersError(err.response?.data?.error || 'Erreur lors de la récupération des commandes depuis WooCommerce.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch WooCommerce Customers
  const fetchWooCustomers = async () => {
    if (!config.url) return;
    setWooCustomersLoading(true);
    setWooCustomersError(null);
    try {
      console.log('[WooCommerce Frontend] Fetching complete customer list...');
      const res = await axios.get('/api/woocommerce/customers', {
        headers: getBackendHeaders()
      });
      setWooCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('[WooCommerce Frontend Error] Failed to fetch customers:', err);
      setWooCustomersError('Impossible d’extraire les clients de votre boutique WooCommerce.');
    } finally {
      setWooCustomersLoading(false);
    }
  };

  // Fetch Email Templates from SQLite
  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/comm/templates', {
        headers: { 'x-user-email': userEmail }
      });
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load email templates:', err);
    }
  };

  // Listen for Mailing Lists in Firestore Real-time
  useEffect(() => {
    if (!userEmail) return;

    setListsLoading(true);
    const qList = query(
      collection(db, 'mailing_lists'),
      where('user_email', '==', userEmail.toLowerCase())
    );

    const unsubscribe = onSnapshot(qList, (snapshot) => {
      const listsArray: MailingList[] = [];
      snapshot.forEach((doc) => {
        listsArray.push({ id: doc.id, ...doc.data() } as MailingList);
      });
      // Sort lists by date desc
      listsArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMailingLists(listsArray);
      setListsLoading(false);
    }, (err) => {
      console.error('Firestore Mailing List Subscription failed:', err);
      setListsError('Erreur de synchronisation avec Firestore pour vos listes.');
      setListsLoading(false);
    });

    return () => unsubscribe();
  }, [userEmail]);

  // Load active tab dependencies
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'lists') {
      fetchWooCustomers();
      fetchTemplates();
    }
  }, [activeTab, orderFilter]);

  // Handle template selection in Campaign Composer
  useEffect(() => {
    if (selectedTemplateId) {
      const selected = templates.find(t => String(t.id) === selectedTemplateId);
      if (selected) {
        setCampaignSubject(selected.subject);
        setCampaignBody(selected.body_html);
      }
    } else {
      setCampaignSubject('');
      setCampaignBody('');
    }
  }, [selectedTemplateId, templates]);

  // Create standard Mailing List and write to firestore
  const handleSaveMailingList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      alert('Veuillez spécifier un nom de liste.');
      return;
    }
    if (selectedCustomerEmails.length === 0) {
      alert('Veuillez sélectionner au moins un client.');
      return;
    }

    try {
      // Map back chosen emails to customer details
      const selectedContacts = wooCustomers
        .filter(c => selectedCustomerEmails.includes(c.email))
        .map(c => ({
          first_name: c.first_name || '',
          last_name: c.last_name || '',
          email: c.email
        }));

      await addDoc(collection(db, 'mailing_lists'), {
        name: newListName.trim(),
        description: newListDesc.trim(),
        user_email: userEmail.toLowerCase(),
        contacts: selectedContacts,
        created_at: new Date().toISOString()
      });

      // Reset
      setNewListName('');
      setNewListDesc('');
      setSelectedCustomerEmails([]);
      setIsCreateListOpen(false);
    } catch (err: any) {
      console.error('[Mailing List Create Error]:', err);
      alert('Erreur lors de la création de la liste: ' + err.message);
    }
  };

  // Delete Mailing List from Firestore
  const handleDeleteMailingList = async (listId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste de diffusion ?')) return;
    try {
      await deleteDoc(doc(db, 'mailing_lists', listId));
    } catch (err: any) {
      console.error('Failed to delete list:', err);
      alert('Impossible de supprimer la liste: ' + err.message);
    }
  };

  // Send campaign / publipostage to mailing list
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListForCampaign) return;
    if (!campaignSubject.trim() || !campaignBody.trim()) {
      setCampaignError('Veuillez renseigner un objet et un corps de message.');
      return;
    }

    setCampaignSending(true);
    setCampaignError(null);
    setCampaignSuccess(null);

    try {
      console.log(`[Campaign Send] Launching publipostage for list "${selectedListForCampaign.name}" containing ${selectedListForCampaign.contacts.length} users.`);
      
      const payload = {
        recipient: selectedListForCampaign.contacts, // Passed as array for backend tag-replacement
        subject: campaignSubject,
        body_html: campaignBody
      };

      const res = await axios.post('/api/comm/send', payload, {
        headers: { 'x-user-email': userEmail }
      });

      console.log('[Campaign Send Success] Done:', res.data);
      setCampaignSuccess(`Félicitations ! Votre campagne de publipostage a été transmise avec succès à ${selectedListForCampaign.contacts.length} clients.`);
      
      // Delay closing modal
      setTimeout(() => {
        setIsCampaignOpen(false);
        setSelectedListForCampaign(null);
        setSelectedTemplateId('');
        setCampaignSubject('');
        setCampaignBody('');
        setCampaignSuccess(null);
      }, 3500);

    } catch (err: any) {
      console.error('[Campaign Send Failed] Error:', err);
      setCampaignError(err.response?.data?.error || 'Échec de transmission de la campagne. Veuillez vérifier vos paramètres SMTP.');
    } finally {
      setCampaignSending(false);
    }
  };

  const filteredWooCustomers = wooCustomers.filter(cust => {
    const q = searchCustomerQuery.toLowerCase();
    return (cust.full_name || '').toLowerCase().includes(q) || 
           (cust.email || '').toLowerCase().includes(q);
  });

  // Calculate order counts for status badge
  const statusColors: Record<string, string> = {
    'completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'processing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'on-hold': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
    'pending': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'default': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-950/40 p-8 border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/40">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              WooCommerce <span className="text-purple-500">Nexus</span>
            </h2>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-1">
            Gestion de Commandes, Extraction de Clients & Publipostage Intelligent
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-950/80 border border-white/5 rounded-2xl p-1 shadow-2xl">
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'orders' ? "bg-purple-600 text-white shadow-xl shadow-purple-905/40" : "text-slate-500 hover:text-slate-300"
            )}
            id="tab-btn-orders"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Commandes Commanditées
          </button>
          <button 
            onClick={() => setActiveTab('lists')}
            className={cn(
              "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'lists' ? "bg-purple-600 text-white shadow-xl shadow-purple-905/40" : "text-slate-500 hover:text-slate-300"
            )}
            id="tab-btn-lists"
          >
            <Users className="w-3.5 h-3.5" />
            Listes de Diffusion
          </button>
        </div>
      </div>

      {/* SECTION 1: ORDERS MANAGER */}
      <AnimatePresence mode="wait">
        {activeTab === 'orders' && (
          <motion.div 
            key="orders-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Status Quick Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c0e14] border border-slate-800 p-6 rounded-[2rem]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filtrer par État :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Toutes les commandes' },
                  { id: 'processing', label: 'En Cours / Attente' },
                  { id: 'completed', label: 'Passées / Terminées' },
                  { id: 'cancelled', label: 'Annulées' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all",
                      orderFilter === f.id 
                        ? "bg-purple-600/10 border border-purple-500/30 text-purple-400" 
                        : "bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-250"
                    )}
                    id={`filter-${f.id}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={fetchOrders}
                disabled={ordersLoading}
                className="p-3 bg-slate-900 border border-white/5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-50 transition-all flex items-center gap-2"
                title="Actualiser les commandes"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", ordersLoading && "animate-spin")} />
              </button>
            </div>

            {/* Orders Content Area */}
            {ordersError && (
              <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-3xl flex items-start gap-4 text-red-400 text-xs">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-black uppercase tracking-wider mb-1">Erreur de Connexion WooCommerce</h5>
                  <p>{ordersError}</p>
                </div>
              </div>
            )}

            {ordersLoading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem]">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Extraction des commandes en cours...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center p-8 text-center bg-[#0c0e14] border border-[#1a1b25] rounded-[2.5rem] mt-4 opacity-50">
                <ShoppingBag className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aucune commande trouvée correspondant à ce statut</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Orders List Table (2 Columns Span) */}
                <div className="lg:col-span-2 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5" /> Dernières Commandes ({orders.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-600 text-[8px] font-black uppercase tracking-[0.2em]">
                          <th className="p-6 pl-8">Commande</th>
                          <th className="p-6">Client</th>
                          <th className="p-6">Date</th>
                          <th className="p-6">Statut</th>
                          <th className="p-6 pr-8 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40">
                        {orders.map((o: any) => {
                          const customerName = `${o.billing?.first_name || ''} ${o.billing?.last_name || ''}`.trim() || o.billing?.email || 'Client Anonyme';
                          const itemsCount = o.line_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                          const dateObj = new Date(o.date_created);
                          const dateStr = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          const statusKey = o.status || 'default';
                          const isSelected = selectedOrder?.id === o.id;

                          return (
                            <tr 
                              key={o.id} 
                              onClick={() => setSelectedOrder(o)}
                              className={cn(
                                "group cursor-pointer hover:bg-slate-900/40 transition-all text-xs border-l-2",
                                isSelected ? "border-purple-600 bg-purple-500/5" : "border-transparent text-slate-350"
                              )}
                              id={`order-row-${o.id}`}
                            >
                              <td className="p-6 pl-8">
                                <div className="font-black text-white group-hover:text-purple-400 transition-colors">#{o.number || o.id}</div>
                                <div className="text-[9px] font-semibold text-slate-600 mt-1">{itemsCount} article(s)</div>
                              </td>
                              <td className="p-6">
                                <span className="font-extrabold text-white/95 block">{customerName}</span>
                                <span className="font-mono text-[9px] font-bold text-slate-600 mt-0.5 block">{o.billing?.email || 'Pas d’email'}</span>
                              </td>
                              <td className="p-6 text-slate-500 font-semibold">{dateStr}</td>
                              <td className="p-6">
                                <span className={cn(
                                  "inline-flex border px-3 py-1 rounded-xl text-[7.5px] font-black uppercase tracking-wider",
                                  statusColors[statusKey] || statusColors['default']
                                )}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-6 pr-8 text-right text-white font-mono font-black">
                                {Number(o.total).toFixed(2)} {o.currency || '€'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Details Panel */}
                <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pb-4 border-b border-white/5 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" /> Fiche Commande
                  </h3>

                  {selectedOrder ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-black text-white uppercase tracking-tighter">CMD #{selectedOrder.number}</h4>
                          <p className="text-[9px] font-bold text-slate-500 mt-1">Date: {new Date(selectedOrder.date_created).toLocaleString()}</p>
                        </div>
                        <span className={cn(
                          "border px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest",
                          statusColors[selectedOrder.status] || statusColors['default']
                        )}>
                          {selectedOrder.status}
                        </span>
                      </div>

                      {/* Customer Summary Card */}
                      <div className="p-5 bg-slate-950/60 border border-[#1d202d] rounded-2xl space-y-3">
                        <span className="text-[8px] font-black text-purple-400 tracking-wider uppercase block">Client et Coordonnées</span>
                        <div className="text-xs space-y-1">
                          <p className="font-extrabold text-white">{selectedOrder.billing?.first_name} {selectedOrder.billing?.last_name}</p>
                          <p className="font-serif italic text-slate-400 opacity-80">{selectedOrder.billing?.email}</p>
                          <p className="text-[10px] text-slate-500">{selectedOrder.billing?.phone || 'Aucun téléphone'}</p>
                        </div>
                        
                        {/* Address (Country Added) */}
                        <div className="border-t border-slate-900 pt-3 text-[10px] text-slate-500 space-y-1">
                          <p><strong className="text-slate-400">Adresse:</strong> {selectedOrder.billing?.address_1 || 'N/A'}, {selectedOrder.billing?.city || 'N/A'}</p>
                          <p><strong className="text-slate-400">Pays de Livraison:</strong> {selectedOrder.billing?.country || 'France'}</p>
                        </div>
                      </div>

                      {/* Products list detail */}
                      <div className="space-y-3">
                        <span className="text-[8px] font-black text-indigo-400 tracking-wider uppercase block">Détails Panier</span>
                        <div className="divide-y divide-slate-900/50 space-y-2">
                          {selectedOrder.line_items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs py-2">
                              <div>
                                <p className="font-extrabold text-white">{item.name}</p>
                                <p className="text-[9px] font-bold text-slate-600 mt-0.5 font-mono">Qté: {item.quantity} × {Number(item.price).toFixed(2)}</p>
                              </div>
                              <span className="font-mono text-white/90 font-black">{Number(item.total).toFixed(2)} {selectedOrder.currency || '€'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-900 flex justify-between items-end font-mono">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Montant Total</span>
                        <span className="text-xl font-black text-purple-400">{Number(selectedOrder.total).toFixed(2)} {selectedOrder.currency || '€'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 opacity-30 border border-dashed border-slate-800 rounded-3xl">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-600 mb-3" />
                      <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Veuillez sélectionner une commande dans le tableau pour afficher ses détails physiques</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </motion.div>
        )}

        {/* SECTION 2: MAILING LISTS & CAMPAIGNS */}
        {activeTab === 'lists' && (
          <motion.div 
            key="lists-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10"
          >
            {/* Action Bar for Lists */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0c0e14] border border-slate-800 p-8 rounded-[2.5rem]">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Vos Listes de Diffusion</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Créez des segments d'abonnés et diffusez votre promotion WooCommerce en 1 clic</p>
              </div>
              <button 
                onClick={() => setIsCreateListOpen(true)}
                className="bg-purple-600 text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2"
                id="btn-new-mailing-list"
              >
                <PlusCircle className="w-4 h-4" /> NOVELLE LISTE DE DIFFUSION
              </button>
            </div>

            {/* Grid of Firestore Lists */}
            {listsError && (
              <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-3xl text-red-400 text-xs">
                {listsError}
              </div>
            )}

            {listsLoading ? (
              <div className="h-48 flex items-center justify-center space-x-2 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem]">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Chargement de Firestore...</span>
              </div>
            ) : mailingLists.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-slate-800 rounded-[2.5rem] bg-[#0c0e14] opacity-40">
                <Users className="w-12 h-12 mx-auto text-slate-600 mb-4 animate-pulse" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Aucune liste de diffusion créée</h4>
                <p className="text-[10px] text-slate-500">Créez votre première liste et connectez vos clients WooCommerce dès maintenant !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mailingLists.map((list) => {
                  return (
                    <div 
                      key={list.id} 
                      className="bg-[#0c0e14] border border-slate-800 hover:border-purple-500/30 rounded-[2.5rem] p-8 space-y-6 flex flex-col justify-between transition-all group shadow-xl"
                      id={`list-card-${list.id}`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                            <Users className="w-5 h-5 text-purple-400" />
                          </div>
                          <span className="px-3 py-1 bg-indigo-505/10 bg-slate-900 text-indigo-400 border border-slate-800 rounded-lg text-[8px] font-black uppercase tracking-wider">
                            {list.contacts?.length || 0} abonnés
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase group-hover:text-purple-400 transition-all">{list.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-2 font-medium">{list.description || 'Aucune description fournie.'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-6 border-t border-slate-900/60">
                        <button 
                          onClick={() => {
                            setSelectedListForCampaign(list);
                            setIsCampaignOpen(true);
                          }}
                          className="flex-1 py-3 bg-purple-600 text-white hover:bg-purple-500 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-900/25"
                          id={`list-campaign-btn-${list.id}`}
                        >
                          <Send className="w-3 h-3" /> Envoyer Campagne
                        </button>
                        <button 
                          onClick={() => handleDeleteMailingList(list.id)}
                          className="p-3 bg-red-600/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          title="Supprimer la liste"
                          id={`list-delete-btn-${list.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CREATION MODAL FOR MAILING LISTS (COMPOUND EXTRACTOR) --- */}
      <AnimatePresence>
        {isCreateListOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] w-full max-w-4xl p-10 max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl relative"
            >
              {/* Top Close */}
              <button 
                onClick={() => setIsCreateListOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white text-xs font-black"
              >
                ✕ Fermer
              </button>

              <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Nouveau Segment de Diffusion</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Saisie de la configuration et liaison avec vos clients WooCommerce</p>
                </div>

                <form onSubmit={handleSaveMailingList} className="space-y-6">
                  {/* Title and description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de la Liste</label>
                      <input 
                        required
                        type="text" 
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Ex : Clients VIP France" 
                        className="w-full bg-black/40 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                      <input 
                        type="text" 
                        value={newListDesc}
                        onChange={(e) => setNewListDesc(e.target.value)}
                        placeholder="Ex : Clients qui ont commandé au moins une fois" 
                        className="w-full bg-black/40 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700" 
                      />
                    </div>
                  </div>

                  {/* Customer extraction segment */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-3 border-b border-white/5">
                      <div>
                        <span className="text-[8px] font-black text-indigo-400 tracking-wider uppercase block">Sélecteur de Clients WooCommerce</span>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Cochez ou supprimez les clients pour structurer la dffusion</p>
                      </div>

                      {/* Client search bar */}
                      <div className="flex items-center gap-2 bg-black/50 border border-slate-850 px-4 py-2 rounded-xl w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Chercher par nom, email..."
                          value={searchCustomerQuery}
                          onChange={(e) => setSearchCustomerQuery(e.target.value)}
                          className="w-full bg-transparent border-none text-[10px] text-white outline-none placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    {wooCustomersLoading ? (
                      <div className="h-48 flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Extraction de la liste physique des clients WooCommerce...</p>
                      </div>
                    ) : wooCustomersError ? (
                      <div className="p-6 bg-red-950/20 text-red-400 text-xs border border-red-500/20 rounded-2xl">
                        {wooCustomersError}
                      </div>
                    ) : filteredWooCustomers.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 border border-slate-850 rounded-2xl">
                        Aucun client WooCommerce ne correspond à ce filtre
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Selector Controls */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerEmails(filteredWooCustomers.map(c => c.email))}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-[8px] font-black text-white uppercase tracking-wider rounded-lg transition-all"
                          >
                            Sélectionner Tout ({filteredWooCustomers.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerEmails([])}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-[8px] font-black text-red-400 uppercase tracking-wider rounded-lg transition-all"
                          >
                            Désélectionner Tout
                          </button>
                        </div>

                        {/* Customer Item List Scrollable */}
                        <div className="border border-slate-850 rounded-2xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                          <table className="w-full text-left font-sans text-xs">
                            <thead className="bg-[#04060b] text-[8px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-850">
                              <tr>
                                <th className="p-4 px-6 text-center w-12">Select</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Email</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850/30">
                              {filteredWooCustomers.map((c) => {
                                const isChecked = selectedCustomerEmails.includes(c.email);
                                return (
                                  <tr 
                                    key={c.id} 
                                    onClick={() => {
                                      if (isChecked) {
                                        setSelectedCustomerEmails(selectedCustomerEmails.filter(e => e !== c.email));
                                      } else {
                                        setSelectedCustomerEmails([...selectedCustomerEmails, c.email]);
                                      }
                                    }}
                                    className="hover:bg-slate-900/40 cursor-pointer transition-all"
                                  >
                                    <td className="p-4 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={isChecked}
                                        onChange={() => {}} // Controlled via row click
                                        className="accent-purple-600 w-3.5 h-3.5 bg-black border-slate-800"
                                      />
                                    </td>
                                    <td className="p-4 font-extrabold text-white">{c.full_name}</td>
                                    <td className="p-4 text-slate-400 font-mono text-[10px]">{c.email}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission Action */}
                  <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      {selectedCustomerEmails.length} client(s) sélectionné(s)
                    </span>
                    <button 
                      type="submit"
                      disabled={selectedCustomerEmails.length === 0}
                      className="bg-purple-605 bg-purple-600 text-white hover:bg-purple-500 px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-900/30"
                    >
                      Enregistrer la liste ({selectedCustomerEmails.length})
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CAMPAIGN COMPOSER MODAL (PUBLIPOSTAGE) --- */}
      <AnimatePresence>
        {isCampaignOpen && selectedListForCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] w-full max-w-4xl p-10 max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setIsCampaignOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white text-xs font-black outline-none"
              >
                ✕ Fermer
              </button>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-6 custom-scrollbar">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Lancer un Publipostage</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    Cibles : Liste <span className="text-purple-400 font-extrabold">"{selectedListForCampaign.name}"</span> ({selectedListForCampaign.contacts?.length} destinataires)
                  </p>
                </div>

                {campaignSuccess && (
                  <div className="p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{campaignSuccess}</span>
                  </div>
                )}

                {campaignError && (
                  <div className="p-6 bg-red-950/20 border border-red-500/50 rounded-2xl text-red-400 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{campaignError}</span>
                  </div>
                )}

                <form onSubmit={handleSendCampaign} className="space-y-6">
                  
                  {/* Template selector helper */}
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Importer une Template Mémorisée (Optionnel)</label>
                    <div className="relative">
                      <select 
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full bg-black/40 border border-slate-850 text-xs text-slate-300 rounded-2xl px-6 py-4 outline-none appearance-none"
                      >
                        <option value="">Sélectionner une template...</option>
                        {templates.map(tpl => (
                          <option key={tpl.id} value={String(tpl.id)}>{tpl.name} - ({tpl.category})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Campaign Subject */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mr-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Objet de la Campagne d'Emailing</label>
                      <span className="text-[8px] font-mono text-slate-500">Variables supportées : <strong className="text-purple-400">{"{{nom}}"}</strong>, <strong className="text-purple-400">{"{{prenom}}"}</strong></span>
                    </div>
                    <input 
                      required
                      type="text" 
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      placeholder="Ex : Bonjour {{prenom}}, profitez de notre offre spéciale !"
                      className="w-full bg-black/40 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  {/* Campaign Body Editor (HTML Template syntax) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mr-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Corps du Message (HTML)</label>
                      <span className="text-[8px] font-mono text-purple-400 font-extrabold pb-0.5 border-b border-purple-500/20">Modèle Fusion (Publipostage) Actif</span>
                    </div>
                    
                    <textarea 
                      required
                      value={campaignBody}
                      onChange={(e) => setCampaignBody(e.target.value)}
                      placeholder="Contenu HTML de l'e-mail..."
                      className="w-full h-64 bg-black/40 border border-slate-800 rounded-[2rem] p-6 text-[11px] font-mono text-slate-300 focus:border-purple-500 outline-none transition-all resize-none"
                    />

                    {/* Quick guidance banner */}
                    <div className="bg-purple-950/10 border border-purple-500/10 p-4 rounded-xl text-[10px] text-purple-400 leading-relaxed space-y-1">
                      <p><span className="font-bold">⚠️ Astuce de Publipostage :</span> Insérez <strong className="font-black bg-purple-500/20 px-1 py-0.5 rounded">{"{{prenom}}"}</strong> et <strong className="font-black bg-purple-500/20 px-1 py-0.5 rounded">{"{{nom}}"}</strong> directement dans l'éditeur. Le serveur les remplacera automatiquement par le prénom et le nom de chaque client lors de l'envoi.</p>
                      <p>Exemple : <span className="italic">"Bonjour {"{{prenom}}"} {"{{nom}}"}, nous avons déniché un ebook fait pour vous !"</span></p>
                    </div>
                  </div>

                  {/* Submit button with loaders */}
                  <div className="pt-6 border-t border-white/5 flex justify-end items-center">
                    <button 
                      type="submit"
                      disabled={campaignSending}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-black px-10 py-4 rounded-xl text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50 flex items-center gap-3"
                      id="launch-publipostage-btn"
                    >
                      {campaignSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          EXPÉDITION EN COURS...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          LANCER LA FUSION & EXPÉDIER !
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
