import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Eye, 
  X, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Product, ProductCategory } from '../../types';
import { getDirectDriveImageUrl } from '../../utils/driveHelper';

export const Catalogue: React.FC = () => {
  const { products, settings } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  const categories: string[] = ['Tous', 'Aluminium', 'Inox', 'Vitrerie & Façades', 'Soudure & Structure'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getWhatsAppProductLink = (prod: Product) => {
    const text = `Bonjour Étoile Alu, je suis intéressé par l'ouvrage: ${prod.name} (${prod.price.toLocaleString('fr-FR')} ${settings.currency}/${prod.unit}). Pouvez-vous m'envoyer les détails pour commander ?`;
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4" />
            CATALOGUE COMPLET DES OUVRAGES
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Menuiserie, Inox & Vitrerie Sur-Mesure
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Découvrez nos créations en Aluminium, Inox et Vitrerie. Toutes les dimensions sont modifiables sur commande.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom d'ouvrage (ex: Baie coulissante, Portail, Garde-corps)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-sm font-medium text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-extrabold uppercase text-slate-400 mr-2 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filtrer:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aucun produit ne correspond à votre recherche</h3>
            <p className="text-xs text-slate-500 mt-1">Essayez un autre mot clé ou réinitialisez les filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const imageUrl = getDirectDriveImageUrl(product.imageUrl, product.category);

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Box */}
                    <div className="aspect-4/3 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-slate-700">
                        {product.category}
                      </span>
                      <span className={`absolute top-4 right-4 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        product.status === 'En Stock'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-slate-950'
                      }`}>
                        {product.status}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
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
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="p-6 pt-0 space-y-4">
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                          TARIFICATION
                        </span>

                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                          Prix par {product.unit}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedProductModal(product)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 text-slate-700 dark:text-slate-200 hover:text-slate-950 transition-colors"
                        title="Aperçu Détaillé"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                    </div>

                    <a
                      href={getWhatsAppProductLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Commander via WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Product Modal */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                DÉTAIL OUVRAGE • {selectedProductModal.category}
              </span>
              <button
                onClick={() => setSelectedProductModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <img
                  src={getDirectDriveImageUrl(selectedProductModal.imageUrl, selectedProductModal.category)}
                  alt={selectedProductModal.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedProductModal.name}
                </h2>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  DESCRIPTION TECHNIQUE
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {selectedProductModal.description}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                  TARIFICATION
                </span>

                <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                  Prix par {selectedProductModal.unit}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={getWhatsAppProductLink(selectedProductModal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  Envoyer ma demande par WhatsApp
                </a>
                <button
                  onClick={() => setSelectedProductModal(null)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
