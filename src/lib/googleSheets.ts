import { google } from "googleapis";

// Reusing the initialized auth client
let authClient: any = null;

export async function getGoogleSheets() {
  if (!authClient) {
    const authOptions: any = {
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    };

    if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
        // Fix for Vercel/Production: replace escaped newlines in private key
        if (credentials.private_key) {
          credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
        }
        authOptions.credentials = credentials;
        console.log("Using Google Credentials from environment variable.");
      } catch (e) {
        console.error("Failed to parse GOOGLE_SHEETS_CREDENTIALS env var:", e);
        // On Vercel, we can't use the file, so we should throw a clearer error
        if (process.env.VERCEL) {
          throw new Error("Invalid GOOGLE_SHEETS_CREDENTIALS format on Vercel.");
        }
        authOptions.keyFile = process.env.GOOGLE_SHEETS_KEY_PATH || "google-key.json";
      }
    } else {
      // Local development or file-based auth
      if (process.env.VERCEL) {
         console.warn("GOOGLE_SHEETS_CREDENTIALS is missing on Vercel.");
      }
      authOptions.keyFile = process.env.GOOGLE_SHEETS_KEY_PATH || "google-key.json";
    }

    const auth = new google.auth.GoogleAuth(authOptions);
    authClient = await auth.getClient();
  }

  const sheets = google.sheets({ version: "v4", auth: authClient });
  return sheets;
}

export const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "156-pwvj7Cpc20wguxSCs38JESAmUD2cNaq94lPNKf48";

// Map our concepts to sheet names and ranges
export const SHEET_RANGES = {
  Vendors: "Vendor!A2:I", // Shop to Money
  Purchases: "Purchase!A2:L", // Invoice Number to Balance
  Customers: "Customer!A2:C", // Phone, Name, Purchase value
  Sales: "Sale!A2:I", // Bill Num to Profit/Piece
};
