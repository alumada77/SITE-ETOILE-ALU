import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  ShoppingCart, 
  Receipt, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Customer } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Toast, ToastType } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders, invoices, settings } = useData();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setEmail('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setAddress(c.address);
    setEmail(c.email);
    setNotes(c.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, { name, phone, address, email, notes });
        setToast({ message: 'Client mis à jour avec succès', type: 'success' });
      } else {
        await addCustomer({ name, phone, address, email, notes });
        setToast({ message: 'Client enregistré avec succès', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur d\'enregistrement', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteCustomer(deleteTargetId);
      setToast({ message: 'Fiche client supprimée', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de suppression', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer ce client ?"
        message="Êtes-vous sûr de vouloir supprimer ce client de votre répertoire ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Répertoire des Clients
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gérez vos contacts, suivis de commandes et historiques d'achats
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Customers Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((c) => {
          const customerOrders = orders.filter(o => o.customerId === c.id);
          const customerInvoices = invoices.filter(i => i.customerId === c.id);
          const totalSpent = customerInvoices.reduce((acc, inv) => acc + inv.total, 0);
          const remainingDue = customerInvoices.reduce((acc, inv) => acc + inv.remaining, 0);

          return (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h3>
                      <p className="text-[10px] text-slate-400">Inscrit le {formatDate(c.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingCustomer(c)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Voir Fiche Détaillée"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteTargetId(c.id)}
                        className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono font-semibold">{c.phone}</span>
                  </p>
                  {c.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate">{c.email}</span>
                    </p>
                  )}
                  {c.address && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate">{c.address}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Stats pill */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block font-bold">COMMANDES</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{customerOrders.length}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block font-bold">TOTAL ACHATS</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {formatCurrency(totalSpent, settings.currency)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                {editingCustomer ? 'MODIFIER LA FICHE CLIENT' : 'NOUVEAU CLIENT'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nom Complet / Raison Sociale *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: M. Harison / Société IMMO Plus"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Téléphone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+261 34 12 345 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Adresse de Livraison / Chantier
                </label>
                <input
                  type="text"
                  placeholder="ex: Lot IVB Ankorondrano, Antananarivo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="client@exemple.mg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Remarques & Préférences
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes sur le client, spécifications..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail View Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                FICHE HISTORIQUE CLIENT
              </h3>
              <button onClick={() => setViewingCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{viewingCustomer.name}</h2>
                  <p className="text-xs text-slate-500">{viewingCustomer.phone} • {viewingCustomer.email || 'Pas d\'email'}</p>
                  <p className="text-xs text-slate-500">{viewingCustomer.address || 'Pas d\'adresse'}</p>
                </div>
              </div>

              {/* Order history */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  HISTORIQUE DES COMMANDES
                </h4>

                <div className="space-y-3">
                  {orders.filter(o => o.customerId === viewingCustomer.id).map(ord => (
                    <div key={ord.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-mono font-bold text-amber-600 dark:text-amber-400">{ord.orderNumber}</p>
                        <p className="text-slate-500">{formatDate(ord.createdAt)} • {ord.products.length} ouvrages</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(ord.totalAmount, settings.currency)}</p>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.customerId === viewingCustomer.id).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Aucune commande enregistrée pour ce client.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
