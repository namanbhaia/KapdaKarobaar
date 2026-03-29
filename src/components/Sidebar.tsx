"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Vendors", href: "/vendors" },
  { name: "Purchases", href: "/purchases" },
  { name: "Customers", href: "/customers" },
  { name: "Sales", href: "/sales" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass border-r bg-slate-800/50 hidden md:flex flex-col h-screen sticky top-0">
      <Link href="/" className="p-6 border-b border-slate-700 hover:bg-slate-800/5 transition-colors group">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-indigo-300 transition-all">
          Kapda Karobaar
        </h1>
      </Link>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block p-3 rounded-lg transition-colors font-medium ${
                isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
