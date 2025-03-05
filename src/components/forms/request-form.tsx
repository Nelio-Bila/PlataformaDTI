// src/components/forms/request-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Hash,
  Hospital,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// Define the schema for a single item
const itemSchema = z.object({
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  quantity: z.number().min(1, { message: "Quantidade deve ser pelo menos 1" }),
  unit: z.string().optional(),
});

// Updated request schema to include an array of items
const requestSchema = z.object({
  type: z.enum(["REQUISITION", "RETURN", "SUBSTITUTION"], { required_error: "Tipo é obrigatório" }),
  requester_name: z.string().min(1, { message: "Nome do solicitante é obrigatório" }),
  items: z.array(itemSchema).min(1, { message: "Pelo menos um item é obrigatório" }),
  requester_direction_id: z.string().optional(),
  requester_department_id: z.string().optional(),
  requester_service_id: z.string().optional(),
  requester_sector_id: z.string().optional(),
  requester_repartition_id: z.string().optional(),
  destination_direction_id: z.string().optional(),
  destination_department_id: z.string().optional(),
  destination_service_id: z.string().optional(),
  destination_sector_id: z.string().optional(),
  destination_repartition_id: z.string().optional(),
});

export type RequestFormData = z.infer<typeof requestSchema>;

const typeOptions = [
  { value: "REQUISITION", label: "Requisição" },
  { value: "RETURN", label: "Devolução" },
  { value: "SUBSTITUTION", label: "Substituição" },
] as const;

