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

    // Filter rows where both Bill Num (index 0) and Date (index 1) are empty
    const filteredRows = rows.filter(row => 
      (row[0] && row[0].toString().trim() !== "") || 
      (row[1] && row[1].toString().trim() !== "")
    );

    const sales = filteredRows.map((row) => ({
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
    
    // 1. Auto-Register Customer if new
    const customerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Customer!A:B", 
    });
    const customerRows = customerResponse.data.values || [];
    const customerExists = customerRows.some(row => row[0] === customerPhone);

    if (!customerExists && customerPhone) {
        let firstEmptyCustomerRow = customerRows.length + 1;
        for (let i = 1; i < customerRows.length; i++) {
            if (!customerRows[i][0] || customerRows[i][0].toString().trim() === "") {
                firstEmptyCustomerRow = i + 1;
                break;
            }
        }
        
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Customer!A${firstEmptyCustomerRow}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[
                    customerPhone, 
                    customerName, 
                    `=SUMIF(Sale!C:C, A${firstEmptyCustomerRow}, Sale!H:H)` // Total Purchase Value based on Phone
                ]],
            },
        });
    }

    // 2. Log the Sale
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sale!A:A",
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
      billNum, 
      date, 
      customerPhone, 
      customerName, 
      storeSuitId, 
      rate, 
      quantity,
      `=F${firstEmptyRow}*G${firstEmptyRow}`, // Total (index 7)
      `=IFERROR(F${firstEmptyRow} - XLOOKUP(E${firstEmptyRow}, Purchase!C:C, Purchase!E:E), "")` // Profit/Piece (index 8)
    ];

    // Always use update to target the specific row
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sale!A${firstEmptyRow}`,
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
