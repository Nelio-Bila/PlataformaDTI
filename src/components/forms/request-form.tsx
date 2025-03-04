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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Hash,
  Hospital,
  Loader2,
  Package,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const requestSchema = z.object({
  type: z.enum(["REQUISITION", "RETURN", "SUBSTITUTION"], { required_error: "Tipo é obrigatório" }),
  requester_name: z.string().min(1, { message: "Nome do solicitante é obrigatório" }),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  quantity: z.number().min(1, { message: "Quantidade deve ser pelo menos 1" }),
  unit: z.string().optional(),
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

  const [isTypeOpen, setIsTypeOpen] = useState(false);
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
      description: "",
      quantity: 1,
      unit: "UM",
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

  // Fetch Directions
  const { data: directions = [], isLoading: isDirectionsLoading } = useQuery({
    queryKey: ["directions"],
    queryFn: () => fetch("/api/equipment/directions").then((res) => res.json()),
  });

  // Fetch Departments based on selected direction (Requester)
  const requesterDirectionId = form.watch("requester_direction_id");
  const { data: requesterDepartments = [], isLoading: isRequesterDepartmentsLoading } = useQuery({
    queryKey: ["requester_departments", requesterDirectionId],
    queryFn: () => fetch(`/api/equipment/departments/${requesterDirectionId}`).then((res) => res.json()),
    enabled: !!requesterDirectionId,
  });

  // Fetch Departments based on selected direction (Destination)
  const destinationDirectionId = form.watch("destination_direction_id");
  const { data: destinationDepartments = [], isLoading: isDestinationDepartmentsLoading } = useQuery({
    queryKey: ["destination_departments", destinationDirectionId],
    queryFn: () => fetch(`/api/equipment/departments/${destinationDirectionId}`).then((res) => res.json()),
    enabled: !!destinationDirectionId,
  });

  // Fetch Services based on direction and department (Requester)
  const requesterDepartmentId = form.watch("requester_department_id");
  const { data: requesterServices = [], isLoading: isRequesterServicesLoading } = useQuery({
    queryKey: ["requester_services", requesterDirectionId, requesterDepartmentId],
    queryFn: () => fetch(`/api/equipment/services?directionId=${requesterDirectionId || ""}&departmentId=${requesterDepartmentId || ""}`).then((res) => res.json()),
    enabled: !!requesterDirectionId || !!requesterDepartmentId,
  });

  // Fetch Services based on direction and department (Destination)
  const destinationDepartmentId = form.watch("destination_department_id");
  const { data: destinationServices = [], isLoading: isDestinationServicesLoading } = useQuery({
    queryKey: ["destination_services", destinationDirectionId, destinationDepartmentId],
    queryFn: () => fetch(`/api/equipment/services?directionId=${destinationDirectionId || ""}&departmentId=${destinationDepartmentId || ""}`).then((res) => res.json()),
    enabled: !!destinationDirectionId || !!destinationDepartmentId,
  });

  // Fetch Sectors based on selected department (Requester)
  const { data: requesterSectors = [], isLoading: isRequesterSectorsLoading } = useQuery({
    queryKey: ["requester_sectors", requesterDepartmentId],
    queryFn: () => fetch(`/api/equipment/sectors/${requesterDepartmentId}`).then((res) => res.json()),
    enabled: !!requesterDepartmentId,
  });

  // Fetch Sectors based on selected department (Destination)
  const { data: destinationSectors = [], isLoading: isDestinationSectorsLoading } = useQuery({
    queryKey: ["destination_sectors", destinationDepartmentId],
    queryFn: () => fetch(`/api/equipment/sectors/${destinationDepartmentId}`).then((res) => res.json()),
    enabled: !!destinationDepartmentId,
  });

  // Fetch Repartitions based on selected department (Requester)
  const { data: requesterRepartitions = [], isLoading: isRequesterRepartitionsLoading } = useQuery({
    queryKey: ["requester_repartitions", requesterDepartmentId],
    queryFn: () => fetch(`/api/equipment/repartitions/${requesterDepartmentId}`).then((res) => res.json()),
    enabled: !!requesterDepartmentId,
  });

  // Fetch Repartitions based on selected department (Destination)
  const { data: destinationRepartitions = [], isLoading: isDestinationRepartitionsLoading } = useQuery({
    queryKey: ["destination_repartitions", destinationDepartmentId],
    queryFn: () => fetch(`/api/equipment/repartitions/${destinationDepartmentId}`).then((res) => res.json()),
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
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value.toString());
    });

    mutation.mutate(formData);
  };

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border p-6 rounded-lg shadow">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">SERVIÇO NACIONAL DE SAÚDE</h1>
              <p className="text-sm">HOSPITAL CENTRAL DE MAPUTO</p>
              <p className="text-sm">SERVIÇO DE ARMAZÉM</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="flex items-center gap-1">
                        Tipo:
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          {typeOptions.map((option) => (
                            <div key={option.value} className="flex items-center gap-1">
                              <Checkbox
                                checked={field.value === option.value}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(option.value);
                                    form.trigger("type");
                                  }
                                }}
                              />
                              <span>{option.label}</span>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm mt-2">Requisição Nº: (Gerado automaticamente)</p>
              <p className="text-sm">Data: {new Date().toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          {/* Main Section: Item Details */}
          <div className="mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Designação e Característica</TableHead>
                  <TableHead>Quantidade Solicitada</TableHead>
                  <TableHead>Quantidade Fornecida</TableHead>
                  <TableHead>Classificação Patrimonial</TableHead>
                  <TableHead>Custo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Digite a descrição do item"
                              {...field}
                              onBlur={() => form.trigger("description")}
                              aria-required="true"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Quantidade"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                onBlur={() => form.trigger("quantity")}
                                aria-required="true"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Unidade (ex: UM)"
                                {...field}
                                onBlur={() => form.trigger("unit")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input disabled placeholder="A ser preenchido pelo destinatário" />
                  </TableCell>
                  <TableCell>
                    <Input disabled placeholder="A ser preenchido pelo destinatário" />
                  </TableCell>
                  <TableCell>
                    <Input disabled placeholder="A ser preenchido pelo destinatário" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Footer: Requester and Destination Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requester Details */}
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Solicitante</h2>
              <FormField
                control={form.control}
                name="requester_name"
                render={({ field }) => (
                  <FormItem className="mb-4">
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
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_direction_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                                    form.trigger("requester_direction_id");
                                    setIsRequesterDirectionOpen(false);
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_department_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          <CommandInput placeholder="Pesquisar Departamento..." />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_service_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          <CommandInput placeholder="Pesquisar Serviço..." />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_sector_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          <CommandInput placeholder="Pesquisar Setor..." />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requester_repartition_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          <CommandInput placeholder="Pesquisar Repartição..." />
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
                    <FormMessage />
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
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                                    form.trigger("destination_direction_id");
                                    setIsDestinationDirectionOpen(false);
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_department_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          <CommandInput placeholder="Pesquisar Departamento..." />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_service_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          <CommandInput placeholder="Pesquisar Serviço..." />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_sector_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          <CommandInput placeholder="Pesquisar Setor..." />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_repartition_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col mb-4">
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
                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
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
                          <CommandInput placeholder="Pesquisar Repartição..." />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Signature Fields (Optional, for Display Purposes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <FormLabel className="block mb-2">Requisitado por:</FormLabel>
              <Input disabled placeholder="Assinatura do Solicitante (a ser preenchida manualmente)" />
            </div>
            <div>
              <FormLabel className="block mb-2">Recebido por:</FormLabel>
              <Input disabled placeholder="Assinatura do Destinatário (a ser preenchida manualmente)" />
            </div>
          </div>

          {/* Error Message and Submit Button */}
          {form.formState.errors.root && (
            <p className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {form.formState.errors.root.message}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
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