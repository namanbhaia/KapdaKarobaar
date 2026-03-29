"use client";

import { useState, useEffect } from "react";
import { UserPlus, Save, Loader2, List, PlusCircle } from "lucide-react";

type Vendor = {
  shop: string;
  owner: string;
  number: string;
  address: string;
  firstVisit: string;
  gstNumber: string;
  comments: string;
  pcsBought: string;
  money: string;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [view, setView] = useState<"log" | "history">("log");

  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => {
        setVendors(data.vendors || []);
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

    // Format date to DD/MM/YYYY
    if (payload.firstVisit) {
      const d = new Date(payload.firstVisit as string);
      payload.firstVisit = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add vendor");
      
      setBanner({ type: "success", message: "Vendor added successfully!" });
      form.reset();
      
      // refresh list
      const updated = await fetch("/api/vendors").then(r => r.json());
      setVendors(updated.vendors || []);
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-400" />
            Vendor Management
          </h1>
          <p className="text-slate-400 mt-2">Manage shop suppliers and their details</p>
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
            Add Vendor
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
            Directory
          </button>
        </div>
      </div>

      <div className="w-full">
        {view === "log" ? (
          <div className="max-w-xl mx-auto glass p-8 rounded-2xl border-t-2 border-indigo-500/50">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              Add New Vendor
            </h2>
            {banner && (
              <div className={`p-4 rounded-lg mb-6 ${banner.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                {banner.message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
        ) : (
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
        )}
      </div>
    </div>
  );
}
