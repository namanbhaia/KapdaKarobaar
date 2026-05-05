"use client";

import DataTable, { Column } from "@/components/DataTable";
import { Vendor } from "@/services/vendors";

interface VendorTableProps {
  loading: boolean;
  vendors: Vendor[];
  visibleColumns?: string[];
}

export default function VendorTable({ loading, vendors, visibleColumns }: VendorTableProps) {
  const allColumns: Column<Vendor>[] = [
    {
      key: "shop",
      keys: ["shop", "gstNumber"],
      header: "Shop",
      sortable: true,
      filterable: false,
      render: (v) => (
        <div>
          <span className="font-medium text-slate-200">{v.shop}</span>
          {v.gstNumber && <span className="block text-xs text-slate-500 mt-1">GST: {v.gstNumber}</span>}
        </div>
      )
    },
    {
      key: "owner",
      header: "Owner",
      sortable: false,
      filterable: false
    },
    {
      key: "number",
      header: "Contact",
      sortable: false,
      filterable: false
    },
    {
      key: "pcsBought",
      header: "Bought",
      sortable: true,
      filterable: false,
      render: (v) => <span className="font-semibold text-slate-300">{v.pcsBought}</span>
    },
    {
      key: "money",
      header: "Money",
      sortable: true,
      filterable: false,
      render: (v) => <span className="font-semibold text-emerald-400">{v.money}</span>
    },
    {
      key: "pcsRemain",
      header: "Remain",
      sortable: true,
      filterable: false,
      render: (v) => <span className="font-semibold text-blue-400">{v.pcsRemain}</span>
    },
  ];

  const columns = visibleColumns
    ? allColumns.filter((c) => visibleColumns.includes(c.key as string))
    : allColumns;

  return (
    <DataTable
      title="Directory"
      data={vendors}
      columns={columns}
      loading={loading}
      emptyMessage="No vendors found."
    />
  );
}
