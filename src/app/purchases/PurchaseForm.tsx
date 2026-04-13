"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, RefreshCw, Plus, Trash2 } from "lucide-react";
import { addPurchase, Purchase } from "@/services/purchases";

interface PurchaseFormProps {
  vendors: { shop: string }[];
  onSuccess: () => void;
}

export default function PurchaseForm({ vendors, onSuccess }: PurchaseFormProps) {
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loadingId, setLoadingId] = useState(false);
  
  // Common fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState("");
  const [buyer, setBuyer] = useState("");
  const [gstType, setGstType] = useState<"5%" | "12%" | "custom">("custom");
  const [customGstValue, setCustomGstValue] = useState("0");
  const [totalDiscount, setTotalDiscount] = useState("0");

  // Items state
  const [items, setItems] = useState([{ 
    vendorSuitId: "", 
    storeSuitId: "", 
    quantity: "", 
    rate: "", 
    design: "" 
  }]);

  const fetchNextIdForFirstItem = async () => {
    setLoadingId(true);
    try {
      const res = await fetch("/api/purchases/next-suit-id");
      if (res.ok) {
        const data = await res.json();
        const nextId = data.nextSuitId || "";
        setItems(prev => {
          const newItems = [...prev];
          if (newItems.length > 0) newItems[0].storeSuitId = nextId;
          return newItems;
        });
      }
    } catch (err) {
      console.error("Failed to fetch next store suit ID", err);
    } finally {
      setLoadingId(false);
    }
  };

  useEffect(() => {
    fetchNextIdForFirstItem();
  }, []);

  const getNextSequentialId = (currentId: string) => {
    const match = currentId.match(/^S(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return `S${String(num + 1).padStart(3, "0")}`;
    }
    return "";
  };

  const addItem = () => {
    const lastId = items[items.length - 1].storeSuitId;
    const nextId = getNextSequentialId(lastId);
    setItems([...items, { 
      vendorSuitId: "", 
      storeSuitId: nextId, 
      quantity: "", 
      rate: "", 
      design: "" 
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setBanner(null);

    // Format date to DD/MM/YYYY
    let formattedDate = date;
    if (date) {
      const d = new Date(date);
      formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    const totalBaseCost = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    
    let totalGst = 0;
    if (gstType === "5%") totalGst = totalBaseCost * 0.05;
    else if (gstType === "12%") totalGst = totalBaseCost * 0.12;
    else totalGst = Number(customGstValue) || 0;

    const discountValue = Math.max(0, Number(totalDiscount) || 0);

    const payload = items.map(item => {
      const itemBaseCost = Number(item.quantity) * Number(item.rate);
      const ratio = totalBaseCost > 0 ? itemBaseCost / totalBaseCost : 1 / items.length;
      
      return {
        invoiceNumber,
        date: formattedDate,
        vendor,
        buyer,
        ...item,
        gst: (totalGst * ratio).toFixed(2),
        discount: (discountValue * ratio).toFixed(2),
      };
    });

    try {
      await addPurchase(payload);
      setBanner({ type: "success", message: "Purchase logged successfully!" });
      
      // Full reset or partial reset
      setInvoiceNumber("");
      setItems([{ 
        vendorSuitId: "", 
        storeSuitId: "", 
        quantity: "", 
        rate: "", 
        design: "" 
      }]);
      setGstType("custom");
      setCustomGstValue("0");
      setTotalDiscount("0");
      await fetchNextIdForFirstItem();
      
      onSuccess();
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto glass p-8 rounded-2xl border-t-2 border-indigo-500/50">
      <h2 className="text-xl font-semibold mb-6">Log New Purchase</h2>
      {banner && (
        <div className={`p-4 rounded-lg mb-6 ${banner.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
          {banner.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        {/* Invoice Details Section */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-4">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Invoice Num *</label>
              <input 
                required 
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date *</label>
              <input 
                type="date" 
                required 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Vendor Name *</label>
              <select 
                required 
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a vendor</option>
                {vendors.filter(v => v.shop.trim() !== "").map((v, i) => (
                  <option key={i} value={v.shop} className="bg-slate-900">
                    {v.shop}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Buyer</label>
              <input 
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-700/30">
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm text-slate-400 font-medium">GST Configuration</label>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                  {["5%", "12%", "custom"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="gstType"
                        value={type}
                        checked={gstType === type}
                        onChange={() => setGstType(type as any)}
                        className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${gstType === type ? "text-blue-400 font-bold" : "text-slate-400 group-hover:text-slate-300 transition"}`}>
                        {type === "custom" ? "Custom" : type}
                      </span>
                    </label>
                  ))}
                </div>
                {gstType === "custom" && (
                  <div className="relative animate-in fade-in slide-in-from-left-2 duration-300 max-w-[140px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold font-mono">₹</span>
                    <input
                      type="number"
                      value={customGstValue}
                      onChange={(e) => setCustomGstValue(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="Amount"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-1.5 pl-7 pr-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm text-slate-400 font-medium">Total Discount</label>
              <div className="relative max-w-[150px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold font-mono">₹</span>
                <input
                  type="number"
                  min="0"
                  value={totalDiscount}
                  onChange={(e) => setTotalDiscount(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-1.5 pl-7 pr-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Items</h3>
            <button 
              type="button" 
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="relative bg-slate-800/20 p-4 rounded-xl border border-slate-700/30 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-500 uppercase font-bold tracking-widest">Item #{index + 1}</span>
                {items.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Vendor Suit ID</label>
                  <input 
                    value={item.vendorSuitId}
                    onChange={(e) => updateItem(index, "vendorSuitId", e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1 flex items-center justify-between">
                    Store Suit ID *
                    {index === 0 && (
                      <button
                        type="button"
                        onClick={fetchNextIdForFirstItem}
                        disabled={loadingId}
                        className="text-slate-500 hover:text-blue-400 transition disabled:opacity-40"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${loadingId ? "animate-spin" : ""}`} />
                      </button>
                    )}
                  </label>
                  <input
                    required
                    value={item.storeSuitId}
                    onChange={(e) => updateItem(index, "storeSuitId", e.target.value)}
                    placeholder="e.g. S001"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Quantity *</label>
                  <input 
                    type="number" 
                    required 
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rate (₹) *</label>
                  <input 
                    type="number" 
                    step="1" 
                    required 
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Design</label>
                  <input 
                    value={item.design}
                    onChange={(e) => updateItem(index, "design", e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button disabled={adding} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
          {adding ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
          {adding ? "Saving..." : `Log Purchase (${items.length} ${items.length === 1 ? 'Item' : 'Items'})`}
        </button>
      </form>
    </div>
  );
}
