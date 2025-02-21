// "use client";

// import { useSession, signOut } from "next-auth/react";
// import { redirect } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { LogOut, Menu, Hospital } from "lucide-react";
// import { useState } from "react";
// import Link from "next/link";
// import { cn } from "@/lib/utils";

// export function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const { data: session, status } = useSession();
//   const [is_sidebar_open, set_is_sidebar_open] = useState(false);

//   if (status === "loading") return <div>Loading...</div>;
//   if (!session) redirect("/auth/sign-in");

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <aside
//         className={cn(
//           "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
//           is_sidebar_open ? "translate-x-0" : "-translate-x-full"
//         )}
//       >
//         <div className="flex items-center justify-between p-4 border-b">
//           <Link href="/dashboard" className="flex items-center gap-2">
//             <Hospital className="h-6 w-6 text-blue-600" />
//             <span className="text-lg font-bold text-gray-800">Hospital IT</span>
//           </Link>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="lg:hidden"
//             onClick={() => set_is_sidebar_open(false)}
//           >
//             <Menu className="h-6 w-6" />
//           </Button>
//         </div>
//         <nav className="p-4 space-y-2">
//           <Link
//             href="/dashboard"
//             className="block p-2 rounded-lg hover:bg-gray-100 text-gray-700"
//           >
//             Dashboard
//           </Link>
//           <Link
//             href="/dashboard/equipment"
//             className="block p-2 rounded-lg hover:bg-gray-100 text-gray-700"
//           >
//             Equipment
//           </Link>
//         </nav>
//       </aside>

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="flex items-center justify-between p-4 bg-white shadow-sm">
//           <Button
//             variant="ghost"
//             size="icon"
//             className="lg:hidden"
//             onClick={() => set_is_sidebar_open(true)}
//           >
//             <Menu className="h-6 w-6" />
//           </Button>
//           <div className="flex items-center gap-4">
//             <span className="text-gray-700">
//               Welcome, {session.user?.name || session.user?.email}
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
//             >
//               <LogOut className="h-4 w-4 mr-2" />
//               Sign Out
//             </Button>
//           </div>
//         </header>
//         <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
//       </div>

//       {is_sidebar_open && (
//         <div
//           className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
//           onClick={() => set_is_sidebar_open(false)}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Hospital,
  LogOut,
  Menu,
  Wrench,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useState } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [is_sidebar_open, set_is_sidebar_open] = useState(true);
    const [sidebar_width, set_sidebar_width] = useState(256);
    const [is_resizing, set_is_resizing] = useState(false);

    const MIN_WIDTH = 80; // Minimum width where only icons show
    const MAX_WIDTH = 400; // Maximum width

    if (status === "loading") return <div>Carregando...</div>;
    if (!session) redirect("/auth/sign-in");

    const handle_resize = (e: React.MouseEvent<HTMLDivElement>) => {
        if (is_resizing) {
            const new_width = e.clientX;
            if (new_width >= MIN_WIDTH && new_width <= MAX_WIDTH) {
                set_sidebar_width(new_width);
            }
        }
    };

    const toggle_sidebar = () => set_is_sidebar_open(!is_sidebar_open);

    const is_minimized = sidebar_width <= MIN_WIDTH;

    return (
        <TooltipProvider>
            <div
                className="flex h-screen bg-gray-100"
                onMouseMove={handle_resize}
                onMouseUp={() => set_is_resizing(false)}
            >
                <aside
                    className={cn(
                        "relative bg-white shadow-md transform transition-all duration-300 ease-in-out",
                        is_sidebar_open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                        "lg:static lg:inset-0"
                    )}
                    style={{ width: is_sidebar_open ? `${sidebar_width}px` : "0px" }}
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Hospital className="h-6 w-6 text-blue-600" />
                            {is_sidebar_open && !is_minimized && (
                                <span className="text-lg font-bold text-gray-800">Hospital TI</span>
                            )}
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggle_sidebar}
                            aria-label={
                                is_sidebar_open ? "Minimizar barra lateral" : "Expandir barra lateral"
                            }
                        >
                            {is_sidebar_open ? (
                                <ChevronLeft className="h-6 w-6" />
                            ) : (
                                <ChevronRight className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                    {is_sidebar_open && (
                        <nav className="p-4 space-y-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="/dashboard"
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-lg text-gray-700",
                                            pathname === "/dashboard"
                                                ? "bg-blue-100 text-blue-600"
                                                : "hover:bg-gray-100"
                                        )}
                                    >
                                        <Home className="h-5 w-5" />
                                        {!is_minimized && <span>Painel</span>}
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>Painel Principal</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="/dashboard/equipment"
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-lg text-gray-700",
                                            pathname === "/dashboard/equipment"
                                                ? "bg-blue-100 text-blue-600"
                                                : "hover:bg-gray-100"
                                        )}
                                    >
                                        <Wrench className="h-5 w-5" />
                                        {!is_minimized && <span>Equipamentos</span>}
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>Gestão de Equipamentos</TooltipContent>
                            </Tooltip>
                        </nav>
                    )}
                    {/* Resizable handle */}
                    {is_sidebar_open && (
                        <div
                            className="absolute top-0 right-0 w-1 h-full bg-gray-300 cursor-col-resize hover:bg-gray-400"
                            onMouseDown={() => set_is_resizing(true)}
                        />
                    )}
                </aside>

                <div
                    className={cn(
                        "flex-1 flex flex-col overflow-hidden",
                        is_sidebar_open ? "lg:ml-0" : "ml-0" // Ensure no overlap when minimized
                    )}
                >
                    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => set_is_sidebar_open(true)}
                            aria-label="Abrir barra lateral"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">
                                Bem-vindo, {session.user?.name || session.user?.email}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sair
                            </Button>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
                </div>

                {is_sidebar_open && (
                    <div
                        className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
                        onClick={() => set_is_sidebar_open(false)}
                    />
                )}
            </div>
        </TooltipProvider>
    );
}