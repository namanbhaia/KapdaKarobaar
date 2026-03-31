"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, List, PlusCircle } from "lucide-react";
import { fetchVendors, Vendor } from "@/services/vendors";
import VendorForm from "./VendorForm";
import VendorTable from "./VendorTable";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"log" | "history">("log");

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
          <VendorForm onSuccess={loadVendors} />
        ) : (
          <VendorTable loading={loading} vendors={vendors} />
        )}
      </div>
    </div>
  );
}
