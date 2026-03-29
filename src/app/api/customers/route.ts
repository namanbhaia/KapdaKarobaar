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
    
    // Unified Update: Fetch all values in column A to find the true first empty row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Customer!A:A",
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
      phone, 
      name, 
      `=SUMIF(Sale!C:C, B${firstEmptyRow}, Sale!H:H)` // Purchase Value
    ];

    // Always use update to target the specific row
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Customer!A${firstEmptyRow}`,
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
