import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Receipt, 
  FileText, 
  CheckCircle2, 
  X, 
  Users, 
  PlusCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Order, OrderItem, OrderStatus } from '../../types';
import { formatCurrency, formatDate, generateOrderNumber } from '../../utils/formatters';
import { Toast, ToastType } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const Orders: React.FC = () => {
  const { orders, customers, products, addOrder, updateOrder, updateOrderStatus, deleteOrder, addInvoice, settings } = useData();
  const { isAdmin, isManager } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [laborFee, setLaborFee] = useState<number>(0);
  const [transportFee, setTransportFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(settings.defaultTaxRate || 20);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>('Nouveau');
  const [notes, setNotes] = useState('');

  // Item builder states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);

  const statusesList: OrderStatus[] = [
    'Nouveau',
    'Devis',
    'En fabrication',
    'En cours',
    'Terminé',
    'Livré',
    'Annulé'
  ];

  const handleOpenAddModal = () => {
    setEditingOrder(null);
    setSelectedCustomerId(customers[0]?.id || '');
    setOrderItems([]);
    setLaborFee(0);
    setTransportFee(0);
    setDiscount(0);
    setTaxRate(settings.defaultTaxRate || 20);
    setAdvancePayment(0);
    setStatus('Nouveau');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const newItem: OrderItem = {
      productId: prod.id,
      productName: prod.name,
      unit: prod.unit,
      unitPrice: prod.price,
      quantity: Number(itemQty),
      totalPrice: prod.price * Number(itemQty)
    };

    setOrderItems(prev => [...prev, newItem]);
    setSelectedProductId('');
    setItemQty(1);
  };

  const handleRemoveItem = (idx: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  const subtotal = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = ((subtotal + laborFee + transportFee - discount) * taxRate) / 100;
  const totalAmount = Math.max(0, subtotal + laborFee + transportFee - discount + taxAmount);
  const remainingAmount = Math.max(0, totalAmount - advancePayment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      setToast({ message: 'Veuillez ajouter au moins un ouvrage à la commande', type: 'error' });
      return;
    }

    const cust = customers.find(c => c.id === selectedCustomerId);
    if (!cust) {
      setToast({ message: 'Veuillez sélectionner un client', type: 'error' });
      return;
    }

    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, {
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          customerAddress: cust.address,
          products: orderItems,
          laborFee,
          transportFee,
          discount,
          taxRate,
          subtotal,
          taxAmount,
          totalAmount,
          advancePayment,
          remainingAmount,
          status,
          notes
        });
        setToast({ message: 'Commande mise à jour avec succès', type: 'success' });
      } else {
        await addOrder({
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          customerAddress: cust.address,
          products: orderItems,
          laborFee,
          transportFee,
          discount,
          taxRate,
          subtotal,
          taxAmount,
          totalAmount,
          advancePayment,
          remainingAmount,
          status,
          notes
        });
        setToast({ message: 'Commande enregistrée avec succès', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur d\'enregistrement', type: 'error' });
    }
  };

  const handleConvertToInvoice = async (ord: Order) => {
    try {
      const invId = await addInvoice({
        orderId: ord.id,
        customerId: ord.customerId,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        customerAddress: ord.customerAddress,
        products: ord.products,
        subtotal: ord.subtotal,
        laborFee: ord.laborFee,
        transportFee: ord.transportFee,
        discount: ord.discount,
        taxRate: ord.taxRate,
        taxAmount: ord.taxAmount,
        total: ord.totalAmount,
        advance: ord.advancePayment,
        remaining: ord.remainingAmount,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentStatus: ord.remainingAmount === 0 ? 'Payé' : ord.advancePayment > 0 ? 'Partiel' : 'En attente'
      });
      setToast({ message: 'Facture générée avec succès !', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Erreur lors de la génération de la facture', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteOrder(deleteTargetId);
      setToast({ message: 'Commande supprimée', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de suppression', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer cette commande ?"
        message="Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion des Commandes Atelier
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Création, suivi des travaux et conversion en factures officielles
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Commande
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° commande ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['Tous', ...statusesList].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-4 px-4">N° Commande</th>
                <th className="py-4 px-4">Client</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Montant Total</th>
                <th className="py-4 px-4">Avance Perçue</th>
                <th className="py-4 px-4">Reste</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-amber-600 dark:text-amber-400">{ord.orderNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{ord.customerName}</p>
                    <p className="text-[10px] text-slate-400">{ord.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(ord.createdAt)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(ord.totalAmount, settings.currency)}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">
                    {formatCurrency(ord.advancePayment, settings.currency)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(ord.remainingAmount, settings.currency)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 outline-none"
                    >
                      {statusesList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleConvertToInvoice(ord)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-[11px] shadow-sm hover:scale-105 transition-transform"
                        title="Convertir en Facture Officielle"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Facture
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteTargetId(ord.id)}
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

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                NOUVELLE COMMANDE ATELIER
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Sélectionner le Client *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              {/* Add Item Builder */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-amber-600 dark:text-amber-400">
                  AJOUTER UN OUVRAGE / PRODUIT
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="">-- Choisir un ouvrage --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.price.toLocaleString('fr-FR')} {settings.currency}/{p.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="Qté"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                    />
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

              {/* Added Line Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">
                  ARTICLES COMMANDÉS ({orderItems.length})
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">{item.quantity} {item.unit} x {item.unitPrice.toLocaleString('fr-FR')} {settings.currency}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {item.totalPrice.toLocaleString('fr-FR')} {settings.currency}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Inputs Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Main d'œuvre</label>
                  <input
                    type="number"
                    min={0}
                    value={laborFee}
                    onChange={(e) => setLaborFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Transport</label>
                  <input
                    type="number"
                    min={0}
                    value={transportFee}
                    onChange={(e) => setTransportFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Remise</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Acompte Perçu</label>
                  <input
                    type="number"
                    min={0}
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Order Total Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                    TOTAL COMMANDE CALCULÉ
                  </span>
                  <span className="text-xl font-mono font-black text-white">
                    {formatCurrency(totalAmount, settings.currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider block">
                    RESTE À PAYER
                  </span>
                  <span className="text-lg font-mono font-bold text-rose-400">
                    {formatCurrency(remainingAmount, settings.currency)}
                  </span>
                </div>
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
                  Valider la Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
