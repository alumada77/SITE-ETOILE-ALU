import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Truck,
  Headphones,
  Award,
  Package,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
} from "lucide-react";

import { useData } from "../../contexts/DataContext";
import { Order } from "@/types";

interface TrackingForm {
  orderNumber: string;
  trackingNumber: string;
  phone: string;
}


interface TrackingResult {
  id: string;
  orderNumber: string;
  trackingNumber?: string;
  customerName: string;
  customerPhone: string;
  products: any[];
  totalAmount: number;
  advancePayment: number;
  remainingAmount: number;
  status: string;
  createdAt?: string;
  estimatedDelivery?: string;
}

const OrderTracking = () => {
  const { orders } = useData();
  const [form, setForm] = useState<TrackingForm>({
    orderNumber: "",
    trackingNumber: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [order, setOrder] = useState<TrackingResult | null>(null);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

const searchOrder = async (): Promise<TrackingResult | null> => {

  const orderNumber = form.orderNumber
    .trim()
    .toLowerCase();

  const trackingNumber = form.trackingNumber
    .trim()
    .toLowerCase();


  if (!orderNumber || !trackingNumber) {
    setError(
      "Veuillez saisir le numéro de commande et le numéro de suivi."
    );
    return null;
  }



  const foundOrder = orders.find((o) => {

    const dbOrderNumber =
      o.orderNumber
        ?.trim()
        .toLowerCase();


    const dbTrackingNumber =
      o.trackingNumber
        ?.trim()
        .toLowerCase();



    return (
      dbOrderNumber === orderNumber &&
      dbTrackingNumber === trackingNumber
    );

  });



  if (!foundOrder) {

    setError(
      "Le numéro de commande ou le numéro de suivi est incorrect."
    );

    return null;

  }



  return {

    id: foundOrder.id,

    orderNumber:
      foundOrder.orderNumber,


    trackingNumber:
      foundOrder.trackingNumber,


    customerName:
      foundOrder.customerName,


    customerPhone:
      foundOrder.customerPhone,


    products:
      foundOrder.products,


    totalAmount:
      foundOrder.totalAmount,


    advancePayment:
      foundOrder.advancePayment,


    remainingAmount:
      foundOrder.remainingAmount,


    status:
      foundOrder.status,


    createdAt:
      foundOrder.createdAt,


    estimatedDelivery:
      foundOrder.estimatedDelivery,

  };

};

const handleSearch = async (
    e: React.FormEvent<HTMLFormElement>
    ) => {

    e.preventDefault();


    // Reset
    setError("");
    setOrder(null);
    setShowResult(false);



    // Vérification champs obligatoires
    if (
        !form.orderNumber.trim() ||
        !form.trackingNumber.trim()
    ) {

        setError(
        "Veuillez renseigner le numéro de commande et le numéro de suivi."
        );

        return;
    }



    setLoading(true);



    try {

        const result = await searchOrder();



        if (result) {


        // Stockage résultat
        setOrder(result);


        // Affichage interface résultat
        setTimeout(() => {

            setShowResult(true);

        }, 300);



        setSearched(true);



        } else {


        setOrder(null);

        setShowResult(false);


        setError(
            "Aucune commande ne correspond aux informations saisies."
        );


        setSearched(false);

        }



    } catch (error) {


        console.error(
        "Erreur recherche commande:",
        error
        );


        setOrder(null);

        setShowResult(false);


        setError(
        "Une erreur est survenue lors de la recherche."
        );


        setSearched(false);



    } finally {


        setLoading(false);


    }

};

const getStatusProgress = (
    status:string
  )=>{

    switch(status){
      case "Nouveau":
        return 10;
      case "Devis":
        return 20;
      case "En fabrication":
        return 60;
      case "En cours":
        return 75;
      case "Terminé":
        return 90;
      case "Livré":
        return 100;
      default:
        return 0;
    }
  };


  return (
    <div className="
      min-h-screen
      bg-gradient-to-br
      from-slate-950
      via-slate-900
      to-amber-950
      p-4
      md:p-10
    ">

      {/* Partie 2/4 manomboka eto */}
      {/* =============================== HERO SECTION ================================ */}

        <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto"
        >


        {/* Animated Header */}

        <div className="text-center mb-10">



            <motion.div
            animate={{
                rotate: [0, 5, -5, 0],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
            }}
            className="
                inline-flex
                items-center
                justify-center
                w-20
                h-20
                rounded-3xl
                bg-amber-500/20
                border
                border-amber-400/30
                mb-6
            "
            >

            <Package
                className="
                w-10
                h-10
                text-amber-400
                "
            />

            </motion.div>



            <h1
            className="
                text-3xl
                md:text-5xl
                font-black
                text-white
                uppercase
                tracking-tight
            "
            >

            Suivi de votre commande

            </h1>



            <p
            className="
                mt-4
                text-sm
                md:text-base
                text-slate-400
                max-w-xl
                mx-auto
            "
            >

            Suivez en temps réel l'avancement
            de votre ouvrage aluminium,
            de la fabrication jusqu'à la livraison.

            </p>
        </div>


        {/* SEARCH CARD */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5 }}
            className="
                mt-10
                w-full
                max-w-3xl
                mx-auto
                rounded-[30px]
                border
                border-white/10
                bg-white/5
                backdrop-blur-2xl
                shadow-[0_20px_80px_rgba(0,0,0,.35)]
                overflow-hidden
            "
            >

            {/* HEADER */}
            <div className="relative overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-orange-500/20" />

                <div className="relative px-8 py-7">

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">

                    <ShieldCheck className="w-4 h-4 text-amber-400"/>

                    <span className="text-[10px] uppercase tracking-widest font-black text-amber-300">
                    Suivi sécurisé
                    </span>

                </div>

                <h2 className="mt-5 text-3xl font-black text-white">
                    Suivre votre commande
                </h2>

                <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-xl">
                    Entrez votre numéro de commande ainsi que votre numéro de suivi
                    afin de consulter en temps réel l'état d'avancement de votre fabrication.
                </p>

                </div>

            </div>

            {/* FORM */}
            <form
                onSubmit={handleSearch}
                className="px-8 pb-8 space-y-6"
            >

                <div className="grid md:grid-cols-2 gap-5">

                {/* COMMANDE */}

                <div>

                    <label className="block mb-2 text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Numéro de commande
                    </label>

                    <div
                    className="
                        group
                        flex
                        items-center
                        rounded-2xl
                        border
                        border-slate-700
                        bg-slate-900/70
                        px-4
                        transition
                        focus-within:border-amber-400
                        focus-within:ring-2
                        focus-within:ring-amber-500/20
                    "
                    >

                    <Package className="w-5 h-5 text-amber-400"/>

                    <input
                        name="orderNumber"
                        value={form.orderNumber}
                        onChange={handleChange}
                        placeholder="CMD-260730-AB45XZ"
                        className="
                        w-full
                        bg-transparent
                        px-4
                        py-4
                        text-sm
                        text-white
                        placeholder:text-slate-500
                        outline-none
                        "
                    />

                    </div>

                </div>

                {/* TRACKING */}

                <div>

                    <label className="block mb-2 text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Numéro de suivi
                    </label>

                    <div
                    className="
                        flex
                        items-center
                        rounded-2xl
                        border
                        border-slate-700
                        bg-slate-900/70
                        px-4
                        transition
                        focus-within:border-emerald-400
                        focus-within:ring-2
                        focus-within:ring-emerald-500/20
                    "
                    >

                    <ShieldCheck className="w-5 h-5 text-emerald-400"/>

                    <input
                        name="trackingNumber"
                        value={form.trackingNumber}
                        onChange={handleChange}
                        placeholder="TRK-X5H29Q"
                        className="
                        w-full
                        bg-transparent
                        px-4
                        py-4
                        text-sm
                        text-white
                        placeholder:text-slate-500
                        outline-none
                        "
                    />

                    </div>

                </div>

                </div>

                {/* BOUTON */}

                <motion.button

                whileHover={{
                    scale:1.02,
                    y:-2
                }}

                whileTap={{
                    scale:.98
                }}

                disabled={
                    loading ||
                    !form.orderNumber.trim() ||
                    !form.trackingNumber.trim()
                }

                type="submit"

                className="
                    relative
                    overflow-hidden
                    w-full
                    rounded-2xl
                    py-4
                    font-black
                    uppercase
                    tracking-widest
                    text-sm
                    bg-gradient-to-r
                    from-amber-400
                    via-orange-400
                    to-orange-600
                    text-slate-950
                    shadow-xl
                    shadow-orange-500/20
                "

                >

                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition"/>

                <span className="relative flex items-center justify-center gap-3">

                    {

                    loading ?

                    <>

                        <Loader2 className="w-5 h-5 animate-spin"/>

                        Recherche en cours...

                    </>

                    :

                    <>

                        <Search className="w-5 h-5"/>

                        Voir l'avancement de ma commande

                    </>

                    }

                </span>

                </motion.button>

                {/* MESSAGE */}

                {error && (

                <motion.div

                    initial={{opacity:0,y:10}}
                    animate={{opacity:1,y:0}}

                    className="
                    rounded-2xl
                    border
                    border-red-500/20
                    bg-red-500/10
                    px-4
                    py-4
                    flex
                    items-center
                    gap-3
                    "

                >

                    <AlertCircle className="w-5 h-5 text-red-400"/>

                    <span className="text-sm text-red-200 font-medium">

                    {error}

                    </span>

                </motion.div>

                )}

            </form>
            </motion.div>
        </motion.div>

        {/* ===============================
            ORDER RESULT
        ================================ */}

        {
        showResult && order && (

        <motion.div

        initial={{
        opacity:0,
        y:40,
        scale:0.96
        }}

        animate={{
        opacity:1,
        y:0,
        scale:1
        }}

        transition={{
        duration:.5
        }}

        className="
        mt-8
        w-full
        max-w-3xl
        mx-auto
        bg-white/10
        backdrop-blur-xl
        border
        border-white/10
        rounded-3xl
        p-5
        shadow-2xl
        "

        >


        {/* HEADER */}

        <div
        className="
        flex
        flex-col
        md:flex-row
        md:justify-between
        md:items-center
        gap-4
        mb-6
        "
        >


        <div>

        <p className="
        text-[10px]
        uppercase
        font-black
        text-slate-400
        ">
        Commande trouvée
        </p>


        <h2 className="
        text-xl
        font-black
        text-white
        ">
        {order.orderNumber}
        </h2>



        {
        order.trackingNumber && (

        <p className="
        mt-1
        text-xs
        font-bold
        text-amber-400
        ">
        Suivi : {order.trackingNumber}
        </p>

        )

        }


        </div>





        <div className="
        px-4
        py-3
        rounded-2xl
        bg-amber-500/10
        border
        border-amber-500/30
        ">


        <p className="
        text-[10px]
        uppercase
        font-bold
        text-slate-400
        ">
        Statut général
        </p>


        <p className="
        text-sm
        font-black
        text-amber-400
        ">
        {order.status}
        </p>


        </div>


        </div>





        {/* CLIENT */}

        <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-3
        mb-8
        ">


        <div className="
        bg-slate-900/50
        rounded-2xl
        p-4
        ">

        <p className="
        text-[10px]
        uppercase
        text-slate-400
        ">
        Client
        </p>


        <p className="
        text-sm
        font-black
        text-white
        ">
        {order.customerName}
        </p>

        </div>





        <div className="
        bg-slate-900/50
        rounded-2xl
        p-4
        ">

        <p className="
        text-[10px]
        uppercase
        text-slate-400
        ">
        Avance
        </p>


        <p className="
        text-sm
        font-black
        text-emerald-400
        ">
        {(order.advancePayment || 0)
        .toLocaleString("fr-FR")} Ar
        </p>


        </div>





        <div className="
        bg-slate-900/50
        rounded-2xl
        p-4
        ">

        <p className="
        text-[10px]
        uppercase
        text-slate-400
        ">
        Reste
        </p>


        <p className="
        text-sm
        font-black
        text-rose-400
        ">
        {(order.remainingAmount || 0)
        .toLocaleString("fr-FR")} Ar
        </p>


        </div>


        </div>







        {/* PRODUITS */}

        <h3 className="
        text-xs
        uppercase
        font-black
        text-amber-400
        mb-4
        ">
        Ouvrages commandés
        </h3>



        <div className="
        space-y-4
        ">


        {
        order.products?.map(
        (item:any,index:number)=>{


        const progress =
        item.fabricationProgress ??
        getStatusProgress(order.status);


        const fabricationStatus =
        item.fabricationStatus ??
        order.status;



        return (


        <motion.div

        key={index}

        whileHover={{
        scale:1.01
        }}

        className="
        bg-slate-900/60
        rounded-2xl
        border
        border-slate-700
        p-5
        "

        >


        {/* PRODUIT */}

        <div className="
        flex
        justify-between
        gap-3
        ">


        <div>

        <h4 className="
        text-sm
        font-black
        text-white
        ">
        {item.productName}
        </h4>


        <p className="
        text-xs
        text-slate-400
        mt-1
        ">
        Quantité :
        {" "}
        {item.quantity}
        {" "}
        {item.unit}
        </p>


        </div>



        <p className="
        text-sm
        font-black
        text-amber-400
        ">
        {(item.totalPrice || 0)
        .toLocaleString("fr-FR")} Ar
        </p>


        </div>







        {/* OPTIONS */}

        {
        item.selectedOptions?.length > 0 && (

        <div className="
        mt-4
        p-3
        rounded-xl
        bg-amber-500/10
        border
        border-amber-500/20
        ">


        <p className="
        text-[10px]
        uppercase
        font-black
        text-amber-400
        mb-2
        ">
        Options
        </p>



        {
        item.selectedOptions.map(
        (option:any)=>(


        <p
        key={option.id}
        className="
        text-xs
        text-slate-200
        "
        >
        • {option.name}
        {" "}
        (+{(option.price || 0)
        .toLocaleString("fr-FR")} Ar)
        </p>


        )

        )

        }


        </div>

        )

        }







        {/* FABRICATION */}

        <div className="
        mt-5
        ">


        <div className="
        flex
        justify-between
        mb-2
        ">


        <span className="
        text-[10px]
        uppercase
        font-black
        text-slate-400
        ">
        Fabrication
        </span>


        <span className="
        text-xs
        font-black
        text-amber-400
        ">
        {progress}%
        </span>


        </div>




        <div className="
        h-3
        rounded-full
        bg-slate-700
        overflow-hidden
        ">


        <motion.div

        initial={{
        width:0
        }}

        animate={{
        width:`${progress}%`
        }}

        transition={{
        duration:1
        }}

        className="
        h-full
        bg-gradient-to-r
        from-amber-400
        to-orange-500
        "

        />


        </div>




        <p className="
        mt-2
        text-xs
        font-bold
        text-slate-300
        ">

        Statut :

        <span className="
        text-amber-400
        ml-1
        ">
        {fabricationStatus}
        </span>


        </p>


        </div>





        </motion.div>


        )

        }

        )

        }


        </div>






        {/* RESET */}

        <button

        onClick={()=>{

        setOrder(null);
        setShowResult(false);
        setSearched(false);

        }}

        className="
        mt-6
        px-5
        py-2
        rounded-xl
        bg-slate-800
        text-white
        text-xs
        font-black
        hover:bg-slate-700
        transition
        "

        >
        Nouvelle recherche
        </button>



        </motion.div>

        )

        }

        {/* =============================== LIVRAISON + SUPPORT + FOOTER ============================== */}

        <div className="mt-10 w-full max-w-3xl mx-auto">

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Livraison */}
            <motion.div
            whileHover={{ y: -4 }}
            className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-emerald-500/20
            bg-gradient-to-br
            from-emerald-500/10
            to-emerald-700/5
            backdrop-blur-xl
            p-6
            shadow-xl
            "
            >

            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative">

                <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-emerald-400" />
                </div>

                <div>

                    <p className="text-[11px] uppercase tracking-widest font-black text-emerald-300">
                    Livraison prévue
                    </p>

                    <p className="mt-1 text-xl font-black text-white">
                    {order?.estimatedDelivery
                        ? new Date(order.estimatedDelivery).toLocaleDateString("fr-FR")
                        : "Date en préparation"}
                    </p>

                </div>

                </div>

                <div className="mt-5 inline-flex px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] uppercase font-black text-emerald-300">
                Livraison sécurisée
                </div>

            </div>

            </motion.div>

            {/* Support */}
            <motion.div
            whileHover={{ y: -4 }}
            className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-sky-500/20
            bg-gradient-to-br
            from-sky-500/10
            to-slate-900/20
            backdrop-blur-xl
            p-6
            shadow-xl
            "
            >

            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative">

                <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-sky-400" />
                </div>

                <div>

                    <p className="text-[11px] uppercase tracking-widest font-black text-sky-300">
                    Support Client
                    </p>

                    <p className="mt-1 text-white font-semibold">
                    Notre équipe reste disponible.
                    </p>

                </div>

                </div>

                <a
                href={`https://wa.me/${order?.customerPhone ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-2xl
                px-5
                py-3
                bg-green-500
                hover:bg-green-400
                transition-all
                text-white
                font-black
                text-sm
                shadow-lg
                "
                >

                <Phone className="w-5 h-5"/>

                Contacter sur WhatsApp

                </a>

            </div>

            </motion.div>

        </div>

        {/* Footer */}
        <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900/60 backdrop-blur-xl p-8 text-center">

            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">

            <ShieldCheck className="w-10 h-10 text-slate-950"/>

            </div>

            <h3 className="mt-5 text-xl font-black text-white">
            Merci pour votre confiance
            </h3>

            <p className="mt-3 text-slate-400 leading-7 max-w-2xl mx-auto">
            Votre commande est suivie en temps réel par notre atelier.
            Nous mettons tout en œuvre afin de vous garantir une fabrication
            de qualité, un respect des délais et une finition professionnelle.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

            <div className="px-5 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-black uppercase flex items-center gap-2">
                <Award className="w-4 h-4"/>
                Qualité Premium
            </div>

            <div className="px-5 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4"/>
                Garantie 1 an
            </div>

            <div className="px-5 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-black uppercase flex items-center gap-2">
                <Clock3 className="w-4 h-4"/>
                Suivi en temps réel
            </div>

            </div>

        </div>

        </div>

    </div>
  );
};


export default OrderTracking;