"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, List, PlusCircle } from "lucide-react";
import { fetchCustomers, Customer } from "@/services/customers";
import CustomerForm from "./CustomerForm";
import CustomerTable from "./CustomerTable";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"log" | "history">("log");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            Customer Registry
          </h1>
          <p className="text-slate-400 mt-2">Manage customer records and purchase history value</p>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setView("log")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "log"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Add Customer
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "history"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
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
          <CustomerForm onSuccess={loadCustomers} />
        ) : (
          <CustomerTable loading={loading} customers={customers} />
        )}
      </div>
    </div>
  );
}
