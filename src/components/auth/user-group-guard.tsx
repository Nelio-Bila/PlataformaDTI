// src/components/auth/user-group-guard.tsx
"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface UserGroupGuardProps {
  children: ReactNode;
  allowedGroups: string[];
  fallback?: ReactNode;
}

export default function UserGroupGuard({
  children,
  allowedGroups,
  fallback = null,
}: UserGroupGuardProps) {
  const { data: session, status } = useSession();

  // If session is loading or no session/user, show fallback
  if (status === "loading" || !session || !session.user) {
    return fallback;
  }

  // Check if user belongs to any allowed group
  const userGroups = session.user.groups || [];
  const hasRequiredGroup = userGroups.some(group => 
    allowedGroups.includes(group.name)
  );

  if (!hasRequiredGroup) {
    return fallback;
  }

  return <>{children}</>;
}