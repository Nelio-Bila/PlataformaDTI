// import ClientLayout from "@/components/layout/client-layout";
// import { Toaster } from "@/components/ui/toaster";
// import NextTopLoader from "nextjs-toploader";
// import { ReactNode } from "react";
// import "./globals.css";


// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning={true}>
//       <body>
//       <ClientLayout>
//           <NextTopLoader
//               color="#0284C5"
//               crawlSpeed={200}
//               height={5}
//               crawl={true}
//               showSpinner={false}
//               easing="ease"
//               speed={300}
//               shadow="0 0 10px #0284C5,0 0 5px #0284C5"
//             />
//             {children}
//             <Toaster />
//             </ClientLayout>
//       </body>
//     </html>
//   );
// }

import { auth } from "@/auth";
import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const viewport: Viewport = {
  // Optional: Add theme-color for mobile browsers
  themeColor: "#0284C5",
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
      <html lang="pt-PT">
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
        <body
          className={`${poppins.className}`}
          suppressHydrationWarning={true}
        >
          <Providers session={session}>
            <NextTopLoader
              color="#0284C5"
              crawlSpeed={200}
              height={5}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={300}
              shadow="0 0 10px #0284C5,0 0 5px #0284C5"
            />
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
  );
}
