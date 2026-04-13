import { NextResponse } from "next/server";
import { getGoogleSheets, SPREADSHEET_ID, SHEET_RANGES } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Vendors,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ vendors: [] });
    }

    // Filter rows where both SHOP (index 0) and OWNER (index 1) are empty
    const filteredRows = rows.filter(row => 
      (row[0] && row[0].toString().trim() !== "") || 
      (row[1] && row[1].toString().trim() !== "")
    );

    // Map rows to objects based on expected columns:
    const vendors = filteredRows.map((row) => ({
      shop: row[0] || "",
      owner: row[1] || "",
      number: row[2] || "",
      address: row[3] || "",
      firstVisit: row[4] || "",
      gstNumber: row[5] || "",
      comments: row[6] || "",
      pcsBought: row[7] || "0",
      money: row[8] || "₹0.00",
      pcsRemain: row[9] || "0",
    }));

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { shop, owner, number, address, firstVisit, gstNumber, comments } = data;

    const sheets = await getGoogleSheets();
    
    // Unified Update: Fetch all values in column A to find the true first empty row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Vendor!A:A",
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
      shop, 
      owner, 
      number, 
      address, 
      firstVisit, 
      gstNumber, 
      comments,
      `=SUMIF(Purchase!F:F, A${firstEmptyRow}, Purchase!D:D)`, // pcsBought
      `=SUMIF(Purchase!F:F, A${firstEmptyRow}, Purchase!J:J)`, // money
      `=SUMIF(Purchase!F:F, A${firstEmptyRow}, Purchase!L:L)`  // pcsRemain
    ];

    // Always use update to target the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Vendor!A${firstEmptyRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRow],
      },
    });

    return NextResponse.json({ success: true, message: "Vendor added successfully." });
  } catch (error) {
    console.error("Error adding vendor:", error);
    return NextResponse.json({ error: "Failed to add vendor" }, { status: 500 });
  }
}
