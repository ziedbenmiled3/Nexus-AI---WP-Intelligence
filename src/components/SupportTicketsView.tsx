import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  Send, 
  MessageSquare, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Bug, 
  Sparkles, 
  HelpCircle,
  Clock, 
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../providers/FirebaseProvider';
import { cn } from '../lib/utils';
import { SupportTicket } from '../types';

export default function SupportTicketsView({ activeTab }: { activeTab: string }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'bug' | 'suggestion' | 'connection' | 'other'>('bug');
  
  // Selected ticket for details
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    setError(null);
    try {
      const ticketsList = await firebaseService.getUserSupportTickets(user.email);
      setTickets(ticketsList || []);
    } catch (err: any) {
      console.error('[Support] Error loading tickets:', err);
      setError("Impossible de charger l'historique de vos tickets de support.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !subject.trim() || !description.trim()) return;

    setIsSubmitLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const browserInfo = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
      const ticketPayload: Omit<SupportTicket, 'id'> = {
        user_email: user.email.toLowerCase(),
        subject: subject.trim(),
        description: description.trim(),
        category,
        status: 'new',
        active_tab: activeTab,
        browser_info: browserInfo,
        created_at: new Date().toISOString()
      };

      await firebaseService.createSupportTicket(ticketPayload);
      
      setSuccess("Votre ticket a été créé avec succès et transmis aux administrateurs. Nous vous répondrons dès que possible !");
      setSubject('');
      setDescription('');
      setCategory('bug');
      setIsCreateOpen(false);
      
      // Reload tickets
      await loadTickets();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 8000);
    } catch (err: any) {
      console.error('[Support] Error submitting ticket:', err);
      setError("Une erreur est survenue lors de la création du ticket. Veuillez essayer à nouveau.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'bug':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-black uppercase text-red-400 tracking-wider">
            <Bug className="w-3 h-3" /> Bug / Erreur
          </span>
        );
      case 'suggestion':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles className="w-3 h-3" /> Suggestion
          </span>
        );
      case 'connection':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black uppercase text-blue-400 tracking-wider">
            <RefreshCw className="w-3 h-3" /> Connexion API / CORS
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-500/10 border border-slate-500/20 rounded-full text-[9px] font-black uppercase text-slate-400 tracking-wider">
            <HelpCircle className="w-3 h-3" /> Autre question
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[9px] font-black uppercase text-blue-400 tracking-widest">
            Nouveau
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[9px] font-black uppercase text-amber-400 tracking-widest animate-pulse">
            En Cours
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-black uppercase text-emerald-400 tracking-widest">
            Résolu
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 font-sans">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-blue-500" />
            SUPPORT & TICKETS
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Faites remonter vos problèmes ou suggestions directement vers l'équipe Admin
          </p>
        </div>

        <button 
          onClick={() => setIsCreateOpen(true)}
          className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Soumettre un Ticket
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-black uppercase tracking-tight">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-400/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0c0e14] border border-slate-800 rounded-[2rem] p-6 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic border-b border-white/5 pb-4">
              Vos tickets de support
            </h3>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recherche de vos tickets dans le Nexus...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <LifeBuoy className="w-12 h-12 text-slate-800 mx-auto" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aucun ticket actif</p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase">Tout fonctionne comme prévu ! N'hésitez pas à nous faire part si vous observez des anomalies.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 divide-y divide-white/5">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "pt-4 first:pt-0 pb-4 flex items-center justify-between cursor-pointer rounded-xl px-4 py-3 hover:bg-white/5 border transition-all",
                      selectedTicket?.id === ticket.id ? "bg-white/5 border-slate-700" : "border-transparent"
                    )}
                  >
                    <div className="space-y-2 min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(ticket.category)}
                        {getStatusBadge(ticket.status)}
                      </div>
                      <h4 className="text-sm font-black text-white truncate italic uppercase tracking-tight">
                        {ticket.subject}
                      </h4>
                      <p className="text-[10px] text-slate-600 font-bold uppercase flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-600" />
                        Soumis le : {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 text-slate-600 pr-1 transition-transform",
                      selectedTicket?.id === ticket.id && "rotate-90 text-blue-400"
                    )} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Selected Ticket Details or Advice */}
        <div className="space-y-4">
          {selectedTicket ? (
            <div className="bg-[#0c0e14] border border-slate-800 rounded-[2rem] p-6 space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[8px] font-mono font-black text-slate-600 uppercase">Ticket ID: {selectedTicket.id}</span>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="text-[9px] font-black text-slate-500 hover:text-white uppercase"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(selectedTicket.category)}
                  {getStatusBadge(selectedTicket.status)}
                </div>

                <h3 className="text-base font-black text-white uppercase italic tracking-tight">
                  {selectedTicket.subject}
                </h3>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl relative">
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                    <FileText className="w-2.5 h-2.5 text-blue-500" />
                    <span className="text-[7px] font-black text-blue-500 uppercase">Message</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap leading-relaxed pt-2">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Captured Diagnostics Area */}
                <div className="p-3 bg-slate-900/40 rounded-xl space-y-1.5">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Analyse de diagnostic capturée :</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Section active : <span className="text-blue-500 font-mono tracking-tight">{selectedTicket.active_tab}</span></p>
                  {selectedTicket.browser_info && (
                    <p className="text-[8px] font-mono text-slate-600 truncate uppercase mt-1">Navigateur : {selectedTicket.browser_info}</p>
                  )}
                </div>

                {/* Admin Reply Area */}
                <div className="h-[1px] bg-white/5 my-6" />

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    Réponse de la direction (Admin)
                  </h4>

                  {selectedTicket.admin_reply ? (
                    <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl space-y-2">
                      <p className="text-xs text-slate-200 font-semibold whitespace-pre-wrap leading-relaxed">
                        {selectedTicket.admin_reply}
                      </p>
                      {selectedTicket.updated_at && (
                        <p className="text-[8px] font-mono text-slate-600 uppercase text-right pt-2">
                          Mise à jour : {new Date(selectedTicket.updated_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/40 border border-slate-900 border-dashed rounded-2xl text-center py-6">
                      <Clock className="w-6 h-6 text-slate-800 mx-auto mb-2 animate-pulse" />
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">En attente d'avis technique</p>
                      <p className="text-[8px] text-slate-700 font-bold uppercase mt-1">Nos administrateurs examinent votre session.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0c0e14]/50 border border-slate-800 border-dashed rounded-[2rem] p-8 text-center space-y-4">
              <LifeBuoy className="w-10 h-10 text-slate-800 mx-auto" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Informations administratives</p>
                <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 leading-relaxed">
                  Sélectionnez un ticket à gauche pour afficher les diagnostics complets, l'état de validation technique du CDN ou la réponse rédigée par l'administrateur système.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creation Ticket Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0e14] border border-slate-800 rounded-[2.5rem] p-8 max-w-lg w-full relative"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <LifeBuoy className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Soumettre un ticket de support</h3>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="text-[9px] font-black text-slate-500 hover:text-white uppercase"
                >
                  Annuler
                </button>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sujet du ticket</label>
                  <input 
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Erreur lors de l'envoi de commandes sur WooCommerce"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Catégorie du problème</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-all font-semibold"
                  >
                    <option value="bug">🐛 Bug de fonctionnalités / Erreur d'affichage</option>
                    <option value="connection">🔌 Liaison WooCommerce / Erreur CORS ou API</option>
                    <option value="suggestion">💡 Suggestion / Autre idée d'amélioration</option>
                    <option value="other">❓ Autre question technique</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Description détaillée</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Veuillez décrire le problème rencontré en détail ou les actions qui ont mené à l'anomalie..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white h-36 placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all leading-relaxed font-semibold"
                    required
                  />
                </div>

                {/* Inform diagnostic capture detail */}
                <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                  <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed">
                    ⚙️ NOTE DIAGNOSTIQUE : Pour faciliter le travail des administrateurs, l'appareil capturera automatiquement la page actuelle ({activeTab}), votre navigateur et votre session en direct.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateOpen(false)} 
                    className="flex-1 py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Fermer
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitLoading || !subject.trim() || !description.trim()}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {isSubmitLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                    <span>Transmettre</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
