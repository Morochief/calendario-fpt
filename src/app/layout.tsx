import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calendario 2026 | Federación Paraguaya de Tiro",
  description: "Calendario oficial de competiciones de la Federación Paraguaya de Tiro - Convocatoria 2026",
  keywords: "tiro deportivo, Paraguay, IPSC, Long Range, competiciones, calendario",
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
        {children}
      </body>
    </html>
  );
}
