import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Calendario 2026 | Federación Paraguaya de Tiro",
  description: "Calendario oficial de competiciones de la Federación Paraguaya de Tiro - 2026",
  keywords: "tiro práctico, Paraguay, IPSC, competiciones, calendario, FPT",
  icons: {
    icon: "/logo fpdt.svg",
    shortcut: "/logo fpdt.svg",
    apple: "/logo fpdt.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <a href="#main-content" className="sr-only">
          Saltar al contenido principal
        </a>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
