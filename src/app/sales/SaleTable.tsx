"use client";

import { Loader2 } from "lucide-react";
import { Sale } from "@/services/sales";

interface SaleTableProps {
  loading: boolean;
  sales: Sale[];
}

export default function SaleTable({ loading, sales }: SaleTableProps) {
  return (
    <div className="glass p-6 rounded-2xl border-t-2 border-slate-700/50 overflow-hidden flex flex-col">
      <h2 className="text-xl font-semibold mb-6">Sales Log</h2>
      <div className="overflow-x-auto overflow-y-auto rounded-xl border border-slate-700 flex-1 max-h-[600px]">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 sticky top-0">
            <tr>
              <th className="p-4 font-semibold">Bill / Date</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Suit ID</th>
              <th className="p-4 font-semibold">Qty</th>
              <th className="p-4 font-semibold">Rate</th>
              <th className="p-4 font-semibold">Total</th>
              <th className="p-4 font-semibold">Profit/Pcs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" /></td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">No sales logged.</td></tr>
            ) : (
              sales.map((s, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <span className="font-semibold text-emerald-400">{s.billNum}</span>
                    <span className="block text-xs text-slate-500 mt-1">{s.date}</span>
                  </td>
                  <td className="p-4">
                    {s.customerName || "Unknown"}
                    <span className="block text-xs text-slate-500 mt-1">{s.customerPhone}</span>
                  </td>
                  <td className="p-4 font-medium text-blue-400">{s.storeSuitId}</td>
                  <td className="p-4">{s.quantity}</td>
                  <td className="p-4">{s.rate}</td>
                  <td className="p-4 font-bold text-white tracking-wide">{s.total}</td>
                  <td className="p-4 font-semibold text-emerald-300">{s.profitPerPiece}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
