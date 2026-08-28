import { useState } from "react";

export default function ComposeMail({
  onClose,
}: {
  onClose: () => void;
}) {

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = async () => {

    if (!to || !subject) {
      alert("Veuillez remplir le destinataire et l'objet.");
      return;
    }

    // Gmail / Outlook API viendra ici

    alert("Message envoyé");

    onClose();
  };

  return (
    <div className="fixed bottom-6 right-6 w-[600px] bg-white rounded-2xl shadow-2xl border overflow-hidden">

      <header className="px-5 py-4 bg-slate-900 text-white flex justify-between">

        <strong>Nouveau message</strong>

        <button onClick={onClose}>
          ✕
        </button>

      </header>

      <div className="p-5 space-y-3">

        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="À"
          className="w-full border-b p-3 outline-none"
        />

        <input
          placeholder="Cc"
          className="w-full border-b p-3 outline-none"
        />

        <input
          placeholder="Cci"
          className="w-full border-b p-3 outline-none"
        />

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Objet"
          className="w-full border-b p-3 outline-none"
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Votre message..."
          rows={12}
          className="w-full p-3 outline-none resize-none"
        />

      </div>

      <footer className="p-4 border-t flex justify-between">

        <button className="text-slate-500">
          📎 Pièce jointe
        </button>

        <button
          onClick={handleSend}
          className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold"
        >
          Envoyer
        </button>

      </footer>

    </div>
  );
}