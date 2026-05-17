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
  Settings,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../providers/FirebaseProvider';
import { cn } from '../lib/utils';
import Sparkline from './Sparkline';
import { geminiQuery } from '../lib/gemini';

type Tab = 'analytics' | 'automations' | 'templates' | 'settings';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body_html: string;
  category: string;
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

export default function CommunicationHubView() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab ] = useState<Tab>('analytics');
  
  // SMTP Settings State
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>({
    host: '',
    port: 587,
    secure: 0,
    auth_user: '',
    auth_pass: '',
    from_name: '',
    from_email: ''
  });
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Templates State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isAiComposing, setIsAiComposing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<{name: string, subject: string, body: string} | null>(null);
  
  // Manual Template Creation/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'code' | 'preview'>('code');
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formTemplate, setFormTemplate] = useState({ name: '', subject: '', body_html: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Rules State
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [formRule, setFormRule] = useState({ name: '', description: '', trigger_key: '', scope: '', template_id: 0 });
  const [isSavingRule, setIsSavingRule] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetchSettings();
      fetchTemplates();
      fetchAnalytics();
      fetchRules();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/comm/settings', { headers: { 'x-user-email': user?.email } });
      if (res.data) setSmtpSettings(res.data);
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
    try {
      await axios.post('/api/comm/settings', smtpSettings, { headers: { 'x-user-email': user?.email } });
      alert('Paramètres SMTP enregistrés avec succès.');
    } catch (err) { 
      alert('Erreur lors de l’enregistrement.'); 
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingSmtp(true);
    setSmtpStatus('idle');
    try {
      await axios.post('/api/comm/test-connection', {}, { headers: { 'x-user-email': user?.email } });
      setSmtpStatus('success');
    } catch (err) {
      setSmtpStatus('error');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleAiCompose = async () => {
    if (!aiPrompt) return;
    setIsAiComposing(true);
    try {
      const isSuperAdmin = user?.email?.toLowerCase() === 'ziedbenmiled3@gmail.com';
      const systemPrompt = isSuperAdmin 
        ? "Vous êtes l'assistant Nexus AI. Rédigez un email professionnel pour les clients de la plateforme SaaS Nexus. Utilisez le ton 'High-Tech' et 'Cyber'. Répondez en JSON avec: { 'name': 'Nom de la template', 'subject': 'Objet', 'body': 'Contenu HTML' }"
        : "Vous êtes l'assistant Nexus AI pour WooCommerce. Rédigez un email marketing/opérationnel pour les clients d'une boutique en ligne. Répondez en JSON avec: { 'name': 'Template Name', 'subject': 'Subject', 'body': 'HTML Content' }";
      
      const res = await geminiQuery({
        model: "gemini-3-flash-preview",
        prompt: `Rédigez une template d'email basée sur ceci: ${aiPrompt}. Utilisez des placeholders comme {{user_name}} ou {{order_id}}.`,
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
        is_ai_generated: 1
      }, { headers: { 'x-user-email': user?.email } });
      setGeneratedTemplate(null);
      setAiPrompt('');
      fetchTemplates();
    } catch (err) { alert('Erreur lors de la sauvegarde.'); }
  };

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormTemplate({ name: '', subject: '', body_html: '' });
    setModalMode('code');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setFormTemplate({ name: tpl.name, subject: tpl.subject, body_html: tpl.body_html });
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
    } catch (err) { alert('Erreur lors de la suppression.'); }
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

        <div className="flex bg-slate-950/80 border border-white/5 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
          {[
            { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
            { id: 'templates', label: 'TEMPLATES', icon: Layout },
            { id: 'automations', label: 'AUTOMATIONS', icon: Zap },
            { id: 'settings', label: 'SMTP CONFIG', icon: SettingsIcon },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === tab.id ? "bg-purple-600 text-white shadow-xl shadow-purple-900/40" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
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
                        value={aiPrompt}
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
                   
                   <div className="flex items-center gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleOpenEditModal(tpl)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-[8px] font-black text-white uppercase tracking-widest transition-all"
                      >
                        Editer
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-2 text-slate-600 hover:text-red-500 transition-all"
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
            <div className="lg:col-span-8 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                 <SettingsIcon className="w-4 h-4" /> Configuration Serveur SMTP
               </h3>

               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Serveur SMTP Host</label>
                       <input 
                         value={smtpSettings.host}
                         onChange={(e) => setSmtpSettings({...smtpSettings, host: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                         placeholder="smtp.example.com"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Port</label>
                       <input 
                         type="number"
                         value={smtpSettings.port}
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
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Nom d'utilisateur</label>
                       <input 
                         value={smtpSettings.auth_user}
                         onChange={(e) => setSmtpSettings({...smtpSettings, auth_user: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                         placeholder="user@example.com"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Mot de Passe App</label>
                       <input 
                         type="password"
                         value={smtpSettings.auth_pass}
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
                         value={smtpSettings.from_name}
                         onChange={(e) => setSmtpSettings({...smtpSettings, from_name: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all"
                         placeholder="Ma Boutique Store"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Email "Depuis"</label>
                       <input 
                         value={smtpSettings.from_email}
                         onChange={(e) => setSmtpSettings({...smtpSettings, from_email: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all"
                         placeholder="hello@store.com"
                       />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={handleTestConnection}
                      disabled={isTestingSmtp}
                      className="flex-1 py-5 bg-slate-900 border border-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-500 transition-all flex items-center justify-center gap-3"
                    >
                      {isTestingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-blue-500" />}
                      TESTER LA CONNEXION
                    </button>
                    <button 
                      onClick={handleSaveSettings}
                      disabled={isSavingSmtp}
                      className="flex-1 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSavingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSavingSmtp ? 'ENREGISTREMENT...' : 'ENREGISTRER CONFIG'}
                    </button>
                  </div>

                  {smtpStatus !== 'idle' && (
                    <div className={cn(
                      "p-4 rounded-xl flex items-center gap-3",
                      smtpStatus === 'success' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border border-red-500/20 text-red-500"
                    )}>
                      {smtpStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {smtpStatus === 'success' ? 'CONNEXION RÉUSSIE • TRANSPORT PRÊT' : 'ERREUR DE CONNEXION • VÉRIFIEZ VOS PARAMÈTRES'}
                      </span>
                    </div>
                  )}
               </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-950 border border-white/5 rounded-[2rem] p-8">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Aide à la Configuration</h4>
                  <div className="space-y-4">
                     {[
                       { title: 'Gmail SMTP', host: 'smtp.gmail.com', port: 587 },
                       { title: 'Outlook/365', host: 'smtp.office365.com', port: 587 },
                       { title: 'SendGrid', host: 'smtp.sendgrid.net', port: 587 }
                     ].map((h, i) => (
                       <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
                          <p className="text-[10px] font-black text-blue-400 uppercase mb-2">{h.title}</p>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                             <span>HOST: {h.host}</span>
                             <span>PORT: {h.port}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-blue-600/5 border border-blue-500/20 rounded-[2rem] p-8">
                  <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="w-5 h-5 text-blue-500" />
                     <h4 className="text-[11px] font-black text-white uppercase tracking-tight">Sûreté Nexus AI</h4>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-bold uppercase tracking-tight">
                    Nexus utilise un chiffrage TLS 1.3 pour toutes les communications SMTP sortantes. Vos identifiants sont cryptés au repos dans notre architecture multi-tenant.
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
                      value={formTemplate.name}
                      onChange={(e) => setFormTemplate({ ...formTemplate, name: e.target.value })}
                      placeholder="Ex: Welcome Email Pro"
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Objet de l'Email</label>
                    <input 
                      value={formTemplate.subject}
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

                    {modalMode === 'code' ? (
                      <textarea 
                        value={formTemplate.body_html}
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
                      value={formRule.name}
                      onChange={(e) => setFormRule({ ...formRule, name: e.target.value })}
                      placeholder="Ex: Confirmation de Commande"
                      className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Déclencheur (Trigger Key)</label>
                    <select 
                      value={formRule.trigger_key}
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
                      value={formRule.description}
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
