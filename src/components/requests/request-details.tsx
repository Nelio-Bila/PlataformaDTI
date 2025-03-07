// src/components/requests/request-details.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
    AlertCircle,
    Calendar,
    Clock,
    FileText,
    MapPin,
    Package,
    User,
} from "lucide-react";

interface RequestDetailsData {
    id: string;
    request_number: string;
    type: string;
    status: string;
    created_at: string;
    updated_at: string;
    requester: { name: string | null } | null;
    requester_department: { name: string | null } | null;
    destination_department: { name: string | null } | null;
    items: Array<{
        id: string;
        description: string;
        quantity: number;
        unit: string | null;
    }>;
    comments: string | null;
    approved_by: string | null;
    approver: { name: string | null } | null;
}

// Status color mapping (consistent with dashboard)
const statusColors = {
    PENDING: "#3B82F6", // Blue
    APPROVED: "#10B981", // Green
    REJECTED: "#EF4444", // Red
    IN_PROGRESS: "#8B5CF6", // Purple
    COMPLETED: "#059669", // Emerald
    CANCELLED: "#6B7280", // Gray
};

// Helper function to format status
const formatStatus = (status: string) => {
    return status.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};

// Helper function to format request type
const formatRequestType = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
};

export function RequestDetails({ requestData }: { requestData: RequestDetailsData }) {
    const request = requestData;

    return (
        <div className="space-y-6">
            {/* Request Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">
                        Requisição #{request.request_number}
                    </h2>
                    <Badge
                        style={{ backgroundColor: statusColors[request.status as keyof typeof statusColors] }}
                        className="mt-1"
                    >
                        {formatStatus(request.status)}
                    </Badge>
                </div>
            </div>

            {/* Request Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Informações Básicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>Tipo: {formatRequestType(request.type)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Solicitante: {request.requester?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>De: {request.requester_department?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>Para: {request.destination_department?.name || "N/A"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Datas e Aprovação
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Criado em: {format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Actualizado em: {format(new Date(request.updated_at), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                        {request.approved_by && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Aprovado por: {request.approver?.name || "N/A"}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Request Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Itens da Requisição
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {request.items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Descrição</th>
                                        <th className="text-left p-2">Quantidade</th>
                                        <th className="text-left p-2">Unidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {request.items.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-muted/50">
                                            <td className="p-2">{item.description}</td>
                                            <td className="p-2">{item.quantity}</td>
                                            <td className="p-2">{item.unit || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Nenhum item encontrado para esta solicitação.</p>
                    )}
                </CardContent>
            </Card>

            {/* Comments */}
            {request.comments && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Comentários
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">{request.comments}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}