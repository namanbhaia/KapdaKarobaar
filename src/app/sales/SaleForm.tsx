"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { addSale, Sale } from "@/services/sales";

interface SaleFormProps {
  customers: { phone: string; name: string }[];
  onSuccess: () => void;
}

export default function SaleForm({ customers, onSuccess }: SaleFormProps) {
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setBanner(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries()) as Partial<Sale>;

    // Format date to DD/MM/YYYY
    if (payload.date) {
      const d = new Date(payload.date as string);
      payload.date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    try {
      await addSale(payload);
      setBanner({ type: "success", message: "Sale logged successfully!" });
      
      // Selectively reset fields for multi-log workflow
      const fieldsToReset = ["storeSuitId", "quantity", "rate"];
      fieldsToReset.forEach(name => {
        const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
        if (input) input.value = "";
      });
      
      onSuccess();
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  const isExistingCustomer = customers.some(c => c.phone === phoneSearch);

  return (
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
            <input 
              name="date" 
              type="date" 
              required 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm text-slate-400 mb-1">Customer Phone *</label>
          <input 
            name="customerPhone" 
            required 
            value={phoneSearch}
            onChange={(e) => {
              setPhoneSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
            placeholder="Search by phone number..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
          />
          
          {showDropdown && phoneSearch.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto glass">
              {customers
                .filter(c => c.phone.includes(phoneSearch))
                .map((c, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setPhoneSearch(c.phone);
                      setSelectedName(c.name);
                      setShowDropdown(false);
                    }}
                    className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 text-sm"
                  >
                    <span className="font-bold text-emerald-400">{c.phone}</span>
                    <span className="text-slate-400 ml-2">- {c.name}</span>
                  </div>
                ))}
              {customers.filter(c => c.phone.includes(phoneSearch)).length === 0 && (
                <div className="p-3 text-slate-500 text-sm italic">New customer: "{phoneSearch}"</div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Customer Name</label>
          <input 
            name="customerName" 
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            readOnly={isExistingCustomer}
            tabIndex={isExistingCustomer ? -1 : 0}
            placeholder={isExistingCustomer ? "" : "Enter name for new customer"}
            className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${isExistingCustomer ? "text-slate-500 cursor-not-allowed" : ""}`} 
          />
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
  );
}
