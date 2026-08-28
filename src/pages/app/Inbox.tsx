import { useState } from "react";
import InboxSidebar from "../../components/inbox/InboxSidebar";
import MailList from "../../components/inbox/MailList";
import MailViewer from "../../components/inbox/MailViewer";
import ComposeMail from "../../components/inbox/ComposeMail";

export default function Inbox() {
  const [folder, setFolder] = useState("inbox");
  const [selectedMail, setSelectedMail] = useState<any>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <div className="h-[calc(100vh-80px)] flex bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden">

      <InboxSidebar
        folder={folder}
        setFolder={setFolder}
        onCompose={() => setComposeOpen(true)}
      />

      <MailList
        folder={folder}
        onSelectMail={setSelectedMail}
      />

      {selectedMail && (
        <MailViewer
          mail={selectedMail}
          onClose={() => setSelectedMail(null)}
        />
      )}

      {composeOpen && (
        <ComposeMail
          onClose={() => setComposeOpen(false)}
        />
      )}

    </div>
  );
}