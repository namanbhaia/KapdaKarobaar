import type { Metadata } from "next";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";

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
      <body className="min-h-screen bg-slate-900 text-slate-50 relative font-sans">
        <LayoutContent>
          {children}
        </LayoutContent>
      </body>
    </html>
  );
}
