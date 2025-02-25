// // src/components/forms/equipment-update-form.tsx
// "use client";

// import { Button } from "@/components/ui/button";
// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
//     CommandList,
// } from "@/components/ui/command";
// import {
//     Form,
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//     Tooltip,
//     TooltipContent,
//     TooltipProvider,
//     TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { useToast } from "@/hooks/use-toast";
// import { cn } from "@/lib/utils";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Department, Direction, Repartition, Sector, Service } from "@prisma/client";
// import {
//     useMutation,
//     useQuery,
//     useQueryClient,
// } from "@tanstack/react-query";
// import {
//     AlertCircle,
//     Calendar,
//     Camera,
//     Check,
//     ChevronsUpDown,
//     Hash,
//     Hospital,
//     Loader2,
//     MonitorSmartphone,
//     Tag,
//     Trash2,
//     Upload,
//     Wrench,
// } from "lucide-react";
// import { useRouter } from "nextjs-toploader/app";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// type EquipmentImage = {
//     id: string;
//     url: string;
//     description: string;
//     cloudinary_public_id: string;
// };

// const equipment_schema = z.object({
//     serial_number: z.string().min(1, { message: "Número de série é obrigatório" }),
//     type: z.string().min(1, { message: "Tipo é obrigatório" }),
//     brand: z.string().min(1, { message: "Marca é obrigatória" }),
//     model: z.string().min(1, { message: "Modelo é obrigatório" }),
//     purchase_date: z.string().optional(),
//     warranty_end: z.string().optional(),
//     status: z.enum(["ACTIVO", "MANUTENÇÃO", "INACTIVO"], {
//         required_error: "Status é obrigatório",
//     }),
//     direction_id: z.string().optional(),
//     department_id: z.string().optional(),
//     sector_id: z.string().optional(),
//     service_id: z.string().optional(),
//     repartition_id: z.string().optional(),
// });

// export type EquipmentFormData = z.infer<typeof equipment_schema>;

// const statusOptions = [
//     { value: "ACTIVO", label: "Activo" },
//     { value: "MANUTENÇÃO", label: "Manutenção" },
//     { value: "INACTIVO", label: "Inactivo" },
// ] as const;

// const typeOptions = [
//     { value: "PRINTER", label: "Impressora" },
//     { value: "SWITCH", label: "Switch" },
//     { value: "MONITOR", label: "Monitor" },
//     { value: "PC", label: "Computador (PC)" },
//     { value: "PROJECTOR", label: "Projetor (Data Show)" },
//     { value: "SPEAKERS", label: "Caixas de Som" },
//     { value: "CAMERA", label: "Câmera" },
//     { value: "ROUTER", label: "Roteador" },
//     { value: "UPS", label: "Nobreak (UPS)" },
// ] as const;

// interface EquipmentUpdateFormProps {
//     equipmentId: string;
// }

// export function EquipmentUpdateForm({ equipmentId }: EquipmentUpdateFormProps) {
//     const queryClient = useQueryClient();
//     const router = useRouter();
//     const { toast } = useToast();

//     const [files, setFiles] = useState<File[]>([]);
//     const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
//     const [existingImages, setExistingImages] = useState<EquipmentImage[]>([]);
//     const [isDragging, setIsDragging] = useState(false);
//     const [isStatusOpen, setIsStatusOpen] = useState(false);
//     const [isDirectionOpen, setIsDirectionOpen] = useState(false);
//     const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
//     const [isSectorOpen, setIsSectorOpen] = useState(false);
//     const [isServiceOpen, setIsServiceOpen] = useState(false);
//     const [isRepartitionOpen, setIsRepartitionOpen] = useState(false);
//     const [isTypeOpen, setIsTypeOpen] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);

//     // Fetch Equipment Data
//     const { data: equipmentData, isLoading: isEquipmentLoading } = useQuery({
//         queryKey: ["equipment", equipmentId],
//         queryFn: async () => {
//             const response = await fetch(`/api/equipment/update/${equipmentId}`);
//             if (!response.ok) {
//                 throw new Error("Failed to fetch equipment");
//             }
//             return response.json();
//         },
//         enabled: !!equipmentId,
//     });

//     const form = useForm<EquipmentFormData>({
//         resolver: zodResolver(equipment_schema),
//         defaultValues: {
//             serial_number: "",
//             type: "",
//             brand: "",
//             model: "",
//             purchase_date: "",
//             warranty_end: "",
//             status: undefined,
//             direction_id: "",
//             department_id: "",
//             sector_id: "",
//             service_id: "",
//             repartition_id: "",
//         },
//     });

//     // Set form values when equipment data is loaded
//     useEffect(() => {
//         if (equipmentData?.equipment && !isEquipmentLoading) {
//             const equipment = equipmentData.equipment;

//             // Format dates for input fields
//             const purchaseDate = equipment.purchase_date
//                 ? new Date(equipment.purchase_date).toISOString().split('T')[0]
//                 : "";

//             const warrantyEnd = equipment.warranty_end
//                 ? new Date(equipment.warranty_end).toISOString().split('T')[0]
//                 : "";

//             form.reset({
//                 serial_number: equipment.serial_number,
//                 type: equipment.type,
//                 brand: equipment.brand,
//                 model: equipment.model,
//                 purchase_date: purchaseDate,
//                 warranty_end: warrantyEnd,
//                 status: equipment.status,
//                 direction_id: equipment.direction_id || "",
//                 department_id: equipment.department_id || "",
//                 sector_id: equipment.sector_id || "",
//                 service_id: equipment.service_id || "",
//                 repartition_id: equipment.repartition_id || "",
//             });

//             // Set existing images
//             if (equipment.images) {
//                 setExistingImages(equipment.images);
//             }

//             setIsLoading(false);
//         }
//     }, [equipmentData, isEquipmentLoading, form]);

//     useEffect(() => {
//         return () => {
//             files.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
//         };
//     }, [files]);

//     // Fetch Directions
//     const { data: directions = [], isLoading: isDirectionsLoading } = useQuery({
//         queryKey: ["directions"],
//         queryFn: () => fetch("/api/equipment/directions").then(res => res.json()),
//     });

//     // Fetch Departments based on selected direction
//     const selectedDirectionId = form.watch("direction_id");
//     const { data: departments = [], isLoading: isDepartmentsLoading } = useQuery({
//         queryKey: ["departments", selectedDirectionId],
//         queryFn: () => fetch(`/api/equipment/departments/${selectedDirectionId}`).then(res => res.json()),
//         enabled: !!selectedDirectionId, // Only fetch if directionId exists
//     });

