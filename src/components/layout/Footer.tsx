import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail,Facebook,MessageCircle, MapPin, MessageSquare, Shield, Clock, ChevronRight } from 'lucide-react';
import { FaFacebookF, FaFacebookMessenger } from "react-icons/fa";
import { useData } from '../../contexts/DataContext';
import logo1 from "../../img/logo1.png";
import qrWhatsapp from "../../img/qr-whatsapp.jpeg";

export const Footer: React.FC = () => {
  const { settings } = useData();

  const whatsappLink = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    `Bonjour Étoile Alu, je souhaite demander un devis.`
  )}`;

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Bio */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/30">
                <img
                  src={logo1}
                  alt="Étoile Alu"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-base font-black text-white">{settings.companyName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Expert en menuiserie Aluminium sur-mesure, vitrages modernes et finitions Inox, nous réalisons des ouvrages élégants alliant design, performance et qualité durable pour vos projets résidentiels et professionnels.
            </p>
            <div className="pt-2 flex items-center gap-2 text-amber-400 font-semibold">
              <Clock className="w-4 h-4 flex-shrink-0" />

              <div className="text-xs leading-relaxed">
                <p>Lundi - Vendredi : 07h30 - 17h30</p>
                <p>Samedi : Ouvert (horaire réduit)</p>
              </div>
            </div>
          </div>

          {/* Nos Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Savoir-Faire & Métiers
            </h4>

            <ul className="space-y-2">

              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ChevronRight className="w-3 h-3 text-amber-500" />
                Baies & Fenêtres Aluminium
              </li>

              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ChevronRight className="w-3 h-3 text-amber-500" />
                Portes Aluminium & Solutions Sur-Mesure
              </li>

              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ChevronRight className="w-3 h-3 text-amber-500" />
                Vitrerie Architecturale & Décoration
              </li>

              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ChevronRight className="w-3 h-3 text-amber-500" />
                Inox & Finitions Modernes
              </li>

              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ChevronRight className="w-3 h-3 text-amber-500" />
                Ouvrages Aluminium Personnalisés
              </li>

            </ul>
          </div>

          {/* Navigation Rapide */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-500" /> Page d'Accueil
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-500" /> Catalogue des Ouvrages
                </Link>
              </li>
              <li>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-500">
                  <MessageSquare className="w-3 h-3" /> Demander un Devis WhatsApp
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-amber-500" /> Accès Espace Collaborateurs
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-amber-500" /> Espace Clients & Suivi de Commandes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Coordonnées Atelier
            </h4>

            <div className="grid grid-cols-[110px_1fr] gap-5 items-start">

              {/* QR WhatsApp */}
              <div className="flex flex-col items-center">

                <div className="bg-white rounded-2xl p-2 shadow-lg">
                  <img
                    src={qrWhatsapp}   // <-- import-nao
                    alt="QR WhatsApp"
                    className="w-24 h-24 object-contain"
                  />
                </div>

                <span className="mt-2 text-[10px] text-slate-400 text-center">
                  Scanner pour discuter
                </span>

              </div>

              {/* Contact */}
              <div className="space-y-3">

                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>
                    {settings.address}, {settings.city}
                  </span>
                </p>

                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-white transition-colors font-mono"
                  >
                    {settings.phone}
                  </a>
                </p>

                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.email}
                  </a>
                </p>

                <p className="flex items-center gap-2">
                  <FaFacebookF className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <a
                    href="https://www.facebook.com/etoile.alu.mada"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Facebook Officiel - Etoile Alu Mada
                  </a>
                </p>

                <p className="flex items-center gap-2">
                  <FaFacebookMessenger className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <a
                    href="https://m.me/etoile.alu.mada"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Messenger
                  </a>
                </p>

              </div>

            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} {settings.companyName}. Tous droits réservés.</p>
          <p className="mt-2 sm:mt-0 font-mono">Système ERP v6.0 • by RFC OFFICE</p>
        </div>
      </div>
    </footer>
  );
};
