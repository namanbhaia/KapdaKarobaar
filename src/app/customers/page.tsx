"use client";

import { useState, useEffect } from "react";
import { Users, Save, Loader2 } from "lucide-react";

type Customer = {
  phone: string;
  name: string;
  purchaseValue: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers || []);
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
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to register customer");
      
      setBanner({ type: "success", message: "Customer registered successfully!" });
      form.reset();
      
      const updated = await fetch("/api/customers").then(r => r.json());
      setCustomers(updated.customers || []);
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            Customer Registry
          </h1>
          <p className="text-slate-400 mt-2">Manage customer records and purchase history value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl border-t-2 border-purple-500/50 h-fit">
          <h2 className="text-xl font-semibold mb-6">Register Customer</h2>
          {banner && (
            <div className={`p-4 rounded-lg mb-6 ${banner.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
              {banner.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Phone Number *</label>
              <input name="phone" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
              <input name="name" required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>
            
            <button disabled={adding} type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
              {adding ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              {adding ? "Saving..." : "Register Customer"}
            </button>
          </form>
        </div>

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
      </div>
    </div>
  );
}
