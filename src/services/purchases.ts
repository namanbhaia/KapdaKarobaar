export type Purchase = {
  invoiceNumber: string;
  vendorSuitId: string;
  storeSuitId: string;
  quantity: string;
  rate: string;
  vendor: string;
  date: string;
  buyer: string;
  design: string;
  gst: string;
  discount: string;
  cost: string;
  effCost: string;
  sold: string;
  balance: string;
};

export async function fetchPurchases(): Promise<Purchase[]> {
  const res = await fetch("/api/purchases");
  if (!res.ok) throw new Error("Failed to fetch purchases");
  const data = await res.json();
  return data.purchases || [];
}

export async function addPurchase(purchase: Partial<Purchase> | Partial<Purchase>[]): Promise<void> {
  const res = await fetch("/api/purchases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(purchase),
  });
  if (!res.ok) throw new Error("Failed to add purchase");
}