//     // Fetch Sectors based on selected department
//     const selectedDepartmentId = form.watch("department_id");
//     const { data: sectors = [], isLoading: isSectorsLoading } = useQuery({
//         queryKey: ["sectors", selectedDepartmentId],
//         queryFn: () => fetch(`/api/equipment/sectors/${selectedDepartmentId}`).then(res => res.json()),
//         enabled: !!selectedDepartmentId, // Only fetch if departmentId exists
//     });

//     // Fetch Repartitions based on selected department
//     const { data: repartitions = [], isLoading: isRepartitionsLoading } = useQuery({
//         queryKey: ["repartitions", selectedDepartmentId],
//         queryFn: () => fetch(`/api/equipment/repartitions/${selectedDepartmentId}`).then(res => res.json()),
//         enabled: !!selectedDepartmentId, // Only fetch if departmentId exists
//     });

//     // Fetch Services based on direction and department
//     const { data: services = [], isLoading: isServicesLoading } = useQuery({
//         queryKey: ["services", selectedDirectionId, selectedDepartmentId],
//         queryFn: () => fetch(`/api/equipment/services?directionId=${selectedDirectionId || ""}&departmentId=${selectedDepartmentId || ""}`).then(res => res.json()),
//         enabled: !!selectedDirectionId || !!selectedDepartmentId, // Only fetch if either exists
//     });

//     // Mutation for updating equipment
//     const updateMutation = useMutation({
//         mutationFn: async (formData: FormData) => {
//             const response = await fetch(`/api/equipment/update/${equipmentId}`, {
//                 method: "PUT",
//                 body: formData,
//             });
//             if (!response.ok) {
//                 const error = await response.json();
//                 throw new Error(error.error || "Failed to update equipment");
//             }
//             return response.json();
//         },
//         onSuccess: (data) => {
//             queryClient.invalidateQueries({ queryKey: ["equipment"] });
//             queryClient.invalidateQueries({ queryKey: ["equipment", equipmentId] });
//             console.log(data)
//             toast({
//                 title: "Sucesso!",
//                 description: "Equipamento atualizado com sucesso",
//             });
//             router.push("/equipments");
//         },
//         onError: (error: Error) => {
//             form.setError("root", { message: error.message });
//         },
//     });

//     // Mutation for deleting equipment
//     const deleteMutation = useMutation({
//         mutationFn: async () => {
//             const response = await fetch(`/api/equipment/update/${equipmentId}`, {
//                 method: "DELETE",
//             });
//             if (!response.ok) {
//                 const error = await response.json();
//                 throw new Error(error.error || "Failed to delete equipment");
//             }
//             return response.json();
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["equipment"] });
//             toast({
//                 title: "Sucesso!",
//                 description: "Equipamento excluído com sucesso",
//             });
//             router.push("/equipments");
//         },
//         onError: (error: Error) => {
//             toast({
//                 title: "Erro!",
//                 description: error.message,
//                 variant: "destructive",
//             });
//         },
//     });

//     const on_submit = (values: EquipmentFormData) => {
//         const formData = new FormData();
//         Object.entries(values).forEach(([key, value]) => {
//             if (value !== undefined) formData.append(key, value);
//         });

//         // Add deleted image IDs
//         if (deletedImageIds.length > 0) {
//             formData.append("deleted_image_ids", JSON.stringify(deletedImageIds));
//         }

//         // Add new images
//         files.forEach((file) => formData.append("images", file));

//         updateMutation.mutate(formData);
//     };

//     const handleDeleteEquipment = () => {
//         if (window.confirm("Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.")) {
//             deleteMutation.mutate();
//         }
//     };

//     const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//         setIsDragging(true);
//     };

//     const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//         setIsDragging(false);
//     };

//     const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//         e.preventDefault();
//         setIsDragging(false);
//         const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
//             file.type.startsWith("image/")
//         );
//         setFiles((prev) => [...prev, ...droppedFiles]);
//     };

//     const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
//         setFiles((prev) => [...prev, ...selectedFiles]);
//     };

//     const removeFile = (index: number) => {
//         setFiles((prev) => {
//             const fileToRemove = prev[index]; // Get the File object to remove
//             const newFiles = prev.filter((_, i) => i !== index);

//             // Revoke the blob URL for the removed file
//             if (fileToRemove) {
//                 URL.revokeObjectURL(URL.createObjectURL(fileToRemove));
//             }

//             return newFiles;
//         });
//     };

//     const removeExistingImage = (imageId: string) => {
//         setDeletedImageIds((prev) => [...prev, imageId]);
//     };

//     if (isLoading || isEquipmentLoading) {
//         return (
//             <div className="flex items-center justify-center h-48">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                 <span className="ml-2">Carregando dados do equipamento...</span>
//             </div>
//         );
//     }

