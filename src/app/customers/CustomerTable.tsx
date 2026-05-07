"use client";

import DataTable, { Column } from "@/components/DataTable";
import { Customer } from "@/services/customers";

interface CustomerTableProps {
  loading: boolean;
  customers: Customer[];
}

export default function CustomerTable({ loading, customers }: CustomerTableProps) {
  const columns: Column<Customer>[] = [
    {
      key: "phone",
      header: "Phone Number",
      sortable: false,
      filterable: true,
      render: (c) => <span className="font-medium text-purple-400">{c.phone}</span>
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      filterable: true
    },
    {
      key: "purchaseValue",
      header: "Value",
      sortable: true,
      filterable: false,
      render: (c) => <span className="font-semibold text-emerald-400">{c.purchaseValue}</span>
    },
  ];

  return (
    <DataTable
      title="Directory"
      data={customers}
      columns={columns}
      loading={loading}
      emptyMessage="No customers found."
    />
  );
}
