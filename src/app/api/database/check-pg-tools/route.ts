import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Try to execute pg_dump --version to check if it's available
    await execAsync("pg_dump --version");
    return NextResponse.json({ available: true });
  } catch {
    // Ignore the error and just return not available
    return NextResponse.json({ available: false });
  }
}