//     return (
//         <TooltipProvider>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(on_submit)} className="space-y-8">
//                     <div className="flex justify-between items-center">
//                         <h2 className="text-2xl font-bold">Atualizar Equipamento</h2>
//                         <Button
//                             type="button"
//                             variant="destructive"
//                             onClick={handleDeleteEquipment}
//                             disabled={deleteMutation.isPending}
//                         >
//                             {deleteMutation.isPending ? (
//                                 <>
//                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                     Excluindo...
//                                 </>
//                             ) : (
//                                 <>
//                                     <Trash2 className="mr-2 h-4 w-4" />
//                                     Excluir Equipamento
//                                 </>
//                             )}
//                         </Button>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
//                         <FormField
//                             control={form.control}
//                             name="serial_number"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Hash className="h-4 w-4" />
//                                         Número de Série <span className="text-red-500">*</span>
//                                         <Tooltip>
//                                             <TooltipTrigger asChild>
//                                                 <AlertCircle className="h-4 w-4 text-gray-500" />
//                                             </TooltipTrigger>
//                                             <TooltipContent>Identificador único do equipamento</TooltipContent>
//                                         </Tooltip>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input
//                                             placeholder="Digite o número de série"
//                                             {...field}
//                                             onBlur={() => form.trigger("serial_number")}
//                                             aria-required="true"
//                                             aria-describedby="serial_number-description"
//                                         />
//                                     </FormControl>
//                                     <FormDescription id="serial_number-description">Número único fornecido pelo fabricante.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="type"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel className="flex items-center gap-1">
//                                         <MonitorSmartphone className="h-4 w-4" />
//                                         Tipo <span className="text-red-500">*</span>
//                                         <Tooltip>
//                                             <TooltipTrigger asChild>
//                                                 <AlertCircle className="h-4 w-4 text-gray-500" />
//                                             </TooltipTrigger>
//                                             <TooltipContent>Tipo do equipamento</TooltipContent>
//                                         </Tooltip>
//                                     </FormLabel>
//                                     <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant="outline"
//                                                     role="combobox"
//                                                     className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
//                                                     aria-expanded={isTypeOpen}
//                                                     aria-required="true"
//                                                     aria-describedby="type-description"
//                                                     onClick={() => setIsTypeOpen(true)}
//                                                 >
//                                                     {field.value
//                                                         ? typeOptions.find((opt) => opt.value === field.value)?.label
//                                                         : "Selecionar Tipo"}
//                                                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-full p-0">
//                                             <Command>
//                                                 <CommandInput placeholder="Pesquisar Tipo..." />
//                                                 <CommandList>
//                                                     <CommandEmpty>Nenhum Tipo encontrado.</CommandEmpty>
//                                                     <CommandGroup>
//                                                         {typeOptions.map((option) => (
//                                                             <CommandItem
//                                                                 value={option.label}
//                                                                 key={option.value}
//                                                                 onSelect={() => {
//                                                                     field.onChange(option.value);
//                                                                     form.trigger("type");
//                                                                     setIsTypeOpen(false);
//                                                                 }}
//                                                             >
//                                                                 <Check
//                                                                     className={cn(
//                                                                         "mr-2 h-4 w-4",
//                                                                         option.value === field.value ? "opacity-100" : "opacity-0"
//                                                                     )}
//                                                                 />
//                                                                 {option.label}
//                                                             </CommandItem>
//                                                         ))}
//                                                     </CommandGroup>
//                                                 </CommandList>
//                                             </Command>
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormDescription id="type-description">Exemplo: Computador (PC).</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="brand"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Tag className="h-4 w-4" />
//                                         Marca <span className="text-red-500">*</span>
//                                         <Tooltip>
//                                             <TooltipTrigger asChild>
//                                                 <AlertCircle className="h-4 w-4 text-gray-500" />
//                                             </TooltipTrigger>
//                                             <TooltipContent>Fabricante do equipamento</TooltipContent>
//                                         </Tooltip>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input
//                                             placeholder="Digite a marca"
//                                             {...field}
//                                             onBlur={() => form.trigger("brand")}
//                                             aria-required="true"
//                                             aria-describedby="brand-description"
//                                         />
//                                     </FormControl>
//                                     <FormDescription id="brand-description">Exemplo: Lenovo.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="model"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Tag className="h-4 w-4" />
//                                         Modelo <span className="text-red-500">*</span>
//                                         <Tooltip>
//                                             <TooltipTrigger asChild>
//                                                 <AlertCircle className="h-4 w-4 text-gray-500" />
//                                             </TooltipTrigger>
//                                             <TooltipContent>Modelo específico do equipamento</TooltipContent>
//                                         </Tooltip>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input
//                                             placeholder="Digite o modelo"
//                                             {...field}
//                                             onBlur={() => form.trigger("model")}
//                                             aria-required="true"
//                                             aria-describedby="model-description"
//                                         />
//                                     </FormControl>
//                                     <FormDescription id="model-description">Exemplo: ThinkStation.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
//                         <FormField
//                             control={form.control}
//                             name="purchase_date"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Calendar className="h-4 w-4" />
//                                         Data de Compra
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input
//                                             type="date"
//                                             {...field}
//                                             onBlur={() => form.trigger("purchase_date")}
//                                             aria-describedby="purchase_date-description"
//                                         />
//                                     </FormControl>
//                                     <FormDescription id="purchase_date-description">Data em que o equipamento foi adquirido.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="warranty_end"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Calendar className="h-4 w-4" />
//                                         Fim da Garantia
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input
//                                             type="date"
//                                             {...field}
//                                             onBlur={() => form.trigger("warranty_end")}
//                                             aria-describedby="warranty_end-description"
//                                         />
//                                     </FormControl>
//                                     <FormDescription id="warranty_end-description">Data de expiração da garantia.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="status"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Wrench className="h-4 w-4" />
//                                         Status <span className="text-red-500">*</span>
//                                         <Tooltip>
//                                             <TooltipTrigger asChild>
//                                                 <AlertCircle className="h-4 w-4 text-gray-500" />
//                                             </TooltipTrigger>
//                                             <TooltipContent>Estado atual do equipamento</TooltipContent>
//                                         </Tooltip>
//                                     </FormLabel>
//                                     <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant="outline"
//                                                     role="combobox"
//                                                     className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
//                                                     aria-expanded={isStatusOpen}
//                                                     aria-required="true"
//                                                     aria-describedby="status-description"
//                                                     onClick={() => setIsStatusOpen(true)}
//                                                 >
//                                                     {field.value
//                                                         ? statusOptions.find((opt) => opt.value === field.value)?.label
//                                                         : "Selecionar Status"}
//                                                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-full p-0">
//                                             <Command>
//                                                 <CommandInput placeholder="Pesquisar Status..." />
//                                                 <CommandList>
//                                                     <CommandEmpty>Nenhum Status encontrado.</CommandEmpty>
//                                                     <CommandGroup>
//                                                         {statusOptions.map((option) => (
//                                                             <CommandItem
//                                                                 value={option.label}
//                                                                 key={option.value}
//                                                                 onSelect={() => {
//                                                                     field.onChange(option.value);
//                                                                     form.trigger("status");
//                                                                     setIsStatusOpen(false);
//                                                                 }}
//                                                             >
//                                                                 <Check
//                                                                     className={cn(
//                                                                         "mr-2 h-4 w-4",
//                                                                         option.value === field.value ? "opacity-100" : "opacity-0"
//                                                                     )}
//                                                                 />
//                                                                 {option.label}
//                                                             </CommandItem>
//                                                         ))}
//                                                     </CommandGroup>
//                                                 </CommandList>
//                                             </Command>
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormDescription id="status-description">Exemplo: Activo ou Manutenção.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>

