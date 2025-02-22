// src/app/(dashboard)/layout.tsx
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | DTI",
    default: "inicio",
  },
  description:
    "Sistema de gestão do parque Informático do Hospital Central de Maputo",
};

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex h-screen">
//       <Sidebar />
//       <main className="flex-1 flex flex-col">
//         <Header />
//         <ScrollArea className="flex-1">
//           <div className="p-6">{children}</div>
//         </ScrollArea>
//       </main>
//     </div>
//   );
// }

// src/app/(dashboard)/layout.tsx
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0"> {/* Added min-w-0 */}
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}