// src/app/layout.tsx
import { auth } from "@/auth";
import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { IdleTimeout } from "@/components/IdleTimeout";

export const viewport: Viewport = {
  // Optional: Add theme-color for mobile browsers
  themeColor: "#005DB2",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | DTI",
    default: "Início",
  },
  description:
    "Sistema de gestão do parque Informático do Hospital Central de Maputo",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-48x48.png"
          sizes="48x48"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${poppins.className} min-h-full`}>
        <Providers session={session}>
          <NextTopLoader color="#005DB2"
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={300}
            shadow="0 0 10px #005DB2,0 0 5px #005DB2" />
          <IdleTimeout />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}