import { NextResponse } from "next/server";
import { getGoogleSheets, SPREADSHEET_ID, SHEET_RANGES } from "@/lib/googleSheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGES.Expenses,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ expenses: [] });
    }

    // Filter rows where Spender (index 0) or Amount (index 1) are empty, 
    // assuming valid expenses must have at least one of these or just skip completely empty rows.
    const filteredRows = rows.filter(row => 
      (row[0] && row[0].toString().trim() !== "") || 
      (row[1] && row[1].toString().trim() !== "")
    );

    const expenses = filteredRows.map((row) => ({
      spender: row[0] || "",
      amount: row[1] || "",
      date: row[2] || "",
      category: row[3] || "",
      comments: row[4] || "",
    }));

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
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
    
    // Find the starting empty row
    const expenseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Expense!A:A", // Need to find empty row in Spender column
    });

    const rows = expenseResponse.data.values || [];
    let currentRowIndex = rows.length + 1;

    // Check for any internal empty rows (skipping header at row 1)
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i][0] || rows[i][0].toString().trim() === "") {
            currentRowIndex = i + 1;
            break;
        }
    }

    for (const item of items) {
      const { spender, amount, date, category, comments } = item;
      
      const newRow = [
        spender, 
        amount, 
        date, 
        category, 
        comments
      ];

      await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Expense!A${currentRowIndex}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
              values: [newRow],
          },
      });
      
      currentRowIndex++;
    }

    return NextResponse.json({ success: true, message: `${items.length} expense(s) logged successfully.` });
  } catch (error) {
    console.error("Error logging expense:", error);
    return NextResponse.json({ error: "Failed to log expense" }, { status: 500 });
  }
}
