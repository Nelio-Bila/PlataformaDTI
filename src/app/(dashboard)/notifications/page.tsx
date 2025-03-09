// src/app/notifications/page.tsx
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { NotificationList } from "@/components/notifications/notification-list";

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Notificações", link: "/notifications" },
];

export default function NotificationsPage() {
  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-2xl font-bold my-3">Notificações</h1>
        <NotificationList />
      </div>
    </PageContainer>
  );
}