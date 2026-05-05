"use client";

import { useState, useRef, useEffect } from "react";
import { Settings2, Check, X } from "lucide-react";

interface ColumnToggleProps {
  columns: { key: string; header: string }[];
  visibleKeys: string[];
  onChange: (keys: string[]) => void;
}

export default function ColumnToggle({ columns, visibleKeys, onChange }: ColumnToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (key: string) => {
    if (visibleKeys.includes(key)) {
      if (visibleKeys.length > 1) {
        onChange(visibleKeys.filter(k => k !== key));
      }
    } else {
      onChange([...visibleKeys, key]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
          isOpen 
            ? "bg-slate-700 border-slate-600 text-white" 
            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200"
        }`}
      >
        <Settings2 className="w-4 h-4" />
        Columns
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2 border-b border-slate-700 mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Show / Hide</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            {columns.map((col) => (
              <button
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm"
              >
                <span className={visibleKeys.includes(col.key) ? "text-slate-200" : "text-slate-500"}>
                  {col.header}
                </span>
                {visibleKeys.includes(col.key) && (
                  <Check className="w-4 h-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
