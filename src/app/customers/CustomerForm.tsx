"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { addCustomer, Customer } from "@/services/customers";

interface CustomerFormProps {
  onSuccess: () => void;
}

export default function CustomerForm({ onSuccess }: CustomerFormProps) {
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries()) as Partial<Customer>;

    // Validate Phone Number (10 digits)
    if (!/^\d{10}$/.test(payload.phone || "")) {
      setBanner({ type: "error", message: "Phone number must be exactly 10 digits." });
      return;
    }

    setAdding(true);
    setBanner(null);
    try {
      await addCustomer(payload);
      setBanner({ type: "success", message: "Customer registered successfully!" });
      form.reset();
      onSuccess();
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto glass p-8 rounded-2xl border-t-2 border-purple-500/50">
      <h2 className="text-xl font-semibold mb-6">Register Customer</h2>
      {banner && (
        <div className={`p-4 rounded-lg mb-6 ${banner.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
          {banner.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Phone Number *</label>
          <input 
            name="phone" 
            required 
            type="tel"
            pattern="\d{10}"
            title="10-digit phone number"
            maxLength={10}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '');
            }}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" 
          />
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
  );
}
