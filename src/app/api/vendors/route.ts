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

    // Map rows to objects based on expected columns:
    // Shop, Owner, Number, Address, First Visit, GST Number, Comments, Pcs Bought, Money
    const vendors = rows.map((row) => ({
      shop: row[0] || "",
      owner: row[1] || "",
      number: row[2] || "",
      address: row[3] || "",
      firstVisit: row[4] || "",
      gstNumber: row[5] || "",
      comments: row[6] || "",
      pcsBought: row[7] || "0",
      money: row[8] || "₹0.00",
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
    
    // We only write the first 7 columns. Google Sheets handles the rest via formula,
    // though appending usually requires providing empty values for formula columns if 
    // we want to ensure the row is fully populated, but actually appending a shortened 
    // row vector will just leave the formula columns intact.
    const newRow = [shop, owner, number, address, firstVisit, gstNumber, comments];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Vendors,
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
