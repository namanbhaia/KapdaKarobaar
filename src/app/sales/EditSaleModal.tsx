"use client";

import { useState } from "react";
import { Save, Loader2, X } from "lucide-react";
import { updateSale, Sale } from "@/services/sales";

interface EditSaleModalProps {
  sale: Sale;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSaleModal({ sale, onClose, onSuccess }: EditSaleModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    billNum: sale.billNum,
    date: sale.date.split('/').reverse().join('-'), // DD/MM/YYYY to YYYY-MM-DD
    customerPhone: sale.customerPhone,
    customerName: sale.customerName,
    storeSuitId: sale.storeSuitId,
    rate: sale.rate.replace(/[^0-9.]/g, ""),
    quantity: sale.quantity,
    discountPercentAmount: sale.discountPercentAmount.replace(/[^0-9.]/g, ""),
    gst: sale.gst.replace(/[^0-9.]/g, ""),
    discountCashAmount: sale.discountCashAmount.replace(/[^0-9.]/g, ""),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const d = new Date(formData.date);
    const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    try {
      await updateSale({
        ...sale,
        ...formData,
        date: formattedDate,
        rate: `₹${formData.rate}`,
        discountPercentAmount: `₹${formData.discountPercentAmount}`,
        gst: `₹${formData.gst}`,
        discountCashAmount: `₹${formData.discountCashAmount}`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Edit Sale Record</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Bill Num</label>
              <input
                required
                name="billNum"
                value={formData.billNum}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date</label>
              <input
                type="date"
                required
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Customer Phone</label>
              <input
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Customer Name</label>
              <input
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Store Suit ID</label>
              <input
                required
                name="storeSuitId"
                value={formData.storeSuitId}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quantity</label>
              <input
                type="number"
                required
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rate (₹)</label>
              <input
                type="number"
                required
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Disc % (₹)</label>
              <input
                type="number"
                name="discountPercentAmount"
                value={formData.discountPercentAmount}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">GST (₹)</label>
              <input
                type="number"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Disc Cash (₹)</label>
              <input
                type="number"
                name="discountCashAmount"
                value={formData.discountCashAmount}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Update Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
