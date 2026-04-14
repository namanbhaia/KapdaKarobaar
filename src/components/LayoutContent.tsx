"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { SidebarProvider } from "@/components/SidebarContext";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return (
      <div className="w-full min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <MobileHeader />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
