import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

import { Home } from './pages/public/Home';
import { Catalogue } from './pages/public/Catalogue';
import { Login } from './pages/auth/Login';


import ClientSpace from "./pages/client/ClientSpace";
import OrderTracking from "./pages/client/OrderTracking";
//import  Login  from "./pages/auth/Login21";

import { Dashboard } from './pages/app/Dashboard';
import { Products } from './pages/app/Products';
import { Customers } from './pages/app/Customers';
import { Orders } from './pages/app/Orders';
import { Quotes } from './pages/app/Quotes';
import { Invoices } from './pages/app/Invoices';
import { Cashflow } from './pages/app/Cashflow';
import Inbox from './pages/app/Inbox';
import { UsersPage } from './pages/app/Users';
import { SettingsPage } from './pages/app/Settings';

// Public Layout Wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Protected ERP Route Guard & Layout Wrapper
const ProtectedErpLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Chargement Étoile Alu Mada...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/catalogue" element={<PublicLayout><Catalogue /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />

              {/* Client Routes */}
              <Route path="/client" element={<ClientSpace />} />
              <Route path="/suivi" element={<OrderTracking />} />

              {/* Protected ERP App Routes */}
              <Route path="/app/dashboard" element={<ProtectedErpLayout><Dashboard /></ProtectedErpLayout>} />
              <Route path="/app/products" element={<ProtectedErpLayout><Products /></ProtectedErpLayout>} />
              <Route path="/app/customers" element={<ProtectedErpLayout><Customers /></ProtectedErpLayout>} />
              <Route path="/app/orders" element={<ProtectedErpLayout><Orders /></ProtectedErpLayout>} />
              <Route path="/app/quotes" element={<ProtectedErpLayout><Quotes /></ProtectedErpLayout>} />
              <Route path="/app/invoices" element={<ProtectedErpLayout><Invoices /></ProtectedErpLayout>} />
              <Route path="/app/cashflow" element={<ProtectedErpLayout><Cashflow /></ProtectedErpLayout>} />
              <Route path="/app/inbox" element={<ProtectedErpLayout><Inbox /></ProtectedErpLayout>}/>
              <Route path="/app/users" element={<ProtectedErpLayout><UsersPage /></ProtectedErpLayout>} />
              <Route path="/app/settings" element={<ProtectedErpLayout><SettingsPage /></ProtectedErpLayout>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
