import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import IPGuard from '@/components/IPGuard';

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Table2Kitchen",
  description: "Food Court Ordering System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <IPGuard>
          <CartProvider>
            {children}
          </CartProvider>
        </IPGuard>
      </body>
    </html>
  );
}
