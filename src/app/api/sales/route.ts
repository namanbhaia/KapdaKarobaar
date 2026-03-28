import { NextResponse } from "next/server";
import { getGoogleSheets, SPREADSHEET_ID, SHEET_RANGES } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Sales,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ sales: [] });
    }

    const sales = rows.map((row) => ({
      billNum: row[0] || "",
      date: row[1] || "",
      customerPhone: row[2] || "",
      customerName: row[3] || "",
      storeSuitId: row[4] || "",
      rate: row[5] || "₹0.00",
      quantity: row[6] || "0",
      total: row[7] || "₹0.00",
      profitPerPiece: row[8] || "₹0.00",
    }));

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { billNum, date, customerPhone, customerName, storeSuitId, rate, quantity } = data;

    const sheets = await getGoogleSheets();
    
    // First 7 fields
    const newRow = [billNum, date, customerPhone, customerName, storeSuitId, rate, quantity];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Sales,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRow],
      },
    });

    return NextResponse.json({ success: true, message: "Sale logged successfully." });
  } catch (error) {
    console.error("Error logging sale:", error);
    return NextResponse.json({ error: "Failed to log sale" }, { status: 500 });
  }
}
