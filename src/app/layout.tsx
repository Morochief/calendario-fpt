import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import Watermark from "@/components/Watermark";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import AutoLogout from "@/components/AutoLogout";
import { SerwistProvider } from "@serwist/next/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://calendario-fpdt.vercel.app"),
  title: "Calendario 2026 | Federación Paraguaya de Tiro",
  description: "Calendario oficial de competiciones de la Federación Paraguaya de Tiro - 2026",
  keywords: "tiro práctico, Paraguay, IPSC, competiciones, calendario, FPT",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Calendario FPT",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
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
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
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
      <head>
        <meta name="theme-color" content="#1E3A8A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Calendario FPT" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="sr-only">
          Saltar al contenido principal
        </a>
        <Watermark />
        <SerwistProvider>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ToastProvider>
              <AutoLogout />
              {children}
              <SpeedInsights />
              <Analytics />
            </ToastProvider>
          </div>
        </SerwistProvider>
      </body>
    </html>
  );
}
