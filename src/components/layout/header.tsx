import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import ThemeToggle from "@/components/layout/theme-toggle/theme-toggle";
import NewResource from "@/components/shared/new-resource";
import { UserNav } from "@/components/shared/user-nav";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";


export default function Header() {
  return (
    <header className="sticky inset-x-0 top-0 w-full">
      <nav className="flex items-center justify-between px-4 py-2 md:justify-end">
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>
        <div className="flex items-center gap-2">
          <NewResource />
          <ThemeToggle />
          <NotificationBell />
          <UserNav />
        </div>
      </nav>
    </header>
  );
}
