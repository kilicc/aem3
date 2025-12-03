import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleMapsProvider } from "@/components/maps/GoogleMapsProvider";

const inter = Inter({ subsets: ["latin"] });

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
        <GoogleMapsProvider>{children}</GoogleMapsProvider>
      </body>
    </html>
  );
}
