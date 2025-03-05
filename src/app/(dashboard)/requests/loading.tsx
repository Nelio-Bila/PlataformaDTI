import PageContainer from '@/components/layout/page-container'
import RequestClientSkeleton from '@/components/skeletons/request-client-skeleton'

export default function RequestsPageLoading() {
    return (
        <PageContainer>
            <div className="p-6 w-full">
                <RequestClientSkeleton />
            </div>
        </PageContainer>
    )
}
