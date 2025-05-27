import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";
import os from "os";
import { db } from "@/lib/db";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin group membership
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user belongs to Admins group
    const userGroups = session.user.groups || [];
    const isAdmin = userGroups.some(group => group.name === "Admins");
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse DATABASE_URL to extract connection details
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
    }

    // Extract connection parameters from DATABASE_URL
    const url = new URL(dbUrl);
    const host = url.hostname;
    const port = url.port || "5432";
    const database = url.pathname.substring(1);
    const username = url.username;
    const password = url.password;

    // Get form data with uploaded file
    const formData = await req.formData();
    const backupFile = formData.get("backup") as File;
    
    if (!backupFile) {
      return NextResponse.json({ error: "No backup file provided" }, { status: 400 });
    }

    // Create temporary file path
    const tempDir = os.tmpdir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uploadPath = path.join(tempDir, `upload-${timestamp}.dump`);

    // Write uploaded file to temporary location
    const buffer = Buffer.from(await backupFile.arrayBuffer());
    fs.writeFileSync(uploadPath, buffer);

    // Disconnect Prisma to free up database connections
    await db.$disconnect();

    // Set environment variables for pg_restore
    const env = {
      ...process.env,
      PGPASSWORD: password,
      PGUSER: username,
      PGHOST: host,
      PGPORT: port,
      PGDATABASE: database,
    };

    // Execute pg_restore command
    // Drop and recreate all objects
    const { stderr } = await execAsync(
      `pg_restore --clean --if-exists --no-owner --no-privileges -d ${database} "${uploadPath}"`,
      { env }
    );

    if (stderr && !stderr.includes("warning:") && !stderr.includes("NOTICE:")) {
      throw new Error(`pg_restore error: ${stderr}`);
    }

    // Clean up the temporary file
    fs.unlinkSync(uploadPath);

    return NextResponse.json({ 
      success: true, 
      message: "Database restored successfully" 
    });
  } catch (error) {
    console.error("Database restore error:", error);
    return NextResponse.json(
      { error: `Failed to restore database: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}