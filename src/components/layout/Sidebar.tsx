import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  ShoppingCart, 
  FileText, 
  Receipt, 
  Wallet, 
  UserCheck, 
  Settings, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export const Sidebar: React.FC = () => {
  const { currentUser, logout, isAdmin, isManager } = useAuth();
  const { settings } = useData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    {
      label: 'Tableau de bord',
      path: '/app/dashboard',
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      label: 'Commandes',
      path: '/app/orders',
      icon: ShoppingCart,
      allowed: isManager,
    },
    {
      label: 'Devis',
      path: '/app/quotes',
      icon: FileText,
      allowed: isManager,
    },
    {
      label: 'Facturation',
      path: '/app/invoices',
      icon: Receipt,
      allowed: isManager,
    },
    {
      label: 'Gestion Clients',
      path: '/app/customers',
      icon: Users,
      allowed: isManager,
    },
    {
      label: 'Gestion Produits',
      path: '/app/products',
      icon: ShoppingBag,
      allowed: true, // Everyone logged in can view products
    },
    {
      label: 'Trésorerie & Caisse',
      path: '/app/cashflow',
      icon: Wallet,
      allowed: isManager,
    },
    {
      label: "Inbox",
      icon: Mail,
      path: "/app/inbox",
      allowed: isManager,
    },
    {
      label: 'Utilisateurs & Rôles',
      path: '/app/users',
      icon: UserCheck,
      allowed: isAdmin,
      adminOnly: true,
    },
    {
      label: 'Paramètres Atelier',
      path: '/app/settings',
      icon: Settings,
      allowed: isAdmin,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between min-h-[calc(100vh-4.5rem)]">
      
      {/* Navigation Links */}
      <div className="p-4 space-y-6">
        
        {/* Role Badge Banner */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'}`} />
            <div>
              <p className="text-xs font-bold text-white tracking-wide">{currentUser?.name}</p>
              <p className="text-[10px] font-mono text-amber-400 capitalize">Rôle: {currentUser?.role}</p>
            </div>
          </div>
          {isAdmin && (
            <span title="Accès Administrateur Complet">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </span>
          )}
        </div>

        {/* Section Label */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            MENU PRINCIPAL ERP
          </p>
          
          <nav className="space-y-1 pt-1">
            {navItems.filter(item => item.allowed).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.adminOnly && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                      ADMIN
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Public Site Quick Link */}
        <div className="pt-2 border-t border-slate-800">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
            VUE PUBLIQUE
          </p>
          <NavLink
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              Voir le Site Public
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 hover:text-white text-xs font-bold transition-colors border border-rose-900/30"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};
