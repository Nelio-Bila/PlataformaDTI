// src/types/requests.ts
import { Department, Direction, Repartition, Sector, Service, User } from "@prisma/client";

export type RequestType = "REQUISITION" | "RETURN" | "SUBSTITUTION";
export type StatusKey = "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Request = {
  id: string;
  request_number: string;
  type: RequestType;
  status: StatusKey;
  requester_id?: string | null;
  requester_name?: string | null;
  requester?: User | null;
  requester_direction?: Direction | null;
  requester_department?: Department | null;
  requester_service?: Service | null;
  requester_sector?: Sector | null;
  requester_repartition?: Repartition | null;
  destination_direction?: Direction | null;
  destination_department?: Department | null;
  destination_service?: Service | null;
  destination_sector?: Sector | null;
  destination_repartition?: Repartition | null;
  items: RequestItem[];
  created_at: string;
  updated_at: string;
  approved_by?: string | null;
  approver?: User | null;
  comments?: string | null;
};

export type RequestItem = {
  id: string;
  request_id: string;
  description: string;
  quantity: number;
  unit?: string | null;
  created_at: string;
  updated_at: string;
};

export type FilterOptions = {
  requestTypes: string[];
  requestStatuses: string[];
  directions: Direction[];
  departments: Department[];
};

export type FiltersState = {
  type: string[];
  status: string[];
  requester_direction_id: string[];
  requester_department_id: string[];
};





export const statusTranslations: Record<StatusKey, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  IN_PROGRESS: "Em Progresso",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const typeTranslations: Record<RequestType, string> = {
  REQUISITION: "Requisição",
  RETURN: "Devolução",
  SUBSTITUTION: "Substituição",
};

export const statusColors: Record<StatusKey, string> = {
  PENDING: "#3B82F6",
  APPROVED: "#10B981",
  REJECTED: "#EF4444",
  IN_PROGRESS: "#8B5CF6",
  COMPLETED: "#059669",
  CANCELLED: "#6B7280",
};

export const formatStatus = (status: string): string => {
  return statusTranslations[status as StatusKey] || status;
};

export const formatRequestType = (type: string): string => {
  return typeTranslations[type as RequestType] || type;
};

