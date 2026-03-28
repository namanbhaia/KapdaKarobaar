"use client";

import { useState, useEffect } from "react";
import { CopySlashIcon as Cash, Save, Loader2, List, PlusCircle } from "lucide-react";

type Sale = {
  billNum: string;
  date: string;
  customerPhone: string;
  customerName: string;
  storeSuitId: string;
  rate: string;
  quantity: string;
  total: string;
  profitPerPiece: string;
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [view, setView] = useState<"log" | "history">("log");

  useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => {
        setSales(data.sales || []);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setBanner(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to log sale");
      
      setBanner({ type: "success", message: "Sale logged successfully!" });
      form.reset();
      
      const updated = await fetch("/api/sales").then(r => r.json());
      setSales(updated.sales || []);
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
            <Cash className="w-8 h-8 text-emerald-400" />
            Sales Ledger
          </h1>
          <p className="text-slate-400 mt-2">Log customer sales and track profits.</p>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setView("log")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "log"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Log Sale
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "history"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <List className="w-4 h-4" />
            Sales Log
          </button>
        </div>
      </div>

      <div className="w-full">
        {view === "log" ? (
          <div className="max-w-xl mx-auto glass p-8 rounded-2xl border-t-2 border-emerald-500/50">
            <h2 className="text-xl font-semibold mb-6">Log New Sale</h2>
            {banner && (
              <div className={`p-4 rounded-lg mb-6 ${banner.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                {banner.message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Bill Num *</label>
                  <input name="billNum" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date *</label>
                  <input name="date" type="date" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Customer Phone *</label>
                <input name="customerPhone" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Customer Name</label>
                <input name="customerName" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Store Suit ID *</label>
                <input name="storeSuitId" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Quantity *</label>
                  <input name="quantity" type="number" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Selling Rate *</label>
                  <input name="rate" type="number" step="0.01" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              
              <button disabled={adding} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                {adding ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                {adding ? "Saving..." : "Log Sale"}
              </button>
            </form>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
