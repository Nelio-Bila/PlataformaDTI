"use client";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { navItems } from "@/constants/data";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn} from "@/lib/utils";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();

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
              alt="Logotipo do Instituto Nacional de Estatistica"
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
              <DashboardNav items={navItems} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
