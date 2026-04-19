"use client";

import { useState, useEffect } from "react";
import { Package, IndianRupee, History, TrendingUp, BarChart3, Loader2, Wallet } from "lucide-react";
import { fetchPurchases } from "@/services/purchases";
import { fetchSales } from "@/services/sales";
import { useUserLevel } from "@/hooks/useUserLevel";

export default function Home() {
  const { isPrivileged, userLevel, loading: authLoading } = useUserLevel();
  const [metrics, setMetrics] = useState({
    piecesInStock: 0,
    currentValue: 0,
    totalPurchased: 0,
    totalSpent: 0,
    totalProfit: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchases, sales] = await Promise.all([
          fetchPurchases(),
          fetchSales()
        ]);

        const parseCurrency = (val: string) => {
          return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
        };

        const piecesInStock = purchases.reduce((acc, p) => acc + (parseCurrency(p.balance)), 0);
        const currentValue = purchases.reduce((acc, p) => {
          const bal = parseCurrency(p.balance);
          const effCostPc = parseCurrency(p.effCostPerPiece);
          return acc + (bal * effCostPc);
        }, 0);

        const totalPurchased = purchases.reduce((acc, p) => acc + (parseCurrency(p.quantity)), 0);
        const totalSpent = purchases.reduce((acc, p) => {
          return acc + parseCurrency(p.effCost);
        }, 0);

        const totalProfit = sales.reduce((acc, s) => {
          const qty = parseCurrency(s.quantity);
          const ppp = parseCurrency(s.profitPerPiece);
          return acc + (qty * ppp);
        }, 0);

        const totalSales = sales.reduce((acc, s) => {
          return acc + parseCurrency(s.total);
        }, 0);

        setMetrics({
          piecesInStock,
          currentValue,
          totalPurchased,
          totalSpent,
          totalProfit,
          totalSales
        });
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const showFinancials = isPrivileged;

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 md:mb-4">
          Business <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Overview</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl">
          Real-time insights into your inventory, spending, and profitability.
        </p>
      </header>

      {loading || authLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <MetricCard 
            title="Pieces in Stock" 
            value={metrics.piecesInStock.toLocaleString()} 
            icon={<Package className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />} 
            color="border-blue-500/50"
            subtitle="Current inventory balance"
          />
          
          {showFinancials && (
            <>
              <MetricCard 
                title="Inventory Value" 
                value={formatCurrency(metrics.currentValue)} 
                icon={<IndianRupee className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />} 
                color="border-emerald-500/50"
                subtitle="Items in stock"
              />
              <MetricCard 
                title="Total Profit" 
                value={formatCurrency(metrics.totalProfit)} 
                icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />} 
                color="border-amber-500/50"
                subtitle="Cumulative profit"
              />
              <MetricCard 
                title="Total Purchased" 
                value={metrics.totalPurchased.toLocaleString()} 
                icon={<History className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />} 
                color="border-purple-500/50"
                subtitle="Total pieces bought"
              />
              <MetricCard 
                title="Total Investment" 
                value={formatCurrency(metrics.totalSpent)} 
                icon={<BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-rose-400" />} 
                color="border-rose-500/50"
                subtitle="Total amount spent"
              />
            </>
          )}

          {(userLevel === 3 || userLevel === 4) && (
            <MetricCard 
              title="Total Sales" 
              value={formatCurrency(metrics.totalSales)} 
              icon={<Wallet className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-400" />} 
              color="border-fuchsia-500/50"
              subtitle="All time sales amount"
            />
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color, subtitle }: { title: string, value: string, icon: React.ReactNode, color: string, subtitle: string }) {
  return (
    <div className={`p-5 md:p-8 rounded-2xl md:rounded-3xl glass border-t-2 ${color} hover:shadow-2xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="p-2 md:p-3 bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-700">
          {icon}
        </div>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{value}</h3>
        <p className="text-slate-400 text-xs md:text-sm font-medium">{subtitle}</p>
      </div>
    </div>
  );
}
