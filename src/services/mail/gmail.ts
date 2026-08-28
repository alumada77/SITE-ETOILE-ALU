import {google} from "googleapis";

/**
 * Gmail API helper.
 *
 * IMPORTANT:
 * accessToken comes from the authenticated user.
 * Never put GOOGLE_CLIENT_SECRET in this file.
 */

function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();

  auth.setCredentials({
    access_token: accessToken,
  });

  return google.gmail({
    version: "v1",
    auth,
  });
}

function decodeBase64Url(data?: string): string {
  if (!data) return "";

  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf-8");
}

function getHeader(
  headers: Array<{name?: string; value?: string}> = [],
  name: string,
): string {
  const header = headers.find(
    (item) => item.name?.toLowerCase() === name.toLowerCase(),
  );

  return header?.value || "";
}

function getBody(payload: any): string {
  if (!payload) return "";

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  const parts = payload.parts || [];

  const htmlPart = parts.find(
    (part: any) =>
      part.mimeType === "text/html" && part.body?.data,
  );

  if (htmlPart) {
    return decodeBase64Url(htmlPart.body.data);
  }

  const textPart = parts.find(
    (part: any) =>
      part.mimeType === "text/plain" && part.body?.data,
  );

  if (textPart) {
    return decodeBase64Url(textPart.body.data);
  }

  for (const part of parts) {
    const nested = getBody(part);

    if (nested) return nested;
  }

  return "";
}

export async function getGmailMessages(
  accessToken: string,
  labelId = "INBOX",
) {
  const gmail = getGmailClient(accessToken);

  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: [labelId],
    maxResults: 50,
  });

  const messages = response.data.messages || [];

  const result = [];

  for (const message of messages) {
    if (!message.id) continue;

    const detail = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });

    const data = detail.data;
    const headers = data.payload?.headers || [];

    const from = getHeader(headers, "From");
    const subject = getHeader(headers, "Subject");
    const date = getHeader(headers, "Date");

    const body = getBody(data.payload);

    result.push({
      id: data.id,
      threadId: data.threadId,
      subject: subject || "(Sans objet)",
      from: {
        name: from,
        email: from,
      },
      date,
      preview: data.snippet || "",
      body,
      unread: data.labelIds?.includes("UNREAD") || false,
      starred: data.labelIds?.includes("STARRED") || false,
      labelIds: data.labelIds || [],
    });
  }

  return result;
}

export async function getGmailMessage(
  accessToken: string,
  messageId: string,
) {
  const gmail = getGmailClient(accessToken);

  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const data = response.data;
  const headers = data.payload?.headers || [];

  return {
    id: data.id,
    threadId: data.threadId,
    subject: getHeader(headers, "Subject"),
    from: getHeader(headers, "From"),
    to: getHeader(headers, "To"),
    date: getHeader(headers, "Date"),
    body: getBody(data.payload),
    snippet: data.snippet || "",
    labelIds: data.labelIds || [],
  };
}

export async function markGmailAsRead(
  accessToken: string,
  messageId: string,
) {
  const gmail = getGmailClient(accessToken);

  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      removeLabelIds: ["UNREAD"],
    },
  });

  return {success: true};
}

export async function starGmailMessage(
  accessToken: string,
  messageId: string,
  starred: boolean,
) {
  const gmail = getGmailClient(accessToken);

  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: starred ?
      {
        addLabelIds: ["STARRED"],
      } :
      {
        removeLabelIds: ["STARRED"],
      },
  });

  return {success: true};
}

export async function deleteGmailMessage(
  accessToken: string,
  messageId: string,
) {
  const gmail = getGmailClient(accessToken);

  await gmail.users.messages.trash({
    userId: "me",
    id: messageId,
  });

  return {success: true};
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
) {
  const gmail = getGmailClient(accessToken);

  const rawMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ].join("\r\n");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return {
    success: true,
    id: response.data.id,
    threadId: response.data.threadId,
  };
}