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

    // Filter rows where both Invoice Number (index 0) and Vendor Suit ID (index 1) are empty
    const filteredRows = rows.filter(row => 
      (row[0] && row[0].toString().trim() !== "") || 
      (row[1] && row[1].toString().trim() !== "") ||
      (row[2] && row[2].toString().trim() !== "") // Also check store ID as it's critical
    );

    const purchases = filteredRows.map((row) => ({
      invoiceNumber: row[0] || "",
      vendorSuitId: row[1] || "",
      storeSuitId: row[2] || "",
      quantity: row[3] || "0",
      rate: row[4] || "₹0.00",
      vendor: row[5] || "",
      date: row[6] || "",
      buyer: row[7] || "",
      design: row[8] || "",
      gst: row[9] || "₹0.00",
      discount: row[10] || "₹0.00",
      cost: row[11] || "₹0.00",
      effCost: row[12] || "₹0.00",
      effCostPerPiece: row[13] || "₹0.00",
      sold: row[14] || "0",
      balance: row[15] || "0",
      profitAllTime: row[16] || "₹0.00",
    }));

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];

    if (items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const sheets = await getGoogleSheets();
    
    // Unified Update: Fetch all values in column A to find the true first empty row
    const purchaseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Purchase!A:A",
    });

    const rows = purchaseResponse.data.values || [];
    let currentRowIndex = rows.length + 1;

    // Check for any internal empty rows (skipping header at row 1)
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i][0] || rows[i][0].toString().trim() === "") {
            currentRowIndex = i + 1;
            break;
        }
    }

    for (const item of items) {
      const { invoiceNumber, vendorSuitId, storeSuitId, quantity, rate, vendor, date, buyer, design, gst, discount } = item;

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
        gst, // Column J
        discount, // Column K
        `=D${currentRowIndex}*E${currentRowIndex}`, // Column L (Cost)
        `=L${currentRowIndex}+J${currentRowIndex}-K${currentRowIndex}`, // Column M (Eff Cost)
        `=M${currentRowIndex}/D${currentRowIndex}`, // Column N (Eff Cost/Piece)
        `=SUMIF(Sale!$E$2:$E, C${currentRowIndex}, Sale!$H$2:$H)`, // Column O (Sold)
        `=D${currentRowIndex}-O${currentRowIndex}`,  // Column P (Balance)
        `=SUMIF(Sale!$E$2:$E, C${currentRowIndex}, Sale!$N$2:$N)` // Column Q (Profit All Time)
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Purchase!A${currentRowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [newRow],
        },
      });

      currentRowIndex++;
    }

    return NextResponse.json({ success: true, message: `${items.length} purchase(s) added successfully.` });
  } catch (error) {
    console.error("Error adding purchase:", error);
    return NextResponse.json({ error: "Failed to add purchase" }, { status: 500 });
  }
}
