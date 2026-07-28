import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Eye, 
  Printer, 
  Wallet, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Download
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PrintableInvoice } from '../../components/invoice/PrintableInvoice';
import { Toast, ToastType } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const Invoices: React.FC = () => {
  const { invoices, updateInvoicePayment, deleteInvoice, addCashflow, settings } = useData();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Virement Bancaire' | 'Chèque' | 'Mobile Money'>('Espèces');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleOpenPaymentModal = (inv: Invoice) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentAmount(inv.remaining);
    setPaymentMethod('Espèces');
    setPaymentNotes(`Règlement Facture N° ${inv.invoiceNumber}`);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    if (paymentAmount <= 0) {
      setToast({ message: 'Veuillez saisir un montant supérieur à 0', type: 'error' });
      return;
    }

    try {
      const newAdvance = selectedInvoiceForPayment.advance + paymentAmount;
      const newRemaining = Math.max(0, selectedInvoiceForPayment.total - newAdvance);
      const newStatus = newRemaining === 0 ? 'Payé' : 'Partiel';

      // Update invoice
      await updateInvoicePayment(selectedInvoiceForPayment.id, newAdvance, newRemaining, newStatus);

      // Record in Treasury (Cashflow)
      await addCashflow({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'Règlement Client (Facture)',
        amount: paymentAmount,
        description: `Règlement Facture ${selectedInvoiceForPayment.invoiceNumber} - Client ${selectedInvoiceForPayment.customerName}`,
        paymentMethod,
        reference: selectedInvoiceForPayment.invoiceNumber
      });

      setToast({ message: 'Paiement enregistré et comptabilisé en trésorerie !', type: 'success' });
      setSelectedInvoiceForPayment(null);
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur lors de l\'enregistrement', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteInvoice(deleteTargetId);
      setToast({ message: 'Facture supprimée', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de suppression', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || i.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer cette facture ?"
        message="Êtes-vous sûr de vouloir supprimer cette facture de l'ERP ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Facturation & Encaissements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Émission des factures définitives, règlement des acomptes et impression PDF
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° facture ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['Tous', 'Payé', 'Partiel', 'En attente'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
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

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-4 px-4">N° Facture</th>
                <th className="py-4 px-4">Client</th>
                <th className="py-4 px-4">Date Émission</th>
                <th className="py-4 px-4">Total HT/TTC</th>
                <th className="py-4 px-4">Acompte Reçu</th>
                <th className="py-4 px-4">Solde Reste</th>
                <th className="py-4 px-4">Statut Paiement</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-amber-600 dark:text-amber-400">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{inv.customerName}</p>
                    <p className="text-[10px] text-slate-400">{inv.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(inv.total, settings.currency)}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                    {formatCurrency(inv.advance, settings.currency)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(inv.remaining, settings.currency)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      inv.paymentStatus === 'Payé'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : inv.paymentStatus === 'Partiel'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.remaining > 0 && (
                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shadow-sm transition-colors"
                          title="Saisir un encaissement"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Payer
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-[11px] shadow-sm transition-colors"
                        title="Voir & Imprimer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimer
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => setDeleteTargetId(inv.id)}
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

      {/* Printable Invoice Modal */}
      {selectedInvoiceForPrint && (
        <PrintableInvoice
          invoice={selectedInvoiceForPrint}
          settings={settings}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* Payment Recorder Modal */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                ENREGISTRER UN PAIEMENT • {selectedInvoiceForPayment.invoiceNumber}
              </h3>
              <button onClick={() => setSelectedInvoiceForPayment(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs">
                <p className="text-slate-400">Client: <strong className="text-slate-900 dark:text-white">{selectedInvoiceForPayment.customerName}</strong></p>
                <p className="text-slate-400">Total Facture: <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(selectedInvoiceForPayment.total, settings.currency)}</strong></p>
                <p className="text-slate-400">Déjà réglé: <strong className="text-emerald-600 font-mono">{formatCurrency(selectedInvoiceForPayment.advance, settings.currency)}</strong></p>
                <p className="text-slate-400">Solde Restant: <strong className="text-rose-600 font-mono font-bold">{formatCurrency(selectedInvoiceForPayment.remaining, settings.currency)}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Montant à Encaisser ({settings.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedInvoiceForPayment.remaining}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-black font-mono text-amber-600 dark:text-amber-400 outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mode de Règlement *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                >
                  <option value="Espèces">Espèces (Caisse)</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Mobile Money">Mobile Money (Mvola / Orange Money)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Notes & Références
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md"
                >
                  Valider l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
