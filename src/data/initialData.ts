import { AppSettings, Customer, Product, Order, Quote, Invoice, CashflowEntry, UserProfile } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  companyName: "Étoile Alu Madagascar",
  tagline: "Menuiserie Aluminium - Inox - Vitrerie & Soudure",
  address: "",
  city: "",
  phone: "",
  email: "",
  nif: "",
  stat: "",
  tva: "",
  currency: "MGA",
  defaultTaxRate: "",
  whatsapp: "",
  googleMapsEmbedUrl: ""
};

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin-uid-101',
    name: 'Directeur Général (Admin)',
    email: 'admin@etoile-alu.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'manager-uid-102',
    name: 'Jean Rakoto (Gestionnaire)',
    email: 'gestionnaire@etoile-alu.com',
    role: 'manager',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_QUOTES: Quote[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_CASHFLOW: CashflowEntry[] = [];
