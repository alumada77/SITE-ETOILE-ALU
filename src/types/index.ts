export type UserRole = 'admin' | 'manager' | 'visitor';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export type ProductCategory = 
  | 'Aluminium'
  | 'Fer & Forge'
  | 'Inox'
  | 'Vitrerie & Façades'
  | 'Soudure & Structure'
  | 'Accessoires & Quincaillerie';

export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;

  // prix de base (0 raha mampiasa options)
  price: number;

  options?: ProductOption[];

  unit: string;
  imageUrl: string;
  stock: number;
  status: 'En Stock' | 'Sur Commande' | 'Épuisé';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  notes: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  trackingNumber?: string;
  fabricationStatus?: string;
  fabricationProgress?: number;
  // Options produit
  selectedOptions?: {
    id:string;
    name:string;
    price:number;
  }[];
}

export type OrderStatus = 
  | 'Nouveau'
  | 'Devis'
  | 'En fabrication'
  | 'En cours'
  | 'Terminé'
  | 'Livré'
  | 'Annulé';

export interface Order {
  id: string;
  orderNumber: string; // e.g. CMD-2026-0001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  products: OrderItem[];
  laborFee: number;
  transportFee: number;
  discount: number;
  taxRate: number; // e.g. 20 for 20%
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  advancePayment: number;
  remainingAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export type QuoteStatus = 'En attente' | 'Accepté' | 'Refusé' | 'Expiré' | 'Converti';

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. DEV-2026-0001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  products: OrderItem[];
  subtotal: number;
  laborFee: number;
  transportFee: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: QuoteStatus;
  validUntil: string;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. FAC-2026-0001
  orderId?: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  products: OrderItem[];
  subtotal: number;
  laborFee: number;
  transportFee: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  trackingNumber?: string;
  advance: number;
  remaining: number;
  date: string;
  dueDate: string;
  paymentStatus: 'Payé' | 'Partiel' | 'En attente';
}

export type CashflowType = 'income' | 'expense';

export type CashflowCategory = string;

export interface CashflowEntry {
  id: string;
  type: CashflowType;
  amount: number;
  category: CashflowCategory;
  description: string;
  paymentMethod: 'Espèces' | 'Virement Bancaire' | 'Mobile Money' | 'Chèque';
  reference?: string;
  date: string;
  createdAt: string;
}

export interface AppSettings {
  companyName: string;
  tagline: string;
  logo: string;
  logopdf: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  nif: string;
  stat: string;
  tva?: string;
  currency: string; // e.g. "Ar" or "FCFA" or "€"
  defaultTaxRate: string;
  googleMapsEmbedUrl: string;
}
