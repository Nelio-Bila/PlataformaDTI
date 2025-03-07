// import { Breadcrumbs } from "@/components/layout/breadcrumbs";
// import { RequestDetails } from "@/components/requests/request-details";
// import type { Metadata } from "next";

// export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
//     const { id } = await params;

//     return {
//         title: `Detalhes da Requisição #${id}`,
//         description: "Detalhes de uma solicitação específica",
//     };
// }

// const breadcrumbItems = [
//     { title: "Painel", link: "/dashboard" },
//     { title: "Requisições", link: "/requests" },
//     { title: "Detalhes da Requisição", link: "" }, // Dynamic link could be added if needed
// ];

// export default function RequestDetailsPage({ params }: { params: { id: string } }) {
//     return (
//         <div className="p-6 w-full">
//             <Breadcrumbs items={breadcrumbItems} />
//             <h1 className="text-2xl font-bold text-center my-3">Detalhes da Requisição</h1>
//             <RequestDetails requestId={params.id} />
//         </div>
//     );
// }





import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RequestDetails } from "@/components/requests/request-details";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Dados de Requisição",
        description: "Detalhes de uma requisição",
    };
}

const breadcrumbItems = [
    { title: "Painel", link: "/dashboard" },
    { title: "Requisições", link: "/requests" },
    { title: "Detalhes da Requisição" },
];
export default async function RequestDetailsPage({ params }: { params: { id: string } }) {

    const { id } = await params;
    const request_id = id;

    const request = await db.request.findFirst({
        where: { id: request_id },
        include: {
            items: true,
            requester_department: true,
            destination_department: true,
            requester: { select: { name: true } },
            approver: { select: { name: true } },
        },
    });

    if (!request) {
        return <div>Requisição não encontrada</div>;
    }

    // Transform the data to match the RequestDetailsData interface
    const requestData = {
        id: request.id,
        request_number: request.request_number,
        type: request.type,
        status: request.status,
        created_at: request.created_at.toISOString(),
        updated_at: request.updated_at.toISOString(),
        requester: request.requester,
        requester_department: request.requester_department,
        destination_department: request.destination_department,
        items: request.items,
        comments: request.comments,
        approved_by: request.approved_by,
        approver: request.approver,
    };

    return (
        <div className="p-6 w-full">
            <Breadcrumbs items={breadcrumbItems} />
            <RequestDetails requestData={requestData} />
        </div>
    );
}