// src/app/requests/view-guest/page.tsx
import { db } from "@/lib/db";

export default async function ViewGuestRequest({ searchParams }: { searchParams: { ref: string } }) {
  const request = await db.request.findFirst({
    where: { request_number: searchParams.ref },
    include: { items: true, requester_department: true, destination_department: true },
  });

  if (!request) {
    return <div>Requisição não encontrada</div>;
  }

  return (
    <div className="p-6">
      <h1>Requisição: {request.request_number}</h1>
      <p>Status: {request.status}</p>
      {/* Add more details */}
    </div>
  );
}