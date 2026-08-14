import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  RefreshCcw,
  MessageCircle,
  Package,
  BadgeDollarSign,
  Clock3,
  CheckCircle2,
  XCircle,
  ImageOff,
  AlertTriangle,
  Inbox,
  Tag,
  Phone,
  MapPin,
  Mail,
  Building2,
  ShieldCheck,
  Globe,
} from "lucide-react";

import { ref, onValue } from "firebase/database";

// AHITSIO IRETO IMPORT IRETO ARY
import { database } from "../../firebase/config";

// ============================================================================
// TYPES
// ============================================================================

/** Supported languages: Malagasy, French, English. */
type Lang = "mg" | "fr" | "en";

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit?: string;
  status?: string;
  stock?: number;
  imageUrl?: string;
  options?: ProductOption[];
}

interface CompanySettings {
  companyName?: string;
  address?: string;
  city?: string;
  phone?: string;
  whatsapp?: string | number;
  email?: string;
  tagline?: string;
  currency?: string;
}

interface Customer {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface OrderRecord {
  id: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  status?: string;
  totalAmount?: number;
  remainingAmount?: number;
  trackingNumber?: string;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: string;
  total?: number;
  remaining?: number;
  dueDate?: string;
}

interface QuoteRecord {
  id: string;
  quoteNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  status?: string;
  total?: number;
  validUntil?: string;
}

interface ChatMessage {
  id: string;
  sender: "assistant" | "client";
  message: string;
  time: string;
  products?: Product[];
}

type Intent =
  | "greeting"
  | "thanks"
  | "company"
  | "statusCheck"
  | "quoteRequest"
  | "price"
  | "availability"
  | "recommend"
  | "browse"
  | "search"
  | "unknown";

/** What the assistant is waiting for on the client's *next* message. */
type PendingAction =
  | { type: "verify"; lang: Lang }
  | { type: "quoteDetails"; lang: Lang }
  | null;

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

const MG_WORDS = [
  "misy",
  "ve",
  "inona",
  "ahoana",
  "firy",
  "ohatrinona",
  "azafady",
  "tsara",
  "fa",
  "dia",
  "sy",
  "aiza",
  "vidiny",
  "varotra",
  "ianao",
  "anao",
  "tompoko",
  "manampy",
  "mba",
  "afaka",
  "izahay",
  "vokatra",
  "tsy",
  "hitako",
  "manao",
  "ny",
];

const FR_WORDS = [
  "bonjour",
  "bonsoir",
  "vous",
  "quel",
  "quelle",
  "combien",
  "prix",
  "commande",
  "devis",
  "facture",
  "est-ce",
  "des",
  "les",
  "le",
  "la",
  "je",
  "voudrais",
  "avez",
  "disponible",
  "merci",
  "cherche",
  "montre",
  "produit",
  "tarif",
  "coute",
  "coûte",
];

const EN_WORDS = [
  "hello",
  "hi",
  "hey",
  "price",
  "you",
  "do",
  "have",
  "order",
  "invoice",
  "quote",
  "the",
  "is",
  "are",
  "want",
  "need",
  "available",
  "thanks",
  "thank",
  "looking",
  "show",
  "product",
  "cost",
  "much",
];

function detectLanguage(text: string): Lang {
  const norm = ` ${normalize(text)} `;
  const score = (words: string[]) =>
    words.reduce((acc, w) => (norm.includes(` ${normalize(w)} `) ? acc + 1 : acc), 0);

  const mgScore = score(MG_WORDS);
  const frScore = score(FR_WORDS);
  const enScore = score(EN_WORDS);

  if (mgScore > frScore && mgScore > enScore) return "mg";
  if (enScore > frScore && enScore > mgScore) return "en";
  return "fr"; // default / tie-break
}

/** Pick the right string for the detected language. */
function L(lang: Lang, dict: { fr: string; en: string; mg: string }): string {
  return dict[lang];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SUGGESTIONS: string[] = [
  "Fenêtre K56",
  "Cabine de douche",
  "Mur Rideau",
  "Porte Coulissante",
  "Véranda",
  "Volet roulant",
  "Je veux un devis",
  "Contact",
];

const GREETING_WORDS = [
  "bonjour",
  "bonsoir",
  "salut",
  "coucou",
  "hello",
  "hi",
  "hey",
  "manahoana",
  "salama",
];

const THANKS_WORDS = [
  "merci",
  "thanks",
  "thank you",
  "remerciement",
  "misaotra",
];

const COMPANY_WORDS = [
  "adresse",
  "contact",
  "telephone",
  "téléphone",
  "whatsapp",
  "email",
  "e-mail",
  "qui etes",
  "qui êtes",
  "ou etes",
  "où êtes",
  "services",
  "entreprise",
  "societe",
  "société",
  "company",
  "address",
  "where are you",
  "aiza",
  "finday",
];

const STATUS_WORDS = [
  "ma commande",
  "mon devis",
  "ma facture",
  "etat de",
  "état de",
  "suivi",
  "tracking",
  "statut",
  "situation",
  "my order",
  "my invoice",
  "my quote",
  "order status",
  "payment status",
  "paiement de",
  "commandako",
  "facturako",
];

const QUOTE_REQUEST_WORDS = [
  "je veux un devis",
  "demande de devis",
  "devis pour",
  "faire un devis",
  "obtenir un devis",
  "get a quote",
  "i want a quote",
  "request a quote",
  "mila devis",
  "te hangataka devis",
];

const PRICE_WORDS = [
  "prix",
  "tarif",
  "coute",
  "coûte",
  "cout",
  "coût",
  "combien",
  "montant",
  "price",
  "cost",
  "how much",
  "vidiny",
  "ohatrinona",
];

const AVAILABILITY_WORDS = [
  "disponible",
  "dispo",
  "stock",
  "disponibilite",
  "disponibilité",
  "available",
  "in stock",
  "can i order",
  "misy",
  "azo",
];

const RECOMMEND_WORDS = [
  "conseil",
  "conseille",
  "recommand",
  "meilleur",
  "haut de gamme",
  "premium",
  "recommend",
  "best product",
  "suggest",
  "villa",
  "construis",
  "tolorana hevitra",
];

const BROWSE_WORDS = [
  "montre moi vos produits",
  "montrez moi vos produits",
  "vos produits",
  "catalogue",
  "liste des produits",
  "tous les produits",
  "your products",
  "show me your products",
  "what do you have",
  "vokatra rehetra",
];

// ============================================================================
// HELPERS
// ============================================================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Removes accents and lowercases a string for fuzzy, accent-insensitive search. */
function normalize(value: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesAny(text: string, words: string[]): boolean {
  const normalizedText = normalize(text);
  return words.some((w) => normalizedText.includes(normalize(w)));
}

/** Keeps only digits (and a leading +) so phone numbers can be compared loosely. */
function normalizePhone(value: string): string {
  return (value || "").replace(/[^\d]/g, "");
}

function phonesMatch(a?: string, b?: string): boolean {
  const da = normalizePhone(a || "");
  const db = normalizePhone(b || "");
  if (da.length < 6 || db.length < 6) return false;
  // Compare the last 8 digits so country-code / formatting differences don't matter.
  return da.slice(-8) === db.slice(-8);
}

/** Extracts something that looks like a phone number from free text. */
function extractPhoneCandidate(text: string): string | null {
  const digits = text.replace(/[^\d]/g, "");
  return digits.length >= 6 ? digits : null;
}

function formatMGA(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} MGA`;
}

function detectIntent(question: string): Intent {
  if (matchesAny(question, GREETING_WORDS)) return "greeting";
  if (matchesAny(question, THANKS_WORDS)) return "thanks";
  if (matchesAny(question, COMPANY_WORDS)) return "company";
  if (matchesAny(question, STATUS_WORDS)) return "statusCheck";
  if (matchesAny(question, QUOTE_REQUEST_WORDS)) return "quoteRequest";
  if (matchesAny(question, RECOMMEND_WORDS)) return "recommend";
  if (matchesAny(question, BROWSE_WORDS)) return "browse";
  if (matchesAny(question, PRICE_WORDS)) return "price";
  if (matchesAny(question, AVAILABILITY_WORDS)) return "availability";
  return "search";
}

/** Intelligent, accent/case-insensitive, partial-word product search. */
function searchProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  const scored = products
    .map((product) => {
      const optionNames = (product.options || []).map((o) => o.name).join(" ");
      const haystack = normalize(
        `${product.name} ${product.description} ${product.category} ${optionNames}`
      );

      const matchedTerms = terms.filter((term) => haystack.includes(term));
      if (matchedTerms.length === 0) return null;

      let score = matchedTerms.length;
      if (normalize(product.name).includes(normalizedQuery)) score += 5;
      if (normalize(product.category).includes(normalizedQuery)) score += 2;

      return { product, score };
    })
    .filter((entry): entry is { product: Product; score: number } => !!entry)
    .sort((a, b) => b.score - a.score);

  return scored.map((entry) => entry.product);
}

function isAvailable(product: Product): boolean {
  const stockOk = (product.stock ?? 0) > 0;
  const statusOk = !/rupture|indisponible|out of stock/i.test(product.status || "");
  return stockOk && statusOk;
}

/** Human readable price line for a product, respecting the "never invent prices" rule. */
function priceLine(product: Product, lang: Lang): string {
  const unit = product.unit ? `/${product.unit}` : "";

  if (product.price && product.price > 0) {
    return `${formatMGA(product.price)}${unit}`;
  }

  if (product.options && product.options.length > 0) {
    return product.options
      .map((o) => `${o.name}: ${formatMGA(o.price)}${unit}`)
      .join(" · ");
  }

  return L(lang, {
    fr: "Le prix dépend des options, dimensions et finitions. Nous pouvons établir un devis personnalisé.",
    en: "The price depends on options, dimensions and finish. We can prepare a custom quotation.",
    mg: "Miankina amin'ny safidy, refy ary vita ny vidiny. Afaka manome devis manokana izahay.",
  });
}

// ============================================================================
// SMALL SUB-COMPONENTS (kept inside this single file, no separate files)
// ============================================================================

const StatCard = React.memo(function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "cyan" | "emerald" | "amber";
}) {
  const toneClasses: Record<string, string> = {
    cyan: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/20",
    emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
    amber: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs ring-1 ${toneClasses[tone]}`}
    >
      {icon}
      <span className="font-semibold">{value}</span>
      <span className="text-white/50">{label}</span>
    </div>
  );
});

