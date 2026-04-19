"use client";

import DataTable, { Column } from "@/components/DataTable";
import { Sale } from "@/services/sales";

interface SaleTableProps {
  loading: boolean;
  sales: Sale[];
}

import { useUserLevel } from "@/hooks/useUserLevel";

export default function SaleTable({ loading, sales }: SaleTableProps) {
  const { isPrivileged } = useUserLevel();

  const allColumns: Column<Sale>[] = [
    {
      key: "billNum",
      keys: ["billNum", "date"],
      header: "Bill / Date",
      sortable: true,
      filterable: true,
      render: (s) => (
        <div>
          <span className="font-semibold text-emerald-400">{s.billNum}</span>
          <span className="block text-xs text-slate-500 mt-1">{s.date}</span>
        </div>
      )
    },
    {
      key: "customerName",
      keys: ["customerName", "customerPhone"],
      header: "Customer",
      sortable: true,
      filterable: true,
      render: (s) => (
        <div>
          <span className="text-slate-200">{s.customerName || "Unknown"}</span>
          <span className="block text-xs text-slate-500 mt-1">{s.customerPhone}</span>
        </div>
      )
    },
    {
      key: "storeSuitId",
      header: "Suit ID",
      sortable: true,
      filterable: true,
      render: (s) => <span className="font-medium text-blue-400">{s.storeSuitId}</span>
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
      key: "discountPercentAmount",
      header: "Discount",
      sortable: true,
      filterable: true,
      render: (s) => {
        const val = parseFloat(s.discountPercentAmount) || 0;
        return <span className="text-orange-400">{val > 0 ? `₹${val.toFixed(2)}` : "—"}</span>;
      }
    },
    {
      key: "gst",
      header: "GST",
      sortable: true,
      filterable: true,
      render: (s) => <span className="text-blue-300">{s.gst}</span>
    },
    {
      key: "discountCashAmount",
      header: "Adjusted Price",
      sortable: true,
      filterable: true,
      render: (s) => {
        const val = parseFloat(s.discountCashAmount) || 0;
        return <span className="text-amber-400">{val > 0 ? `₹${val.toFixed(2)}` : "—"}</span>;
      }
    },
    {
      key: "effCostPerPiece",
      header: "Eff Cost/pc",
      sortable: false,
      filterable: false,
      render: (s) => {
        const total = parseFloat(s.total?.toString().replace(/[^0-9.-]+/g, "") || "0");
        const qty = parseFloat(s.quantity) || 1;
        const effCost = total / qty;
        return <span className="font-semibold text-cyan-400">₹{effCost.toFixed(2)}</span>;
      }
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      filterable: true,
      render: (s) => <span className="font-bold text-white tracking-wide underline decoration-emerald-500/50 underline-offset-4">{s.total}</span>
    },
    {
      key: "profitPerPiece",
      header: "Profit/Pcs",
      sortable: true,
      filterable: true,
      render: (s) => <span className="font-semibold text-emerald-300">{s.profitPerPiece}</span>
    },
    {
      key: "purchasePrice",
      header: "Pur. Price",
      sortable: true,
      filterable: true,
      render: (s) => <span className="text-slate-400 font-mono">{s.purchasePrice}</span>
    },
  ];

  const columns = allColumns.filter(col => {
    if ((col.key === "profitPerPiece" || col.key === "purchasePrice") && !isPrivileged) return false;
    return true;
  });

  return (
    <DataTable
      title="Sales Log"
      data={sales}
      columns={columns}
      loading={loading}
      emptyMessage="No sales logged."
    />
  );
}

