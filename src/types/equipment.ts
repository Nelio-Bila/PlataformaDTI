// import { User } from "@prisma/client";

// // Type for equipment data
// export interface Equipment {
//     id: string;
//     serial_number: string | null;
//     type: string;
//     brand: string;
//     model: string;
//     purchase_date: string | null; // ISO string or Date
//     warranty_end: string | null;  // ISO string or Date
//     status: string;
//     direction_id: string | null;
//     department_id: string | null;
//     sector_id: string | null;
//     service_id: string | null;
//     repartition_id: string | null;
//     created_at: string; // ISO string or Date
//     updated_at: string; // ISO string or Date
//     images: EquipmentImage[];
//     registeredBy: User;
//     direction?: { name: string; id: string; created_at: Date; updated_at: Date } | null;
//     department?: { name: string; id: string; created_at: Date; updated_at: Date; direction_id: string } | null;
//     sector?: { name: string; id: string; created_at: Date; updated_at: Date; department_id: string } | null;
//     service?: { name: string; id: string; created_at: Date; updated_at: Date; department_id: string | null } | null;
//     repartition?: { name: string; id: string; created_at: Date; updated_at: Date; department_id: string } | null;
// }


// export interface EquipmentImage {
//   id: string;
//   equipment_id: string;
//   url: string;
//   description?: string | null;
//   created_at: string;
// }

//   export interface FilterOptions {
//     types: string[];
//     statuses: string[];
//     directions: { id: string; name: string }[];
//     departments: { id: string; name: string; direction_id: string }[];
//   }



// src/types/equipment.ts
import { Department, Direction, Repartition, Sector, Service, User } from "@prisma/client";

export type Equipment = {
  id: string;
  serial_number: string;
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
  images?: { id: string; equipment_id: string; url: string, description: string }[];
  registered_by_id?: string | null;
  registeredBy?: User | null;
  created_at: string;
  updated_at: string;
  purchase_date?:  string;
  warranty_end?:   string;
};

export type FilterOptions = {
  types: string[];
  statuses: string[];
  directions: Direction[];
  departments: Department[];
};

export type FiltersState = {
  type: string[];
  status: string[];
  direction_id: string[];
  department_id: string[];
};