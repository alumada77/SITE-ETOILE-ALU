const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");

let tokenClient: any = null;

const TOKEN_KEY = "gmail_access_token";

export function initGoogleAuth(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!CLIENT_ID) {
      reject(
        new Error(
          "VITE_GOOGLE_CLIENT_ID tsy mbola configuré.",
        ),
      );
      return;
    }

    const google = (window as any).google;

    if (!google?.accounts?.oauth2) {
      reject(
        new Error(
          "Google Identity Services mbola tsy chargé.",
        ),
      );
      return;
    }

    if (tokenClient) {
      resolve();
      return;
    }

    tokenClient =
      google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,

        callback: () => {
          // Callback ovaina ao amin'ny getGoogleAccessToken()
        },
      });

    resolve();
  });
}

/**
 * Mangataka Gmail permission.
 *
 * IMPORTANT:
 * Antsoy avy amin'ny CLICK utilisateur ihany.
 * Aza antsoina ao anaty useEffect automatique.
 */
export async function getGoogleAccessToken(): Promise<string> {
  if (!tokenClient) {
    await initGoogleAuth();
  }

  return new Promise((resolve, reject) => {
    tokenClient.callback = (response: any) => {
      if (response?.error) {
        reject(
          new Error(
            response.error_description ||
              response.error ||
              "Erreur Google OAuth.",
          ),
        );
        return;
      }

      if (!response?.access_token) {
        reject(
          new Error(
            "Google tsy namerina access token.",
          ),
        );
        return;
      }

      localStorage.setItem(
        TOKEN_KEY,
        response.access_token,
      );

      resolve(response.access_token);
    };

    /*
     * IMPORTANT:
     * prompt="" mamela Google hampiasa
     * authorization efa nomena raha mbola valide.
     *
     * Ity fonction ity kosa tsy tokony
     * hantsoina automatiquement.
     */
    tokenClient.requestAccessToken({
      prompt: "",
    });
  });
}

export function getStoredGoogleAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isGmailConnected(): boolean {
  return Boolean(
    localStorage.getItem(TOKEN_KEY),
  );
}

export function disconnectGmail(): void {
  const token =
    localStorage.getItem(TOKEN_KEY);

  if (token) {
    const google = (window as any).google;

    try {
      google?.accounts?.oauth2?.revoke(
        token,
        () => {
          // Token revoked
        },
      );
    } catch (error) {
      console.warn(
        "Erreur revoke Gmail token:",
        error,
      );
    }
  }

  localStorage.removeItem(TOKEN_KEY);
}