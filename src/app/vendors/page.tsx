"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, List, PlusCircle, Lock } from "lucide-react";
import { fetchVendors, Vendor } from "@/services/vendors";
import VendorForm from "./VendorForm";
import VendorTable from "./VendorTable";
import ColumnToggle from "@/components/ColumnToggle";
import { useUserLevel } from "@/hooks/useUserLevel";

export default function VendorsPage() {
  const { isPrivileged, loading: authLoading } = useUserLevel();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"log" | "history">("log");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "shop", "owner", "number", "pcsBought", "money", "pcsRemain", "profitAllTime"
  ]);

  const vendorColumns = [
    { key: "shop", header: "Shop" },
    { key: "owner", header: "Owner" },
    { key: "number", header: "Contact" },
    { key: "pcsBought", header: "Bought" },
    { key: "money", header: "Purch Value" },
    { key: "pcsRemain", header: "Remain" },
    { key: "profitAllTime", header: "Profit" },
  ];

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVendors();
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isPrivileged) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
          <Lock className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 max-w-md">
          You do not have the required permissions to view Vendor management tools. 
          Please contact your administrator for Level 3 access.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-400" />
            Vendor Management
          </h1>
          <p className="text-slate-400 mt-2">Manage shop suppliers and their details</p>
        </div>

        <div className="flex items-center gap-4">
          {view === "history" && (
            <ColumnToggle 
              columns={vendorColumns} 
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
      </div>

      <div className="w-full">
        {view === "log" ? (
          <VendorForm onSuccess={loadVendors} />
        ) : (
          <VendorTable loading={loading} vendors={vendors} visibleColumns={visibleColumns} />
        )}
      </div>
    </div>
  );
}
