"use client";

import {
    create_equipment,
    fetchDepartmentsByDirection,
    fetchDirections,
    fetchRepartitionsByDepartment,
    fetchSectorsByDepartment,
    fetchServices,
} from "@/actions/equipment";
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
import {
    AlertCircle,
    Calendar,
    Check,
    ChevronsUpDown,
    Hash,
    Hospital,
    Loader2,
    MonitorSmartphone,
    Tag,
    Wrench
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const equipment_schema = z.object({
    serial_number: z.string().min(1, { message: "Número de série é obrigatório" }),
    type: z.string().min(1, { message: "Tipo é obrigatório" }),
    brand: z.string().min(1, { message: "Marca é obrigatória" }),
    model: z.string().min(1, { message: "Modelo é obrigatório" }),
    purchase_date: z.string().optional(),
    warranty_end: z.string().optional(),
    status: z.enum(["ATIVO", "MANUTENÇÃO", "REPARO", "INATIVO"], {
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
    { value: "ATIVO", label: "Ativo" },
    { value: "MANUTENÇÃO", label: "Manutenção" },
    { value: "REPARO", label: "Reparo" },
    { value: "INATIVO", label: "Inativo" },
] as const;

export function EquipmentForm() {
    const [is_pending, start_transition] = useTransition();
    const [directions, setDirections] = useState<{ id: string; name: string }[]>([]);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);
    const [services, setServices] = useState<{ id: string; name: string }[]>([]);
    const [repartitions, setRepartitions] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<EquipmentFormData>({
        resolver: zodResolver(equipment_schema),
        defaultValues: {
            serial_number: "",
            type: "",
            brand: "",
            model: "",
            purchase_date: "",
            warranty_end: "",
            status: undefined, // Required but starts undefined
            direction_id: "",
            department_id: "",
            sector_id: "",
            service_id: "",
            repartition_id: "",
        },
    });

    // Load initial directions
    useEffect(() => {
        const loadDirections = async () => {
            setIsLoading(true);
            try {
                const dirs = await fetchDirections();
                setDirections(dirs || []);
            } catch (error) {
                console.error("Erro ao carregar direções:", error);
                setDirections([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadDirections();
    }, []);

    // Watch for direction changes
    const selectedDirectionId = form.watch("direction_id");
    useEffect(() => {
        if (!selectedDirectionId) {
            setDepartments([]);
            setServices([]);
            form.setValue("department_id", "");
            form.setValue("service_id", "");
            return;
        }

        const loadDepartmentsAndServices = async () => {
            try {
                const [deps, servs] = await Promise.all([
                    fetchDepartmentsByDirection(selectedDirectionId),
                    fetchServices(selectedDirectionId, null),
                ]);
                setDepartments(deps || []);
                setServices(servs || []);
            } catch (error) {
                console.error("Erro ao carregar departamentos e serviços:", error);
                setDepartments([]);
                setServices([]);
            }
        };

        loadDepartmentsAndServices();
    }, [selectedDirectionId, form]);

    // Watch for department changes
    const selectedDepartmentId = form.watch("department_id");
    useEffect(() => {
        if (!selectedDepartmentId) {
            setSectors([]);
            setRepartitions([]);
            form.setValue("sector_id", "");
            form.setValue("repartition_id", "");
            return;
        }

        const loadDepartmentData = async () => {
            try {
                const [secs, reps, servs] = await Promise.all([
                    fetchSectorsByDepartment(selectedDepartmentId),
                    fetchRepartitionsByDepartment(selectedDepartmentId),
                    fetchServices(selectedDirectionId, selectedDepartmentId),
                ]);
                setSectors(secs || []);
                setRepartitions(reps || []);
                setServices(servs || []);
            } catch (error) {
                console.error("Erro ao carregar dados do departamento:", error);
                setSectors([]);
                setRepartitions([]);
                setServices([]);
            }
        };

        loadDepartmentData();
    }, [selectedDepartmentId, selectedDirectionId, form]);

    const on_submit = async (values: EquipmentFormData) => {
        start_transition(async () => {
            const result = await create_equipment(values);
            if (result.success) {
                form.reset();
                toast({
                    title: "Sucesso!",
                    description: "Equipamento Registrado com sucesso",
                });
                router.push("/dashboard/equipment");
            } else {
                form.setError("root", { message: result.error });
            }
        });
    };

    return (
        <TooltipProvider>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(on_submit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="serial_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        <Hash className="h-4 w-4" />
                                        Número de Série{" "}
                                        <span className="text-red-500">*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertCircle className="h-4 w-4 text-gray-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Identificador único do equipamento
                                            </TooltipContent>
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
                                    <FormDescription id="serial_number-description">
                                        Número único fornecido pelo fabricante.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        <MonitorSmartphone className="h-4 w-4" />
                                        Tipo <span className="text-red-500">*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertCircle className="h-4 w-4 text-gray-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Tipo do equipamento
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o tipo do equipamento"
                                            {...field}
                                            onBlur={() => form.trigger("type")}
                                            aria-required="true"
                                            aria-describedby="type-description"
                                        />
                                    </FormControl>
                                    <FormDescription id="type-description">
                                        Exemplo: "PC".
                                    </FormDescription>
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
                                            <TooltipContent>
                                                Fabricante do equipamento
                                            </TooltipContent>
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
                                    <FormDescription id="brand-description">
                                        Exemplo: "Lenovo".
                                    </FormDescription>
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
                                            <TooltipContent>
                                                Modelo específico do equipamento
                                            </TooltipContent>
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
                                    <FormDescription id="model-description">
                                        Exemplo: "ThinkStation".
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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
                                    <FormDescription id="purchase_date-description">
                                        Data em que o equipamento foi adquirido.
                                    </FormDescription>
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
                                    <FormDescription id="warranty_end-description">
                                        Data de expiração da garantia.
                                    </FormDescription>
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
                                            <TooltipContent>
                                                Estado actual do equipamento
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    aria-expanded={false}
                                                    aria-required="true"
                                                    aria-describedby="status-description"
                                                >
                                                    {field.value
                                                        ? statusOptions.find(
                                                            (opt) => opt.value === field.value
                                                        )?.label
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
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        option.value === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
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
                                    <FormDescription id="status-description">
                                        Exemplo: "Activo" ou "Manutenção".
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                        <FormField
                            control={form.control}
                            name="direction_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <Hospital className="h-4 w-4" />
                                        Direcção
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={isLoading}
                                                    aria-expanded={false}
                                                    aria-describedby="direction_id-description"
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : null}
                                                    {field.value
                                                        ? directions.find((dir) => dir.id === field.value)?.name
                                                        : "Selecionar Direcção"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Pesquisar Direção..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhuma Direcção encontrada.</CommandEmpty>
                                                    <CommandGroup>
                                                        {isLoading ? (
                                                            <CommandItem disabled>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Carregando...
                                                            </CommandItem>
                                                        ) : (
                                                            directions.map((dir) => (
                                                                <CommandItem
                                                                    value={dir.name}
                                                                    key={dir.id}
                                                                    onSelect={() => {
                                                                        field.onChange(dir.id);
                                                                        form.trigger("direction_id");
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            dir.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {dir.name}
                                                                </CommandItem>
                                                            ))
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="direction_id-description">
                                        Direcção responsável pelo equipamento.
                                    </FormDescription>
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
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={!selectedDirectionId || isLoading}
                                                    aria-expanded={false}
                                                    aria-describedby="department_id-description"
                                                >
                                                    {isLoading && selectedDirectionId ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : null}
                                                    {field.value
                                                        ? departments.find((dep) => dep.id === field.value)?.name
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
                                                        {isLoading && selectedDirectionId ? (
                                                            <CommandItem disabled>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Carregando...
                                                            </CommandItem>
                                                        ) : (
                                                            departments.map((dep) => (
                                                                <CommandItem
                                                                    value={dep.name}
                                                                    key={dep.id}
                                                                    onSelect={() => {
                                                                        field.onChange(dep.id);
                                                                        form.trigger("department_id");
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            dep.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {dep.name}
                                                                </CommandItem>
                                                            ))
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="department_id-description">
                                        Departamento dentro da direção.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sector_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center gap-1">
                                        <Hospital className="h-4 w-4" />
                                        Sector
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={!selectedDepartmentId || isLoading}
                                                    aria-expanded={false}
                                                    aria-describedby="sector_id-description"
                                                >
                                                    {isLoading && selectedDepartmentId ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : null}
                                                    {field.value
                                                        ? sectors.find((sec) => sec.id === field.value)?.name
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
                                                        {isLoading && selectedDepartmentId ? (
                                                            <CommandItem disabled>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Carregando...
                                                            </CommandItem>
                                                        ) : (
                                                            sectors.map((sec) => (
                                                                <CommandItem
                                                                    value={sec.name}
                                                                    key={sec.id}
                                                                    onSelect={() => {
                                                                        field.onChange(sec.id);
                                                                        form.trigger("sector_id");
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            sec.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {sec.name}
                                                                </CommandItem>
                                                            ))
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="sector_id-description">
                                        Sector específico dentro do departamento.
                                    </FormDescription>
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
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={!selectedDirectionId || isLoading}
                                                    aria-expanded={false}
                                                    aria-describedby="service_id-description"
                                                >
                                                    {isLoading && selectedDirectionId ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : null}
                                                    {field.value
                                                        ? services.find((svc) => svc.id === field.value)?.name
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
                                                        {isLoading && selectedDirectionId ? (
                                                            <CommandItem disabled>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Carregando...
                                                            </CommandItem>
                                                        ) : (
                                                            services.map((svc) => (
                                                                <CommandItem
                                                                    value={svc.name}
                                                                    key={svc.id}
                                                                    onSelect={() => {
                                                                        field.onChange(svc.id);
                                                                        form.trigger("service_id");
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            svc.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {svc.name}
                                                                </CommandItem>
                                                            ))
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="service_id-description">
                                        Serviço associado ao equipamento.
                                    </FormDescription>
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
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={!selectedDepartmentId || isLoading}
                                                    aria-expanded={false}
                                                    aria-describedby="repartition_id-description"
                                                >
                                                    {isLoading && selectedDepartmentId ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : null}
                                                    {field.value
                                                        ? repartitions.find((rep) => rep.id === field.value)?.name
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
                                                        {isLoading && selectedDepartmentId ? (
                                                            <CommandItem disabled>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Carregando...
                                                            </CommandItem>
                                                        ) : (
                                                            repartitions.map((rep) => (
                                                                <CommandItem
                                                                    value={rep.name}
                                                                    key={rep.id}
                                                                    onSelect={() => {
                                                                        field.onChange(rep.id);
                                                                        form.trigger("repartition_id");
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            rep.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {rep.name}
                                                                </CommandItem>
                                                            ))
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription id="repartition_id-description">
                                        Repartição onde o equipamento está alocado.
                                    </FormDescription>
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
                        <Button type="submit" disabled={is_pending}>
                            {is_pending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Adicionar Equipamento"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </TooltipProvider>
    );
}