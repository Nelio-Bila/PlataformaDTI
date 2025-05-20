import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Try to execute pg_dump --version to check if it's available
    await execAsync("pg_dump --version");
    return NextResponse.json({ available: true });
  } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */e) {
    return NextResponse.json({ available: false });
  }
}