import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, ShieldAlert, CheckCircle2, Loader2, Landmark, Phone, Calendar, Mail, MapPin, Globe } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

interface Props {
  user: any;
  initialProfile: any;
  onSaved: (updatedProfile: any) => void;
  onLogout: () => void;
}

export default function MandatoryProfileForm({ user, initialProfile, onSaved, onLogout }: Props) {
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [lastName, setLastName] = useState(initialProfile?.last_name || '');
  const [firstName, setFirstName] = useState(initialProfile?.first_name || '');
  const [birthDate, setBirthDate] = useState(initialProfile?.birth_date || '');
  const [address, setAddress] = useState(initialProfile?.address || '');
  const [zipCode, setZipCode] = useState(initialProfile?.zip_code || '');
  const [country, setCountry] = useState(initialProfile?.country || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [company, setCompany] = useState(initialProfile?.company || '');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!username.trim()) return setError("Le nom d'utilisateur est requis.");
    if (!firstName.trim()) return setError("Le prénom est requis.");
    if (!lastName.trim()) return setError("Le nom de famille est requis.");
    if (!birthDate.trim()) return setError("La date de naissance est requise.");
    if (!address.trim()) return setError("L'adresse postale est requise.");
    if (!zipCode.trim()) return setError("Le code postal (Zip Code) est requis.");
    if (!country.trim()) return setError("Le pays est requis.");
    if (!phone.trim()) return setError("Le numéro de téléphone est requis.");
    if (!company.trim()) return setError("Le nom de l'entreprise est requis.");

    setIsLoading(true);

    try {
      const dataToSave = {
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

      await firebaseService.updateUserProfile(user.uid, dataToSave);
      setSuccess(true);
      
      setTimeout(() => {
        onSaved({ ...initialProfile, ...dataToSave });
      }, 1500);

    } catch (err: any) {
      console.error('[ProfileForm] Save error:', err);
      setError("Échec de la mise à jour de votre profil. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030406]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl my-8"
      >
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-blue-400" />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Information Obligatoire</span>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mt-2 leading-none">Complétez Votre Profil</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed mt-3 max-w-md mx-auto">
              Pour des raisons réglementaires et de sécurité, veuillez fournir l'intégralité de vos coordonnées pour activer votre accès.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>Profil enregistré avec succès ! Redirection...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom d'utilisateur */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nom d'utilisateur</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur unique"
                    className="w-full pl-11 pr-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email (Readonly for reference) */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Adresse Email (Lié)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-700" />
                  </div>
                  <input 
                    type="text" 
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-11 pr-6 py-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-xs font-bold text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Prénom */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Prénom</label>
                <input 
                  type="text" 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full px-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                />
              </div>

              {/* Nom de famille */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nom de famille</label>
                <input 
                  type="text" 
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom de famille"
                  className="w-full px-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                />
              </div>

              {/* Date de naissance */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Date de naissance</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-600 transition-colors" />
                  </div>
                  <input 
                    type="date" 
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-11 pr-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Numéro de téléphone */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Numéro de téléphone</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors z-10" />
                  </div>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+216 xx xxx xxx"
                    className="w-full pl-11 pr-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Entreprise */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Entreprise / Société</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Landmark className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nom officiel de votre entreprise"
                    className="w-full pl-11 pr-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Adresse postale */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Adresse Postale Complète</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rue, avenue, appartement, ville, pays"
                    className="w-full pl-11 pr-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Code postal */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Code Postal (Zip Code)</label>
                <input 
                  type="text" 
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Ex: 2037 ou 75001"
                  className="w-full px-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                />
              </div>

              {/* Pays */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Pays</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ex: Tunisie, France..."
                    className="w-full pl-11 pr-6 py-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button 
                type="button"
                onClick={onLogout}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
              >
                Déconnexion
              </button>
              
              <button 
                type="submit"
                disabled={isLoading || success}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-55"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <span>Valider et Activer</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
