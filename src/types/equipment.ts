// src/types/equipment.ts
import { equipment_schema } from "@/schemas/equipment";
import { Department, Direction, Repartition, Sector, Service, User } from "@prisma/client";
import { z } from "zod";

export type EquipmentImage = {
  id: string;
  url: string;
  cloudinary_public_id: string | null;
  equipment_id: string;
  description?: string | null;
  created_at: string;
};

export type Equipment = {
  id: string;
  serial_number: string | null;
  type: string;
  brand: string;
  model: string;
  status: string;
  direction_id?: string | null;
  department_id?: string | null;
  service_id?: string | null;
  sector_id?: string | null;
  repartition_id?: string | null;
  direction?: Direction | null;
  department?: Department | null;
  service?: Service | null;
  sector?: Sector | null;
  repartition?: Repartition | null;
  images?: EquipmentImage[];
  registered_by_id?: string | null;
  registeredBy?: User | null;
  created_at: string;
  updated_at: string;
  purchase_date?: string;
  warranty_end?: string;
  observations?: string; 
  extra_fields?: Record<string, string>;
};

export type FilterOptions = {
  types: string[];
  statuses: string[];
  directions: Direction[];
  departments: Department[];
  users: { id: string; name: string | null }[];
};

export type FiltersState = {
  type: string[];
  status: string[];
  direction_id: string[];
  department_id: string[];
  registered_by: string[]; 
};

export const typeOptions = [
  { value: "MOUSE", label: "Mouse" },
  { value: "KEYBOARD", label: "Teclado" },
  { value: "LAPTOP", label: "Laptop" },
  { value: "PRINTER", label: "Impressora" },
  { value: "SWITCH", label: "Switch" },
  { value: "MONITOR", label: "Monitor" },
  { value: "PC", label: "Computador (PC)" },
  { value: "PROJECTOR", label: "Projetor (Data Show)" },
  { value: "SPEAKERS", label: "Caixas de Som" },
  { value: "CAMERA", label: "Câmera" },
  { value: "ROUTER", label: "Roteador" },
  { value: "UPS", label: "Nobreak (UPS)" },
  { value: "OTHER", label: "Outro" },
] as const;

export const statusOptions = [
  { value: "ACTIVO", label: "Activo" },
  { value: "MANUTENÇÃO", label: "Manutenção" },
  { value: "INACTIVO", label: "Inactivo" },
] as const;


export type EquipmentFormData = z.infer<typeof equipment_schema>;

export interface EquipmentUpdateFormProps {
  equipmentId: string;
}


export interface KeyValuePair {
  key: string;
  value: string;
}