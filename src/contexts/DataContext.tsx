import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, push, update, remove, get } from 'firebase/database';
import { database } from '../firebase/config';
import { 
  Product, 
  Customer, 
  Order, 
  Quote, 
  Invoice, 
  CashflowEntry, 
  AppSettings,
  OrderStatus,
  Invoice as InvoiceType
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_ORDERS, 
  INITIAL_QUOTES, 
  INITIAL_INVOICES, 
  INITIAL_CASHFLOW, 
  INITIAL_SETTINGS 
} from '../data/initialData';
import { generateOrderNumber, generateQuoteNumber, generateInvoiceNumber } from '../utils/formatters';

interface DataContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  quotes: Quote[];
  invoices: Invoice[];
  cashflow: CashflowEntry[];
  settings: AppSettings;
  loading: boolean;
  
  // Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Orders
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<string>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateOrderItemFabrication: (
    orderId: string,
    itemIndex: number,
    fabricationStatus: string,
    fabricationProgress: number
  ) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  // Quotes
  addQuote: (quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt'>) => Promise<string>;
  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;
  updateQuoteStatus: (id: string, status: any) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  convertQuoteToOrder: (quoteId: string) => Promise<string>;
  convertQuoteToInvoice: (quoteId: string) => Promise<string>;

  // Invoices
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Promise<string>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  updateInvoicePayment: (id: string, advance: number, remaining: number, paymentStatus: 'Payé' | 'Partiel' | 'En attente') => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  registerInvoicePayment: (invoiceId: string, amount: number, paymentMethod: string) => Promise<void>;

  // Cashflow
  addCashflowEntry: (entry: Omit<CashflowEntry, 'id' | 'createdAt'>) => Promise<void>;
  addCashflow: (entry: Omit<CashflowEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteCashflowEntry: (id: string) => Promise<void>;
  deleteCashflow: (id: string) => Promise<void>;

  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetToInitialData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [cashflow, setCashflow] = useState<CashflowEntry[]>(INITIAL_CASHFLOW);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Helper for realtime database subscription
  useEffect(() => {
    let isSubscribed = true;

    // Helper to sync node
    const syncNode = <T,>(node: string, setFn: React.Dispatch<React.SetStateAction<T[]>>, initial: T[]) => {
      const nodeRef = ref(database, node);
      onValue(nodeRef, (snapshot) => {
        if (!isSubscribed) return;
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (Array.isArray(val)) {
            setFn(val.filter(Boolean));
          } else if (typeof val === 'object') {
            const list = Object.keys(val).map(key => ({
              id: key,
              ...val[key]
            }));
            setFn(list);
          }
        } else {
          // Initialize Firebase RTDB with seed data
          set(ref(database, node), initial);
          setFn(initial);
        }
      }, (err) => {
        console.warn(`Firebase node ${node} error, using fallback:`, err);
      });
    };

    syncNode('products', setProducts, INITIAL_PRODUCTS);
    syncNode('customers', setCustomers, INITIAL_CUSTOMERS);
    syncNode('orders', setOrders, INITIAL_ORDERS);
    syncNode('quotes', setQuotes, INITIAL_QUOTES);
    syncNode('invoices', setInvoices, INITIAL_INVOICES);
    syncNode('cashflow', setCashflow, INITIAL_CASHFLOW);

    // Settings sync
    const settingsRef = ref(database, 'settings');
    onValue(settingsRef, (snapshot) => {
      if (!isSubscribed) return;
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      } else {
        set(ref(database, 'settings'), INITIAL_SETTINGS);
      }
      setLoading(false);
    });

    return () => {
      isSubscribed = false;
    };
  }, []);

  //mis a jour fabrication
  const updateOrderItemFabrication = async (
    orderId:string,
    itemIndex:number,
    fabricationStatus:string,
    fabricationProgress:number
  )=>{

  const orderRef = ref(
    database,
    `orders/${orderId}`
  );
  const snapshot = await get(orderRef);

  if(snapshot.exists()){
    const order = snapshot.val();
    order.products[itemIndex].fabricationStatus =
        fabricationStatus;

    order.products[itemIndex].fabricationProgress =
        fabricationProgress;

    await update(orderRef,{
      products: order.products
    });
    }
  };

  // Products CRUD
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const id = 'prod-' + Date.now();
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await set(ref(database, `products/${id}`), newProduct);
    } catch {
      setProducts(prev => [newProduct, ...prev]);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await update(ref(database, `products/${id}`), productData);
    } catch {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await remove(ref(database, `products/${id}`));
    } catch {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Customers CRUD
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<string> => {
    const id = 'cust-' + Date.now();
    const newCustomer: Customer = {
      ...customerData,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await set(ref(database, `customers/${id}`), newCustomer);
    } catch {
      setCustomers(prev => [newCustomer, ...prev]);
    }
    return id;
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await update(ref(database, `customers/${id}`), customerData);
    } catch {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await remove(ref(database, `customers/${id}`));
    } catch {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  // Orders CRUD
  const addOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<string> => {
    const id = 'ord-' + Date.now();
    const orderNumber = generateOrderNumber(orders.length + 1);
    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: new Date().toISOString()
    };

    try {
      await set(ref(database, `orders/${id}`), newOrder);
    } catch {
      setOrders(prev => [newOrder, ...prev]);
    }

    // Automatically create Cashflow entry for Advance Payment if > 0
    if (newOrder.advancePayment > 0) {
      await addCashflowEntry({
        type: 'income',
        amount: newOrder.advancePayment,
        category: 'Vente / Acompte Client',
        description: `Acompte commande ${orderNumber} - Client ${newOrder.customerName}`,
        paymentMethod: 'Espèces',
        date: new Date().toISOString().split('T')[0]
      });
    }

    return id;
  };

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      await update(ref(database, `orders/${id}`), orderData);
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...orderData } : o));
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await update(ref(database, `orders/${id}`), { status });
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await remove(ref(database, `orders/${id}`));
    } catch {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  // Quotes CRUD
  const addQuote = async (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt'>): Promise<string> => {
    const id = 'quote-' + Date.now();
    const quoteNumber = generateQuoteNumber(quotes.length + 1);
    const newQuote: Quote = {
      ...quoteData,
      id,
      quoteNumber,
      createdAt: new Date().toISOString()
    };
    try {
      await set(ref(database, `quotes/${id}`), newQuote);
    } catch {
      setQuotes(prev => [newQuote, ...prev]);
    }
    return id;
  };

  const updateQuote = async (id: string, quoteData: Partial<Quote>) => {
    try {
      await update(ref(database, `quotes/${id}`), quoteData);
    } catch {
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...quoteData } : q));
    }
  };

  const updateQuoteStatus = async (id: string, status: any) => {
    await updateQuote(id, { status });
  };

  const deleteQuote = async (id: string) => {
    try {
      await remove(ref(database, `quotes/${id}`));
    } catch {
      setQuotes(prev => prev.filter(q => q.id !== id));
    }
  };

  const updateInvoicePayment = async (id: string, advance: number, remaining: number, paymentStatus: 'Payé' | 'Partiel' | 'En attente') => {
    await updateInvoice(id, { advance, remaining, paymentStatus });
  };

  const convertQuoteToOrder = async (quoteId: string): Promise<string> => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) throw new Error('Devis introuvable');

    const subtotal = quote.products.reduce((acc, p) => acc + p.totalPrice, 0);
    const taxAmount = (subtotal * quote.taxRate) / 100;
    const totalAmount = subtotal + quote.laborFee + quote.transportFee - quote.discount + taxAmount;

    const orderId = await addOrder({
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      customerAddress: quote.customerEmail || '',
      products: quote.products,
      laborFee: quote.laborFee,
      transportFee: quote.transportFee,
      discount: quote.discount,
      taxRate: quote.taxRate,
      subtotal,
      taxAmount,
      totalAmount,
      advancePayment: 0,
      remainingAmount: totalAmount,
      status: 'Nouveau',
      notes: `Issu du devis N° ${quote.quoteNumber}`
    });

    await updateQuote(quoteId, { status: 'Converti' });
    return orderId;
  };

  const convertQuoteToInvoice = async (quoteId: string): Promise<string> => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) throw new Error('Devis introuvable');

    const subtotal = quote.products.reduce((acc, p) => acc + p.totalPrice, 0);
    const taxAmount = (subtotal * quote.taxRate) / 100;
    const total = subtotal + quote.laborFee + quote.transportFee - quote.discount + taxAmount;

    const invoiceId = await addInvoice({
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      customerAddress: '',
      customerEmail: quote.customerEmail,
      products: quote.products,
      subtotal,
      laborFee: quote.laborFee,
      transportFee: quote.transportFee,
      discount: quote.discount,
      taxRate: quote.taxRate,
      taxAmount,
      total,
      advance: 0,
      remaining: total,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: 'En attente'
    });

    await updateQuote(quoteId, { status: 'Converti' });
    return invoiceId;
  };

  // Invoices CRUD
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<string> => {
    const id = 'inv-' + Date.now();
    const invoiceNumber = generateInvoiceNumber(invoices.length + 1);
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      invoiceNumber
    };

    try {
      await set(ref(database, `invoices/${id}`), newInvoice);
    } catch {
      setInvoices(prev => [newInvoice, ...prev]);
    }

    return id;
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      await update(ref(database, `invoices/${id}`), invoiceData);
    } catch {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...invoiceData } : inv));
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await remove(ref(database, `invoices/${id}`));
    } catch {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const registerInvoicePayment = async (invoiceId: string, amount: number, paymentMethod: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const newAdvance = inv.advance + amount;
    const newRemaining = Math.max(0, inv.total - newAdvance);
    const newStatus = newRemaining === 0 ? 'Payé' : 'Partiel';

    await updateInvoice(invoiceId, {
      advance: newAdvance,
      remaining: newRemaining,
      paymentStatus: newStatus
    });

    // Also record in cashflow
    await addCashflowEntry({
      type: 'income',
      amount,
      category: 'Vente / Acompte Client',
      description: `Règlement Facture N° ${inv.invoiceNumber} - ${inv.customerName}`,
      paymentMethod: paymentMethod as any,
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Cashflow CRUD
  const addCashflowEntry = async (entryData: Omit<CashflowEntry, 'id' | 'createdAt'>) => {
    const id = 'cash-' + Date.now();
    const newEntry: CashflowEntry = {
      ...entryData,
      id,
      createdAt: new Date().toISOString()
    };
    try {
      await set(ref(database, `cashflow/${id}`), newEntry);
    } catch {
      setCashflow(prev => [newEntry, ...prev]);
    }
  };

  const deleteCashflowEntry = async (id: string) => {
    try {
      await remove(ref(database, `cashflow/${id}`));
    } catch {
      setCashflow(prev => prev.filter(c => c.id !== id));
    }
  };

  const addCashflow = addCashflowEntry;
  const deleteCashflow = deleteCashflowEntry;

  // Settings
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };

    try {
      await set(ref(database, "settings"), updated);

      // UPDATE REACT STATE
      setSettings(updated);

    } catch (error) {
      console.error("Erreur updateSettings :", error);
      throw error;
    }
  };

  const resetToInitialData = async () => {
    try {
      await set(ref(database, 'products'), INITIAL_PRODUCTS);
      await set(ref(database, 'customers'), INITIAL_CUSTOMERS);
      await set(ref(database, 'orders'), INITIAL_ORDERS);
      await set(ref(database, 'quotes'), INITIAL_QUOTES);
      await set(ref(database, 'invoices'), INITIAL_INVOICES);
      await set(ref(database, 'cashflow'), INITIAL_CASHFLOW);
      await set(ref(database, 'settings'), INITIAL_SETTINGS);
    } catch {
      setProducts(INITIAL_PRODUCTS);
      setCustomers(INITIAL_CUSTOMERS);
      setOrders(INITIAL_ORDERS);
      setQuotes(INITIAL_QUOTES);
      setInvoices(INITIAL_INVOICES);
      setCashflow(INITIAL_CASHFLOW);
      setSettings(INITIAL_SETTINGS);
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        customers,
        orders,
        quotes,
        invoices,
        cashflow,
        settings,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOrder,
        updateOrder,
        updateOrderStatus,
        updateOrderItemFabrication,
        deleteOrder,
        addQuote,
        updateQuote,
        updateQuoteStatus,
        deleteQuote,
        convertQuoteToOrder,
        convertQuoteToInvoice,
        addInvoice,
        updateInvoice,
        updateInvoicePayment,
        deleteInvoice,
        registerInvoicePayment,
        addCashflowEntry,
        addCashflow,
        deleteCashflowEntry,
        deleteCashflow,
        updateSettings,
        resetToInitialData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};


export const generateTrackingNumber = () => {
  const now = new Date();

  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return `SUV-${yy}${mm}${dd}-${code}`;
};