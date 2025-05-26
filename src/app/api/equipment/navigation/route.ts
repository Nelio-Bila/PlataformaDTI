import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentId = searchParams.get("id");
  
  if (!currentId) {
    return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
  }

  try {
    // Get all equipment IDs ordered by creation date (or any other field you prefer)
    const equipments = await db.equipment.findMany({
      select: { id: true },
      orderBy: { created_at: 'asc' },
    });
    
    const equipmentIds = equipments.map(e => e.id);
    const currentIndex = equipmentIds.indexOf(currentId);
    
    if (currentIndex === -1) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
    }
    
    const previousId = currentIndex > 0 ? equipmentIds[currentIndex - 1] : null;
    const nextId = currentIndex < equipmentIds.length - 1 ? equipmentIds[currentIndex + 1] : null;
    
    return NextResponse.json({
      previous: previousId,
      next: nextId,
      total: equipmentIds.length,
      current: currentIndex + 1  // 1-based position
    });
  } catch (error) {
    console.error("Error fetching equipment navigation:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment navigation" }, 
      { status: 500 }
    );
  }
}