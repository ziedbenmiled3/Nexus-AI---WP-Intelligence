import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Send,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'stock' | 'seo' | 'support';
  status: 'active' | 'pending';
  invitedAt: string;
  invitedBy?: string;
}

export default function CollaborationView() {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  // Multi-language strings
  const labels = {
    title: isEn ? "Team Collaboration" : "Collaboration & Équipe",
    subtitle: isEn ? "Invite colleagues and delegate workspace access securely" : "Invitez des collaborateurs et déléguez l'accès de manière sécurisée",
    inviteTitle: isEn ? "Invite a Collaborator" : "Inviter un collaborateur",
    emailPlaceholder: isEn ? "collaborator@company.com" : "exemple@collaborateur.com",
    roleLabel: isEn ? "Assigned Role" : "Rôle Assigné",
    btnInvite: isEn ? "Send Invite" : "Envoyer l'Invitation",
    activeMembers: isEn ? "Active Team Members" : "Membres Actifs de l'Équipe",
    pendingInvites: isEn ? "Pending Invitations" : "Invitations en Attente",
    searchPlaceholder: isEn ? "Search by email or name..." : "Rechercher par email ou nom...",
    roleAdmin: isEn ? "Administrator" : "Administrateur",
    roleStock: isEn ? "Stock Manager" : "Gestionnaire de Stock",
    roleSEO: isEn ? "SEO & Content Editor" : "Rédacteur SEO & Contenu",
    roleSupport: isEn ? "Support Agent" : "Agent de Support",
    copySuccess: isEn ? "Invitation Link Copied!" : "Lien d'invitation copié !",
    noMembers: isEn ? "No other team members yet." : "Aucun autre membre pour le moment.",
    noInvites: isEn ? "No active pending invitations." : "Aucune invitation en attente.",
    successInvite: isEn ? "Invite registered successfully!" : "Invitation enregistrée avec succès !",
    errorEmail: isEn ? "Please enter a valid email address." : "Veuillez entrer une adresse email valide.",
    deleteConfirm: isEn ? "Are you sure you want to remove this member?" : "Êtes-vous sûr de vouloir retirer ce collaborateur ?",
  };

  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Zied Ben Miled', email: 'ziedbenmiled3@gmail.com', role: 'admin', status: 'active', invitedAt: '2026-01-10T12:00:00Z' }
  ]);
  const [invites, setInvites] = useState<TeamMember[]>([
    { id: 'inv1', name: 'Sarah Dubois', email: 'sarah.dubois@nexuswp.pro', role: 'seo', status: 'pending', invitedAt: '2026-05-28T14:30:00Z' },
    { id: 'inv2', name: 'Jean Dupont', email: 'j.dupont@logistic.com', role: 'stock', status: 'pending', invitedAt: '2026-05-29T09:12:00Z' }
  ]);

  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'admin' | 'stock' | 'seo' | 'support'>('seo');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatus, setShowStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Load from local storage baseline combined with hardcoded values for safety
  useEffect(() => {
    const savedM = localStorage.getItem('nexus_team_members');
    const savedI = localStorage.getItem('nexus_team_invites');
    if (savedM) {
      try { setMembers(JSON.parse(savedM)); } catch {}
    }
    if (savedI) {
      try { setInvites(JSON.parse(savedI)); } catch {}
    }
  }, []);

  const saveToLocalStorage = (mList: TeamMember[], iList: TeamMember[]) => {
    localStorage.setItem('nexus_team_members', JSON.stringify(mList));
    localStorage.setItem('nexus_team_invites', JSON.stringify(iList));
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setShowStatus({ type: 'error', message: labels.errorEmail });
      setTimeout(() => setShowStatus(null), 3000);
      return;
    }

    const newInvite: TeamMember = {
      id: 'inv_' + Date.now(),
      name: emailInput.split('@')[0],
      email: emailInput.trim(),
      role: roleInput,
      status: 'pending',
      invitedAt: new Date().toISOString()
    };

    const updatedInvites = [newInvite, ...invites];
    setInvites(updatedInvites);
    saveToLocalStorage(members, updatedInvites);
    
    setEmailInput('');
    setShowStatus({ type: 'success', message: labels.successInvite });
    setTimeout(() => setShowStatus(null), 3000);
  };

  const handleRemoveMember = (id: string, isInvite: boolean) => {
    if (window.confirm(labels.deleteConfirm)) {
      if (isInvite) {
        const filtered = invites.filter(item => item.id !== id);
        setInvites(filtered);
        saveToLocalStorage(members, filtered);
      } else {
        const filtered = members.filter(item => item.id !== id);
        setMembers(filtered);
        saveToLocalStorage(filtered, invites);
      }
    }
  };

  const handlePromoteInvite = (item: TeamMember) => {
    const promoted: TeamMember = {
      ...item,
      status: 'active',
      invitedAt: new Date().toISOString()
    };
    const updatedMembers = [...members, promoted];
    const updatedInvites = invites.filter(i => i.id !== item.id);
    setMembers(updatedMembers);
    setInvites(updatedInvites);
    saveToLocalStorage(updatedMembers, updatedInvites);
  };

  const copyInviteLink = (id: string) => {
    const link = `${window.location.origin}/exclusive?invite=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMembers = members.filter(m => 
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{labels.title}</h2>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{labels.subtitle}</p>
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0c0e14] border border-slate-800 rounded-2xl pl-11 pr-6 py-3.5 text-[10px] uppercase font-black tracking-wider text-white placeholder-slate-600 focus:border-purple-600 outline-none w-full md:w-80 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Invite Form */}
        <div className="lg:col-span-1 bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/10 rounded-xl">
              <UserPlus className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{labels.inviteTitle}</h3>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{isEn ? "EMAIL ADDRESS" : "ADRESSE E-MAIL"}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={labels.emailPlaceholder}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-700 outline-none focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{labels.roleLabel}</label>
              <select 
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as any)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-600 transition-colors cursor-pointer font-bold uppercase tracking-wider"
              >
                <option value="admin" className="bg-[#0c0e14]" >🔐 {labels.roleAdmin}</option>
                <option value="stock" className="bg-[#0c0e14]">📦 {labels.roleStock}</option>
                <option value="seo" className="bg-[#0c0e14]">✍️ {labels.roleSEO}</option>
                <option value="support" className="bg-[#0c0e14]">🔌 {labels.roleSupport}</option>
              </select>
            </div>

            <AnimatePresence>
              {showStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    showStatus.type === 'success' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  {showStatus.message}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-950/20"
            >
              <Send className="w-3.5 h-3.5" />
              {labels.btnInvite}
            </button>
          </form>

          {/* Guidelines */}
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <span className="text-purple-400 font-extrabold">{isEn ? "ACCESS CONTROL : " : "CONTRÔLE DES ACCÈS : "}</span>
            {isEn 
              ? "Each collaborator receives custom sub-menus matching their designated roles." 
              : "Chaque collaborateur recevra uniquement les accès spécifiques liés à son rôle Nexus."}
          </div>
        </div>

        {/* Team List & Invites Grid */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Members Card */}
          <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Shield className="w-4 h-4 text-emerald-500" /> {labels.activeMembers}
            </h3>

            {filteredMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800/60 pb-3 text-slate-550 uppercase tracking-widest text-[9px] font-black">
                      <th className="py-4 font-black">{isEn ? "User Profile" : "Profil Collaborateur"}</th>
                      <th className="py-4 font-black">{isEn ? "Assigned Role" : "Rôle"}</th>
                      <th className="py-4 font-black">{isEn ? "Joined At" : "Date d'admission"}</th>
                      <th className="py-4 font-black text-right">{isEn ? "Actions" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="py-4 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-black uppercase">
                              {member.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-extrabold text-white text-[11px] uppercase tracking-wide">{member.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-mono pr-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase ${
                            member.role === 'admin' 
                              ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                              : member.role === 'stock'
                              ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                              : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          }`}>
                            {member.role === 'admin' && labels.roleAdmin}
                            {member.role === 'stock' && labels.roleStock}
                            {member.role === 'seo' && labels.roleSEO}
                            {member.role === 'support' && labels.roleSupport}
                          </span>
                        </td>
                        <td className="py-4 text-slate-500 font-mono text-[9.5px]">
                          {new Date(member.invitedAt).toLocaleDateString('fr-FR', {
                            year: 'numeric', month: '2-digit', day: '2-digit'
                          })}
                        </td>
                        <td className="py-4 text-right">
                          {member.email.toLowerCase() !== 'ziedbenmiled3@gmail.com' ? (
                            <button 
                              onClick={() => handleRemoveMember(member.id, false)}
                              className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title={isEn ? "Remove access" : "Retirer les accès"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[8px] font-black tracking-widest text-[#0e8a5a] uppercase bg-[#10b981]/15 px-2.5 py-1 rounded-md">PROPR</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                {labels.noMembers}
              </div>
            )}
          </div>

          {/* Pending Invitations Card */}
          <div className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Clock className="w-4 h-4 text-purple-400" /> {labels.pendingInvites}
            </h3>

            {invites.length > 0 ? (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <div key={invite.id} className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-600/30 transition-all duration-350">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] font-black">
                        @
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-wider">{invite.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[8px] font-mono uppercase bg-slate-800/40 px-2 py-0.5 rounded text-purple-400 tracking-widest border border-purple-500/10">
                            {invite.role}
                          </span>
                          <span className="text-[8.5px] text-slate-500 font-bold uppercase">
                            • {isEn ? "Invited " : "Invité le "} {new Date(invite.invitedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <button 
                        onClick={() => handlePromoteInvite(invite)}
                        className="px-3.5 py-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:text-white text-emerald-400 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                        title={isEn ? "Accept / Simulate Join" : "Simuler la connexion"}
                      >
                        <Check className="w-3 h-3" />
                        {isEn ? "JOIN" : "REJOINDRE"}
                      </button>

                      <button 
                        onClick={() => copyInviteLink(invite.id)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                      >
                        {copiedId === invite.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{isEn ? "COPIED" : "COPIÉ"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isEn ? "COPY LINK" : "LIEN"}</span>
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => handleRemoveMember(invite.id, true)}
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title={isEn ? "Revoke Invite" : "Annuler l'invitation"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-650 text-[10px] font-bold uppercase tracking-widest">
                {labels.noInvites}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
