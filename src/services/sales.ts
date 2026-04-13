export type Sale = {
  billNum: string;
  date: string;
  customerPhone: string;
  customerName: string;
  storeSuitId: string;
  rate: string;
  quantity: string;
  gst: string;
  discountPercentAmount: string;
  discountCashAmount: string;
  total: string;
  profitPerPiece: string;
};

export async function fetchSales(): Promise<Sale[]> {
  const res = await fetch("/api/sales");
  if (!res.ok) throw new Error("Failed to fetch sales");
  const data = await res.json();
  return data.sales || [];
}

export async function addSale(sale: Partial<Sale> | Partial<Sale>[]): Promise<void> {
  const res = await fetch("/api/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sale),
  });
  if (!res.ok) throw new Error("Failed to log sale");
}
