"use client";

import { fetch_equipment_for_reports } from "@/actions/equipment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusOptions, typeOptions } from "@/types/equipment";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    AlertTriangle,
    BarChart3,
    Building,
    Calendar,
    CheckCircle,
    Computer,
    Download,
    FileSpreadsheet,
    MapPin,
    PieChart,
    Printer,
    TrendingUp,
    User,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';

// Type that matches the actual database return structure
type DatabaseEquipment = {
  id: string;
  serial_number: string | null;
  type: string;
  brand: string;
  model: string;
  status: string;
  purchase_date: Date | null;
  warranty_end: Date | null;
  observations: string | null;
  extra_fields: any;
  direction_id: string | null;
  department_id: string | null;
  sector_id: string | null;
  service_id: string | null;
  repartition_id: string | null;
  registered_by: string | null;
  created_at: Date;
  updated_at: Date;
  direction: { id: string; name: string; created_at: Date; updated_at: Date; } | null;
  department: { id: string; name: string; created_at: Date; updated_at: Date; direction_id: string; } | null;
  sector: { id: string; name: string; created_at: Date; updated_at: Date; department_id: string | null; service_id: string | null; } | null;
  service: { id: string; name: string; created_at: Date; updated_at: Date; department_id: string | null; direction_id: string | null; } | null;
  repartition: { id: string; name: string; created_at: Date; updated_at: Date; department_id: string; } | null;
  registeredBy: { id: string; name: string | null; email: string | null; } | null;
  images: { id: string; created_at: Date; description: string | null; equipment_id: string; cloudinary_public_id: string | null; url: string; }[];
};

