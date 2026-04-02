import { NextResponse } from "next/server";
import { getGoogleSheets, SPREADSHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheets();

    // Fetch column C (storeSuitId) from the Purchase sheet (skip header row 1)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Purchase!C2:C",
    });

    const rows = response.data.values || [];

    // Collect all suit IDs that match the pattern S### (case-insensitive)
    let maxNum = 0;
    for (const row of rows) {
      const cell = (row[0] || "").toString().trim();
      const match = cell.match(/^S(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    // Next ID is maxNum + 1, zero-padded to at least 3 digits
    const nextNum = maxNum + 1;
    const nextId = `S${String(nextNum).padStart(3, "0")}`;

    return NextResponse.json({ nextSuitId: nextId });
  } catch (error) {
    console.error("Error fetching next suit ID:", error);
    return NextResponse.json({ error: "Failed to fetch next suit ID" }, { status: 500 });
  }
}
