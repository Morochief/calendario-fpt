import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import Watermark from "@/components/Watermark";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import AutoLogout from "@/components/AutoLogout";

export const metadata: Metadata = {
  metadataBase: new URL("https://calendario-fpdt.vercel.app"),
  title: "Calendario 2026 | Federación Paraguaya de Tiro",
  description: "Calendario oficial de competiciones de la Federación Paraguaya de Tiro - 2026",
  keywords: "tiro práctico, Paraguay, IPSC, competiciones, calendario, FPT",
  openGraph: {
    title: "Calendario 2026 | Federación Paraguaya de Tiro",
    description: "Calendario oficial de competiciones de la Federación Paraguaya de Tiro - 2026",
    url: "https://calendario-fpdt.vercel.app",
    siteName: "Federación Paraguaya de Tiro",
    images: [
      {
        url: "/LOGO FPDT.png",
        width: 800,
        height: 600,
        alt: "Federación Paraguaya de Tiro",
      },
    ],
    locale: "es_PY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendario 2026 | Federación Paraguaya de Tiro",
    description: "Calendario oficial de competiciones de la Federación Paraguaya de Tiro - 2026",
    images: ["/LOGO FPDT.png"],
  },
  icons: {
    icon: "/LOGO_FPDT-removebg-preview.svg",
    shortcut: "/LOGO_FPDT-removebg-preview.svg",
    apple: "/LOGO_FPDT-removebg-preview.svg",
  },
};

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <a href="#main-content" className="sr-only">
          Saltar al contenido principal
        </a>
        <Watermark />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ToastProvider>
            <AutoLogout />
            {children}
            <SpeedInsights />
            <Analytics />
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
