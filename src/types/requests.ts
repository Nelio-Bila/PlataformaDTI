// src/types/requests.ts
import { Direction, Department, Service, Sector, Repartition, User } from "@prisma/client";

export type Request = {
  id: string;
  request_number: string;
  type: "REQUISITION" | "RETURN" | "SUBSTITUTION";
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
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