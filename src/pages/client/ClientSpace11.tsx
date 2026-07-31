import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";

import {
  ref,
  onValue,
} from "firebase/database";

// AHITSIO IRETO IMPORT IRETO ARY
import { database } from "../firebase";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  image?: string;
  available?: boolean;
}

interface ChatMessage {
  id: number;
  sender: "assistant" | "client";
  message: string;
  time: string;
}

const suggestions = [
  "Fenêtre K56",
  "Cabine de douche",
  "Mur Rideau",
  "Véranda",
  "Porte Coulissante",
  "Volet roulant",
];

export default function ClientSpace() {

  const [products, setProducts] = useState<Product[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);

  const [typing, setTyping] = useState(false);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<ChatMessage>([
    {
      id: 1,
      sender: "assistant",
      time: new Date().toLocaleTimeString(),

      message:
        "👋 Bonjour ! Je suis votre Assistant Virtuel Étoile Alu.\n\nJe peux vous aider à trouver un produit, afficher son prix, sa description ou vérifier sa disponibilité.",
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  useEffect(() => {

    const productsRef = ref(database, "products");

    const unsubscribe = onValue(productsRef, (snapshot) => {

      const data = snapshot.val();

      if (!data) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      const list = Object.entries(data).map(([id, value]: any) => ({
        id,
        ...value,
      }));

      setProducts(list);

      setLoadingProducts(false);

    });

    return () => unsubscribe();

  }, []);

  const totalProducts = useMemo(() => products.length, [products]);

  return (

    <div className="relative min-h-screen overflow-hidden bg-slate-950">

    {/* Background */}

    <div className="absolute inset-0">

    <div className="absolute -top-52 -left-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />

    <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-amber-500/20 blur-[120px]" />

    <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-[150px]" />

    </div>

    {/* Particules */}

    <div className="absolute inset-0 opacity-20">

    <div className="absolute top-10 left-16 h-2 w-2 rounded-full bg-white animate-ping" />

    <div className="absolute top-60 right-24 h-3 w-3 rounded-full bg-cyan-300 animate-bounce" />

    <div className="absolute bottom-20 left-1/4 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />

    <div className="absolute bottom-60 right-1/3 h-2 w-2 rounded-full bg-white animate-ping" />

    </div>

    <div className="relative z-10 max-w-7xl mx-auto p-6">

    {/* HEADER */}

    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">

    <div className="p-8">

    <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">

    <div className="flex items-center gap-5">

    <div className="relative">

    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-700 flex items-center justify-center shadow-2xl">

    <Bot className="w-12 h-12 text-white"/>

    </div>

    <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-green-400 border-4 border-slate-950 animate-pulse"/>

    </div>

    <div>

    <h1 className="text-4xl font-black text-white">

    Assistant Virtuel

    </h1>

    <p className="text-cyan-300 mt-2">

    Bienvenue dans votre espace client Étoile Alu.

    </p>

    <div className="flex gap-3 mt-4 flex-wrap">

    <div className="rounded-full bg-cyan-500/20 px-4 py-2 text-cyan-200 text-sm flex items-center gap-2">

    <Package size={16}/>

    {totalProducts} Produits

    </div>

    <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-emerald-300 text-sm">

    Disponible 24h/24

    </div>

    <div className="rounded-full bg-amber-500/20 px-4 py-2 text-amber-300 text-sm flex items-center gap-2">

    <Clock3 size={16}/>

    Réponse instantanée

    </div>

    </div>

    </div>

    </div>

    <div className="flex gap-3">

    <button
    className="rounded-xl bg-white/10 hover:bg-white/20 transition px-5 py-3 text-white flex items-center gap-2">

    <RefreshCcw size={18}/>

    Nouvelle conversation

    </button>

    <button
    className="rounded-xl bg-red-500/20 hover:bg-red-500/30 transition px-5 py-3 text-red-300 flex items-center gap-2">

    <Trash2 size={18}/>

    Effacer

    </button>

    </div>

    </div>

    </div>

    </div>

    {/* CHAT */}

    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">

    <div className="p-6">

    <div
    className="h-[600px] overflow-y-auto space-y-5 pr-2">

    {/* Eto no hiseho ny conversation */}

    <div ref={endRef}></div>

    </div>

    </div>

    </div>

    </div>

    </div>

    );

    }