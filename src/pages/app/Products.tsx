import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  HelpCircle,
  Filter,
  ShoppingBag
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Product, ProductCategory } from '../../types';
import { getDirectDriveImageUrl } from '../../utils/driveHelper';
import { Toast, ToastType } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, settings } = useData();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showDriveGuide, setShowDriveGuide] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Aluminium');
  const [price, setPrice] = useState<number>("");
  const [unit, setUnit] = useState<Product['unit']>('m²');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);

  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionPrice, setNewOptionPrice] = useState("");
  const [stock, setStock] = useState<number>(10);
  const [status, setStatus] = useState<Product['status']>('En Stock');

  const categoriesList: ProductCategory[] = [
    'Aluminium',
    'Fer & Forge',
    'Inox',
    'Vitrerie & Façades',
    'Soudure & Structure',
    'Accessoires & Quincaillerie'
  ];

  const handleOpenAddModal = () => {
    setEditingProduct(null);

    setName("");
    setCategory("Aluminium");
    setPrice(0);
    setUnit("m²");
    setImageUrl("");
    setDescription("");
    setStock(10);
    setStatus("En Stock");

    // OPTIONS
    setOptions([]);
    setNewOptionName("");
    setNewOptionPrice(0);

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);

    setName(p.name);
    setCategory(p.category);
    setPrice(String(p.price));
    setUnit(p.unit);
    setImageUrl(p.imageUrl);
    setDescription(p.description);
    setStock(p.stock);
    setStatus(p.status);

    // OPTIONS
    setOptions(
      (p.options || []).map((opt, index) => ({
        id: opt.id ?? `opt-${Date.now()}-${index}`,
        name: opt.name,
        price: Number(opt.price) || 0,
      }))
    );
    setNewOptionName("");
    setNewOptionPrice(0);

    setIsModalOpen(true);
  };

  const addOption = () => {
    if (!newOptionName.trim()) return;

    // MODE EDIT
    if (editingOptionIndex !== null) {
      const updated = [...options];

      updated[editingOptionIndex] = {
        ...updated[editingOptionIndex],
        name: newOptionName.trim(),
        price: Number(newOptionPrice) || 0,
      };

      setOptions(updated);

      setEditingOptionIndex(null);
      setNewOptionName("");
      setNewOptionPrice(0);

      return;
    }

    // MODE AJOUT
    if (
      options.some(
        (o) =>
          o.name.toLowerCase() ===
          newOptionName.trim().toLowerCase()
      )
    ) {
      setToast({
        message: "Cette option existe déjà.",
        type: "error",
      });
      return;
    }

    setOptions((prev) => [
      ...prev,
      {
        id: "opt-" + Date.now(), // tsara raha manana id
        name: newOptionName.trim(),
        price: Number(newOptionPrice) || 0,
      },
    ]);

    setNewOptionName("");
    setNewOptionPrice(0);
  };

  const editOption = (index: number) => {
    setEditingOptionIndex(index);
    setNewOptionName(options[index].name);
    setNewOptionPrice(options[index].price);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));

    if (editingOptionIndex === index) {
      setEditingOptionIndex(null);
      setNewOptionName("");
      setNewOptionPrice(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: name.trim(),
      category,
      price: Number(price),
      unit,
      imageUrl: imageUrl.trim(),
      description: description
        .trim()
        .replace(/ ✔/g, "\n✔")
        .replace(/ 📐/g, "\n📐")
        .replace(/ 🤝/g, "\n🤝"),
      stock: Number(stock),
      status,
      options,
    };

    try {

      if (editingProduct) {

        await updateProduct(
          editingProduct.id,
          productData
        );

        setToast({
          message: "Produit mis à jour avec succès",
          type: "success",
        });

      } else {

        await addProduct(productData);

        setToast({
          message: "Nouveau produit créé avec succès",
          type: "success",
        });

      }

      setIsModalOpen(false);

      setEditingProduct(null);

      setOptions([]);
      setNewOptionName("");
      setNewOptionPrice(0);

    } catch (err: any) {

      setToast({
        message: err.message || "Erreur lors de l'enregistrement",
        type: "error",
      });

    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteProduct(deleteTargetId);
      setToast({ message: 'Produit supprimé', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de suppression', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const filteredProducts = products.filter((p) => {

    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      p.name.toLowerCase().includes(keyword) ||
      (p.description || "").toLowerCase().includes(keyword);

    const matchesCategory =
      selectedCategory === "Tous" ||
      p.category === selectedCategory;

    return matchesSearch && matchesCategory;

  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer cet ouvrage ?"
        message="Êtes-vous sûr de vouloir supprimer ce produit du catalogue ERP ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion du Catalogue Produits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gérez la gamme d'ouvrages Aluminium, Fer, Inox et Vitrerie
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDriveGuide(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Aide Google Drive Images
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Produit
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Catégorie:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
          >
            <option value="Tous">Toutes les catégories</option>
            {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-4 px-4">Aperçu</th>
                <th className="py-4 px-4">Désignation</th>
                <th className="py-4 px-4">Catégorie</th>
                <th className="py-4 px-4">Prix Unitaire</th>
                <th className="py-4 px-4">Options</th>
                <th className="py-4 px-4">Unité</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.map((p) => {
                const img = getDirectDriveImageUrl(p.imageUrl, p.category);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      {img ? (
                        <img
                          src={img}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.options?.length ? (
                          <div className="space-y-1">
                              {p.options.map(opt => (
                                  <div
                                      key={opt.id ?? `${opt.name}-${opt.price}`}
                                      className="font-bold text-amber-600 dark:text-amber-400"
                                  >
                                      {opt.price.toLocaleString("fr-FR")} {settings.currency}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <span className="font-bold text-amber-600">
                              {p.price.toLocaleString("fr-FR")} {settings.currency}
                          </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {p.options?.length ? (
                          <div className="space-y-1">
                              {p.options.map(opt => (
                                  <div
                                      key={opt.id ?? `${opt.name}-${opt.price}`}
                                      className="text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                  >
                                      {opt.name}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <span className="text-slate-400 text-[10px]">
                              —
                          </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.unit}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{p.stock}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        p.status === 'En Stock'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTargetId(p.id)}
                            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                            title="Supprimer (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">
                {editingProduct ? 'MODIFIER L\'OUVRAGE' : 'AJOUTER UN UN NOUVEL OUVRAGE'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nom du Produit / Ouvrage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Baie Vitrée Coulissante 2 Vantaux"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                  >
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Unité de Mesure *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                  >
                    <option value="m²">m² (Mètre carré)</option>
                    <option value="mètre linéaire">mètre linéaire</option>
                    <option value="pièce">pièce</option>
                    <option value="ensemble">ensemble</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Prix Unitaire HT ({settings.currency}) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Prix unitaire"

                    value={
                      price
                        ? Number(price).toLocaleString("fr-FR")
                        : ""
                    }

                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\s/g, "")
                        .replace(/[^\d]/g, "");

                      setPrice(value);
                    }}

                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Quantité en Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Lien de la Photo (Google Drive)
                </label>
                <input
                  type="text"
                  placeholder="Coller le lien de partage Google Drive..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Copiez directement le lien de partage public de votre photo sur Google Drive.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description Technique
                </label>
                <textarea
                  rows={3}
                  placeholder="Détails des matériaux, profilés, verre, finitions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Options Produit (Facultatif)
                </label>

                <div className="grid grid-cols-12 gap-3 items-end">

                  <input
                    type="text"
                    placeholder="Nom de l'option"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    className="col-span-4 h-[42px] px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />

                  <input
                    type="text"
                    placeholder="Prix"
                    value={
                      newOptionPrice
                        ? Number(newOptionPrice).toLocaleString("fr-FR")
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").replace(/[^\d]/g, "");
                      setNewOptionPrice(value);
                    }}
                    className="col-span-4 h-[42px] px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />

                  <button
                    type="button"
                    onClick={addOption}
                    className="col-span-2 h-[42px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    {editingOptionIndex !== null ? "Modifier" : "Ajouter"}
                  </button>

                </div>

                {options.length > 0 && (

                  <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

                    <table className="w-full text-xs">

                      <thead className="bg-slate-100 dark:bg-slate-800">

                        <tr>

                          <th className="text-left px-3 py-2">
                            Option
                          </th>

                          <th className="text-right px-3 py-2">
                            Prix
                          </th>

                          <th className="w-16"></th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {options.map((opt, index) => (
                          <tr
                            key={opt.id ?? `opt-${index}`}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                              {opt.name}
                            </td>

                            <td className="px-4 py-3 text-right font-bold text-amber-500 font-mono">
                              {opt.price.toLocaleString("fr-FR")} {settings.currency}
                            </td>

                            <td className="px-4 py-3">

                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() => editOption(index)}
                                  className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                                  title="Modifier"
                                >
                                  ✏️
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeOption(index)}
                                  className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                  title="Supprimer"
                                >
                                  ✕
                                </button>

                              </div>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

                <p className="text-[10px] text-slate-400 mt-2">
                  Exemple : Claire, Fumé, Bronze, Réfléchissante...
                </p>

              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                >
                  Enregistrer l'Ouvrage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive Guide Modal */}
      {showDriveGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" />
                Comment ajouter des photos depuis Google Drive ?
              </h3>
              <button onClick={() => setShowDriveGuide(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>1. Rendez-vous sur votre dossier Google Drive :</p>
              <a
                href="https://drive.google.com/drive/folders/1wJ2FqA-CMf5EFenH1-HrKJTCeZ7qSEjr?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-500 font-bold hover:underline"
              >
                Ouvrir le dossier Google Drive Étoile Alu <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p>2. Faites un clic droit sur la photo désirée → <strong>Obtenir le lien</strong>.</p>
              <p>3. Assurez-vous que l'accès est défini sur <strong>"Tous les utilisateurs disposant du lien"</strong>.</p>
              <p>4. Copiez le lien et collez-le directement dans le champ <em>"Lien de la Photo"</em> de l'ERP.</p>
              <p className="p-3 bg-amber-500/10 text-amber-800 dark:text-amber-400 rounded-xl font-medium">
                Notre convertisseur intégré extrait automatiquement l'identifiant pour afficher une vignette nette en haute résolution !
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowDriveGuide(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
