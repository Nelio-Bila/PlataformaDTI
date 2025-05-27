import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";
import os from "os";
import { db } from "@/lib/db"; // Import your Prisma client

const execAsync = promisify(exec);

export async function POST() {
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

    // Get current timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    
    // First try pg_dump approach
    try {
      // Try to check if pg_dump is available
      await execAsync("pg_dump --version");
      
      // If we get here, pg_dump is available, so use the original approach
      return await createPgDumpBackup(timestamp);
    } catch (pgDumpError) {
      console.log("pg_dump not available, using Prisma-based backup",pgDumpError);
      // pg_dump not available, use Prisma-based backup
      return await createPrismaBackup(timestamp);
    }
  } catch (error) {
    console.error("Database backup error:", error);
    return NextResponse.json(
      { error: `Failed to create backup: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// Function to create backup using pg_dump
async function createPgDumpBackup(timestamp: string) {
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

  // Create temporary file path
  const tempDir = os.tmpdir();
  const backupFilePath = path.join(tempDir, `backup-${timestamp}.dump`);

  // Set environment variables for pg_dump
  const env = {
    ...process.env,
    PGPASSWORD: password,
    PGUSER: username,
    PGHOST: host,
    PGPORT: port,
    PGDATABASE: database,
  };

  // Execute pg_dump command
  const { stderr } = await execAsync(
    `pg_dump -Fc -f "${backupFilePath}" ${database}`,
    { env }
  );

  if (stderr && !stderr.includes("warning:")) {
    throw new Error(`pg_dump error: ${stderr}`);
  }

  // Read the backup file
  const backupData = fs.readFileSync(backupFilePath);

  // Clean up the temporary file
  fs.unlinkSync(backupFilePath);

  // Return the backup file as a response
  return new NextResponse(backupData, {
    headers: {
      "Content-Disposition": `attachment; filename="it-tracker-backup-${timestamp}.dump"`,
      "Content-Type": "application/octet-stream",
    },
  });
}

// Function to create backup using Prisma queries
async function createPrismaBackup(timestamp: string) {
  // Fetch all data from the database using Prisma
  const data: Record<string, any> = {};
  
  // Get the list of models from your Prisma client
  // This is a simplified approach - you'll need to add all your models
  const models = [
    'User', 'Equipment', 'Department', 'Direction', 
    'Service', 'Sector', 'Repartition', 'Request'
  ];
  
  // Fetch data for each model
  for (const model of models) {
    try {
      // @ts-expect-error - dynamically accessing Prisma models
      data[model] = await db[model.toLowerCase()].findMany();
    } catch (error) {
      console.error(`Error fetching ${model} data:`, error);
    }
  }
  
  // Create JSON backup
  const jsonBackup = JSON.stringify(data, null, 2);
  
  // Create temporary file
  const tempDir = os.tmpdir();
  const backupFilePath = path.join(tempDir, `backup-${timestamp}.json`);
  fs.writeFileSync(backupFilePath, jsonBackup);
  
  // Read the backup file
  const backupData = fs.readFileSync(backupFilePath);
  
  // Clean up the temporary file
  fs.unlinkSync(backupFilePath);
  
  // Return the JSON backup file
  return new NextResponse(backupData, {
    headers: {
      "Content-Disposition": `attachment; filename="it-tracker-backup-${timestamp}.json"`,
      "Content-Type": "application/json",
    },
  });
}