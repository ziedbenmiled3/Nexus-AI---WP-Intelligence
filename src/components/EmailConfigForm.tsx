import React, { useState } from 'react';
import axios from 'axios';
import { 
  Settings, 
  Zap, 
  Unlock, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Mail, 
  KeyRound, 
  User, 
  Server
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface SmtpSettings {
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

export interface EmailConfigFormProps {
  initialSettings?: SmtpSettings;
  userEmail?: string;
  onSaveSuccess?: () => void;
}

export default function EmailConfigForm({ initialSettings, userEmail, onSaveSuccess }: EmailConfigFormProps) {
  const [settings, setSettings] = useState<SmtpSettings>({
    host: initialSettings?.host || '',
    port: initialSettings?.port || 587,
    secure: initialSettings?.secure ?? 0,
    auth_user: initialSettings?.auth_user || '',
    auth_pass: initialSettings?.auth_pass || '',
    from_name: initialSettings?.from_name || '',
    from_email: initialSettings?.from_email || '',
    provider_type: initialSettings?.provider_type || 'SMTP',
    resend_api_key: initialSettings?.resend_api_key || ''
  });

  const [testRecipient, setTestRecipient] = useState(userEmail || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await axios.post('/api/comm/settings', { 
        smtp: settings 
      }, { 
        headers: { 'x-user-email': userEmail } 
      });
      setSaveStatus('success');
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSaveStatus('idle'), 5000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus('idle');
    setTestError(null);

    try {
      const response = await axios.post('/api/comm/test-connection', {
        provider_type: settings.provider_type,
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        auth_user: settings.auth_user,
        auth_pass: settings.auth_pass,
        resend_api_key: settings.resend_api_key,
        from_name: settings.from_name,
        from_email: settings.from_email,
        test_recipient: testRecipient
      }, {
        headers: { 'x-user-email': userEmail }
      });

      if (response.data.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestError("Échec du test d'envoi.");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || "Erreur de communication avec le serveur de test";
      setTestStatus('error');
      setTestError(errMsg);
    } finally {
      setIsTesting(false);
    }
  };

  const isResend = settings.provider_type === 'RESEND_API';

  return (
    <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-10 max-w-4xl mx-auto space-y-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-3">
            <Settings className="w-4 h-4 text-blue-500" /> Mode de Distribution Email
          </h3>
          <p className="text-[12px] text-slate-400 font-sans">
            Sélectionnez votre protocole d'expédition d'e-mails pour l'automatisation Nexus.
          </p>
        </div>

        {/* Switch Selector */}
        <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 gap-1 w-full md:w-auto h-fit">
          <button
            type="button"
            onClick={() => setSettings({ ...settings, provider_type: 'SMTP' })}
            className={cn(
              "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              !isResend 
                ? "bg-slate-800 text-white shadow-lg shadow-white/5" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Server className="w-3.5 h-3.5" /> Serveur SMTP
          </button>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, provider_type: 'RESEND_API' })}
            className={cn(
              "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2" ,
              isResend 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Zap className="w-3.5 h-3.5" /> API HTTP Resend
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 font-sans">
        {/* CONDITIONAL RENDER: SMTP FIELDS */}
        {!isResend && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Serveur SMTP Host</label>
                <input 
                  type="text"
                  required
                  value={settings.host}
                  onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                  placeholder="smtp.example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Port</label>
                <input 
                  type="number"
                  required
                  value={settings.port}
                  onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) || 587 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                  placeholder="587"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Sécurité</label>
                <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 gap-1">
                  <button 
                    type="button"
                    onClick={() => setSettings({ ...settings, secure: 0 })}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                      settings.secure === 0 ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <Unlock className="w-3 h-3" /> TLS
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSettings({ ...settings, secure: 1 })}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                      settings.secure === 1 ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <Lock className="w-3 h-3" /> SSL
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Utilisateur SMTP</label>
                <input 
                  type="text"
                  required
                  value={settings.auth_user}
                  onChange={(e) => setSettings({ ...settings, auth_user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Mot de Passe d'Application</label>
                <input 
                  type="password"
                  required
                  value={settings.auth_pass}
                  onChange={(e) => setSettings({ ...settings, auth_pass: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          </div>
        )}

        {/* CONDITIONAL RENDER: RESEND API KEY */}
        {isResend && (
          <div className="space-y-2 animate-fade-in">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" /> Clé API Resend
            </label>
            <input 
              type="password"
              required
              value={settings.resend_api_key}
              onChange={(e) => setSettings({ ...settings, resend_api_key: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-blue-400 focus:border-blue-500 outline-none transition-all"
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
              Astuce : Créez une clé d'API avec l'autorisation d'envoi d'emails (Sending) sur votre console d'administration Resend.com.
            </p>
          </div>
        )}

        {/* COMMON SENDER VALUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800/40 pt-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" /> Nom Depuis (Expéditeur)
            </label>
            <input 
              type="text"
              required
              value={settings.from_name}
              onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all"
              placeholder="Ex: Nexus Store"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Depuis (Expéditeur)
            </label>
            <input 
              type="email"
              required
              value={settings.from_email}
              onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all"
              placeholder="Ex: contact@votre-domaine.com"
            />
          </div>
        </div>

        {/* TEST SUITE COMPONENT */}
        <div className="bg-slate-950/60 rounded-3xl p-6 border border-slate-800/80 space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" /> Tester la Connexion &amp; l'Envoi
          </h4>
          <p className="text-[10px] text-slate-500">
            Saisissez l'email d'un destinataire alternatif pour déclencher un envoi de test et valider la configuration.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input 
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-2xl px-5 py-4 text-[11px] text-slate-300 focus:border-slate-500 outline-none transition-all"
                placeholder="Mon-email-test@exemple.com"
              />
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || (!isResend && !settings.host)}
              className="px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-600 disabled:opacity-40 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-blue-500" /> : <Zap className="w-4 h-4 text-blue-500" />}
              Tester l'envoi
            </button>
          </div>

          {/* Test connection alert message container */}
          {testStatus === 'success' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[11px] font-black tracking-wide flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>[ENVOI DE TEST RÉUSSI] : L'e-mail a été envoyé avec succès à {testRecipient} !</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[11px] font-mono flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-sans">
                  <div className="font-black text-red-400">[ÉCHEC DE L'ENVOI DE TEST]</div>
                  <div className="text-[11px] text-slate-300 font-mono mt-1 select-all break-all">{testError}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SAVE SUBMIT CONTAINER */}
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-6 bg-blue-600 border border-blue-500 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] text-white hover:bg-blue-500 shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-5 h-5" />}
            {isSaving ? 'Enregistrement...' : 'Sauvegarder les Paramètres'}
          </button>

          {saveStatus === 'success' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[11px] text-center font-black uppercase tracking-widest animate-fade-in">
              ✨ Paramètres enregistrés et synchronisés avec succès !
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-[11px] text-center font-black uppercase tracking-widest animate-fade-in">
              ❌ Erreur de communication réseau lors de la sauvegarde !
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
