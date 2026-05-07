"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, List, PlusCircle } from "lucide-react";
import { fetchPurchases, Purchase } from "@/services/purchases";
import { fetchVendors } from "@/services/vendors";
import PurchaseForm from "./PurchaseForm";
import PurchaseTable from "./PurchaseTable";
import ColumnToggle from "@/components/ColumnToggle";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"log" | "history">("log");
  const [vendors, setVendors] = useState<{ shop: string }[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "storeSuitId", "invoiceNumber", "vendor", "quantity", "rate", "gst", "discount", "effCostPerPiece", "effCost", "balance"
  ]);

  const purchaseColumns = [
    { key: "storeSuitId", header: "Store ID" },
    { key: "invoiceNumber", header: "Invoice & Date" },
    { key: "vendor", header: "Vendor" },
    { key: "quantity", header: "Qty" },
    { key: "rate", header: "Rate" },
    { key: "gst", header: "GST" },
    { key: "discount", header: "Disc" },
    { key: "effCostPerPiece", header: "Eff Rate" },
    { key: "effCost", header: "Eff Cost" },
    { key: "balance", header: "Bal / Sold" },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [purchasesData, vendorsData] = await Promise.all([
        fetchPurchases(),
        fetchVendors()
      ]);
      setPurchases(purchasesData);
      setVendors(vendorsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
            Stock Purchases
          </h1>
          <p className="text-slate-400 mt-2">Log new inventory purchased from vendors</p>
        </div>

        <div className="flex items-center gap-4">
          {view === "history" && (
            <ColumnToggle 
              columns={purchaseColumns} 
              visibleKeys={visibleColumns} 
              onChange={setVisibleColumns} 
            />
          )}
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
      </div>

      <div className="w-full">
        {view === "log" ? (
          <PurchaseForm vendors={vendors} onSuccess={loadData} />
        ) : (
          <PurchaseTable loading={loading} purchases={purchases} visibleColumns={visibleColumns} />
        )}
      </div>
    </div>
  );
}
