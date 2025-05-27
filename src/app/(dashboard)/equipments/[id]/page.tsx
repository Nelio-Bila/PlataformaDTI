"use client";

import { ImageModal } from "@/components/shared/image-modal";
import { EquipmentDetailsSkeleton } from "@/components/skeletons/equipment-details-skeleton";
import { Button } from "@/components/ui/button";
import { Equipment } from "@/types/equipment";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle, Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface NavigationData {
  previous: string | null;
  next: string | null;
  total: number;
  current: number;
}

export default function EquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [navigating, setNavigating] = useState<boolean>(false);

  const { data: equipment, isLoading, error } = useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => {
      const response = await fetch(`/api/equipment?id=${id}`);
      if (!response.ok) throw new Error("Houve um erro ao processar os detalhes do equipamento");
      return response.json() as Promise<Equipment>;
    },
  });

  // Fetch navigation data
  const { data: navigationData, isLoading: isLoadingNavigation } = useQuery({
    queryKey: ["equipment-navigation", id],
    queryFn: async () => {
      const response = await fetch(`/api/equipment/navigation?id=${id}`);
      if (!response.ok) throw new Error("Houve um erro ao carregar a navegação");
      return response.json() as Promise<NavigationData>;
    },
    enabled: !!id,
  });

  // Navigation handlers
  const handleNavigate = useCallback((equipmentId: string | null | undefined) => {
    if (!equipmentId) return;
    
    setNavigating(true);
    router.push(`/equipments/${equipmentId}`);
  }, [router]);

  // Fix the useEffect with proper dependencies
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigate with arrow keys
      if (e.key === 'ArrowLeft' && navigationData?.next) {
        handleNavigate(navigationData.next);
      } else if (e.key === 'ArrowRight' && navigationData?.previous) {
        handleNavigate(navigationData.previous);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigationData, handleNavigate]);

  if (isLoading) {
    return <EquipmentDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p className="mt-2 text-gray-600">{(error as Error).message}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/equipment">Voltar</Link>
        </Button>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50">Equipamento não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/equipments">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-background rounded-lg border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{equipment.serial_number || "Sem número de série"}</h1>
            <p className="text-lg">{equipment.brand} {equipment.model}</p>
          </div>
          <Button asChild variant="outline" className="text-white bg-primary border-white hover:bg-white/20">
            <Link href="/equipments">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
        
        {/* Navigation status */}
        {navigationData && (
          <div className="mt-3 text-sm opacity-80">
            Equipamento {navigationData.current} de {navigationData.total}
          </div>
        )}
      </div>

       {/* Navigation buttons */}
      <div className="border-t p-4 flex justify-between">
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => handleNavigate(navigationData?.next)}
          disabled={!navigationData?.next || navigating || isLoadingNavigation}
          className="flex items-center gap-2"
        >
          <ArrowLeftCircle className="h-5 w-5" />
          {navigating ? 'Navegando...' : 'Anterior'}
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => handleNavigate(navigationData?.previous)}
          disabled={!navigationData?.previous || navigating || isLoadingNavigation}
          className="flex items-center gap-2"
        >
          {navigating ? 'Navegando...' : 'Próximo'}
          <ArrowRightCircle className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Detalhes</h2>
          <dl className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Tipo</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{equipment.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{equipment.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Direção</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{equipment.direction?.name || "N/D"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Departamento</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{equipment.department?.name || "N/D"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Setor</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{equipment.sector?.name || "N/D"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Serviço</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{equipment.service?.name || "N/D"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Repartição</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">{equipment.repartition?.name || "N/D"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Data de Compra</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString("pt-BR") : "N/D"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fim da Garantia</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                {equipment.warranty_end ? new Date(equipment.warranty_end).toLocaleDateString("pt-BR") : "N/D"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Criado Em</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                {new Date(equipment.created_at).toLocaleDateString("pt-BR")}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Registado por</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                {equipment.registeredBy?.name || "N/D"}
              </dd>
            </div>
            {/* Observations */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Observações</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                {equipment.observations || "N/D"}
              </dd>
            </div>
            {/* Extra Fields */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Campos Adicionais</dt>
              <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200">
                {equipment.extra_fields && Object.keys(equipment.extra_fields).length > 0 ? (
                  <ul className="list-disc pl-5">
                    {Object.entries(equipment.extra_fields).map(([key, value]) => (
                      <li key={key} className="mt-1">
                        <span className="font-medium">{key}:</span> {value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Nenhum campo adicional"
                )}
              </dd>
            </div>
          </dl>
          <Button asChild className="mt-6">
            <Link href={`/equipments/update/${equipment.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Equipamento
            </Link>
          </Button>
        </div>

        {/* Images Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Imagens</h2>
          {equipment?.images && equipment.images.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {equipment.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    {/* Loading indicator */}
                    {loadingImages[image.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}

                    <Image
                      src={image.url}
                      alt={image.description || "Imagem do equipamento"}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                      onLoadingComplete={() => {
                        setLoadingImages((prev) => ({
                          ...prev,
                          [image.id]: false,
                        }));
                      }}
                      onLoad={() => {
                        setLoadingImages((prev) => ({
                          ...prev,
                          [image.id]: true,
                        }));
                      }}
                    />
                    {image.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {image.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {equipment.images.length > 0 && (
                <ImageModal
                  images={equipment.images}
                  initialIndex={selectedImageIndex}
                  isOpen={selectedImageIndex !== -1}
                  onClose={() => setSelectedImageIndex(-1)}
                />
              )}
            </>
          ) : (
            <p className="text-gray-600 dark:text-gray-100 italic">Nenhuma imagem disponível.</p>
          )}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="border-t p-4 flex justify-between">
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => handleNavigate(navigationData?.next)}
          disabled={!navigationData?.next || navigating || isLoadingNavigation}
          className="flex items-center gap-2"
        >
          <ArrowLeftCircle className="h-5 w-5" />
          {navigating ? 'Navegando...' : 'Anterior'}
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => handleNavigate(navigationData?.previous)}
          disabled={!navigationData?.previous || navigating || isLoadingNavigation}
          className="flex items-center gap-2"
        >
          {navigating ? 'Navegando...' : 'Próximo'}
          <ArrowRightCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}