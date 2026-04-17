"use client";

import { useState, useRef, useEffect } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { addSale } from "@/services/sales";

interface SaleFormProps {
  customers: { phone: string; name: string }[];
  availableSuitIds: string[];
  onSuccess: () => void;
}

export default function SaleForm({ customers, availableSuitIds, onSuccess }: SaleFormProps) {
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSuitIndex, setActiveSuitIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suitDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (suitDropdownRef.current && !suitDropdownRef.current.contains(event.target as Node)) {
        setActiveSuitIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // New state for multi-item support
  const [billNum, setBillNum] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ storeSuitId: "", quantity: "", rate: "" }]);
  const [gstRate, setGstRate] = useState<0 | 5 | 12>(0);
  const [discountType, setDiscountType] = useState<"percent" | "cash">("percent");
  const [discountValue, setDiscountValue] = useState("0");
  const [discountCash, setDiscountCash] = useState("0"); // Step 3: post-GST cash discount

  const addItem = () => {
    setItems([...items, { storeSuitId: "", quantity: "", rate: "" }]);
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

    // Validate Phone Number (10 digits)
    if (!/^\d{10}$/.test(phoneSearch)) {
      setBanner({ type: "error", message: "Customer phone number must be exactly 10 digits." });
      setAdding(false);
      return;
    }

    setAdding(true);
    setBanner(null);

    // Format date to DD/MM/YYYY
    let formattedDate = date;
    if (date) {
      const d = new Date(date);
      formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    const totalBaseAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    const discVal = Number(discountValue) || 0;
    const finalDiscCash = Number(discountCash) || 0;

    const payload = items.map(item => {
      const q = Number(item.quantity) || 0;
      const r = Number(item.rate) || 0;
      const itemBaseAmount = q * r;
      const itemRatio = totalBaseAmount > 0 ? itemBaseAmount / totalBaseAmount : 1 / items.length;

      // STEP 1: Apply pre-GST discount (% or flat ₹), stored in discountPercentAmount
      let itemStep1Discount = 0;
      if (discountType === "percent") {
        itemStep1Discount = itemBaseAmount * (discVal / 100);
      } else {
        itemStep1Discount = discVal * itemRatio; // split flat ₹ proportionally
      }
      const amountAfterStep1 = itemBaseAmount - itemStep1Discount;

      // STEP 2: GST on post-step1 amount
      const itemGst = amountAfterStep1 * (gstRate / 100);

      // STEP 3: Discount Cash applied after GST, split proportionally
      const itemDiscountCash = finalDiscCash * itemRatio;

      return {
        billNum,
        date: formattedDate,
        customerPhone: phoneSearch,
        customerName: selectedName,
        ...item,
        gst: itemGst.toFixed(2),
        discountPercentAmount: itemStep1Discount.toFixed(2), // pre-GST discount (col H)
        discountCashAmount: itemDiscountCash.toFixed(2),     // post-GST cash discount (col J)
      };
    });

    try {
      await addSale(payload);
      setBanner({ type: "success", message: "Sale logged successfully!" });

      // Reset only item fields and bill num if desired, or full reset
      setBillNum("");
      setPhoneSearch("");
      setSelectedName("");
      setItems([{ storeSuitId: "", quantity: "", rate: "" }]);
      setGstRate(0);
      setDiscountValue("0");
      setDiscountCash("0");

      onSuccess();
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setAdding(false);
    }
  };

  const isExistingCustomer = customers.some(c => c.phone === phoneSearch);

  return (
    <div className="max-w-2xl mx-auto glass p-8 rounded-2xl border-t-2 border-emerald-500/50">
      <h2 className="text-xl font-semibold mb-2">Log New Sale</h2>
      {banner && (
        <div className={`p-4 rounded-lg mb-6 ${banner.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
          {banner.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        {/* Bill Details Section */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-4">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Bill Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Bill Num *</label>
              <input
                value={billNum}
                onChange={(e) => setBillNum(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none [color-scheme:dark] accent-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm text-slate-400 mb-1">Customer Phone *</label>
              <input
                required
                value={phoneSearch}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhoneSearch(val);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                placeholder="10-digit phone..."
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
                    <div className="p-3 text-slate-500 text-sm italic">New customer: &quot;{phoneSearch}&quot;</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Customer Name</label>
              <input
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                readOnly={isExistingCustomer}
                tabIndex={isExistingCustomer ? -1 : 0}
                placeholder={isExistingCustomer ? "" : "Enter name"}
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${isExistingCustomer ? "text-slate-500 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Items</h3>
          </div>

          {items.map((item, index) => (
            <div key={index} className="relative bg-slate-800/20 p-4 rounded-xl border border-slate-700/30 grid grid-cols-12 gap-3 items-end">
              <div className="col-span-4 relative" ref={activeSuitIndex === index ? suitDropdownRef : null}>
                <label className="block text-xs text-slate-500 mb-1">Store Suit ID *</label>
                <input
                  required
                  value={item.storeSuitId}
                  onChange={(e) => {
                    updateItem(index, "storeSuitId", e.target.value);
                    setActiveSuitIndex(index);
                  }}
                  onFocus={() => setActiveSuitIndex(index)}
                  autoComplete="off"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Search Suit ID..."
                />

                {activeSuitIndex === index && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-40 overflow-y-auto glass">
                    {availableSuitIds
                      .filter(id => id.toLowerCase().includes(item.storeSuitId.toLowerCase()))
                      .map((id, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            updateItem(index, "storeSuitId", id);
                            setActiveSuitIndex(null);
                          }}
                          className="p-2 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 text-sm font-medium text-emerald-400"
                        >
                          {id}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-1">Qty *</label>
                <input
                  type="number"
                  required
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-xs text-slate-500 mb-1">Rate per piece *</label>
                <input
                  type="number"
                  step="50"
                  required
                  value={item.rate}
                  onChange={(e) => updateItem(index, "rate", e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="col-span-1 flex justify-center pb-2">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Discount → GST → Discount Cash Section */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <div className="flex flex-wrap items-start gap-8">

            {/* STEP 1 — Discount */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">1</span>
                <label className="text-sm text-slate-400 font-medium">Discount</label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    checked={discountType === "percent"}
                    onChange={() => { setDiscountType("percent"); setDiscountValue("0"); }}
                    className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                  />
                  <span className={`text-sm ${discountType === "percent" ? "text-emerald-400 font-bold" : "text-slate-400"}`}>Percent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    checked={discountType === "cash"}
                    onChange={() => { setDiscountType("cash"); setDiscountValue("0"); }}
                    className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                  />
                  <span className={`text-sm ${discountType === "cash" ? "text-emerald-400 font-bold" : "text-slate-400"}`}>Cash</span>
                </label>
              </div>
              <div className="relative max-w-[140px]">
                {discountType === "cash" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold font-mono">₹</span>}
                <input
                  type="number"
                  min="0"
                  max={discountType === "percent" ? "100" : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0"
                  className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${discountType === "percent" ? "pl-3 pr-7" : "pl-7 pr-3"}`}
                />
                {discountType === "percent" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold font-mono">%</span>}
              </div>
              {discountType === "percent" && Number(discountValue) > 0 && (() => {
                const total = items.reduce((s, it) => s + Number(it.quantity) * Number(it.rate), 0);
                const rupeeDisc = total * (Number(discountValue) / 100);
                return <p className="text-xs text-slate-500 mt-1">≈ <span className="text-emerald-400 font-semibold">₹{rupeeDisc.toFixed(0)}</span></p>;
              })()}
            </div>

            {/* STEP 2 — GST */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">2</span>
                <label className="text-sm text-slate-400 font-medium">GST Rate</label>
              </div>
              <div className="flex items-center gap-4">
                {[0, 5, 12].map((rate) => (
                  <label key={rate} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="saleGstRate"
                      value={rate}
                      checked={gstRate === rate}
                      onChange={() => setGstRate(rate as any)}
                      className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                    />
                    <span className={`text-sm ${gstRate === rate ? "text-emerald-400 font-bold" : "text-slate-400 group-hover:text-slate-300 transition"}`}>
                      {rate}%
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* STEP 3 — Discount Cash (post-GST) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">3</span>
                <label className="text-sm text-slate-400 font-medium">Adjusted Price</label>
              </div>
              <div className="relative max-w-[140px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold font-mono">₹</span>
                <input
                  type="number"
                  min="0"
                  value={discountCash}
                  onChange={(e) => setDiscountCash(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-1.5 pl-7 pr-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-xs text-slate-600">Applied after GST</p>
            </div>
          </div>
        </div>

        <button disabled={adding} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
          {adding ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
          {adding ? "Saving..." : `Log Sale (${items.length} ${items.length === 1 ? 'Item' : 'Items'})`}
        </button>
      </form>
    </div>
  );
}
