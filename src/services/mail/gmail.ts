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
  subject: string;
  body: string;
  preview?: string;
  date: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  folder: MailFolder;
  attachments?: MailAttachment[];
  provider: "gmail";
}

const GMAIL_ACCOUNT = "etoile.alu.mada@gmail.com";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

export function getGmailAccount(): string {
  return GMAIL_ACCOUNT;
}

export function getGmailLabel(folder: MailFolder): string {
  const labels: Record<MailFolder, string> = {
    inbox: "INBOX",
    sent: "SENT",
    drafts: "DRAFT",
    spam: "SPAM",
    trash: "TRASH",
    starred: "STARRED",
    important: "IMPORTANT",
  };

  return labels[folder];
}

function getHeaders(headers: any[] = []) {
  return headers.reduce<Record<string, string>>((result, item) => {
    if (item.name) {
      result[item.name.toLowerCase()] = item.value || "";
    }

    return result;
  }, {});
}

function decodeBase64(data?: string): string {
  if (!data) return "";

  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");

  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(
          atob(base64),
          (char: string) =>
            "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2),
        )
        .join(""),
    );
  } catch {
    try {
      return atob(base64);
    } catch {
      return "";
    }
  }
}

function getBody(payload: any): string {
  if (!payload) return "";

  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  const parts = payload.parts || [];

  const html = parts.find(
    (part: any) =>
      part.mimeType === "text/html" && part.body?.data,
  );

  if (html) {
    return decodeBase64(html.body.data);
  }

  const text = parts.find(
    (part: any) =>
      part.mimeType === "text/plain" && part.body?.data,
  );

  if (text) {
    return decodeBase64(text.body.data);
  }

  for (const part of parts) {
    const nested = getBody(part);

    if (nested) {
      return nested;
    }
  }

  return "";
}

function parseEmail(value: string) {
  const match = value.match(/^(.*?)\s*<([^>]+)>$/);

  if (match) {
    return {
      name: match[1].replace(/^["']|["']$/g, "").trim(),
      email: match[2].trim(),
    };
  }

  return {
    name: value,
    email: value,
  };
}

function getFolderFromLabels(
  labels: string[] = [],
): MailFolder {
  if (labels.includes("SENT")) return "sent";
  if (labels.includes("DRAFT")) return "drafts";
  if (labels.includes("SPAM")) return "spam";
  if (labels.includes("TRASH")) return "trash";
  if (labels.includes("STARRED")) return "starred";
  if (labels.includes("IMPORTANT")) return "important";

  return "inbox";
}

async function gmailRequest<T>(
  accessToken: string,
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${GMAIL_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gmail API ${response.status}: ${errorText}`,
    );
  }

  return response.json();
}

export async function getGmailMessages(
  accessToken: string,
  folder: MailFolder = "inbox",
): Promise<MailMessage[]> {
  const labelId = getGmailLabel(folder);

  const data = await gmailRequest<{
    messages?: { id: string; threadId?: string }[];
  }>(
    accessToken,
    `/messages?labelIds=${encodeURIComponent(
      labelId,
    )}&maxResults=50`,
  );

  const messages = data.messages || [];

  const result: MailMessage[] = [];

  for (const message of messages) {
    if (!message.id) continue;

    const detail = await gmailRequest<any>(
      accessToken,
      `/messages/${message.id}?format=full`,
    );

    const headers = getHeaders(
      detail.payload?.headers || [],
    );

    const from = parseEmail(headers.from || "");
    const to = parseEmail(headers.to || "");

    result.push({
      id: detail.id,
      threadId: detail.threadId,

      from,

      to: to.email
        ? [to]
        : [],

      subject:
        headers.subject || "(Sans objet)",

      body: getBody(detail.payload),

      preview: detail.snippet || "",

      date: headers.date || "",

      read: !detail.labelIds?.includes("UNREAD"),

      starred:
        detail.labelIds?.includes("STARRED") || false,

      important:
        detail.labelIds?.includes("IMPORTANT") || false,

      folder: getFolderFromLabels(
        detail.labelIds || [],
      ),

      provider: "gmail",
    });
  }

  return result;
}

export async function getGmailMessage(
  accessToken: string,
  messageId: string,
): Promise<MailMessage> {
  const detail = await gmailRequest<any>(
    accessToken,
    `/messages/${messageId}?format=full`,
  );

  const headers = getHeaders(
    detail.payload?.headers || [],
  );

  const from = parseEmail(headers.from || "");
  const to = parseEmail(headers.to || "");

  return {
    id: detail.id,

    threadId: detail.threadId,

    from,

    to: to.email ? [to] : [],

    subject:
      headers.subject || "(Sans objet)",

    body: getBody(detail.payload),

    preview: detail.snippet || "",

    date: headers.date || "",

    read: !detail.labelIds?.includes("UNREAD"),

    starred:
      detail.labelIds?.includes("STARRED") || false,

    important:
      detail.labelIds?.includes("IMPORTANT") || false,

    folder: getFolderFromLabels(
      detail.labelIds || [],
    ),

    provider: "gmail",
  };
}

export async function markGmailAsRead(
  accessToken: string,
  messageId: string,
) {
  await gmailRequest(
    accessToken,
    `/messages/${messageId}/modify`,
    {
      method: "POST",
      body: JSON.stringify({
        removeLabelIds: ["UNREAD"],
      }),
    },
  );

  return { success: true };
}

export async function starGmailMessage(
  accessToken: string,
  messageId: string,
  starred: boolean,
) {
  await gmailRequest(
    accessToken,
    `/messages/${messageId}/modify`,
    {
      method: "POST",
      body: JSON.stringify(
        starred
          ? {
              addLabelIds: ["STARRED"],
            }
          : {
              removeLabelIds: ["STARRED"],
            },
      ),
    },
  );

  return { success: true };
}

export async function deleteGmailMessage(
  accessToken: string,
  messageId: string,
) {
  await gmailRequest(
    accessToken,
    `/messages/${messageId}/trash`,
    {
      method: "POST",
    },
  );

  return { success: true };
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
) {
  const rawMessage = [
    `From: ${GMAIL_ACCOUNT}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ].join("\r\n");

  const encodedMessage = btoa(
    unescape(
      encodeURIComponent(rawMessage),
    ),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await gmailRequest<any>(
    accessToken,
    "/messages/send",
    {
      method: "POST",
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    },
  );

  return {
    success: true,
    id: result.id,
    threadId: result.threadId,
  };
}