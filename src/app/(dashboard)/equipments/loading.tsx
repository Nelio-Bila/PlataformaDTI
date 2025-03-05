import PageContainer from '@/components/layout/page-container'
import EquipmentClientSkeleton from '@/components/skeletons/equipment-client-skeleton'

export default function EquipmentPageLoading() {
    return (
        <PageContainer>
            <div className="p-6 w-full">
                <EquipmentClientSkeleton />
            </div>
        </PageContainer>
    )
}