const StatSkeleton = React.memo(function StatSkeleton() {
  return <div className="h-8 w-28 animate-pulse rounded-full bg-white/10" />;
});

const TypingDots = React.memo(function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-cyan-300"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

const ProductCard = React.memo(function ProductCard({
  product,
  lang,
  onQuote,
  onView,
}: {
  product: Product;
  lang: Lang;
  onQuote: (product: Product) => void;
  onView: (product: Product) => void;
}) {
  const available = isAvailable(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-xl"
    >
      <div className="relative h-32 w-full overflow-hidden bg-slate-900/60">
        {product.imageUrl ? (
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30">
            <ImageOff size={28} />
          </div>
        )}

        <span
          className={`absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md ${
            available
              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
              : "bg-red-500/20 text-red-300 ring-1 ring-red-400/30"
          }`}
        >
          {available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {L(lang, {
            fr: available ? "Disponible" : "Indisponible",
            en: available ? "Available" : "Unavailable",
            mg: available ? "Misy" : "Tsy misy",
          })}
        </span>
      </div>

      <div className="space-y-2.5 p-4">
        <h4 className="text-base font-bold leading-snug text-white">
          {product.name}
        </h4>

        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300 ring-1 ring-cyan-400/20">
          <Tag size={11} />
          {product.category}
        </span>

        <p className="line-clamp-3 text-xs text-white/60">
          {product.description}
        </p>

        <div className="flex items-start gap-2 pt-1 text-amber-300">
          <BadgeDollarSign size={16} className="mt-0.5 shrink-0" />
          <span className="text-sm font-bold leading-snug">
            {priceLine(product, lang)}
          </span>
        </div>

        <div className="flex gap-2 pt-1.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onView(product)}
            className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
          >
            {L(lang, { fr: "Voir", en: "View", mg: "Jereo" })}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onQuote(product)}
            className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:opacity-90"
          >
            {L(lang, { fr: "Devis", en: "Quote", mg: "Devis" })}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

const MessageSkeleton = React.memo(function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/10" />
          <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-white/10" />
        </div>
      ))}
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientSpace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [typing, setTyping] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<PendingAction>(null);

  const endRef = useRef<HTMLDivElement>(null);

  // Keep latest values available inside stable callbacks without re-subscribing.
  const productsRef = useRef<Product[]>([]);
  productsRef.current = products;
  const settingsRef = useRef<CompanySettings | null>(null);
  settingsRef.current = settings;
  const customersRef = useRef<Customer[]>([]);
  customersRef.current = customers;
  const ordersRef = useRef<OrderRecord[]>([]);
  ordersRef.current = orders;
  const invoicesRef = useRef<InvoiceRecord[]>([]);
  invoicesRef.current = invoices;
  const quotesRef = useRef<QuoteRecord[]>([]);
  quotesRef.current = quotes;
  const pendingRef = useRef<PendingAction>(null);
  pendingRef.current = pending;

  // Seed the welcome message once, client-side, to avoid SSR/client id mismatches.
  useEffect(() => {
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: "assistant",
        time: formatTime(new Date()),
        message:
          "Bonjour 👋 Bienvenue chez Étoile Alu Mada.\n\nJe suis votre Assistant Commercial Virtuel. Posez-moi vos questions en malagasy, français ou anglais : produits, prix, disponibilité, devis, commandes...\n\nManahoana 👋 / Hello 👋",
      },
    ]);
  }, []);

  // Auto-scroll on new messages / typing state.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Firebase Realtime Database subscriptions.
  // Note: "cashflow" is intentionally never read here — it is admin-only data.
  useEffect(() => {
    setLoadingProducts(true);
    setFirebaseError(null);

    const productsRefDb = ref(database, "products");
    const settingsRefDb = ref(database, "settings");
    const customersRefDb = ref(database, "customers");
    const ordersRefDb = ref(database, "orders");
    const invoicesRefDb = ref(database, "invoices");
    const quotesRefDb = ref(database, "quotes");

    const unsubProducts = onValue(
      productsRefDb,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setProducts([]);
          setLoadingProducts(false);
          return;
        }
        const list: Product[] = Object.entries(
          data as Record<string, Omit<Product, "id">>
        ).map(([id, value]) => ({
          id,
          name: value.name ?? "",
          description: value.description ?? "",
          category: value.category ?? "",
          price: typeof value.price === "number" ? value.price : Number(value.price) || 0,
          unit: value.unit,
          status: value.status,
          stock: value.stock,
          imageUrl: value.imageUrl,
          options: value.options,
        }));
        setProducts(list);
        setLoadingProducts(false);
      },
      (error) => {
        setFirebaseError(error.message || "Erreur de connexion à la base de données.");
        setLoadingProducts(false);
      }
    );

    const unsubSettings = onValue(settingsRefDb, (snapshot) => {
      setSettings(snapshot.val() || null);
    });

    const unsubCustomers = onValue(customersRefDb, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCustomers([]);
        return;
      }
      setCustomers(
        Object.entries(data as Record<string, Omit<Customer, "id">>).map(
          ([id, value]) => ({ id, ...value })
        )
      );
    });

    const unsubOrders = onValue(ordersRefDb, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setOrders([]);
        return;
      }
      setOrders(
        Object.entries(data as Record<string, Omit<OrderRecord, "id">>).map(
          ([id, value]) => ({ id, ...value })
        )
      );
    });

    const unsubInvoices = onValue(invoicesRefDb, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setInvoices([]);
        return;
      }
      setInvoices(
        Object.entries(data as Record<string, Omit<InvoiceRecord, "id">>).map(
          ([id, value]) => ({ id, ...value })
        )
      );
    });

    const unsubQuotes = onValue(quotesRefDb, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setQuotes([]);
        return;
      }
      setQuotes(
        Object.entries(data as Record<string, Omit<QuoteRecord, "id">>).map(
          ([id, value]) => ({ id, ...value })
        )
      );
    });

    return () => {
      unsubProducts();
      unsubSettings();
      unsubCustomers();
      unsubOrders();
      unsubInvoices();
      unsubQuotes();
    };
  }, [retryKey]);

  const totalProducts = useMemo(() => products.length, [products]);
  const availableProducts = useMemo(
    () => products.filter(isAvailable).length,
    [products]
  );

  const pushMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const makeMsg = useCallback(
    (message: string, products?: Product[]): ChatMessage => ({
      id: crypto.randomUUID(),
      sender: "assistant",
      time: formatTime(new Date()),
      message,
      products,
    }),
    []
  );

  // -- Company info ----------------------------------------------------------
  const buildCompanyReply = useCallback((lang: Lang): ChatMessage => {
    const s = settingsRef.current;
    const name = s?.companyName || "Étoile Alu Mada";
    const address = s?.address || "By pass Lot IVB - Iavoloha";
    const phone = s?.phone || "+261 34 25 520 11";
    const whatsapp = s?.whatsapp ? `+${s.whatsapp}` : "+261 38 27 763 93";
    const email = s?.email || "etoile.alu.mada@gmail.com";
    const tagline = s?.tagline || "Menuiserie Aluminium - Inox - Vitrerie & Soudure";

    const header = L(lang, {
      fr: `🏢 ${name}`,
      en: `🏢 ${name}`,
      mg: `🏢 ${name}`,
    });

    const body = L(lang, {
      fr: `${tagline}\n\n📍 Adresse : ${address}\n📞 Téléphone : ${phone}\n💬 WhatsApp : ${whatsapp}\n✉️ Email : ${email}\n\nServices : Menuiserie Aluminium, Inox, Vitrerie, Soudure.`,
      en: `${tagline}\n\n📍 Address: ${address}\n📞 Phone: ${phone}\n💬 WhatsApp: ${whatsapp}\n✉️ Email: ${email}\n\nServices: Aluminium joinery, Stainless steel, Glazing, Welding.`,
      mg: `${tagline}\n\n📍 Adiresy : ${address}\n📞 Telefaonina : ${phone}\n💬 WhatsApp : ${whatsapp}\n✉️ Email : ${email}\n\nSerivisy : Aluminium, Inox, Vitrerie, Soudure.`,
    });

    return makeMsg(`${header}\n\n${body}`);
  }, [makeMsg]);

  // -- Quote request -----------------------------------------------------------
  const buildQuoteRequestReply = useCallback((lang: Lang): ChatMessage => {
    return makeMsg(
      L(lang, {
        fr: "Avec plaisir ! Pour préparer votre devis, merci de me communiquer en un seul message :\n\n• Le produit souhaité\n• Les dimensions\n• La quantité\n• Votre nom\n• Votre téléphone\n\nNotre équipe commerciale vous recontactera rapidement.",
        en: "Happy to help! To prepare your quotation, please send me in one message:\n\n• The product you want\n• Dimensions\n• Quantity\n• Your name\n• Your phone number\n\nOur sales team will contact you shortly.",
        mg: "Faly manampy izahay! Mba ampio ny devis, alefaso amin'ny hafatra iray ireto:\n\n• Ny vokatra tadiavina\n• Ny refy\n• Ny isany\n• Ny anaranao\n• Ny nomerao\n\nHiantso anao faingana ny ekipa varotra.",
      })
    );
  }, [makeMsg]);

  const buildQuoteDetailsAckReply = useCallback((lang: Lang): ChatMessage => {
    const s = settingsRef.current;
    const whatsapp = s?.whatsapp ? `+${s.whatsapp}` : "+261 38 27 763 93";
    return makeMsg(
      L(lang, {
        fr: `Merci, votre demande a bien été notée 📩\n\nPour accélérer le traitement, vous pouvez aussi nous écrire directement sur WhatsApp : ${whatsapp}. Notre équipe vous enverra un devis personnalisé.`,
        en: `Thank you, your request has been noted 📩\n\nTo speed things up, you can also message us directly on WhatsApp: ${whatsapp}. Our team will send you a personalised quotation.`,
        mg: `Misaotra, voaraiky ny fangatahanao 📩\n\nMba hahafaingana azy, azonao atao ny mandefa hafatra amin'ny WhatsApp: ${whatsapp}. Handefa devis manokana ho anao ny ekipanay.`,
      })
    );
  }, [makeMsg]);

  // -- Identity verification for order/invoice/quote status --------------------
  const buildAskVerificationReply = useCallback((lang: Lang): ChatMessage => {
    return makeMsg(
      L(lang, {
        fr: "Pour votre sécurité, je dois d'abord vérifier votre identité.\n\nMerci de me communiquer le numéro de téléphone utilisé lors de votre commande.",
        en: "For your security, I first need to verify your identity.\n\nPlease send me the phone number used for your order.",
        mg: "Mba hiarovana ny mombamomba anao, ilaina aloha ny fanamarinana.\n\nAmpio azafady ny laharan-tarifao nampiasainao tamin'ny fanaovana ny commande.",
      })
    );
  }, [makeMsg]);

  const buildStatusReply = useCallback(
    (lang: Lang, phoneCandidate: string): ChatMessage => {
      const customer = customersRef.current.find((c) =>
        phonesMatch(c.phone, phoneCandidate)
      );

      const matchingOrders = ordersRef.current.filter(
        (o) =>
          phonesMatch(o.customerPhone, phoneCandidate) ||
          (customer && o.customerId === customer.id)
      );
      const matchingInvoices = invoicesRef.current.filter(
        (i) =>
          phonesMatch(i.customerPhone, phoneCandidate) ||
          (customer && i.customerId === customer.id)
      );
      const matchingQuotes = quotesRef.current.filter(
        (q) =>
          phonesMatch(q.customerPhone, phoneCandidate) ||
          (customer && q.customerId === customer.id)
      );

      if (
        !customer &&
        matchingOrders.length === 0 &&
        matchingInvoices.length === 0 &&
        matchingQuotes.length === 0
      ) {
        return makeMsg(
          L(lang, {
            fr: "Je n'ai trouvé aucun dossier avec ce numéro. Vérifiez le numéro ou contactez directement notre équipe.",
            en: "I couldn't find any record with this number. Please check it or contact our team directly.",
            mg: "Tsy nahitako antontan-taratasy amin'io laharana io. Jereo indray ny laharana na antsoy mivantana ny ekipanay.",
          })
        );
      }

      const lines: string[] = [];

      matchingQuotes.forEach((q) => {
        lines.push(
          L(lang, {
            fr: `📄 Devis ${q.quoteNumber || q.id} — Statut : ${q.status || "N/A"}${
              q.total ? ` — Total : ${formatMGA(q.total)}` : ""
            }${q.validUntil ? ` — Valide jusqu'au ${q.validUntil}` : ""}`,
            en: `📄 Quote ${q.quoteNumber || q.id} — Status: ${q.status || "N/A"}${
              q.total ? ` — Total: ${formatMGA(q.total)}` : ""
            }${q.validUntil ? ` — Valid until ${q.validUntil}` : ""}`,
            mg: `📄 Devis ${q.quoteNumber || q.id} — Satan'ny: ${q.status || "N/A"}${
              q.total ? ` — Total: ${formatMGA(q.total)}` : ""
            }${q.validUntil ? ` — Manan-kery hatramin'ny ${q.validUntil}` : ""}`,
          })
        );
      });

      matchingOrders.forEach((o) => {
        lines.push(
          L(lang, {
            fr: `📦 Commande ${o.orderNumber || o.id} — Statut : ${o.status || "N/A"}${
              o.totalAmount ? ` — Total : ${formatMGA(o.totalAmount)}` : ""
            }${
              o.remainingAmount
                ? ` — Reste à payer : ${formatMGA(o.remainingAmount)}`
                : ""
            }`,
            en: `📦 Order ${o.orderNumber || o.id} — Status: ${o.status || "N/A"}${
              o.totalAmount ? ` — Total: ${formatMGA(o.totalAmount)}` : ""
            }${
              o.remainingAmount
                ? ` — Balance due: ${formatMGA(o.remainingAmount)}`
                : ""
            }`,
            mg: `📦 Commande ${o.orderNumber || o.id} — Satan'ny: ${o.status || "N/A"}${
              o.totalAmount ? ` — Total: ${formatMGA(o.totalAmount)}` : ""
            }${
              o.remainingAmount
                ? ` — Sisa aloa: ${formatMGA(o.remainingAmount)}`
                : ""
            }`,
          })
        );
      });

      matchingInvoices.forEach((i) => {
        lines.push(
          L(lang, {
            fr: `🧾 Facture ${i.invoiceNumber || i.id} — ${i.paymentStatus || "N/A"}${
              i.total ? ` — Total : ${formatMGA(i.total)}` : ""
            }${i.remaining ? ` — Reste : ${formatMGA(i.remaining)}` : ""}`,
            en: `🧾 Invoice ${i.invoiceNumber || i.id} — ${i.paymentStatus || "N/A"}${
              i.total ? ` — Total: ${formatMGA(i.total)}` : ""
            }${i.remaining ? ` — Remaining: ${formatMGA(i.remaining)}` : ""}`,
            mg: `🧾 Facture ${i.invoiceNumber || i.id} — ${i.paymentStatus || "N/A"}${
              i.total ? ` — Total: ${formatMGA(i.total)}` : ""
            }${i.remaining ? ` — Sisa: ${formatMGA(i.remaining)}` : ""}`,
          })
        );
      });

      const greetName = customer?.name
        ? L(lang, {
            fr: `Bonjour ${customer.name} 👋\n\n`,
            en: `Hello ${customer.name} 👋\n\n`,
            mg: `Manahoana ${customer.name} 👋\n\n`,
          })
        : "";

      return makeMsg(
        `${greetName}${lines.join("\n") || L(lang, {
          fr: "Aucun dossier trouvé.",
          en: "No record found.",
          mg: "Tsy misy antontan-taratasy hita.",
        })}`
      );
    },
    [makeMsg]
  );

  // -- Core assistant reply builder --------------------------------------------
  const buildAssistantReply = useCallback(
    (rawQuestion: string): ChatMessage => {
      const lang = detectLanguage(rawQuestion);
      const currentProducts = productsRef.current;

      // Step 1: handle whatever the assistant is waiting for from the client.
      const currentPending = pendingRef.current;
      if (currentPending?.type === "verify") {
        const phoneCandidate = extractPhoneCandidate(rawQuestion);
        setPending(null);
        if (!phoneCandidate) {
          return makeMsg(
            L(currentPending.lang, {
              fr: "Je n'ai pas reconnu de numéro de téléphone. Pouvez-vous le renvoyer (ex: 034 25 520 11) ?",
              en: "I couldn't recognise a phone number. Could you resend it (e.g. 034 25 520 11)?",
              mg: "Tsy fantatro ho laharan-tariby. Alefaso indray azafady (oh: 034 25 520 11).",
            })
          );
        }
        return buildStatusReply(currentPending.lang, phoneCandidate);
      }

      if (currentPending?.type === "quoteDetails") {
        setPending(null);
        return buildQuoteDetailsAckReply(currentPending.lang);
      }

      // Step 2: normal intent detection.
      const intent = detectIntent(rawQuestion);
      const matches = searchProducts(currentProducts, rawQuestion);

      if (intent === "greeting") {
        return makeMsg(
          L(lang, {
            fr: "Bonjour 👋\n\nBienvenue chez Étoile Alu Mada. Comment puis-je vous aider ?",
            en: "Hello 👋\n\nWelcome to Étoile Alu Mada. How can I help you?",
            mg: "Manahoana 👋\n\nTonga soa eto amin'ny Étoile Alu Mada. Inona no azoko atao ho anao?",
          })
        );
      }

      if (intent === "thanks") {
        return makeMsg(
          L(lang, {
            fr: "Avec plaisir 😊\n\nN'hésitez pas à revenir si vous avez d'autres questions.",
            en: "You're welcome 😊\n\nFeel free to come back if you have more questions.",
            mg: "Faly nanampy 😊\n\nAza misalasala miverina raha manam-panontaniana hafa.",
          })
        );
      }

      if (intent === "company") {
        return buildCompanyReply(lang);
      }

      if (intent === "statusCheck") {
        setPending({ type: "verify", lang });
        return buildAskVerificationReply(lang);
      }

      if (intent === "quoteRequest") {
        setPending({ type: "quoteDetails", lang });
        return buildQuoteRequestReply(lang);
      }

      if (intent === "recommend") {
        const top = [...currentProducts]
          .filter((p) => p.price && p.price > 0)
          .sort((a, b) => b.price - a.price)
          .slice(0, 3);
        const pool = top.length > 0 ? top : currentProducts.slice(0, 3);
        return makeMsg(
          L(lang, {
            fr: "Voici nos produits les plus recommandés pour un projet haut de gamme :",
            en: "Here are our most recommended products for a premium project:",
            mg: "Ireto ny vokatra soafantsy indrindra ho an'ny tetikasa avo lenta:",
          }),
          pool
        );
      }

      if (intent === "browse") {
        const categories = Array.from(
          new Set(currentProducts.map((p) => p.category).filter(Boolean))
        );
        const intro = L(lang, {
          fr: `Nous proposons ${currentProducts.length} produits dans les catégories : ${categories.join(", ")}.`,
          en: `We offer ${currentProducts.length} products across categories: ${categories.join(", ")}.`,
          mg: `Manolotra vokatra ${currentProducts.length} amin'ny sokajy: ${categories.join(", ")} izahay.`,
        });
        return makeMsg(intro, currentProducts.slice(0, 6));
      }

      if (intent === "price") {
        if (matches.length > 0) {
          const lines = matches
            .slice(0, 3)
            .map((p) => `• ${p.name} : ${priceLine(p, lang)}`)
            .join("\n");
          return makeMsg(
            `${L(lang, {
              fr: "Voici les tarifs correspondants :",
              en: "Here are the matching prices:",
              mg: "Ireto ny vidiny mifanaraka:",
            })}\n\n${lines}`,
            matches.slice(0, 3)
          );
        }
        return makeMsg(
          L(lang, {
            fr: "Je n'ai pas trouvé ce produit, mais notre équipe peut vous proposer une solution personnalisée.",
            en: "I haven't found this product yet, but I can help you request a custom quotation.",
            mg: "Tsy hitako io vokatra io, fa afaka manampy anao amin'ny devis manokana izahay.",
          })
        );
      }

      if (intent === "availability") {
        if (matches.length > 0) {
          const lines = matches
            .slice(0, 3)
            .map(
              (p) =>
                `• ${p.name} : ${
                  isAvailable(p)
                    ? L(lang, { fr: "disponible ✅", en: "available ✅", mg: "misy ✅" })
                    : L(lang, {
                        fr: "indisponible ❌",
                        en: "unavailable ❌",
                        mg: "tsy misy ❌",
                      })
                }`
            )
            .join("\n");
          return makeMsg(
            `${L(lang, {
              fr: "Voici la disponibilité :",
              en: "Here is the availability:",
              mg: "Ireto ny fisiany:",
            })}\n\n${lines}`,
            matches.slice(0, 3)
          );
        }
        return makeMsg(
          L(lang, {
            fr: "Je n'ai pas trouvé ce produit, mais notre équipe peut vous proposer une solution personnalisée.",
            en: "I haven't found this product yet, but I can help you request a custom quotation.",
            mg: "Tsy hitako io vokatra io, fa afaka manampy anao amin'ny devis manokana izahay.",
          })
        );
      }

      // Generic product search intent.
      if (matches.length > 0) {
        return makeMsg(
          matches.length === 1
            ? L(lang, {
                fr: "J'ai trouvé ce produit pour vous :",
                en: "I found this product for you:",
                mg: "Ity ny vokatra hitako ho anao:",
              })
            : L(lang, {
                fr: `J'ai trouvé ${matches.length} produits correspondants :`,
                en: `I found ${matches.length} matching products:`,
                mg: `Nahitako vokatra ${matches.length} mifanaraka:`,
              }),
          matches.slice(0, 4)
        );
      }

      // No match at all — friendly multilingual fallback + a few suggestions.
      const fallback = currentProducts.slice(0, 3);
      return makeMsg(
        L(lang, {
          fr: "Je n'ai pas trouvé ce produit, mais notre équipe peut vous proposer une solution personnalisée.",
          en: "I haven't found this product yet, but I can help you request a custom quotation.",
          mg: "Tsy hitako io vokatra io, fa afaka manampy anao amin'ny devis manokana izahay.",
        }),
        fallback.length > 0 ? fallback : undefined
      );
    },
    [
      makeMsg,
      buildCompanyReply,
      buildAskVerificationReply,
      buildQuoteRequestReply,
      buildQuoteDetailsAckReply,
      buildStatusReply,
    ]
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "client",
        time: formatTime(new Date()),
        message: trimmed,
      };

      pushMessage(userMessage);
      setQuestion("");
      setTyping(true);

      const delay = 450 + Math.random() * 450;
      window.setTimeout(() => {
        const reply = buildAssistantReply(trimmed);
        pushMessage(reply);
        setTyping(false);
      }, delay);
    },
    [typing, pushMessage, buildAssistantReply]
  );

  const handleSend = useCallback(() => {
    sendMessage(question);
  }, [sendMessage, question]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleSuggestionClick = useCallback(
    (label: string) => {
      sendMessage(label);
    },
    [sendMessage]
  );

  const handleNewConversation = useCallback(() => {
    setPending(null);
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: "assistant",
        time: formatTime(new Date()),
        message:
          "Bonjour 👋 Bienvenue chez Étoile Alu Mada.\n\nJe suis votre Assistant Commercial Virtuel. Posez-moi vos questions en malagasy, français ou anglais.",
      },
    ]);
    setQuestion("");
  }, []);

  const handleClear = useCallback(() => {
    setPending(null);
    setMessages([]);
    setQuestion("");
  }, []);

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  const handleViewProduct = useCallback((product: Product) => {
    if (product.imageUrl) {
      window.open(product.imageUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleQuoteProduct = useCallback(
    (product: Product) => {
      const lang = detectLanguage(question || product.name);
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "client",
        time: formatTime(new Date()),
        message: L(lang, {
          fr: `Je souhaite un devis pour ${product.name}`,
          en: `I would like a quotation for ${product.name}`,
          mg: `Mila devis ho an'ny ${product.name} aho`,
        }),
      };
      pushMessage(userMessage);
      setTyping(true);
      setPending({ type: "quoteDetails", lang });

      window.setTimeout(() => {
        pushMessage(buildQuoteRequestReply(lang));
        setTyping(false);
      }, 500);
    },
    [pushMessage, question, buildQuoteRequestReply]
  );

  const showEmptyDatabaseNotice =
    !loadingProducts && !firebaseError && products.length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated background glow */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -left-40 -top-52 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]"
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 top-40 h-80 w-80 rounded-full bg-amber-500/20 blur-[120px]"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-[150px]"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-5xl p-4 sm:p-6"
      >
        {/* HEADER */}
        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col items-center justify-between gap-5 lg:flex-row">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <motion.div
                  className="relative"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-700 shadow-2xl">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 animate-pulse rounded-full border-4 border-slate-950 bg-green-400" />
                </motion.div>

                <div>
                  <h1 className="flex items-center justify-center gap-2 text-xl font-black text-white sm:justify-start sm:text-2xl">
                    Assistant Commercial Virtuel Étoile Alu
                    <Sparkles className="h-5 w-5 text-amber-300" />
                  </h1>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-cyan-300 sm:justify-start">
                    <Globe size={13} />
                    Malagasy 🇲🇬 · Français 🇫🇷 · English 🇬🇧
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {loadingProducts ? (
                      <>
                        <StatSkeleton />
                        <StatSkeleton />
                      </>
                    ) : (
                      <>
                        <StatCard
                          icon={<Package size={14} />}
                          value={String(totalProducts)}
                          label="produits"
                          tone="cyan"
                        />
                        <StatCard
                          icon={<CheckCircle2 size={14} />}
                          value={String(availableProducts)}
                          label="disponibles"
                          tone="emerald"
                        />
                        <StatCard
                          icon={<Clock3 size={14} />}
                          value="< 1s"
                          label="réponse"
                          tone="amber"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={handleNewConversation}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/20"
                >
                  <RefreshCcw size={16} />
                  Nouvelle
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={handleClear}
                  className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/30"
                >
                  <Trash2 size={16} />
                  Effacer
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR STATE */}
        {firebaseError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-center backdrop-blur-xl"
          >
            <AlertTriangle className="h-8 w-8 text-red-300" />
            <div>
              <h3 className="text-base font-bold text-white">
                Impossible de charger les données
              </h3>
              <p className="mt-1 text-sm text-red-200/80">{firebaseError}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              onClick={handleRetry}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              <RefreshCcw size={15} />
              Réessayer
            </motion.button>
          </motion.div>
        )}

        {/* EMPTY DATABASE STATE */}
        {showEmptyDatabaseNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
          >
            <Inbox className="h-8 w-8 text-white/30" />
            <p className="font-medium text-white/60">
              Aucun produit disponible.
            </p>
          </motion.div>
        )}

        {/* CHAT — compact, premium glass window */}
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="p-4 sm:p-5">
            <div className="h-[400px] space-y-4 overflow-y-auto pr-1 sm:pr-2">
              {loadingProducts && messages.length <= 1 && <MessageSkeleton />}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "client" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        msg.sender === "assistant"
                          ? "bg-gradient-to-br from-cyan-400 to-indigo-600"
                          : "bg-white/10"
                      }`}
                    >
                      {msg.sender === "assistant" ? (
                        <Bot size={15} className="text-white" />
                      ) : (
                        <User size={15} className="text-white" />
                      )}
                    </div>

                    <div
                      className={`flex max-w-[85%] flex-col gap-2.5 ${
                        msg.sender === "client" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-lg ${
                          msg.sender === "assistant"
                            ? "rounded-tl-sm bg-white/10 text-white/90"
                            : "rounded-tr-sm bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                        }`}
                      >
                        {msg.message.split("\n").map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>

                      {msg.products && msg.products.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {msg.products.map((p) => (
                            <ProductCard
                              key={p.id}
                              product={p}
                              lang={detectLanguage(msg.message)}
                              onView={handleViewProduct}
                              onQuote={handleQuoteProduct}
                            />
                          ))}
                        </div>
                      )}

                      <span className="px-1 text-[10px] text-white/30">
                        {msg.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600">
                    <Bot size={15} className="text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5">
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              <div ref={endRef} />
            </div>

            {/* QUICK SUGGESTIONS */}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {SUGGESTIONS.map((chip) => (
                <motion.button
                  key={chip}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => handleSuggestionClick(chip)}
                  disabled={typing}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-white/70 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MessageCircle size={12} />
                  {chip}
                </motion.button>
              ))}
            </div>

            {/* INPUT */}
            <div className="mt-3 flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Misy fenêtre K56 ve? / Quel est le prix ? / Do you have windows?"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/40 focus:bg-white/10"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.04 }}
                onClick={handleSend}
                disabled={typing || !question.trim()}
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* COMPANY FOOTER STRIP */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] text-white/50 backdrop-blur-xl sm:justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 size={13} className="text-cyan-300" />
            {settings?.companyName || "Étoile Alu Mada"}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-cyan-300" />
            {settings?.address || "By pass Lot IVB - Iavoloha"}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={13} className="text-cyan-300" />
            {settings?.phone || "+261 34 25 520 11"}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail size={13} className="text-cyan-300" />
            {settings?.email || "etoile.alu.mada@gmail.com"}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300/80">
            <ShieldCheck size={13} />
            Données financières protégées
          </span>
        </div>
      </motion.div>
    </div>
  );
}