export function RequestForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  const [isRequesterDirectionOpen, setIsRequesterDirectionOpen] = useState(false);
  const [isRequesterDepartmentOpen, setIsRequesterDepartmentOpen] = useState(false);
  const [isRequesterServiceOpen, setIsRequesterServiceOpen] = useState(false);
  const [isRequesterSectorOpen, setIsRequesterSectorOpen] = useState(false);
  const [isRequesterRepartitionOpen, setIsRequesterRepartitionOpen] = useState(false);
  const [isDestinationDirectionOpen, setIsDestinationDirectionOpen] = useState(false);
  const [isDestinationDepartmentOpen, setIsDestinationDepartmentOpen] = useState(false);
  const [isDestinationServiceOpen, setIsDestinationServiceOpen] = useState(false);
  const [isDestinationSectorOpen, setIsDestinationSectorOpen] = useState(false);
  const [isDestinationRepartitionOpen, setIsDestinationRepartitionOpen] = useState(false);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: undefined,
      requester_name: "",
      items: [{ description: "", quantity: 1, unit: "UM" }], // Start with one empty item
      requester_direction_id: "",
      requester_department_id: "",
      requester_service_id: "",
      requester_sector_id: "",
      requester_repartition_id: "",
      destination_direction_id: "",
      destination_department_id: "",
      destination_service_id: "",
      destination_sector_id: "",
      destination_repartition_id: "",
    },
  });

  // Use useFieldArray to manage the dynamic items array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch Directions
  const { data: directions = [], isLoading: isDirectionsLoading } = useQuery({
    queryKey: ["directions"],
    queryFn: async () => {
      const res = await fetch("/api/equipment/directions");
      return res.json();
    },
  });

  // Fetch Departments based on selected direction (Requester)
  const requesterDirectionId = form.watch("requester_direction_id");
  const { data: requesterDepartments = [], isLoading: isRequesterDepartmentsLoading } = useQuery({
    queryKey: ["requester_departments", requesterDirectionId],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/departments/${requesterDirectionId}`);
      return res.json();
    },
    enabled: !!requesterDirectionId,
  });

  // Fetch Departments based on selected direction (Destination)
  const destinationDirectionId = form.watch("destination_direction_id");
  const { data: destinationDepartments = [], isLoading: isDestinationDepartmentsLoading } = useQuery({
    queryKey: ["destination_departments", destinationDirectionId],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/departments/${destinationDirectionId}`);
      return res.json();
    },
    enabled: !!destinationDirectionId,
  });

  // Fetch Services based on direction and department (Requester)
  const requesterDepartmentId = form.watch("requester_department_id");
  const { data: requesterServices = [], isLoading: isRequesterServicesLoading } = useQuery({
    queryKey: ["requester_services", requesterDirectionId, requesterDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/services?directionId=${requesterDirectionId || ""}&departmentId=${requesterDepartmentId || ""}`);
      return res.json();
    },
    enabled: !!requesterDirectionId || !!requesterDepartmentId,
  });

  // Fetch Services based on direction and department (Destination)
  const destinationDepartmentId = form.watch("destination_department_id");
  const { data: destinationServices = [], isLoading: isDestinationServicesLoading } = useQuery({
    queryKey: ["destination_services", destinationDirectionId, destinationDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/services?directionId=${destinationDirectionId || ""}&departmentId=${destinationDepartmentId || ""}`);
      return res.json();
    },
    enabled: !!destinationDirectionId || !!destinationDepartmentId,
  });

  // Fetch Sectors based on selected department (Requester)
  const { data: requesterSectors = [], isLoading: isRequesterSectorsLoading } = useQuery({
    queryKey: ["requester_sectors", requesterDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/sectors/${requesterDepartmentId}`);
      return res.json();
    },
    enabled: !!requesterDepartmentId,
  });

  // Fetch Sectors based on selected department (Destination)
  const { data: destinationSectors = [], isLoading: isDestinationSectorsLoading } = useQuery({
    queryKey: ["destination_sectors", destinationDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/sectors/${destinationDepartmentId}`);
      return res.json();
    },
    enabled: !!destinationDepartmentId,
  });

  // Fetch Repartitions based on selected department (Requester)
  const { data: requesterRepartitions = [], isLoading: isRequesterRepartitionsLoading } = useQuery({
    queryKey: ["requester_repartitions", requesterDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/repartitions/${requesterDepartmentId}`);
      return res.json();
    },
    enabled: !!requesterDepartmentId,
  });

  // Fetch Repartitions based on selected department (Destination)
  const { data: destinationRepartitions = [], isLoading: isDestinationRepartitionsLoading } = useQuery({
    queryKey: ["destination_repartitions", destinationDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/repartitions/${destinationDepartmentId}`);
      return res.json();
    },
    enabled: !!destinationDepartmentId,
  });

  // Mutation for creating request
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/requests/create", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      form.reset();
      toast({
        title: "Sucesso!",
        description: "Requisição criada com sucesso",
      });
      router.push("/requests");
    },
    onError: (error: Error) => {
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (values: RequestFormData) => {
    const formData = new FormData();
    // Add non-items fields to FormData
    formData.append("type", values.type);
    formData.append("requester_name", values.requester_name);
    if (values.requester_direction_id) formData.append("requester_direction_id", values.requester_direction_id);
    if (values.requester_department_id) formData.append("requester_department_id", values.requester_department_id);
    if (values.requester_service_id) formData.append("requester_service_id", values.requester_service_id);
    if (values.requester_sector_id) formData.append("requester_sector_id", values.requester_sector_id);
    if (values.requester_repartition_id) formData.append("requester_repartition_id", values.requester_repartition_id);
    if (values.destination_direction_id) formData.append("destination_direction_id", values.destination_direction_id);
    if (values.destination_department_id) formData.append("destination_department_id", values.destination_department_id);
    if (values.destination_service_id) formData.append("destination_service_id", values.destination_service_id);
    if (values.destination_sector_id) formData.append("destination_sector_id", values.destination_sector_id);
    if (values.destination_repartition_id) formData.append("destination_repartition_id", values.destination_repartition_id);

    // Add items to FormData as a JSON string
    formData.append("items", JSON.stringify(values.items));

    mutation.mutate(formData);
  };

  // Function to add a new item with a maximum limit
  const MAX_ITEMS = 10;
  const addNewItem = () => {
    if (fields.length >= MAX_ITEMS) {
      toast({
        title: "Limite atingido",
        description: `Você pode adicionar até ${MAX_ITEMS} itens.`,
        variant: "destructive",
      });
      return;
    }
    append({ description: "", quantity: 1, unit: "UM" });
  };

  // Function to remove an item with confirmation
  const removeItemWithConfirmation = (index: number) => {
    // if (confirm("Tem certeza de que deseja remover este item?")) {
      remove(index);
    // }
  };

  return (
    <TooltipProvider>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 border p-4 sm:p-6 rounded-lg shadow-sm w-full max-w-7xl mx-auto"
        >
          {/* Header - Responsive Flexbox */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold">HOSPITAL CENTRAL DE MAPUTO</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Gestão de Requisições</p>
            </div>
            <div className="w-full sm:w-auto flex flex-col items-center sm:items-end space-y-2">
              {/* Type Selection */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row items-center gap-2">
                    <FormLabel className="text-xs sm:text-sm font-normal">Tipo:</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {typeOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-1">
                            <Checkbox
                              checked={field.value === option.value}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange(option.value);
                                  form.trigger("type");
                                }
                              }}
                            />
                            <span className="text-xs sm:text-sm">{option.label}</span>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm">
                <p>Requisição Nº: (Gerado automaticamente)</p>
                <p>Data: {new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>

          {/* Items Table - Enhanced Responsiveness */}
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="min-w-48">
                  <TableHead className="text-xs sm:text-sm">
                    Designação e Característica
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Quantidade Solicitada
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={item.id} className="min-w-48">
                    <TableCell>
                      <div className="sm:hidden text-xs font-semibold mb-1">Descrição</div>
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="flex-3">
                            <FormControl>
                              <Textarea
                                placeholder="Descrição do item"
                                {...field}
                                className="w-full text-xs sm:text-sm h-24 sm:h-20 resize-y"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    {/* Quantity and Unit - Responsive Flex */}
                    <TableCell>
                      <div className="sm:hidden text-xs font-semibold mb-1">Quantidade</div>
                      <div className="flex space-x-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Qtd"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  className="w-full min-w-10 text-xs sm:text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Unid"
                                  {...field}
                                  className="w-full min-w-10 text-xs sm:text-sm"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TableCell>
                    {/* Action Column */}
                    <TableCell>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeItemWithConfirmation(index)}
                        disabled={fields.length === 1}
                        className="w-full sm:w-auto p-3 flex justify-center align-middle"
                      >
                        <Trash2 className="h-4 w-4" />

                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Item Button - Full Width on Mobile */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>

          {/* Requester and Destination Details - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Solicitante</h2>
              <FormField
                control={form.control}
                name="requester_name"
                render={({ field }) => (
                  <FormItem className="mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Nome do Solicitante <span className="text-red-500">*</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>Nome do responsável pela requisição</TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome"
                        {...field}
                        onBlur={() => form.trigger("requester_name")}
                        className="sm:h-9 h-8 text-xs sm:text-sm w-full"
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_direction_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Direção (Solicitante)
                    </FormLabel>
                    <Popover open={isRequesterDirectionOpen} onOpenChange={setIsRequesterDirectionOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={isDirectionsLoading}
                            aria-expanded={isRequesterDirectionOpen}
                            onClick={() => setIsRequesterDirectionOpen(true)}
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
                          <CommandInput placeholder="Pesquisar Direção..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhuma Direção encontrada.</CommandEmpty>
                            <CommandGroup>
                              {directions.map((dir: Direction) => (
                                <CommandItem
                                  value={dir.name}
                                  key={dir.id}
                                  onSelect={() => {
                                    field.onChange(dir.id);
                                    form.trigger("requester_direction_id");
                                    setIsRequesterDirectionOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_department_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Departamento (Solicitante)
                    </FormLabel>
                    <Popover open={isRequesterDepartmentOpen} onOpenChange={setIsRequesterDepartmentOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={!requesterDirectionId || isRequesterDepartmentsLoading}
                            aria-expanded={isRequesterDepartmentOpen}
                            onClick={() => setIsRequesterDepartmentOpen(true)}
                          >
                            {isRequesterDepartmentsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {field.value
                              ? requesterDepartments.find((dep: Department) => dep.id === field.value)?.name
                              : "Selecionar Departamento"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar Departamento..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhum Departamento encontrado.</CommandEmpty>
                            <CommandGroup>
                              {requesterDepartments.map((dep: Department) => (
                                <CommandItem
                                  value={dep.name}
                                  key={dep.id}
                                  onSelect={() => {
                                    field.onChange(dep.id);
                                    form.trigger("requester_department_id");
                                    setIsRequesterDepartmentOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_service_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Serviço (Solicitante)
                    </FormLabel>
                    <Popover open={isRequesterServiceOpen} onOpenChange={setIsRequesterServiceOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={isRequesterServicesLoading}
                            aria-expanded={isRequesterServiceOpen}
                            onClick={() => setIsRequesterServiceOpen(true)}
                          >
                            {isRequesterServicesLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {field.value
                              ? requesterServices.find((svc: Service) => svc.id === field.value)?.name
                              : "Selecionar Serviço"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar Serviço..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhum Serviço encontrado.</CommandEmpty>
                            <CommandGroup>
                              {requesterServices.map((svc: Service) => (
                                <CommandItem
                                  value={svc.name}
                                  key={svc.id}
                                  onSelect={() => {
                                    field.onChange(svc.id);
                                    form.trigger("requester_service_id");
                                    setIsRequesterServiceOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_sector_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Setor (Solicitante)
                    </FormLabel>
                    <Popover open={isRequesterSectorOpen} onOpenChange={setIsRequesterSectorOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={!requesterDepartmentId || isRequesterSectorsLoading}
                            aria-expanded={isRequesterSectorOpen}
                            onClick={() => setIsRequesterSectorOpen(true)}
                          >
                            {isRequesterSectorsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {field.value
                              ? requesterSectors.find((sec: Sector) => sec.id === field.value)?.name
                              : "Selecionar Setor"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar Setor..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhum Setor encontrado.</CommandEmpty>
                            <CommandGroup>
                              {requesterSectors.map((sec: Sector) => (
                                <CommandItem
                                  value={sec.name}
                                  key={sec.id}
                                  onSelect={() => {
                                    field.onChange(sec.id);
                                    form.trigger("requester_sector_id");
                                    setIsRequesterSectorOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_repartition_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Repartição (Solicitante)
                    </FormLabel>
                    <Popover open={isRequesterRepartitionOpen} onOpenChange={setIsRequesterRepartitionOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={!requesterDepartmentId || isRequesterRepartitionsLoading}
                            aria-expanded={isRequesterRepartitionOpen}
                            onClick={() => setIsRequesterRepartitionOpen(true)}
                          >
                            {isRequesterRepartitionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {field.value
                              ? requesterRepartitions.find((rep: Repartition) => rep.id === field.value)?.name
                              : "Selecionar Repartição"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar Repartição..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhuma Repartição encontrada.</CommandEmpty>
                            <CommandGroup>
                              {requesterRepartitions.map((rep: Repartition) => (
                                <CommandItem
                                  value={rep.name}
                                  key={rep.id}
                                  onSelect={() => {
                                    field.onChange(rep.id);
                                    form.trigger("requester_repartition_id");
                                    setIsRequesterRepartitionOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
            </div>

            {/* Destination Details */}
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Destinatário</h2>
              <FormField
                control={form.control}
                name="destination_direction_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Direção (Destinatário)
                    </FormLabel>
                    <Popover open={isDestinationDirectionOpen} onOpenChange={setIsDestinationDirectionOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={isDirectionsLoading}
                            aria-expanded={isDestinationDirectionOpen}
                            onClick={() => setIsDestinationDirectionOpen(true)}
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
                          <CommandInput placeholder="Pesquisar Direção..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhuma Direção encontrada.</CommandEmpty>
                            <CommandGroup>
                              {directions.map((dir: Direction) => (
                                <CommandItem
                                  value={dir.name}
                                  key={dir.id}
                                  onSelect={() => {
                                    field.onChange(dir.id);
                                    form.trigger("destination_direction_id");
                                    setIsDestinationDirectionOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_department_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Departamento (Destinatário)
                    </FormLabel>
                    <Popover open={isDestinationDepartmentOpen} onOpenChange={setIsDestinationDepartmentOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={!destinationDirectionId || isDestinationDepartmentsLoading}
                            aria-expanded={isDestinationDepartmentOpen}
                            onClick={() => setIsDestinationDepartmentOpen(true)}
                          >
                            {isDestinationDepartmentsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {field.value
                              ? destinationDepartments.find((dep: Department) => dep.id === field.value)?.name
                              : "Selecionar Departamento"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar Departamento..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhum Departamento encontrado.</CommandEmpty>
                            <CommandGroup>
                              {destinationDepartments.map((dep: Department) => (
                                <CommandItem
                                  value={dep.name}
                                  key={dep.id}
                                  onSelect={() => {
                                    field.onChange(dep.id);
                                    form.trigger("destination_department_id");
                                    setIsDestinationDepartmentOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_service_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Serviço (Destinatário)
                    </FormLabel>
                    <Popover open={isDestinationServiceOpen} onOpenChange={setIsDestinationServiceOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={isDestinationServicesLoading}
                            aria-expanded={isDestinationServiceOpen}
                            onClick={() => setIsDestinationServiceOpen(true)}
                          >
                            {isDestinationServicesLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {field.value
                              ? destinationServices.find((svc: Service) => svc.id === field.value)?.name
                              : "Selecionar Serviço"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar Serviço..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhum Serviço encontrado.</CommandEmpty>
                            <CommandGroup>
                              {destinationServices.map((svc: Service) => (
                                <CommandItem
                                  value={svc.name}
                                  key={svc.id}
                                  onSelect={() => {
                                    field.onChange(svc.id);
                                    form.trigger("destination_service_id");
                                    setIsDestinationServiceOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_sector_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Setor (Destinatário)
                    </FormLabel>
                    <Popover open={isDestinationSectorOpen} onOpenChange={setIsDestinationSectorOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={!destinationDepartmentId || isDestinationSectorsLoading}
                            aria-expanded={isDestinationSectorOpen}
                            onClick={() => setIsDestinationSectorOpen(true)}
                          >
                            {isDestinationSectorsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {field.value
                              ? destinationSectors.find((sec: Sector) => sec.id === field.value)?.name
                              : "Selecionar Setor"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar Setor..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhum Setor encontrado.</CommandEmpty>
                            <CommandGroup>
                              {destinationSectors.map((sec: Sector) => (
                                <CommandItem
                                  value={sec.name}
                                  key={sec.id}
                                  onSelect={() => {
                                    field.onChange(sec.id);
                                    form.trigger("destination_sector_id");
                                    setIsDestinationSectorOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_repartition_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4 relative">
                    <FormLabel className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      Repartição (Destinatário)
                    </FormLabel>
                    <Popover open={isDestinationRepartitionOpen} onOpenChange={setIsDestinationRepartitionOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground sm:h-9 h-8 text-xs sm:text-sm")}
                            disabled={!destinationDepartmentId || isDestinationRepartitionsLoading}
                            aria-expanded={isDestinationRepartitionOpen}
                            onClick={() => setIsDestinationRepartitionOpen(true)}
                          >
                            {isDestinationRepartitionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {field.value
                              ? destinationRepartitions.find((rep: Repartition) => rep.id === field.value)?.name
                              : "Selecionar Repartição"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar Repartição..." className="text-xs sm:text-sm sm:h-9 h-8" />
                          <CommandList>
                            <CommandEmpty>Nenhuma Repartição encontrada.</CommandEmpty>
                            <CommandGroup>
                              {destinationRepartitions.map((rep: Repartition) => (
                                <CommandItem
                                  value={rep.name}
                                  key={rep.id}
                                  onSelect={() => {
                                    field.onChange(rep.id);
                                    form.trigger("destination_repartition_id");
                                    setIsDestinationRepartitionOpen(false);
                                  }}
                                  className="text-xs sm:text-sm"
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
                    <FormMessage className="text-xs absolute top-full mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Error Message and Submit Button */}
          {form.formState.errors.root && (
            <p className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {form.formState.errors.root.message}
            </p>
          )}
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={mutation.isPending} className="sm:h-9 h-8 text-xs sm:text-sm w-full sm:w-auto">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar Requisição"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </TooltipProvider>
  );
}