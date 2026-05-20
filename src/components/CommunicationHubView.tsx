import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Settings as SettingsIcon, 
  Zap, 
  BarChart3, 
  Plus, 
  Bot, 
  Clock, 
  Save,
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Layout,
  History,
  Copy,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Eye,
  Lock,
  Unlock,
  Inbox,
  User,
  Archive,
  Search,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../providers/FirebaseProvider';
import { cn } from '../lib/utils';
import Sparkline from './Sparkline';
import { geminiQuery } from '../lib/gemini';
import { firebaseService } from '../services/firebaseService';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

type Tab = 'inbox' | 'analytics' | 'automations' | 'templates' | 'settings';

interface Message {
  id: string;
  sender_email: string;
  sender_name?: string;
  recipient_email?: string;
  subject: string;
  body: string;
  created_at: any;
  status: 'unread' | 'read' | 'archived';
  site_url?: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body_html: string;
  category: string;
  brand_color?: string;
  accent_color?: string;
  is_ai_generated: number;
}

interface AutomationRule {
  id: number;
  name: string;
  description: string;
  trigger_key: string;
  scope: string;
  is_active: number;
  template_id: number;
}

interface SmtpSettings {
  host: string;
  port: number;
  secure: number;
  auth_user: string;
  auth_pass: string;
  from_name: string;
  from_email: string;
}

interface ImapSettings {
  host: string;
  port: number;
  secure: number;
  auth_user: string;
  auth_pass: string;
}

