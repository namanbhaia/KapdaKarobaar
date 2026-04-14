"use client";

import { usePathname } from "next/navigation";
import { 
  Users, 
  ShoppingBag, 
  UserSquare2, 
  Banknote, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Shield
} from "lucide-react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/auth/actions";
import { User } from "@supabase/supabase-js";

const topNavItem = { name: "Sales", href: "/sales", icon: Banknote };
const bottomNavItems = [
  { name: "Vendors", href: "/vendors", icon: Users },
  { name: "Purchases", href: "/purchases", icon: ShoppingBag },
  { name: "Customers", href: "/customers", icon: UserSquare2 },
];

import { useUserLevel } from "@/hooks/useUserLevel";

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleSidebar, toggleMobile, setIsMobileOpen } = useSidebar();
  const { user, userLevel, isPrivileged, loading } = useUserLevel();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const renderNavItem = (item: any) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative
          ${isActive
            ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
          }
          ${isCollapsed ? "md:justify-center" : ""}
        `}
        title={isCollapsed ? item.name : ""}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-400" : "group-hover:text-blue-400 transition-colors"}`} />
        <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
          {item.name}
        </span>
        
        {isCollapsed && (
          <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-100 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 z-50 whitespace-nowrap">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen glass border-r bg-slate-900/80 transition-all duration-300 ease-in-out flex flex-col 
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 min-h-[73px]">
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
              <span className="font-bold text-white">KK</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap opacity-100 transition-opacity">
                Kapda Karobaar
              </h1>
            )}
            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-100 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 z-50 whitespace-nowrap">
                Dashboard
              </div>
            )}
          </Link>
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>

          <button 
            onClick={toggleMobile}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <X />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Top aligned items */}
          <div className="space-y-2">
            {renderNavItem(topNavItem)}
          </div>


          {/* Spacer to push remaining items to bottom */}
          <div className="flex-1" />


          {/* Bottom aligned items (Privileged) */}
          {isPrivileged && (
            <div className="space-y-2">
              <div className={`px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isCollapsed ? "hidden" : "block"}`}>
                Management
              </div>
              {bottomNavItems.map(renderNavItem)}
            </div>
          )}
        </nav>

        {/* User Profile Widget */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="relative">
            {showProfileMenu && (
              <div className={`absolute bottom-full mb-2 left-0 w-full glass border border-slate-700 rounded-xl p-2 shadow-2xl animate-in slide-in-from-bottom-2 ${isCollapsed ? "md:w-48" : ""}`}>
                {Number(userLevel) >= 4 && (
                  <Link
                    href="/admin/users"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-3 p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm font-medium mb-1"
                  >
                    <Shield className="w-4 h-4" />
                    <span>User Management</span>
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200
                ${showProfileMenu ? "bg-slate-800" : "hover:bg-slate-800/50"}
                ${isCollapsed ? "md:justify-center" : ""}
              `}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-lg relative">
                <UserIcon className="w-5 h-5" />
                {/* Level Badge on Avatar */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-900 border-2 border-slate-900 rounded-full flex items-center justify-center text-[8px] font-bold">
                  {userLevel}
                </div>
              </div>
              {!isCollapsed && user && (
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">
                      {user.user_metadata?.display_name || user.email?.split('@')[0]}
                    </p>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[8px] font-black text-amber-500 border border-amber-500/20 uppercase tracking-tighter">
                      Lvl {userLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>



  );
}
