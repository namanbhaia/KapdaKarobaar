"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, RefreshCw } from "lucide-react";
import { addPurchase, Purchase } from "@/services/purchases";

interface PurchaseFormProps {
  vendors: { shop: string }[];
  onSuccess: () => void;
}

export default function PurchaseForm({ vendors, onSuccess }: PurchaseFormProps) {
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [nextStoreSuitId, setNextStoreSuitId] = useState("");
  const [loadingId, setLoadingId] = useState(false);

  const fetchNextSuitId = async () => {
    setLoadingId(true);
    try {
      const res = await fetch("/api/purchases/next-suit-id");
      if (res.ok) {
        const data = await res.json();
        setNextStoreSuitId(data.nextSuitId || "");
      }
    } catch (err) {
      console.error("Failed to fetch next store suit ID", err);
    } finally {
      setLoadingId(false);
    }
  };

  useEffect(() => {
    fetchNextSuitId();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setBanner(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries()) as Partial<Purchase>;

    // Format date to DD/MM/YYYY
    if (payload.date) {
      const d = new Date(payload.date as string);
      payload.date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    try {
      await addPurchase(payload);
      setBanner({ type: "success", message: "Purchase logged successfully!" });
      
      // Selectively reset fields for multi-log workflow
      const fieldsToReset = ["vendorSuitId", "quantity", "rate", "design"];
      fieldsToReset.forEach(name => {
        const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
        if (input) input.value = "";
      });
      // Re-fetch the next Store Suit ID so it auto-advances
      await fetchNextSuitId();
      
      onSuccess();
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  return (
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
            <input 
              name="date" 
              type="date" 
              required 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Vendor Name *</label>
          <select 
            name="vendor" 
            required 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
          >
            <option value="" disabled selected>Select a vendor</option>
            {vendors.filter(v => v.shop.trim() !== "").map((v, i) => (
              <option key={i} value={v.shop} className="bg-slate-900">
                {v.shop}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Vendor Suit ID</label>
            <input name="vendorSuitId" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
              Store Suit ID *
              <button
                type="button"
                onClick={fetchNextSuitId}
                disabled={loadingId}
                title="Refresh next ID"
                className="text-slate-500 hover:text-blue-400 transition disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingId ? "animate-spin" : ""}`} />
              </button>
            </label>
            <input
              name="storeSuitId"
              required
              value={nextStoreSuitId}
              onChange={e => setNextStoreSuitId(e.target.value)}
              placeholder={loadingId ? "Loading..." : "e.g. S001"}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
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
  );
}
