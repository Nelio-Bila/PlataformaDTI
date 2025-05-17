"use client";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import SidebarSkeleton from "@/components/layout/sidebar-skeleton";
import { navItems } from "@/constants/data";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const { data: session, status } = useSession();

  // Wait for session to load
  if (status === "loading") {
     return <SidebarSkeleton />;
  }

  // Get user's groups 
  const userGroups = session?.user?.groups || [];
  const isAdmin = userGroups.some(group => group.name === "Admins");
  const isTechnician = userGroups.some(group => group.name === "Department: Tecnologias de Informação");

  // Filter navItems based on group membership
  const filteredNavItems = navItems.filter(item => {
    if (item.title === "Utilizadores") {
      return isAdmin; // Only Admins see Users
    }
    if (item.title === "Equipamento Informático") {
      return isAdmin || isTechnician; // Admins and Technicians see Equipment
    }
    return true; // Other items (Dashboard, Requests) are visible to all
  });

  return (
    <aside
      className={cn(
        `relative hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block`,
        !isMinimized ? "w-72" : "w-[72px]",
        className,
      )}
    >
      <div className="flex flex-col h-full">
        <div className="hidden p-5 pt-10 lg:block text-center">
          <Link
            href={"/"}
            className="flex justify-center content-center text-center"
          >
            <Image
              src="/logo.png"
              width={100}
              height={100}
              alt="Logotipo do HCM"
            />
          </Link>
        </div>
        <ChevronLeft
          className={cn(
            "absolute -right-3 top-10 z-50 cursor-pointer rounded-full border bg-background text-3xl text-foreground",
            isMinimized && "rotate-180",
          )}
          onClick={toggle}
        />
        <div className="flex-grow space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="mt-3 space-y-1">
              <DashboardNav items={filteredNavItems} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}