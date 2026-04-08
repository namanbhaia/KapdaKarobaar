"use client";

import { useState, useEffect, useCallback } from "react";
import { CopySlashIcon as Cash, List, PlusCircle } from "lucide-react";
import { fetchSales, Sale } from "@/services/sales";
import { fetchCustomers } from "@/services/customers";
import { fetchPurchases } from "@/services/purchases";
import SaleForm from "./SaleForm";
import SaleTable from "./SaleTable";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"log" | "history">("log");
  const [customers, setCustomers] = useState<{ phone: string, name: string }[]>([]);
  const [availableSuitIds, setAvailableSuitIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesData, customersData, purchasesData] = await Promise.all([
        fetchSales(),
        fetchCustomers(),
        fetchPurchases()
      ]);
      setSales(salesData);
      setCustomers(customersData);
      
      // Extract unique storeSuitIds from purchases
      const suitIds = Array.from(new Set(purchasesData.map(p => p.storeSuitId).filter(id => id.trim() !== ""))).sort();
      setAvailableSuitIds(suitIds);
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
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
            <Cash className="w-8 h-8 text-emerald-400" />
            Sales Ledger
          </h1>
          <p className="text-slate-400 mt-2">Log customer sales and track profits.</p>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setView("log")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "log"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Log Sale
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "history"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <List className="w-4 h-4" />
            Sales Log
          </button>
        </div>
      </div>

      <div className="w-full">
        {view === "log" ? (
          <SaleForm 
            customers={customers} 
            availableSuitIds={availableSuitIds} 
            onSuccess={loadData} 
          />
        ) : (
          <SaleTable loading={loading} sales={sales} />
        )}
      </div>
    </div>
  );
}
