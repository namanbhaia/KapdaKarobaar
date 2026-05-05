"use client";

import DataTable, { Column } from "@/components/DataTable";
import { Sale } from "@/services/sales";

interface SaleTableProps {
  loading: boolean;
  sales: Sale[];
  visibleColumns?: string[];
}

import { useUserLevel } from "@/hooks/useUserLevel";

const parseCurrency = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const clean = val.toString().replace(/[^0-9.-]+/g, "");
  return parseFloat(clean) || 0;
};

export default function SaleTable({ loading, sales, visibleColumns }: SaleTableProps) {
  const { isPrivileged } = useUserLevel();

  const allColumns: Column<Sale>[] = [
    {
      key: "billNum",
      keys: ["billNum", "date"],
      header: "Bill / Date",
      sortable: true,
      filterable: false,
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
      sortable: false,
      filterable: false
    },
    {
      key: "purchaseRate",
      header: "Pur. Rate",
      sortable: true,
      filterable: false,
      render: (s) => <span className="text-slate-400 font-mono">{s.purchasePrice}</span>
    },
    {
      key: "rate",
      header: "Rate",
      sortable: true,
      filterable: false
    },
    {
      key: "discountPercentAmount",
      header: "Total Disc",
      sortable: true,
      filterable: false,
      render: (s) => {
        const val = parseCurrency(s.discountPercentAmount);
        return <span className="text-orange-400">{val > 0 ? `₹${val.toFixed(2)}` : "—"}</span>;
      }
    },
    // {
    //   key: "gst",
    //   header: "GST",
    //   sortable: true,
    //   filterable: true,
    //   render: (s) => <span className="text-blue-300">{s.gst}</span>
    // },
    {
      key: "discountCashAmount",
      header: "Adj Price",
      sortable: true,
      filterable: false,
      render: (s) => {
        const val = parseCurrency(s.discountCashAmount);
        return <span className="text-amber-400">{val > 0 ? `₹${val.toFixed(2)}` : "—"}</span>;
      }
    },
    {
      key: "effCostPerPiece",
      header: "Eff Rate",
      sortable: true,
      filterable: false,
      render: (s) => {
        const total = parseCurrency(s.total);
        const qty = parseCurrency(s.quantity) || 1;
        const effCost = total / qty;
        return <span className="font-semibold text-cyan-400">₹{effCost.toFixed(2)}</span>;
      }
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      filterable: false,
      render: (s) => <span className="font-bold text-white tracking-wide underline decoration-emerald-500/50 underline-offset-4">{s.total}</span>
    },
    {
      key: "profitPerPiece",
      header: "Profit/Pcs",
      sortable: true,
      filterable: false,
      render: (s) => {
        const val = parseCurrency(s.profitPerPiece);
        return <span className="font-semibold text-emerald-300">{val.toFixed(2)}</span>;
      }
    },
  ];

  const columns = allColumns.filter(col => {
    if ((col.key === "profitPerPiece" || col.key === "purchaseRate") && !isPrivileged) return false;
    if (visibleColumns && !visibleColumns.includes(col.key)) return false;
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

