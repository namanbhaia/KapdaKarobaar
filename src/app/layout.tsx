import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { SidebarProvider } from "@/components/SidebarContext";

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
        <SidebarProvider>
          <Sidebar />
          
          <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            <MobileHeader />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
