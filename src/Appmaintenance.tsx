import React, { useEffect, useState } from "react";
import {
  Wrench,
  Clock3,
  RefreshCcw,
  Globe,
  Mail,
} from "lucide-react";

import logo1 from "./img/logo1.png";

const TARGET_DATE = new Date("2026-07-28T15:00:00");

const AppMaintenance = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {

    const updateCountdown = () => {

        const now = new Date().getTime();
        const distance = TARGET_DATE.getTime() - now;

        if (distance <= 0) {

        setTimeLeft({
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00",
        });

        return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));

        const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
        );

        const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) /
        (1000 * 60)
        );

        const seconds = Math.floor(
        (distance % (1000 * 60)) /
        1000
        );

        setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        });

    };

    // Mise à jour immédiate
    updateCountdown();

    // Puis chaque seconde
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);

    }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,.10),transparent_35%)]" />

      <div className="absolute top-24 left-20 w-80 h-80 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-blue-500/10 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-2 py-4 md:py-4">

        <div className="w-full max-w-4xl xl:max-w-[1050px] rounded-[30px] border border-white/10 bg-slate-900/75 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,.40)] overflow-hidden">

          <div className="grid lg:grid-cols-2">

            {/* LEFT */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
                              <div className="flex items-center gap-4">

                <div className="relative flex items-center justify-center">

                {/* Particules lumineuses */}
                <div
                    className="absolute w-32 h-32 animate-spin"
                    style={{ animationDuration: "8s" }}
                >
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_15px_#fbbf24]" />

                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_15px_#facc15]" />

                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_15px_#fb923c]" />

                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b]" />
                </div>

                {/* Anneau extérieur */}
                <div className="absolute w-28 h-28 rounded-full border-2 border-transparent border-t-amber-400 border-r-yellow-300 animate-spin"></div>

                {/* Halo lumineux */}
                <div className="absolute w-24 h-24 rounded-full bg-amber-500/20 blur-2xl animate-pulse"></div>

                {/* Logo */}
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/50 flex items-center justify-center overflow-hidden">
                    <img
                    src={logo1}
                    alt="Étoile Alu"
                    className="w-11 h-11 object-contain"
                    />
                </div>

                </div>

                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest">
                    <Wrench className="w-3.5 h-3.5" />
                    Maintenance
                  </span>

                  <h1 className="mt-2 text-2xl md:text-4xl font-black">
                    ÉTOILE ALU MADA
                  </h1>

                  <p className="text-slate-400 mt-2 text-sm md:text-base">
                    Plateforme Professionnelle de votre commande
                  </p>
                </div>

              </div>

              <div className="mt-10 space-y-5">

                <h2 className="text-xl md:text-3xl font-black">
                  Nous améliorons actuellement
                  <span className="text-amber-400"> notre site.</span>
                </h2>

                <p className="text-slate-300 leading-8 text-sm md:text-lg">
                  Notre équipe effectue actuellement une maintenance afin
                  d'améliorer les performances, la sécurité et
                  d'ajouter de nouvelles fonctionnalités.
                  <br />
                  Le service sera de nouveau disponible très prochainement.
                </p>

              </div>

              {/* Chronomètre */}

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">

                {[
                  {
                    value: timeLeft.days,
                    label: "Jours",
                  },
                  {
                    value: timeLeft.hours,
                    label: "Heures",
                  },
                  {
                    value: timeLeft.minutes,
                    label: "Minutes",
                  },
                  {
                    value: timeLeft.seconds,
                    label: "Secondes",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl py-6 text-center hover:border-amber-500/40 transition-all"
                  >
                    <div className="text-3xl md:text-5xl font-black text-amber-400 font-mono">
                      {item.value}
                    </div>

                    <div className="mt-2 uppercase tracking-widest text-[11px] text-slate-400 font-bold">
                      {item.label}
                    </div>
                  </div>
                ))}

              </div>

              <div className="mt-10 flex flex-wrap gap-3">

                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <RefreshCcw className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">
                    Mise à jour en cours
                  </span>
                </div>
                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                        Retour prévu
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                        Très bientôt
                    </p>
                    </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              {/* Cercle lumineux */}
              <div className="absolute w-80 h-80 rounded-full bg-amber-500/10 blur-[120px]" />

              <div className="relative w-full max-w-md">

                <div className="rounded-[32px] border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-8 shadow-2xl">

                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/40">
                    <Wrench className="w-12 h-12 text-slate-900" />
                  </div>

                  <h3 className="mt-8 text-center text-2xl font-black">
                    Maintenance Technique
                  </h3>

                  <p className="mt-4 text-center text-slate-400 leading-7">
                    Nous installons actuellement une nouvelle version de
                    l'application afin d'offrir une meilleure expérience,
                    davantage de stabilité et de nouvelles fonctionnalités.
                  </p>

                  <div className="mt-8 space-y-4">

                    <div className="flex items-center gap-4 rounded-2xl bg-slate-800/70 p-4">
                      <Globe className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase">
                          Site Web
                        </p>
                        <p className="font-semibold">
                          https://aluminium-erp-5d0e9.web.app/
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-slate-800/70 p-4">
                      <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase">
                          Contact
                        </p>
                        <p className="font-semibold">
                          etoile.alu.mada@gmail.com
                        </p>
                      </div>
                    </div>

                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 transition-all duration-300 shadow-xl shadow-amber-500/30"
                    >
                      Actualiser la page
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div> {/* FIN GRID */}

          {/* Footer */}
          <div className="border-t border-white/10 px-8 py-5 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Étoile Alu Mada • Tous droits réservés
            </p>
          </div>
        </div> 
      </div> 
    </div> 
  );
};

export default AppMaintenance;