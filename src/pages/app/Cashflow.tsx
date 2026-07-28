import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Download, 
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { CashflowEntry } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Toast, ToastType } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const Cashflow: React.FC = () => {
  const { cashflow, addCashflow, deleteCashflow, settings } = useData();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form states
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Règlement Client');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<CashflowEntry['paymentMethod']>('Espèces');
  const [reference, setReference] = useState('');

  const incomeCategories = [
    'Règlement Client (Facture)',
    'Acompte Commande',
    'Vente Comptant Atelier',
    'Autre Entrée'
  ];

  const expenseCategories = [
    'Achat Profilés Aluminium',
    'Achat Tôles & Fer Forgé',
    'Achat Vitrerie & Accessoires',
    'Salaire & Main d\'œuvre Interne',
    'Transport & Carburant',
    'Loyer & Électricité Atelier',
    'Consommables & Outillage'
  ];

  const handleOpenAdd = () => {
    setType('income');
    setCategory('Règlement Client (Facture)');
    setAmount(0);
    setDescription('');
    setPaymentMethod('Espèces');
    setReference('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setToast({ message: 'Le montant doit être supérieur à 0', type: 'error' });
      return;
    }

    try {
      await addCashflow({
        date: new Date().toISOString().split('T')[0],
        type,
        category,
        amount: Number(amount),
        description,
        paymentMethod,
        reference
      });

      setToast({ message: 'Mouvement de caisse enregistré !', type: 'success' });
      setIsModalOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur d\'enregistrement', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteCashflow(deleteTargetId);
      setToast({ message: 'Mouvement supprimé', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de suppression', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Categorie', 'Montant', 'Mode', 'Reference', 'Description'];
    const rows = cashflow.map(c => [
      c.date,
      c.type === 'income' ? 'Entrée' : 'Sortie',
      `"${c.category}"`,
      c.amount,
      c.paymentMethod,
      `"${c.reference || ''}"`,
      `"${c.description || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tresorerie_etoile_alu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncome = cashflow.filter(c => c.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = cashflow.filter(c => c.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const currentNetBalance = totalIncome - totalExpense;

  const filteredCashflow = cashflow.filter(c => {
    const matchesSearch = c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.reference && c.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer cette écriture ?"
        message="Êtes-vous sûr de vouloir supprimer cette ligne de caisse ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Trésorerie & Gestion de Caisse
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Suivi en temps réel des encaissements et décaissements de l'atelier
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Exporter CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Saisir Mouvement
          </button>
        </div>
      </div>

      {/* Financial Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">SOLDE CAISSE NET</span>
            <p className="text-2xl font-black font-mono text-white mt-1">
              {formatCurrency(currentNetBalance, settings.currency)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Disponible immédiatement</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Wallet className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL ENTRÉES</span>
            <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalIncome, settings.currency)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Recettes & Acomptes</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <ArrowUpRight className="w-7 h-7" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL SORTIES</span>
            <p className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(totalExpense, settings.currency)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Achats & Dépenses</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
            <ArrowDownRight className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par libellé ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              typeFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              typeFilter === 'income' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            Entrées Seules
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              typeFilter === 'expense' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            Sorties Seules
          </button>
        </div>
      </div>

      {/* Cashflow Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Catégorie</th>
                <th className="py-4 px-4">Mode</th>
                <th className="py-4 px-4">Description</th>
                <th className="py-4 px-4">Montant</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCashflow.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono">{c.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      c.type === 'income'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}>
                      {c.type === 'income' ? 'ENTRÉE' : 'SORTIE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{c.category}</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{c.paymentMethod}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{c.description}</td>
                  <td className={`py-3 px-4 font-mono font-black ${
                    c.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {c.type === 'income' ? '+' : '-'}{formatCurrency(c.amount, settings.currency)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteTargetId(c.id)}
                        className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cashflow Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                SAISIR UN MOUVEMENT DE CAISSE
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory(incomeCategories[0]);
                  }}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-colors ${
                    type === 'income' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400'
                  }`}
                >
                  + ENTRÉE (RECETTE)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory(expenseCategories[0]);
                  }}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-colors ${
                    type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'
                  }`}
                >
                  - SORTIE (DÉPENSE)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Catégorie *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                >
                  {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Montant ({settings.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-mono font-black text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mode de Paiement *
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
                  Description / Libellé *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Achat 10 barres profilé alu blanc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Enregistrer l'Écriture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
