"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { addVendor, Vendor } from "@/services/vendors";

interface VendorFormProps {
  onSuccess: () => void;
}

export default function VendorForm({ onSuccess }: VendorFormProps) {
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setBanner(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries()) as Partial<Vendor>;

    // Format date to DD/MM/YYYY
    if (payload.firstVisit) {
      const d = new Date(payload.firstVisit as string);
      payload.firstVisit = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    try {
      await addVendor(payload);
      setBanner({ type: "success", message: "Vendor added successfully!" });
      form.reset();
      onSuccess();
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto glass p-8 rounded-2xl border-t-2 border-indigo-500/50">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        Add New Vendor
      </h2>
      {banner && (
        <div className={`p-4 rounded-lg mb-6 ${banner.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
          {banner.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Shop Name *</label>
          <input name="shop" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Owner Name *</label>
          <input name="owner" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
          <input name="number" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Address</label>
          <textarea name="address" rows={2} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">First Visit (Date)</label>
            <input 
              name="firstVisit" 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">GST Number</label>
            <input name="gstNumber" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Comments</label>
          <textarea name="comments" rows={2} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"></textarea>
        </div>
        
        <button disabled={adding} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
          {adding ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
          {adding ? "Saving..." : "Save Vendor"}
        </button>
      </form>
    </div>
  );
}
