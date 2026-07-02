import React from 'react';
import { Shield, ArrowLeft, Lock, Database, Eye, Server, Sparkles, Mail, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyProps {
  onBack: () => void;
  lang?: 'fr' | 'en';
}

export default function PrivacyPolicy({ onBack, lang = 'fr' }: PrivacyPolicyProps) {
  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-[#8b5cf6]/30 font-sans" id="privacy-policy-view">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#02040a]/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={onBack}
            id="privacy-back-btn"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {isEn ? 'BACK TO HQ' : 'RETOUR AU QUARTIER GÉNÉRAL'}
          </button>
          <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">NEXUS_WP_AI // COMPLIANCE</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-40 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="w-16 h-16 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-2xl flex items-center justify-center mb-8">
              <Shield className="w-8 h-8 text-[#a78bfa]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black italic uppercase tracking-tighter mb-4">
              {isEn ? (
                <>
                  PRIVACY <span className="text-[#8b5cf6]">POLICY</span>
                </>
              ) : (
                <>
                  POLITIQUE DE <span className="text-[#8b5cf6]">CONFIDENTIALITÉ</span>
                </>
              )}
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
              {isEn ? 'LAST UPDATE: JUNE 17, 2026' : 'DERNIÈRE MISE À JOUR : 17 JUIN 2026'}
            </p>
          </motion.div>

          {/* Sections List */}
          <div className="space-y-10 text-left">
            
            {/* Section 1: Introduction */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-905/30 border border-white/5 p-6 md:p-8 rounded-[2rem] hover:border-white/10 transition-colors"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-[#8b5cf6]/10 rounded-lg flex items-center justify-center text-[#a78bfa] font-mono text-xs font-bold leading-none">
                  01
                </span>
                {isEn ? 'Introduction' : 'Introduction'}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-medium">
                {isEn ? (
                  "At Nexus WP AI, we are committed to protecting your privacy and ensuring your personal data is handled in accordance with the General Data Protection Regulation (GDPR). This policy explains how we collect, use, and safeguard your data."
                ) : (
                  "Chez Nexus WP AI, nous nous engageons à protéger votre vie privée et à garantir que vos données personnelles sont traitées conformément au Règlement Général sur la Protection des Données (RGPD). Cette politique explique comment nous collectons, utilisons et protégeons vos données."
                )}
              </p>
            </motion.section>

            {/* Section 2: Data Collection */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-905/30 border border-white/5 p-6 md:p-8 rounded-[2rem] hover:border-white/10 transition-colors"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-[#8b5cf6]/10 rounded-lg flex items-center justify-center text-[#a78bfa] font-mono text-xs font-bold leading-none">
                  02
                </span>
                {isEn ? 'Data Collection' : 'Collecte de Données'}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-medium mb-6">
                {isEn ? (
                  "We only collect data that is strictly necessary for the operation of our service:"
                ) : (
                  "Nous collectons uniquement les données strictement nécessaires au fonctionnement de notre service :"
                )}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#a78bfa] tracking-wider mb-2">
                    <Lock className="w-4 h-4" />
                    {isEn ? 'Account' : 'Compte'}
                  </div>
                  <p className="text-slate-400 text-xs leading-normal">
                    {isEn 
                      ? 'Name and email address used for your Nexus WP AI account.'
                      : 'Nom de compte et adresse e-mail utilisés pour votre compte Nexus WP AI.'}
                  </p>
                </div>
                
                <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#a78bfa] tracking-wider mb-2">
                    <Database className="w-4 h-4" />
                    {isEn ? 'Technical' : 'Technique'}
                  </div>
                  <p className="text-slate-400 text-xs leading-normal">
                    {isEn 
                      ? 'Information related to your WordPress installations (URL, plugin activity, site health) processed via our secure cloud command center.'
                      : 'Informations concernant vos installations WordPress (URL, statut d\'activité des extensions, santé du site) via notre console cloud sécurisée.'}
                  </p>
                </div>

                <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#a78bfa] tracking-wider mb-2">
                    <Eye className="w-4 h-4" />
                    {isEn ? 'Usage' : 'Utilisation'}
                  </div>
                  <p className="text-slate-400 text-xs leading-normal">
                    {isEn 
                      ? 'Analytics on how you interact with our platform to help us improve our services.'
                      : 'Données analytiques sur vos interactions et optimisations pour améliorer continuellement nos services.'}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Section 3: Data Usage */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-905/30 border border-white/5 p-6 md:p-8 rounded-[2rem] hover:border-white/10 transition-colors"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-[#8b5cf6]/10 rounded-lg flex items-center justify-center text-[#a78bfa] font-mono text-xs font-bold leading-none">
                  03
                </span>
                {isEn ? 'Data Usage' : 'Utilisation des Données'}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-medium mb-4">
                {isEn ? (
                  "Your data is used solely to provide and improve the Nexus WP AI services. We do not sell your personal data to third parties. We use your data to:"
                ) : (
                  "Vos données sont utilisées uniquement pour fournir et optimiser les services de Nexus WP AI. Nous ne vendons pas vos données personnelles à des tiers. Nous utilisons vos données pour :"
                )}
              </p>
              
              <ul className="space-y-3 pl-4 list-none text-slate-300 text-sm font-sans font-medium">
                {[
                  isEn 
                    ? 'Manage your license and access.' 
                    : 'Gérer votre licence, vos clés et vos droits d\'accès.',
                  isEn 
                    ? 'Perform AI-driven optimizations on your connected WordPress sites.' 
                    : 'Effectuer des diagnostics et optimisations de performance ou SEO basés sur l\'IA.',
                  isEn 
                    ? 'Provide technical support and updates.' 
                    : 'Vous fournir une assistance technique fluide et des mises à jour opportunes.'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full mt-2 shrink-0 animate-pulse" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Section 4: Data Security */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-905/30 border border-white/5 p-6 md:p-8 rounded-[2rem] hover:border-white/10 transition-colors"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-[#8b5cf6]/10 rounded-lg flex items-center justify-center text-[#a78bfa] font-mono text-xs font-bold leading-none">
                  04
                </span>
                {isEn ? 'Data Security' : 'Sécurité des Données'}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-medium">
                {isEn ? (
                  "We employ industry-standard encryption protocols (SSL/TLS) for data in transit and at rest. Our cloud infrastructure is designed to minimize the data footprint on your local WordPress site, ensuring high security and performance."
                ) : (
                  "Nous employons des protocoles de chiffrement conformes aux standards de l'industrie (SSL/TLS) pour les données en transit et au repos. Notre infrastructure cloud décentralisée est conçue pour minimiser l'empreinte de stockage locale, garantissant une intégrité absolue de votre hébergement WordPress."
                )}
              </p>
            </motion.section>

            {/* Section 5: Your Rights */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-905/30 border border-white/5 p-6 md:p-8 rounded-[2rem] hover:border-white/10 transition-colors"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-[#8b5cf6]/10 rounded-lg flex items-center justify-center text-[#a78bfa] font-mono text-xs font-bold leading-none">
                  05
                </span>
                {isEn ? 'Your Rights' : 'Vos Droits'}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-medium mb-4">
                {isEn ? (
                  "Under GDPR, you have the right to:"
                ) : (
                  "En vertu du règlement du RGPD, vous disposez pleinement des droits suivants :"
                )}
              </p>
              
              <ul className="space-y-3 pl-4 list-none text-slate-300 text-sm font-sans font-medium">
                {[
                  isEn 
                    ? 'Access, correct, or delete your personal data.' 
                    : 'Accéder, rectifier ou demander la suppression définitive de vos données personnelles.',
                  isEn 
                    ? 'Withdraw consent for data processing at any time.' 
                    : 'Retirer votre consentement au traitement de vos données à tout moment.',
                  isEn 
                    ? 'Export your data in a portable format.' 
                    : 'Exporter l\'ensemble de vos historiques et profils sous un format portable standardisé.'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Section 6: Contact Us */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/15 p-6 md:p-8 rounded-[2rem]"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center text-[#a78bfa] font-mono text-xs font-bold leading-none">
                  06
                </span>
                {isEn ? 'Contact Us' : 'Nous Contacter'}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-medium mb-6">
                {isEn ? (
                  "If you have any questions regarding your data or this policy, please contact us at:"
                ) : (
                  "Si vous avez la moindre interrogation concernant la gestion de vos données ou cette politique, veuillez contacter notre cellule dédiée :"
                )}
              </p>
              
              <a 
                href="mailto:contact@nexuswp.pro"
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] transition-all rounded-2xl text-xs uppercase font-black text-white tracking-widest shadow-lg shadow-[#8b5cf6]/20 hover:scale-[1.02]"
              >
                <Mail className="w-4 h-4" />
                contact@nexuswp.pro
              </a>
            </motion.section>

          </div>
        </div>
      </main>
    </div>
  );
}
