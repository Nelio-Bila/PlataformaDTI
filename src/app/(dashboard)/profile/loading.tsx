// import React from "react";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
// import { Shield, History, Bell, UserIcon } from "lucide-react";

// const ProfileHeaderSkeleton = () => (
//   <div className="space-y-6">
//     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//       <div className="flex items-center space-x-4">
//         <Skeleton className="h-20 w-20 rounded-full" />
//         <div className="space-y-2">
//           <Skeleton className="h-8 w-48" />
//           <Skeleton className="h-5 w-36" />
//         </div>
//       </div>
//       <Skeleton className="h-10 w-32" />
//     </div>
//     <Separator />
//   </div>
// );

// const ProfileOverviewSkeleton = () => (
//   <Card>
//     <CardHeader>
//       <Skeleton className="h-7 w-32 mb-2" />
//       <Skeleton className="h-5 w-48" />
//     </CardHeader>
//     <CardContent className="space-y-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {[1, 2, 3, 4].map((i) => (
//           <div key={i} className="flex items-center space-x-2">
//             <Skeleton className="h-4 w-4" />
//             <Skeleton className="h-5 w-48" />
//           </div>
//         ))}
//       </div>
//     </CardContent>
//   </Card>
// );

// const SecuritySettingsSkeleton = () => (
//   <Card>
//     <CardHeader>
//       <Skeleton className="h-7 w-32 mb-2" />
//       <Skeleton className="h-5 w-48" />
//     </CardHeader>
//     <CardContent className="space-y-4">
//       {[1, 2].map((i) => (
//         <div key={i} className="space-y-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <Skeleton className="h-6 w-48 mb-2" />
//               <Skeleton className="h-4 w-64" />
//             </div>
//             <Skeleton className="h-10 w-24" />
//           </div>
//           <Separator />
//         </div>
//       ))}
//     </CardContent>
//   </Card>
// );

// const NotificationSettingsSkeleton = () => (
//   <Card>
//     <CardHeader>
//       <Skeleton className="h-7 w-32 mb-2" />
//       <Skeleton className="h-5 w-48" />
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-4">
//         {[1, 2, 3].map((i) => (
//           <div key={i} className="flex items-center justify-between">
//             <div className="space-y-2">
//               <Skeleton className="h-5 w-36" />
//               <Skeleton className="h-4 w-48" />
//             </div>
//             <Skeleton className="h-6 w-12" />
//           </div>
//         ))}
//       </div>
//     </CardContent>
//   </Card>
// );

// const ActivityLogSkeleton = () => (
//   <Card>
//     <CardHeader>
//       <Skeleton className="h-7 w-32 mb-2" />
//       <Skeleton className="h-5 w-48" />
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-4">
//         {[1, 2, 3].map((i) => (
//           <div key={i} className="flex justify-between items-center">
//             <div className="space-y-2">
//               <Skeleton className="h-5 w-64" />
//               <Skeleton className="h-4 w-32" />
//             </div>
//             <Skeleton className="h-4 w-4" />
//           </div>
//         ))}
//       </div>
//     </CardContent>
//   </Card>
// );

// const ProfileSkeleton = () => {
//   return (
//     <div className="container mx-auto p-6 max-w-7xl space-y-8">
//       <ProfileHeaderSkeleton />

//       <Tabs defaultValue="overview" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="overview" className="flex items-center gap-2">
//             <UserIcon className="h-4 w-4" />
//             Visão geral
//           </TabsTrigger>
//           <TabsTrigger value="security" className="flex items-center gap-2">
//             <Shield className="h-4 w-4" />
//             Segurança
//           </TabsTrigger>
//           <TabsTrigger
//             value="notifications"
//             className="flex items-center gap-2"
//           >
//             <Bell className="h-4 w-4" />
//             Notificações
//           </TabsTrigger>
//           <TabsTrigger value="activity" className="flex items-center gap-2">
//             <History className="h-4 w-4" />
//             Actividade
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="overview" className="space-y-4">
//           <Card>
//             <CardContent className="p-4">
//               <Skeleton className="h-5 w-full" />
//             </CardContent>
//           </Card>
//           <ProfileOverviewSkeleton />
//         </TabsContent>

//         <TabsContent value="security" className="space-y-4">
//           <SecuritySettingsSkeleton />
//         </TabsContent>

//         <TabsContent value="notifications" className="space-y-4">
//           <NotificationSettingsSkeleton />
//         </TabsContent>

//         <TabsContent value="activity" className="space-y-4">
//           <ActivityLogSkeleton />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default ProfileSkeleton;



import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, UserIcon } from "lucide-react"

const ProfileSkeleton = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            {/* Avatar skeleton */}
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              {/* Name skeleton */}
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
          {/* Edit profile button skeleton */}
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Separator />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Visão geral
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Overview tab content skeleton */}
        <div className="space-y-4">
          {/* Alert skeleton */}
          <Skeleton className="h-12 w-full" />

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" /> {/* Title */}
              <Skeleton className="h-5 w-72" /> {/* Description */}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Name field skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" /> {/* Label */}
                    <Skeleton className="h-5 w-48" /> {/* Value */}
                  </div>

                  {/* Email field skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" /> {/* Label */}
                    <Skeleton className="h-5 w-48" /> {/* Value */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security tab will be hidden by default due to tabs behavior */}
        <div className="hidden">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-[100px]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  )
}

export default ProfileSkeleton