import { z } from "zod";

// export const equipment_schema = z.object({
//   serial_number: z.string().min(1, { message: "Número de série é obrigatório" }),
//   type: z.string().min(1, { message: "Tipo é obrigatório" }),
//   brand: z.string().min(1, { message: "Marca é obrigatória" }),
//   model: z.string().min(1, { message: "Modelo é obrigatório" }),
//   purchase_date: z.string().optional(),
//   warranty_end: z.string().optional(),
//   status: z.enum(["ACTIVO", "MANUTENÇÃO", "INACTIVO"], {
//     required_error: "Status é obrigatório",
//   }),
//   direction_id: z.string().optional(),
//   department_id: z.string().optional(),
//   sector_id: z.string().optional(),
//   service_id: z.string().optional(),
//   repartition_id: z.string().optional(),
//   observations: z.string().optional(),
//   extra_fields: z
//     .string()
//     .optional()
//     .refine(
//       (val) => {
//         if (!val) return true;
//         try {
//           JSON.parse(val);
//           return true;
//         } catch {
//           return false;
//         }
//       },
//       { message: "Deve ser um JSON válido" }
//     ),
// });


export const equipment_schema = z.object({
  serial_number: z.string().min(1, { message: "Número de série é obrigatório" }),
  type: z.string().min(1, { message: "Tipo é obrigatório" }),
  brand: z.string().min(1, { message: "Marca é obrigatória" }),
  model: z.string().min(1, { message: "Modelo é obrigatório" }),
  purchase_date: z.string().optional().nullable().transform((val) => (val === "" ? undefined : val)),
  warranty_end: z.string().optional().nullable().transform((val) => (val === "" ? undefined : val)),
  status: z.enum(["ACTIVO", "MANUTENÇÃO", "INACTIVO"], {
    required_error: "Status é obrigatório",
  }),
  direction_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  department_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  sector_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  service_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  repartition_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  observations: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  extra_fields: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === "") return undefined;
      try {
        return JSON.parse(val);
      } catch {
        throw new Error("extra_fields deve ser um JSON válido");
      }
    }),
});