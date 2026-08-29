
import { useEffect, useState } from "react";

import {
  getGmailAccount,
  getGmailMessages,
} from "../../services/mail/gmail";

import {
  getGoogleAccessToken,
  getStoredGoogleAccessToken,
  isGmailConnected,
  disconnectGmail,
} from "../../services/mail/googleAuth";

export default function MailList({
  folder,
  onSelectMail,
}: {
  folder: string;
  onSelectMail: (mail: any) => void;
}) {
  const [mails, setMails] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Vérifie uniquement si un token existe déjà.
   *
   * IMPORTANT:
   * Tsy mangataka popup eto.
   */
  useEffect(() => {
    setConnected(isGmailConnected());
  }, []);

  /*
   * Connexion Gmail.
   *
   * IMPORTANT:
   * Antsoina amin'ny CLICK utilisateur ihany.
   */
  const connectGmail = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getGoogleAccessToken();

      if (!token) {
        throw new Error(
          "Google tsy namerina access token.",
        );
      }

      setConnected(true);

      await loadMails(token);
    } catch (error) {
      console.error(
        "Erreur connexion Gmail:",
        error,
      );

      setConnected(false);

      setError(
        "Impossible de connecter Gmail. Vérifiez l'autorisation Google.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Charge les messages Gmail.
   */
  const loadMails = async (
    token?: string,
  ) => {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        token ||
        getStoredGoogleAccessToken();

      if (!accessToken) {
        setMails([]);
        setConnected(false);
        return;
      }

      const data = await getGmailMessages(
        accessToken,
        folder as any,
      );

      setMails(data);
      setConnected(true);
    } catch (error) {
      console.error(
        "Erreur chargement Gmail:",
        error,
      );

      setMails([]);

      setError(
        "Impossible de charger les messages Gmail.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Recharger automatiquement les mails
   * lorsqu'on change de dossier.
   *
   * Tsy misy OAuth popup eto.
   */
  useEffect(() => {
    if (!connected) {
      return;
    }

    const token =
      getStoredGoogleAccessToken();

    if (!token) {
      setConnected(false);
      setMails([]);
      return;
    }

    loadMails(token);
  }, [folder, connected]);

  /*
   * Déconnexion Gmail.
   */
  const handleDisconnect = () => {
    disconnectGmail();

    setConnected(false);
    setMails([]);
    setError("");
  };

  /*
   * Recherche.
   */
  const filtered = mails.filter(
    (mail) =>
      `${mail.subject || ""} ${
        mail.from?.email || ""
      } ${mail.from?.name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <section className="w-[380px] shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-950">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="p-4 border-b border-slate-200 dark:border-slate-800">

        <div className="flex items-center justify-between gap-3 mb-4">

          <div className="min-w-0">

            <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
              Compte Gmail
            </p>

            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {getGmailAccount()}
            </p>

          </div>

          {connected ? (

            <span className="shrink-0 flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-950/40 px-2.5 py-1 text-[10px] font-bold text-green-600 dark:text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Connecté
            </span>

          ) : (

            <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-slate-400">
              Non connecté
            </span>

          )}

        </div>

        {/* ===================================================
            CONNECT / ACTIONS
        ==================================================== */}

        {!connected ? (

          <button
            type="button"
            onClick={connectGmail}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-3 text-sm font-black text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Connexion à Gmail..."
              : "Connecter Gmail"}
          </button>

        ) : (

          <div className="flex gap-2">

            <button
              type="button"
              onClick={() =>
                loadMails()
              }
              disabled={loading}
              className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading
                ? "Chargement..."
                : "Actualiser"}
            </button>

            <button
              type="button"
              onClick={handleDisconnect}
              className="rounded-xl bg-red-50 dark:bg-red-950/30 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition"
            >
              Déconnecter
            </button>

          </div>

        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 px-3 py-2.5">

            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>

          </div>

        )}

        {/* ===================================================
            SEARCH
        ==================================================== */}

        <div className="relative mt-4">

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher un mail..."
            className="w-full rounded-xl bg-slate-100 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
          />

        </div>

      </div>

      {/* =====================================================
          MAIL LIST
      ====================================================== */}

      <div className="overflow-y-auto flex-1">

        {!connected ? (

          <div className="p-10 text-center">

            <div className="text-4xl mb-4">
              ✉️
            </div>

            <p className="font-bold text-slate-700 dark:text-slate-200">
              Gmail non connecté
            </p>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Connectez le compte Gmail
              pour afficher les messages
              dans votre boîte de réception.
            </p>

          </div>

        ) : loading &&
          mails.length === 0 ? (

          <div className="p-10 text-center">

            <div className="animate-pulse text-sm font-semibold text-slate-400">
              Chargement des messages Gmail...
            </div>

          </div>

        ) : filtered.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-3xl mb-3">
              📭
            </div>

            <p className="font-semibold text-slate-500">
              Aucun message
            </p>

            {search && (
              <p className="mt-1 text-xs text-slate-400">
                Aucun résultat pour cette recherche.
              </p>
            )}

          </div>

        ) : (

          filtered.map((mail) => (

            <button
              key={mail.id}
              type="button"
              onClick={() =>
                onSelectMail(mail)
              }
              className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-900 ${
                mail.unread
                  ? "bg-blue-50/40 dark:bg-blue-950/20"
                  : ""
              }`}
            >

              {/* FROM + DATE */}

              <div className="flex justify-between items-start gap-3">

                <strong
                  className={`truncate text-sm ${
                    mail.unread
                      ? "font-black text-slate-900 dark:text-white"
                      : "font-semibold text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {mail.from?.name ||
                    mail.from?.email ||
                    "Expéditeur inconnu"}
                </strong>

                <span className="shrink-0 text-[10px] text-slate-400">
                  {mail.date}
                </span>

              </div>

              {/* SUBJECT */}

              <div
                className={`mt-1 truncate text-sm ${
                  mail.unread
                    ? "font-black text-slate-900 dark:text-white"
                    : "font-semibold text-slate-700 dark:text-slate-300"
                }`}
              >
                {mail.subject ||
                  "(Sans objet)"}
              </div>

              {/* PREVIEW */}

              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                {mail.preview || ""}
              </div>

              {/* STATUS */}

              <div className="mt-2 flex items-center gap-2">

                {mail.unread && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black text-white">
                    NON LU
                  </span>
                )}

                {mail.starred && (
                  <span className="text-xs">
                    ⭐
                  </span>
                )}

              </div>

            </button>

          ))

        )}

      </div>

    </section>
  );
}

