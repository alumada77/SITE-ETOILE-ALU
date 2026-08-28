interface Props {
  folder: string;
  setFolder: (folder: string) => void;
  onCompose: () => void;
}

export default function InboxSidebar({
  folder,
  setFolder,
  onCompose,
}: Props) {

  const folders = [
    { id: "inbox", label: "Réception", icon: "📥" },
    { id: "starred", label: "Important", icon: "⭐" },
    { id: "drafts", label: "Brouillons", icon: "📝" },
    { id: "sent", label: "Envoyés", icon: "📤" },
    { id: "spam", label: "Spam", icon: "🚫" },
    { id: "trash", label: "Corbeille", icon: "🗑️" },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 p-4">

      <button
        onClick={onCompose}
        className="w-full mb-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold py-3"
      >
        ✏️ Nouveau message
      </button>

      <div className="space-y-1">

        {folders.map((item) => (
          <button
            key={item.id}
            onClick={() => setFolder(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
              folder === item.id
                ? "bg-amber-100 text-amber-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

      </div>

    </aside>
  );
}
