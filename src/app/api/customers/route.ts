import { NextResponse } from "next/server";
import { getGoogleSheets, SPREADSHEET_ID, SHEET_RANGES } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Customers,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ customers: [] });
    }

    const customers = rows.map((row) => ({
      phone: row[0] || "",
      name: row[1] || "",
      purchaseValue: row[2] || "₹0.00",
    }));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { phone, name } = data;

    const sheets = await getGoogleSheets();
    
    // First 2 fields: Phone, Name
    const newRow = [phone, name];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Customers,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRow],
      },
    });

    return NextResponse.json({ success: true, message: "Customer added successfully." });
  } catch (error) {
    console.error("Error adding customer:", error);
    return NextResponse.json({ error: "Failed to add customer" }, { status: 500 });
  }
}
