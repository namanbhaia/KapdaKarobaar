"use client";

import { useState, useEffect } from "react";
import { Package, IndianRupee, History, TrendingUp, BarChart3, Loader2 } from "lucide-react";

type Purchase = {
  quantity: string;
  rate: string;
  balance: string;
};

type Sale = {
  quantity: string;
  profitPerPiece: string;
};

export default function Home() {
  const [metrics, setMetrics] = useState({
    piecesInStock: 0,
    currentValue: 0,
    totalPurchased: 0,
    totalSpent: 0,
    totalProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchasesRes, salesRes] = await Promise.all([
          fetch("/api/purchases").then(res => res.json()),
          fetch("/api/sales").then(res => res.json())
        ]);

        const purchases: Purchase[] = purchasesRes.purchases || [];
        const sales: Sale[] = salesRes.sales || [];

        const parseCurrency = (val: string) => {
          return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
        };

        const piecesInStock = purchases.reduce((acc, p) => acc + (parseInt(p.balance) || 0), 0);
        const currentValue = purchases.reduce((acc, p) => {
          const bal = parseInt(p.balance) || 0;
          const rate = parseCurrency(p.rate);
          return acc + (bal * rate);
        }, 0);

        const totalPurchased = purchases.reduce((acc, p) => acc + (parseInt(p.quantity) || 0), 0);
        const totalSpent = purchases.reduce((acc, p) => {
          const qty = parseInt(p.quantity) || 0;
          const rate = parseCurrency(p.rate);
          return acc + (qty * rate);
        }, 0);

        const totalProfit = sales.reduce((acc, s) => {
          const qty = parseInt(s.quantity) || 0;
          const ppp = parseCurrency(s.profitPerPiece);
          return acc + (qty * ppp);
        }, 0);

        setMetrics({
          piecesInStock,
          currentValue,
          totalPurchased,
          totalSpent,
          totalProfit
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

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Business <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Overview</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Real-time insights into your inventory, spending, and profitability.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard 
            title="Pieces in Stock" 
            value={metrics.piecesInStock.toLocaleString()} 
            icon={<Package className="w-6 h-6 text-blue-400" />} 
            color="border-blue-500/50"
            subtitle="Current inventory balance"
          />
          <MetricCard 
            title="Inventory Value" 
            value={formatCurrency(metrics.currentValue)} 
            icon={<IndianRupee className="w-6 h-6 text-emerald-400" />} 
            color="border-emerald-500/50"
            subtitle="Value of items currently in stock"
          />
          <MetricCard 
            title="Total Profit" 
            value={formatCurrency(metrics.totalProfit)} 
            icon={<TrendingUp className="w-6 h-6 text-amber-400" />} 
            color="border-amber-500/50"
            subtitle="Cumulative profit from all sales"
          />
          <MetricCard 
            title="Total Purchased" 
            value={metrics.totalPurchased.toLocaleString()} 
            icon={<History className="w-6 h-6 text-purple-400" />} 
            color="border-purple-500/50"
            subtitle="Total pieces ever bought"
          />
          <MetricCard 
            title="Total Investment" 
            value={formatCurrency(metrics.totalSpent)} 
            icon={<BarChart3 className="w-6 h-6 text-rose-400" />} 
            color="border-rose-500/50"
            subtitle="Total amount spent on stock"
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color, subtitle }: { title: string, value: string, icon: React.ReactNode, color: string, subtitle: string }) {
  return (
    <div className={`p-8 rounded-3xl glass border-t-2 ${color} hover:shadow-2xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        <p className="text-slate-400 text-sm font-medium">{subtitle}</p>
      </div>
    </div>
  );
}