//                     <div className="space-y-4">
//                         <h2 className="text-lg font-semibold">Imagens do Equipamento</h2>
//                         <div
//                             className={cn(
//                                 "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center",
//                                 isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900" : "border-gray-300 bg-gray-50 dark:bg-gray-700"
//                             )}
//                             onDragOver={handleDragOver}
//                             onDragLeave={handleDragLeave}
//                             onDrop={handleDrop}
//                         >
//                             <Upload className="h-8 w-8 text-gray-500 dark:text-gray-200 mb-2" />
//                             <p className="text-gray-600 dark:text-gray-200 text-center">Arraste e solte imagens aqui ou clique para selecionar</p>
//                             <div className="flex flex-col-reverse md:flex-row gap-2 mt-4">
//                                 <Button variant="outline" asChild>
//                                     <label htmlFor="file-upload" className="cursor-pointer">
//                                         <Upload className="h-4 w-4 mr-2" />
//                                         Selecionar Arquivos
//                                     </label>
//                                 </Button>
//                                 <Button variant="outline" asChild>
//                                     <label htmlFor="camera-upload" className="cursor-pointer">
//                                         <Camera className="h-4 w-4 mr-2" />
//                                         Tirar Foto
//                                     </label>
//                                 </Button>
//                             </div>
//                             <input
//                                 id="file-upload"
//                                 type="file"
//                                 accept="image/*"
//                                 multiple
//                                 className="hidden"
//                                 onChange={handleFileInput}
//                             />
//                             <input
//                                 id="camera-upload"
//                                 type="file"
//                                 accept="image/*"
//                                 capture="environment"
//                                 className="hidden"
//                                 onChange={handleFileInput}
//                             />
//                         </div>
//                         {files.length > 0 && (
//                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                                 {files.map((file, index) => (
//                                     <div key={index} className="relative bg-white dark:bg-gray-950 p-2 rounded-lg shadow">
//                                         <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-32 object-cover rounded" />
//                                         <p className="text-sm text-gray-600 truncate mt-1">{file.name}</p>
//                                         <Button
//                                             variant="destructive"
//                                             size="sm"
//                                             className="absolute top-1 right-1"
//                                             onClick={() => removeFile(index)}
//                                         >
//                                             X
//                                         </Button>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
//                         <FormField
//                             control={form.control}
//                             name="direction_id"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Hospital className="h-4 w-4" />
//                                         Direção
//                                     </FormLabel>
//                                     <Popover open={isDirectionOpen} onOpenChange={setIsDirectionOpen}>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant="outline"
//                                                     role="combobox"
//                                                     className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
//                                                     disabled={isDirectionsLoading}
//                                                     aria-expanded={isDirectionOpen}
//                                                     aria-describedby="direction_id-description"
//                                                     onClick={() => setIsDirectionOpen(true)}
//                                                 >
//                                                     {isDirectionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                                                     {field.value
//                                                         ? directions.find((dir: Direction) => dir.id === field.value)?.name
//                                                         : "Selecionar Direção"}
//                                                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-full p-0">
//                                             <Command>
//                                                 <CommandInput placeholder="Pesquisar Direção..." />
//                                                 <CommandList>
//                                                     <CommandEmpty>Nenhuma Direção encontrada.</CommandEmpty>
//                                                     <CommandGroup>
//                                                         {directions.map((dir: Direction) => (
//                                                             <CommandItem
//                                                                 value={dir.name}
//                                                                 key={dir.id}
//                                                                 onSelect={() => {
//                                                                     field.onChange(dir.id);
//                                                                     form.trigger("direction_id");
//                                                                     setIsDirectionOpen(false);
//                                                                 }}
//                                                             >
//                                                                 <Check
//                                                                     className={cn(
//                                                                         "mr-2 h-4 w-4",
//                                                                         dir.id === field.value ? "opacity-100" : "opacity-0"
//                                                                     )}
//                                                                 />
//                                                                 {dir.name}
//                                                             </CommandItem>
//                                                         ))}
//                                                     </CommandGroup>
//                                                 </CommandList>
//                                             </Command>
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormDescription id="direction_id-description">Direção responsável pelo equipamento.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="department_id"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Hospital className="h-4 w-4" />
//                                         Departamento
//                                     </FormLabel>
//                                     <Popover open={isDepartmentOpen} onOpenChange={setIsDepartmentOpen}>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant="outline"
//                                                     role="combobox"
//                                                     className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
//                                                     disabled={!selectedDirectionId || isDepartmentsLoading}
//                                                     aria-expanded={isDepartmentOpen}
//                                                     aria-describedby="department_id-description"
//                                                     onClick={() => setIsDepartmentOpen(true)}
//                                                 >
//                                                     {isDepartmentsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                                                     {field.value
//                                                         ? departments.find((dep: Department) => dep.id === field.value)?.name
//                                                         : "Selecionar Departamento"}
//                                                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-full p-0">
//                                             <Command>
//                                                 <CommandInput placeholder="Pesquisar Departamento..." />
//                                                 <CommandList>
//                                                     <CommandEmpty>Nenhum Departamento encontrado.</CommandEmpty>
//                                                     <CommandGroup>
//                                                         {departments.map((dep: Department) => (
//                                                             <CommandItem
//                                                                 value={dep.name}
//                                                                 key={dep.id}
//                                                                 onSelect={() => {
//                                                                     field.onChange(dep.id);
//                                                                     form.trigger("department_id");
//                                                                     setIsDepartmentOpen(false);
//                                                                 }}
//                                                             >
//                                                                 <Check
//                                                                     className={cn(
//                                                                         "mr-2 h-4 w-4",
//                                                                         dep.id === field.value ? "opacity-100" : "opacity-0"
//                                                                     )}
//                                                                 />
//                                                                 {dep.name}
//                                                             </CommandItem>
//                                                         ))}
//                                                     </CommandGroup>
//                                                 </CommandList>
//                                             </Command>
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormDescription id="department_id-description">Departamento dentro da direção.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
//                         <FormField
//                             control={form.control}
//                             name="sector_id"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Hospital className="h-4 w-4" />
//                                         Sector
//                                     </FormLabel>
//                                     <Popover open={isSectorOpen} onOpenChange={setIsSectorOpen}>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant="outline"
//                                                     role="combobox"
//                                                     className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
//                                                     disabled={!selectedDepartmentId || isSectorsLoading}
//                                                     aria-expanded={isSectorOpen}
//                                                     aria-describedby="sector_id-description"
//                                                     onClick={() => setIsSectorOpen(true)}
//                                                 >
//                                                     {isSectorsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                                                     {field.value
//                                                         ? sectors.find((sec: Sector) => sec.id === field.value)?.name
//                                                         : "Selecionar Sector"}
//                                                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-full p-0">
//                                             <Command>
//                                                 <CommandInput placeholder="Pesquisar Sector..." />
//                                                 <CommandList>
//                                                     <CommandEmpty>Nenhum Sector encontrado.</CommandEmpty>
//                                                     <CommandGroup>
//                                                         {sectors.map((sec: Sector) => (
//                                                             <CommandItem
//                                                                 value={sec.name}
//                                                                 key={sec.id}
//                                                                 onSelect={() => {
//                                                                     field.onChange(sec.id);
//                                                                     form.trigger("sector_id");
//                                                                     setIsSectorOpen(false);
//                                                                 }}
//                                                             >
//                                                                 <Check
//                                                                     className={cn(
//                                                                         "mr-2 h-4 w-4",
//                                                                         sec.id === field.value ? "opacity-100" : "opacity-0"
//                                                                     )}
//                                                                 />
//                                                                 {sec.name}
//                                                             </CommandItem>
//                                                         ))}
//                                                     </CommandGroup>
//                                                 </CommandList>
//                                             </Command>
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormDescription id="sector_id-description">Sector específico dentro do departamento.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="service_id"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Hospital className="h-4 w-4" />
//                                         Serviço
//                                     </FormLabel>
//                                     <Popover open={isServiceOpen} onOpenChange={setIsServiceOpen}>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant="outline"
//                                                     role="combobox"
//                                                     className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
//                                                     disabled={!selectedDirectionId || isServicesLoading}
//                                                     aria-expanded={isServiceOpen}
//                                                     aria-describedby="service_id-description"
//                                                     onClick={() => setIsServiceOpen(true)}
//                                                 >
//                                                     {isServicesLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                                                     {field.value
//                                                         ? services.find((svc: Service) => svc.id === field.value)?.name
//                                                         : "Selecionar Serviço"}
//                                                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-full p-0">
//                                             <Command>
//                                                 <CommandInput placeholder="Pesquisar Serviço..." />
//                                                 <CommandList>
//                                                     <CommandEmpty>Nenhum Serviço encontrado.</CommandEmpty>
//                                                     <CommandGroup>
//                                                         {services.map((svc: Service) => (
//                                                             <CommandItem
//                                                                 value={svc.name}
//                                                                 key={svc.id}
//                                                                 onSelect={() => {
//                                                                     field.onChange(svc.id);
//                                                                     form.trigger("service_id");
//                                                                     setIsServiceOpen(false);
//                                                                 }}
//                                                             >
//                                                                 <Check
//                                                                     className={cn(
//                                                                         "mr-2 h-4 w-4",
//                                                                         svc.id === field.value ? "opacity-100" : "opacity-0"
//                                                                     )}
//                                                                 />
//                                                                 {svc.name}
//                                                             </CommandItem>
//                                                         ))}
//                                                     </CommandGroup>
//                                                 </CommandList>
//                                             </Command>
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormDescription id="service_id-description">Serviço associado ao equipamento.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="repartition_id"
//                             render={({ field }) => (
//                                 <FormItem className="flex flex-col">
//                                     <FormLabel className="flex items-center gap-1">
//                                         <Hospital className="h-4 w-4" />
//                                         Repartição
//                                     </FormLabel>
//                                     <Popover open={isRepartitionOpen} onOpenChange={setIsRepartitionOpen}>
//                                         <PopoverTrigger asChild>
//                                             <FormControl>
//                                                 <Button
//                                                     variant="outline"
//                                                     role="combobox"
//                                                     className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
//                                                     disabled={!selectedDepartmentId || isRepartitionsLoading}
//                                                     aria-expanded={isRepartitionOpen}
//                                                     aria-describedby="repartition_id-description"
//                                                     onClick={() => setIsRepartitionOpen(true)}
//                                                 >
//                                                     {isRepartitionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                                                     {field.value
//                                                         ? repartitions.find((rep: Repartition) => rep.id === field.value)?.name
//                                                         : "Selecionar Repartição"}
//                                                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                                                 </Button>
//                                             </FormControl>
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-full p-0">
//                                             <Command>
//                                                 <CommandInput placeholder="Pesquisar Repartição..." />
//                                                 <CommandList>
//                                                     <CommandEmpty>Nenhuma Repartição encontrada.</CommandEmpty>
//                                                     <CommandGroup>
//                                                         {repartitions.map((rep: Repartition) => (
//                                                             <CommandItem
//                                                                 value={rep.name}
//                                                                 key={rep.id}
//                                                                 onSelect={() => {
//                                                                     field.onChange(rep.id);
//                                                                     form.trigger("repartition_id");
//                                                                     setIsRepartitionOpen(false);
//                                                                 }}
//                                                             >
//                                                                 <Check
//                                                                     className={cn(
//                                                                         "mr-2 h-4 w-4",
//                                                                         rep.id === field.value ? "opacity-100" : "opacity-0"
//                                                                     )}
//                                                                 />
//                                                                 {rep.name}
//                                                             </CommandItem>
//                                                         ))}
//                                                     </CommandGroup>
//                                                 </CommandList>
//                                             </Command>
//                                         </PopoverContent>
//                                     </Popover>
//                                     <FormDescription id="repartition_id-description">Repartição onde o equipamento está alocado.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>

