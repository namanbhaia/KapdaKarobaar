"use client";

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string; // Used for identifying the filter/sort state
  keys?: (keyof T | string)[]; // Actual data keys to sort/filter by (defaults to [key] if not provided)
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
}

export default function DataTable<T>({ 
  data, 
  columns, 
  loading, 
  emptyMessage = "No records found.",
  title 
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null; // Reset to original order
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    return (data || []).filter((item) => {
      return Object.entries(filters).every(([filterKey, filterValue]) => {
        if (!filterValue) return true;
        
        const col = columns.find(c => c.key === filterKey);
        if (!col) return true;

        const dataKeys = col.keys || [col.key];
        return dataKeys.some(k => {
          const itemValue = String((item as any)[k] || '').toLowerCase();
          return itemValue.includes(filterValue.toLowerCase());
        });
      });
    });
  }, [data, filters, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.direction) return filteredData;

    const col = columns.find(c => c.key === sortConfig.key);
    if (!col) return filteredData;

    const sortKey = (col.keys && col.keys[0]) || col.key;

    return [...filteredData].sort((a, b) => {
      let aValue = (a as any)[sortKey];
      let bValue = (b as any)[sortKey];

      const parseVal = (val: any) => {
        if (typeof val === 'string') {
          // Check if it's a numeric string (handle currency symbols and commas)
          const clean = val.replace(/[^0-9.-]+/g, "");
          if (clean !== "" && !isNaN(Number(clean)) && /^[0-9,₹$.\s-]+$/.test(val)) {
            return Number(clean);
          }
          return val.toLowerCase();
        }
        return val;
      };

      const va = parseVal(aValue);
      const vb = parseVal(bValue);

      if (va < vb) return sortConfig.direction === 'asc' ? -1 : 1;
      if (va > vb) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  return (
    <div className="glass p-6 rounded-2xl border-t-2 border-slate-700/50 overflow-hidden flex flex-col h-full">
      {title && <h2 className="text-xl font-semibold mb-6">{title}</h2>}
      <div className="overflow-x-auto overflow-y-auto rounded-xl border border-slate-700 flex-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <table className="w-full text-left text-sm text-slate-300 border-collapse">
          <thead className="bg-slate-800 text-slate-400 sticky top-0 z-20">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key.toString()} 
                  className={`p-4 font-semibold whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key.toString())}
                >
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider text-xs">{col.header}</span>
                    {col.sortable && (
                      <span className="shrink-0">
                        {sortConfig.key === col.key && sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4 text-blue-400" />
                        ) : sortConfig.key === col.key && sortConfig.direction === 'desc' ? (
                          <ChevronDown className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
            {/* Filter Row */}
            <tr className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-[52px] z-10 shadow-sm">
              {columns.map((col) => (
                <td key={`filter-${col.key.toString()}`} className="p-2 px-4">
                  {col.filterable && (
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder={`Filter...`}
                        value={filters[col.key.toString()] || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, [col.key.toString()]: e.target.value }))}
                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all text-slate-200 placeholder:text-slate-600"
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-slate-500 text-xs font-medium tracking-wide">Loading records...</p>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-400 font-medium">{emptyMessage}</p>
                    <p className="text-slate-600 text-xs text-balance max-w-xs">No entries match your current sorting and filtering criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                  {columns.map((col) => (
                    <td key={col.key.toString()} className="p-4 align-top">
                      {col.render ? col.render(item) : (
                        <span className="text-slate-300">{(item as any)[col.key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
