import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Receipt, 
  Users, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const Dashboard: React.FC = () => {
  const { orders, invoices, customers, products, cashflow, settings } = useData();

  // Metrics calculations
  const totalOrdersCount = orders.length;
  const totalInvoicesCount = invoices.length;
  const totalCustomersCount = customers.length;

  const totalSalesRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalCollectedAmount = invoices.reduce((acc, inv) => acc + inv.advance, 0);
  const totalRemainingAmount = invoices.reduce((acc, inv) => acc + inv.remaining, 0);

  const totalIncome = cashflow.filter(c => c.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = cashflow.filter(c => c.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const currentTreasuryBalance = totalIncome - totalExpense;

  // Chart Data: Sales trend (Monthly)
  const salesData = [
    { month: 'Jan', Ventes: 8500000, Achats: 3200000 },
    { month: 'Fév', Ventes: 13692000, Achats: 3650000 },
    { month: 'Mar', Ventes: 11400000, Achats: 4100000 },
    { month: 'Avr', Ventes: 16800000, Achats: 5200000 },
    { month: 'Mai', Ventes: 19500000, Achats: 6000000 },
    { month: 'Juin', Ventes: 22000000, Achats: 7100000 },
  ];

  // Chart Data: Order status distribution
  const orderStatusCounts = orders.reduce((acc: Record<string, number>, ord) => {
    acc[ord.status] = (acc[ord.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(orderStatusCounts).map(key => ({
    name: key,
    value: orderStatusCounts[key]
  }));

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#f43f5e'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Tableau de Bord ERP
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aperçu analytique en temps réel • {settings.companyName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/orders"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Commande
          </Link>
          <Link
            to="/app/cashflow"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            Saisir Encaissé
          </Link>
        </div>
      </div>

      {/* Primary Key Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Commandes */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">COMMANDES</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalOrdersCount}</p>
            <p className="text-xs text-slate-500 mt-1">En cours et livrées</p>
          </div>
        </div>

        {/* Card 2: Chiffre / Ventes */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CHIFFRE DU MOIS</span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(totalSalesRevenue, settings.currency)}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% ce mois
            </p>
          </div>
        </div>

        {/* Card 3: Montant Encaissé */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ENCAISSÉ</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(totalCollectedAmount, settings.currency)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Acomptes & Solde reçus</p>
          </div>
        </div>

        {/* Card 4: Montant Restant à Recouvrer */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">RESTE À RECOUVRER</span>
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {formatCurrency(totalRemainingAmount, settings.currency)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Factures en attente</p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Current Treasury Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex items-center justify-between col-span-1 md:col-span-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              SOLDE TRÉSORERIE ACTUELLE EN CAISSE
            </span>
            <h3 className="text-3xl font-black font-mono text-white mt-1">
              {formatCurrency(currentTreasuryBalance, settings.currency)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Entrées: {formatCurrency(totalIncome, settings.currency)} | Sorties: {formatCurrency(totalExpense, settings.currency)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800 text-amber-400 border border-slate-700 hidden sm:block">
            <Wallet className="w-8 h-8" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PORTEFEUILLE CLIENTS</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{totalCustomersCount}</p>
            <p className="text-xs text-slate-500 mt-1">Clients enregistrés</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Trend Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Évolution des Ventes & Achats (MGA)</h3>
              <p className="text-xs text-slate-500">Comparatif mensuel sur le premier semestre</p>
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">2026</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} ${settings.currency}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="Ventes" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorVentes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Distribution Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Répartition des Commandes</h3>
          <p className="text-xs text-slate-500">Par statut de fabrication</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: 'Nouveau', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Dernières Commandes Registrées</h3>
            <p className="text-xs text-slate-500">Suivi des travaux en cours à l'atelier</p>
          </div>
          <Link to="/app/orders" className="text-xs font-bold text-amber-500 hover:underline">
            Voir Tout →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                <th className="py-3 px-3">N° Commande</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Montant Total</th>
                <th className="py-3 px-3">Reste à Payer</th>
                <th className="py-3 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">{ord.orderNumber}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{ord.customerName}</td>
                  <td className="py-3.5 px-3 text-slate-500">{formatDate(ord.createdAt)}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(ord.totalAmount, settings.currency)}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(ord.remainingAmount, settings.currency)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
