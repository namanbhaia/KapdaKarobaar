"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Save, Loader2, List, PlusCircle } from "lucide-react";

type Purchase = {
  invoiceNumber: string;
  vendorSuitId: string;
  storeSuitId: string;
  quantity: string;
  rate: string;
  vendor: string;
  date: string;
  buyer: string;
  design: string;
  cost: string;
  sold: string;
  balance: string;
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [view, setView] = useState<"log" | "history">("log");

  useEffect(() => {
    fetch("/api/purchases")
      .then((res) => res.json())
      .then((data) => {
        setPurchases(data.purchases || []);
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
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add purchase");
      
      setBanner({ type: "success", message: "Purchase logged successfully!" });
      form.reset();
      
      const updated = await fetch("/api/purchases").then(r => r.json());
      setPurchases(updated.purchases || []);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
            Stock Purchases
          </h1>
          <p className="text-slate-400 mt-2">Log new inventory purchased from vendors</p>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setView("log")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "log"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Log Purchase
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "history"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <List className="w-4 h-4" />
            Inventory Ledger
          </button>
        </div>
      </div>

      <div className="w-full">
        {view === "log" ? (
          <div className="max-w-2xl mx-auto glass p-8 rounded-2xl border-t-2 border-indigo-500/50">
            <h2 className="text-xl font-semibold mb-6">Log New Purchase</h2>
            {banner && (
              <div className={`p-4 rounded-lg mb-6 ${banner.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                {banner.message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Invoice Num *</label>
                  <input name="invoiceNumber" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date *</label>
                  <input name="date" type="date" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Vendor Name *</label>
                <input name="vendor" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Vendor Suit ID</label>
                  <input name="vendorSuitId" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Store Suit ID *</label>
                  <input name="storeSuitId" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Quantity *</label>
                  <input name="quantity" type="number" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rate (₹) *</label>
                  <input name="rate" type="number" step="0.01" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Buyer</label>
                  <input name="buyer" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Design</label>
                  <input name="design" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              
              <button disabled={adding} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                {adding ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                {adding ? "Saving..." : "Log Purchase"}
              </button>
            </form>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
