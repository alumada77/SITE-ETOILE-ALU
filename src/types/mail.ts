export type MailFolder =
  | "inbox"
  | "sent"
  | "drafts"
  | "spam"
  | "trash"
  | "starred"
  | "important";

export interface MailAttachment {
  id?: string;
  name: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface MailMessage {
  id: string;
  threadId?: string;

  from: {
    name?: string;
    email: string;
  };

  to: {
    name?: string;
    email: string;
  }[];

  cc?: {
    name?: string;
    email: string;
  }[];

  bcc?: {
    name?: string;
    email: string;
  }[];

  subject: string;
  body: string;
  preview?: string;

  date: string;

  read: boolean;
  starred: boolean;
  important: boolean;

  folder: MailFolder;

  attachments?: MailAttachment[];

  provider: "gmail" | "outlook";
}