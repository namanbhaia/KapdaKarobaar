export type Vendor = {
  shop: string;
  owner: string;
  number: string;
  address: string;
  firstVisit: string;
  gstNumber: string;
  comments: string;
  pcsBought: string;
  pcsRemain: string;
  money: string;
  profitAllTime: string;
};

export async function fetchVendors(): Promise<Vendor[]> {
  const res = await fetch("/api/vendors");
  if (!res.ok) throw new Error("Failed to fetch vendors");
  const data = await res.json();
  return data.vendors || [];
}

export async function addVendor(vendor: Partial<Vendor>): Promise<void> {
  const res = await fetch("/api/vendors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vendor),
  });
  if (!res.ok) throw new Error("Failed to add vendor");
}
