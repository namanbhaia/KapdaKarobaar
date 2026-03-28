import { NextResponse } from "next/server";
import { getGoogleSheets, SPREADSHEET_ID, SHEET_RANGES } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Purchases,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ purchases: [] });
    }

    const purchases = rows.map((row) => ({
      invoiceNumber: row[0] || "",
      vendorSuitId: row[1] || "",
      storeSuitId: row[2] || "",
      quantity: row[3] || "0",
      rate: row[4] || "₹0.00",
      vendor: row[5] || "",
      date: row[6] || "",
      buyer: row[7] || "",
      design: row[8] || "",
      cost: row[9] || "₹0.00",
      sold: row[10] || "0",
      balance: row[11] || "0",
    }));

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { invoiceNumber, vendorSuitId, storeSuitId, quantity, rate, vendor, date, buyer, design } = data;

    const sheets = await getGoogleSheets();
    
    // First 9 fields
    const newRow = [invoiceNumber, vendorSuitId, storeSuitId, quantity, rate, vendor, date, buyer, design];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Purchases,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRow],
      },
    });

    return NextResponse.json({ success: true, message: "Purchase added successfully." });
  } catch (error) {
    console.error("Error adding purchase:", error);
    return NextResponse.json({ error: "Failed to add purchase" }, { status: 500 });
  }
}
