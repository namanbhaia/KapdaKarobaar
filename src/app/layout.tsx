import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kapda Karobaar",
  description: "Inventory Management for Kapda Karobaar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-50 relative flex font-sans">
        {/* Sidebar placeholder - will be extracted to a component later */}
        <aside className="w-64 glass border-r bg-slate-800/50 hidden md:flex flex-col h-screen sticky top-0">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Kapda Karobaar
            </h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="/" className="block p-3 rounded-lg bg-blue-600/20 text-blue-400 font-medium hover:bg-blue-600/30 transition-colors">Dashboard</a>
            <a href="/vendors" className="block p-3 rounded-lg hover:bg-slate-800 transition-colors">Vendors</a>
            <a href="/purchases" className="block p-3 rounded-lg hover:bg-slate-800 transition-colors">Purchases</a>
            <a href="/customers" className="block p-3 rounded-lg hover:bg-slate-800 transition-colors">Customers</a>
            <a href="/sales" className="block p-3 rounded-lg hover:bg-slate-800 transition-colors">Sales</a>
          </nav>
        </aside>
        
        <main className="flex-1 flex flex-col min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
