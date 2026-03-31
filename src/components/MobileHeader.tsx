"use client";

import { Menu, Search, Bell } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";

export default function MobileHeader() {
  const { toggleMobile } = useSidebar();

  return (
    <header className="md:hidden sticky top-0 z-30 w-full glass border-b border-slate-700/50 bg-slate-900/80 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleMobile}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-xs">KK</span>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Kapda Karobaar
          </h1>
        </Link>
      </div>
    </header>
  );
}
