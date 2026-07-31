import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Printer, 
  ArrowRight,
  Send
} from 'lucide-react';
import { useData, generateTrackingNumber } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Quote, OrderItem, QuoteStatus } from '../../types';
import { formatCurrency, formatDate, generateQuoteNumber } from '../../utils/formatters';
import { Toast, ToastType } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const Quotes: React.FC = () => {
  const { quotes, customers, products, addQuote, updateQuoteStatus, deleteQuote, addOrder, settings } = useData();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [quoteItems, setQuoteItems] = useState<OrderItem[]>([]);
  const [laborFee, setLaborFee] = useState<number>(0);
  const [transportFee, setTransportFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [validDays, setValidDays] = useState<number>(30);
  const [notes, setNotes] = useState('');

  // Item builder
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<ProductOption[]>([]);

  // Produit sélectionné
  const selectedProduct = products.find(
    p => p.id === selectedProductId
  );

  const handleOpenAdd = () => {
    setSelectedCustomerId(customers[0]?.id || '');
    setQuoteItems([]);
    setLaborFee(0);
    setTransportFee(0);
    setDiscount(0);
    setValidDays(30);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;
    const optionsTotal =
      selectedOptions.reduce(
        (sum, option) => sum + option.price,
        0
      );

    const unitPrice =
      prod.price + optionsTotal;

    const newItem: OrderItem = {
      productId: prod.id,
      productName: prod.name,
      unit: prod.unit,
      quantity: Number(itemQty),
      unitPrice,
      totalPrice:
        unitPrice * Number(itemQty),

      selectedOptions
    };

    setQuoteItems(prev => [
      ...prev,
      newItem
    ]);

    setSelectedProductId('');
    setSelectedOptions([]);
    setItemQty(1);

  };
  

  const handleRemoveItem = (idx: number) => {
    setQuoteItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = quoteItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = ((subtotal + laborFee + transportFee - discount) * (parseFloat(settings.tva) || 0)) / 100;
  const totalAmount = Math.max(0, subtotal + laborFee + transportFee - discount + taxAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteItems.length === 0) {
      setToast({ message: 'Ajoutez au moins un produit au devis', type: 'error' });
      return;
    }

    const cust = customers.find(c => c.id === selectedCustomerId);
    if (!cust) return;

    try {
      const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await addQuote({
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerAddress: cust.address,
        products: quoteItems,
        subtotal,
        laborFee,
        transportFee,
        discount,
        taxRate: settings.tva? parseFloat(settings.tva) || 0 : 0,
        taxAmount,
        total: totalAmount,
        validUntil,
        status: 'En attente',
        notes
      });

      setToast({ message: 'Devis créé avec succès', type: 'success' });
      setIsModalOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur lors de la création du devis', type: 'error' });
    }
  };

  const handleConvertToOrder = async (q: Quote) => {
    try {
      await addOrder({
        customerId: q.customerId,
        customerName: q.customerName,
        customerPhone: q.customerPhone,
        customerAddress: q.customerAddress,
        products: q.products,
        laborFee: q.laborFee,
        transportFee: q.transportFee,
        discount: q.discount,
        taxRate: q.taxRate,
        subtotal: q.subtotal,
        taxAmount: q.taxAmount,
        totalAmount: q.total,
        advancePayment: 0,
        remainingAmount: q.total,
        trackingNumber: generateTrackingNumber(),
        status: 'Nouveau',
        notes: `Converti depuis devis N° ${q.quoteNumber}`
      });

      await updateQuoteStatus(q.id, 'Accepté');
      setToast({ message: 'Devis converti en Commande Officielle !', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Erreur de conversion', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteQuote(deleteTargetId);
      setToast({ message: 'Devis supprimé', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de suppression', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const filteredQuotes = quotes.filter(q =>
    q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer ce devis ?"
        message="Êtes-vous sûr de vouloir supprimer ce devis de l'ERP ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion des Devis Commercial
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Propositions tarifaires et conversion directe en commandes
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau Devis
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° devis ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-4 px-4">N° Devis</th>
                <th className="py-4 px-4">Client</th>
                <th className="py-4 px-4">Émis le</th>
                <th className="py-4 px-4">Valable Jusqu'au</th>
                <th className="py-4 px-4">Montant Total</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-amber-600 dark:text-amber-400">{q.quoteNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{q.customerName}</p>
                    <p className="text-[10px] text-slate-400">{q.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(q.createdAt)}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{q.validUntil}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(q.total, settings.currency)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={q.status}
                      onChange={(e) => updateQuoteStatus(q.id, e.target.value as QuoteStatus)}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 outline-none"
                    >
                      <option value="En attente">En attente</option>
                      <option value="Accepté">Accepté</option>
                      <option value="Refusé">Refusé</option>
                      <option value="Expiré">Expiré</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {q.status !== 'Accepté' && (
                        <button
                          onClick={() => handleConvertToOrder(q)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-[11px] shadow-sm hover:bg-amber-400 transition-colors"
                          title="Convertir en Commande"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          Transformer en Commande
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteTargetId(q.id)}
                          className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                CRÉER UN NOUVEAU DEVIS
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Client destinataire *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              {/* Add item */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-amber-600 dark:text-amber-400">
                  SELECTIONNER LES OUVRAGES
                </h4>
                <div className="space-y-5">
                  <div className="space-y-4">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="">-- Choisir un produit --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.price.toLocaleString('fr-FR')} {settings.currency}/{p.unit})
                        </option>
                      ))}
                    </select>

                    {/* ⬇️ APETRAKA ETO NY OPTIONS */}
                    {selectedProduct?.options &&
                      selectedProduct.options.length > 0 && (

                      <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4">

                        <p className="text-xs font-bold uppercase mb-3 text-amber-500">
                          Options disponibles
                        </p>

                        <div className="space-y-2">

                          {selectedProduct.options.map(option => {

                            const checked = selectedOptions.some(
                              o => o.id === option.id
                            );

                            return (
                              <label
                                key={option.id}
                                className="flex items-center justify-between text-xs cursor-pointer"
                              >
                                <div className="flex items-center gap-2">

                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {

                                      if (e.target.checked) {

                                        setSelectedOptions(prev => [
                                          ...prev,
                                          option
                                        ]);

                                      } else {

                                        setSelectedOptions(prev =>
                                          prev.filter(o => o.id !== option.id)
                                        );

                                      }

                                    }}
                                  />

                                  <span>{option.name}</span>

                                </div>

                                <span className="font-bold text-amber-500">
                                  + {formatCurrency(option.price, settings.currency)}
                                </span>

                              </label>
                            );

                          })}

                        </div>

                      </div>

                    )}

                  </div>

                  {/* Quantité */}
                  <div className="flex gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-2">
                        Quantité
                      </label>

                      <div className="flex">

                        <input
                          type="number"
                          min={selectedProduct?.unit === "Pièce" ? 1 : 0.01}
                          step={selectedProduct?.unit === "Pièce" ? 1 : 0.01}
                          value={itemQty}
                          onChange={(e) => setItemQty(Number(e.target.value))}
                          className="flex-1 px-4 py-3 rounded-l-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold outline-none"
                        />

                        <div className="px-4 flex items-center bg-slate-200 dark:bg-slate-700 rounded-r-xl text-xs font-bold">
                          {selectedProduct?.unit || "-"}
                        </div>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex-1 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">ARTICLES DEVIS ({quoteItems.length})</h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {item.productName}
                        </p>
                        {item.selectedOptions &&
                          item.selectedOptions.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {item.selectedOptions.map(option => (
                                <p
                                  key={option.id}
                                  className="text-[10px] text-amber-500 font-medium"
                                >
                                  • {option.name}
                                </p>
                              ))}
                            </div>
                        )}
                        <p className="text-[11px] text-slate-400">
                          {item.quantity} {item.unit} × {formatCurrency(item.unitPrice, settings.currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {item.totalPrice.toLocaleString('fr-FR')} {settings.currency}
                        </span>
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-rose-500 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Main d'œuvre
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={laborFee === 0 ? "" : laborFee.toLocaleString("fr-FR")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").replace(/[^\d]/g, "");
                      setLaborFee(Number(value) || 0);
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Transport
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={transportFee === 0 ? "" : transportFee.toLocaleString("fr-FR")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").replace(/[^\d]/g, "");
                      setTransportFee(Number(value) || 0);
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Remise
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={discount === 0 ? "" : discount.toLocaleString("fr-FR")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").replace(/[^\d]/g, "");
                      setDiscount(Number(value) || 0);
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">
                  TOTAL ESTIMÉ DEVIS
                </span>
                <span className="text-xl font-mono font-black text-white">
                  {formatCurrency(totalAmount, settings.currency)}
                </span>
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
                  Générer le Devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
