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
  HelpCircle,
  AlertCircle,
  ShieldCheck,
  Eye,
  Lock,
  Unlock,
  Inbox,
  User,
  Archive,
  Search,
  ArrowRight,
  Users,
  Sparkles,
  Filter,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../providers/FirebaseProvider';
import { cn } from '../lib/utils';
import Sparkline from './Sparkline';
import { geminiQuery } from '../lib/gemini';
import { firebaseService } from '../services/firebaseService';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { WPConfig } from '../types';

type Tab = 'inbox' | 'analytics' | 'automations' | 'templates' | 'settings' | 'broadcast';

// Helper to detect if a string contains HTML tags
const isHtml = (str: string): boolean => {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
};

// Helper to strip HTML tags for clean plain text preview snippets
const stripHtml = (htmlStr: string): string => {
  if (!htmlStr) return '';
  return htmlStr
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

interface CommunicationHubViewProps {
  config?: WPConfig;
}

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
  provider_type?: 'SMTP' | 'RESEND_API';
  resend_api_key?: string;
}

interface ImapSettings {
  host: string;
  port: number;
  secure: number;
  auth_user: string;
  auth_pass: string;
}

export default function CommunicationHubView({ config }: CommunicationHubViewProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.email?.toLowerCase() === 'ziedbenmiled3@gmail.com' || user?.email?.toLowerCase() === 'contact@nexuswp.pro';
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
    from_email: '',
    provider_type: 'SMTP',
    resend_api_key: ''
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
  const [smtpError, setSmtpError] = useState<string | null>(null);
  const [imapError, setImapError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSyncingImap, setIsSyncingImap] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isAiComposing, setIsAiComposing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<{name: string, subject: string, body: string} | null>(null);

  // User Guide / Helper State
  const [showGuide, setShowGuide] = useState(true);
  const [guideLang, setGuideLang] = useState<'fr' | 'en'>(() => {
    return (i18n.language?.startsWith('en') || i18n.language === 'en') ? 'en' : 'fr';
  });

  // Sync guideLang with global language changes
  useEffect(() => {
    const globalLang = (i18n.language?.startsWith('en') || i18n.language === 'en') ? 'en' : 'fr';
    setGuideLang(globalLang);
  }, [i18n.language]);
  
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
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Deletion Confirmation States (No-Prompt Safety)
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);

  // Broadcast Mailing tab state
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [audienceType, setAudienceType] = useState<'woo' | 'nexus'>(isSuperAdmin ? 'nexus' : 'woo');
  const [selectedCustomerEmails, setSelectedCustomerEmails] = useState<string[]>([]);
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'vip' | 'frequent' | 'prospects' | 'custom'>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [minSpent, setMinSpent] = useState('');
  const [minOrders, setMinOrders] = useState('');
  
  // Broadcast Composer State
  const [selectedBroadcastTemplateId, setSelectedBroadcastTemplateId] = useState<number>(0);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastPrimaryColor, setBroadcastPrimaryColor] = useState('#7c3aed');
  const [broadcastAccentColor, setBroadcastAccentColor] = useState('#4f46e5');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{ current: number; total: number; successCount: number; failedCount: number } | null>(null);
  const [broadcastStatusMessage, setBroadcastStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedMessageIds([]);
    setIsConfirmingBulkDelete(false);
  }, [activeFolder]);

  useEffect(() => {
    setIsConfirmingBulkDelete(false);
  }, [selectedMessageIds]);

  // WooCommerce customer extractor for target lists
  const fetchWooCustomers = async () => {
    if (!config?.url) {
      // If no config connected, load demo customers so user can test the CRM mailing lists immediately!
      const demoCustomers = [
        { id: 'demo1', email: 'jean.dupont@gmail.com', first_name: 'Jean', last_name: 'Dupont', full_name: 'Jean Dupont', orders_count: 5, total_spent: 420.50 },
        { id: 'demo2', email: 'sophie.martin@yahoo.fr', first_name: 'Sophie', last_name: 'Martin', full_name: 'Sophie Martin', orders_count: 12, total_spent: 1280.00 },
        { id: 'demo3', email: 'pierre.lefevre@outlook.com', first_name: 'Pierre', last_name: 'Lefèvre', full_name: 'Pierre Lefèvre', orders_count: 1, total_spent: 45.00 },
        { id: 'demo4', email: 'marie.dubois@gmail.com', first_name: 'Marie', last_name: 'Dubois', full_name: 'Marie Dubois', orders_count: 0, total_spent: 0.00 },
        { id: 'demo5', email: 'emma.watson@gmail.com', first_name: 'Emma', last_name: 'Watson', full_name: 'Emma Watson', orders_count: 3, total_spent: 185.30 },
        { id: 'demo6', email: 'lucas.bernard@outlook.fr', first_name: 'Lucas', last_name: 'Bernard', full_name: 'Lucas Bernard', orders_count: 8, total_spent: 310.40 },
        { id: 'demo7', email: 'nicolas.girard@orange.fr', first_name: 'Nicolas', last_name: 'Girard', full_name: 'Nicolas Girard', orders_count: 2, total_spent: 85.00 },
      ];
      setCustomers(demoCustomers);
      setSelectedCustomerEmails(demoCustomers.map(d => d.email));
      return;
    }

    setIsLoadingCustomers(true);
    setCustomersError(null);
    try {
      const res = await axios.get('/api/woocommerce/customers', {
        headers: {
          'x-user-email': user?.email || '',
          'x-wp-url': config.url || '',
          'x-wp-username': config.username || '',
          'x-wp-password': config.applicationPassword || '',
          'x-woocommerce-ck': config.consumerKey || '',
          'x-woocommerce-cs': config.consumerSecret || ''
        }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setCustomers(data);
      // Select all by default
      setSelectedCustomerEmails(data.map((c: any) => c.email));
    } catch (err: any) {
      console.error('Error fetching WooCommerce customers:', err);
      const isEn = guideLang === 'en';
      setCustomersError(err.response?.data?.error || (isEn ? "Failed to retrieve customers from WooCommerce API." : "Impossible de récupérer les clients via l'API WooCommerce."));
      
      // Fallback with demo data so the page is operational even under API credentials errors
      const demoCustomers = [
        { id: 'demo1', email: 'jean.dupont@gmail.com', first_name: 'Jean', last_name: 'Dupont', full_name: 'Jean Dupont', orders_count: 5, total_spent: 420.50 },
        { id: 'demo2', email: 'sophie.martin@yahoo.fr', first_name: 'Sophie', last_name: 'Martin', full_name: 'Sophie Martin', orders_count: 12, total_spent: 1280.00 },
        { id: 'demo3', email: 'pierre.lefevre@outlook.com', first_name: 'Pierre', last_name: 'Lefèvre', full_name: 'Pierre Lefèvre', orders_count: 1, total_spent: 45.00 },
        { id: 'demo4', email: 'marie.dubois@gmail.com', first_name: 'Marie', last_name: 'Dubois', full_name: 'Marie Dubois', orders_count: 0, total_spent: 0.00 },
        { id: 'demo5', email: 'emma.watson@gmail.com', first_name: 'Emma', last_name: 'Watson', full_name: 'Emma Watson', orders_count: 3, total_spent: 185.30 },
        { id: 'demo6', email: 'lucas.bernard@outlook.fr', first_name: 'Lucas', last_name: 'Bernard', full_name: 'Lucas Bernard', orders_count: 8, total_spent: 310.40 },
        { id: 'demo7', email: 'nicolas.girard@orange.fr', first_name: 'Nicolas', last_name: 'Girard', full_name: 'Nicolas Girard', orders_count: 2, total_spent: 85.00 },
      ];
      setCustomers(demoCustomers);
      setSelectedCustomerEmails(demoCustomers.map(d => d.email));
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Nexus SaaS Customer Extractor for Super Admins
  const fetchNexusUsers = async () => {
    setIsLoadingCustomers(true);
    setCustomersError(null);
    try {
      const [usersData, paymentsData] = await Promise.all([
        firebaseService.getAllUsers() as Promise<any[]>,
        firebaseService.getAllPayments() as Promise<any[]>
      ]);

      const activeUsers = (usersData || []).map((usrObj: any, idx) => {
        const usr = usrObj as any;
        const userEmail = usr.email?.toLowerCase() || '';
        const userPayments = (paymentsData || []).filter((p: any) => p.user_email?.toLowerCase() === userEmail && p.status === 'succeeded');
        
        const totalSpent = userPayments.reduce((acc: number, p: any) => acc + (parseFloat(p.amount) || 0), 0);
        const ordersCount = userPayments.length;

        const firstName = usr.first_name || usr.displayName?.split(' ')[0] || usr.email?.split('@')[0] || '';
        const lastName = usr.last_name || usr.displayName?.split(' ').slice(1).join(' ') || '';
        const fullName = usr.display_name || usr.displayName || usr.name || (firstName && lastName ? `${firstName} ${lastName}` : '') || usr.email?.split('@')[0];

        return {
          id: usr.uid || `nexus_${idx}`,
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          orders_count: ordersCount,
          total_spent: totalSpent,
          isNexus: true,
          plan_name: usr.plan_name || 'Aucun Plan',
          sub_status: usr.subscription?.status || 'inactive'
        };
      });

      setCustomers(activeUsers);
      setSelectedCustomerEmails(activeUsers.map(u => u.email));
    } catch (err: any) {
      console.error('Error fetching Nexus SaaS users:', err);
      const isEn = guideLang === 'en';
      setCustomersError(isEn ? "Failed to extract active Nexus users database." : "Impossible de synchroniser le fichier clients SaaS Nexus.");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Run initial subscriber sync when Broadcast tab resolves
  useEffect(() => {
    if (activeTab === 'broadcast') {
      if (audienceType === 'nexus' && isSuperAdmin) {
        fetchNexusUsers();
      } else {
        fetchWooCustomers();
      }
    }
  }, [activeTab, audienceType, config]);

  // Handle template loader binding
  useEffect(() => {
    if (selectedBroadcastTemplateId > 0) {
      const selected = templates.find(t => t.id === Number(selectedBroadcastTemplateId));
      if (selected) {
        setBroadcastSubject(selected.subject);
        // Remove HTML codes cleanly for rich-text preview rendering/interaction
        const cleanBody = selected.body_html
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<p>/gi, '')
          .replace(/<\/p>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .trim();
        setBroadcastBody(cleanBody);
        if (selected.brand_color) setBroadcastPrimaryColor(selected.brand_color);
        if (selected.accent_color) setBroadcastAccentColor(selected.accent_color);
      }
    }
  }, [selectedBroadcastTemplateId, templates]);

  // Bulk sender routine using backend SMTP credentials
  const handleSendBroadcast = async () => {
    const isEn = guideLang === 'en';
    if (!broadcastSubject.trim()) {
      alert(isEn ? 'Please specify a campaign subject!' : "Veuillez spécifier un objet de campagne !");
      return;
    }
    if (!broadcastBody.trim()) {
      alert(isEn ? 'Please enter your message body!' : 'Veuillez saisir le corps du message !');
      return;
    }
    if (selectedCustomerEmails.length === 0) {
      alert(isEn ? 'No targeted receivers checked!' : 'Aucun destinataire coché !');
      return;
    }

    setIsSendingBroadcast(true);
    setBroadcastProgress({
      current: 0,
      total: selectedCustomerEmails.length,
      successCount: 0,
      failedCount: 0
    });
    setBroadcastStatusMessage(isEn ? 'Opening SMTP connections...' : 'Ouverture des connexions SMTP...');

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < selectedCustomerEmails.length; i++) {
      const email = selectedCustomerEmails[i];
      const customer = customers.find(c => c.email === email) || {
        first_name: '',
        last_name: '',
        full_name: email.split('@')[0],
        orders_count: 0,
        total_spent: 0
      };

      // Tags replacement logic
      const replaceTags = (text: string) => {
        return text
          .replaceAll('{{user_name}}', customer.full_name || 'Client')
          .replaceAll('{{first_name}}', customer.first_name || 'Client')
          .replaceAll('{{last_name}}', customer.last_name || '')
          .replaceAll('{{email}}', customer.email)
          .replaceAll('{{orders_count}}', String(customer.orders_count || 0))
          .replaceAll('{{total_spent}}', String(customer.total_spent || 0))
          .replaceAll('{{SENDER_NAME}}', smtpSettings?.from_name || 'Nexus AI');
      };

      const finalSubject = replaceTags(broadcastSubject);
      const finalBody = replaceTags(broadcastBody);

      // Wrapper HTML templates following gorgeous visual guidelines
      const styledBodyHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0f17; padding: 40px 15px; margin: 0; min-height: 100%;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #121620; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid #1f2937;">
            <div style="background: linear-gradient(135deg, ${broadcastPrimaryColor}, ${broadcastAccentColor}); padding: 35px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">${smtpSettings.from_name || 'NEXUS AUTOMATION'}</h1>
            </div>
            <div style="padding: 40px 30px; line-height: 1.7; color: #cbd5e1; font-size: 15px;">
              ${finalBody.replace(/\n/g, '<br>')}
            </div>
            <div style="background-color: #0c0f17; padding: 25px; text-align: center; border-top: 1px solid #1f2937; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} ${smtpSettings.from_name || 'Nexus'}. ${isEn ? 'All rights reserved.' : 'Tous droits réservés.'}</p>
              <p style="margin: 0;">${isEn ? 'To opt-out, reply directly or contact support.' : 'Pour vous désabonner, répondez directement par email.'}</p>
            </div>
          </div>
        </div>
      `;

      try {
        await axios.post('/api/comm/send', {
          recipient: email,
          subject: finalSubject,
          body_html: styledBodyHtml
        }, { headers: { 'x-user-email': user?.email } });

        setBroadcastProgress(prev => {
          if (!prev) return null;
          return {
            ...prev,
            current: i + 1,
            successCount: prev.successCount + 1
          };
        });
      } catch (err: any) {
        console.error(`Error broadcasting to ${email}:`, err);
        setBroadcastProgress(prev => {
          if (!prev) return null;
          return {
            ...prev,
            current: i + 1,
            failedCount: prev.failedCount + 1
          };
        });
      }

      // Small throttling delay to preserve SMTP sender reputation
      await delay(350);
    }

    setBroadcastStatusMessage(isEn ? 'Campaign completed with success!' : 'Campagne d\'emailing envoyée avec succès !');
    setIsSendingBroadcast(false);
    setTimeout(() => {
      setBroadcastProgress(null);
      setBroadcastStatusMessage(null);
    }, 15000);
  };

  // Get active filtered audience lists
  const getFilteredCustomers = () => {
    let result = [...customers];

    // Align segments filter
    if (segmentFilter === 'vip') {
      result = result.filter(c => (c.total_spent || 0) >= 150);
    } else if (segmentFilter === 'frequent') {
      result = result.filter(c => (c.orders_count || 0) >= 3);
    } else if (segmentFilter === 'prospects') {
      result = result.filter(c => (c.orders_count || 0) <= 1);
    }

    // Apply custom forms
    if (minSpent.trim() !== '') {
      const val = parseFloat(minSpent);
      if (!isNaN(val)) {
        result = result.filter(c => (c.total_spent || 0) >= val);
      }
    }
    if (minOrders.trim() !== '') {
      const val = parseInt(minOrders);
      if (!isNaN(val)) {
        result = result.filter(c => (c.orders_count || 0) >= val);
      }
    }

    // Fuzzy search fields
    if (customerSearch.trim() !== '') {
      const q = customerSearch.toLowerCase();
      result = result.filter(c => 
        (c.full_name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.first_name || '').toLowerCase().includes(q) ||
        (c.last_name || '').toLowerCase().includes(q)
      );
    }

    return result;
  };

  useEffect(() => {
    if (!user?.email) return;

    fetchSettings();
    fetchTemplates();
    fetchAnalytics();
    fetchRules();

    const isAdmin = isSuperAdmin;
    let unsubscribeInbox: (() => void) | undefined;
    let unsubscribeSent: (() => void) | undefined;

    // Helper to extract timestamp as ms
    const getTimestampMs = (val: any) => {
      if (!val) return 0;
      if (typeof val === 'object') {
        if (val.seconds !== undefined) return val.seconds * 1000;
        if (typeof val.toDate === 'function') {
          try { return val.toDate().getTime(); } catch (e) {}
        }
      }
      try {
        const parsed = new Date(val).getTime();
        if (!isNaN(parsed)) return parsed;
      } catch (e) {}
      return 0;
    };

    try {
      setIsLoadingMessages(true);
      
      // 1. Inbox/Archived query
      const baseInboxQuery = isAdmin 
        ? query(collection(db, 'messages'))
        : query(collection(db, 'messages'), where('recipient_email', '==', user.email.toLowerCase()));

      unsubscribeInbox = onSnapshot(baseInboxQuery, (snapshot) => {
        let msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
        
        // Filter by folder client-side
        if (activeFolder === 'inbox') {
          msgs = msgs.filter(m => m.status !== 'archived');
        } else if (activeFolder === 'archived') {
          msgs = msgs.filter(m => m.status === 'archived');
        }

        // Sort client-side
        msgs.sort((a, b) => {
          // Put 'unread' first if in inbox
          if (activeFolder === 'inbox') {
            if (a.status === 'unread' && b.status !== 'unread') return -1;
            if (a.status !== 'unread' && b.status === 'unread') return 1;
          }
          // Secondary: sort by created_at desc
          const timeA = getTimestampMs(a.created_at);
          const timeB = getTimestampMs(b.created_at);
          return timeB - timeA;
        });

        setMessages(msgs);
        setIsLoadingMessages(false);
      }, (err) => {
        console.error('Inbox query error:', err);
        setIsLoadingMessages(false);
      });

      // 2. Sent query
      const sq = isAdmin
        ? query(collection(db, 'sent_messages'))
        : query(collection(db, 'sent_messages'), where('user_email', '==', user.email.toLowerCase()));

      unsubscribeSent = onSnapshot(sq, (snapshot) => {
        let smsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        
        // Sort client-side by created_at desc
        smsgs.sort((a, b) => {
          const timeA = getTimestampMs(a.created_at);
          const timeB = getTimestampMs(b.created_at);
          return timeB - timeA;
        });

        setSentMessages(smsgs);
        if (activeFolder === 'sent') setIsLoadingMessages(false);
      }, (err) => {
        console.warn('Sent messages query idle or disconnected, Firestore will automatically reconnect:', err);
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
      let gotSmtp = false;
      let gotImap = false;

      if (res.data.smtp && Object.keys(res.data.smtp).length > 0 && res.data.smtp.host) {
        setSmtpSettings(res.data.smtp);
        gotSmtp = true;
      }
      if (res.data.imap && Object.keys(res.data.imap).length > 0 && res.data.imap.host) {
        setImapSettings(res.data.imap);
        gotImap = true;
      }

      // Safe Client-Side Firestore Recovery if local SQLite settings are empty
      if (user?.email && (!gotSmtp || !gotImap)) {
        console.log('[CommHub] Local SQLite settings empty/missing, attempting client-side Firestore recovery...');
        const emailKey = user.email.toLowerCase().trim();
        let restoredSmtp: any = null;
        let restoredImap: any = null;

        if (!gotSmtp) {
          try {
            const smtpSnap = await getDoc(doc(db, 'smtp_settings', emailKey));
            if (smtpSnap.exists()) {
              restoredSmtp = smtpSnap.data();
              console.log('[CommHub] Recovered SMTP settings from Firestore client-side');
            }
          } catch (e) {
            console.warn('[CommHub] Client-side SMTP recovery check failed:', e);
          }
        }

        if (!gotImap) {
          try {
            const imapSnap = await getDoc(doc(db, 'imap_settings', emailKey));
            if (imapSnap.exists()) {
              restoredImap = imapSnap.data();
              console.log('[CommHub] Recovered IMAP settings from Firestore client-side');
            }
          } catch (e) {
            console.warn('[CommHub] Client-side IMAP recovery check failed:', e);
          }
        }

        // If something was restored from Firestore, push it to local SQLite and re-fetch to get decrypted values
        if (restoredSmtp || restoredImap) {
          const payload: any = {};
          if (restoredSmtp) {
            payload.smtp = {
              host: restoredSmtp.host || '',
              port: Number(restoredSmtp.port) || 587,
              secure: restoredSmtp.secure ? 1 : 0,
              auth_user: restoredSmtp.auth_user || '',
              auth_pass: restoredSmtp.auth_pass || '', // Already encrypted in Firestore
              from_name: restoredSmtp.from_name || '',
              from_email: restoredSmtp.from_email || '',
              provider_type: restoredSmtp.provider_type || 'SMTP',
              resend_api_key: restoredSmtp.resend_api_key || null
            };
          }
          if (restoredImap) {
            payload.imap = {
              host: restoredImap.host || '',
              port: Number(restoredImap.port) || 993,
              secure: restoredImap.secure ? 1 : 0,
              auth_user: restoredImap.auth_user || '',
              auth_pass: restoredImap.auth_pass || '' // Already encrypted in Firestore
            };
          }

          try {
            await axios.post('/api/comm/settings', payload, { headers: { 'x-user-email': user.email } });
            
            // Re-fetch to get local decrypted state
            const refreshed = await axios.get('/api/comm/settings', { headers: { 'x-user-email': user.email } });
            if (refreshed.data.smtp && Object.keys(refreshed.data.smtp).length > 0 && refreshed.data.smtp.host) {
              setSmtpSettings(refreshed.data.smtp);
            }
            if (refreshed.data.imap && Object.keys(refreshed.data.imap).length > 0 && refreshed.data.imap.host) {
              setImapSettings(refreshed.data.imap);
            }
          } catch (syncErr) {
            console.error('[CommHub] Failed to sync restored settings to local SQLite:', syncErr);
          }
        }
      }
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
      if (res.data && Array.isArray(res.data.stats)) {
        setAnalytics(res.data.stats);
        setRecentLogs(res.data.recentLogs || []);
      } else {
        setAnalytics(Array.isArray(res.data) ? res.data : []);
        setRecentLogs([]);
      }
    } catch (err) { 
      console.error('Fetch analytics error:', err); 
      setAnalytics([]);
      setRecentLogs([]);
    }
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
    setSaveError(null);
    try {
      // 1. Save to backend SQLite and retrieve freshly encrypted passwords
      const res = await axios.post('/api/comm/settings', { smtp: smtpSettings, imap: imapSettings }, { headers: { 'x-user-email': user?.email } });
      
      // 2. Perform direct client-side save backup to Firestore with authenticated context
      if (user?.email) {
        const emailKey = user.email.toLowerCase().trim();
        
        if (smtpSettings) {
          const encSmtpPass = res.data.smtp_encrypted_pass || smtpSettings.auth_pass;
          try {
            await setDoc(doc(db, 'smtp_settings', emailKey), {
              host: smtpSettings.host || 'smtp.hostinger.com',
              port: Number(smtpSettings.port) || 465,
              secure: smtpSettings.secure ? 1 : 0,
              auth_user: smtpSettings.auth_user || '',
              auth_pass: encSmtpPass,
              from_name: smtpSettings.from_name || '',
              from_email: smtpSettings.from_email || '',
              provider_type: smtpSettings.provider_type || 'SMTP',
              resend_api_key: smtpSettings.resend_api_key || null,
              updated_at: new Date().toISOString()
            }, { merge: true });
            console.log('[CommHub] Client-side Firestore SMTP sync successful');
          } catch (fsErr) {
            console.warn('[CommHub] Client-side Firestore SMTP sync failed:', fsErr);
          }
        }

        if (imapSettings) {
          const encImapPass = res.data.imap_encrypted_pass || imapSettings.auth_pass;
          try {
            await setDoc(doc(db, 'imap_settings', emailKey), {
              host: imapSettings.host || '',
              port: Number(imapSettings.port) || 993,
              secure: imapSettings.secure ? 1 : 0,
              auth_user: imapSettings.auth_user || '',
              auth_pass: encImapPass,
              updated_at: new Date().toISOString()
            }, { merge: true });
            console.log('[CommHub] Client-side Firestore IMAP sync successful');
          } catch (fsErr) {
            console.warn('[CommHub] Client-side Firestore IMAP sync failed:', fsErr);
          }
        }
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } catch (err: any) { 
      setSaveStatus('error');
      const msg = err.response?.data?.error || err.message || 'Erreur serveur';
      setSaveError(msg);
      setTimeout(() => setSaveStatus('idle'), 8000);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const [testSmtpRecipient, setTestSmtpRecipient] = useState('');

  const handleTestConnection = async (type: 'smtp' | 'imap') => {
    if (type === 'smtp') {
      setIsTestingSmtp(true);
      setSmtpStatus('idle');
      setSmtpError(null);
    } else {
      setIsTestingImap(true);
      setImapStatus('idle');
      setImapError(null);
    }

    try {
      const config = type === 'smtp' ? smtpSettings : imapSettings;
      await axios.post('/api/comm/test-connection', { 
        ...config, 
        type,
        provider_type: smtpSettings.provider_type || 'SMTP',
        test_recipient: type === 'smtp' ? (testSmtpRecipient || user?.email) : undefined
      }, { headers: { 'x-user-email': user?.email } });
      if (type === 'smtp') setSmtpStatus('success'); else setImapStatus('success');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error occurred';
      if (type === 'smtp') {
        setSmtpStatus('error');
        setSmtpError(errMsg);
      } else {
        setImapStatus('error');
        setImapError(errMsg);
      }
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
        category: isSuperAdmin ? 'saas' : 'woo',
        brand_color: formTemplate.brand_color,
        accent_color: formTemplate.accent_color,
        is_ai_generated: 1
      }, { headers: { 'x-user-email': user?.email } });
      setGeneratedTemplate(null);
      setAiPrompt('');
      fetchTemplates();
    } catch (err) { alert('Erreur lors de la sauvegarde.'); }
  };

  const isValidHex = (colorString: string) => {
    return /^#[0-9a-fA-F]{6}$/i.test(colorString) || /^#[0-9a-fA-F]{3}$/i.test(colorString);
  };

  const handleBrandColorChange = (newColor: string) => {
    const oldColor = formTemplate.brand_color;
    let newHtml = formTemplate.body_html || '';
    
    if (isValidHex(oldColor) && isValidHex(newColor) && oldColor.toLowerCase() !== newColor.toLowerCase()) {
      try {
        const escapedOld = oldColor.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedOld, 'gi');
        newHtml = newHtml.replace(regex, newColor);
      } catch (e) {
        console.error('Error replacing brand color:', e);
      }
    }
    
    setFormTemplate(prev => ({
      ...prev,
      brand_color: newColor,
      body_html: newHtml
    }));
  };

  const handleAccentColorChange = (newColor: string) => {
    const oldColor = formTemplate.accent_color;
    let newHtml = formTemplate.body_html || '';
    
    if (isValidHex(oldColor) && isValidHex(newColor) && oldColor.toLowerCase() !== newColor.toLowerCase()) {
      try {
        const escapedOld = oldColor.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedOld, 'gi');
        newHtml = newHtml.replace(regex, newColor);
      } catch (e) {
        console.error('Error replacing accent color:', e);
      }
    }
    
    setFormTemplate(prev => ({
      ...prev,
      accent_color: newColor,
      body_html: newHtml
    }));
  };

  const getPreviewHtml = () => {
    let html = formTemplate.body_html || '<p style="color: #999">Aucun contenu à prévisualiser...</p>';
    
    html = html.replace(/\{\{brand_color\}\}/gi, formTemplate.brand_color || '#00ff66');
    html = html.replace(/\{\{primary_color\}\}/gi, formTemplate.brand_color || '#00ff66');
    html = html.replace(/\{\{accent_color\}\}/gi, formTemplate.accent_color || '#000000');
    
    return html;
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
          category: isSuperAdmin ? 'saas' : 'woo',
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
    if (deletingTemplateId !== id) {
      setDeletingTemplateId(id);
      return;
    }
    try {
      await axios.delete(`/api/comm/templates/${id}`, { headers: { 'x-user-email': user?.email } });
      setDeletingTemplateId(null);
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
        scope: isSuperAdmin ? 'saas' : 'woo'
      }, { headers: { 'x-user-email': user?.email } });
      setIsRuleModalOpen(false);
      fetchRules();
    } catch (err) { alert('Erreur lors de l’enregistrement.'); }
    finally { setIsSavingRule(false); }
  };

  const handleDeleteRule = async (id: number) => {
    if (deletingRuleId !== id) {
      setDeletingRuleId(id);
      return;
    }
    try {
      await axios.delete(`/api/comm/rules/${id}`, { headers: { 'x-user-email': user?.email } });
      setDeletingRuleId(null);
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
    if (deletingMessageId !== id) {
      setDeletingMessageId(id);
      return;
    }
    try {
      const collectionName = activeFolder === 'sent' ? 'sent_messages' : 'messages';
      await firebaseService.deleteMessage(id, collectionName);
      setDeletingMessageId(null);
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Erreur lors de la suppression du message: ${err.message}`);
    }
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredMessages.map(m => m.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedMessageIds.includes(id));
    
    if (allSelected) {
      setSelectedMessageIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedMessageIds(prev => {
        const union = new Set([...prev, ...visibleIds]);
        return Array.from(union);
      });
    }
  };

  const handleToggleSelectMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMessageIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedMessageIds.length === 0) return;
    if (!isConfirmingBulkDelete) {
      setIsConfirmingBulkDelete(true);
      return;
    }

    setIsBulkDeleting(true);
    try {
      const collectionName = activeFolder === 'sent' ? 'sent_messages' : 'messages';
      
      const deletePromises = selectedMessageIds.map(id => firebaseService.deleteMessage(id, collectionName));
      await Promise.all(deletePromises);
      
      if (selectedMessage && selectedMessageIds.includes(selectedMessage.id)) {
        setSelectedMessage(null);
      }
      
      setSelectedMessageIds([]);
      setIsConfirmingBulkDelete(false);
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      alert(`Erreur lors de la suppression en masse : ${err.message}`);
    } finally {
      setIsBulkDeleting(false);
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

  const renderGuide = () => {
    if (!showGuide) {
      return (
        <div className="flex justify-end">
          <button 
            type="button"
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/40 hover:bg-slate-900 border border-slate-800 rounded-2xl text-[9px] font-black tracking-widest text-[#a855f7] hover:text-white uppercase transition-all shadow-md cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Guide d'Utilisation / User Guide 💡
          </button>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-slate-950/80 border border-purple-500/20 rounded-[2rem] p-8 shadow-xl shadow-purple-950/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <HelpCircle className="w-24 h-24 text-purple-500" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {guideLang === 'fr' ? '💡 Création de Modèles intelligents & Automations' : '💡 Smart Templates Creation & Email Automations'}
                </h4>
                <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {guideLang === 'fr' ? 'Préparez vos modèles de réponse et automatisez vos flux' : 'Prepare form templates and automate trigger workflows'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex bg-[#07090e] border border-white/5 rounded-xl p-0.5 text-[8px] font-black">
                <button 
                  type="button"
                  onClick={() => setGuideLang('fr')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all",
                    guideLang === 'fr' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  FR
                </button>
                <button 
                  type="button"
                  onClick={() => setGuideLang('en')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all",
                    guideLang === 'en' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  EN
                </button>
              </div>
              
              <button 
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[8px] font-black text-[#f43f5e] uppercase tracking-widest transition-all"
              >
                {guideLang === 'fr' ? 'Masquer' : 'Hide'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] text-slate-300">
            {/* Step 1 */}
            <div className="bg-[#0c0e14] border border-white/5 rounded-2xl p-6 relative group hover:border-purple-500/25 transition-all">
              <div className="absolute top-4 right-4 text-xs font-black italic select-none text-purple-900/30">01</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/5 flex items-center justify-center border border-purple-500/10">
                  <Layout className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h5 className="font-black text-white uppercase tracking-tight">
                    {guideLang === 'fr' ? 'Création de Modèles (Templates)' : 'Creating Templates'}
                  </h5>
                  <p className="text-[8px] font-bold text-purple-500 uppercase tracking-widest mt-0.5">
                    {guideLang === 'fr' ? 'Régigez manuellement ou via Gemini AI' : 'Draft manually or via Gemini AI'}
                  </p>
                </div>
              </div>
              
              {guideLang === 'fr' ? (
                <div className="space-y-3 font-semibold text-slate-400 leading-relaxed text-[10.5px]">
                  <p>Cette étape vous permet de préparer des courriers professionnels prêts à l'emploi :</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li>Rendez-vous dans l'onglet <strong className="text-white">TEMPLATES</strong>.</li>
                    <li>Cliquez sur <strong className="text-white">RÉDIGER PAR IA</strong> pour laisser <strong className="text-purple-400">Gemini</strong> concevoir un brouillon sur mesure selon vos consignes.</li>
                    <li>Ou cliquez sur <strong className="text-white">CRÉER MANUELLEMENT</strong> (via le bouton <em className="not-italic text-slate-200">Créer Manuellement</em>) pour saisir et enregistrer votre propre code HTML personnalisé.</li>
                    <li>Une fois prêt, <strong className="text-[#00ff66]">enregistrez votre modèle</strong>.</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3 font-semibold text-slate-400 leading-relaxed text-[10.5px]">
                  <p>This feature allows you to craft polished, high-converting copy in seconds:</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li>Go to the <strong className="text-white">TEMPLATES</strong> tab.</li>
                    <li>Click <strong className="text-white">COMPOSE BY AI</strong> to let <strong className="text-purple-400">Gemini AI</strong> generate a tailored draft based on a brief.</li>
                    <li>Or click <strong className="text-white">CREATE MANUALLY</strong> to paste your own custom HTML layout blocks.</li>
                    <li>When ready, <strong className="text-[#00ff66]">save your template</strong> in the collection.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className="bg-[#0c0e14] border border-white/5 rounded-2xl p-6 relative group hover:border-purple-500/25 transition-all">
              <div className="absolute top-4 right-4 text-xs font-black italic select-none text-purple-900/30">02</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/5 flex items-center justify-center border border-purple-500/10">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h5 className="font-black text-white uppercase tracking-tight">
                    {guideLang === 'fr' ? 'Automatisation des Envois (Règles)' : 'Automating Sends (Rules)'}
                  </h5>
                  <p className="text-[8px] font-bold text-purple-500 uppercase tracking-widest mt-0.5">
                    {guideLang === 'fr' ? 'Envois 100% Autonomes via Triggers' : '100% Autonomous Trigger Sending'}
                  </p>
                </div>
              </div>

              {guideLang === 'fr' ? (
                <div className="space-y-3 font-semibold text-slate-400 leading-relaxed text-[10.5px]">
                  <p>Associez vos déclencheurs préférés pour délivrer vos messages automatiquement :</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li>Rendez-vous dans l'onglet de gestion des règles d'automatisation (<strong className="text-white">AUTOMATIONS</strong>).</li>
                    <li>Cliquez sur <strong className="text-white">NOUVELLE RÈGLE</strong> pour en ajouter une.</li>
                    <li>Associez un événement déclencheur (comme la réception d'un mot-clé ciblé ou d'un e-mail WooCommerce spécifique) à l'un de vos modèles enregistrés.</li>
                    <li>Vos courriels seront envoyés de <strong className="text-emerald-400">manière 100% autonome</strong> selon vos règles de messagerie.</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3 font-semibold text-slate-400 leading-relaxed text-[10.5px]">
                  <p>Wire dispatch settings together with specific actions on your platforms:</p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1">
                    <li>Navigate to the <strong className="text-white">AUTOMATIONS</strong> tab rules dashboard.</li>
                    <li>Click on <strong className="text-white">NEW RULE</strong> to open the setup form.</li>
                    <li>Associate a trigger event (such as a recipient keyword trigger or key WooCommerce actions) with your saved template.</li>
                    <li>The system will dispatch emails <strong className="text-emerald-400">fully autonomously (100%)</strong> matching your exact specifications.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] ml-1">
            {guideLang === 'en' ? 'Multi-Tenant Communication System & Smart Templates' : 'Système de Communication Multi-Tenant & Smart Templates'}
          </p>
          <div className="flex items-center gap-2 mt-3 ml-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black tracking-widest text-[#00ff66] uppercase">
              {guideLang === 'en' ? 'Production Mode: 5s Anti-Spam Cooldown Active' : 'Mode Production : Temporisation Anti-Spam de 5s Active'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950/80 border border-white/5 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
            {[
              { id: 'inbox', label: 'INBOX', icon: Inbox, count: messages.filter(m => m.status === 'unread').length },
              { id: 'broadcast', label: guideLang === 'en' ? 'BROADCAST' : 'DIFFUSION', icon: Users },
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

          {isSuperAdmin && activeTab === 'inbox' && (
            <button 
              onClick={handleImapSync}
              disabled={isSyncingImap}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncingImap && "animate-spin")} />
              {isSyncingImap ? 'SYNC...' : guideLang === 'en' ? 'SYNCHRONIZE' : 'SYNCHRONISER'}
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
                        {guideLang === 'en' ? 'Sent' : 'Envoyés'}
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
                       placeholder={guideLang === 'en' ? "Search for a client..." : "Rechercher un client..."}
                       className="w-full bg-black border border-slate-800 rounded-2xl pl-12 pr-6 py-3 text-[10px] text-slate-300 font-bold uppercase tracking-widest focus:border-purple-500/50 outline-none transition-all"
                     />
                  </div>

                  {filteredMessages.length > 0 && (
                     <div className="mt-4 flex items-center justify-between px-1">
                        <button 
                          onClick={handleToggleSelectAll}
                          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                           <div className={cn(
                             "w-4 h-4 rounded border flex items-center justify-center transition-all",
                             filteredMessages.length > 0 && filteredMessages.every(m => selectedMessageIds.includes(m.id))
                               ? "bg-purple-600 border-purple-500 text-white"
                               : "border-slate-800 bg-black text-transparent hover:border-slate-600"
                           )}>
                              {filteredMessages.length > 0 && filteredMessages.every(m => selectedMessageIds.includes(m.id)) && (
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z" fill="white"/></svg>
                              )}
                           </div>
                           <span>{guideLang === 'en' ? 'All' : 'Tous'} ({filteredMessages.length})</span>
                        </button>

                        {selectedMessageIds.length > 0 && (
                           <div className="flex items-center gap-1.5">
                             <button
                               onClick={handleBulkDelete}
                               disabled={isBulkDeleting}
                               className={cn(
                                 "py-1 px-2.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1 border cursor-pointer",
                                 isConfirmingBulkDelete
                                   ? "bg-red-600 border-red-500 text-white animate-pulse"
                                   : "bg-red-950/30 text-red-400 border-red-500/20 hover:bg-red-600 hover:text-white"
                               )}
                             >
                               <Trash2 className="w-3 h-3" />
                               <span>
                                 {isBulkDeleting 
                                   ? (guideLang === 'en' ? "Del..." : "Suppr...") 
                                   : isConfirmingBulkDelete 
                                     ? `${guideLang === 'en' ? "Sure?" : "Sûr ?"} (${selectedMessageIds.length})` 
                                     : `${guideLang === 'en' ? "Delete" : "Supprimer"} (${selectedMessageIds.length})`}
                               </span>
                             </button>
                             {isConfirmingBulkDelete && (
                               <button
                                 onClick={() => setIsConfirmingBulkDelete(false)}
                                 className="px-1.5 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500 hover:text-white border border-slate-800 bg-slate-900 rounded-lg cursor-pointer"
                               >
                                 {guideLang === 'en' ? "Cancel" : "Annuler"}
                               </button>
                             )}
                           </div>
                        )}
                     </div>
                  )}
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {isLoadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                       <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                       <p className="text-[10px] font-black uppercase tracking-widest">{guideLang === 'en' ? 'Calculating Nexus flow...' : 'Calcul du flux Nexus...'}</p>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4 text-center p-10">
                       <Inbox className="w-10 h-10" />
                       <p className="text-[10px] font-black uppercase tracking-widest">
                          {activeFolder === 'sent' ? (guideLang === 'en' ? 'No sent messages' : 'Aucun message envoyé') : (guideLang === 'en' ? 'Inbox is empty' : 'Boîte de réception vide')}
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
                          <div className="flex items-center gap-3 min-w-0">
                             <div 
                               onClick={(e) => handleToggleSelectMessage(msg.id, e)}
                               className={cn(
                                 "w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer",
                                 selectedMessageIds.includes(msg.id)
                                   ? selectedMessage?.id === msg.id 
                                     ? "bg-white text-purple-600 border-white"
                                     : "bg-purple-600 border-purple-500 text-white"
                                   : selectedMessage?.id === msg.id
                                     ? "border-purple-300 text-transparent hover:bg-white/10"
                                     : "border-slate-850 bg-black hover:border-slate-600 text-transparent"
                               )}
                             >
                               {selectedMessageIds.includes(msg.id) && (
                                 <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                   <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                 </svg>
                               )}
                             </div>
                             <div className={cn("w-2 h-2 rounded-full shrink-0", msg.status === 'unread' ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-transparent")} />
                             <span className={cn("text-[10px] font-black uppercase tracking-widest truncate", selectedMessage?.id === msg.id ? "text-white" : "text-slate-300")}>
                               {activeFolder === 'sent' ? `${guideLang === 'en' ? 'To' : 'À'}: ${msg.recipient_email}` : msg.sender_name}
                             </span>
                          </div>
                          <span className={cn("text-[8px] font-bold uppercase opacity-60", selectedMessage?.id === msg.id ? "text-white" : "text-slate-500")}>
                             {msg.created_at?.toDate ? new Intl.DateTimeFormat(guideLang === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' }).format(msg.created_at.toDate()) : 'Now'}
                          </span>
                       </div>
                       <p className={cn("text-[9px] font-bold uppercase tracking-tight truncate mb-1", selectedMessage?.id === msg.id ? "text-white" : "text-white/80")}>
                         {msg.subject}
                       </p>
                       <p className={cn("text-[8px] font-medium leading-relaxed truncate opacity-60", selectedMessage?.id === msg.id ? "text-white/70" : "text-slate-500")}>
                         {stripHtml(msg.body)}
                       </p>

                       <button 
                         onClick={(e) => handleDeleteMessage(msg.id, e)}
                         className={cn("absolute top-1/2 -translate-y-1/2 right-4 transition-all z-20 text-[8px] font-black uppercase flex items-center justify-center gap-1 rounded-xl", deletingMessageId === msg.id ? "bg-red-600 text-white animate-pulse px-3.5 py-2.5 opacity-100" : "p-3 opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white")}
                         title={deletingMessageId === msg.id ? (guideLang === 'en' ? "Confirm deletion" : "Confirmer la suppression") : (guideLang === 'en' ? "Delete" : "Supprimer")}
                       >
                         {deletingMessageId === msg.id ? (guideLang === 'en' ? "Sure?" : "Sûr ?") : <Trash2 className="w-3.5 h-3.5" />}
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
                                    {activeFolder === 'sent' ? `${guideLang === 'en' ? 'To' : 'À'}: ${selectedMessage.recipient_email || (guideLang === 'en' ? 'User' : 'Utilisateur')}` : selectedMessage.sender_name}
                                 </h4>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {activeFolder === 'sent' ? `${guideLang === 'en' ? 'Sender' : 'Expéditeur'}: ${selectedMessage.sender_email}` : selectedMessage.sender_email}
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
                               className={cn("transition-all duration-200 uppercase font-black text-[10px] flex items-center justify-center gap-1.5 rounded-2xl border", deletingMessageId === selectedMessage.id ? "bg-red-600 border-red-700 text-white animate-pulse px-5 py-4" : "p-4 bg-slate-900 border-slate-800 text-slate-400 hover:text-red-500")}
                               title={deletingMessageId === selectedMessage.id ? (guideLang === 'en' ? "Confirm deletion" : "Confirmer la suppression") : (guideLang === 'en' ? "Delete permanently" : "Supprimer définitivement")}
                             >
                               {deletingMessageId === selectedMessage.id ? (guideLang === 'en' ? "Sure?" : "Sûr ?") : <Trash2 className="w-5 h-5" />}
                             </button>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap items-center gap-4">
                          <div className="px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-xl text-[9px] font-black text-purple-500 uppercase tracking-widest">
                             {guideLang === 'en' ? 'Subject' : 'Sujet'}: {selectedMessage.subject}
                          </div>
                          {selectedMessage.site_url && (
                             <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <SettingsIcon className="w-3 h-3" /> Origin: {selectedMessage.site_url}
                             </div>
                          )}
                          <div className="px-4 py-2 bg-slate-900/50 border border-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">
                             {selectedMessage.created_at?.toDate ? new Intl.DateTimeFormat(guideLang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(selectedMessage.created_at.toDate()) : (guideLang === 'en' ? 'Recently' : 'Récemment')}
                          </div>
                       </div>
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-black/20">
                       {isHtml(selectedMessage.body) ? (
                         <div className="w-full bg-white text-slate-900 rounded-[2rem] p-4 shadow-2xl overflow-hidden min-h-[500px]">
                           <iframe
                             srcDoc={`
                               <!DOCTYPE html>
                               <html>
                                 <head>
                                   <meta charset="utf-8">
                                   <style>
                                     body {
                                       font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                       margin: 0;
                                       padding: 16px;
                                       background-color: #ffffff;
                                       color: #0f172a;
                                       font-size: 14px;
                                       line-height: 1.6;
                                     }
                                     /* Custom links style */
                                     a {
                                       color: #6366f1;
                                       text-decoration: underline;
                                     }
                                     /* Custom images style to prevent overflow */
                                     img {
                                       max-width: 100%;
                                       height: auto;
                                     }
                                     /* Scrollbar layout */
                                     ::-webkit-scrollbar {
                                       width: 8px;
                                       height: 8px;
                                     }
                                     ::-webkit-scrollbar-track {
                                       background: transparent;
                                     }
                                     ::-webkit-scrollbar-thumb {
                                       background: rgba(0,0,0,0.15);
                                       border-radius: 4px;
                                     }
                                     ::-webkit-scrollbar-thumb:hover {
                                       background: rgba(0,0,0,0.25);
                                     }
                                   </style>
                                 </head>
                                 <body>
                                   ${selectedMessage.body}
                                 </body>
                               </html>
                             `}
                             className="w-full h-[550px] border-0 bg-white"
                             title="Email Preview"
                           />
                         </div>
                       ) : (
                         <div className="max-w-2xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                           {selectedMessage.body}
                         </div>
                       )}
                    </div>

                    {/* Quick Reply Bar */}
                    <div className="p-8 border-t border-white/5 bg-slate-950/40">
                       <div className="flex gap-4">
                          <input 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                            placeholder={guideLang === 'en' ? "Write a quick reply..." : "Écrire une réponse rapide..."}
                            className="flex-1 bg-black border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-slate-300 focus:border-purple-500 transition-all outline-none"
                            disabled={isSendingReply}
                          />
                          <button 
                            onClick={handleSendReply}
                            disabled={isSendingReply || !replyText.trim()}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-purple-900/20 disabled:opacity-50"
                          >
                             {isSendingReply ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                             {isSendingReply ? (guideLang === 'en' ? 'SENDING...' : 'ENVOI...') : (guideLang === 'en' ? 'Reply' : 'Répondre')}
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
                       <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-2">{guideLang === 'en' ? 'Select a message' : 'Sélectionnez un message'}</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                         {guideLang === 'en' ? 'View and manage communications of your Nexus clients in real time.' : 'Visualisez et gérez les communications de vos clients Nexus en temps réel.'}
                       </p>
                    </div>
                 </div>
               )}

               {/* Background Glow */}
               <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />
            </div>
          </motion.div>
        )}

        {activeTab === 'broadcast' && (
          <motion.div 
            key="broadcast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {renderGuide()}
            
            {!config && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-500 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-bold">
                  {guideLang === 'en' 
                    ? "Offline Demo Mode: No active WooCommerce configuration detected. Showing simulated e-commerce audience list. Select a connection in your 'Sites' menu to interact with your live store."
                    : "Mode Démo Hors-ligne : Aucun WordPress configuré. Affichage d'une liste de clients fictive pour illustration. Sélectionnez un site dans l'onglet 'Sites' pour charger vos vrais clients."}
                </p>
              </div>
            )}

            {customersError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 text-red-500 text-xs">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-bold">
                    {guideLang === 'en' 
                      ? `WooCommerce Sync Notice: ${customersError}. Displaying demo sandbox entries.`
                      : `Note de Synchronisation WooCommerce : ${customersError}. Affichage de la base de démonstration.`}
                  </p>
                </div>
                <button 
                  onClick={fetchWooCustomers}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  {guideLang === 'en' ? 'RETRY SYNC' : 'RECONNECTER'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Target List Segment Builder */}
              <div className="xl:col-span-7 bg-slate-950 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-purple-500" />
                      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
                        {guideLang === 'en' ? 'Mailing List Builder' : 'Gestionnaire des Listes de Diffusion'}
                      </h3>
                    </div>
                    {(config || (audienceType === 'nexus' && isSuperAdmin)) && (
                      <button 
                        onClick={audienceType === 'nexus' ? fetchNexusUsers : fetchWooCustomers}
                        disabled={isLoadingCustomers}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer animate-none"
                        title={guideLang === 'en' ? 'Sync contacts' : 'Synchroniser les contacts'}
                      >
                        <RefreshCw className={cn("w-4 h-4", isLoadingCustomers && "animate-spin")} />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                    {guideLang === 'en' ? 'Create high converting segment selections' : 'Créez vos listes de distribution ultra-ciblées en un clic'}
                  </p>

                  {isSuperAdmin && (
                    <div className="flex bg-slate-900/60 border border-slate-900 p-1 rounded-2xl max-w-md mt-4 gap-1.5 shadow-inner">
                      <button
                        onClick={() => {
                          setAudienceType('woo');
                          setCustomers([]);
                          setSelectedCustomerEmails([]);
                        }}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                          audienceType === 'woo'
                            ? "bg-purple-600/20 text-purple-400 border border-purple-500/25"
                            : "text-slate-500 hover:text-white border border-transparent"
                        )}
                      >
                        <Users className="w-3.5 h-3.5" />
                        {guideLang === 'en' ? 'WooCommerce Store' : 'Clients WooCommerce'}
                      </button>
                      <button
                        onClick={() => {
                          setAudienceType('nexus');
                          setCustomers([]);
                          setSelectedCustomerEmails([]);
                        }}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                          audienceType === 'nexus'
                            ? "bg-purple-600/20 text-purple-400 border border-purple-500/25"
                            : "text-slate-500 hover:text-white border border-transparent"
                        )}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {guideLang === 'en' ? 'Nexus CRM / SaaS' : 'Membres Nexus SaaS'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Filters Section */}
                <div className="space-y-4 bg-black/40 p-5 rounded-3xl border border-slate-900">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative font-bold">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder={guideLang === 'en' ? "Search by customer name, username, email..." : "Chercher par nom, utilisateur, email..."}
                        className="w-full bg-black border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-[11px] text-white outline-none focus:border-purple-600 transition-all font-bold placeholder-slate-700"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const filtered = getFilteredCustomers().map(c => c.email);
                          setSelectedCustomerEmails(filtered);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        {guideLang === 'en' ? 'Select All' : 'Cocher Tout'}
                      </button>
                      <button 
                        onClick={() => setSelectedCustomerEmails([])}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        {guideLang === 'en' ? 'Deselect All' : 'Décocher Tout'}
                      </button>
                    </div>
                  </div>

                  {/* Preloaded Segments Selection */}
                  <div className="space-y-3 pt-2 border-t border-slate-900/60">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      {guideLang === 'en' ? 'Intelligent Quick Segments' : 'Ajustements de Segmentation Automatiques'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label_en: 'All Customers', label_fr: 'Tous les Clients' },
                        { id: 'vip', label_en: 'VIP Spenders (Spent >= $150)', label_fr: 'Gros Acheteurs (Spent >= 150€)' },
                        { id: 'frequent', label_en: 'Frequent Purchases (Orders >= 3)', label_fr: 'Clients Fidèles (Achats >= 3)' },
                        { id: 'prospects', label_en: 'New Target Prospects (Orders <= 1)', label_fr: 'Nouveaux Prospects (<= 1 com.)' },
                      ].map((seg) => (
                        <button 
                          key={seg.id}
                          onClick={() => {
                            setSegmentFilter(seg.id as any);
                            const raw = [...customers];
                            let filteredList = raw;
                            if (seg.id === 'vip') filteredList = raw.filter(c => (c.total_spent || 0) >= 150);
                            else if (seg.id === 'frequent') filteredList = raw.filter(c => (c.orders_count || 0) >= 3);
                            else if (seg.id === 'prospects') filteredList = raw.filter(c => (c.orders_count || 0) <= 1);
                            setSelectedCustomerEmails(filteredList.map(c => c.email));
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer",
                            segmentFilter === seg.id 
                              ? "bg-purple-600/20 text-purple-400 border border-purple-500/35" 
                              : "bg-slate-900 text-slate-500 border border-slate-850 hover:text-slate-350"
                          )}
                        >
                          {guideLang === 'en' ? seg.label_en : seg.label_fr}
                        </button>
                      ))}
                    </div>

                    {/* Manual Numeric sliders */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                          {guideLang === 'en' ? 'Minimum Spent ($)' : 'Montant Dépensé Minimum (€)'}
                        </label>
                        <div className="relative">
                          <DollarSign className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            type="number"
                            value={minSpent}
                            onChange={(e) => {
                              setMinSpent(e.target.value);
                              setSegmentFilter('custom');
                            }}
                            placeholder="e.g. 50"
                            className="w-full bg-black border border-slate-900 rounded-xl pl-8 pr-3 py-2 text-[10px] text-slate-300 outline-none focus:border-purple-600 font-black"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                          {guideLang === 'en' ? 'Minimum Orders' : 'Volume d\'Achats Minimum'}
                        </label>
                        <input 
                          type="number"
                          value={minOrders}
                          onChange={(e) => {
                            setMinOrders(e.target.value);
                            setSegmentFilter('custom');
                          }}
                          placeholder="e.g. 2"
                          className="w-full bg-black border border-slate-900 rounded-xl px-3 py-2 text-[10px] text-slate-300 outline-none focus:border-purple-600 font-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Status */}
                <div className="flex items-center justify-between p-4 bg-purple-950/20 border border-purple-500/10 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00ff66]" />
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-wide">
                      {guideLang === 'en' ? 'Active Target Audience Size:' : 'Taille de l\'Audience Ciblée :'}
                    </p>
                  </div>
                  <div className="text-[11px] font-black text-[#00ff66]">
                    {selectedCustomerEmails.length} / {getFilteredCustomers().length} {guideLang === 'en' ? 'selected' : 'sélectionnés'}
                  </div>
                </div>

                {/* Audience Table list */}
                <div className="bg-black/40 rounded-3xl border border-slate-900 max-h-[350px] overflow-y-auto">
                  {isLoadingCustomers ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                      <RefreshCw className="w-7 h-7 animate-spin text-purple-500 mb-2.5" />
                      <p className="text-[9px] font-black uppercase tracking-widest">
                        {guideLang === 'en' ? 'Extracting client index...' : 'Mise à jour des profils clients...'}
                      </p>
                    </div>
                  ) : getFilteredCustomers().length === 0 ? (
                    <div className="p-16 text-center text-slate-550">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {guideLang === 'en' ? 'No registered customers found matching filters.' : 'Aucun client ne correspond à votre ciblage.'}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900/60 text-[7px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="py-4 pl-6 w-12 text-center">
                            <input 
                              type="checkbox"
                              checked={getFilteredCustomers().length > 0 && getFilteredCustomers().every(c => selectedCustomerEmails.includes(c.email))}
                              onChange={(e) => {
                                const list = getFilteredCustomers().map(c => c.email);
                                if (e.target.checked) {
                                  setSelectedCustomerEmails(prev => Array.from(new Set([...prev, ...list])));
                                } else {
                                  setSelectedCustomerEmails(prev => prev.filter(email => !list.includes(email)));
                                }
                              }}
                              className="rounded bg-black border-slate-800 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                          </th>
                          <th className="py-4 px-4">{guideLang === 'en' ? 'Customer Profile' : 'Données du Client'}</th>
                          <th className="py-4 px-4 text-center">{guideLang === 'en' ? 'Orders Placed' : 'Nbre Commandes'}</th>
                          <th className="py-4 pr-6 text-right">{guideLang === 'en' ? 'Total Spent' : 'Somme Dépensée'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/40 text-[9.5px]">
                        {getFilteredCustomers().map((cust) => {
                          const isChecked = selectedCustomerEmails.includes(cust.email);
                          const isDemo = String(cust.id).startsWith('demo');
                          return (
                            <tr 
                              key={cust.id}
                              className={cn(
                                "hover:bg-slate-900/10 transition-colors",
                                isChecked ? "bg-purple-950/10" : ""
                              )}
                            >
                              <td className="py-3 pl-6 text-center">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedCustomerEmails(prev => prev.filter(e => e !== cust.email));
                                    } else {
                                      setSelectedCustomerEmails(prev => [...prev, cust.email]);
                                    }
                                  }}
                                  className="rounded bg-black border-slate-800 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-extrabold text-white text-[10.5px] leading-none flex items-center gap-1.5 flex-wrap">
                                  <span>{cust.full_name}</span>
                                  {isDemo && (
                                    <span className="text-[6.5px] font-black text-slate-500 bg-slate-900 px-1 py-0.5 rounded uppercase tracking-wider">
                                      Démo
                                    </span>
                                  )}
                                  {!isDemo && String(cust.id).startsWith('order-') && (
                                    <span className="text-[6.5px] font-black text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded uppercase tracking-wider">
                                      Guest
                                    </span>
                                  )}
                                  {cust.isNexus && (
                                    <>
                                      <span className="text-[6.5px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        {cust.plan_name || 'Nexus SaaS'}
                                      </span>
                                      {cust.sub_status === 'active' ? (
                                        <span className="text-[6.5px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                          Active
                                        </span>
                                      ) : (
                                        <span className="text-[6.5px] font-black text-slate-400 bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                          {cust.sub_status || 'Inactive'}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="text-[8.5px] text-slate-500 mt-0.5 font-bold font-mono leading-none">{cust.email}</div>
                              </td>
                              <td className="py-3 px-4 text-center font-extrabold text-slate-300 font-mono">
                                {cust.orders_count}
                              </td>
                              <td className="py-3 pr-6 text-right font-black text-[#00ff66] font-mono">
                                {(cust.total_spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {cust.isNexus ? '€' : (config?.currency || '€')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Mass Newsletter Broadcast Panel */}
              <div className="xl:col-span-5 bg-slate-950 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
                      {guideLang === 'en' ? 'Responsive Newsletters Broadcast' : 'Diffuseur de Campagnes d\'Emailing'}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                    {guideLang === 'en' ? 'Manage, style, and send interactive dynamic emails' : 'Rédigez et diffusez vos messages de fidélisation stylisés'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Template Picker */}
                  <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
                      {guideLang === 'en' ? 'REUSE DESIGN SCRIPT (OPTIONAL)' : 'RÉUTILISER UN EMAIL CRÉÉ (OPTIONNEL)'}
                    </label>
                    <select 
                      value={selectedBroadcastTemplateId}
                      onChange={(e) => setSelectedBroadcastTemplateId(Number(e.target.value))}
                      className="w-full bg-black border border-slate-850 rounded-2xl px-4 py-3 text-[10.5px] text-slate-300 font-extrabold outline-none focus:border-purple-600 cursor-pointer"
                    >
                      <option value="0">
                        {guideLang === 'en' ? '-- Select a ready email --' : '-- Sélectionner un email rédigé --'}
                      </option>
                      {templates.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name} {tpl.subject ? `(${tpl.subject})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campaign Subject */}
                  <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
                      {guideLang === 'en' ? 'Email Campaign Subject' : 'Objet de la Campagne'}
                    </label>
                    <input 
                      type="text"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      placeholder={guideLang === 'en' ? "Exclusive gifts for {{first_name}}!" : "Cadeaux exclusifs pour {{first_name}} !"}
                      className="w-full bg-black border border-slate-850 rounded-2xl px-4 py-3.5 text-[11px] text-white font-extrabold placeholder-slate-700 outline-none focus:border-purple-600 transition-all font-sans"
                    />
                  </div>

                  {/* Themes Styling row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
                        {guideLang === 'en' ? 'Primary Theme Color' : 'Couleur Principale'}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={broadcastPrimaryColor}
                          onChange={(e) => setBroadcastPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                        />
                        <input 
                          type="text"
                          value={broadcastPrimaryColor}
                          onChange={(e) => setBroadcastPrimaryColor(e.target.value)}
                          className="flex-1 bg-black border border-slate-850 rounded-xl px-2 py-1.5 text-[8.5px] text-slate-400 text-center font-mono leading-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
                        {guideLang === 'en' ? 'Accent/Button Color' : 'Couleur Secondaire'}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={broadcastAccentColor}
                          onChange={(e) => setBroadcastAccentColor(e.target.value)}
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                        />
                        <input 
                          type="text"
                          value={broadcastAccentColor}
                          onChange={(e) => setBroadcastAccentColor(e.target.value)}
                          className="flex-1 bg-black border border-slate-850 rounded-xl px-2 py-1.5 text-[8.5px] text-slate-400 text-center font-mono leading-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Body Body Content */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 block">
                        {guideLang === 'en' ? 'Email Body Message Content' : 'Corps de l\'Email'}
                      </label>
                      <span className="text-[6.5px] font-black bg-purple-600/10 border border-purple-500/25 text-purple-400 rounded-lg px-2 py-0.5">
                        HTML ENRICHED ⚡
                      </span>
                    </div>
                    <textarea 
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      placeholder={guideLang === 'en' ? "Write your newsletter body text here..." : "Saisissez votre newsletter ici..."}
                      className="w-full h-44 bg-black border border-slate-850 rounded-3xl p-4 text-[10.5px] text-slate-300 outline-none focus:border-purple-600 transition-all font-medium resize-none leading-relaxed"
                    />
                  </div>

                  {/* Personalization Cheat sheet help */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-slate-900 text-left space-y-1">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      {guideLang === 'en' ? 'Dynamic Custom Fields (Evaluated dynamically per client):' : 'Variables de Personnalisation (Calculées dynamiquement par client) :'}
                    </p>
                    <div className="flex flex-wrap gap-1 font-mono text-[7.5px]">
                      {[
                        { tag: '{{user_name}}', desc: 'Full Name' },
                        { tag: '{{first_name}}', desc: 'First Name' },
                        { tag: '{{last_name}}', desc: 'Last Name' },
                        { tag: '{{email}}', desc: 'User Email' },
                        { tag: '{{orders_count}}', desc: 'Total Orders' },
                        { tag: '{{total_spent}}', desc: 'Total Spent' },
                        { tag: '{{SENDER_NAME}}', desc: 'Sender' },
                      ].map(t => (
                        <div 
                          key={t.tag}
                          className="px-1.5 py-0.5 bg-slate-900 border border-slate-850 text-slate-400 select-all cursor-copy rounded"
                          title={t.desc}
                        >
                          {t.tag}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mass Diffusion Action */}
                  <div className="pt-2">
                    {broadcastProgress ? (
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-purple-400">
                          <span>{broadcastStatusMessage || (guideLang === 'en' ? 'TRANSMITTING NEWSLETTERS...' : 'ENVOI GROUPÉ COMPILÉ...')}</span>
                          <span>{broadcastProgress.current} / {broadcastProgress.total}</span>
                        </div>
                        {/* Interactive Progress tracker */}
                        <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-[#00ff66] h-full transition-all duration-300"
                            style={{ width: `${(broadcastProgress.current / broadcastProgress.total) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-black font-mono">
                          <span className="text-[#00ff66]">✓ {broadcastProgress.successCount} DELIVERED</span>
                          {broadcastProgress.failedCount > 0 && <span className="text-red-400">✗ {broadcastProgress.failedCount} ERRORS</span>}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleSendBroadcast}
                        disabled={isSendingBroadcast || selectedCustomerEmails.length === 0}
                        className="w-full py-4.5 text-[#00ff66] bg-[#00ff66]/10 hover:bg-[#00ff66]/15 border border-[#00ff66]/20 hover:border-[#00ff55]/40 rounded-3xl text-[9px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-emerald-950/10 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {guideLang === 'en' 
                          ? `LAUNCH BULK BROADCAST TO ${selectedCustomerEmails.length} TARGETS` 
                          : `DÉMARRER LA DIFFUSION EN MASSE À ${selectedCustomerEmails.length} CLIENTS`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

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
                      <h3 className="text-3xl font-black text-white italic">
                        {analytics.reduce((acc, curr) => acc + (curr.sent || 0), 0)}
                      </h3>
                    </div>
                    <div className="p-3 bg-blue-600/10 rounded-xl">
                      <Send className="w-5 h-5 text-blue-500" />
                    </div>
                 </div>
                 <div className="h-16 w-full">
                    <Sparkline data={analytics.length > 0 ? analytics.map(d => d.sent || 0).reverse() : [0, 0]} color="#3b82f6" height={60} />
                 </div>
              </div>

              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{guideLang === 'en' ? 'Open Rate' : 'Taux d’Ouverture'}</p>
                      <h3 className="text-3xl font-black text-white italic">
                        {(() => {
                          const totalSent = analytics.reduce((acc, curr) => acc + (curr.sent || 0), 0);
                          const totalOpened = analytics.reduce((acc, curr) => acc + (curr.opened || 0), 0);
                          return totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0.0";
                        })()}%
                      </h3>
                    </div>
                    <div className="p-3 bg-purple-600/10 rounded-xl">
                      <Eye className="w-5 h-5 text-purple-500" />
                    </div>
                 </div>
                 <div className="h-16 w-full">
                    <Sparkline data={analytics.length > 0 ? analytics.map(d => d.opened || 0).reverse() : [0, 0]} color="#a855f7" height={60} />
                 </div>
              </div>

              <div className="bg-[#0c0e14] border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{guideLang === 'en' ? 'Deliverability' : 'Délivrabilité'}</p>
                      <h3 className="text-3xl font-black text-white italic">
                        {(() => {
                          const totalSent = analytics.reduce((acc, curr) => acc + (curr.sent || 0), 0);
                          const totalFailed = analytics.reduce((acc, curr) => acc + (curr.failed || 0), 0);
                          const totalAttempts = totalSent + totalFailed;
                          return totalAttempts > 0 ? ((totalSent / totalAttempts) * 100).toFixed(1) : "0.0";
                        })()}%
                      </h3>
                    </div>
                    <div className="p-3 bg-emerald-600/10 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                 </div>
                 <div className="h-16 w-full">
                    <Sparkline 
                      data={
                        analytics.length > 0 
                          ? analytics.map(d => {
                              const tot = (d.sent || 0) + (d.failed || 0);
                              return tot > 0 ? ((d.sent || 0) / tot) * 150 : 0;
                            }).reverse() 
                          : [0, 0]
                      } 
                      color="#10b981" 
                      height={60} 
                    />
                 </div>
              </div>
            </div>

            <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <History className="w-4 h-4" /> {guideLang === 'en' ? 'Recent Send History' : 'Historique des Envois Récents'}
              </h3>
              {recentLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 pb-3 text-slate-500 uppercase tracking-widest text-[9px] font-black">
                        <th className="py-4 font-black">{guideLang === 'en' ? 'Date & Time' : 'Date & Heure'}</th>
                        <th className="py-4 font-black">{guideLang === 'en' ? 'Recipient' : 'Destinataire'}</th>
                        <th className="py-4 font-black">{guideLang === 'en' ? 'Subject' : 'Objet'}</th>
                        <th className="py-4 font-black text-center">{guideLang === 'en' ? 'Status' : 'Statut'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {recentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 text-slate-400 font-mono text-[10px]">
                            {new Date(log.created_at).toLocaleString(guideLang === 'en' ? 'en-US' : 'fr-FR', {
                              year: 'numeric', month: '2-digit', day: '2-digit',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </td>
                          <td className="py-4 text-white font-medium">{log.recipient}</td>
                          <td className="py-4 text-slate-350">{log.subject || (guideLang === 'en' ? '(No subject)' : '(Sans objet)')}</td>
                          <td className="py-4 text-center">
                            {log.status === 'failed' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase bg-red-500/10 border border-red-500/20 text-red-500">
                                <span className="w-1 h-1 rounded-full bg-red-500" /> {guideLang === 'en' ? 'Failed' : 'Échec'}
                              </span>
                            ) : log.status === 'delivered' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <span className="w-1 h-1 rounded-full bg-emerald-500" /> {guideLang === 'en' ? 'Delivered' : 'Délivré'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                <span className="w-1 h-1 rounded-full bg-purple-500" /> {guideLang === 'en' ? 'Opened' : 'Ouvert'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-3 py-14 text-center">
                  <Mail className="w-10 h-10 mx-auto text-slate-850" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{guideLang === 'en' ? 'No emails sent in production mode yet' : 'Aucun e-mail envoyé en mode production pour le moment'}</p>
                  <p className="text-[9px] text-slate-600">{guideLang === 'en' ? 'Tracking and history will begin automatically when you send your first emails.' : "Le calcul et l'historisation démarreront automatiquement dès vos premiers envois."}</p>
                </div>
              )}
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
            {renderGuide()}
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
                        placeholder={guideLang === 'en' ? "E.g., Write a welcome email for my new Pro package with a 10% coupon..." : "Ex: Rédige un email de bienvenue pour mon nouveau pack Pro avec un coupon de 10%..."}
                        className="w-full h-32 bg-black border border-slate-800 rounded-3xl p-6 text-[11px] text-slate-300 focus:border-purple-500 transition-all outline-none resize-none"
                      />
                      <button 
                        onClick={handleAiCompose}
                        disabled={isAiComposing || !aiPrompt}
                        className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-30 shadow-xl shadow-purple-900/40"
                      >
                        {isAiComposing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {isAiComposing ? (guideLang === 'en' ? 'AI ANALYZING & WRITING...' : 'ANALYSE & RÉDACTION AI...') : (guideLang === 'en' ? 'GENERATE TEMPLATE' : 'GÉNÉRER LA TEMPLATE')}
                      </button>
                    </div>

                    <div className="w-full md:w-96 min-h-[160px] bg-black/40 border border-slate-800 rounded-3xl p-6 relative overflow-y-auto max-h-64">
                       {generatedTemplate ? (
                         <div className="space-y-4">
                            <div>
                               <p className="text-[8px] font-bold text-purple-500 uppercase mb-1">{guideLang === 'en' ? 'Proposed Subject' : 'Sujet Proposé'}</p>
                               <p className="text-[11px] font-black text-white">{generatedTemplate.subject}</p>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 text-[9px] text-slate-400 font-mono">
                               {generatedTemplate.body.substring(0, 200)}...
                            </div>
                            <button 
                              onClick={saveGeneratedTemplate}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                              {guideLang === 'en' ? 'SAVE THIS TEMPLATE' : 'ENREGISTRER CETTE TEMPLATE'}
                            </button>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full opacity-20 text-center py-10">
                            <Bot className="w-8 h-8 mb-2" />
                            <p className="text-[8px] font-black uppercase tracking-widest">{guideLang === 'en' ? 'Awaiting instructions' : "En attente d'instruction"}</p>
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
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">{guideLang === 'en' ? 'Create Manually' : 'Créer Manuellement'}</p>
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
                        {guideLang === 'en' ? 'Edit' : 'Editer'}
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className={cn("transition-all duration-200 uppercase font-black text-[8px] flex items-center justify-center gap-1 rounded-xl", deletingTemplateId === tpl.id ? "bg-red-600 text-white animate-pulse px-4 py-2.5" : "p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white")}
                        title={deletingTemplateId === tpl.id ? (guideLang === 'en' ? "Confirm deletion" : "Confirmer la suppression") : (guideLang === 'en' ? "Delete" : "Supprimer")}
                      >
                        {deletingTemplateId === tpl.id ? (guideLang === 'en' ? "Sure?" : "Sûr ?") : <Trash2 className="w-4 h-4" />}
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
            {renderGuide()}
            <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Zap className="w-4 h-4" /> {guideLang === 'en' ? 'Active Automation Rules' : 'Règles d’Automations Actives'}
                  </h3>
                  <button 
                    onClick={() => {
                      setFormRule({ name: '', description: '', trigger_key: '', scope: '', template_id: templates[0]?.id || 0 });
                      setIsRuleModalOpen(true);
                    }}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20"
                  >
                    {guideLang === 'en' ? 'NEW RULE' : 'NOUVELLE RÈGLE'}
                  </button>
               </div>

               <div className="space-y-4">
                  {rules.length === 0 && (
                    <div className="p-10 text-center opacity-20 border border-dashed border-slate-800 rounded-3xl">
                      <Zap className="w-10 h-10 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">{guideLang === 'en' ? 'No rules configured' : 'Aucune règle configurée'}</p>
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
                             <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{rule.description || (guideLang === 'en' ? 'Intelligent automated action' : 'Action automatisée intelligente')}</p>
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
                            className={cn("p-2 transition-all text-[9px] font-black uppercase flex items-center gap-1", deletingRuleId === rule.id ? "text-red-500 animate-pulse opacity-100" : "text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100")}
                            title={deletingRuleId === rule.id ? (guideLang === 'en' ? "Confirm deletion" : "Confirmer la suppression") : (guideLang === 'en' ? "Delete" : "Supprimer")}
                          >
                            {deletingRuleId === rule.id ? (guideLang === 'en' ? "Sure?" : "Sûr ?") : <Trash2 className="w-4 h-4" />}
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
                    <SettingsIcon className="w-4 h-4" /> {guideLang === 'en' ? 'SMTP Server Configuration (Sending)' : 'Configuration Serveur SMTP (Envoi)'}
                  </h3>

                  <div className="space-y-8">
                     {/* Provider Type Selection Switch */}
                     <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setSmtpSettings({ ...smtpSettings, provider_type: 'SMTP' })}
                          className={cn(
                            "flex-1 py-3.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                            (smtpSettings.provider_type || 'SMTP') === 'SMTP'
                              ? "bg-slate-800 text-white shadow-lg"
                              : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          {guideLang === 'en' ? 'SMTP Server' : 'Serveur SMTP'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSmtpSettings({ ...smtpSettings, provider_type: 'RESEND_API' })}
                          className={cn(
                            "flex-1 py-3.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                            smtpSettings.provider_type === 'RESEND_API'
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                              : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          <Zap className="w-3.5 h-3.5" /> {guideLang === 'en' ? 'Resend API' : 'API HTTP Resend'}
                        </button>
                     </div>

                     {/* CONDITIONAL SMTP FIELDS OR RESEND FIELDS */}
                     {smtpSettings.provider_type === 'RESEND_API' ? (
                       <div className="space-y-2 animate-fade-in">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? 'Resend API Key' : 'Clé API Resend'}</label>
                          <input 
                            value={smtpSettings.resend_api_key || ''}
                            onChange={(e) => setSmtpSettings({...smtpSettings, resend_api_key: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                            placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                            type="password"
                          />
                          <p className="text-[8px] text-slate-500 lowercase mt-1 leading-normal">
                             {guideLang === 'en' ? 'Tip: Resend API is robust on serverless containers.' : 'Astuce: L\'API HTTP Resend évite les blocages de ports stricts sur Cloud Run.'}
                          </p>
                       </div>
                     ) : (
                       <div className="space-y-8 animate-fade-in">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? 'SMTP Host Server' : 'Serveur SMTP Host'}</label>
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
                                onChange={(e) => setSmtpSettings({...smtpSettings, port: parseInt(e.target.value) || 587})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                                placeholder="587"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? 'Security' : 'Sécurité'}</label>
                              <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 gap-1">
                                 <button 
                                   type="button"
                                   onClick={() => setSmtpSettings({...smtpSettings, secure: 0})}
                                   className={cn(
                                     "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                     smtpSettings.secure === 0 ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                                   )}
                                 >
                                   <Unlock className="w-3 h-3" /> TLS
                                 </button>
                                 <button 
                                   type="button"
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
                              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? 'SMTP Username' : 'Utilisateur SMTP'}</label>
                              <input 
                                value={smtpSettings.auth_user || ''}
                                onChange={(e) => setSmtpSettings({...smtpSettings, auth_user: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                                placeholder="user@example.com"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? 'App Password' : 'Mot de Passe App'}</label>
                              <input 
                                type="password"
                                value={smtpSettings.auth_pass || ''}
                                onChange={(e) => setSmtpSettings({...smtpSettings, auth_pass: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••••••"
                              />
                           </div>
                         </div>
                       </div>
                     )}

                     {/* COMMON FROM DETAILS */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? '"From" Name' : 'Nom "Depuis"'}</label>
                          <input 
                            value={smtpSettings.from_name || ''}
                            onChange={(e) => setSmtpSettings({...smtpSettings, from_name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all"
                            placeholder="Ma Boutique Store"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? '"From" Email' : 'Email "Depuis"'}</label>
                          <input 
                            value={smtpSettings.from_email || ''}
                            onChange={(e) => setSmtpSettings({...smtpSettings, from_email: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all"
                            placeholder="hello@store.com"
                          />
                       </div>
                     </div>

                     {/* DYNAMIC SMTP & RESEND CONNECTION TESTER */}
                     <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-[1.8rem] space-y-4">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                           {guideLang === 'en' ? 'Recipient field for live testing' : 'Destinataire pour l\'e-mail de test'}
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                           <input 
                             value={testSmtpRecipient}
                             onChange={(e) => setTestSmtpRecipient(e.target.value)}
                             className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-slate-300 focus:border-blue-500 outline-none transition-all"
                             placeholder={user?.email || "destinataire@exemple.com"}
                           />
                           <button 
                             type="button"
                             onClick={() => handleTestConnection('smtp')}
                             disabled={isTestingSmtp}
                             className="py-4 px-8 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-500 transition-all flex items-center justify-center gap-3"
                           >
                             {isTestingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-blue-500" />}
                             {guideLang === 'en' ? 'TEST CONNECTION' : "TESTER L'ENVOI"}
                           </button>
                           {smtpStatus === 'success' && <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"><CheckCircle2 className="w-4 h-4"/> OK</div>}
                        </div>
                     </div>
                      {smtpStatus === 'error' && smtpError && (
                        <div className="p-4 bg-red-400/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-start gap-2.5 leading-relaxed mt-4">
                          <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                          <div className="flex-1 font-sans">
                            <div className="font-black text-red-400 text-left">{guideLang === 'en' ? '[SMTP TEST SEND FAILED]' : "[ÉCHEC DE L'ENVOI DE TEST STMP]"}</div>
                            <div className="text-[11px] text-slate-300 font-mono mt-1 select-all break-all lowercase text-left">{smtpError}</div>
                            <div className="text-[9px] text-slate-400 font-medium normal-case tracking-normal mt-2 leading-relaxed text-left">
                              {guideLang === 'en' ? <>⚠️ <strong>Hosting Provider Firewall Blocking (Hostinger/OVH)</strong>: Your production server is hosted on Google Cloud Run. Shared email hosting providers like <strong>Hostinger, OVH, or GoDaddy</strong> regularly block incoming SMTP connections originating from cloud servers (Google Cloud, AWS, DigitalOcean) to prevent spam.</> : <>⚠️ <strong>Blocage Pare-feu d'Hébergeur (Hostinger/OVH)</strong> : Votre serveur de production est hébergé sur Google Cloud Run. Les fournisseurs d'emails mutualisés comme <strong>Hostinger, OVH ou GoDaddy</strong> bloquent régulièrement les connexions SMTP entrantes provenant des serveurs Cloud (Google Cloud, AWS, DigitalOcean) pour se prémunir du spam.</>}
                              <br/><br/>
                              💡 <strong>{guideLang === 'en' ? 'Direct resolution options:' : 'Options de résolution directes :'}</strong>
                              <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>{guideLang === 'en' ? <><strong>Option 1 (Recommended &amp; Free Plan):</strong> Create a free account on a trusted SMTP relay designed for the cloud, such as <strong>Brevo (Sendinblue), Resend, or Mailgun</strong>. These platforms run smoothly on Cloud Run without limitations and provide generous daily free quotas!</> : <><strong>Option 1 (Recommandée &amp; Offre Gratuite) :</strong> Créez un compte gratuit sur un relais SMTP de confiance conçu pour le cloud, comme <strong>Brevo (Sendinblue), Resend ou Mailgun</strong>. Ces plateformes fonctionnent sans restriction sur Cloud Run et offrent de généreux quotas quotidiens !</>}</li>
                                <li>{guideLang === 'en' ? <><strong>Option 2:</strong> Try toggling from direct port <code>465 (SSL)</code> to alternate backup port <code>587</code> while changing security to <strong>TLS</strong>.</> : <><strong>Option 2 :</strong> Essayez de basculer du port direct <code>465 (SSL)</code> au port alternatif de secours <code>587</code> en changeant la sécurité sur <strong>TLS</strong>.</>}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="hidden">
                     </div>
                  </div>
               </div>

               {/* IMAP CONFIG */}
               <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                    <History className="w-4 h-4 text-purple-500" /> {guideLang === 'en' ? 'IMAP Server Configuration (Receiving)' : 'Configuration Serveur IMAP (Réception)'}
                  </h3>

                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? 'IMAP Host Server' : 'Serveur IMAP Host'}</label>
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
                               {guideLang === 'en' ? 'Unsecured' : 'Non Sécurisé'}
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
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? 'IMAP Username' : 'Utilisateur IMAP'}</label>
                          <input 
                            value={imapSettings.auth_user || ''}
                            onChange={(e) => setImapSettings({...imapSettings, auth_user: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-purple-400 focus:border-purple-500 outline-none transition-all"
                            placeholder="user@example.com"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{guideLang === 'en' ? 'App Password' : 'Mot de Passe App'}</label>
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
                         {guideLang === 'en' ? 'TEST IMAP' : 'TESTER IMAP'}
                       </button>
                       {imapStatus === 'success' && <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"><CheckCircle2 className="w-4 h-4"/> OK</div>}
                      </div>
                      {imapStatus === 'error' && imapError && (
                        <div className="p-4 bg-red-400/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-start gap-2.5 leading-relaxed mt-4">
                          <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                          <div className="flex-1 font-sans">
                            <div className="font-black text-red-400 text-left">{guideLang === 'en' ? '[IMAP CONNECTION TEST FAILED]' : "[ÉCHEC DU TEST DE CONNEXION IMAP]"}</div>
                            <div className="text-[11px] text-slate-300 font-mono mt-1 select-all break-all lowercase text-left">{imapError}</div>
                            <div className="text-[9px] text-slate-400 font-medium normal-case tracking-normal mt-2 leading-relaxed text-left">
                              {guideLang === 'en' ? <>⚠️ <strong>IMAP Blocking (Hostinger/OVH)</strong>: Google Cloud Run or your email provider sometimes filter IMAP requests originating from public cloud servers for anti-spam reasons.</> : <>⚠️ <strong>Blocage IMAP (Hostinger/OVH)</strong> : Google Cloud Run ou votre hébergeur d'emails filtre parfois les requêtes IMAP provenant de serveurs cloud publics pour des raisons de lutte anti-spam.</>}
                              <br/><br/>
                              💡 <strong>{guideLang === 'en' ? 'Direct resolution options:' : 'Pistes de résolution directes :'}</strong>
                              <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>{guideLang === 'en' ? <>Verify that your password is an <strong>"App Password"</strong> generated from your Hostinger panel and not the main mailbox password.</> : <>Vérifiez que votre mot de passe est bien un <strong>"Mot de passe d'application"</strong> créé depuis votre panneau Hostinger et non le mot de passe de votre boîte mail principale.</>}</li>
                                <li>{guideLang === 'en' ? <>Verify the IMAP host address (e.g., imap.hostinger.com or imap.gmail.com).</> : <>Vérifiez l'adresse d'hôte IMAP (ex: imap.hostinger.com ou imap.gmail.com).</>}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="hidden">
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleSaveSettings}
                  disabled={isSavingSmtp}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSavingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSavingSmtp ? (guideLang === 'en' ? 'SAVING...' : 'ENREGISTREMENT...') : (guideLang === 'en' ? 'SAVE ALL CONFIGURATIONS' : 'SAUVEGARDER TOUTES LES CONFIGURATIONS')}
                </button>

               {saveStatus !== 'idle' && (
                 <div className={cn(
                   "mt-6 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 border",
                   saveStatus === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                 )}>
                   <div className="flex items-center gap-4">
                     {saveStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] text-center">
                       {saveStatus === 'success' ? (guideLang === 'en' ? 'YOUR SETTINGS HAVE BEEN SYNCHRONIZED' : 'VOS PARAMÈTRES ONT ÉTÉ SYNCHRONISÉS') : (guideLang === 'en' ? 'SERVER COMMUNICATION ERROR' : 'ERREUR DE SÉCURITÉ OU DE CONFIGURATION')}
                     </span>
                   </div>
                   {saveStatus === 'error' && saveError && (
                     <p className="text-[10px] font-mono text-center text-red-400 mt-1 select-all break-all uppercase max-w-xl">
                       {saveError}
                     </p>
                   )}
                 </div>
               )}
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-950 border border-white/5 rounded-[2rem] p-8">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">{guideLang === 'en' ? 'SMTP / IMAP Help' : 'Aide SMTP / IMAP'}</h4>
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

               <div className="bg-slate-950 border border-white/5 rounded-[2rem] p-8 space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    {guideLang === 'en' ? 'AUTO-CONFIGURATION (DNS CNAME)' : 'CONFIGURATION AUTOMATIQUE (DNS CNAME)'}
                  </h4>
                  <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                    {guideLang === 'en' 
                      ? 'Add these CNAME records to your domain DNS settings so email clients can automatically discover your Hostinger mail server settings:' 
                      : "Ajoutez ces enregistrements CNAME dans les paramètres DNS de votre domaine pour que vos clients mail détectent automatiquement les paramètres d'envoi et réception Hostinger :"}
                  </p>
                  <div className="space-y-3 font-mono text-[8px]">
                    <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-2">
                      <div className="flex justify-between border-b border-white/5 pb-1 text-[7px] text-slate-500 uppercase font-black tracking-widest">
                        <span>{guideLang === 'en' ? 'TYPE & HOST' : 'TYPE / HÔTE'}</span>
                        <span>{guideLang === 'en' ? 'POINTS TO' : 'POINTE VERS'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 font-extrabold pb-1 border-b border-white/5">
                        <span className="bg-purple-950/40 text-purple-400 border border-purple-500/10 px-1.5 py-0.5 rounded tracking-normal">CNAME autoconfig</span>
                        <span className="text-right select-all cursor-pointer hover:text-white transition-colors">autoconfig.mail.hostinger.com</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 font-extrabold pt-1">
                        <span className="bg-purple-950/40 text-purple-400 border border-purple-500/10 px-1.5 py-0.5 rounded tracking-normal">CNAME autodiscover</span>
                        <span className="text-right select-all cursor-pointer hover:text-white transition-colors">autodiscover.mail.hostinger.com</span>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="w-5 h-5 text-indigo-500" />
                     <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{guideLang === 'en' ? 'Nexus AI Safety' : 'Sûreté Nexus AI'}</h4>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-bold uppercase tracking-tight">
                    {guideLang === 'en' ? 'All SMTP and IMAP configurations are securely stored and are exclusively used to manage your respective mailboxes.' : 'Toutes vos configurations SMTP et Antigravity sont stockées de manière sécurisée et ne sont utilisées que pour la gestion de vos boîtes mails respectives.'}
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
                        {editingTemplate ? (guideLang === 'en' ? 'Edit Template' : 'Editer Template') : (guideLang === 'en' ? 'New Template' : 'Nouvelle Template')}
                      </h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{guideLang === 'en' ? 'Manual configuration of the email script' : 'Configuration manuelle du script email'}</p>
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
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{guideLang === 'en' ? 'Template Name' : 'Nom de la Template'}</label>
                    <input 
                      value={formTemplate.name || ''}
                      onChange={(e) => setFormTemplate({ ...formTemplate, name: e.target.value })}
                      placeholder="Ex: Welcome Email Pro"
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{guideLang === 'en' ? 'Primary Color' : 'Couleur Primaire'}</label>
                       <div className="flex gap-3">
                          <input 
                            type="color"
                            value={formTemplate.brand_color}
                            onChange={(e) => handleBrandColorChange(e.target.value)}
                            className="w-12 h-12 rounded-xl bg-black border border-slate-800 cursor-pointer"
                          />
                          <input 
                            value={formTemplate.brand_color}
                            onChange={(e) => handleBrandColorChange(e.target.value)}
                            className="flex-1 bg-black/50 border border-slate-800 rounded-2xl px-6 py-3 text-[10px] text-white focus:border-purple-500 outline-none transition-all font-mono"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{guideLang === 'en' ? 'Accent Color' : 'Couleur Accent'}</label>
                       <div className="flex gap-3">
                          <input 
                            type="color"
                            value={formTemplate.accent_color}
                            onChange={(e) => handleAccentColorChange(e.target.value)}
                            className="w-12 h-12 rounded-xl bg-black border border-slate-800 cursor-pointer"
                          />
                          <input 
                            value={formTemplate.accent_color}
                            onChange={(e) => handleAccentColorChange(e.target.value)}
                            className="flex-1 bg-black/50 border border-slate-800 rounded-2xl px-6 py-3 text-[10px] text-white focus:border-purple-500 outline-none transition-all font-mono"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{guideLang === 'en' ? 'Email Subject' : "Objet de l'Email"}</label>
                    <input 
                      value={formTemplate.subject || ''}
                      onChange={(e) => setFormTemplate({ ...formTemplate, subject: e.target.value })}
                      placeholder="Ex: Bienvenue sur Nexus AI !"
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{guideLang === 'en' ? 'Message Body' : 'Corps du Message'}</label>
                      <div className="flex bg-black/50 p-1 rounded-xl border border-white/5">
                        <button 
                          onClick={() => setModalMode('code')}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                            modalMode === 'code' ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          {guideLang === 'en' ? 'HTML Code' : 'Code HTML'}
                        </button>
                        <button 
                          onClick={() => setModalMode('preview')}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                            modalMode === 'preview' ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          {guideLang === 'en' ? 'Visual Preview' : 'Aperçu Visuel'}
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                      <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest">
                        {guideLang === 'en' ? 'Placeholders: {{user_name}} (Client), {{order_id}} (Order), {{SENDER_NAME}} (Your Name)' : 'Placeholders: {{user_name}} (Client), {{order_id}} (Commande), {{SENDER_NAME}} (Votre Nom)'}
                      </p>
                    </div>

                    {modalMode === 'code' ? (
                      <textarea 
                        value={formTemplate.body_html || ''}
                        onChange={(e) => setFormTemplate({ ...formTemplate, body_html: e.target.value })}
                        placeholder={guideLang === 'en' ? "Type your email content here..." : "Tapez le contenu de votre email ici..."}
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
                              <body>${getPreviewHtml()}</body>
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
                    {isSaving ? (guideLang === 'en' ? 'SAVING...' : 'ENREGISTREMENT...') : (guideLang === 'en' ? 'SAVE TEMPLATE' : 'SAUVEGARDER LA TEMPLATE')}
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
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{guideLang === 'en' ? 'New Rule' : 'Nouvelle Règle'}</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{guideLang === 'en' ? 'Intelligent communication automation' : 'Automation de communication intelligente'}</p>
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
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{guideLang === 'en' ? 'Rule Name' : 'Nom de la Règle'}</label>
                    <input 
                      value={formRule.name || ''}
                      onChange={(e) => setFormRule({ ...formRule, name: e.target.value })}
                      placeholder="Ex: Confirmation de Commande"
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{guideLang === 'en' ? 'Trigger Key (Event)' : 'Déclencheur (Trigger Key)'}</label>
                    <select 
                      value={formRule.trigger_key || ''}
                      onChange={(e) => setFormRule({ ...formRule, trigger_key: e.target.value })}
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value="">{guideLang === 'en' ? 'Select an event' : 'Sélectionner un évènement'}</option>
                      <option value="new_order">{guideLang === 'en' ? 'New Order (Woo)' : 'Nouvelle Commande (Woo)'}</option>
                      <option value="order_completed">{guideLang === 'en' ? 'Order Completed (Woo)' : 'Commande Terminée (Woo)'}</option>
                      <option value="abandoned_cart">{guideLang === 'en' ? 'Abandoned Cart (Woo)' : 'Panier Abandonné (Woo)'}</option>
                      <option value="new_subscription">{guideLang === 'en' ? 'New Subscription (SaaS)' : 'Nouvel Abonnement (SaaS)'}</option>
                      <option value="payment_failed">{guideLang === 'en' ? 'Payment Failed (SaaS)' : 'Échec de Paiement (SaaS)'}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{guideLang === 'en' ? 'Template to Send' : 'Template à Envoyer'}</label>
                    <select 
                      value={formRule.template_id}
                      onChange={(e) => setFormRule({ ...formRule, template_id: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value={0}>{guideLang === 'en' ? 'Choose a template' : 'Choisir une template'}</option>
                      {templates.map(tpl => (
                        <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{guideLang === 'en' ? 'Description (Optional)' : 'Description (Optionnel)'}</label>
                    <textarea 
                      value={formRule.description || ''}
                      onChange={(e) => setFormRule({ ...formRule, description: e.target.value })}
                      placeholder={guideLang === 'en' ? "Short summary of the action..." : "Petit résumé de l'action..."}
                      className="w-full h-24 bg-black/50 border border-slate-800 rounded-3xl p-6 text-[11px] text-slate-300 focus:border-emerald-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleSaveRule}
                    disabled={isSavingRule}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 disabled:opacity-50"
                  >
                    {isSavingRule ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSavingRule ? (guideLang === 'en' ? 'CREATING...' : 'CRÉATION...') : (guideLang === 'en' ? 'ACTIVATE RULE' : 'ACTIVER LA RÈGLE')}
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
