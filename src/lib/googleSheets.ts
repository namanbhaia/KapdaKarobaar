import { google } from "googleapis";

// Reusing the initialized auth client
let authClient: any = null;

export async function getGoogleSheets() {
  if (!authClient) {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SHEETS_KEY_PATH || "google-key.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    authClient = await auth.getClient();
  }

  const sheets = google.sheets({ version: "v4", auth: authClient });
  return sheets;
}

export const SPREADSHEET_ID = "156-pwvj7Cpc20wguxSCs38JESAmUD2cNaq94lPNKf48";

// Map our concepts to sheet names and ranges
export const SHEET_RANGES = {
  Vendors: "Vendor!A2:I", // Shop to Money
  Purchases: "Purchase!A2:L", // Invoice Number to Balance
  Customers: "Customer!A2:C", // Phone, Name, Purchase value
  Sales: "Sale!A2:I", // Bill Num to Profit/Piece
};