//                     {form.formState.errors.root && (
//                         <p className="text-red-500 flex items-center gap-2">
//                             <AlertCircle className="h-4 w-4" />
//                             {form.formState.errors.root.message}
//                         </p>
//                     )}
//                     <div className="flex justify-end">
//                         <Button type="submit" disabled={updateMutation.isPending}>
//                             {updateMutation.isPending ? (
//                                 <>
//                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                     Salvando...
//                                 </>
//                             ) : (
//                                 "Actualizar Equipamento"
//                             )}
//                         </Button>
//                     </div>
//                 </form>
//             </Form>
//         </TooltipProvider>
//     );
// }

"use client";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Department, Direction, Repartition, Sector, Service } from "@prisma/client";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    AlertCircle,
    Calendar,
    Camera,
    Check,
    ChevronsUpDown,
    Hash,
    Hospital,
    Loader2,
    MonitorSmartphone,
    Tag,
    Trash2,
    Upload,
    Wrench,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type EquipmentImage = {
    id: string;
    url: string;
    description: string;
    cloudinary_public_id: string;
};

const equipment_schema = z.object({
    serial_number: z.string().min(1, { message: "Número de série é obrigatório" }),
    type: z.string().min(1, { message: "Tipo é obrigatório" }),
    brand: z.string().min(1, { message: "Marca é obrigatória" }),
    model: z.string().min(1, { message: "Modelo é obrigatório" }),
    purchase_date: z.string().optional(),
    warranty_end: z.string().optional(),
    status: z.enum(["ACTIVO", "MANUTENÇÃO", "INACTIVO"], {
        required_error: "Status é obrigatório",
    }),
    direction_id: z.string().optional(),
    department_id: z.string().optional(),
    sector_id: z.string().optional(),
    service_id: z.string().optional(),
    repartition_id: z.string().optional(),
});

