export type Customer = {
  rowIndex?: number;
  phone: string;
  name: string;
  purchaseValue: string;
};

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch("/api/customers");
  if (!res.ok) throw new Error("Failed to fetch customers");
  const data = await res.json();
  return data.customers || [];
}

export async function addCustomer(customer: Partial<Customer>): Promise<void> {
  const res = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  if (!res.ok) throw new Error("Failed to register customer");
}

export async function updateCustomer(customer: Customer): Promise<void> {
  const res = await fetch("/api/customers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  if (!res.ok) throw new Error("Failed to update customer");
}
