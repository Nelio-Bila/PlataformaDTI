import React from "react";
import ThemeToggle from "@/components/layout/theme-toggle/theme-toggle";

export default function AuthHeader() {
  return (
    <header className="flex h-14 items-center justify-end gap-4 px-4 lg:h-[60px] lg:px-6">
      <ThemeToggle />
    </header>
  );
}
