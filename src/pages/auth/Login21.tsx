import React, { useEffect, useState } from "react";
import {
  Wrench,
  ArrowLeft,
  MessageCircle,
  Cpu,
  Cog,
  Hammer,
} from "lucide-react";

import { Link } from "react-router-dom";
import logo1 from "../../img/logo1.png";

interface Props {
  mode?: "client" | "tracking";
}

const EspaceConstruction: React.FC<Props> = ({
    mode = "client",
        }) => {

    const config =
        mode === "client"
        ? {
            title: "ACCES ERP",
            subtitle:
                "Cette fonctionnalité est actuellement en cours de développement.",
            description:
                "Nos ingénieurs travaillent activement afin de vous proposer un espace client moderne, sécurisé et simple d'utilisation.",
            progress: 90,
            }
        : {
            title: "SUIVI DE COMMANDE",
            subtitle:
                "Le système intelligent de suivi est en cours de développement.",
            description:
                "Vous pourrez bientôt suivre vos commandes en temps réel, consulter leur avancement et recevoir les notifications automatiquement.",
            progress: 90,
            };

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((old) => {
                if (old >= config.progress) return config.progress;
                return old + 1;
            });
        }, 20);

        return () => clearInterval(timer);

    }, [config.progress]);

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,.10),transparent_40%)]" />

            <div className="absolute top-20 left-10 w-80 h-80 rounded-full bg-amber-500/10 blur-[120px]" />

            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-500/10 blur-[150px]" />

            <div className="relative z-10 flex items-center justify-center min-h-screen px-5 py-10">

                <div className="w-full max-w-screen-2xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/75 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,.5)]">

                    <div className="grid lg:grid-cols-2">

                                {/* LEFT */}
                                <div className="p-8 lg:p-10 flex flex-col justify-center">

                                <div className="flex items-center gap-5">

                                    {/* Logo animé */}
                                    <div className="relative">

                                    <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />

                                    {/* cercle tournant */}
                                    <div
                                        className="absolute -inset-4 animate-spin"
                                        style={{ animationDuration: "8s" }}
                                    >
                                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_15px_#fbbf24]" />

                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_15px_#fde047]" />

                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_15px_#fb923c]" />

                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b]" />
                                    </div>

                                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 overflow-hidden">

                                        <img
                                        src={logo1}
                                        alt="logo"
                                        className="w-16 h-16 object-contain"
                                        />

                                    </div>

                                    </div>

                                    <div>

                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest">
                                        <Hammer className="w-4 h-4" />
                                        Développement
                                    </span>

                                    <h1 className="mt-4 text-3xl md:text-5xl font-black leading-tight">
                                        {config.title}
                                    </h1>

                                    <p className="mt-3 text-slate-400 text-base">
                                        ÉTOILE ALU MADA
                                    </p>

                                    </div>

                                </div>

                                <div className="mt-10 space-y-6">

                                    <h2 className="text-2xl md:text-4xl font-black leading-tight">
                                    Cette fonctionnalité
                                    <span className="text-amber-400">
                                        {" "}
                                        arrive bientôt.
                                    </span>
                                    </h2>

                                    <p className="text-slate-300 leading-8 text-base">
                                    {config.subtitle}
                                    </p>

                                    <p className="text-slate-400 leading-7">
                                    {config.description}
                                    </p>

                                </div>

                                {/* Progress */}
                                <div className="mt-10">

                                    <div className="flex justify-between mb-3 text-sm">

                                    <span className="font-bold text-slate-300">
                                        Progression
                                    </span>

                                    <span className="font-black text-amber-400">
                                        {progress}%
                                    </span>

                                    </div>

                                    <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden">

                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                                        style={{
                                        width: `${progress}%`,
                                        }}
                                    />

                                    </div>

                                </div>

                                {/* Infos */}
                                <div className="mt-10 grid grid-cols-2 gap-4">

                                    <div className="rounded-2xl bg-slate-800/70 border border-white/10 p-5">

                                    <Cog
                                        className="w-7 h-7 text-amber-400 animate-spin"
                                        style={{
                                        animationDuration: "6s",
                                        }}
                                    />

                                    <p className="mt-3 font-bold">
                                        Développement actif
                                    </p>

                                    <p className="text-sm text-slate-400 mt-2">
                                        Nos développeurs travaillent quotidiennement sur cette nouvelle fonctionnalité.
                                    </p>

                                    </div>

                                    <div className="rounded-2xl bg-slate-800/70 border border-white/10 p-5">

                                    <Cpu className="w-7 h-7 text-sky-400" />

                                    <p className="mt-3 font-bold">
                                        Estimation
                                    </p>

                                    <p className="text-sm text-slate-400 mt-2">
                                        Disponible très prochainement après les derniers tests.
                                    </p>

                                    </div>

                                </div>
                                </div>

                                {/* RIGHT */}
                                <div className="relative flex items-center justify-center p-8 lg:p-10">

                                {/* Glow */}
                                <div className="absolute w-96 h-96 rounded-full bg-amber-500/10 blur-[140px]" />

                                    <div className="relative w-full max-w-md">

                                        <div className="rounded-[30px] border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-8 shadow-2xl">

                                        {/* Animation */}
                                        <div className="relative flex justify-center mb-8">

                                            {/* Cercle extérieur */}
                                            <div
                                            className="absolute w-44 h-44 rounded-full border border-amber-500/20 animate-spin"
                                            style={{ animationDuration: "15s" }}
                                            />

                                            {/* Cercle intérieur */}
                                            <div
                                            className="absolute w-32 h-32 rounded-full border border-blue-500/20 animate-spin"
                                            style={{
                                                animationDuration: "10s",
                                                animationDirection: "reverse",
                                            }}
                                            />

                                        {/* Technicien */}
                                        <div className="relative z-10 w-36 h-36 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl">

                                        <span className="text-7xl animate-bounce">
                                            👨‍💻
                                        </span>
                                        </div>

                                        {/* Roue dentée */}
                                        <Cog
                                            className="absolute -right-2 top-4 w-10 h-10 text-amber-400 animate-spin"
                                            style={{ animationDuration: "5s" }}
                                        />

                                        <Cog
                                            className="absolute left-0 bottom-5 w-7 h-7 text-blue-400 animate-spin"
                                            style={{
                                                animationDuration: "3s",
                                                animationDirection: "reverse",
                                            }}
                                        />

                                        </div> {/* Fermeture Animation */}

                                        <h3 className="text-center text-2xl font-black">
                                            Développement en cours
                                        </h3>
                                        <p className="mt-5 text-center text-slate-400 leading-8">
                                        Notre équipe technique travaille actuellement sur cette
                                        nouvelle fonctionnalité afin d'offrir une expérience plus
                                        moderne, plus rapide et plus sécurisée.
                                        </p>

                                        {/* Etat */}
                                        <div className="mt-8 space-y-4">

                                            <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 border border-white/10 px-5 py-4">

                                                <span className="text-slate-300">
                                                    État du développement
                                                </span>

                                                <span className="font-black text-amber-400">
                                                    {progress}%
                                                </span>

                                            </div>


                                            <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 border border-white/10 px-5 py-4">

                                                <span className="text-slate-300">
                                                    Livraison estimée
                                                </span>

                                                <span className="font-bold text-green-400">
                                                    Très bientôt
                                                </span>

                                            </div>

                                        </div>


                                        {/* Boutons */}
                                        <div className="mt-10 grid grid-cols-2 gap-4">

                                            <Link
                                                to="/"
                                                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 py-4 font-bold transition-all"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                                Retour
                                            </Link>


                                            <a
                                                href="https://wa.me/261330000000"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 font-black transition-all"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                WhatsApp
                                            </a>

                                        </div>


                                    </div> {/* fermeture card rounded-[30px] */}

                                    </div> {/* fermeture max-w-md */}

                                    </div> {/* fermeture RIGHT */}

                    </div> {/* fermeture grid lg:grid-cols-2 */}

                            {/* Footer */}
                            <div className="border-t border-white/10 py-5 px-8 text-center">
                                <p className="text-xs text-slate-500">
                                © {new Date().getFullYear()} ÉTOILE ALU ERP • Fonctionnalité en cours de développement.
                                </p>
                            </div>

                            

                        
                </div> {/* fermeture max-w-screen-2xl */}

            </div> {/* fermeture relative z-10 */}
        </div>

    );
};

export default EspaceConstruction;