export default function CommunicationHubView() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab ] = useState<Tab>('inbox');
  
  // Inbox State
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>({
    host: '',
    port: 587,
    secure: 0,
    auth_user: '',
    auth_pass: '',
    from_name: '',
    from_email: ''
  });
  const [imapSettings, setImapSettings] = useState<ImapSettings>({
    host: '',
    port: 993,
    secure: 1,
    auth_user: '',
    auth_pass: ''
  });
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isTestingImap, setIsTestingImap] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [imapStatus, setImapStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSyncingImap, setIsSyncingImap] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isAiComposing, setIsAiComposing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<{name: string, subject: string, body: string} | null>(null);
  
  // Manual Template Creation/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'code' | 'preview'>('code');
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formTemplate, setFormTemplate] = useState({ name: '', subject: '', body_html: '', brand_color: '#00ff66', accent_color: '#000000' });
  const [isSaving, setIsSaving] = useState(false);

  // Rules State
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [formRule, setFormRule] = useState({ name: '', description: '', trigger_key: '', scope: '', template_id: 0 });
  const [isSavingRule, setIsSavingRule] = useState(false);

  // Quick Reply State
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.email) return;

    fetchSettings();
    fetchTemplates();
    fetchAnalytics();
    fetchRules();

    const isAdmin = user.email.toLowerCase() === 'ziedbenmiled3@gmail.com';
    let unsubscribeInbox: (() => void) | undefined;
    let unsubscribeSent: (() => void) | undefined;

    try {
      setIsLoadingMessages(true);
      
      // 1. Inbox/Archived query
      let q;
      if (activeFolder === 'inbox') {
        q = isAdmin 
          ? query(collection(db, 'messages'), where('status', '!=', 'archived'), orderBy('status'), orderBy('created_at', 'desc'))
          : query(collection(db, 'messages'), where('recipient_email', '==', user.email.toLowerCase()), where('status', '!=', 'archived'), orderBy('status'), orderBy('created_at', 'desc'));
      } else if (activeFolder === 'archived') {
        q = isAdmin 
          ? query(collection(db, 'messages'), where('status', '==', 'archived'), orderBy('created_at', 'desc'))
          : query(collection(db, 'messages'), where('recipient_email', '==', user.email.toLowerCase()), where('status', '==', 'archived'), orderBy('created_at', 'desc'));
      }

      if (q) {
        unsubscribeInbox = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
          setMessages(msgs);
          setIsLoadingMessages(false);
        }, (err) => {
          console.error('Inbox query error:', err);
          setIsLoadingMessages(false);
        });
      }

      // 2. Sent query (always listen to update the 'sent' count if needed, or only if activeFolder === 'sent')
      const sq = isAdmin
        ? query(collection(db, 'sent_messages'), orderBy('created_at', 'desc'))
        : query(collection(db, 'sent_messages'), where('user_email', '==', user.email.toLowerCase()), orderBy('created_at', 'desc'));

      unsubscribeSent = onSnapshot(sq, (snapshot) => {
        const smsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSentMessages(smsgs);
        if (activeFolder === 'sent') setIsLoadingMessages(false);
      });

    } catch (err) {
      console.error('Firestore subscription error:', err);
      setIsLoadingMessages(false);
    }

    return () => {
      if (unsubscribeInbox) unsubscribeInbox();
      if (unsubscribeSent) unsubscribeSent();
    };
  }, [user?.email, activeFolder]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/comm/settings', { headers: { 'x-user-email': user?.email } });
      if (res.data.smtp && Object.keys(res.data.smtp).length > 0) setSmtpSettings(res.data.smtp);
      if (res.data.imap && Object.keys(res.data.imap).length > 0) setImapSettings(res.data.imap);
    } catch (err) { console.error('Fetch settings error:', err); }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/comm/templates', { headers: { 'x-user-email': user?.email } });
      setTemplates(res.data);
    } catch (err) { console.error('Fetch templates error:', err); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/comm/analytics', { headers: { 'x-user-email': user?.email } });
      setAnalytics(res.data);
    } catch (err) { console.error('Fetch analytics error:', err); }
  };

  const fetchRules = async () => {
    try {
      const res = await axios.get('/api/comm/rules', { headers: { 'x-user-email': user?.email } });
      setRules(res.data);
    } catch (err) { console.error('Fetch rules error:', err); }
  };

  const handleSaveSettings = async () => {
    setIsSavingSmtp(true);
    setSaveStatus('idle');
    try {
      await axios.post('/api/comm/settings', { smtp: smtpSettings, imap: imapSettings }, { headers: { 'x-user-email': user?.email } });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } catch (err) { 
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestConnection = async (type: 'smtp' | 'imap') => {
    if (type === 'smtp') setIsTestingSmtp(true); else setIsTestingImap(true);
    if (type === 'smtp') setSmtpStatus('idle'); else setImapStatus('idle');

    try {
      const config = type === 'smtp' ? smtpSettings : imapSettings;
      await axios.post('/api/comm/test-connection', { ...config, type }, { headers: { 'x-user-email': user?.email } });
      if (type === 'smtp') setSmtpStatus('success'); else setImapStatus('success');
    } catch (err) {
      if (type === 'smtp') setSmtpStatus('error'); else setImapStatus('error');
    } finally {
      if (type === 'smtp') setIsTestingSmtp(false); else setIsTestingImap(false);
    }
  };

  const handleImapSync = async () => {
    try {
      alert('Tentative de connexion au serveur IMAP...');
      setIsSyncingImap(true);
      console.log('Calling /api/imap/sync with user email:', user?.email);
      const res = await axios.post('/api/imap/sync', {}, { headers: { 'x-user-email': user?.email } });
      
      if (res.data.success) {
        alert(`Synchronisation réussie !\n\nTotal e-mails: ${res.data.count || 0}\nEnregistrés: ${res.data.saved || 0}\nÉchecs: ${res.data.failed || 0}`);
      } else {
        alert('Le serveur a terminé la tâche mais n\'a pas renvoyé de confirmation de succès.');
      }
    } catch (err: any) {
      console.error('IMAP sync error:', err);
      const errorMsg = err.response?.data?.error || err.message;
      alert('Échec de la synchronisation !\n\nErreur : ' + errorMsg);
    } finally {
      setIsSyncingImap(false);
    }
  };

  const handleAiCompose = async () => {
    if (!aiPrompt) return;
    setIsAiComposing(true);
    try {
      const isSuperAdmin = user?.email?.toLowerCase() === 'ziedbenmiled3@gmail.com';
      const brandContext = `COULEURS DE MARQUE: Primaire=${formTemplate.brand_color}, Accent=${formTemplate.accent_color}`;
      
      const systemPrompt = isSuperAdmin 
        ? `Vous êtes l'assistant Nexus AI. Rédigez un email professionnel pour les clients de la plateforme SaaS Nexus. Utilisez le ton 'High-Tech' et 'Cyber'. ${brandContext}. Répondez en JSON avec: { 'name': 'Nom de la template', 'subject': 'Objet', 'body': 'Contenu HTML' }`
        : `Vous êtes l'assistant Nexus AI pour WooCommerce. Rédigez un email marketing/opérationnel pour les clients d'une boutique en ligne. ${brandContext}. Répondez en JSON avec: { 'name': 'Template Name', 'subject': 'Subject', 'body': 'HTML Content' }`;
      
      const res = await geminiQuery({
        model: "gemini-3-flash-preview",
        prompt: `Rédigez une template d'email basée sur ceci: ${aiPrompt}. Utilisez des placeholders comme {{user_name}} ou {{order_id}}. Appliquez les couleurs de marque dans le CSS inline du HTML.`,
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      });

      const parsed = JSON.parse(res.data.text);
      setGeneratedTemplate(parsed);
    } catch (err) {
      console.error('AI Composing error:', err);
    } finally {
      setIsAiComposing(false);
    }
  };

  const saveGeneratedTemplate = async () => {
    if (!generatedTemplate) return;
    try {
      await axios.post('/api/comm/templates', {
        name: generatedTemplate.name,
        subject: generatedTemplate.subject,
        body_html: generatedTemplate.body,
        category: (user?.email?.toLowerCase() === 'ziedbenmiled3@gmail.com') ? 'saas' : 'woo',
        brand_color: formTemplate.brand_color,
        accent_color: formTemplate.accent_color,
        is_ai_generated: 1
      }, { headers: { 'x-user-email': user?.email } });
      setGeneratedTemplate(null);
      setAiPrompt('');
      fetchTemplates();
    } catch (err) { alert('Erreur lors de la sauvegarde.'); }
  };

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormTemplate({ name: '', subject: '', body_html: '', brand_color: '#00ff66', accent_color: '#000000' });
    setModalMode('code');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setFormTemplate({ 
      name: tpl.name, 
      subject: tpl.subject, 
      body_html: tpl.body_html,
      brand_color: tpl.brand_color || '#00ff66',
      accent_color: tpl.accent_color || '#000000'
    });
    setModalMode('code');
    setIsModalOpen(true);
  };

  const handleSaveManualTemplate = async () => {
    if (!formTemplate.name || !formTemplate.subject || !formTemplate.body_html) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingTemplate) {
        // Update
        await axios.put(`/api/comm/templates/${editingTemplate.id}`, {
          ...formTemplate,
          category: editingTemplate.category,
          is_ai_generated: editingTemplate.is_ai_generated
        }, { headers: { 'x-user-email': user?.email } });
      } else {
        // Create
        await axios.post('/api/comm/templates', {
          ...formTemplate,
          category: (user?.email?.toLowerCase() === 'ziedbenmiled3@gmail.com') ? 'saas' : 'woo',
          is_ai_generated: 0
        }, { headers: { 'x-user-email': user?.email } });
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      alert('Erreur lors de l’enregistrement.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Supprimer cette template ?')) return;
    try {
      await axios.delete(`/api/comm/templates/${id}`, { headers: { 'x-user-email': user?.email } });
      fetchTemplates();
    } catch (err: any) { 
      console.error('Delete template error:', err);
      alert(`Erreur lors de la suppression: ${err.response?.data?.error || err.message}`); 
    }
  };

  const handleToggleRule = async (ruleId: number, currentStatus: number) => {
    try {
      await axios.patch(`/api/comm/rules/${ruleId}/toggle`, { is_active: currentStatus === 1 ? 0 : 1 }, {
        headers: { 'x-user-email': user?.email }
      });
      fetchRules();
    } catch (err) { alert('Erreur lors du changement de statut.'); }
  };

  const handleSaveRule = async () => {
    if (!formRule.name || !formRule.trigger_key || !formRule.template_id) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }
    setIsSavingRule(true);
    try {
      await axios.post('/api/comm/rules', {
        ...formRule,
        scope: user?.email?.toLowerCase() === 'ziedbenmiled3@gmail.com' ? 'saas' : 'woo'
      }, { headers: { 'x-user-email': user?.email } });
      setIsRuleModalOpen(false);
      fetchRules();
    } catch (err) { alert('Erreur lors de l’enregistrement.'); }
    finally { setIsSavingRule(false); }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Supprimer cette règle ?')) return;
    try {
      await axios.delete(`/api/comm/rules/${id}`, { headers: { 'x-user-email': user?.email } });
      fetchRules();
    } catch (err) { alert('Erreur lors de la suppression.'); }
  };

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      firebaseService.markMessageRead(msg.id);
    }
  };

  const handleArchiveMessage = async (id: string) => {
    try {
      const collectionName = activeFolder === 'sent' ? 'sent_messages' : 'messages';
      await firebaseService.archiveMessage(id, collectionName);
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      console.error('Archive error:', err);
    }
  };

  const handleDeleteMessage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer ce message ?')) return;
    try {
      const collectionName = activeFolder === 'sent' ? 'sent_messages' : 'messages';
      await firebaseService.deleteMessage(id, collectionName);
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Erreur lors de la suppression du message: ${err.message}`);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      await axios.post('/api/comm/send', {
        recipient: selectedMessage.sender_email,
        subject: `Re: ${selectedMessage.subject}`,
        body_html: replyText.replace(/\n/g, '<br>')
      }, { headers: { 'x-user-email': user?.email } });
      
      alert('Message envoyé avec succès !');
      setReplyText('');
    } catch (err: any) {
      console.error('Send reply error:', err);
      alert('Échec de l’envoi : ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSendingReply(false);
    }
  };

  const currentMessages = activeFolder === 'inbox' ? messages : sentMessages;

  const filteredMessages = currentMessages.filter(m => {
    const s = searchQuery.toLowerCase();
    const subject = (m.subject || '').toLowerCase();
    const senderName = (m.sender_name || '').toLowerCase();
    const senderEmail = (m.sender_email || '').toLowerCase();
    
    return subject.includes(s) || 
           senderName.includes(s) || 
           senderEmail.includes(s);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Nexus <span className="text-purple-500">Comm</span> Hub</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-1">Système de Communication Multi-Tenant & Smart Templates</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950/80 border border-white/5 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
            {[
              { id: 'inbox', label: 'INBOX', icon: Inbox, count: messages.filter(m => m.status === 'unread').length },
              { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
              { id: 'templates', label: 'TEMPLATES', icon: Layout },
              { id: 'automations', label: 'AUTOMATIONS', icon: Zap },
              { id: 'settings', label: 'SMTP CONFIG', icon: SettingsIcon },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative",
                  activeTab === tab.id ? "bg-purple-600 text-white shadow-xl shadow-purple-900/40" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === 'inbox' && tab.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] flex items-center justify-center rounded-full shadow-lg border border-[#02040a]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {user?.email?.toLowerCase() === 'ziedbenmiled3@gmail.com' && activeTab === 'inbox' && (
            <button 
              onClick={handleImapSync}
              disabled={isSyncingImap}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncingImap && "animate-spin")} />
              {isSyncingImap ? 'SYNC...' : 'SYNCHRONISER'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'inbox' && (
          <motion.div 
            key="inbox"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[700px]"
          >
            {/* Sidebar Inbox: Message List */}
            <div className="md:col-span-4 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden">
               <div className="p-6 border-b border-white/5 bg-slate-950/40">
                  <div className="flex items-center gap-2 mb-6 p-1 bg-black border border-white/5 rounded-2xl">
                     <button 
                        onClick={() => setActiveFolder('inbox')}
                        className={cn(
                           "flex-1 py-3 text-[8px] font-black uppercase tracking-tight rounded-xl transition-all",
                           activeFolder === 'inbox' ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "text-slate-500 hover:text-slate-300"
                        )}
                     >
                        Inbox
                     </button>
                     <button 
                        onClick={() => setActiveFolder('sent')}
                        className={cn(
                           "flex-1 py-3 text-[8px] font-black uppercase tracking-tight rounded-xl transition-all",
                           activeFolder === 'sent' ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "text-slate-500 hover:text-slate-300"
                        )}
                     >
                        Envoyés
                     </button>
                     <button 
                        onClick={() => setActiveFolder('archived')}
                        className={cn(
                           "flex-1 py-3 text-[8px] font-black uppercase tracking-tight rounded-xl transition-all",
                           activeFolder === 'archived' ? "bg-slate-800 text-white shadow-lg shadow-slate-900/40" : "text-slate-500 hover:text-slate-300"
                        )}
                     >
                        Archive
                     </button>
                  </div>
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                     <input 
                       value={searchQuery || ''}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Rechercher un client..."
                       className="w-full bg-black border border-slate-800 rounded-2xl pl-12 pr-6 py-3 text-[10px] text-slate-300 font-bold uppercase tracking-widest focus:border-purple-500/50 outline-none transition-all"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {isLoadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                       <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Calcul du flux Nexus...</p>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4 text-center p-10">
                       <Inbox className="w-10 h-10" />
                       <p className="text-[10px] font-black uppercase tracking-widest">
                          {activeFolder === 'sent' ? 'Aucun message envoyé' : 'Boîte de réception vide'}
                       </p>
                    </div>
                  ) : filteredMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={cn(
                        "w-full p-6 rounded-3xl border text-left transition-all relative group cursor-pointer",
                        selectedMessage?.id === msg.id 
                          ? "bg-purple-600 text-white border-purple-500 shadow-xl shadow-purple-900/40" 
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-600"
                      )}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                             <div className={cn("w-2 h-2 rounded-full", msg.status === 'unread' ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-transparent")} />
                             <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedMessage?.id === msg.id ? "text-white" : "text-slate-300")}>
                               {activeFolder === 'sent' ? `À: ${msg.recipient_email}` : msg.sender_name}
                             </span>
                          </div>
                          <span className={cn("text-[8px] font-bold uppercase opacity-60", selectedMessage?.id === msg.id ? "text-white" : "text-slate-500")}>
                             {msg.created_at?.toDate ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(msg.created_at.toDate()) : 'Now'}
                          </span>
                       </div>
                       <p className={cn("text-[9px] font-bold uppercase tracking-tight truncate mb-1", selectedMessage?.id === msg.id ? "text-white" : "text-white/80")}>
                         {msg.subject}
                       </p>
                       <p className={cn("text-[8px] font-medium leading-relaxed truncate opacity-60", selectedMessage?.id === msg.id ? "text-white/70" : "text-slate-500")}>
                         {msg.body}
                       </p>

                       <button 
                         onClick={(e) => handleDeleteMessage(msg.id, e)}
                         className="absolute top-1/2 -translate-y-1/2 right-4 p-3 opacity-0 group-hover:opacity-100 transition-all bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl z-20"
                         title="Supprimer"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            {/* Reading Pane */}
            <div className="md:col-span-8 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] flex flex-col relative overflow-hidden">
               {selectedMessage ? (
                 <div className="h-full flex flex-col">
                    {/* Message Header */}
                    <div className="p-10 border-b border-white/5 bg-slate-950/20">
                       <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                                <User className="w-6 h-6 text-white" />
                             </div>
                              <div>
                                 <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                    {activeFolder === 'sent' ? `À: ${selectedMessage.recipient_email || 'Utilisateur'}` : selectedMessage.sender_name}
                                 </h4>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {activeFolder === 'sent' ? `Expéditeur: ${selectedMessage.sender_email}` : selectedMessage.sender_email}
                                 </p>
                              </div>
                          </div>
                          <div className="flex gap-3">
                             <button 
                               onClick={() => handleArchiveMessage(selectedMessage.id)}
                               className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"
                             >
                                <Archive className="w-5 h-5" />
                             </button>
                             <button 
                               onClick={(e) => handleDeleteMessage(selectedMessage.id, e as any)}
                               className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"
                             >
                                <Trash2 className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap items-center gap-4">
                          <div className="px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-xl text-[9px] font-black text-purple-500 uppercase tracking-widest">
                             Sujet: {selectedMessage.subject}
                          </div>
                          {selectedMessage.site_url && (
                             <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <SettingsIcon className="w-3 h-3" /> Origin: {selectedMessage.site_url}
                             </div>
                          )}
                          <div className="px-4 py-2 bg-slate-900/50 border border-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">
                             {selectedMessage.created_at?.toDate ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(selectedMessage.created_at.toDate()) : 'Récemment'}
                          </div>
                       </div>
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-black/20">
                       <div className="max-w-2xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                         {selectedMessage.body}
                       </div>
                    </div>

                    {/* Quick Reply Bar */}
                    <div className="p-8 border-t border-white/5 bg-slate-950/40">
                       <div className="flex gap-4">
                          <input 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                            placeholder="Écrire une réponse rapide..."
                            className="flex-1 bg-black border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-slate-300 focus:border-purple-500 transition-all outline-none"
                            disabled={isSendingReply}
                          />
                          <button 
                            onClick={handleSendReply}
                            disabled={isSendingReply || !replyText.trim()}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-purple-900/20 disabled:opacity-50"
                          >
                             {isSendingReply ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                             {isSendingReply ? 'ENVOI...' : 'Répondre'}
                          </button>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full opacity-20 text-center gap-6 p-20">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center">
                       <Mail className="w-10 h-10" />
                    </div>
                    <div>
                       <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-2">Sélectionnez un message</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                         Visualisez et gérez les communications de vos clients Nexus en temps réel.
                       </p>
                    </div>
                 </div>
               )}

               {/* Background Glow */}
               <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Emails Envoyés</p>
                      <h3 className="text-3xl font-black text-white italic">{analytics.reduce((acc, curr) => acc + curr.sent, 0)}</h3>
                    </div>
                    <div className="p-3 bg-blue-600/10 rounded-xl">
                      <Send className="w-5 h-5 text-blue-500" />
                    </div>
                 </div>
                 <div className="h-16 w-full">
                    <Sparkline data={analytics.map(d => d.sent).reverse()} color="#3b82f6" height={60} />
                 </div>
              </div>

              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Taux d’Ouverture</p>
                      <h3 className="text-3xl font-black text-white italic">
                        {analytics.length > 0 ? ((analytics.reduce((acc, curr) => acc + curr.opened, 0) / analytics.reduce((acc, curr) => acc + curr.sent, 0)) * 100).toFixed(1) : 0}%
                      </h3>
                    </div>
                    <div className="p-3 bg-purple-600/10 rounded-xl">
                      <Eye className="w-5 h-5 text-purple-500" />
                    </div>
                 </div>
                 <div className="h-16 w-full">
                    <Sparkline data={analytics.map(d => d.opened).reverse()} color="#a855f7" height={60} />
                 </div>
              </div>

              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Deliverabilité</p>
                      <h3 className="text-3xl font-black text-white italic">99.2%</h3>
                    </div>
                    <div className="p-3 bg-emerald-600/10 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                 </div>
                 <div className="h-16 w-full">
                    <Sparkline data={[80, 85, 82, 90, 88, 92, 99]} color="#10b981" height={60} />
                 </div>
              </div>
            </div>

            <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <History className="w-4 h-4" /> Historique des Envois Récents
              </h3>
              <div className="space-y-3 opacity-40 py-10 text-center">
                 <Mail className="w-10 h-10 mx-auto text-slate-700" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Fonctionnalité d'historique détaillé en cours de déploiement</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div 
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* AI Composer */}
            <div className="bg-slate-950 border border-purple-500/30 rounded-[2.5rem] p-10 shadow-2xl shadow-purple-900/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Bot className="w-40 h-40 text-purple-500" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Bot className="w-6 h-6 text-purple-500" />
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Nexus AI Script Composer</h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <textarea 
                        value={aiPrompt || ''}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ex: Rédige un email de bienvenue pour mon nouveau pack Pro avec un coupon de 10%..."
                        className="w-full h-32 bg-black border border-slate-800 rounded-3xl p-6 text-[11px] text-slate-300 focus:border-purple-500 transition-all outline-none resize-none"
                      />
                      <button 
                        onClick={handleAiCompose}
                        disabled={isAiComposing || !aiPrompt}
                        className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-30 shadow-xl shadow-purple-900/40"
                      >
                        {isAiComposing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {isAiComposing ? 'ANALYSE & RÉDACTION AI...' : 'GÉNÉRER LA TEMPLATE'}
                      </button>
                    </div>

                    <div className="w-full md:w-96 min-h-[160px] bg-black/40 border border-slate-800 rounded-3xl p-6 relative overflow-y-auto max-h-64">
                       {generatedTemplate ? (
                         <div className="space-y-4">
                            <div>
                               <p className="text-[8px] font-bold text-purple-500 uppercase mb-1">Sujet Proposé</p>
                               <p className="text-[11px] font-black text-white">{generatedTemplate.subject}</p>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 text-[9px] text-slate-400 font-mono">
                               {generatedTemplate.body.substring(0, 200)}...
                            </div>
                            <button 
                              onClick={saveGeneratedTemplate}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                              ENREGISTRER CETTE TEMPLATE
                            </button>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full opacity-20 text-center py-10">
                            <Bot className="w-8 h-8 mb-2" />
                            <p className="text-[8px] font-black uppercase tracking-widest">En attente d'instruction</p>
                         </div>
                       )}
                    </div>
                  </div>
               </div>
            </div>

            {/* Template List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button 
                onClick={handleOpenCreateModal}
                className="bg-slate-950 border border-dashed border-slate-800 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 transition-all group"
              >
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-purple-600/10 transition-all">
                    <Plus className="w-6 h-6 text-slate-600 group-hover:text-purple-500" />
                 </div>
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">Créer Manuellement</p>
              </button>

              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-[#0c0e14] border border-slate-800 rounded-[2rem] p-8 group hover:border-purple-500/30 transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                         <Layout className="w-5 h-5 text-slate-500" />
                      </div>
                      {tpl.is_ai_generated === 1 && (
                        <div className="px-2 py-1 bg-purple-600/10 border border-purple-500/20 rounded-lg text-[7px] font-black text-purple-500 uppercase">AI Power</div>
                      )}
                   </div>
                   <h4 className="text-[11px] font-black text-white uppercase mb-1">{tpl.name}</h4>
                   <p className="text-[9px] font-bold text-slate-500 truncate mb-6">{tpl.subject}</p>
                   
                   <div className="flex items-center gap-2 pt-4 border-t border-white/5 transition-all">
                      <button 
                        onClick={() => handleOpenEditModal(tpl)}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-[8px] font-black text-white uppercase tracking-widest transition-all"
                      >
                        Editer
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'automations' && (
          <motion.div 
            key="automations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Zap className="w-4 h-4" /> Règles d’Automations Actives
                  </h3>
                  <button 
                    onClick={() => {
                      setFormRule({ name: '', description: '', trigger_key: '', scope: '', template_id: templates[0]?.id || 0 });
                      setIsRuleModalOpen(true);
                    }}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20"
                  >
                    NOUVELLE RÈGLE
                  </button>
               </div>

               <div className="space-y-4">
                  {rules.length === 0 && (
                    <div className="p-10 text-center opacity-20 border border-dashed border-slate-800 rounded-3xl">
                      <Zap className="w-10 h-10 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Aucune règle configurée</p>
                    </div>
                  )}
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-6 bg-slate-950/60 border border-slate-800 rounded-3xl hover:border-slate-700 transition-all group">
                       <div className="flex items-center gap-5">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", rule.is_active === 1 ? "bg-emerald-600/10 border-emerald-500/20" : "bg-slate-900 border-slate-800")}>
                             <Zap className={cn("w-6 h-6", rule.is_active === 1 ? "text-emerald-500" : "text-slate-700")} />
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-white uppercase tracking-tight">{rule.name}</p>
                             <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{rule.description || 'Action automatisée intelligente'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end">
                             <div className={cn(
                               "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest",
                               rule.scope === 'saas' ? "bg-blue-600/10 text-blue-500 border border-blue-500/20" : "bg-purple-600/10 text-purple-500 border border-purple-500/20"
                             )}>
                               {rule.scope === 'saas' ? 'SCOPE: NEXUS SAAS' : 'SCOPE: WOO STORE'}
                             </div>
                             <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">Trigger: {rule.trigger_key}</p>
                          </div>
                          <div 
                            onClick={() => handleToggleRule(rule.id, rule.is_active)}
                            className="w-10 h-6 bg-slate-950 border border-slate-800 rounded-full p-1 cursor-pointer"
                          >
                             <div className={cn("w-4 h-4 rounded-full transition-all", rule.is_active === 1 ? "bg-emerald-500 ml-4" : "bg-slate-700")} />
                          </div>
                          <button 
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 text-slate-800 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-8 space-y-8">
               {/* SMTP CONFIG */}
               <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                    <SettingsIcon className="w-4 h-4" /> Configuration Serveur SMTP (Envoi)
                  </h3>

                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Serveur SMTP Host</label>
                          <input 
                            value={smtpSettings.host || ''}
                            onChange={(e) => setSmtpSettings({...smtpSettings, host: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                            placeholder="smtp.example.com"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Port</label>
                          <input 
                            type="number"
                            value={smtpSettings.port || 587}
                            onChange={(e) => setSmtpSettings({...smtpSettings, port: parseInt(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                            placeholder="587"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Sécurité</label>
                          <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 gap-1">
                             <button 
                               onClick={() => setSmtpSettings({...smtpSettings, secure: 0})}
                               className={cn(
                                 "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                 smtpSettings.secure === 0 ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                               )}
                             >
                               <Unlock className="w-3 h-3" /> TLS
                             </button>
                             <button 
                               onClick={() => setSmtpSettings({...smtpSettings, secure: 1})}
                               className={cn(
                                 "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                 smtpSettings.secure === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-300"
                               )}
                             >
                               <Lock className="w-3 h-3" /> SSL
                             </button>
                          </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Utilisateur SMTP</label>
                          <input 
                            value={smtpSettings.auth_user || ''}
                            onChange={(e) => setSmtpSettings({...smtpSettings, auth_user: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                            placeholder="user@example.com"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Mot de Passe App</label>
                          <input 
                            type="password"
                            value={smtpSettings.auth_pass || ''}
                            onChange={(e) => setSmtpSettings({...smtpSettings, auth_pass: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••••••"
                          />
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Nom "Depuis"</label>
                          <input 
                            value={smtpSettings.from_name || ''}
                            onChange={(e) => setSmtpSettings({...smtpSettings, from_name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all"
                            placeholder="Ma Boutique Store"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Email "Depuis"</label>
                          <input 
                            value={smtpSettings.from_email || ''}
                            onChange={(e) => setSmtpSettings({...smtpSettings, from_email: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all"
                            placeholder="hello@store.com"
                          />
                       </div>
                     </div>

                     <div className="flex gap-4 pt-4">
                       <button 
                         onClick={() => handleTestConnection('smtp')}
                         disabled={isTestingSmtp}
                         className="flex-1 py-5 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-500 transition-all flex items-center justify-center gap-3"
                       >
                         {isTestingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-blue-500" />}
                         TESTER SMTP
                       </button>
                       {smtpStatus === 'success' && <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"><CheckCircle2 className="w-4 h-4"/> OK</div>}
                     </div>
                  </div>
               </div>

               {/* IMAP CONFIG */}
               <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                    <History className="w-4 h-4 text-purple-500" /> Configuration Serveur IMAP (Réception)
                  </h3>

                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Serveur IMAP Host</label>
                          <input 
                            value={imapSettings.host || ''}
                            onChange={(e) => setImapSettings({...imapSettings, host: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-purple-400 focus:border-purple-500 outline-none transition-all"
                            placeholder="imap.example.com"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Port</label>
                          <input 
                            type="number"
                            value={imapSettings.port || 993}
                            onChange={(e) => setImapSettings({...imapSettings, port: parseInt(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-purple-400 focus:border-purple-500 outline-none transition-all"
                            placeholder="993"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Sécurité</label>
                          <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 gap-1">
                             <button 
                               onClick={() => setImapSettings({...imapSettings, secure: 0})}
                               className={cn(
                                 "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                 imapSettings.secure === 0 ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                               )}
                             >
                               Non Sécurisé
                             </button>
                             <button 
                               onClick={() => setImapSettings({...imapSettings, secure: 1})}
                               className={cn(
                                 "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                 imapSettings.secure === 1 ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "text-slate-500 hover:text-slate-300"
                               )}
                             >
                               SSL/TLS
                             </button>
                          </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Utilisateur IMAP</label>
                          <input 
                            value={imapSettings.auth_user || ''}
                            onChange={(e) => setImapSettings({...imapSettings, auth_user: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-purple-400 focus:border-purple-500 outline-none transition-all"
                            placeholder="user@example.com"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Mot de Passe App</label>
                          <input 
                            type="password"
                            value={imapSettings.auth_pass || ''}
                            onChange={(e) => setImapSettings({...imapSettings, auth_pass: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-purple-400 focus:border-purple-500 outline-none transition-all"
                            placeholder="••••••••••••"
                          />
                       </div>
                     </div>

                     <div className="flex gap-4 pt-4">
                       <button 
                         onClick={() => handleTestConnection('imap')}
                         disabled={isTestingImap}
                         className="flex-1 py-5 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-500 transition-all flex items-center justify-center gap-3"
                       >
                         {isTestingImap ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-purple-500" />}
                         TESTER IMAP
                       </button>
                       {imapStatus === 'success' && <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"><CheckCircle2 className="w-4 h-4"/> OK</div>}
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleSaveSettings}
                  disabled={isSavingSmtp}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSavingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSavingSmtp ? 'ENREGISTREMENT...' : 'SAUVEGARDER TOUTES LES CONFIGURATIONS'}
                </button>

               {saveStatus !== 'idle' && (
                 <div className={cn(
                   "mt-6 p-6 rounded-3xl flex items-center justify-center gap-4",
                   saveStatus === 'success' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border border-red-500/20 text-red-500"
                 )}>
                   {saveStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                   <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                     {saveStatus === 'success' ? 'VOS PARAMÈTRES ONT ÉTÉ SYNCHRONISÉS' : 'ERREUR DE COMMUNICATION AVEC LE SERVEUR'}
                   </span>
                 </div>
               )}
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-950 border border-white/5 rounded-[2rem] p-8">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Aide SMTP / IMAP</h4>
                  <div className="space-y-4">
                     {[
                       { title: 'Hostinger (Nexus Default)', smtph: 'smtp.hostinger.com', imaph: 'imap.hostinger.com' },
                       { title: 'Google Mail', smtph: 'smtp.gmail.com', imaph: 'imap.gmail.com' },
                       { title: 'Outlook / 365', smtph: 'smtp.office365.com', imaph: 'outlook.office365.com' }
                     ].map((h, i) => (
                       <div key={i} className="p-5 bg-slate-900/40 border border-slate-800 rounded-3xl">
                          <p className="text-[10px] font-black text-blue-400 uppercase mb-3">{h.title}</p>
                          <div className="space-y-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                             <div className="flex justify-between"><span>SMTP:</span> <span>{h.smtph}</span></div>
                             <div className="flex justify-between"><span>IMAP:</span> <span>{h.imaph}</span></div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="w-5 h-5 text-indigo-500" />
                     <h4 className="text-[11px] font-black text-white uppercase tracking-tight">Sûreté Nexus AI</h4>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-bold uppercase tracking-tight">
                    Toutes vos configurations SMTP et IMAP sont stockées de manière sécurisée et ne sont utilisées que pour la gestion de vos boîtes mails respectives.
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Manual Template Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0c0e14] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                      <Layout className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
                        {editingTemplate ? 'Editer Template' : 'Nouvelle Template'}
                      </h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Configuration manuelle du script email</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nom de la Template</label>
                    <input 
                      value={formTemplate.name || ''}
                      onChange={(e) => setFormTemplate({ ...formTemplate, name: e.target.value })}
                      placeholder="Ex: Welcome Email Pro"
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Couleur Primaire</label>
                       <div className="flex gap-3">
                          <input 
                            type="color"
                            value={formTemplate.brand_color}
                            onChange={(e) => setFormTemplate({ ...formTemplate, brand_color: e.target.value })}
                            className="w-12 h-12 rounded-xl bg-black border border-slate-800 cursor-pointer"
                          />
                          <input 
                            value={formTemplate.brand_color}
                            onChange={(e) => setFormTemplate({ ...formTemplate, brand_color: e.target.value })}
                            className="flex-1 bg-black/50 border border-slate-800 rounded-2xl px-6 py-3 text-[10px] text-white focus:border-purple-500 outline-none transition-all font-mono"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Couleur Accent</label>
                       <div className="flex gap-3">
                          <input 
                            type="color"
                            value={formTemplate.accent_color}
                            onChange={(e) => setFormTemplate({ ...formTemplate, accent_color: e.target.value })}
                            className="w-12 h-12 rounded-xl bg-black border border-slate-800 cursor-pointer"
                          />
                          <input 
                            value={formTemplate.accent_color}
                            onChange={(e) => setFormTemplate({ ...formTemplate, accent_color: e.target.value })}
                            className="flex-1 bg-black/50 border border-slate-800 rounded-2xl px-6 py-3 text-[10px] text-white focus:border-purple-500 outline-none transition-all font-mono"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Objet de l'Email</label>
                    <input 
                      value={formTemplate.subject || ''}
                      onChange={(e) => setFormTemplate({ ...formTemplate, subject: e.target.value })}
                      placeholder="Ex: Bienvenue sur Nexus AI !"
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Corps du Message</label>
                      <div className="flex bg-black/50 p-1 rounded-xl border border-white/5">
                        <button 
                          onClick={() => setModalMode('code')}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                            modalMode === 'code' ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          Code HTML
                        </button>
                        <button 
                          onClick={() => setModalMode('preview')}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                            modalMode === 'preview' ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          Aperçu Visuel
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                      <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest">
                        Placeholders: {"{{user_name}}"} (Client), {"{{order_id}}"} (Commande), {"{{SENDER_NAME}}"} (Votre Nom)
                      </p>
                    </div>

                    {modalMode === 'code' ? (
                      <textarea 
                        value={formTemplate.body_html || ''}
                        onChange={(e) => setFormTemplate({ ...formTemplate, body_html: e.target.value })}
                        placeholder="Tapez le contenu de votre email ici..."
                        className="w-full h-64 bg-black/50 border border-slate-800 rounded-3xl p-6 text-[11px] font-mono text-slate-300 focus:border-purple-500 outline-none transition-all placeholder:text-slate-700 resize-none"
                      />
                    ) : (
                      <div className="w-full h-64 bg-white rounded-3xl overflow-hidden border border-slate-800">
                        <iframe 
                          srcDoc={`
                            <html>
                              <head>
                                <style>
                                  body { font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6; }
                                  * { max-width: 100%; }
                                </style>
                              </head>
                              <body>${formTemplate.body_html || '<p style="color: #999">Aucun contenu à prévisualiser...</p>'}</body>
                            </html>
                          `}
                          className="w-full h-full border-none"
                        />
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleSaveManualTemplate}
                    disabled={isSaving}
                    className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-900/40 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSaving ? 'ENREGISTREMENT...' : 'SAUVEGARDER LA TEMPLATE'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Rule Modal */}
      <AnimatePresence>
        {isRuleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRuleModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c0e14] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Nouvelle Règle</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Automation de communication intelligente</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsRuleModalOpen(false)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all"
                  >
                    <Zap className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nom de la Règle</label>
                    <input 
                      value={formRule.name || ''}
                      onChange={(e) => setFormRule({ ...formRule, name: e.target.value })}
                      placeholder="Ex: Confirmation de Commande"
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Déclencheur (Trigger Key)</label>
                    <select 
                      value={formRule.trigger_key || ''}
                      onChange={(e) => setFormRule({ ...formRule, trigger_key: e.target.value })}
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value="">Sélectionner un évènement</option>
                      <option value="new_order">Nouvelle Commande (Woo)</option>
                      <option value="order_completed">Commande Terminée (Woo)</option>
                      <option value="abandoned_cart">Panier Abandonné (Woo)</option>
                      <option value="new_subscription">Nouvel Abonnement (SaaS)</option>
                      <option value="payment_failed">Échec de Paiement (SaaS)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Template à Envoyer</label>
                    <select 
                      value={formRule.template_id}
                      onChange={(e) => setFormRule({ ...formRule, template_id: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value={0}>Choisir une template</option>
                      {templates.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Description (Optionnel)</label>
                    <textarea 
                      value={formRule.description || ''}
                      onChange={(e) => setFormRule({ ...formRule, description: e.target.value })}
                      placeholder="Petit résumé de l'action..."
                      className="w-full h-24 bg-black/50 border border-slate-800 rounded-3xl p-6 text-[11px] text-slate-300 focus:border-emerald-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleSaveRule}
                    disabled={isSavingRule}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 disabled:opacity-50"
                  >
                    {isSavingRule ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSavingRule ? 'CRÉATION...' : 'ACTIVER LA RÈGLE'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
