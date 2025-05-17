"use client";

import { Icons } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false,
}: DashboardNavProps) {
  const { isMinimized } = useSidebar();
  const currentPath = usePathname().split("?")[0]; // Get current path without query params

  if (!items?.length) {
    return null;
  }

  const isRouteActive = (itemRoute: string): boolean => {
    const prefix = "/dashboard/";
    if (currentPath.startsWith(prefix) && itemRoute.startsWith(prefix)) {
      return (
        currentPath === itemRoute ||
        currentPath.startsWith(`${itemRoute.replace(prefix, "")}/`)
      );
    }
    return currentPath === itemRoute || currentPath.startsWith(`${itemRoute}/`);
  };

  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        {items.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          const isActive = isRouteActive(item.href as string);

          return (
            item.href && (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.disabled ? "/" : item.href}
                    className={cn(
                      "flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-primary hover:text-white",
                      isActive ? "bg-primary" : "transparent",
                      item.disabled && "cursor-not-allowed opacity-80",
                    )}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                  >
                    <Icon
                      className={`ml-3 size-5 flex-none ${isActive ? "text-white" : ""}`}
                    />
                    {isMobileNav || (!isMinimized && !isMobileNav) ? (
                      <span
                        className={`mr-2 truncate ${isActive ? "text-white" : ""}`}
                      >
                        {item.title}
                      </span>
                    ) : (
                      ""
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="right"
                  sideOffset={8}
                  className={!isMinimized ? "hidden" : "inline-block"}
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            )
          );
        })}
      </TooltipProvider>
    </nav>
  );
}