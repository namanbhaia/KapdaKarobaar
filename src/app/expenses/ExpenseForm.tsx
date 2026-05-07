"use client";

import { useState } from "react";
import { CopySlashIcon as Cash, Save, X, Plus, Trash2, Info } from "lucide-react";
import { Expense, submitExpense } from "@/services/expenses";

interface ExpenseFormProps {
  onSuccess: () => void;
}

const CATEGORIES = ["Transport", "Packaging", "Store", "Misc", "Advertisement", "Salary"];
const SPENDERS = ["Shalu", "Sushma"];

const initialExpense: Expense = {
  spender: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  category: "Misc",
  comments: "",
};

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [items, setItems] = useState<Expense[]>([{ ...initialExpense }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleAddItem = () => {
    const lastItem = items[items.length - 1];
    setItems([
      ...items,
      {
        ...initialExpense,
        spender: lastItem?.spender || initialExpense.spender,
        date: lastItem?.date || initialExpense.date,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleChange = (index: number, field: keyof Expense, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out completely empty rows if any
      const validItems = items.filter(
        (item) => item.amount || item.spender
      );

      if (validItems.length === 0) {
        setError("Please enter at least one valid expense.");
        setLoading(false);
        return;
      }

      // Submit all valid items
      const success = await submitExpense(validItems as any);

      if (success) {
        setItems([{ ...initialExpense }]);
        onSuccess();
      } else {
        setError("Failed to save expenses. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructional Banner */}
      <div className="glass p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 transition-all">
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center justify-between text-blue-400 font-medium hover:text-blue-300 transition-colors w-full text-left"
        >
          <span className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            How to Log Expenses
          </span>
          <span className="text-xs border border-blue-400/30 px-2 py-1 rounded-full">{showInstructions ? "Hide" : "Show"}</span>
        </button>
        {showInstructions && (
          <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <li>Enter the spender name and date.</li>
            <li>Select a category and input the amount.</li>
            <li>Provide comments if necessary, then click "Save Expense".</li>
          </ol>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="glass p-6 rounded-2xl border border-slate-700/50 relative group transition-all hover:border-slate-600/50">
              {/* Header section with delete button */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-slate-400">Expense Item #{index + 1}</h4>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

                {/* Spender */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spender</label>
                  <select
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    value={item.spender}
                    onChange={(e) => handleChange(index, "spender", e.target.value)}
                  >
                    <option value="" disabled>Select Spender</option>
                    {SPENDERS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark]"
                    value={item.date}
                    onChange={(e) => handleChange(index, "date", e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    value={item.category}
                    onChange={(e) => handleChange(index, "category", e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    placeholder="0.00"
                    value={item.amount}
                    onChange={(e) => handleChange(index, "amount", e.target.value)}
                  />
                </div>

                {/* Comments */}
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Comments</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="Optional notes..."
                    value={item.comments}
                    onChange={(e) => handleChange(index, "comments", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleAddItem}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <Plus className="w-5 h-5" />
            Add Another Item
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Expenses
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
