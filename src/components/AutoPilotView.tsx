import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  RotateCw, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Settings as SettingsIcon,
  ChevronRight,
  History,
  Trash2,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WPConfig } from '../types';
import { cn, safeJsonParse } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface AutomationTask {
  id: string;
  name: string;
  type: 'audit' | 'stock' | 'seo' | 'taxonomy' | 'recovery';
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRun?: string;
  nextRun: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  autoApply: boolean;
}

export default function AutoPilotView({ config }: { config: WPConfig }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<AutomationTask>>({
    name: '',
    type: 'audit',
    frequency: 'daily',
    autoApply: false
  });

  useEffect(() => {
    // Load tasks from localStorage (simulated persistence)
    const saved = localStorage.getItem(`nexus_autopilot_${config.url}`);
    if (saved) {
      setTasks(safeJsonParse(saved, []));
    } else {
      // Default tasks
      const defaults: AutomationTask[] = [
        { 
          id: '1', 
          name: 'Nexus Shield Daily Audit', 
          type: 'audit', 
          frequency: 'daily', 
          nextRun: new Date(Date.now() + 86400000).toISOString(),
          status: 'idle',
          autoApply: false
        },
        { 
          id: '2', 
          name: 'Smart SEO Optimizer', 
          type: 'seo', 
          frequency: 'weekly', 
          nextRun: new Date(Date.now() + 604800000).toISOString(),
          status: 'idle',
          autoApply: true
        }
      ];
      setTasks(defaults);
      localStorage.setItem(`nexus_autopilot_${config.url}`, JSON.stringify(defaults));
    }

    // Load history
    const savedHistory = localStorage.getItem(`nexus_history_${config.url}`);
    if (savedHistory) setHistory(safeJsonParse(savedHistory, []));
  }, [config.url]);

  const saveTasks = (newTasks: AutomationTask[]) => {
    setTasks(newTasks);
    localStorage.setItem(`nexus_autopilot_${config.url}`, JSON.stringify(newTasks));
  };

  const handleAddTask = () => {
    const task: AutomationTask = {
      id: Math.random().toString(36).substring(2, 9),
      name: newTask.name || 'Nouvelle tâche',
      type: newTask.type || 'audit',
      frequency: newTask.frequency || 'daily',
      nextRun: new Date(Date.now() + (newTask.frequency === 'daily' ? 86400000 : 604800000)).toISOString(),
      status: 'idle',
      autoApply: newTask.autoApply || false
    };
    const updated = [...tasks, task];
    saveTasks(updated);
    setIsAdding(false);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  const toggleTaskAutoApply = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, autoApply: !t.autoApply };
      }
      return t;
    });
    saveTasks(updated);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`nexus_history_${config.url}`);
  };

  const runTask = (id: string) => {
    // Simulate task run
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: 'running' as const };
      }
      return t;
    });
    setTasks(updated);

    setTimeout(() => {
      const finalTasks = tasks.map(t => {
        if (t.id === id) {
          const runDate = new Date().toISOString();
          // Log to history
          const isRecovery = t.type === 'recovery';
          const log = {
            id: Math.random().toString(36).substring(2, 9),
            taskName: t.name,
            date: runDate,
            result: 'Success',
            details: isRecovery 
              ? (isEn ? `Successfully sent abandoned cart recovery emails to ${Math.floor(Math.random() * 8) + 3} customers.` : `Envoi d'e-mails de relance de paniers abandonnés effectué à ${Math.floor(Math.random() * 8) + 3} destinataires automatiquement.`)
              : `Optimisation de ${Math.floor(Math.random() * 50) + 10} ressources effectuée.`
          };
          const updatedHistory = [log, ...history].slice(0, 50);
          setHistory(updatedHistory);
          localStorage.setItem(`nexus_history_${config.url}`, JSON.stringify(updatedHistory));

          return { 
            ...t, 
            status: 'completed' as const, 
            lastRun: runDate,
            nextRun: new Date(Date.now() + (t.frequency === 'daily' ? 86400000 : 604800000)).toISOString()
          };
        }
        return t;
      });
      saveTasks(finalTasks);
      
      // Reset status to idle after a few seconds
      setTimeout(() => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'idle' } : t));
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center gap-4">
            NEXUS AUTO-PILOT
            <span className="bg-blue-600 text-xs px-3 py-1 rounded-full not-italic tracking-widest uppercase">Phase III</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.4em]">
            {isEn ? "Intelligent Automation & Autonomous Maintenance" : "Automatisation Intelligente & Maintenance Autonome"}
          </p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="px-8 py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl"
        >
          <Zap className="w-4 h-4" /> {isEn ? "New Automation" : "Nouvelle Automatisation"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Automations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400">
                     <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">
                    {isEn ? "Active Protocols" : "Protocoles Actifs"}
                  </h3>
               </div>
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                 {tasks.length} {isEn ? "Scheduled Tasks" : "Tâches Planifiées"}
               </span>
            </div>

            <div className="divide-y divide-slate-800">
              {tasks.map(task => (
                <div key={task.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-all group">
                   <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
                        task.status === 'running' 
                          ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50 scale-110" 
                          : "bg-slate-950 border-slate-800 group-hover:border-slate-700"
                      )}>
                         {task.type === 'audit' && <Shield className={cn("w-6 h-6", task.status === 'running' ? "text-white" : "text-slate-500")} />}
                         {task.type === 'stock' && <RotateCw className={cn("w-6 h-6", task.status === 'running' ? "text-white" : "text-slate-500")} />}
                         {task.type === 'seo' && <Sparkles className={cn("w-6 h-6", task.status === 'running' ? "text-white" : "text-slate-500")} />}
                         {task.type === 'taxonomy' && <Zap className={cn("w-6 h-6", task.status === 'running' ? "text-white" : "text-slate-500")} />}
                         {task.type === 'recovery' && <Mail className={cn("w-6 h-6", task.status === 'running' ? "text-white" : "text-slate-500")} />}
                      </div>
                      <div>
                         <h4 className="font-black text-white uppercase tracking-tight text-sm mb-1">
                           {task.name}
                           {task.status === 'running' && (
                             <span className="ml-3 text-[8px] text-blue-400 animate-pulse font-black uppercase tracking-widest">
                               {isEn ? "Analyzing..." : "Analyses en cours..."}
                             </span>
                           )}
                         </h4>
                         <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                              {task.frequency === 'daily' 
                                ? (isEn ? 'daily' : 'quotidien')
                                : task.frequency === 'weekly'
                                  ? (isEn ? 'weekly' : 'hebdomadaire')
                                  : (isEn ? 'monthly' : 'mensuel')
                              }
                            </span>
                            <div className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              {isEn ? "Next run: " : "Prochain run : "}{new Date(task.nextRun).toLocaleDateString()}
                            </span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Auto-Apply</span>
                         <div 
                           onClick={() => toggleTaskAutoApply(task.id)}
                           className={cn(
                             "w-12 h-6 rounded-full p-1 transition-colors cursor-pointer",
                             task.autoApply ? "bg-emerald-600" : "bg-slate-800"
                           )}
                         >
                            <div className={cn(
                              "w-4 h-4 rounded-full bg-white transition-all transform",
                              task.autoApply ? "translate-x-6" : "translate-x-0"
                            )} />
                         </div>
                      </div>

                      <div className="h-10 w-[1px] bg-slate-800 mx-2 hidden md:block" />

                      <div className="flex gap-2">
                        <button 
                          onClick={() => runTask(task.id)}
                          disabled={task.status === 'running'}
                          className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all disabled:opacity-50"
                          title={isEn ? "Launch now" : "Lancer maintenant"}
                        >
                           <Play className={cn("w-4 h-4", task.status === 'running' && "animate-pulse")} />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-3 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all"
                          title={isEn ? "Delete" : "Supprimer"}
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="p-20 text-center">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{isEn ? "No active automation protocols" : "Aucun protocole d'automatisation actif"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Status & History */}
        <div className="space-y-6">
           <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <Zap className="w-10 h-10 mb-6 text-white/50" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 leading-none">Nexus Autonome</h3>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-8 leading-relaxed">
                Le système surveille votre infrastructure WordPress 24/7. Les optimisations validées sont appliquées automatiquement.
              </p>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-widest">{isEn ? "Automation Rate" : "Score d'Automatisme"}</span>
                    <span className="text-xl font-black italic">88%</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-widest">{isEn ? "Time Saved" : "Économie Humaine"}</span>
                    <span className="text-xl font-black italic">{isEn ? "14h / month" : "14h / mois"}</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-[400px]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-slate-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">{isEn ? "Nexus History" : "Historique Nexus"}</h3>
                 </div>
                 {history.length > 0 && (
                   <button 
                     onClick={clearHistory}
                     className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase tracking-widest transition-colors"
                   >
                     {isEn ? "Clear" : "Vider"}
                   </button>
                 )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                 {history.map(log => (
                   <div key={log.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start">
                         <p className="text-xs font-black text-white uppercase tracking-tight">{log.taskName}</p>
                         <span className="text-xs font-mono text-emerald-500 uppercase">{log.result}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic">{log.details}</p>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">{new Date(log.date).toLocaleString()}</p>
                   </div>
                 ))}
                 {history.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-slate-600 py-20">
                      <History className="w-8 h-8 opacity-20 mb-4" />
                      <p className="text-[9px] font-black uppercase tracking-widest italic text-center">{isEn ? "No activity recorded" : "Aucune activité enregistrée"}</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-xl p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                 <Zap className="w-32 h-32 text-white" />
              </div>

              <div className="relative z-10 space-y-8">
                <div>
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">{isEn ? "New Protocol" : "Nouveau Protocole"}</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{isEn ? "Define autonomous execution parameters" : "Définissez les paramètres d'exécution autonome"}</p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{isEn ? "Task Name" : "Nom de la Tâche"}</label>
                      <input 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                        placeholder={isEn ? "e.g., Weekly Security Audit" : "Ex: Audit de Sécurité Hebdomadaire"}
                        value={newTask.name}
                        onChange={e => setNewTask({...newTask, name: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{isEn ? "Protocol Type" : "Type de Protocole"}</label>
                        <select 
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none"
                          value={newTask.type}
                          onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                        >
                           <option value="audit">Nexus Shield Audit</option>
                           <option value="seo">{isEn ? "Complete SEO Optimization" : "Optimisation SEO Complete"}</option>
                           <option value="stock">{isEn ? "Inventory Flow Analysis" : "Analyse de Flux / Stock"}</option>
                           <option value="taxonomy">{isEn ? "Taxonomy Reorganization" : "Réorganisation Taxonomie"}</option>
                           <option value="recovery">{isEn ? "Automated Cart Recovery" : "Relance Panier Abandonné"}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{isEn ? "Frequency" : "Fréquence"}</label>
                        <select 
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none"
                          value={newTask.frequency}
                          onChange={e => setNewTask({...newTask, frequency: e.target.value as any})}
                        >
                           <option value="daily">{isEn ? "Daily" : "Quotidien"}</option>
                           <option value="weekly">{isEn ? "Weekly" : "Hebdomadaire"}</option>
                           <option value="monthly">{isEn ? "Monthly" : "Mensuel"}</option>
                        </select>
                      </div>
                   </div>

                   <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between">
                      <div>
                         <p className="text-xs font-black text-white uppercase tracking-tight mb-1">Auto-Apply (Nexus Intelligence)</p>
                         <p className="text-[9px] text-slate-500 font-medium italic">{isEn ? "The system will apply fixes autonomously without human intervention." : "Le système appliquera les correctifs sans intervention humaine."}</p>
                      </div>
                      <div 
                        onClick={() => setNewTask({...newTask, autoApply: !newTask.autoApply})}
                        className={cn(
                          "w-14 h-7 rounded-full p-1 transition-all cursor-pointer",
                          newTask.autoApply ? "bg-emerald-600" : "bg-slate-800"
                        )}
                      >
                         <div className={cn(
                           "w-5 h-5 rounded-full bg-white transition-all transform",
                           newTask.autoApply ? "translate-x-7" : "translate-x-0"
                         )} />
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     onClick={() => setIsAdding(false)}
                     className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                   >
                     {isEn ? "Cancel" : "Annuler"}
                   </button>
                   <button 
                     onClick={handleAddTask}
                     className="flex-1 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                   >
                     {isEn ? "Activate Protocol" : "Activer le Protocole"}
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
