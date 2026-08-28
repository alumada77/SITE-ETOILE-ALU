import { useEffect, useState } from "react";

export default function MailList({
  folder,
  onSelectMail,
}: {
  folder: string;
  onSelectMail: (mail: any) => void;
}) {

  const [mails, setMails] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMails();
    }, [folder]);

    const loadMails = async () => {
    const data = await getGmailMessages(folder);
    setMails(data);
  };

  const filtered = mails.filter((mail) =>
    `${mail.subject} ${mail.from?.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="w-[380px] shrink-0 border-r border-slate-200 dark:border-slate-800">

      <div className="p-4 border-b">

        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un mail..."
            className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>

      </div>

      <div className="overflow-y-auto h-full">

        {filtered.length === 0 ? (

          <div className="p-10 text-center text-slate-400">
            Aucun message
          </div>

        ) : (

          filtered.map((mail) => (
            <button
              key={mail.id}
              onClick={() => onSelectMail(mail)}
              className="w-full text-left p-4 border-b hover:bg-slate-50"
            >
              <div className="flex justify-between">
                <strong>{mail.from?.name || mail.from?.email}</strong>
                <span className="text-xs text-slate-400">
                  {mail.date}
                </span>
              </div>

              <div className="font-semibold mt-1">
                {mail.subject}
              </div>

              <div className="text-sm text-slate-500 truncate">
                {mail.preview}
              </div>
            </button>
          ))

        )}

      </div>

    </section>
  );
}