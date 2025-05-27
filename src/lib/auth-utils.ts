import { Session } from "next-auth";
import { NextResponse } from "next/server";

/**
 * Checks if the user is authenticated and belongs to the Admins group.
 * @param session The user session
 * @returns NextResponse with error if not authorized, null if authorized
 */
export function checkAdminPermission(session: Session | null) {
  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user belongs to Admins group
  const userGroups = session.user.groups || [];
  const isAdmin = userGroups.some(group => group.name === "Admins");
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }
  
  // If all checks pass, return null (authorized)
  return null;
}