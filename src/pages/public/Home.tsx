import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Eye, 
  Award,
  ChevronLeft,
  ChevronRight,
  Compass,
  Building,
  Hammer
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { getDirectDriveImageUrl } from '../../utils/driveHelper';

export const Home: React.FC = () => {
  const { settings, products } = useData();

  // Slider Slides
  const slides = [
    {
      title: "Menuiserie Aluminium Haute Performance",
      subtitle: "Baies coulissantes, fenêtres à rupture de pont thermique et portes vitrées d'exception.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      badge: "ALUMINIUM DE SÉRIE"
    },
    {
      title: "Design Architectural en Aluminium & Verre",
      titleSub: "Solutions Modernes Sur-Mesure",
      subtitle: "Création de façades vitrées, portes et fenêtres aluminium avec une finition élégante pour vos constructions et rénovations.",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
      badge: "ALUMINIUM HAUTE FINITION"
    },
    {
      title: "Garde-Corps Inox 316L & Vitrerie Spider",
      subtitle: "Structure inox marine résistant aux intempéries et façades vitrées architecturales.",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80",
      badge: "INOX & FAÇADES VÊTUES"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Tous');

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const categories = ['Tous', 'Aluminium', 'Fer & Forge', 'Inox', 'Vitrerie & Façades', 'Soudure & Structure'];

  const filteredProducts = activeCategoryFilter === 'Tous' 
    ? products 
    : products.filter(p => p.category === activeCategoryFilter);

  const whatsappLink = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    `Bonjour Étoile Alu, je souhaite demander un devis pour un ouvrage.`
  )}`;


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Floating Action Buttons (WhatsApp & Direct Call) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a
          href={`tel:${settings.phone}`}
          className="w-13 h-13 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform border border-slate-700"
          title="Appeler l'atelier"
        >
          <Phone className="w-6 h-6 text-amber-400" />
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-transform"
          title="Discuter sur WhatsApp"
        >
          <MessageSquare className="w-6 h-6" />
        </a>
      </div>

      {/* Hero Interactive Slider */}
      <section className="relative h-[82vh] max-h-[750px] overflow-hidden bg-slate-950">
        <div className="absolute inset-0 overflow-hidden">

          <div
            className="flex h-full transition-transform duration-1000 ease-in-out"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${currentSlide * (100 / slides.length)}%)`,
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="relative h-full flex-shrink-0"
                style={{ width: `${100 / slides.length}%` }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center scale-105"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40" />
              </div>
            ))}
          </div>

        </div>

        <div className="absolute inset-0 overflow-hidden">

          <div
            className="flex h-full transition-transform duration-1000 ease-in-out"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${currentSlide * (100 / slides.length)}%)`,
            }}
          >

            {slides.map((slide, index) => (

              <div
                key={index}
                className="relative h-full flex-shrink-0 flex items-center"
                style={{
                  width: `${100 / slides.length}%`,
                }}
              >

                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center scale-105"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                  }}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40" />


                {/* Texte */}
                <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">

                  <div
                    className="max-w-2xl space-y-6 animate-fade-in"
                  >

                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30">

                      <Sparkles className="w-3.5 h-3.5" />

                      {slide.badge}

                    </span>


                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">

                      {slide.title}

                    </h1>


                    <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">

                      {slide.subtitle}

                    </p>


                    <div className="pt-4 flex flex-wrap items-center gap-4">

                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
                      >

                        <MessageSquare className="w-5 h-5" />

                        Obtenir un Devis Gratuit

                      </a>


                      <Link
                        to="/catalogue"
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all"
                      >

                        <Eye className="w-5 h-5 text-amber-400" />

                        Parcourir le Catalogue

                      </Link>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3 z-10">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 transition-colors border border-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono font-bold text-amber-400 px-2">
            0{currentSlide + 1} / 0{slides.length}
          </span>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 transition-colors border border-slate-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Presentation Atelier */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">

            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              ATELIER D'EXCELLENCE
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Expertise Aluminium & Solutions Vitrées Modernes
            </h2>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Depuis plus de 15 ans, <strong className="text-slate-900 dark:text-white">{settings.companyName}</strong> accompagne vos projets de construction et rénovation.
              Notre équipe qualifiée réalise des ouvrages en Aluminium, Inox et Verre avec une finition soignée, une grande précision et un respect des normes de qualité.
            </p>


            <div className="grid grid-cols-2 gap-4 pt-2">

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">

                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Garantie Qualité
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assemblages précis et finitions durables
                </p>

              </div>


              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-2">
                  <Award className="w-5 h-5" />
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sur-Mesure
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Conception adaptée à chaque projet
                </p>

              </div>

            </div>

          </div>


          <div className="relative">

            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">

              <img 
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80"
                alt="Atelier Aluminium Étoile Alu"
                className="w-full h-full object-cover"
              />

            </div>


            <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-6 rounded-2xl shadow-xl max-w-xs border border-slate-800">

              <p className="text-2xl font-black text-amber-400 font-mono">
                ALUMINIUM
              </p>

              <p className="text-xs text-slate-300 mt-1">
                Solutions modernes, élégantes et résistantes adaptées aux bâtiments résidentiels et professionnels.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">

            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              NOS SPÉCIALITÉS
            </span>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Des Solutions Aluminium & Vitrées Adaptées à Vos Projets
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Une expertise dédiée à la fabrication sur-mesure avec des matériaux modernes,
              élégants et durables.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">


            {/* Aluminium */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-amber-500/50 transition-all group">

              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Menuiserie Aluminium
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Conception et fabrication de baies vitrées coulissantes,
                fenêtres, portes aluminium et ouvertures sur-mesure adaptées
                aux constructions modernes.
              </p>

            </div>



            {/* Verre */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-amber-500/50 transition-all group">

              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Verre & Design Architectural
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Solutions vitrées élégantes : vitrages décoratifs,
                façades modernes, séparations vitrées et réalisations
                personnalisées pour vos espaces.
              </p>

            </div>



            {/* Inox */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-amber-500/50 transition-all group">

              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Inox & Finitions Premium
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Réalisations en inox pour garde-corps, détails architecturaux
                et éléments décoratifs avec une finition durable et esthétique.
              </p>

            </div>


          </div>

        </div>
      </section>

      {/* Realisations / Product Showcase Gallery */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              NOTRE GALERIE DE RÉALISATIONS
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Ouvrages Récents Fabriqués à l'Atelier
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeCategoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.slice(0, 6).map((product) => {
            const img = getDirectDriveImageUrl(product.imageUrl, product.category);
            return (
              <div key={product.id} className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all">
                <div className="aspect-4/3 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={img} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-slate-700">
                    {product.category}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {product.description.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                        TARIFICATION
                      </span>

                      <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                        Prix par {product.unit}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                        `Bonjour, je suis intéressé par l'ouvrage: ${product.name}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Commander
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-black text-sm shadow-xl transition-all"
          >
            Voir Tout le Catalogue ({products.length} Produits)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Google Maps & Contact Location */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                LOCALISATION & CONTACT
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                Rendez-Nous Visite à l'Atelier
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Nos techniciens vous accueillent pour discuter de vos plans, prendre des mesures précises et concevoir vos devis personnalisés.
              </p>

              <div className="space-y-4 pt-2 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Adresse</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{settings.address}, {settings.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Téléphone</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{settings.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="h-96 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              {settings.googleMapsEmbedUrl ? (
                <iframe
                  title="Google Maps Location"
                  src={settings.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Carte indisponible
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
