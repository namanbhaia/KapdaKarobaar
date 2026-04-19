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
      purchasePrice: row[5] || "₹0.00",
      rate: row[6] || "₹0.00",
      quantity: row[7] || "0",
      discountPercentAmount: row[8] || "₹0.00",
      gst: row[9] || "₹0.00",
      discountCashAmount: row[10] || "₹0.00",
      total: row[11] || "₹0.00",
      profitPerPiece: row[12] || "₹0.00",
    }));

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
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
    
    // 1. Auto-Register Customer if new (using data from the first item)
    const { customerPhone, customerName } = items[0];
    if (customerPhone) {
      const customerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Customer!A:B", 
      });
      const customerRows = customerResponse.data.values || [];
      const customerExists = customerRows.some(row => row[0] === customerPhone);

      if (!customerExists) {
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
    }

    // 2. Log the Sales
    // Fetch once to find the starting empty row
    const saleResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sale!A:A",
    });

    const rows = saleResponse.data.values || [];
    let currentRowIndex = rows.length + 1;

    // Check for any internal empty rows (skipping header at row 1)
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i][0] || rows[i][0].toString().trim() === "") {
            currentRowIndex = i + 1;
            break;
        }
    }

    // We'll collect all rows to be inserted. 
    // However, since we need to inject row-specific formulas, and there might be internal empty rows,
    // we'll insert them one by one to ensure the row index is correct for each formula.
    // Optimization: If there are no internal empty rows, we could do a batch update.
    // For now, to keep it safe and consistent with the existing logic, we do them sequentially.
    
    for (const item of items) {
      const { 
        billNum, date, customerPhone, customerName, storeSuitId, rate, quantity,
        gst, discountPercentAmount, discountCashAmount 
      } = item;
      
      const newRow = [
        billNum, 
        date, 
        customerPhone, 
        customerName, 
        storeSuitId, 
        `=IFERROR(VLOOKUP(TO_TEXT(E${currentRowIndex}), Purchase!C:N, 12, FALSE), "")`, // Eff Purchase Rate (F)
        rate, // Rate (G)
        quantity, // Quantity (H)
        discountPercentAmount, // Discount% (I)
        gst,                    // GST (J)
        discountCashAmount,    // Discount Cash (K)
        `=G${currentRowIndex}*H${currentRowIndex} - I${currentRowIndex} + J${currentRowIndex} - K${currentRowIndex}`, // Total (L)
        `=IFERROR(L${currentRowIndex}/H${currentRowIndex} - F${currentRowIndex}, "")` // Profit/Piece (M)
      ];

      await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Sale!A${currentRowIndex}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
              values: [newRow],
          },
      });
      
      currentRowIndex++;
    }

    return NextResponse.json({ success: true, message: `${items.length} sale(s) logged successfully.` });
  } catch (error) {
    console.error("Error logging sale:", error);
    return NextResponse.json({ error: "Failed to log sale" }, { status: 500 });
  }
}
