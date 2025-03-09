import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const requestId = id;

        const request = await db.request.findUnique({
            where: { id: requestId },
            include: {
                requester: { select: { name: true } },
                requester_department: { select: { name: true } },
                destination_department: { select: { name: true } },
                items: {
                    select: {
                        id: true,
                        description: true,
                        quantity: true,
                        unit: true,
                    },
                },
                approver: { select: { name: true } },
            },
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Authorization check: User must be requester, approver, or have access to departments
        const userGroups = await db.userGroup.findMany({
            where: { user_id: session.user.id },
            include: { group: true },
        });
        const isAdmin = userGroups.some(ug => ug.group.name === "Admins");
        const userDepartmentIds = userGroups
            .filter(ug => ug.group.name.startsWith("Department:"))
            .map(ug => ug.group.name.replace("Department: ", ""))
            .map(name => request.requester_department?.name === name || request.destination_department?.name === name);

        if (
            !isAdmin &&
            request.requester_id !== session.user.id &&
            request.approved_by !== session.user.id &&
            !userDepartmentIds.some(Boolean)
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(request, { status: 200 });
    } catch (error) {
        console.error("Error fetching request details:", error);
        return NextResponse.json({ error: "Failed to fetch request details" }, { status: 500 });
    }
}