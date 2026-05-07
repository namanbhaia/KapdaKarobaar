"use client";

import { useState, useEffect, useCallback } from "react";
import { Receipt, List, PlusCircle } from "lucide-react";
import { fetchExpenses, Expense } from "@/services/expenses";
import ExpenseForm from "./ExpenseForm";
import ExpenseTable from "./ExpenseTable";
import ColumnToggle from "@/components/ColumnToggle";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"log" | "history">("log");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "date", "spender", "category", "amount", "comments"
  ]);

  const expenseColumns = [
    { key: "date", header: "Date" },
    { key: "spender", header: "Spender" },
    { key: "category", header: "Category" },
    { key: "amount", header: "Amount" },
    { key: "comments", header: "Comments" },
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const expensesData = await fetchExpenses();
      // Reverse to show newest first, assuming date or entry order matters. 
      // If we want exact sheet order, we can omit reverse(). Let's just use what's fetched.
      // Usually, reversing is nice to see latest entries on top.
      setExpenses(expensesData.reverse());
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
            <Receipt className="w-8 h-8 text-emerald-400" />
            Expenses Ledger
          </h1>
          <p className="text-slate-400 mt-2">Log and track business expenses.</p>
        </div>

        <div className="flex items-center gap-4">
          {view === "history" && (
            <ColumnToggle 
              columns={expenseColumns} 
              visibleKeys={visibleColumns} 
              onChange={setVisibleColumns} 
            />
          )}
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
              Log Expense
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
              Expense Log
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        {view === "log" ? (
          <ExpenseForm onSuccess={loadData} />
        ) : (
          <ExpenseTable loading={loading} expenses={expenses} visibleColumns={visibleColumns} />
        )}
      </div>
    </div>
  );
}
