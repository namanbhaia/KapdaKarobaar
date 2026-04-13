"use client";

import DataTable, { Column } from "@/components/DataTable";
import { Purchase } from "@/services/purchases";

interface PurchaseTableProps {
  loading: boolean;
  purchases: Purchase[];
}

export default function PurchaseTable({ loading, purchases }: PurchaseTableProps) {
  const columns: Column<Purchase>[] = [
    { 
      key: "storeSuitId", 
      header: "Store ID", 
      sortable: true, 
      filterable: true,
      render: (p) => <span className="font-semibold text-blue-400">{p.storeSuitId}</span>
    },
    { 
      key: "invoiceNumber", 
      keys: ["invoiceNumber", "date"],
      header: "Invoice & Date", 
      sortable: true, 
      filterable: true,
      render: (p) => (
        <div>
          <span className="font-medium text-slate-200">{p.invoiceNumber}</span>
          <span className="block text-xs text-slate-500 mt-1">{p.date}</span>
        </div>
      )
    },
    { 
      key: "vendor", 
      header: "Vendor", 
      sortable: true, 
      filterable: true 
    },
    { 
      key: "quantity", 
      header: "Qty", 
      sortable: true, 
      filterable: true 
    },
    { 
      key: "rate", 
      header: "Rate", 
      sortable: true, 
      filterable: true 
    },
    { 
      key: "cost", 
      header: "Base Cost", 
      sortable: true, 
      filterable: true,
      render: (p) => <span className="text-slate-400">{p.cost}</span>
    },
    { 
      key: "gst", 
      header: "GST", 
      sortable: true, 
      filterable: true,
      render: (p) => <span className="text-slate-500">{p.gst}</span>
    },
    { 
      key: "discount", 
      header: "Disc", 
      sortable: true, 
      filterable: true,
      render: (p) => <span className="text-orange-400/60">{p.discount}</span>
    },
    { 
      key: "effCost", 
      header: "Eff Cost", 
      sortable: true, 
      filterable: true,
      render: (p) => <span className="font-bold text-emerald-400">{p.effCost}</span>
    },
    { 
      key: "balance", 
      keys: ["balance", "sold"],
      header: "Bal / Sold", 
      sortable: true, 
      filterable: true,
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">{p.balance}</span>
          <span className="text-slate-600 text-xs">/</span>
          <span className="text-slate-500">{p.sold}</span>
        </div>
      )
    },
  ];

  return (
    <DataTable
      title="Inventory Ledger"
      data={purchases}
      columns={columns}
      loading={loading}
      emptyMessage="No purchases found."
    />
  );
}
