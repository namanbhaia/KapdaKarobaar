"use client";

import { Loader2 } from "lucide-react";
import { Purchase } from "@/services/purchases";

interface PurchaseTableProps {
  loading: boolean;
  purchases: Purchase[];
}

export default function PurchaseTable({ loading, purchases }: PurchaseTableProps) {
  return (
    <div className="glass p-6 rounded-2xl border-t-2 border-slate-700/50 overflow-hidden flex flex-col">
      <h2 className="text-xl font-semibold mb-6">Inventory Ledger</h2>
      <div className="overflow-x-auto overflow-y-auto rounded-xl border border-slate-700 flex-1 max-h-[600px]">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 sticky top-0">
            <tr>
              <th className="p-4 font-semibold">Store ID</th>
              <th className="p-4 font-semibold">Invoice & Date</th>
              <th className="p-4 font-semibold">Vendor</th>
              <th className="p-4 font-semibold">Qty</th>
              <th className="p-4 font-semibold">Rate</th>
              <th className="p-4 font-semibold">Cost</th>
              <th className="p-4 font-semibold">Bal/Sold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">No purchases found.</td></tr>
            ) : (
              purchases.map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-blue-400">{p.storeSuitId}</td>
                  <td className="p-4">
                    {p.invoiceNumber}
                    <span className="block text-xs text-slate-500 mt-1">{p.date}</span>
                  </td>
                  <td className="p-4">{p.vendor}</td>
                  <td className="p-4">{p.quantity}</td>
                  <td className="p-4">{p.rate}</td>
                  <td className="p-4 font-medium">{p.cost}</td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-semibold">{p.balance}</span> / <span className="text-slate-500">{p.sold}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
