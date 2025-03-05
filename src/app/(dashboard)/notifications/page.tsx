// src/app/notifications/page.tsx
import { NotificationList } from "@/components/notifications/notification-list";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";

const breadcrumbItems = [
  { title: "Dashboard", link: "/dashboard" },
  { title: "Notifications", link: "/notifications" },
];

export default function NotificationsPage() {
  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-2xl font-bold my-3">Notifications</h1>
        <NotificationList />
      </div>
    </PageContainer>
  );
}