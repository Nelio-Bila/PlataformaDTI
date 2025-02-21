// Type for equipment data
export interface Equipment {
    id: string;
    serial_number: string | null;
    type: string;
    brand: string;
    model: string;
    purchase_date: string | null; // ISO string or Date
    warranty_end: string | null;  // ISO string or Date
    status: string;
    direction_id: string | null;
    department_id: string | null;
    sector_id: string | null;
    service_id: string | null;
    repartition_id: string | null;
    created_at: string; // ISO string or Date
    updated_at: string; // ISO string or Date
    direction?: { name: string; id: string; created_at: Date; updated_at: Date } | null;
    department?: { name: string; id: string; created_at: Date; updated_at: Date; direction_id: string } | null;
    sector?: { name: string; id: string; created_at: Date; updated_at: Date; department_id: string } | null;
    service?: { name: string; id: string; created_at: Date; updated_at: Date; department_id: string | null } | null;
    repartition?: { name: string; id: string; created_at: Date; updated_at: Date; department_id: string } | null;
}