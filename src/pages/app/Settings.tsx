import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileCheck2, 
  MessageSquare, 
  Globe, 
  Save, 
  ShieldAlert,
  DollarSign
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Toast, ToastType } from '../../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useData();
  const { isAdmin } = useAuth();

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [companyName, setCompanyName] = useState(settings.companyName || "");
  const [tagline, setTagline] = useState(settings.tagline || "");
  const [address, setAddress] = useState(settings.address || "");
  const [city, setCity] = useState(settings.city || "");
  const [phone, setPhone] = useState(settings.phone || "");
  const [email, setEmail] = useState(settings.email || "");
  const [nif, setNif] = useState(settings.nif || "");
  const [stat, setStat] = useState(settings.stat || "");
  const [tva, setTva] = useState(settings.tva || "");
  const [currency, setCurrency] = useState(settings.currency || "Ar");
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings.defaultTaxRate || 0);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || "");
  const [googleMapsEmbedUrl, setGoogleMapsEmbedUrl] = useState(settings.googleMapsEmbedUrl || "");

  useEffect(() => {
    setCompanyName(settings.companyName || "");
    setTagline(settings.tagline || "");
    setAddress(settings.address || "");
    setCity(settings.city || "");
    setPhone(settings.phone || "");
    setEmail(settings.email || "");
    setNif(settings.nif || "");
    setStat(settings.stat || "");
    setTva(settings.tva || "");
    setCurrency(settings.currency || "Ar");
    setDefaultTaxRate(settings.defaultTaxRate || 0);
    setWhatsapp(settings.whatsapp || "");
    setGoogleMapsEmbedUrl(settings.googleMapsEmbedUrl || "");

  }, [settings]);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <ShieldAlert className="w-16 h-16 mx-auto text-amber-500 animate-bounce" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Accès Réservé aux Administrateurs</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Seul un administrateur système peut modifier les paramètres légaux et commerciaux de l'atelier.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        companyName,
        tagline,
        address,
        city,
        phone,
        email,
        nif,
        stat,
        tva,
        currency,
        defaultTaxRate: Number(defaultTaxRate),
        whatsapp,
        googleMapsEmbedUrl
      });
      setToast({ message: 'Paramètres de l\'atelier sauvegardés avec succès !', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur lors de la sauvegarde', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Paramètres Généraux de l'Atelier
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Coordonnées légales, mentions de facturation et intégrations WhatsApp / Maps
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Coordonnées Entreprise */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Coordonnées de la Société
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Raison Sociale / Nom d'Enseigne *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-bold outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Ville & Région *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Adresse Physique de l'Atelier *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Téléphone Principal *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Officiel *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Immatriculation & Fiscalité */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <FileCheck2 className="w-4 h-4" />
            Fiscalité & Monnaie
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                N° NIF
              </label>
              <input
                type="text"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                N° STAT
              </label>
              <input
                type="text"
                value={stat}
                onChange={(e) => setStat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* TVA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                TVA
              </label>
              <input
                type="text"
                value={tva || ""}
                onChange={(e) => setTva(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Devise Principale *
              </label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: WhatsApp & Google Maps */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Intégrations Web & WhatsApp
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Numéro WhatsApp Direct (International) *
            </label>
            <input
              type="text"
              required
              placeholder="261340000000"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-emerald-600 font-bold outline-none border border-slate-200 dark:border-slate-700"
            />
            <p className="text-[10px] text-slate-400 mt-1">Saisissez le numéro sans le signe '+' pour activer la redirection WhatsApp automatique.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Lien Iframe Google Maps (Embed URL)
            </label>
            <input
              type="text"
              value={googleMapsEmbedUrl}
              onChange={(e) => setGoogleMapsEmbedUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-xl shadow-amber-500/20"
          >
            <Save className="w-4 h-4" />
            Enregistrer les Paramètres
          </button>
        </div>
      </form>
    </div>
  );
};
