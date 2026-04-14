import { google } from "googleapis";
import fs from "fs";
import path from "path";

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
        if (credentials.private_key) {
          credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
        }
        authOptions.credentials = credentials;
      } catch (e) {
        throw new Error("GOOGLE_SHEETS_CREDENTIALS is set but contains invalid JSON.");
      }
    } else {
      const keyPath = process.env.GOOGLE_SHEETS_KEY_PATH || "google-key.json";
      // Using path.join with process.cwd() and turbopackIgnore to prevent recursive tracing of the root directory
      const fullPath = path.join(/* turbopackIgnore: true */ process.cwd(), keyPath);

      if (fs.existsSync(fullPath)) {
        authOptions.keyFile = fullPath;
      } else {
        const errorMsg = `Google Sheets credentials missing. 

To fix this:
1. Create a '.env.local' file and add 'GOOGLE_SHEETS_CREDENTIALS'.
2. Or, place a 'google-key.json' file in the root directory.

See '.env.example' for more details.`;
        
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          throw new Error("Missing GOOGLE_SHEETS_CREDENTIALS in Production environment.");
        } else {
          console.error(errorMsg);
          throw new Error("Missing Google Sheets credentials.");
        }
      }
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
  Vendors: "Vendor!A2:J", // Shop to Pcs Remain
  Purchases: "Purchase!A2:P", // Invoice Number to Balance
  Customers: "Customer!A2:C", // Phone, Name, Purchase value
  Sales: "Sale!A2:L", // Bill Num to Profit/Piece
  Profiles: "Profiles!A2:C", // Name, Email, Password
};