interface ReportData {
  equipment: DatabaseEquipment[];
  summary: {
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
    byType: Record<string, number>;
    byDirection: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

export function ReportsClient() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetch_equipment_for_reports();
        setReportData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    
    const csvContent = [
      // Header
      "Número de Série,Tipo,Marca,Modelo,Status,Direção,Departamento,Setor,Serviço,Repartição,Data de Compra,Fim da Garantia,Registrado por,Data de Registro",
      // Data rows
      ...reportData.equipment.map(item => [
        item.serial_number || "N/A",
        getTypeLabel(item.type),
        item.brand,
        item.model,
        getStatusLabel(item.status),
        item.direction?.name || "",
        item.department?.name || "",
        item.sector?.name || "",
        item.service?.name || "",
        item.repartition?.name || "",
        item.purchase_date ? format(new Date(item.purchase_date), "dd/MM/yyyy") : "",
        item.warranty_end ? format(new Date(item.warranty_end), "dd/MM/yyyy") : "",
        item.registeredBy?.name || "",
        format(new Date(item.created_at), "dd/MM/yyyy HH:mm")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_equipamentos_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
      ["RELATÓRIO DE EQUIPAMENTOS INFORMÁTICOS"],
      ["Hospital Central de Maputo - DTI"],
      [`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`],
      [""],
      ["RESUMO GERAL"],
      ["Total de Equipamentos", reportData.summary.total.toString()],
      ["Equipamentos Ativos", reportData.summary.active.toString()],
      ["Equipamentos em Manutenção", reportData.summary.maintenance.toString()],
      ["Equipamentos Inativos", reportData.summary.inactive.toString()],
      [""],
      ["PERCENTUAIS"],
      ["Taxa de Equipamentos Ativos", `${((reportData.summary.active / reportData.summary.total) * 100).toFixed(1)}%`],
      ["Taxa de Manutenção", `${((reportData.summary.maintenance / reportData.summary.total) * 100).toFixed(1)}%`],
      ["Taxa de Inativos", `${((reportData.summary.inactive / reportData.summary.total) * 100).toFixed(1)}%`],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style the summary sheet
    summarySheet['!cols'] = [{ width: 30 }, { width: 20 }];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    // 2. Equipment List Sheet
    const equipmentData = [
      [
        "Número de Série",
        "Tipo",
        "Marca",
        "Modelo",
        "Status",
        "Direção",
        "Departamento",
        "Setor",
        "Serviço",
        "Repartição",
        "Data de Compra",
        "Fim da Garantia",
        "Observações",
        "Registrado por",
        "Data de Registro"
      ],
      ...reportData.equipment.map(item => [
        item.serial_number || "N/A",
        getTypeLabel(item.type),
        item.brand,
        item.model,
        getStatusLabel(item.status),
        item.direction?.name || "",
        item.department?.name || "",
        item.sector?.name || "",
        item.service?.name || "",
        item.repartition?.name || "",
        item.purchase_date ? format(new Date(item.purchase_date), "dd/MM/yyyy") : "",
        item.warranty_end ? format(new Date(item.warranty_end), "dd/MM/yyyy") : "",
        item.observations || "",
        item.registeredBy?.name || "",
        format(new Date(item.created_at), "dd/MM/yyyy HH:mm")
      ])
    ];

    const equipmentSheet = XLSX.utils.aoa_to_sheet(equipmentData);
    
    // Auto-size columns
    equipmentSheet['!cols'] = [
      { width: 20 }, // Serial Number
      { width: 15 }, // Type
      { width: 15 }, // Brand
      { width: 20 }, // Model
      { width: 12 }, // Status
      { width: 25 }, // Direction
      { width: 25 }, // Department
      { width: 20 }, // Sector
      { width: 20 }, // Service
      { width: 20 }, // Repartition
      { width: 15 }, // Purchase Date
      { width: 15 }, // Warranty End
      { width: 30 }, // Observations
      { width: 20 }, // Registered By
      { width: 18 }  // Created At
    ];

    XLSX.utils.book_append_sheet(workbook, equipmentSheet, "Lista Completa");

    // 3. Statistics by Type Sheet
    const typeStatsData = [
      ["EQUIPAMENTOS POR TIPO"],
      [""],
      ["Tipo", "Quantidade", "Percentual"],
      ...Object.entries(reportData.summary.byType)
        .sort(([,a], [,b]) => b - a)
        .map(([type, count]) => [
          getTypeLabel(type),
          count.toString(),
          `${((count / reportData.summary.total) * 100).toFixed(1)}%`
        ])
    ];

    const typeStatsSheet = XLSX.utils.aoa_to_sheet(typeStatsData);
    typeStatsSheet['!cols'] = [{ width: 25 }, { width: 15 }, { width: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, typeStatsSheet, "Estatísticas por Tipo");

    // 4. Statistics by Direction Sheet
    const directionStatsData = [
      ["EQUIPAMENTOS POR DIREÇÃO"],
      [""],
      ["Direção", "Quantidade", "Percentual"],
      ...Object.entries(reportData.summary.byDirection)
        .sort(([,a], [,b]) => b - a)
        .map(([direction, count]) => [
          direction,
          count.toString(),
          `${((count / reportData.summary.total) * 100).toFixed(1)}%`
        ])
    ];

    const directionStatsSheet = XLSX.utils.aoa_to_sheet(directionStatsData);
    directionStatsSheet['!cols'] = [{ width: 35 }, { width: 15 }, { width: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, directionStatsSheet, "Estatísticas por Direção");

    // 5. Statistics by Status Sheet
    const statusStatsData = [
      ["EQUIPAMENTOS POR STATUS"],
      [""],
      ["Status", "Quantidade", "Percentual"],
      ...Object.entries(reportData.summary.byStatus)
        .sort(([,a], [,b]) => b - a)
        .map(([status, count]) => [
          getStatusLabel(status),
          count.toString(),
          `${((count / reportData.summary.total) * 100).toFixed(1)}%`
        ])
    ];

    const statusStatsSheet = XLSX.utils.aoa_to_sheet(statusStatsData);
    statusStatsSheet['!cols'] = [{ width: 20 }, { width: 15 }, { width: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, statusStatsSheet, "Estatísticas por Status");

    // 6. Equipment by Direction Detail Sheet
    const directionDetailData = [
      ["DETALHAMENTO POR DIREÇÃO"],
      [""],
      ["Direção", "Departamento", "Setor", "Serviço", "Repartição", "Número de Série", "Tipo", "Marca", "Modelo", "Status"]
    ];

    // Group equipment by direction for detailed view
    const equipmentByDirection = reportData.equipment.reduce((acc, item) => {
      const directionName = item.direction?.name || 'Sem Direção';
      if (!acc[directionName]) acc[directionName] = [];
      acc[directionName].push(item);
      return acc;
    }, {} as Record<string, DatabaseEquipment[]>);

    Object.entries(equipmentByDirection)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([direction, equipment]) => {
        directionDetailData.push([`=== ${direction} ===`, "", "", "", "", "", "", "", "", ""]);
        equipment.forEach(item => {
          directionDetailData.push([
            direction,
            item.department?.name || "",
            item.sector?.name || "",
            item.service?.name || "",
            item.repartition?.name || "",
            item.serial_number || "N/A",
            getTypeLabel(item.type),
            item.brand,
            item.model,
            getStatusLabel(item.status)
          ]);
        });
        directionDetailData.push(["", "", "", "", "", "", "", "", "", ""]);
      });

    const directionDetailSheet = XLSX.utils.aoa_to_sheet(directionDetailData);
    directionDetailSheet['!cols'] = [
      { width: 30 }, // Direction
      { width: 25 }, // Department
      { width: 20 }, // Sector
      { width: 20 }, // Service
      { width: 20 }, // Repartition
      { width: 20 }, // Serial Number
      { width: 15 }, // Type
      { width: 15 }, // Brand
      { width: 20 }, // Model
      { width: 12 }  // Status
    ];

    XLSX.utils.book_append_sheet(workbook, directionDetailSheet, "Detalhamento por Direção");

    // 7. Warranty Status Sheet
    const currentDate = new Date();
    const warrantyData = [
      ["ANÁLISE DE GARANTIAS"],
      [""],
      ["Status da Garantia", "Quantidade", "Percentual"],
    ];

    let warrantyActive = 0;
    let warrantyExpired = 0;
    let warrantyUnknown = 0;

    reportData.equipment.forEach(item => {
      if (!item.warranty_end) {
        warrantyUnknown++;
      } else if (new Date(item.warranty_end) > currentDate) {
        warrantyActive++;
      } else {
        warrantyExpired++;
      }
    });

    warrantyData.push(
      ["Garantia Ativa", warrantyActive.toString(), `${((warrantyActive / reportData.summary.total) * 100).toFixed(1)}%`],
      ["Garantia Expirada", warrantyExpired.toString(), `${((warrantyExpired / reportData.summary.total) * 100).toFixed(1)}%`],
      ["Garantia Não Informada", warrantyUnknown.toString(), `${((warrantyUnknown / reportData.summary.total) * 100).toFixed(1)}%`]
    );

    const warrantySheet = XLSX.utils.aoa_to_sheet(warrantyData);
    warrantySheet['!cols'] = [{ width: 25 }, { width: 15 }, { width: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, warrantySheet, "Análise de Garantias");

    // 8. Equipment Age Analysis
    const ageAnalysisData = [
      ["ANÁLISE DE IDADE DOS EQUIPAMENTOS"],
      [""],
      ["Número de Série", "Tipo", "Marca", "Modelo", "Data de Compra", "Idade (Anos)", "Status da Garantia"]
    ];

    reportData.equipment
      .filter(item => item.purchase_date)
      .sort((a, b) => new Date(a.purchase_date!).getTime() - new Date(b.purchase_date!).getTime())
      .forEach(item => {
        const purchaseDate = new Date(item.purchase_date!);
        const ageInYears = ((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
        
        let warrantyStatus = "Não informada";
        if (item.warranty_end) {
          warrantyStatus = new Date(item.warranty_end) > currentDate ? "Ativa" : "Expirada";
        }

        ageAnalysisData.push([
          item.serial_number || "N/A",
          getTypeLabel(item.type),
          item.brand,
          item.model,
          format(purchaseDate, "dd/MM/yyyy"),
          ageInYears,
          warrantyStatus
        ]);
      });

    const ageAnalysisSheet = XLSX.utils.aoa_to_sheet(ageAnalysisData);
    ageAnalysisSheet['!cols'] = [
      { width: 20 }, // Serial Number
      { width: 15 }, // Type
      { width: 15 }, // Brand
      { width: 20 }, // Model
      { width: 15 }, // Purchase Date
      { width: 15 }, // Age
      { width: 20 }  // Warranty Status
    ];

    XLSX.utils.book_append_sheet(workbook, ageAnalysisSheet, "Análise de Idade");

    // 9. Monthly Registration Trends
    const registrationTrends = reportData.equipment.reduce((acc, item) => {
      const monthYear = format(new Date(item.created_at), "MM/yyyy");
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trendsData = [
      ["TENDÊNCIAS DE REGISTRO MENSAL"],
      [""],
      ["Mês/Ano", "Quantidade de Registros"],
      ...Object.entries(registrationTrends)
        .sort(([a], [b]) => {
          const [monthA, yearA] = a.split('/');
          const [monthB, yearB] = b.split('/');
          return new Date(parseInt(yearA), parseInt(monthA) - 1).getTime() - 
                 new Date(parseInt(yearB), parseInt(monthB) - 1).getTime();
        })
        .map(([monthYear, count]) => [monthYear, count])
    ];

    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    trendsSheet['!cols'] = [{ width: 15 }, { width: 25 }];
    
    XLSX.utils.book_append_sheet(workbook, trendsSheet, "Tendências de Registro");

    // Save the file
    const fileName = `relatorio_equipamentos_completo_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const getTypeLabel = (type: string) => {
    return typeOptions.find(option => option.value === type)?.label || type;
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(option => option.value === status)?.label || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "MANUTENÇÃO":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "INACTIVO":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "default";
      case "MANUTENÇÃO":
        return "secondary";
      case "INACTIVO":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios de Equipamentos</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios de Equipamentos</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios de Equipamentos</h1>
          <p className="text-muted-foreground">
            Relatório gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel Completo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold">Hospital Central de Maputo</h1>
        <h2 className="text-xl font-semibold">Departamento de Tecnologias de Informação</h2>
        <h3 className="text-lg">Relatório de Equipamentos Informáticos</h3>
        <p className="text-sm text-gray-600 mt-2">
          Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
            <Computer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.total}</div>
            <p className="text-xs text-muted-foreground">
              Equipamentos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipamentos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportData.summary.active}</div>
            <p className="text-xs text-muted-foreground">
              {((reportData.summary.active / reportData.summary.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reportData.summary.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              {((reportData.summary.maintenance / reportData.summary.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipamentos Inativos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reportData.summary.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {((reportData.summary.inactive / reportData.summary.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="print:hidden">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="detailed">Lista Detalhada</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          <TabsTrigger value="warranty">Análise de Garantias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Equipment by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Equipamentos por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(reportData.summary.byType)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{getTypeLabel(type)}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / reportData.summary.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Equipment by Direction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Equipamentos por Direção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(reportData.summary.byDirection)
                  .sort(([,a], [,b]) => b - a)
                  .map(([direction, count]) => (
                    <div key={direction} className="flex items-center justify-between">
                      <span className="text-sm">{direction}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(count / reportData.summary.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista Completa de Equipamentos</CardTitle>
              <CardDescription>
                Todos os equipamentos registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.equipment.map((equipment) => (
                  <div key={equipment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{equipment.serial_number || "N/A"}</h3>
                          <Badge variant={getStatusBadgeVariant(equipment.status)}>
                            {getStatusIcon(equipment.status)}
                            <span className="ml-1">{getStatusLabel(equipment.status)}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getTypeLabel(equipment.type)} - {equipment.brand} {equipment.model}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
                      {equipment.direction && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>Direção: {equipment.direction.name}</span>
                        </div>
                      )}
                      {equipment.department && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Departamento: {equipment.department.name}</span>
                        </div>
                      )}
                      {equipment.sector && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Setor: {equipment.sector.name}</span>
                        </div>
                      )}
                      {equipment.service && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Serviço: {equipment.service.name}</span>
                        </div>
                      )}
                      {equipment.repartition && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Repartição: {equipment.repartition.name}</span>
                        </div>
                      )}
                      {equipment.registeredBy && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Registrado por: {equipment.registeredBy.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Registrado em: {format(new Date(equipment.created_at), "dd/MM/yyyy")}</span>
                      </div>
                      {equipment.purchase_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Comprado em: {format(new Date(equipment.purchase_date), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                      {equipment.warranty_end && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Garantia até: {format(new Date(equipment.warranty_end), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                    </div>

                    {equipment.observations && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Observações:</strong> {equipment.observations}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(reportData.summary.byStatus).map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="text-sm">{getStatusLabel(status)}</span>
                      </div>
                      <span className="text-sm font-medium">{count} ({((count / reportData.summary.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status === 'ACTIVO' ? 'bg-green-600' : 
                          status === 'MANUTENÇÃO' ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${(count / reportData.summary.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumo Estatístico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total de Equipamentos:</span>
                    <span className="font-medium">{reportData.summary.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tipos Diferentes:</span>
                    <span className="font-medium">{Object.keys(reportData.summary.byType).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Direções Atendidas:</span>
                    <span className="font-medium">{Object.keys(reportData.summary.byDirection).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de Equipamentos Ativos:</span>
                    <span className="font-medium text-green-600">
                      {((reportData.summary.active / reportData.summary.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de Manutenção:</span>
                    <span className="font-medium text-yellow-600">
                      {((reportData.summary.maintenance / reportData.summary.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Warranty Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Status das Garantias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const currentDate = new Date();
                  let warrantyActive = 0;
                  let warrantyExpired = 0;
                  let warrantyUnknown = 0;

                  reportData.equipment.forEach(item => {
                    if (!item.warranty_end) {
                      warrantyUnknown++;
                    } else if (new Date(item.warranty_end) > currentDate) {
                      warrantyActive++;
                    } else {
                      warrantyExpired++;
                    }
                  });

                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Garantia Ativa</span>
                          </div>
                          <span className="text-sm font-medium">{warrantyActive} ({((warrantyActive / reportData.summary.total) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(warrantyActive / reportData.summary.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Garantia Expirada</span>
                          </div>
                          <span className="text-sm font-medium">{warrantyExpired} ({((warrantyExpired / reportData.summary.total) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${(warrantyExpired / reportData.summary.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Garantia Não Informada</span>
                          </div>
                          <span className="text-sm font-medium">{warrantyUnknown} ({((warrantyUnknown / reportData.summary.total) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{ width: `${(warrantyUnknown / reportData.summary.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Equipment Age Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análise de Idade dos Equipamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const currentDate = new Date();
                  const equipmentWithAge = reportData.equipment
                    .filter(item => item.purchase_date)
                    .map(item => {
                      const purchaseDate = new Date(item.purchase_date!);
                      const ageInYears = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
                      return { ...item, age: ageInYears };
                    });

                  const ageRanges = {
                    'Menos de 1 ano': equipmentWithAge.filter(e => e.age < 1).length,
                    '1-3 anos': equipmentWithAge.filter(e => e.age >= 1 && e.age < 3).length,
                    '3-5 anos': equipmentWithAge.filter(e => e.age >= 3 && e.age < 5).length,
                    'Mais de 5 anos': equipmentWithAge.filter(e => e.age >= 5).length,
                  };

                  const totalWithAge = equipmentWithAge.length;

                  return (
                    <>
                      {Object.entries(ageRanges).map(([range, count]) => (
                        <div key={range} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{range}</span>
                            <span className="text-sm font-medium">
                              {count} ({totalWithAge > 0 ? ((count / totalWithAge) * 100).toFixed(1) : 0}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: totalWithAge > 0 ? `${(count / totalWithAge) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t text-xs text-muted-foreground">
                        {reportData.summary.total - totalWithAge} equipamentos sem data de compra informada
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Equipment with Expiring Warranties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Equipamentos com Garantia Expirando (Próximos 90 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const currentDate = new Date();
                  const ninetyDaysFromNow = new Date(currentDate.getTime() + (90 * 24 * 60 * 60 * 1000));
                  
                  const expiringWarranties = reportData.equipment
                    .filter(item => {
                      if (!item.warranty_end) return false;
                      const warrantyEnd = new Date(item.warranty_end);
                      return warrantyEnd > currentDate && warrantyEnd <= ninetyDaysFromNow;
                    })
                    .sort((a, b) => new Date(a.warranty_end!).getTime() - new Date(b.warranty_end!).getTime());

                  if (expiringWarranties.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum equipamento com garantia expirando nos próximos 90 dias.
                      </p>
                    );
                  }

                  return expiringWarranties.map((equipment) => (
                    <div key={equipment.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{equipment.serial_number || "N/A"}</h4>
                            <Badge variant="outline">
                              {getTypeLabel(equipment.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {equipment.brand} {equipment.model}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-yellow-600">
                            Expira em: {format(new Date(equipment.warranty_end!), "dd/MM/yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.ceil((new Date(equipment.warranty_end!).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))} dias restantes
                          </p>
                        </div>
                      </div>
                      
                      {(equipment.direction || equipment.department) && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {equipment.direction && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span>{equipment.direction.name}</span>
                            </div>
                          )}
                          {equipment.department && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{equipment.department.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}