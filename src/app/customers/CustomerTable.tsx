"use client";

import { Loader2 } from "lucide-react";
import { Customer } from "@/services/customers";

interface CustomerTableProps {
  loading: boolean;
  customers: Customer[];
}

export default function CustomerTable({ loading, customers }: CustomerTableProps) {
  return (
    <div className="glass p-6 rounded-2xl border-t-2 border-slate-700/50">
      <h2 className="text-xl font-semibold mb-6">Directory</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="p-4 font-semibold">Phone Number</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" /></td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-slate-500">No customers found.</td></tr>
            ) : (
              customers.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-purple-400">{c.phone}</td>
                  <td className="p-4">{c.name}</td>
                  <td className="p-4 font-semibold text-emerald-400">{c.purchaseValue}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
