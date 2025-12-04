import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleMapsProvider } from "@/components/maps/GoogleMapsProvider";
import { Suspense } from "react";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Font loading optimization
  preload: true,
});

export const metadata: Metadata = {
  title: "Saha İş Takip Sistemi",
  description: "Depo, Envanter ve İş Emri Yönetim Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleMapsProvider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            {children}
          </Suspense>
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
