export default function MailViewer({
  mail,
  onClose,
}: {
  mail: any;
  onClose: () => void;
}) {

  return (
    <section className="flex-1 flex flex-col bg-white dark:bg-slate-900">

      <header className="p-4 border-b flex items-center gap-3">

        <button
          onClick={onClose}
          className="px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          ←
        </button>

        <button className="px-3 py-2 rounded-lg hover:bg-slate-100">
          ⭐
        </button>

        <button className="px-3 py-2 rounded-lg hover:bg-slate-100">
          🗑️
        </button>

      </header>

      <article className="p-8 overflow-y-auto">

        <h1 className="text-2xl font-black">
          {mail.subject}
        </h1>

        <div className="mt-6 flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
            {(mail.from?.name || "M")[0]}
          </div>

          <div>
            <div className="font-bold">
              {mail.from?.name}
            </div>

            <div className="text-sm text-slate-500">
              {mail.from?.email}
            </div>
          </div>

        </div>

        <div
          className="mt-8 prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: mail.body,
          }}
        />

      </article>

      <footer className="p-4 border-t flex gap-3">

        <button className="px-5 py-3 rounded-xl bg-slate-100 font-bold">
          ↩ Répondre
        </button>

        <button className="px-5 py-3 rounded-xl bg-slate-100 font-bold">
          ↪ Transférer
        </button>

      </footer>

    </section>
  );
}