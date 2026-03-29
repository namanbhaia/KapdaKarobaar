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
    
    // Unified Update: Fetch all values in column A to find the true first empty row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Purchase!A:A",
    });

    const rows = response.data.values || [];
    let firstEmptyRow = rows.length + 1;

    // Check for any internal empty rows (skipping header at row 1)
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i][0] || rows[i][0].toString().trim() === "") {
            firstEmptyRow = i + 1;
            break;
        }
    }

    // Prepare row with formula injection
    const newRow = [
      invoiceNumber, 
      vendorSuitId, 
      storeSuitId, 
      quantity, 
      rate, 
      vendor, 
      date, 
      buyer, 
      design,
      `=D${firstEmptyRow}*E${firstEmptyRow}`, // cost
      `=SUMIF(Sale!$E$2:$E, C${firstEmptyRow}, Sale!$G$2:$G)`, // sold
      `=D${firstEmptyRow}-K${firstEmptyRow}`  // balance
    ];

    // Always use update to target the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Purchase!A${firstEmptyRow}`,
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
