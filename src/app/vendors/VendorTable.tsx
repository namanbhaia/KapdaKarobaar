"use client";

import { Loader2 } from "lucide-react";
import { Vendor } from "@/services/vendors";

interface VendorTableProps {
  loading: boolean;
  vendors: Vendor[];
}

export default function VendorTable({ loading, vendors }: VendorTableProps) {
  return (
    <div className="glass p-6 rounded-2xl border-t-2 border-slate-700/50">
      <h2 className="text-xl font-semibold mb-6">Directory</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="p-4 font-semibold">Shop</th>
              <th className="p-4 font-semibold">Owner</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Bought</th>
              <th className="p-4 font-semibold">Money</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
            ) : vendors.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No vendors found.</td></tr>
            ) : (
              vendors.map((v, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    {v.shop}
                    {v.gstNumber && <span className="block text-xs text-slate-500 mt-1">GST: {v.gstNumber}</span>}
                  </td>
                  <td className="p-4">{v.owner}</td>
                  <td className="p-4">{v.number}</td>
                  <td className="p-4 font-semibold">{v.pcsBought}</td>
                  <td className="p-4 font-semibold text-emerald-400 flex items-center gap-1">
                    {v.money}
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