export type EquipmentFormData = z.infer<typeof equipment_schema>;

const statusOptions = [
    { value: "ACTIVO", label: "Activo" },
    { value: "MANUTENÇÃO", label: "Manutenção" },
    { value: "INACTIVO", label: "Inactivo" },
] as const;

const typeOptions = [
    { value: "PRINTER", label: "Impressora" },
    { value: "SWITCH", label: "Switch" },
    { value: "MONITOR", label: "Monitor" },
    { value: "PC", label: "Computador (PC)" },
    { value: "PROJECTOR", label: "Projetor (Data Show)" },
    { value: "SPEAKERS", label: "Caixas de Som" },
    { value: "CAMERA", label: "Câmera" },
    { value: "ROUTER", label: "Roteador" },
    { value: "UPS", label: "Nobreak (UPS)" },
] as const;

interface EquipmentUpdateFormProps {
    equipmentId: string;
}

export function EquipmentUpdateForm({ equipmentId }: EquipmentUpdateFormProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { toast } = useToast();

    const [files, setFiles] = useState<File[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<EquipmentImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isDirectionOpen, setIsDirectionOpen] = useState(false);
    const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
    const [isSectorOpen, setIsSectorOpen] = useState(false);
    const [isServiceOpen, setIsServiceOpen] = useState(false);
    const [isRepartitionOpen, setIsRepartitionOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Equipment Data
    const { data: equipmentData, isLoading: isEquipmentLoading } = useQuery({
        queryKey: ["equipment", equipmentId],
        queryFn: async () => {
            const response = await fetch(`/api/equipment/update/${equipmentId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch equipment");
            }
            return response.json();
        },
        enabled: !!equipmentId,
    });

    const form = useForm<EquipmentFormData>({
        resolver: zodResolver(equipment_schema),
        defaultValues: {
            serial_number: "",
            type: "",
            brand: "",
            model: "",
            purchase_date: "",
            warranty_end: "",
            status: undefined,
            direction_id: "",
            department_id: "",
            sector_id: "",
            service_id: "",
            repartition_id: "",
        },
    });

    // Set form values when equipment data is loaded
    useEffect(() => {
        if (equipmentData?.equipment && !isEquipmentLoading) {
            const equipment = equipmentData.equipment;

            const purchaseDate = equipment.purchase_date
                ? new Date(equipment.purchase_date).toISOString().split("T")[0]
                : "";
            const warrantyEnd = equipment.warranty_end
                ? new Date(equipment.warranty_end).toISOString().split("T")[0]
                : "";

            form.reset({
                serial_number: equipment.serial_number,
                type: equipment.type,
                brand: equipment.brand,
                model: equipment.model,
                purchase_date: purchaseDate,
                warranty_end: warrantyEnd,
                status: equipment.status,
                direction_id: equipment.direction_id || "",
                department_id: equipment.department_id || "",
                sector_id: equipment.sector_id || "",
                service_id: equipment.service_id || "",
                repartition_id: equipment.repartition_id || "",
            });

            if (equipment.images) {
                setExistingImages(equipment.images);
            }

            setIsLoading(false);
        }
    }, [equipmentData, isEquipmentLoading, form]);

    useEffect(() => {
        return () => {
            files.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
        };
    }, [files]);

    // Fetch Directions
    const { data: directions = [], isLoading: isDirectionsLoading } = useQuery({
        queryKey: ["directions"],
        queryFn: () => fetch("/api/equipment/directions").then((res) => res.json()),
    });

    // Fetch Departments based on selected direction
    const selectedDirectionId = form.watch("direction_id");
    const { data: departments = [], isLoading: isDepartmentsLoading } = useQuery({
        queryKey: ["departments", selectedDirectionId],
        queryFn: () => fetch(`/api/equipment/departments/${selectedDirectionId}`).then((res) => res.json()),
        enabled: !!selectedDirectionId,
    });

    // Fetch Sectors based on selected department
    const selectedDepartmentId = form.watch("department_id");
    const { data: sectors = [], isLoading: isSectorsLoading } = useQuery({
        queryKey: ["sectors", selectedDepartmentId],
        queryFn: () => fetch(`/api/equipment/sectors/${selectedDepartmentId}`).then((res) => res.json()),
        enabled: !!selectedDepartmentId,
    });

    // Fetch Repartitions based on selected department
    const { data: repartitions = [], isLoading: isRepartitionsLoading } = useQuery({
        queryKey: ["repartitions", selectedDepartmentId],
        queryFn: () => fetch(`/api/equipment/repartitions/${selectedDepartmentId}`).then((res) => res.json()),
        enabled: !!selectedDepartmentId,
    });

    // Fetch Services based on direction and department
    const { data: services = [], isLoading: isServicesLoading } = useQuery({
        queryKey: ["services", selectedDirectionId, selectedDepartmentId],
        queryFn: () => fetch(`/api/equipment/services?directionId=${selectedDirectionId || ""}&departmentId=${selectedDepartmentId || ""}`).then((res) => res.json()),
        enabled: !!selectedDirectionId || !!selectedDepartmentId,
    });

    // Mutation for updating equipment
    const updateMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await fetch(`/api/equipment/update/${equipmentId}`, {
                method: "PUT",
                body: formData,
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update equipment");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
            queryClient.invalidateQueries({ queryKey: ["equipment", equipmentId] });
            toast({
                title: "Sucesso!",
                description: "Equipamento atualizado com sucesso",
            });
            router.push("/equipments");
        },
        onError: (error: Error) => {
            form.setError("root", { message: error.message });
        },
    });

    // Mutation for deleting equipment
    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/equipment/update/${equipmentId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to delete equipment");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipment"] });
            toast({
                title: "Sucesso!",
                description: "Equipamento excluído com sucesso",
            });
            router.push("/equipments");
        },
        onError: (error: Error) => {
            toast({
                title: "Erro!",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const on_submit = (values: EquipmentFormData) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined) formData.append(key, value);
        });

        if (deletedImageIds.length > 0) {
            formData.append("deleted_image_ids", JSON.stringify(deletedImageIds));
        }

        files.forEach((file) => formData.append("images", file));

        updateMutation.mutate(formData);
    };

    const handleDeleteEquipment = () => {
        if (window.confirm("Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.")) {
            deleteMutation.mutate();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
            file.type.startsWith("image/")
        );
        setFiles((prev) => [...prev, ...droppedFiles]);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const fileToRemove = prev[index];
            const newFiles = prev.filter((_, i) => i !== index);
            if (fileToRemove) {
                URL.revokeObjectURL(URL.createObjectURL(fileToRemove));
            }
            return newFiles;
        });
    };

    const removeExistingImage = (imageId: string) => {
        setDeletedImageIds((prev) => [...prev, imageId]);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    if (isLoading || isEquipmentLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando dados do equipamento...</span>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(on_submit)} className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Actualizar Equipamento</h2>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteEquipment}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir Equipamento
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="serial_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        <Hash className="h-4 w-4" />
                                        Número de Série <span className="text-red-500">*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertCircle className="h-4 w-4 text-gray-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>Identificador único do equipamento</TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o número de série"
                                            {...field}
                                            onBlur={() => form.trigger("serial_number")}
                                            aria-required="true"
                                            aria-describedby="serial_number-description"
                                        />
                                    </FormControl>
                                    <FormDescription id="serial_number-description">Número único fornecido pelo fabricante.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <MonitorSmartphone className="h-4 w-4" />
                                        Tipo <span className="text-red-500">*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertCircle className="h-4 w-4 text-gray-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>Tipo do equipamento</TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    aria-expanded={isTypeOpen}
                                                    aria-required="true"
                                                    aria-describedby="type-description"
                                                    onClick={() => setIsTypeOpen(true)}
                                                >
                                                    {field.value
                                                        ? typeOptions.find((opt) => opt.value === field.value)?.label
                                                        : "Selecionar Tipo"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Pesquisar Tipo..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum Tipo encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {typeOptions.map((option) => (
                                                            <CommandItem
                                                                value={option.label}
                                                                key={option.value}
                                                                onSelect={() => {
                                                                    field.onChange(option.value);
                                                                    form.trigger("type");
                                                                    setIsTypeOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        option.value === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {option.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="type-description">Exemplo: Computador (PC).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        <Tag className="h-4 w-4" />
                                        Marca <span className="text-red-500">*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertCircle className="h-4 w-4 text-gray-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>Fabricante do equipamento</TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite a marca"
                                            {...field}
                                            onBlur={() => form.trigger("brand")}
                                            aria-required="true"
                                            aria-describedby="brand-description"
                                        />
                                    </FormControl>
                                    <FormDescription id="brand-description">Exemplo: Lenovo.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        <Tag className="h-4 w-4" />
                                        Modelo <span className="text-red-500">*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertCircle className="h-4 w-4 text-gray-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>Modelo específico do equipamento</TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o modelo"
                                            {...field}
                                            onBlur={() => form.trigger("model")}
                                            aria-required="true"
                                            aria-describedby="model-description"
                                        />
                                    </FormControl>
                                    <FormDescription id="model-description">Exemplo: ThinkStation.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="purchase_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Data de Compra
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            onBlur={() => form.trigger("purchase_date")}
                                            aria-describedby="purchase_date-description"
                                        />
                                    </FormControl>
                                    <FormDescription id="purchase_date-description">Data em que o equipamento foi adquirido.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="warranty_end"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Fim da Garantia
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            onBlur={() => form.trigger("warranty_end")}
                                            aria-describedby="warranty_end-description"
                                        />
                                    </FormControl>
                                    <FormDescription id="warranty_end-description">Data de expiração da garantia.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <Wrench className="h-4 w-4" />
                                        Status <span className="text-red-500">*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertCircle className="h-4 w-4 text-gray-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>Estado atual do equipamento</TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    aria-expanded={isStatusOpen}
                                                    aria-required="true"
                                                    aria-describedby="status-description"
                                                    onClick={() => setIsStatusOpen(true)}
                                                >
                                                    {field.value
                                                        ? statusOptions.find((opt) => opt.value === field.value)?.label
                                                        : "Selecionar Status"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Pesquisar Status..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum Status encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {statusOptions.map((option) => (
                                                            <CommandItem
                                                                value={option.label}
                                                                key={option.value}
                                                                onSelect={() => {
                                                                    field.onChange(option.value);
                                                                    form.trigger("status");
                                                                    setIsStatusOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        option.value === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {option.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="status-description">Exemplo: Activo ou Manutenção.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Imagens do Equipamento</h2>
                        {/* Existing Images */}
                        {/* {existingImages.length > 0 && (
                            <>
                                <h3 className="text-md font-medium">Imagens Existentes</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {existingImages.map((image) => (
                                        <div key={image.id} className="relative bg-white dark:bg-gray-950 p-2 rounded-lg shadow">
                                            <img
                                                src={image.url}
                                                alt={image.description || "Imagem do equipamento"}
                                                className="w-full h-32 object-cover rounded"
                                            />
                                            <p className="text-sm text-gray-600 truncate mt-1">{image.description || "Sem descrição"}</p>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-1 right-1"
                                                onClick={() => removeExistingImage(image.id)}
                                            >
                                                X
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )} */}
                        import Image from "next/image";

                        // Inside the "Imagens Existentes" section:
                        {existingImages.length > 0 && (
                            <>
                                <h3 className="text-md font-medium">Imagens Existentes</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {existingImages.map((image) => (
                                        <div key={image.id} className="relative bg-white dark:bg-gray-950 p-2 rounded-lg shadow">
                                            <Image
                                                src={image.url}
                                                alt={image.description || "Imagem do equipamento"}
                                                width={128} // Adjust based on your design
                                                height={128} // Adjust based on your design
                                                className="w-full h-32 object-cover rounded"
                                            />
                                            <p className="text-sm text-gray-600 truncate mt-1">{image.description || "Sem descrição"}</p>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-1 right-1"
                                                onClick={() => removeExistingImage(image.id)}
                                            >
                                                X
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* New Images Upload */}
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center",
                                isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900" : "border-gray-300 bg-gray-50 dark:bg-gray-700"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Upload className="h-8 w-8 text-gray-500 dark:text-gray-200 mb-2" />
                            <p className="text-gray-600 dark:text-gray-200 text-center">Arraste e solte imagens aqui ou clique para selecionar</p>
                            <div className="flex flex-col-reverse md:flex-row gap-2 mt-4">
                                <Button variant="outline" asChild>
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Selecionar Arquivos
                                    </label>
                                </Button>
                                <Button variant="outline" asChild>
                                    <label htmlFor="camera-upload" className="cursor-pointer">
                                        <Camera className="h-4 w-4 mr-2" />
                                        Tirar Foto
                                    </label>
                                </Button>
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileInput}
                            />
                            <input
                                id="camera-upload"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleFileInput}
                            />
                        </div>
                        {files.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {files.map((file, index) => (
                                    <div key={index} className="relative bg-white dark:bg-gray-950 p-2 rounded-lg shadow">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-32 object-cover rounded"
                                        />
                                        <p className="text-sm text-gray-600 truncate mt-1">{file.name}</p>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-1 right-1"
                                            onClick={() => removeFile(index)}
                                        >
                                            X
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="direction_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <Hospital className="h-4 w-4" />
                                        Direção
                                    </FormLabel>
                                    <Popover open={isDirectionOpen} onOpenChange={setIsDirectionOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    disabled={isDirectionsLoading}
                                                    aria-expanded={isDirectionOpen}
                                                    aria-describedby="direction_id-description"
                                                    onClick={() => setIsDirectionOpen(true)}
                                                >
                                                    {isDirectionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    {field.value
                                                        ? directions.find((dir: Direction) => dir.id === field.value)?.name
                                                        : "Selecionar Direção"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Pesquisar Direção..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhuma Direção encontrada.</CommandEmpty>
                                                    <CommandGroup>
                                                        {directions.map((dir: Direction) => (
                                                            <CommandItem
                                                                value={dir.name}
                                                                key={dir.id}
                                                                onSelect={() => {
                                                                    field.onChange(dir.id);
                                                                    form.trigger("direction_id");
                                                                    setIsDirectionOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        dir.id === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {dir.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="direction_id-description">Direção responsável pelo equipamento.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="department_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <Hospital className="h-4 w-4" />
                                        Departamento
                                    </FormLabel>
                                    <Popover open={isDepartmentOpen} onOpenChange={setIsDepartmentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    disabled={!selectedDirectionId || isDepartmentsLoading}
                                                    aria-expanded={isDepartmentOpen}
                                                    aria-describedby="department_id-description"
                                                    onClick={() => setIsDepartmentOpen(true)}
                                                >
                                                    {isDepartmentsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    {field.value
                                                        ? departments.find((dep: Department) => dep.id === field.value)?.name
                                                        : "Selecionar Departamento"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Pesquisar Departamento..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum Departamento encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {departments.map((dep: Department) => (
                                                            <CommandItem
                                                                value={dep.name}
                                                                key={dep.id}
                                                                onSelect={() => {
                                                                    field.onChange(dep.id);
                                                                    form.trigger("department_id");
                                                                    setIsDepartmentOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        dep.id === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {dep.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="department_id-description">Departamento dentro da direção.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="sector_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <Hospital className="h-4 w-4" />
                                        Sector
                                    </FormLabel>
                                    <Popover open={isSectorOpen} onOpenChange={setIsSectorOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    disabled={!selectedDepartmentId || isSectorsLoading}
                                                    aria-expanded={isSectorOpen}
                                                    aria-describedby="sector_id-description"
                                                    onClick={() => setIsSectorOpen(true)}
                                                >
                                                    {isSectorsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    {field.value
                                                        ? sectors.find((sec: Sector) => sec.id === field.value)?.name
                                                        : "Selecionar Sector"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Pesquisar Sector..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum Sector encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {sectors.map((sec: Sector) => (
                                                            <CommandItem
                                                                value={sec.name}
                                                                key={sec.id}
                                                                onSelect={() => {
                                                                    field.onChange(sec.id);
                                                                    form.trigger("sector_id");
                                                                    setIsSectorOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        sec.id === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {sec.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="sector_id-description">Sector específico dentro do departamento.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="service_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <Hospital className="h-4 w-4" />
                                        Serviço
                                    </FormLabel>
                                    <Popover open={isServiceOpen} onOpenChange={setIsServiceOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    disabled={!selectedDirectionId || isServicesLoading}
                                                    aria-expanded={isServiceOpen}
                                                    aria-describedby="service_id-description"
                                                    onClick={() => setIsServiceOpen(true)}
                                                >
                                                    {isServicesLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    {field.value
                                                        ? services.find((svc: Service) => svc.id === field.value)?.name
                                                        : "Selecionar Serviço"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Pesquisar Serviço..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum Serviço encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {services.map((svc: Service) => (
                                                            <CommandItem
                                                                value={svc.name}
                                                                key={svc.id}
                                                                onSelect={() => {
                                                                    field.onChange(svc.id);
                                                                    form.trigger("service_id");
                                                                    setIsServiceOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        svc.id === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {svc.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="service_id-description">Serviço associado ao equipamento.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="repartition_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <Hospital className="h-4 w-4" />
                                        Repartição
                                    </FormLabel>
                                    <Popover open={isRepartitionOpen} onOpenChange={setIsRepartitionOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    disabled={!selectedDepartmentId || isRepartitionsLoading}
                                                    aria-expanded={isRepartitionOpen}
                                                    aria-describedby="repartition_id-description"
                                                    onClick={() => setIsRepartitionOpen(true)}
                                                >
                                                    {isRepartitionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    {field.value
                                                        ? repartitions.find((rep: Repartition) => rep.id === field.value)?.name
                                                        : "Selecionar Repartição"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Pesquisar Repartição..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhuma Repartição encontrada.</CommandEmpty>
                                                    <CommandGroup>
                                                        {repartitions.map((rep: Repartition) => (
                                                            <CommandItem
                                                                value={rep.name}
                                                                key={rep.id}
                                                                onSelect={() => {
                                                                    field.onChange(rep.id);
                                                                    form.trigger("repartition_id");
                                                                    setIsRepartitionOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        rep.id === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {rep.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="repartition_id-description">Repartição onde o equipamento está alocado.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {form.formState.errors.root && (
                        <p className="text-red-500 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {form.formState.errors.root.message}
                        </p>
                    )}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Actualizar Equipamento"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </TooltipProvider>
    );
}