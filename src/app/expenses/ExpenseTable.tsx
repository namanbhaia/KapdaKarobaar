"use client";

import DataTable from "@/components/DataTable";
import { Expense } from "@/services/expenses";
import { CopySlashIcon as Cash } from "lucide-react";

interface ExpenseTableProps {
  loading: boolean;
  expenses: Expense[];
  visibleColumns: string[];
}

export default function ExpenseTable({ loading, expenses, visibleColumns }: ExpenseTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 glass rounded-3xl border border-slate-700/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-20 glass rounded-3xl border border-slate-700/50">
        <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Cash className="w-10 h-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-300 mb-2">No Expenses Logged</h3>
        <p className="text-slate-500">Log a new expense to see it here.</p>
      </div>
    );
  }

  const columns = [
    { key: "date", header: "Date" },
    { key: "spender", header: "Spender" },
    { key: "category", header: "Category" },
    { 
      key: "amount", 
      header: "Amount",
      render: (item: Expense) => <span className="font-mono text-emerald-400 font-medium">₹{item.amount}</span>
    },
    { key: "comments", header: "Comments" },
  ].filter(col => visibleColumns.includes(col.key));

  return (
    <div className="glass rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl">
      <DataTable 
        data={expenses} 
        columns={columns} 
        searchPlaceholder="Search spender, category or comments..." 
        searchKeys={["spender", "category", "comments"]}
      />
    </div>
  );
}
