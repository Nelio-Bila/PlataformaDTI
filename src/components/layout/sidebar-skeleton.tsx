// src/components/layout/sidebar-skeleton.tsx
"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export default function SidebarSkeleton() {
  const { isMinimized } = useSidebar();

  return (
    <aside
      className={cn(
        "relative hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block",
        !isMinimized ? "w-72" : "w-[72px]"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Placeholder */}
        <div className="hidden p-5 pt-10 lg:block text-center">
          <div className="flex justify-center">
            <div className="h-[100px] w-[100px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Toggle Button Placeholder */}
        <ChevronLeft
          className={cn(
            "absolute -right-3 top-10 z-50 rounded-full border bg-background text-3xl text-gray-300 dark:text-gray-600",
            isMinimized && "rotate-180"
          )}
        />

        {/* Navigation Items Placeholder */}
        <div className="flex-grow space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="mt-3 space-y-2">
              {/* Simulate 4 nav items (based on navItems length) */}
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 rounded-md py-2",
                    !isMinimized ? "px-3" : "px-3"
                  )}
                >
                  <div className="ml-3 h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  {!isMinimized && (
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}